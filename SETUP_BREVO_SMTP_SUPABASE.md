# Setup SMTP Brevo di Supabase - Panduan Lengkap

## 📋 Checklist Persiapan

- [ ] Akun Brevo aktif
- [ ] Domain sudah terdaftar (untuk custom sender email)
- [ ] Akses ke DNS provider domain Anda
- [ ] Akses ke Supabase Dashboard

---

## 🔧 LANGKAH 1: Setup di Brevo

### 1.1 Generate SMTP Credentials

1. Login ke **Brevo Dashboard**: https://app.brevo.com
2. Pergi ke **Settings → SMTP & API**
3. Klik tab **SMTP**
4. Klik **Generate a new SMTP key** (jika belum ada)
5. **Catat kredensial ini** (akan digunakan di Supabase):

```
SMTP Server: smtp-relay.brevo.com
Port: 587 (TLS) atau 465 (SSL)
Login: [email Anda di Brevo]
SMTP Key: [key yang baru di-generate]
```

⚠️ **PENTING**: SMTP Key hanya ditampilkan sekali. Simpan di tempat aman!

### 1.2 Verifikasi Domain (Opsional tapi Direkomendasikan)

Untuk mengirim email dari `noreply@yourdomain.com` bukan `noreply@brevo.com`:

1. Pergi ke **Senders & IP → Domains**
2. Klik **Add a domain**
3. Masukkan domain Anda (contoh: `yourdomain.com`)
4. Brevo akan memberikan **3 DNS records** yang harus ditambahkan:

#### DNS Records yang Harus Ditambahkan:

**A. DKIM Record (CNAME)**
```
Type: CNAME
Name: mail._domainkey.yourdomain.com
Value: mail._domainkey.brevo.com
TTL: 3600
```

**B. SPF Record (TXT)**

Jika **belum ada** SPF record:
```
Type: TXT
Name: yourdomain.com (atau @)
Value: v=spf1 include:spf.brevo.com ~all
TTL: 3600
```

Jika **sudah ada** SPF record (misalnya untuk Vercel):
```
# SEBELUM
v=spf1 include:_spf.vercel.com ~all

# SESUDAH (gabungkan)
v=spf1 include:_spf.vercel.com include:spf.brevo.com ~all
```

**C. DMARC Record (TXT)**
```
Type: TXT
Name: _dmarc.yourdomain.com
Value: v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com
TTL: 3600
```

5. Tambahkan records di **DNS provider** Anda (Cloudflare, Namecheap, dll)
6. Tunggu propagasi DNS (5-30 menit)
7. Kembali ke Brevo, klik **Verify domain**

✅ Status akan berubah menjadi **Verified** jika berhasil

---

## 🔧 LANGKAH 2: Setup di Supabase Dashboard

### 2.1 Konfigurasi SMTP

1. Login ke **Supabase Dashboard**: https://supabase.com/dashboard
2. Pilih **project** Anda
3. Pergi ke **Authentication → Email Templates**
4. Scroll ke bawah sampai bagian **SMTP Settings**
5. Toggle **Enable Custom SMTP**

### 2.2 Isi Kredensial SMTP

Masukkan informasi berikut:

```
Host: smtp-relay.brevo.com
Port Number: 587
Username: [email Brevo Anda]
Password: [SMTP Key dari Brevo]

Sender email: noreply@yourdomain.com
Sender name: [Nama Aplikasi Anda]
```

**Contoh:**
```
Host: smtp-relay.brevo.com
Port Number: 587
Username: your-email@gmail.com
Password: xsmtpsib-a1b2c3d4e5f6g7h8...

Sender email: noreply@yourdomain.com
Sender name: YourApp
```

⚠️ **Catatan Sender Email:**
- Jika domain **sudah verified** di Brevo: gunakan `noreply@yourdomain.com`
- Jika domain **belum verified**: gunakan email Brevo Anda (contoh: `your-email@gmail.com`)

