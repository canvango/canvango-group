# Role Management System - Setup Instructions

## Prerequisites

- Akses ke Supabase Dashboard
- Project Supabase yang sudah aktif
- Minimal 1 user yang sudah terdaftar (untuk dijadikan admin pertama)

## Installation Steps

### 1. Run Migration Script

1. Buka Supabase Dashboard: https://app.supabase.com
2. Pilih project Anda
3. Klik **SQL Editor** di sidebar kiri
4. Klik **New Query**
5. Copy seluruh isi file `supabase/migrations/001_role_management_setup.sql`
6. Paste ke SQL Editor
7. Klik **Run** atau tekan `Ctrl+Enter`

**Expected Result:**
```
Success. No rows returned
```

### 2. Verify Tables Created

1. Klik **Table Editor** di sidebar
2. Anda harus melihat 2 tabel baru:
   - `user_profiles`
   - `role_audit_logs`

### 3. Set Initial Admin User

**PENTING:** Anda harus set minimal 1 admin user sebelum menggunakan sistem.

#### Cara 1: Via SQL Editor (Recommended)

1. Buka **SQL Editor**
2. Dapatkan user_id dari user yang ingin dijadikan admin:

```sql
-- Lihat semua users
SELECT id, email FROM auth.users;
```

3. Copy `id` dari user yang ingin dijadikan admin
4. Update role user tersebut:

```sql
-- Ganti <USER_UUID> dengan id user yang ingin dijadikan admin
UPDATE user_profiles 
SET role = 'admin' 
WHERE user_id = '<USER_UUID>';
```

#### Cara 2: Via Table Editor

1. Buka **Table Editor**
2. Pilih tabel `user_profiles`
3. Cari row dengan user yang ingin dijadikan admin
4. Klik pada cell `role`
5. Ubah dari `member` menjadi `admin`
6. Klik **Save**

### 4. Test Triggers

#### Test Auto-Create Profile

1. Buat user baru via Authentication:
   - Klik **Authentication** di sidebar
   - Klik **Add User**
   - Masukkan email dan password
   - Klik **Create User**

2. Verify profile created:
   - Buka **Table Editor** → `user_profiles`
   - Cari user baru
   - Pastikan `role` = `member`

#### Test Last Admin Protection

1. Buka **SQL Editor**
2. Coba ubah admin terakhir menjadi member:

```sql
-- Ini HARUS gagal dengan error
UPDATE user_profiles 
SET role = 'member' 
WHERE role = 'admin';
```

**Expected Error:**
```
Cannot remove the last admin. At least one admin must exist.
```

### 5. Test RLS Policies

#### Test sebagai Member

1. Buat test user dengan role member
2. Login sebagai user tersebut di aplikasi
3. Coba query:

```javascript
// Harus bisa read own profile
const { data } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('user_id', currentUserId);

// Harus TIDAK bisa read profiles lain
const { data, error } = await supabase
  .from('user_profiles')
  .select('*');
// error: "new row violates row-level security policy"
```

#### Test sebagai Admin

1. Login sebagai admin
2. Coba query:

```javascript
// Harus bisa read all profiles
const { data } = await supabase
  .from('user_profiles')
  .select('*');

// Harus bisa update user roles
const { data } = await supabase
  .from('user_profiles')
  .update({ role: 'admin' })
  .eq('user_id', targetUserId);
```

## Verification Checklist

- [ ] Migration script berhasil dijalankan tanpa error
- [ ] Tabel `user_profiles` dan `role_audit_logs` sudah ada
- [ ] Minimal 1 admin user sudah di-set
- [ ] User baru otomatis mendapat role `member`
- [ ] Tidak bisa remove admin terakhir
- [ ] RLS policies berfungsi (member tidak bisa update roles)
- [ ] Audit log mencatat perubahan role

## Troubleshooting

### Error: "relation user_profiles already exists"

**Cause:** Migration sudah pernah dijalankan sebelumnya.

**Solution:** 
1. Jika ingin re-run migration, jalankan rollback script terlebih dahulu
2. Atau skip migration jika tabel sudah ada

### Error: "permission denied for schema auth"

**Cause:** Tidak ada permission untuk create trigger di auth.users.

**Solution:**
1. Pastikan Anda menggunakan service role key (bukan anon key)
2. Atau jalankan migration via Supabase Dashboard (recommended)

### Tidak ada user di user_profiles setelah signup

**Cause:** Trigger `on_auth_user_created` tidak berjalan.

**Solution:**
1. Verify trigger exists:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

2. Manually create profile untuk existing users:
```sql
INSERT INTO user_profiles (user_id, role)
SELECT id, 'member' FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_profiles);
```

### RLS policies tidak berfungsi

**Cause:** RLS mungkin tidak enabled atau policies salah.

**Solution:**
1. Verify RLS enabled:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('user_profiles', 'role_audit_logs');
```

2. Verify policies exist:
```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('user_profiles', 'role_audit_logs');
```

## Rollback

Jika Anda perlu undo migration:

1. Buka **SQL Editor**
2. Copy isi file `supabase/migrations/rollback_001_role_management.sql`
3. Paste dan Run

**WARNING:** Ini akan menghapus semua data di `user_profiles` dan `role_audit_logs`!

## Next Steps

Setelah database setup selesai, lanjutkan dengan:

1. Implement TypeScript client (`RoleManagementClient`)
2. Integrate dengan aplikasi
3. Build Admin Interface
4. Run tests

## Support

Jika ada masalah, check:
- Supabase logs: Dashboard → Logs
- PostgreSQL logs: Dashboard → Database → Logs
- RLS policies: Dashboard → Authentication → Policies
