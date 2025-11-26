# Login UX - Panduan Testing Cepat

## 🎯 Tujuan Testing

Memverifikasi bahwa login form memiliki UX yang baik:
1. Error notification yang jelas
2. Form values tidak hilang saat error
3. Visual feedback yang menarik

## 🧪 Test Scenarios

### Scenario 1: Username Salah

**Steps:**
1. Buka `/login`
2. Masukkan username: `useryangtidakada`
3. Masukkan password: `apasaja123`
4. Klik "Masuk"

**Expected Result:**
- ✅ Error message muncul: "Username atau password salah. Silakan coba lagi."
- ✅ Error box dengan background merah dan icon AlertCircle
- ✅ Animasi shake pada error message
- ✅ Username field masih terisi: `useryangtidakada`
- ✅ Password field masih terisi: `apasaja123`
- ✅ User bisa langsung edit tanpa ketik ulang

### Scenario 2: Password Salah

**Steps:**
1. Buka `/login`
2. Masukkan username yang benar (misal: `admin`)
3. Masukkan password salah: `passwordsalah`
4. Klik "Masuk"

**Expected Result:**
- ✅ Error message muncul: "Username atau password salah. Silakan coba lagi."
- ✅ Username tetap terisi: `admin`
- ✅ Password tetap terisi: `passwordsalah`
- ✅ User bisa langsung perbaiki password

### Scenario 3: Login Berhasil

**Steps:**
1. Buka `/login`
2. Masukkan username yang benar
3. Masukkan password yang benar
4. Klik "Masuk"

**Expected Result:**
- ✅ Tidak ada error message
- ✅ Loading spinner muncul di button
- ✅ Redirect ke `/dashboard`
- ✅ User berhasil login

### Scenario 4: Validation Error

**Steps:**
1. Buka `/login`
2. Kosongkan username
3. Kosongkan password
4. Klik "Masuk"

**Expected Result:**
- ✅ Validation error muncul di bawah field yang kosong
- ✅ "Username or Email is required"
- ✅ "Password is required"
- ✅ Tidak ada API call (validasi client-side)

### Scenario 5: Too Many Attempts

**Steps:**
1. Buka `/login`
2. Coba login dengan password salah 5-6 kali berturut-turut
3. Tunggu response dari Supabase

**Expected Result:**
- ✅ Error message: "Terlalu banyak percobaan login. Silakan coba lagi nanti."
- ✅ Form values tetap tersimpan
- ✅ User tahu harus tunggu sebelum coba lagi

## 📱 Responsive Testing

### Mobile (< 768px)
1. Buka di mobile device atau resize browser
2. Test semua scenarios di atas
3. Verify:
   - ✅ Error message readable
   - ✅ Form tidak overflow
   - ✅ Button accessible
   - ✅ Shake animation smooth

### Desktop (≥ 768px)
1. Buka di desktop browser
2. Test semua scenarios di atas
3. Verify:
   - ✅ Layout centered
   - ✅ Error message prominent
   - ✅ Form max-width appropriate

## 🎨 Visual Verification

### Error Message Appearance
- Background: Light red (bg-red-50)
- Border: Red (border-red-200)
- Text: Dark red (text-red-700)
- Icon: Red AlertCircle
- Border radius: rounded-xl
- Padding: p-3
- Animation: Shake (0.5s)

### Form Preservation
- Username field: Value preserved
- Password field: Value preserved
- Remember me: State preserved
- Show password toggle: Works correctly

## 🔍 Console Verification

Buka Developer Console dan check:

```javascript
// Saat login gagal, harus ada log:
// ❌ Supabase auth error: {...}
// Login error: Error: Username atau password salah...

// Saat login berhasil, harus ada log:
// ✅ Login successful, user ID: xxx
```

## ✅ Checklist

Sebelum deploy, pastikan semua ini sudah di-test:

- [ ] Error message muncul saat username salah
- [ ] Error message muncul saat password salah
- [ ] Form values tidak hilang saat error
- [ ] Shake animation berjalan smooth
- [ ] Error message dalam Bahasa Indonesia
- [ ] Login berhasil redirect ke dashboard
- [ ] Validation error muncul untuk field kosong
- [ ] Rate limiting error message jelas
- [ ] Responsive di mobile
- [ ] Responsive di desktop
- [ ] Show password toggle works
- [ ] Remember me checkbox works
- [ ] Loading state saat submit
- [ ] Button disabled saat loading
- [ ] No console errors

## 🐛 Common Issues

### Issue 1: Form Values Hilang
**Symptom:** Form kosong setelah error
**Solution:** Check bahwa tidak ada `setFormData({identifier: '', password: ''})` di catch block

### Issue 2: Error Message Tidak Muncul
**Symptom:** Tidak ada error notification
**Solution:** Check `loginError` state dan conditional rendering

### Issue 3: Shake Animation Tidak Jalan
**Symptom:** Error box muncul tapi tidak shake
**Solution:** Verify `animate-shake` class ada di CSS dan applied ke error div

### Issue 4: Error Message Bahasa Inggris
**Symptom:** Error dalam bahasa Inggris
**Solution:** Check `auth.service.ts` error mapping

## 📊 Success Criteria

Testing dianggap berhasil jika:
1. ✅ Semua 5 scenarios passed
2. ✅ Responsive di mobile dan desktop
3. ✅ No console errors
4. ✅ Visual feedback jelas
5. ✅ UX smooth dan tidak frustrating

## 🚀 Quick Test Command

```bash
# Start dev server
npm run dev

# Open browser
# Navigate to: http://localhost:5173/login

# Test dengan credentials:
# Wrong: username=test, password=wrong
# Correct: username=admin, password=<actual_password>
```

## 📝 Test Report Template

```
Date: ___________
Tester: ___________

Scenario 1 (Username Salah): [ ] Pass [ ] Fail
Scenario 2 (Password Salah): [ ] Pass [ ] Fail
Scenario 3 (Login Berhasil): [ ] Pass [ ] Fail
Scenario 4 (Validation Error): [ ] Pass [ ] Fail
Scenario 5 (Too Many Attempts): [ ] Pass [ ] Fail

Mobile Responsive: [ ] Pass [ ] Fail
Desktop Responsive: [ ] Pass [ ] Fail

Notes:
_________________________________
_________________________________
_________________________________

Overall Status: [ ] Ready to Deploy [ ] Needs Fix
```

---

**Status:** Ready for Testing
**Priority:** High
**Estimated Time:** 15-20 minutes
