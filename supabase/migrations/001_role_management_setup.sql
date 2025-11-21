-- =====================================================
-- Role Management System - Database Migration
-- =====================================================
-- This migration creates the complete role management system
-- including tables, triggers, RLS policies, and indexes
-- =====================================================

-- =====================================================
-- 1. CREATE ENUM TYPE
-- =====================================================

-- Create user_role enum type with 'member' and 'admin' values
CREATE TYPE user_role AS ENUM ('member', 'admin');

-- =====================================================
-- 2. CREATE TABLES
-- =====================================================

-- Create user_profiles table
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'member',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create role_audit_logs table
CREATE TABLE role_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    changed_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    old_role user_role,
    new_role user_role NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. CREATE INDEXES
-- =====================================================

-- Indexes for user_profiles table
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);

-- Indexes for role_audit_logs table
CREATE INDEX idx_role_audit_logs_user_id ON role_audit_logs(user_id);
CREATE INDEX idx_role_audit_logs_changed_at ON role_audit_logs(changed_at DESC);

-- =====================================================
-- 4. CREATE FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function: Auto-create user profile with 'member' role on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, role)
    VALUES (NEW.id, 'member');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Execute handle_new_user after user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Function: Auto-update timestamp on profile update
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Execute update_updated_at before profile update
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Function: Log role changes to audit table
CREATE OR REPLACE FUNCTION log_role_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if role actually changed
    IF OLD.role IS DISTINCT FROM NEW.role THEN
        INSERT INTO role_audit_logs (user_id, changed_by_user_id, old_role, new_role)
        VALUES (
            NEW.user_id,
            auth.uid(),
            OLD.role,
            NEW.role
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Execute log_role_change after role update
CREATE TRIGGER on_role_changed
    AFTER UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION log_role_change();

-- Function: Prevent removal of last admin
CREATE OR REPLACE FUNCTION prevent_last_admin_removal()
RETURNS TRIGGER AS $$
DECLARE
    admin_count INTEGER;
BEGIN
    -- Only check if changing from admin to member
    IF OLD.role = 'admin' AND NEW.role = 'member' THEN
        -- Count remaining admins (excluding current user)
        SELECT COUNT(*) INTO admin_count
        FROM user_profiles
        WHERE role = 'admin' AND user_id != NEW.user_id;
        
        -- Raise exception if this is the last admin
        IF admin_count = 0 THEN
            RAISE EXCEPTION 'Cannot remove the last admin. At least one admin must exist.';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Execute prevent_last_admin_removal before role update
CREATE TRIGGER check_last_admin
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION prevent_last_admin_removal();

-- =====================================================
-- 5. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on both tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_audit_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. CREATE RLS POLICIES FOR user_profiles
-- =====================================================

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
    ON user_profiles
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
    ON user_profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
    ON user_profiles
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Users cannot update their own role (prevents self-promotion)
CREATE POLICY "Users cannot update own role"
    ON user_profiles
    FOR UPDATE
    USING (auth.uid() != user_id);

-- =====================================================
-- 7. CREATE RLS POLICIES FOR role_audit_logs
-- =====================================================

-- Policy: Admins can read audit logs
CREATE POLICY "Admins can read audit logs"
    ON role_audit_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Next steps:
-- 1. Run this migration in Supabase Dashboard (SQL Editor)
-- 2. Set initial admin user(s) manually using:
--    UPDATE user_profiles SET role = 'admin' WHERE user_id = '<user_uuid>';
-- 3. Verify triggers are working by creating a test user
-- 4. Test RLS policies with different user roles
-- =====================================================