6. Klik **Save**

---

## 🧪 LANGKAH 3: Testing

### 3.1 Test Email Signup

1. Buka aplikasi Anda (mode incognito/private)
2. Coba **register user baru** dengan email asli
3. Check inbox email tersebut
4. Pastikan email confirmation diterima

### 3.2 Test Email Reset Password

1. Di halaman login, klik **Forgot Password**
2. Masukkan email yang sudah terdaftar
3. Check inbox
4. Pastikan email reset password diterima

### 3.3 Monitoring di Brevo

1. Pergi ke **Statistics → Email** di Brevo Dashboard
2. Lihat email yang terkirim
3. Check delivery rate, open rate, bounce rate

---

## ✅ Verifikasi Berhasil

Email berhasil dikonfigurasi jika:

- [ ] Email confirmation signup diterima
- [ ] Email reset password diterima
- [ ] Sender email sesuai (noreply@yourdomain.com)
- [ ] Email tidak masuk spam folder
- [ ] Terlihat di Brevo statistics dashboard

---

## 🐛 Troubleshooting

### Problem 1: Email Tidak Terkirim

**Solusi:**
- Check SMTP credentials di Supabase (username & password benar?)
- Pastikan SMTP Key masih aktif di Brevo
- Check Brevo dashboard → Statistics untuk error logs

### Problem 2: Email Masuk Spam

**Solusi:**
- Verifikasi domain di Brevo (tambah DNS records)
- Pastikan SPF, DKIM, DMARC sudah setup
- Tunggu 24-48 jam untuk DNS propagation
- Test kirim ke berbagai email provider (Gmail, Outlook, Yahoo)

### Problem 3: "Authentication Failed" Error

**Solusi:**
- Re-generate SMTP Key di Brevo
- Copy-paste ulang ke Supabase (pastikan tidak ada spasi)
- Gunakan port 587 (bukan 465)

### Problem 4: Domain Verification Gagal

**Solusi:**
- Check DNS records sudah benar (typo?)
- Tunggu DNS propagation (bisa sampai 24 jam)
- Gunakan DNS checker: https://mxtoolbox.com/dkim.aspx
- Pastikan tidak ada conflict dengan DNS records lain

---

## 📊 Limits Brevo Free Tier

- **300 emails/hari**
- Unlimited contacts
- Email tracking (opens, clicks)
- SMTP relay included

Jika butuh lebih, upgrade ke paid plan.

---

## 🔐 Security Best Practices

1. **Jangan commit** SMTP credentials ke Git
2. Simpan SMTP Key di **password manager**
3. Rotate SMTP Key secara berkala (3-6 bulan)
4. Monitor email statistics untuk detect abuse
5. Enable **2FA** di akun Brevo

---

## 📝 Customization Email Templates (Opsional)

Setelah SMTP setup, Anda bisa customize email templates di Supabase:

1. **Authentication → Email Templates**
2. Edit template:
   - Confirm signup
   - Invite user
   - Magic Link
   - Change Email Address
   - Reset Password

Gunakan variables:
- `{{ .ConfirmationURL }}`
- `{{ .Token }}`
- `{{ .Email }}`
- `{{ .SiteURL }}`

---

## ✨ Next Steps (Opsional)

Setelah SMTP setup berhasil, Anda bisa:

1. **Customize email templates** dengan branding Anda
2. **Setup Brevo API** untuk transactional emails (invoice, notifikasi)
3. **Implement email tracking** (opens, clicks)
4. **Create email campaigns** untuk marketing

---

## 📞 Support

**Brevo Support:**
- Docs: https://developers.brevo.com/docs
- Support: https://help.brevo.com

**Supabase Support:**
- Docs: https://supabase.com/docs/guides/auth/auth-smtp
- Discord: https://discord.supabase.com

---

**Setup Date:** [Tanggal setup]
**Domain:** [Domain Anda]
**Status:** [ ] Pending / [ ] Completed
