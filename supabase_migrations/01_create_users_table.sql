-- =====================================================
-- Migration: Create Users Table
-- Description: Menggabungkan fungsi users_profile ke users
-- =====================================================

-- Drop table jika sudah ada (hati-hati di production!)
DROP TABLE IF EXISTS users CASCADE;

-- Create users table dengan semua field yang diperlukan
CREATE TABLE users (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Authentication fields (dari Supabase Auth)
  auth_id UUID UNIQUE, -- Link ke auth.users
  
  -- Basic Info
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  
  -- Role & Status
  role TEXT DEFAULT 'member' CHECK (role IN ('guest', 'member', 'admin')),
  is_active BOOLEAN DEFAULT true,
  
  -- Financial
  balance BIGINT DEFAULT 0 CHECK (balance >= 0),
  
  -- Profile
  avatar TEXT,
  phone TEXT,
  address TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  email_verified_at TIMESTAMPTZ,
  
  -- Soft Delete
  deleted_at TIMESTAMPTZ
);

-- =====================================================
-- Indexes untuk Performance
-- =====================================================

-- Index untuk query yang sering digunakan
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_auth_id ON users(auth_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Composite index untuk query kompleks
CREATE INDEX idx_users_role_active ON users(role, is_active) WHERE deleted_at IS NULL;

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "users_select_own"
  ON users
  FOR SELECT
  USING (
    auth.uid() = auth_id 
    OR 
    role = 'admin' -- Admin can see all users
  );

-- Policy: Users can update their own data (except role and balance)
CREATE POLICY "users_update_own"
  ON users
  FOR UPDATE
  USING (auth.uid() = auth_id)
  WITH CHECK (
    auth.uid() = auth_id
    AND role = OLD.role -- Cannot change own role
    AND balance = OLD.balance -- Cannot change own balance directly
  );

-- Policy: Only admins can insert users
CREATE POLICY "users_insert_admin"
  ON users
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Policy: Only admins can delete users (soft delete)
CREATE POLICY "users_delete_admin"
  ON users
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- =====================================================
-- Functions
-- =====================================================

-- Function: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update updated_at on every update
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function: Create user profile after auth signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    auth_id,
    email,
    username,
    full_name,
    email_verified_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.email_confirmed_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Auto-create user profile on auth signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Function: Update last_login_at
CREATE OR REPLACE FUNCTION update_last_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET last_login_at = NOW()
  WHERE auth_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Update last_login_at on auth
CREATE TRIGGER on_auth_user_login
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
  EXECUTE FUNCTION update_last_login();

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function: Get user by email
CREATE OR REPLACE FUNCTION get_user_by_email(user_email TEXT)
RETURNS TABLE (
  id UUID,
  username TEXT,
  email TEXT,
  full_name TEXT,
  role TEXT,
  balance BIGINT,
  avatar TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.username,
    u.email,
    u.full_name,
    u.role,
    u.balance,
    u.avatar,
    u.created_at
  FROM users u
  WHERE u.email = user_email
    AND u.is_active = true
    AND u.deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Update user balance (with transaction safety)
CREATE OR REPLACE FUNCTION update_user_balance(
  user_id UUID,
  amount BIGINT,
  operation TEXT -- 'add' or 'subtract'
)
RETURNS BOOLEAN AS $$
DECLARE
  current_balance BIGINT;
  new_balance BIGINT;
BEGIN
  -- Get current balance with row lock
  SELECT balance INTO current_balance
  FROM users
  WHERE id = user_id
  FOR UPDATE;
  
  -- Calculate new balance
  IF operation = 'add' THEN
    new_balance := current_balance + amount;
  ELSIF operation = 'subtract' THEN
    new_balance := current_balance - amount;
    
    -- Check if sufficient balance
    IF new_balance < 0 THEN
      RAISE EXCEPTION 'Insufficient balance';
    END IF;
  ELSE
    RAISE EXCEPTION 'Invalid operation. Use add or subtract';
  END IF;
  
  -- Update balance
  UPDATE users
  SET balance = new_balance,
      updated_at = NOW()
  WHERE id = user_id;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Seed Data (Optional - for testing)
-- =====================================================

-- Insert admin user (update with your actual auth_id after signup)
-- INSERT INTO users (
--   auth_id,
--   username,
--   email,
--   full_name,
--   role,
--   balance
-- ) VALUES (
--   'your-auth-uuid-here',
--   'admin',
--   'admin@canvango.com',
--   'Administrator',
--   'admin',
--   0
-- );

-- =====================================================
-- Comments untuk Documentation
-- =====================================================

COMMENT ON TABLE users IS 'Main users table - combines auth and profile data';
COMMENT ON COLUMN users.auth_id IS 'Link to auth.users table';
COMMENT ON COLUMN users.balance IS 'User balance in smallest currency unit (e.g., cents)';
COMMENT ON COLUMN users.role IS 'User role: guest, member, or admin';
COMMENT ON COLUMN users.deleted_at IS 'Soft delete timestamp';

-- =====================================================
-- Verification Queries
-- =====================================================

-- Check if table created successfully
-- SELECT table_name, column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'users'
-- ORDER BY ordinal_position;

-- Check indexes
-- SELECT indexname, indexdef 
-- FROM pg_indexes 
-- WHERE tablename = 'users';

-- Check RLS policies
-- SELECT policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename = 'users';
