# Phone OTP Verification Implementation

## ✅ Implementation Complete

Fitur verifikasi nomor HP dengan OTP untuk registrasi member baru telah berhasil diimplementasikan.

## 📋 Overview

Member baru **WAJIB** memasukkan nomor HP dan memverifikasi dengan kode OTP sebelum dapat menyelesaikan registrasi.

## 🗄️ Database Layer

### Tables Created

#### `phone_otp_verifications`
Menyimpan kode OTP untuk verifikasi nomor HP.

**Columns:**
- `id` (UUID, PK) - Unique identifier
- `phone` (VARCHAR) - Nomor HP (format: +62xxx)
- `otp_code` (VARCHAR(6)) - Kode OTP 6 digit
- `user_id` (UUID, FK) - Reference ke users table (nullable)
- `is_verified` (BOOLEAN) - Status verifikasi
- `expires_at` (TIMESTAMP) - Waktu kadaluarsa (10 menit)
- `created_at` (TIMESTAMP) - Waktu dibuat
- `verified_at` (TIMESTAMP) - Waktu diverifikasi
- `attempts` (INTEGER) - Jumlah percobaan verifikasi
- `max_attempts` (INTEGER) - Maksimal percobaan (default: 3)

**Indexes:**
- `idx_phone_otp_phone` - Fast lookup by phone
- `idx_phone_otp_user_id` - Fast lookup by user
- `idx_phone_otp_expires_at` - Fast cleanup of expired OTPs

### Users Table Updates

**New Columns:**
- `phone` (VARCHAR(20)) - Nomor HP member
- `phone_verified_at` (TIMESTAMP) - Waktu verifikasi HP

**Constraints:**
- `check_phone_format` - Validasi format HP Indonesia (+62xxx atau 08xxx)

### Database Functions

#### `generate_otp_code()`
Generate random 6-digit OTP code.

```sql
SELECT generate_otp_code();
-- Returns: '123456'
```

#### `create_phone_otp(p_phone VARCHAR)`
Create OTP record untuk nomor HP.

```sql
SELECT * FROM create_phone_otp('+6281234567890');
-- Returns: { otp_id, otp_code, expires_at }
```

**Features:**
- Generate 6-digit random OTP
- Set expiry 10 minutes from creation
- Return OTP details

#### `verify_phone_otp(p_phone VARCHAR, p_otp_code VARCHAR)`
Verify OTP code untuk nomor HP.

```sql
SELECT verify_phone_otp('+6281234567890', '123456');
-- Returns: true/false
```

**Features:**
- Check OTP validity (not expired, not verified, attempts < max)
- Mark as verified if valid
- Increment attempts if invalid
- Return boolean result

#### `cleanup_expired_otp()`
Clean up expired OTP records (older than 1 day).

```sql
SELECT cleanup_expired_otp();
```

### RLS Policies

**phone_otp_verifications:**
- ✅ Users can view own OTP records
- ✅ Anyone can create OTP records (for registration)
- ✅ Users can update own OTP records
- ✅ Admin can view all OTP records

## 🔌 Backend API

### Endpoints

#### POST `/api/auth/send-otp`
Send OTP to phone number.

**Request:**
```json
{
  "phone": "081234567890"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "OTP sent successfully",
    "phone": "+6281234567890",
    "otp_id": "uuid",
    "expires_at": "2025-11-22T07:00:00Z",
    "otp_code": "123456" // Only in development
  }
}
```

**Validations:**
- ✅ Phone format validation (Indonesian: +62xxx or 08xxx)
- ✅ Check if phone already registered
- ✅ Normalize phone to +62 format

#### POST `/api/auth/verify-otp`
Verify OTP code.

**Request:**
```json
{
  "phone": "081234567890",
  "otp_code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Phone number verified successfully",
    "phone": "+6281234567890",
    "verified": true
  }
}
```

**Validations:**
- ✅ OTP code must be 6 digits
- ✅ Check expiry and attempts
- ✅ Mark as verified if valid

#### POST `/api/auth/resend-otp`
Resend OTP to phone number.

**Request:**
```json
{
  "phone": "081234567890"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "OTP resent successfully",
    "phone": "+6281234567890",
    "otp_id": "uuid",
    "expires_at": "2025-11-22T07:00:00Z",
    "otp_code": "123456" // Only in development
  }
}
```

**Rate Limiting:**
- ✅ Max 3 OTP requests per 10 minutes per phone

### Files Modified

**Backend:**
- `server/src/controllers/auth.controller.ts` - Added OTP endpoints
- `server/src/routes/auth.routes.ts` - Added OTP routes
- `server/src/models/User.model.ts` - Added phone fields

## 🎨 Frontend Implementation

### Components

#### `PhoneOTPVerification.tsx`
Component untuk verifikasi OTP dengan 2 steps:

**Step 1: Phone Input**
- Input nomor HP
- Validasi format
- Send OTP button

**Step 2: OTP Verification**
- Input 6-digit OTP
- Auto-format (numbers only)
- Countdown timer (60 seconds)
- Resend OTP button
- Change phone button

**Features:**
- ✅ Real-time validation
- ✅ Error handling
- ✅ Loading states
- ✅ Countdown timer for resend
- ✅ Rate limiting UI feedback
- ✅ Auto-focus on OTP input
- ✅ Number-only input for OTP

### Hooks

#### `usePhoneOTP.ts`
React Query hooks untuk OTP operations:

