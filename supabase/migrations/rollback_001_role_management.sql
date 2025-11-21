-- =====================================================
-- Role Management System - Rollback Migration
-- =====================================================
-- This script rolls back the role management system
-- Use this if you need to undo the migration
-- =====================================================

-- =====================================================
-- 1. DROP RLS POLICIES
-- =====================================================

-- Drop policies for role_audit_logs
DROP POLICY IF EXISTS "Admins can read audit logs" ON role_audit_logs;

-- Drop policies for user_profiles
DROP POLICY IF EXISTS "Users cannot update own role" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;

-- =====================================================
-- 2. DISABLE RLS
-- =====================================================

ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE role_audit_logs DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3. DROP TRIGGERS
-- =====================================================

DROP TRIGGER IF EXISTS check_last_admin ON user_profiles;
DROP TRIGGER IF EXISTS on_role_changed ON user_profiles;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- =====================================================
-- 4. DROP FUNCTIONS
-- =====================================================

DROP FUNCTION IF EXISTS prevent_last_admin_removal();
DROP FUNCTION IF EXISTS log_role_change();
DROP FUNCTION IF EXISTS update_updated_at();
DROP FUNCTION IF EXISTS handle_new_user();

-- =====================================================
-- 5. DROP INDEXES
-- =====================================================

DROP INDEX IF EXISTS idx_role_audit_logs_changed_at;
DROP INDEX IF EXISTS idx_role_audit_logs_user_id;
DROP INDEX IF EXISTS idx_user_profiles_role;
DROP INDEX IF EXISTS idx_user_profiles_user_id;

-- =====================================================
-- 6. DROP TABLES
-- =====================================================

DROP TABLE IF EXISTS role_audit_logs CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- =====================================================
-- 7. DROP ENUM TYPE
-- =====================================================

DROP TYPE IF EXISTS user_role;

-- =====================================================
-- ROLLBACK COMPLETE
-- =====================================================
