# Quick Fix Guide: User Registration

## Masalah yang Diperbaiki ✅
User baru yang register tidak tercatat di tabel `public.users` di Supabase.

## Solusi
Trigger database sudah diperbaiki. Sekarang setiap user yang register akan otomatis tercatat di kedua tabel:
- `auth.users` (Supabase Auth)
- `public.users` (Data aplikasi)

## User yang Sudah Diperbaiki
User yang register sebelum fix sudah ditambahkan secara manual:
- admin1@gmail.com
- adminbenar2@gmail.com
- adminbenar@gmail.com

## Cara Mengubah Role User

### Opsi 1: Menggunakan Script (Recommended)

```bash
# List semua user
node scripts/set-user-role.js list

# Ubah role user menjadi admin
node scripts/set-user-role.js admin1@gmail.com admin

# Ubah role user menjadi member
node scripts/set-user-role.js user@example.com member
```

### Opsi 2: Menggunakan SQL di Supabase

1. Buka Supabase Dashboard
2. Pilih project Anda
3. Klik "SQL Editor"
4. Jalankan query:

```sql
-- Ubah role user menjadi admin
UPDATE users 
SET role = 'admin' 
WHERE email = 'admin1@gmail.com';

-- Lihat semua user
SELECT email, username, role, balance 
FROM users 
ORDER BY created_at DESC;
```

## Testing Registrasi Baru

1. Buka aplikasi di browser
2. Klik "Register" atau "Daftar"
3. Isi form registrasi:
   - Email
   - Username
   - Full Name
   - Password
4. Submit form
5. Cek di Supabase Table Editor → `users` table
6. User baru harus muncul dengan:
   - ✅ Email yang diinput
   - ✅ Username yang diinput
   - ✅ Full name yang diinput
   - ✅ Role = 'member'
   - ✅ Balance = 0

## Verifikasi Fix Berhasil

### Cek Trigger
```sql
SELECT 
  trigger_name,
  event_object_schema,
  event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

**Expected Result:**
- trigger_name: `on_auth_user_created`
- event_object_schema: `auth`
- event_object_table: `users` ✅

### Cek User Count
```sql
-- Hitung user di auth.users
SELECT COUNT(*) as auth_users FROM auth.users;

-- Hitung user di public.users
SELECT COUNT(*) as public_users FROM public.users;
```

**Expected Result:** Jumlah harus sama ✅

## Troubleshooting

### User masih tidak muncul setelah register

1. **Cek email confirmation**
   - Apakah Supabase memerlukan email confirmation?
   - Cek di Supabase Dashboard → Authentication → Settings
   - Jika "Enable email confirmations" aktif, user harus confirm email dulu

2. **Cek error di console**
   - Buka browser console (F12)
   - Cek apakah ada error saat register
   - Screenshot error dan share

3. **Cek Supabase logs**
   ```bash
   # Jika menggunakan Supabase CLI
   supabase logs
   ```

4. **Manual insert (temporary fix)**
   ```sql
   -- Cari user di auth.users
   SELECT id, email FROM auth.users WHERE email = 'user@example.com';
   
   -- Insert manual ke public.users
   INSERT INTO public.users (id, auth_id, email, username, full_name, role, balance, password)
   VALUES (
     'auth-user-id-here',
     'auth-user-id-here',
     'user@example.com',
     'username',
     'Full Name',
     'member',
     0,
     ''
   );
   ```

### Cara mengecek apakah trigger berfungsi

```sql
-- Test trigger dengan melihat function
SELECT 
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';
```

## File Terkait

- `USER_REGISTRATION_FIX.md` - Dokumentasi lengkap tentang fix
- `scripts/set-user-role.js` - Script untuk mengubah role user
- `supabase_migrations/01_create_users_table.sql` - Migration awal
- `supabase_migrations/02_update_users_table.sql` - Migration update

## Migrations yang Dijalankan

1. ✅ `fix_user_registration_trigger` - Perbaiki trigger
2. ✅ `add_auth_id_column` - Tambah kolom auth_id
3. ✅ `remove_user_profiles_trigger` - Hapus trigger bermasalah
4. ✅ `backfill_missing_users_v2` - Tambah user yang hilang
5. ✅ `update_handle_new_user_function` - Update function

## Status
🟢 **FIXED** - Registrasi user sekarang berfungsi normal!

## Kontak
Jika masih ada masalah, silakan:
1. Cek dokumentasi lengkap di `USER_REGISTRATION_FIX.md`
2. Screenshot error yang muncul
3. Share hasil query verifikasi
