# Login Turnstile Auto-Refresh Fix

## Problem

Ketika user salah memasukkan password di halaman login, Turnstile widget tidak otomatis refresh. User harus manual refresh browser untuk mendapatkan Turnstile challenge baru, yang menghasilkan UX yang buruk.

## Root Cause

Meskipun `resetTurnstile()` dipanggil saat error, React component tidak re-render Turnstile widget karena tidak ada perubahan props yang memicu re-mount component.

## Solution

Implementasi **key-based forced re-render** menggunakan React key prop pattern:

### Changes Made

**File:** `src/features/member-area/components/auth/LoginForm.tsx`

1. **Added state untuk Turnstile key:**
```tsx
const [turnstileKey, setTurnstileKey] = useState(0);
```

2. **Increment key saat login error:**
```tsx
// Reset Turnstile on error - force widget re-render for better UX
if (isTurnstileEnabled) {
  resetTurnstile();
  setTurnstileKey(prev => prev + 1); // Force re-render
}
```

3. **Apply key prop ke TurnstileWidget:**
```tsx
<TurnstileWidget
  key={turnstileKey} // Force re-render on error
  onSuccess={setToken}
  onError={resetTurnstile}
  onExpire={resetTurnstile}
/>
```

## How It Works

1. User memasukkan password yang salah
2. Login gagal, error handler dipanggil
3. `setTurnstileKey(prev => prev + 1)` mengubah key dari 0 → 1
4. React mendeteksi key berubah dan **unmount + remount** TurnstileWidget
5. Turnstile widget otomatis render ulang dengan challenge baru
6. User tidak perlu manual refresh browser

## UX Improvement

### Before (❌ Bad UX)
```
1. User salah password
2. Error muncul
3. Turnstile expired/invalid
4. User stuck, harus manual refresh browser
```

### After (✅ Good UX)
```
1. User salah password
2. Error muncul
3. Turnstile otomatis refresh dengan challenge baru
4. User langsung bisa coba login lagi
```

## Technical Details

**React Key Prop Pattern:**
- Ketika key prop berubah, React treats component sebagai completely new instance
- Old component di-unmount, new component di-mount
- Semua internal state di-reset
- Perfect untuk force refresh external widgets seperti Turnstile

**Why This Works:**
- Turnstile widget adalah external iframe dari Cloudflare
- Normal state reset tidak cukup untuk refresh iframe
- Key change memaksa complete remount, termasuk iframe reload

## Testing

Test scenario:
1. Buka `/login`
2. Masukkan username benar, password salah
3. Submit form
4. Verify: Error message muncul
5. Verify: Turnstile otomatis refresh (tidak perlu manual refresh browser)
6. Verify: User bisa langsung coba login lagi

## Files Modified

- `src/features/member-area/components/auth/LoginForm.tsx`

## Status

✅ **IMPLEMENTED** - Turnstile auto-refresh on login error
