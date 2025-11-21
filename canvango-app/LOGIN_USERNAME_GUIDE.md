# Panduan Login dengan Username/Email

## Fitur Baru

Sekarang Anda dapat login menggunakan **username** atau **email**, dengan username yang **tidak membedakan huruf besar dan kecil** (case-insensitive).

## Cara Login

### 1. Login dengan Email
```
Username or Email: user@example.com
Password: your_password
```

### 2. Login dengan Username
```
Username or Email: johndoe
Password: your_password
```

Username tidak membedakan huruf besar/kecil, jadi semua ini akan berhasil:
- `johndoe`
- `JohnDoe`
- `JOHNDOE`
- `JoHnDoE`

## Untuk Developer

### Setup Database

Jalankan migration untuk menambahkan index case-insensitive:

```bash
# Jika menggunakan Supabase CLI
supabase db push

# Atau jalankan migration secara manual
psql -d your_database -f supabase/migrations/002_username_case_insensitive.sql
```

### API Endpoints

#### 1. Get Email from Identifier
Endpoint untuk mengkonversi username ke email (untuk login):

```bash
POST /api/auth/get-email
Content-Type: application/json

{
  "identifier": "johndoe"  // atau "user@example.com"
}

Response:
{
  "success": true,
  "data": {
    "email": "user@example.com"
  }
}
```

#### 2. Check Username Availability
Endpoint untuk mengecek ketersediaan username (untuk registrasi):

```bash
POST /api/auth/check-username
Content-Type: application/json

{
  "username": "johndoe"
}

Response:
{
  "success": true,
  "data": {
    "available": false,
    "username": "johndoe"
  }
}
```

### Testing

1. **Start Backend**
```bash
cd canvango-app/backend
npm run dev
```

2. **Start Frontend**
```bash
cd canvango-app/frontend
npm run dev
```

3. **Test Login**
- Buka browser ke `http://localhost:5173/login`
- Masukkan username atau email
- Masukkan password
- Klik Login

## Keamanan

- Username case-insensitive untuk kemudahan user
- Password tetap case-sensitive untuk keamanan
- Email tetap case-sensitive sesuai standar
- Validasi input untuk mencegah injection attacks

## Troubleshooting

### Error: "User not found"
- Pastikan username atau email benar
- Cek apakah user sudah terdaftar di database

### Error: "Failed to get email"
- Pastikan backend server berjalan
- Cek koneksi ke database
- Lihat log backend untuk detail error

### Login lambat
- Pastikan migration sudah dijalankan
- Index `idx_users_username_lower` harus ada di database
- Cek dengan: `\d users` di psql untuk melihat indexes
