-- =====================================================
-- Users Table - Database Migration
-- =====================================================
-- This migration creates the users table for the application
-- =====================================================

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL DEFAULT '', -- Password managed by Supabase Auth
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
-- Case-insensitive index for username (for login)
CREATE INDEX IF NOT EXISTS idx_users_username_lower ON users(LOWER(username));

-- Function: Auto-update timestamp on user update
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Execute update_users_updated_at before user update
DROP TRIGGER IF EXISTS update_users_updated_at_trigger ON users;
CREATE TRIGGER update_users_updated_at_trigger
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_users_updated_at();

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Policy: Users can read their own data
CREATE POLICY "Users can read own data"
    ON users
    FOR SELECT
    USING (auth.uid() = id);

-- Policy: Admins can read all users
CREATE POLICY "Admins can read all users"
    ON users
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Users can update their own data (except role and balance)
CREATE POLICY "Users can update own data"
    ON users
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id 
        AND role = (SELECT role FROM users WHERE id = auth.uid())
        AND balance = (SELECT balance FROM users WHERE id = auth.uid())
    );

-- Policy: Admins can update all users
CREATE POLICY "Admins can update all users"
    ON users
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Service role can insert users (for registration)
CREATE POLICY "Service role can insert users"
    ON users
    FOR INSERT
    WITH CHECK (true);

-- Function: Update user balance atomically
CREATE OR REPLACE FUNCTION update_user_balance(
    user_id UUID,
    amount_change DECIMAL
)
RETURNS VOID AS $$
BEGIN
    UPDATE users
    SET balance = balance + amount_change
    WHERE id = user_id;
    
    -- Check if balance is negative
    IF (SELECT balance FROM users WHERE id = user_id) < 0 THEN
        RAISE EXCEPTION 'Insufficient balance';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