```typescript
// Send OTP
const sendOTP = useSendOTP();
await sendOTP.mutateAsync({ phone: '081234567890' });

// Verify OTP
const verifyOTP = useVerifyOTP();
await verifyOTP.mutateAsync({ 
  phone: '081234567890', 
  otp_code: '123456' 
});

// Resend OTP
const resendOTP = useResendOTP();
await resendOTP.mutateAsync({ phone: '081234567890' });
```

### Registration Flow

**Updated `RegisterForm.tsx`:**

1. User fills registration form (username, email, password, full name)
2. Click "Daftar" → Move to OTP verification step
3. User enters phone number → Send OTP
4. User enters OTP code → Verify
5. If verified → Complete registration with phone
6. Redirect to dashboard

**Files Modified:**
- `src/features/member-area/components/auth/RegisterForm.tsx`
- `src/features/member-area/components/auth/PhoneOTPVerification.tsx`
- `src/features/member-area/hooks/usePhoneOTP.ts`
- `src/features/member-area/services/auth.service.ts`
- `src/features/member-area/types/user.ts`

## 🧪 Testing

### Database Tests

```sql
-- Test OTP generation
SELECT * FROM create_phone_otp('+6281234567890');

-- Check OTP record
SELECT * FROM phone_otp_verifications 
WHERE phone = '+6281234567890' 
ORDER BY created_at DESC LIMIT 1;

-- Test verification
SELECT verify_phone_otp('+6281234567890', '123456');

-- Check verified status
SELECT is_verified, verified_at 
FROM phone_otp_verifications 
WHERE phone = '+6281234567890' 
ORDER BY created_at DESC LIMIT 1;
```

### API Tests

```bash
# Send OTP
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "081234567890"}'

# Verify OTP
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "081234567890", "otp_code": "123456"}'

# Resend OTP
curl -X POST http://localhost:3000/api/auth/resend-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "081234567890"}'
```

## 📊 Verification Results

### Database Structure
✅ Table `phone_otp_verifications` created
✅ Columns: id, phone, otp_code, user_id, is_verified, expires_at, created_at, verified_at, attempts, max_attempts
✅ Indexes created for performance
✅ RLS policies configured

### Database Functions
✅ `generate_otp_code()` - Tested, returns 6-digit code
✅ `create_phone_otp()` - Tested, creates OTP record
✅ `verify_phone_otp()` - Tested, verifies and marks as verified
✅ `cleanup_expired_otp()` - Created for maintenance

### Backend API
✅ POST `/api/auth/send-otp` - Implemented
✅ POST `/api/auth/verify-otp` - Implemented
✅ POST `/api/auth/resend-otp` - Implemented
✅ Phone format validation
✅ Rate limiting (3 OTP per 10 minutes)
✅ Error handling

### Frontend
✅ `PhoneOTPVerification` component
✅ `usePhoneOTP` hooks
✅ Registration flow updated
✅ User types updated
✅ Auth service updated

## 🔒 Security Features

1. **OTP Expiry**: 10 minutes
2. **Max Attempts**: 3 attempts per OTP
3. **Rate Limiting**: Max 3 OTP requests per 10 minutes
4. **Phone Validation**: Indonesian format only (+62xxx or 08xxx)
5. **RLS Policies**: Users can only see their own OTP records
6. **Auto Cleanup**: Expired OTPs deleted after 1 day

## 🚀 Next Steps (Optional)

### SMS Integration
Untuk production, integrate dengan SMS service provider:

**Recommended Providers:**
- Twilio
- Vonage (Nexmo)
- AWS SNS
- Zenziva (Indonesia)

**Implementation:**
```typescript
// In sendOTP controller
import twilio from 'twilio';

const client = twilio(accountSid, authToken);

await client.messages.create({
  body: `Your OTP code is: ${otp.otp_code}`,
  from: '+1234567890',
  to: normalizedPhone
});
```

### Additional Features
- [ ] SMS service integration
- [ ] OTP retry limit per day
- [ ] Phone number blacklist
- [ ] Admin dashboard for OTP monitoring
- [ ] Analytics for OTP success rate

## 📝 Usage Example

### For Users

1. Go to `/register`
2. Fill in registration form
3. Click "Daftar"
4. Enter phone number (08xxx or +62xxx)
5. Click "Kirim OTP"
6. Check SMS for OTP code (in dev: check console)
7. Enter 6-digit OTP code
8. Click "Verifikasi"
9. Registration complete!

### For Developers

```typescript
// Use OTP hooks in any component
import { useSendOTP, useVerifyOTP } from '@/hooks/usePhoneOTP';

function MyComponent() {
  const sendOTP = useSendOTP();
  const verifyOTP = useVerifyOTP();

  const handleSend = async () => {
    try {
      const result = await sendOTP.mutateAsync({ 
        phone: '081234567890' 
      });
      console.log('OTP sent:', result);
    } catch (error) {
      console.error('Failed:', error);
    }
  };

  const handleVerify = async () => {
    try {
      const result = await verifyOTP.mutateAsync({ 
        phone: '081234567890',
        otp_code: '123456'
      });
      console.log('Verified:', result);
    } catch (error) {
      console.error('Invalid OTP:', error);
    }
  };

  return (
    <div>
      <button onClick={handleSend}>Send OTP</button>
      <button onClick={handleVerify}>Verify OTP</button>
    </div>
  );
}
```

## 🎯 Summary

Fitur phone OTP verification telah berhasil diimplementasikan dengan:
- Database schema dan functions yang robust
- Backend API endpoints yang secure
- Frontend components yang user-friendly
- Full integration dari database → backend → frontend
- Security features (expiry, rate limiting, validation)

Member baru sekarang WAJIB verifikasi nomor HP dengan OTP sebelum dapat menyelesaikan registrasi.
