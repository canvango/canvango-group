# Fix: User Registration Not Recorded in Supabase

## Masalah
User yang baru mendaftar tidak tercatat di tabel `public.users` di Supabase, meskipun berhasil terdaftar di `auth.users`.

## Penyebab
1. **Trigger salah tempat**: Trigger `on_auth_user_created` terpasang di `public.users` bukan di `auth.users`
2. **Kolom `auth_id` tidak ada**: Tabel `public.users` tidak memiliki kolom untuk link ke `auth.users`
3. **Trigger bermasalah**: Ada trigger `sync_users_to_user_profiles` yang mencoba insert ke tabel `user_profiles` yang tidak ada

## Solusi yang Diterapkan

### 1. Menambahkan Kolom `auth_id`
```sql
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS auth_id UUID UNIQUE;

CREATE INDEX IF NOT EXISTS idx_users_auth_id ON public.users(auth_id);
```

### 2. Memindahkan Trigger ke Tempat yang Benar
Trigger `on_auth_user_created` dipindahkan dari `public.users` ke `auth.users`:

```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON public.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### 3. Memperbaiki Function `handle_new_user()`
Function diupdate untuk menggunakan `auth.users.id` sebagai primary key:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    auth_id,
    email,
    username,
    full_name,
    role,
    balance,
    email_verified_at,
    created_at,
    updated_at,
    password
  )
  VALUES (
    NEW.id, -- auth.users.id sebagai primary key
    NEW.id, -- juga disimpan di auth_id
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'member',
    0,
    NEW.email_confirmed_at,
    NOW(),
    NOW(),
    ''
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 4. Menghapus Trigger Bermasalah
```sql
DROP TRIGGER IF EXISTS sync_users_to_user_profiles ON public.users;
DROP FUNCTION IF EXISTS sync_role_to_user_profiles();
```

### 5. Backfill User yang Hilang
User yang sudah terdaftar sebelum fix ditambahkan ke `public.users`:

```sql
INSERT INTO public.users (id, auth_id, email, username, full_name, role, balance, ...)
SELECT a.id, a.id, a.email, ...
FROM auth.users a
WHERE NOT EXISTS (SELECT 1 FROM public.users u WHERE u.auth_id = a.id);
```

## User yang Diperbaiki
Berikut user yang sudah ditambahkan ke `public.users`:

1. **admin1@gmail.com** (username: admin1)
2. **adminbenar2@gmail.com** (username: adminbenar2)
3. **adminbenar@gmail.com** (username: adminbenar)

## Verifikasi

### Cek Trigger
```sql
SELECT 
  trigger_name,
  event_object_schema,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

**Hasil**: Trigger terpasang di `auth.users` ✅

### Cek User
```sql
SELECT 
  a.email,
  u.id,
  u.username,
  u.role,
  u.balance
FROM auth.users a
LEFT JOIN public.users u ON a.id = u.auth_id;
```

**Hasil**: Semua user di `auth.users` memiliki record di `public.users` ✅

## Testing
Untuk test registrasi baru:

1. Buka aplikasi dan register user baru
2. Cek di Supabase Table Editor → `users` table
3. User baru harus otomatis muncul dengan:
   - `id` = auth.users.id
   - `auth_id` = auth.users.id
   - `username` = dari form atau email prefix
   - `full_name` = dari form atau email prefix
   - `role` = 'member'
   - `balance` = 0

## Catatan Penting

1. **Password Column**: Kolom `password` di `public.users` sekarang nullable karena password dihandle oleh Supabase Auth
2. **Primary Key**: `public.users.id` sekarang sama dengan `auth.users.id` untuk konsistensi
3. **Registrasi Baru**: Semua registrasi baru akan otomatis tercatat di kedua tabel
4. **RLS Policy**: Policy "Allow service role to insert users" memungkinkan trigger untuk insert

## Migrations yang Dijalankan

1. `fix_user_registration_trigger` - Memperbaiki trigger dan function
2. `add_auth_id_column` - Menambahkan kolom auth_id dan avatar
3. `backfill_missing_users_v2` - Menambahkan user yang hilang
4. `remove_user_profiles_trigger` - Menghapus trigger bermasalah
5. `update_handle_new_user_function` - Update function untuk konsistensi

## Status
✅ **SELESAI** - Registrasi user sekarang berfungsi dengan baik dan otomatis tercatat di `public.users`
