# Setup Database untuk Login dengan Username

## Masalah
Backend menggunakan table `users` tapi Supabase hanya memiliki table `user_profiles`. Kita perlu membuat table `users` yang sesuai dengan model backend.

## Solusi: Jalankan Migration Secara Manual

### Langkah 1: Buka Supabase Dashboard
1. Login ke https://supabase.com
2. Pilih project Anda
3. Klik menu **SQL Editor** di sidebar kiri

### Langkah 2: Jalankan Migration
Copy dan paste SQL berikut ke SQL Editor, lalu klik **Run**:

```sql
-- =====================================================
-- Users Table - Database Migration
-- =====================================================

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL DEFAULT '',
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('guest', 'member', 'admin')),
    balance DECIMAL(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_username_lower ON users(LOWER(username));

-- Function: Auto-update timestamp
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update timestamp
DROP TRIGGER IF EXISTS update_users_updated_at_trigger ON users;
CREATE TRIGGER update_users_updated_at_trigger
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_users_updated_at();

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data"
    ON users FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can read all users" ON users;
CREATE POLICY "Admins can read all users"
    ON users FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data"
    ON users FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id 
        AND role = (SELECT role FROM users WHERE id = auth.uid())
        AND balance = (SELECT balance FROM users WHERE id = auth.uid())
    );

DROP POLICY IF EXISTS "Admins can update all users" ON users;
CREATE POLICY "Admins can update all users"
    ON users FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Service role can insert users" ON users;
CREATE POLICY "Service role can insert users"
    ON users FOR INSERT
    WITH CHECK (true);

-- Function: Update balance atomically
CREATE OR REPLACE FUNCTION update_user_balance(
    user_id UUID,
    amount_change DECIMAL
)
RETURNS VOID AS $$
BEGIN
    UPDATE users
    SET balance = balance + amount_change
    WHERE id = user_id;
    
    IF (SELECT balance FROM users WHERE id = user_id) < 0 THEN
        RAISE EXCEPTION 'Insufficient balance';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Langkah 3: Verifikasi
Setelah migration berhasil, verifikasi dengan query:

```sql
-- Cek apakah table users sudah ada
SELECT * FROM users LIMIT 1;

-- Cek indexes
SELECT indexname FROM pg_indexes WHERE tablename = 'users';
```

### Langkah 4: Buat User Test (Opsional)
Jika Anda ingin membuat user test untuk login:

```sql
-- Insert test user (ganti dengan auth user ID yang valid)
INSERT INTO users (id, username, email, full_name, role, balance)
VALUES (
    'YOUR_AUTH_USER_ID_HERE',  -- Ganti dengan ID dari auth.users
    'testuser',
    'test@example.com',
    'Test User',
    'member',
    0
);
```

### Langkah 5: Restart Backend
Setelah migration selesai, restart backend server:

```bash
cd canvango-app/backend
npm run dev
```

## Troubleshooting

### Error: "relation 'users' already exists"
Jika table sudah ada, skip langkah CREATE TABLE dan jalankan hanya bagian indexes dan policies.

### Error: "permission denied"
Pastikan Anda menggunakan service role key di backend .env file.

### Error: "foreign key constraint"
Pastikan auth.users sudah memiliki user sebelum insert ke table users.

## Cara Mendapatkan Auth User ID

1. Buka Supabase Dashboard
2. Klik **Authentication** > **Users**
3. Copy UUID dari user yang ingin Anda gunakan
4. Gunakan UUID tersebut saat insert ke table users

## Setelah Setup

Setelah table users dibuat dan ada data user, Anda bisa login dengan:
- Username (case-insensitive): `testuser`, `TestUser`, `TESTUSER`
- Email: `test@example.com`
- Password: password yang diset di Supabase Auth
