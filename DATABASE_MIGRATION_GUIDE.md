# 🗄️ Database Migration Guide

## 📋 Overview

Panduan ini menjelaskan cara mengupdate table `users` di Supabase agar kompatibel dengan aplikasi.

## ⚠️ Situasi Saat Ini

**Masalah:**
- Table `user_profiles` sudah dihapus
- Table `users` ada tapi belum punya semua kolom yang diperlukan
- Aplikasi expect kolom: `username`, `full_name`, `role`, `balance`, `avatar`, `last_login_at`

**Solusi:**
- Update table `users` dengan menambahkan kolom yang hilang
- Setup trigger untuk auto-create user profile saat register
- Enable Row Level Security (RLS)

---

## 🚀 Cara Menjalankan Migration

### Step 1: Login ke Supabase Dashboard

1. Buka browser
2. Go to: https://supabase.com/dashboard
3. Login dengan akun Anda
4. Pilih project: **gpittnsfzgkdbqnccncn**

### Step 2: Buka SQL Editor

1. Di sidebar kiri, klik **"SQL Editor"**
2. Atau langsung ke: https://supabase.com/dashboard/project/gpittnsfzgkdbqnccncn/sql

### Step 3: Run Migration

1. **Klik "+ New query"**

2. **Copy SQL dari file:**
   ```
   supabase_migrations/02_update_users_table.sql
   ```

3. **Paste ke SQL Editor**

4. **Klik "Run"** atau tekan **Ctrl+Enter**

5. **Tunggu sampai selesai**
   - Anda akan melihat "Success. No rows returned"
   - Ini normal karena migration hanya update schema

### Step 4: Verify Migration

1. **Buka Table Editor**
   - Klik "Table Editor" di sidebar
   - Pilih table "users"

2. **Check Columns**
   Pastikan table `users` punya kolom:
   - ✅ id (uuid)
   - ✅ email (text)
   - ✅ username (text) - **BARU**
   - ✅ full_name (text) - **BARU**
   - ✅ role (text) - **BARU**
   - ✅ balance (bigint) - **BARU**
   - ✅ avatar (text) - **BARU**
   - ✅ created_at (timestamptz)
   - ✅ updated_at (timestamptz)
   - ✅ last_login_at (timestamptz) - **BARU**

3. **Check Indexes**
   - Klik tab "Indexes"
   - Pastikan ada:
     - idx_users_username
     - idx_users_email
     - idx_users_role

4. **Check RLS Policies**
   - Klik tab "Policies"
   - Pastikan ada:
     - "Users can read own data"
     - "Users can update own data"
     - "Enable insert for authentication"

---

## 🧪 Testing

### Test 1: Check Table Structure

```sql
-- Run di SQL Editor
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
```

**Expected Output:**
```
id          | uuid        | NO  | uuid_generate_v4()
email       | text        | NO  | 
username    | text        | YES | 
full_name   | text        | YES | 
role        | text        | YES | 'member'
balance     | bigint      | YES | 0
avatar      | text        | YES | 
created_at  | timestamptz | YES | now()
updated_at  | timestamptz | YES | now()
last_login_at | timestamptz | YES | 
```

### Test 2: Check Trigger

