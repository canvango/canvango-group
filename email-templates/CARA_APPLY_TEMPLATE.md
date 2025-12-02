# Cara Apply Email Templates ke Supabase

## 📧 Templates yang Tersedia

Saya sudah buatkan 3 email templates profesional:

1. **confirm-signup.html** - Email konfirmasi pendaftaran (biru)
2. **reset-password.html** - Email reset password (merah)
3. **magic-link.html** - Email login tanpa password (ungu)

---

## 🎨 Fitur Templates

✅ **Modern & Professional Design**
- Gradient header dengan warna berbeda per template
- Rounded corners (24px) sesuai design system
- Responsive untuk mobile & desktop
- Clean typography

✅ **Footer Kontak Lengkap**
- Email support: support@canvango.com
- WhatsApp: +62 812-3456-7890
- Copyright & branding

✅ **Security Notes**
- Warning untuk email yang tidak diminta
- Expiry time info (24 jam / 1 jam)

✅ **Supabase Variables**
- `{{ .ConfirmationURL }}` - Link konfirmasi/reset
- `{{ .Email }}` - Email penerima
- `{{ .Token }}` - Token (jika diperlukan)

---

## 🚀 Cara Apply ke Supabase

### Step 1: Buka File Template

1. Buka file `email-templates/confirm-signup.html`
2. **Select All** (Ctrl+A / Cmd+A)
3. **Copy** (Ctrl+C / Cmd+C)

### Step 2: Paste ke Supabase Dashboard

1. Login ke **Supabase Dashboard**: https://supabase.com/dashboard
2. Pilih project Anda
3. Pergi ke: **Authentication → Email Templates**
4. Pilih template: **Confirm signup**
5. Scroll ke bawah ke bagian **Message Body**
6. **Paste** HTML code yang sudah di-copy
7. Klik **Save**

### Step 3: Ulangi untuk Template Lain

**Reset Password:**
- Copy dari: `email-templates/reset-password.html`
- Paste ke: **Reset Password** template di Supabase

**Magic Link:**
- Copy dari: `email-templates/magic-link.html`
- Paste ke: **Magic Link** template di Supabase

---

## ⚙️ Customization (Opsional)

### 1. Update Kontak Support

Edit bagian footer di setiap template:

```html
📧 Email: <a href="mailto:support@canvango.com">support@canvango.com</a><br>
💬 WhatsApp: <a href="https://wa.me/6281234567890">+62 812-3456-7890</a>
```

Ganti dengan:
- Email support yang benar
- Nomor WhatsApp yang benar (format: 62xxx tanpa +)

### 2. Tambah Logo (Nanti)

Setelah upload logo ke hosting, tambahkan di bagian header:

```html
<!-- Tambahkan sebelum <h1> -->
<img src="https://canvango.com/logo.png" 
     alt="Canvango Logo" 
     style="width: 120px; height: auto; margin-bottom: 16px;">
```

### 3. Ganti Warna Brand

Jika mau ganti warna gradient, edit bagian ini:

**Confirm Signup (Biru):**
```html
background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
```

**Reset Password (Merah):**
```html
background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
```

**Magic Link (Ungu):**
```html
background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
```

---

## 🧪 Testing

Setelah apply templates:

1. **Test Confirm Signup:**
   - Register user baru
   - Check email masuk
   - Verify design & button berfungsi

2. **Test Reset Password:**
   - Klik "Forgot Password"
   - Check email masuk
   - Verify link berfungsi

3. **Test Magic Link:**
   - Gunakan fitur magic link login (jika ada)
   - Check email masuk

---

## 📱 Preview Templates

**Confirm Signup:**
- Header: Gradient biru
- Button: Biru dengan shadow
- Security note: Warning kuning
- Footer: Kontak support

**Reset Password:**
- Header: Gradient merah
- Button: Merah dengan shadow
- Security note: Warning kuning
- Footer: Kontak support

**Magic Link:**
- Header: Gradient ungu
- Button: Ungu dengan shadow
- Security note: Warning kuning
- Footer: Kontak support

---

## ⚠️ Troubleshooting

**Problem 1: Template Tidak Tersimpan**
- Pastikan HTML valid (tidak ada syntax error)
- Check Supabase variables benar: `{{ .ConfirmationURL }}`

**Problem 2: Email Masih Plain Text**
- Pastikan paste di **Message Body** bukan **Subject**
- Clear cache browser & test ulang

**Problem 3: Button Tidak Berfungsi**
- Pastikan `{{ .ConfirmationURL }}` tidak berubah
- Test dengan email asli (bukan test email)

**Problem 4: Styling Tidak Muncul**
- Gunakan inline CSS (sudah included)
- Jangan gunakan external CSS

---

## 🎯 Next Steps

Setelah templates applied:

1. ✅ Test semua email templates
2. ✅ Update kontak support dengan nomor/email yang benar
3. ✅ Upload logo & tambahkan ke template
4. ✅ Monitor email deliverability di Brevo dashboard
5. ✅ Verifikasi domain untuk hilangkan spam warning

---

## 📞 Support

Jika ada masalah saat apply templates, tanya saja!

**Template Version:** 1.0
**Last Updated:** 2 Desember 2024
