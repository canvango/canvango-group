# Forgot Password Redirect Fix

## 🔍 Root Cause

Email reset password dari Supabase tidak redirect ke halaman `/reset-password` karena:

1. **Site URL** di Supabase Dashboard belum dikonfigurasi dengan benar
2. **Redirect URLs** belum include production domain
3. Email template Supabase menggunakan tracking link dari Brevo (email provider)

## ✅ Solusi

### 1. Konfigurasi Supabase Dashboard

**Langkah-langkah:**

1. Buka Supabase Dashboard: https://supabase.com/dashboard/project/gpittnsfzgkdbqnccncn
2. Masuk ke **Authentication** → **URL Configuration**
3. Set konfigurasi berikut:

```
Site URL: https://canvango-group.vercel.app
```

**Redirect URLs (tambahkan semua):**
```
https://canvango-group.vercel.app/reset-password
https://canvango-group.vercel.app/login
http://localhost:5173/reset-password
http://localhost:5173/login
```

### 2. Verifikasi Email Template

1. Masuk ke **Authentication** → **Email Templates**
2. Pilih **Reset Password** template
3. Pastikan template menggunakan `{{ .ConfirmationURL }}` variable
4. Template default Supabase:

```html
<h2>Reset Password</h2>
<p>Follow this link to reset the password for your user:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
```

### 3. Test Flow

**Development:**
```bash
# 1. Jalankan dev server
npm run dev

# 2. Buka http://localhost:5173/forgot-password
# 3. Masukkan email
# 4. Cek email dan klik link
# 5. Harus redirect ke http://localhost:5173/reset-password
```

**Production:**
```
# 1. Deploy ke Vercel
# 2. Buka https://canvango-group.vercel.app/forgot-password
# 3. Masukkan email
# 4. Cek email dan klik link
# 5. Harus redirect ke https://canvango-group.vercel.app/reset-password
```

## 📋 Checklist Verifikasi

- [ ] Site URL sudah diset di Supabase Dashboard
- [ ] Redirect URLs sudah include production dan localhost
- [ ] Email template menggunakan `{{ .ConfirmationURL }}`
- [ ] Test forgot password di development (localhost)
- [ ] Test forgot password di production (Vercel)
- [ ] Email diterima dengan link yang benar
- [ ] Link redirect ke `/reset-password` page
- [ ] Form reset password berfungsi
- [ ] Setelah reset, redirect ke `/login`

## 🔧 Kode yang Sudah Benar

### ForgotPasswordForm.tsx
```typescript
const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/reset-password`, // ✅ Sudah benar
});
```

### main.tsx
```typescript
<Route path="/reset-password" element={<ResetPassword />} /> // ✅ Sudah ada
```

### ResetPasswordForm.tsx
```typescript
useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      setIsValidSession(true); // ✅ Validasi session dari email link
    } else {
      showToast({ type: 'error', message: 'Link reset tidak valid atau sudah kadaluarsa' });
      setTimeout(() => navigate('/forgot-password'), 2000);
    }
  });
}, [navigate, showToast]);
```

## 🎯 Expected Behavior

1. User klik "Lupa Password" di login page
2. User masukkan email dan submit
3. Supabase kirim email dengan link reset
4. User klik link di email
5. **Link redirect ke `/reset-password` dengan token di URL**
6. ResetPasswordForm detect session dari token
7. User masukkan password baru
8. Password berhasil diupdate
9. Redirect ke `/login`

## 🐛 Debugging

Jika masih tidak redirect:

### 1. Check Email Link
```
Email link harus seperti ini:
https://canvango-group.vercel.app/reset-password#access_token=xxx&refresh_token=yyy&type=recovery
```

### 2. Check Browser Console
```javascript
// Di halaman reset-password, jalankan:
supabase.auth.getSession().then(console.log)
// Harus return session object dengan access_token
```

### 3. Check Supabase Logs
```
Dashboard → Authentication → Logs
Cari error terkait password reset
```

## 📝 Notes

- **Brevo tracking link** adalah normal - Supabase menggunakan Brevo sebagai email provider
- Link tracking akan redirect ke URL yang benar jika konfigurasi Supabase benar
- Token di URL (`#access_token=xxx`) adalah hash fragment, bukan query parameter
- Supabase client otomatis detect token dari URL dengan `detectSessionInUrl: true`

## 🚀 Action Required

**SEGERA lakukan konfigurasi di Supabase Dashboard:**

1. Set Site URL: `https://canvango-group.vercel.app`
2. Add Redirect URLs (production + localhost)
3. Verify email template
4. Test forgot password flow

Tanpa konfigurasi ini, email link akan redirect ke URL default Supabase, bukan ke aplikasi kita.
