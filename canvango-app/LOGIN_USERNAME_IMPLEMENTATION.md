# Login dengan Username/Email (Case-Insensitive)

## Deskripsi
Fitur ini memungkinkan user untuk login menggunakan username atau email, dengan username yang tidak membedakan huruf besar dan kecil (case-insensitive).

## Implementasi

### 1. Backend

#### Model User (`backend/src/models/User.model.ts`)
- **`findByUsername()`**: Diupdate untuk menggunakan `.ilike()` agar pencarian username case-insensitive
- **`findByEmailOrUsername()`**: Diupdate untuk mendukung pencarian case-insensitive pada username

#### Controller Auth (`backend/src/controllers/auth.controller.ts`)
- **`getEmailFromIdentifier()`**: Endpoint baru untuk mengkonversi username ke email
  - Menerima identifier (username atau email)
  - Jika identifier adalah email, langsung return email tersebut
  - Jika identifier adalah username, cari user dan return emailnya
  - Pencarian username case-insensitive

#### Routes Auth (`backend/src/routes/auth.routes.ts`)
- **POST `/api/auth/get-email`**: Route untuk mendapatkan email dari identifier

#### Index (`backend/src/index.ts`)
- Menambahkan auth routes ke aplikasi

### 2. Frontend

#### Types (`frontend/src/types/user.types.ts`)
- **`LoginCredentials`**: Diubah dari `email` menjadi `identifier` untuk menerima username atau email

#### Auth Service (`frontend/src/services/authService.ts`)
- **`getEmailFromIdentifier()`**: Service untuk memanggil endpoint backend

#### Auth Context (`frontend/src/contexts/AuthContext.tsx`)
- **`login()`**: Diupdate untuk:
  1. Cek apakah identifier adalah email atau username
  2. Jika username, panggil `getEmailFromIdentifier()` untuk mendapatkan email
  3. Login ke Supabase menggunakan email

#### Login Form (`frontend/src/components/auth/LoginForm.tsx`)
- Field `email` diubah menjadi `identifier`
- Label diubah menjadi "Username or Email"
- Placeholder diubah menjadi "Enter your username or email"
- Validasi diubah untuk menerima username (min 3 karakter) atau email

### 3. Database

#### Migration (`supabase/migrations/002_username_case_insensitive.sql`)
- Menambahkan index case-insensitive pada kolom username: `idx_users_username_lower`
- Index menggunakan `LOWER(username)` untuk performa pencarian case-insensitive

## Cara Kerja

1. User memasukkan username atau email di form login
2. Frontend mendeteksi apakah input adalah email atau username
3. Jika username:
   - Frontend memanggil endpoint `/api/auth/get-email`
   - Backend mencari user dengan username tersebut (case-insensitive)
   - Backend mengembalikan email user
4. Frontend login ke Supabase menggunakan email dan password
5. Supabase melakukan autentikasi

## Contoh Penggunaan

### Login dengan Email
```
Identifier: user@example.com
Password: password123
```

### Login dengan Username (Case-Insensitive)
```
Identifier: JohnDoe (akan match dengan johndoe, JOHNDOE, JoHnDoE, dll)
Password: password123
```

## Testing

### Manual Testing
1. Buat user dengan username "testuser"
2. Coba login dengan:
   - `testuser` ✓
   - `TestUser` ✓
   - `TESTUSER` ✓
   - `tEsTuSeR` ✓
3. Coba login dengan email user tersebut ✓

### API Testing
```bash
# Test get-email endpoint dengan username
curl -X POST http://localhost:5000/api/auth/get-email \
  -H "Content-Type: application/json" \
  -d '{"identifier": "testuser"}'

# Test get-email endpoint dengan email
curl -X POST http://localhost:5000/api/auth/get-email \
  -H "Content-Type: application/json" \
  -d '{"identifier": "user@example.com"}'
```

## Keamanan

1. **Case-Insensitive Username**: Username tidak membedakan huruf besar/kecil untuk kemudahan user
2. **Email Validation**: Email tetap case-sensitive sesuai standar email
3. **Password**: Password tetap case-sensitive untuk keamanan
4. **Rate Limiting**: Endpoint get-email sebaiknya ditambahkan rate limiting untuk mencegah brute force
5. **User Enumeration**: Endpoint get-email bisa digunakan untuk mengetahui username yang valid, pertimbangkan untuk menambahkan proteksi

## Catatan

- Username harus unik (case-insensitive)
- Saat registrasi, sebaiknya validasi username untuk memastikan tidak ada duplikat case-insensitive
- Index `idx_users_username_lower` meningkatkan performa pencarian username