```sql
-- Run di SQL Editor
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

**Expected Output:**
```
on_auth_user_created | INSERT | users
```

### Test 3: Test Registration

1. **Restart Dev Server**
   ```bash
   cd canvango-app/frontend
   npm run dev
   ```

2. **Open Browser**
   ```
   http://localhost:5174
   ```

3. **Register New User**
   ```
   Username: testuser123
   Email: testuser123@example.com
   Full Name: Test User
   Password: password123
   ```

4. **Check Supabase Dashboard**
   - Go to Authentication → Users
   - User harus ada di list
   - Go to Table Editor → users
   - User profile harus ter-create otomatis dengan:
     - username: testuser123
     - email: testuser123@example.com
     - full_name: Test User
     - role: member
     - balance: 0

---

## 🔧 Troubleshooting

### Issue 1: "column already exists"

**Penyebab:** Kolom sudah ada dari migration sebelumnya

**Solusi:** Ini normal, migration menggunakan `IF NOT EXISTS` jadi aman dijalankan berulang kali.

### Issue 2: "permission denied"

**Penyebab:** User tidak punya permission untuk alter table

**Solusi:**
1. Pastikan Anda login sebagai owner project
2. Atau gunakan service_role key (jangan di frontend!)

### Issue 3: "trigger already exists"

**Penyebab:** Trigger sudah dibuat sebelumnya

**Solusi:** Migration sudah handle ini dengan `DROP TRIGGER IF EXISTS`

### Issue 4: User tidak ter-create otomatis

**Penyebab:** Trigger tidak jalan atau ada error

**Solusi:**
1. Check trigger exists:
   ```sql
   SELECT * FROM information_schema.triggers 
   WHERE trigger_name = 'on_auth_user_created';
   ```

2. Check function exists:
   ```sql
   SELECT * FROM pg_proc 
   WHERE proname = 'handle_new_user';
   ```

3. Manual create user profile:
   ```sql
   INSERT INTO users (id, email, username, full_name, role, balance)
   VALUES (
     'user-uuid-here',
     'email@example.com',
     'username',
     'Full Name',
     'member',
     0
   );
   ```

---

## 📊 What This Migration Does

### 1. Adds Missing Columns

```sql
ALTER TABLE users ADD COLUMN username TEXT UNIQUE;
ALTER TABLE users ADD COLUMN full_name TEXT;
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'member';
ALTER TABLE users ADD COLUMN balance BIGINT DEFAULT 0;
ALTER TABLE users ADD COLUMN avatar TEXT;
ALTER TABLE users ADD COLUMN last_login_at TIMESTAMPTZ;
```

### 2. Creates Indexes

```sql
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

**Why?** Faster queries when searching by username, email, or role.

### 3. Enables Row Level Security

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

**Why?** Prevents users from accessing other users' data.

### 4. Creates RLS Policies

```sql
-- Users can only read their own data
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can only update their own data
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

**Why?** Enforces data privacy at database level.

### 5. Creates Auto-Registration Trigger

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

**Why?** Automatically creates user profile when someone registers.

**How it works:**
1. User registers via Supabase Auth
2. New row created in `auth.users`
3. Trigger fires
4. Function `handle_new_user()` runs
5. New row created in `users` table with default values

---

## ✅ Success Criteria

After running migration, you should have:

- [x] Table `users` has all required columns
- [x] Indexes created for performance
- [x] RLS enabled and policies configured
- [x] Trigger auto-creates user profile on registration
- [x] Existing users have default values
- [x] New registrations work end-to-end

---

## 🔄 Rollback (If Needed)

If something goes wrong, you can rollback:

```sql
-- Remove trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Remove function
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Remove policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Enable insert for authentication" ON users;

-- Remove columns (CAREFUL! This deletes data)
-- ALTER TABLE users DROP COLUMN IF EXISTS username;
-- ALTER TABLE users DROP COLUMN IF EXISTS full_name;
-- ALTER TABLE users DROP COLUMN IF EXISTS role;
-- ALTER TABLE users DROP COLUMN IF EXISTS balance;
-- ALTER TABLE users DROP COLUMN IF EXISTS avatar;
-- ALTER TABLE users DROP COLUMN IF EXISTS last_login_at;
```

⚠️ **Warning:** Dropping columns will delete data permanently!

---

## 📞 Need Help?

### Check Logs

```sql
-- Check recent errors
SELECT * FROM pg_stat_activity 
WHERE state = 'active';
```

### Supabase Support

- Documentation: https://supabase.com/docs
- Discord: https://discord.supabase.com
- GitHub Issues: https://github.com/supabase/supabase/issues

---

## 🎯 Next Steps

After migration:

1. ✅ **Update `.env`** with real Supabase credentials
2. ✅ **Restart dev server**
3. ✅ **Test registration**
4. ✅ **Test login**
5. ✅ **Verify user data persists**

---

**Migration File:** `supabase_migrations/02_update_users_table.sql`
**Status:** Ready to run
**Safe to run multiple times:** Yes (uses IF NOT EXISTS)
