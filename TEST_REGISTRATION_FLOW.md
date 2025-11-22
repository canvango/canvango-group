# Test Registration Flow

## Langkah Testing

1. **Buka browser** di `http://localhost:5173/register`

2. **Buka Console Browser** (F12 atau Ctrl+Shift+I)

3. **Isi form registrasi**:
   - Username: `testuser1`
   - Nama Lengkap: `Test User`
   - Email: `test@example.com`
   - Password: `password123`
   - Konfirmasi Password: `password123`

4. **Klik tombol "Daftar"**

5. **Yang seharusnya terjadi**:
   - Form registrasi hilang
   - Muncul form "Verifikasi Nomor HP"
   - Ada input untuk nomor HP
   - Ada tombol "Kirim OTP"

6. **Jika tidak muncul**, check console untuk error

## Troubleshooting

### Jika form OTP tidak muncul:

**Check 1: Console Errors**
```
Buka Console (F12) → Tab Console
Lihat apakah ada error merah
```

**Check 2: Network Tab**
```
Buka Network tab
Refresh halaman
Lihat apakah semua file ter-load
```

**Check 3: React DevTools**
```
Install React DevTools extension
Check component tree
Lihat state `step` di RegisterForm
```

### Manual Test Step State

Tambahkan ini di RegisterForm untuk debug:

```typescript
// Add after const [step, setStep] = useState<'form' | 'otp'>('form');
console.log('Current step:', step);

// Add in handleSubmit
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  console.log('Form submitted, validation:', validateFormData());
  
  if (!validateFormData()) {
    console.log('Validation failed');
    return;
  }

  console.log('Moving to OTP step');
  setStep('otp');
};
```

### Force OTP Step (Testing)

Untuk test langsung OTP form, ubah initial state:

```typescript
// Change this line:
const [step, setStep] = useState<'form' | 'otp'>('form');

// To this:
const [step, setStep] = useState<'form' | 'otp'>('otp');
```

Refresh browser, seharusnya langsung muncul form OTP.

## Expected Behavior

### Step 1: Registration Form
- ✅ Form dengan 5 fields (username, full name, email, password, confirm password)
- ✅ Tombol "Daftar"
- ✅ Link "Sudah punya akun? Masuk"

### Step 2: OTP Verification (after clicking Daftar)
- ✅ Form hilang
- ✅ Muncul card "Verifikasi Nomor HP"
- ✅ Input nomor HP
- ✅ Tombol "Kirim OTP"
- ✅ Tombol "Batal" (kembali ke form)

### Step 3: OTP Input (after sending OTP)
- ✅ Input 6-digit OTP
- ✅ Countdown timer (60 detik)
- ✅ Tombol "Verifikasi"
- ✅ Tombol "Kirim Ulang OTP" (setelah countdown habis)
- ✅ Tombol "Ubah Nomor"

## Quick Fix Commands

### Restart Dev Server
```bash
# Stop current server (Ctrl+C)
# Then restart:
npm run dev
```

### Clear Browser Cache
```
Ctrl+Shift+Delete → Clear cache
Or hard refresh: Ctrl+Shift+R
```

### Check if backend is running
```bash
# In server directory
cd server
npm run dev
```

Backend should be running on `http://localhost:3000`

## Test with Console Logs

Add these logs to RegisterForm.tsx:

```typescript
export const RegisterForm: React.FC = () => {
  const [step, setStep] = useState<'form' | 'otp'>('form');
  
  console.log('RegisterForm rendered, step:', step);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('=== FORM SUBMITTED ===');
    console.log('Form data:', formData);
    console.log('Validation result:', validateFormData());

    if (!validateFormData()) {
      console.log('❌ Validation failed');
      return;
    }

    console.log('✅ Validation passed, moving to OTP');
    setStep('otp');
    console.log('Step changed to:', 'otp');
  };
  
  console.log('Rendering step:', step);
  
  if (step === 'otp') {
    console.log('Rendering OTP component');
    return (
      <div className="w-full max-w-md">
        <PhoneOTPVerification
          onVerified={handlePhoneVerified}
          onCancel={handleCancelOTP}
        />
      </div>
    );
  }
  
  console.log('Rendering form');
  return (
    // ... form JSX
  );
};
```

## Expected Console Output

When you click "Daftar":
```
RegisterForm rendered, step: form
Rendering step: form
Rendering form
=== FORM SUBMITTED ===
Form data: { username: "testuser1", ... }
Validation result: true
✅ Validation passed, moving to OTP
Step changed to: otp
RegisterForm rendered, step: otp
Rendering step: otp
Rendering OTP component
```

## Contact

Jika masih tidak muncul setelah semua troubleshooting:
1. Screenshot console errors
2. Screenshot network tab
3. Share untuk debugging lebih lanjut
