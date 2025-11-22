# Quick Start: Phone OTP Verification

## 🚀 Untuk User

### Registrasi dengan Phone OTP

1. **Buka halaman registrasi**: `/register`

2. **Isi form registrasi**:
   - Username
   - Nama Lengkap
   - Email
   - Password
   - Konfirmasi Password

3. **Klik "Daftar"** → Akan muncul form verifikasi HP

4. **Masukkan nomor HP**:
   - Format: `081234567890` atau `+6281234567890`
   - Klik "Kirim OTP"

5. **Cek OTP**:
   - **Development**: Lihat console browser (F12) untuk OTP code
   - **Production**: Cek SMS di HP Anda

6. **Masukkan kode OTP** (6 digit)

7. **Klik "Verifikasi"**

8. **Selesai!** Anda akan diarahkan ke dashboard

### Troubleshooting

**"Format nomor HP tidak valid"**
- Gunakan format: `08xxx` atau `+62xxx`
- Contoh: `081234567890` atau `+6281234567890`

**"Nomor HP sudah terdaftar"**
- Nomor HP sudah digunakan user lain
- Gunakan nomor HP yang berbeda

**"Kode OTP tidak valid"**
- Pastikan kode 6 digit benar
- Cek apakah OTP sudah expired (10 menit)
- Klik "Kirim Ulang OTP" untuk mendapat kode baru

**"Terlalu banyak permintaan OTP"**
- Max 3 OTP per 10 menit
- Tunggu beberapa menit lalu coba lagi

## 💻 Untuk Developer

### Test OTP Flow (Development)

#### 1. Start Development Server

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
npm run dev
```

#### 2. Test Registration

1. Buka `http://localhost:5173/register`
2. Isi form registrasi
3. Klik "Daftar"
4. Masukkan nomor HP: `081234567890`
5. Klik "Kirim OTP"
6. **Buka Console Browser (F12)** → Lihat OTP code
7. Masukkan OTP code
8. Klik "Verifikasi"

#### 3. Test API Endpoints

**Send OTP:**
```bash
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "081234567890"}'
```

**Verify OTP:**
```bash
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "081234567890", "otp_code": "123456"}'
```

**Resend OTP:**
```bash
curl -X POST http://localhost:3000/api/auth/resend-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "081234567890"}'
```

### Database Queries

**Check OTP records:**
```sql
SELECT * FROM phone_otp_verifications 
ORDER BY created_at DESC 
LIMIT 10;
```

**Check user phone:**
```sql
SELECT id, username, phone, phone_verified_at 
FROM users 
WHERE phone IS NOT NULL;
```

**Test OTP generation:**
```sql
SELECT * FROM create_phone_otp('+6281234567890');
```

**Test OTP verification:**
```sql
SELECT verify_phone_otp('+6281234567890', '123456');
```

### Integration in Your Code

**Use OTP hooks:**
```typescript
import { useSendOTP, useVerifyOTP } from '@/hooks/usePhoneOTP';

function MyComponent() {
  const sendOTP = useSendOTP();
  const verifyOTP = useVerifyOTP();

  const handleSendOTP = async () => {
    try {
      const result = await sendOTP.mutateAsync({ 
        phone: '081234567890' 
      });
      console.log('OTP sent:', result);
      // In development, OTP code is in result.otp_code
    } catch (error) {
      console.error('Failed to send OTP:', error);
    }
  };

  const handleVerifyOTP = async (code: string) => {
    try {
      const result = await verifyOTP.mutateAsync({ 
        phone: '081234567890',
        otp_code: code
      });
      if (result.verified) {
        console.log('Phone verified!');
        // Proceed with registration
      }
    } catch (error) {
      console.error('Invalid OTP:', error);
    }
  };

  return (
    <div>
      <button onClick={handleSendOTP}>Send OTP</button>
      <input 
        type="text" 
        maxLength={6}
        onChange={(e) => {
          if (e.target.value.length === 6) {
            handleVerifyOTP(e.target.value);
          }
        }}
      />
    </div>
  );
}
```

