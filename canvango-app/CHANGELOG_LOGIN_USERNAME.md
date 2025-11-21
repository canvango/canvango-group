# Changelog - Login dengan Username/Email (Case-Insensitive)

## Tanggal: 2024-11-15

### ✨ Fitur Baru

#### Login dengan Username atau Email
- User sekarang dapat login menggunakan username atau email
- Username tidak membedakan huruf besar dan kecil (case-insensitive)
- Contoh: `johndoe`, `JohnDoe`, `JOHNDOE` semua akan berhasil login

### 🔧 Perubahan Backend

#### File Baru
1. **`backend/src/controllers/auth.controller.ts`**
   - `getEmailFromIdentifier()`: Konversi username ke email untuk login
   - `checkUsernameAvailability()`: Cek ketersediaan username

2. **`backend/src/routes/auth.routes.ts`**
   - `POST /api/auth/get-email`: Endpoint untuk get email
   - `POST /api/auth/check-username`: Endpoint untuk check username

#### File Dimodifikasi
1. **`backend/src/models/User.model.ts`**
   - `findByUsername()`: Update untuk case-insensitive search (`.ilike()`)
   - `findByEmailOrUsername()`: Update untuk case-insensitive search

2. **`backend/src/index.ts`**
   - Import dan register auth routes

### 🎨 Perubahan Frontend

#### File Baru
1. **`frontend/src/services/authService.ts`**
   - `getEmailFromIdentifier()`: Service untuk call backend API

#### File Dimodifikasi
1. **`frontend/src/types/user.types.ts`**
   - `LoginCredentials`: Ubah `email` menjadi `identifier`

2. **`frontend/src/contexts/AuthContext.tsx`**
   - `login()`: Update untuk support username/email login
   - Deteksi apakah input adalah email atau username
   - Konversi username ke email sebelum login ke Supabase

3. **`frontend/src/components/auth/LoginForm.tsx`**
   - Field `email` diubah menjadi `identifier`
   - Label: "Username or Email"
   - Placeholder: "Enter your username or email"
   - Validasi: min 3 karakter (untuk username)

### 🗄️ Perubahan Database

#### Migration Baru
1. **`supabase/migrations/002_username_case_insensitive.sql`**
   - Menambahkan index: `idx_users_username_lower`
   - Index menggunakan `LOWER(username)` untuk performa

### 📚 Dokumentasi

#### File Baru
1. **`LOGIN_USERNAME_IMPLEMENTATION.md`**
   - Dokumentasi teknis implementasi
   - Cara kerja sistem
   - Contoh penggunaan API

2. **`LOGIN_USERNAME_GUIDE.md`**
   - Panduan user untuk login
   - Panduan developer untuk setup
   - Troubleshooting

3. **`CHANGELOG_LOGIN_USERNAME.md`**
   - File ini - changelog lengkap

### 🔒 Keamanan

- Username case-insensitive untuk UX yang lebih baik
- Password tetap case-sensitive untuk keamanan
- Validasi input untuk mencegah injection
- Index database untuk performa

### 📝 Catatan

#### Breaking Changes
- `LoginCredentials` interface berubah dari `email` ke `identifier`
- Komponen yang menggunakan `LoginCredentials` perlu update

#### Migration Required
- Jalankan migration `002_username_case_insensitive.sql`
- Index diperlukan untuk performa pencarian username

#### Backward Compatibility
- Login dengan email tetap berfungsi seperti sebelumnya
- Tidak ada perubahan pada flow registrasi

### 🚀 Cara Deploy

1. **Backend**
```bash
cd canvango-app/backend
npm install
npm run build
```

2. **Frontend**
```bash
cd canvango-app/frontend
npm install
npm run build
```

3. **Database**
```bash
# Jalankan migration
supabase db push
# atau
psql -d your_database -f supabase/migrations/002_username_case_insensitive.sql
```

### ✅ Testing Checklist

- [ ] Login dengan email berhasil
- [ ] Login dengan username (lowercase) berhasil
- [ ] Login dengan username (uppercase) berhasil
- [ ] Login dengan username (mixed case) berhasil
- [ ] Error handling untuk username tidak ditemukan
- [ ] Error handling untuk password salah
- [ ] Validasi input di form login
- [ ] API endpoint `/api/auth/get-email` berfungsi
- [ ] API endpoint `/api/auth/check-username` berfungsi
- [ ] Database index `idx_users_username_lower` ada
- [ ] Performa pencarian username cepat

### 🐛 Known Issues

Tidak ada known issues saat ini.

### 📞 Support

Jika ada masalah atau pertanyaan, silakan buat issue di repository atau hubungi tim development.
