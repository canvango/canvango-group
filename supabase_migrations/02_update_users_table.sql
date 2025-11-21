-- Migration: Update users table to match application requirements
-- This adds missing columns if they don't exist

-- Add username column if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='users' AND column_name='username') THEN
    ALTER TABLE users ADD COLUMN username TEXT UNIQUE;
  END IF;
END $$;

-- Add full_name column if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='users' AND column_name='full_name') THEN
    ALTER TABLE users ADD COLUMN full_name TEXT;
  END IF;
END $$;

-- Add role column if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='users' AND column_name='role') THEN
    ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'member' CHECK (role IN ('guest', 'member', 'admin'));
  END IF;
END $$;

-- Add balance column if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='users' AND column_name='balance') THEN
    ALTER TABLE users ADD COLUMN balance BIGINT DEFAULT 0;
  END IF;
END $$;

-- Add avatar column if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='users' AND column_name='avatar') THEN
    ALTER TABLE users ADD COLUMN avatar TEXT;
  END IF;
END $$;

-- Add last_login_at column if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='users' AND column_name='last_login_at') THEN
    ALTER TABLE users ADD COLUMN last_login_at TIMESTAMPTZ;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Enable insert for authentication" ON users;

-- Policy: Users can read their own data
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Allow insert during registration (via auth.users trigger)
CREATE POLICY "Enable insert for authentication"
  ON users FOR INSERT
  WITH CHECK (true);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username, full_name, role, balance)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'member',
    0
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to automatically create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update existing users to have default values
UPDATE users 
SET 
  role = COALESCE(role, 'member'),
  balance = COALESCE(balance, 0),
  username = COALESCE(username, split_part(email, '@', 1))
WHERE role IS NULL OR balance IS NULL OR username IS NULL;

COMMENT ON TABLE users IS 'User profiles with balance and role information';
COMMENT ON COLUMN users.username IS 'Unique username for login';
COMMENT ON COLUMN users.full_name IS 'User full name';
COMMENT ON COLUMN users.role IS 'User role: guest, member, or admin';
COMMENT ON COLUMN users.balance IS 'User balance in smallest currency unit (e.g., cents)';
COMMENT ON COLUMN users.avatar IS 'URL to user avatar image';
COMMENT ON COLUMN users.last_login_at IS 'Timestamp of last login';