**Use PhoneOTPVerification component:**
```typescript
import { PhoneOTPVerification } from '@/components/auth/PhoneOTPVerification';

function MyRegistrationFlow() {
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [verifiedPhone, setVerifiedPhone] = useState('');

  const handlePhoneVerified = (phone: string) => {
    setVerifiedPhone(phone);
    // Complete registration with verified phone
    completeRegistration({ ...formData, phone });
  };

  if (step === 'otp') {
    return (
      <PhoneOTPVerification
        onVerified={handlePhoneVerified}
        onCancel={() => setStep('form')}
      />
    );
  }

  return <RegistrationForm onSubmit={() => setStep('otp')} />;
}
```

## 🔧 Configuration

### Environment Variables

**Backend (.env):**
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NODE_ENV=development  # Shows OTP in response
```

### SMS Integration (Production)

**Install SMS provider:**
```bash
npm install twilio
# or
npm install @vonage/server-sdk
```

**Update `auth.controller.ts`:**
```typescript
import twilio from 'twilio';

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// In sendOTP function, after generating OTP:
if (process.env.NODE_ENV === 'production') {
  await twilioClient.messages.create({
    body: `Your OTP code is: ${otp.otp_code}`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: normalizedPhone
  });
}
```

## 📊 Monitoring

### Check OTP Statistics

```sql
-- Total OTPs sent today
SELECT COUNT(*) as total_sent
FROM phone_otp_verifications
WHERE created_at >= CURRENT_DATE;

-- Verification success rate
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN is_verified THEN 1 END) as verified,
  ROUND(COUNT(CASE WHEN is_verified THEN 1 END)::numeric / COUNT(*)::numeric * 100, 2) as success_rate
FROM phone_otp_verifications
WHERE created_at >= CURRENT_DATE;

-- Failed attempts
SELECT phone, COUNT(*) as failed_attempts
FROM phone_otp_verifications
WHERE is_verified = false 
  AND attempts >= max_attempts
GROUP BY phone
ORDER BY failed_attempts DESC;
```

### Cleanup Expired OTPs

```sql
-- Manual cleanup
SELECT cleanup_expired_otp();

-- Or schedule with pg_cron (if available)
SELECT cron.schedule(
  'cleanup-expired-otp',
  '0 2 * * *',  -- Run at 2 AM daily
  'SELECT cleanup_expired_otp()'
);
```

## 🎯 Testing Checklist

- [ ] User can send OTP to valid phone number
- [ ] User receives OTP code (check console in dev)
- [ ] User can verify with correct OTP
- [ ] Invalid OTP shows error message
- [ ] Expired OTP (>10 min) shows error
- [ ] Max 3 attempts per OTP enforced
- [ ] Rate limiting (3 OTP per 10 min) works
- [ ] Resend OTP generates new code
- [ ] Phone format validation works
- [ ] Duplicate phone number rejected
- [ ] Registration completes with verified phone
- [ ] User data includes phone and phone_verified_at

## 📚 Related Files

**Backend:**
- `server/src/controllers/auth.controller.ts`
- `server/src/routes/auth.routes.ts`
- `server/src/models/User.model.ts`

**Frontend:**
- `src/features/member-area/components/auth/PhoneOTPVerification.tsx`
- `src/features/member-area/components/auth/RegisterForm.tsx`
- `src/features/member-area/hooks/usePhoneOTP.ts`
- `src/features/member-area/services/auth.service.ts`
- `src/features/member-area/types/user.ts`

**Database:**
- Migration: `add_phone_otp_verification`
- Table: `phone_otp_verifications`
- Functions: `create_phone_otp`, `verify_phone_otp`, `generate_otp_code`, `cleanup_expired_otp`

**Documentation:**
- `PHONE_OTP_IMPLEMENTATION.md` - Full implementation details
- `QUICK_START_PHONE_OTP.md` - This file

## 🆘 Support

Jika ada masalah:
1. Check console browser untuk error messages
2. Check server logs untuk backend errors
3. Verify database dengan SQL queries di atas
4. Check `PHONE_OTP_IMPLEMENTATION.md` untuk detail lengkap
