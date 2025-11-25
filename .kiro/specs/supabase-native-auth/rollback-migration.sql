-- ============================================================================
-- ROLLBACK MIGRATION SCRIPT
-- Supabase Native Auth Migration
-- ============================================================================
-- 
-- Purpose: Restore the system to use JWT claims for role authorization
-- Use Case: If the new database-query approach causes issues
-- 
-- WARNING: Only use this if you need to rollback the migration!
-- This will restore the old JWT-based authentication system.
--
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1: Restore JWT Hook Function
-- ============================================================================

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  claims jsonb;
  user_role text;
BEGIN
  -- Fetch the user role from the users table
  SELECT role::text INTO user_role
  FROM public.users
  WHERE id = (event->>'user_id')::uuid;

  -- Get existing claims
  claims := event->'claims';
  
  -- Add user_role to the claims with explicit text type
  IF user_role IS NOT NULL THEN
    claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role::text));
  ELSE
    -- Default to 'user' if no role found
    claims := jsonb_set(claims, '{user_role}', to_jsonb('user'::text));
  END IF;

  -- Update the event object with new claims
  event := jsonb_set(event, '{claims}', claims);

  RETURN event;
END;
$function$;

COMMENT ON FUNCTION custom_access_token_hook IS 'ROLLBACK: Restored JWT hook function - adds user_role to JWT claims';

-- ============================================================================
-- STEP 2: Restore Old RLS Policies on users Table
-- ============================================================================

-- Drop new policies (database query based)
DROP POLICY IF EXISTS "Admins can delete users" ON users;
DROP POLICY IF EXISTS "Admins can update user roles" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;

-- Restore old policies (JWT claims based)

CREATE POLICY "Admins can view all users"
ON users FOR SELECT
USING (
  (auth.jwt() ->> 'user_role'::text) = 'admin'::text
);

COMMENT ON POLICY "Admins can view all users" ON users IS 'ROLLBACK: Restored JWT-based policy';

CREATE POLICY "Admins can update user roles"
ON users FOR UPDATE
USING (
  (auth.jwt() ->> 'user_role'::text) = 'admin'::text
);

COMMENT ON POLICY "Admins can update user roles" ON users IS 'ROLLBACK: Restored JWT-based policy';

CREATE POLICY "Admins can delete users"
ON users FOR DELETE
USING (
  (auth.jwt() ->> 'user_role'::text) = 'admin'::text
);

COMMENT ON POLICY "Admins can delete users" ON users IS 'ROLLBACK: Restored JWT-based policy';

-- ============================================================================
-- STEP 3: Optionally Remove Composite Index
-- ============================================================================

-- Note: You may want to keep this index as it doesn't hurt performance
-- Uncomment the line below if you want to remove it

-- DROP INDEX IF EXISTS idx_users_id_role;

-- ============================================================================
-- STEP 4: Add Rollback Audit Log
-- ============================================================================

-- Update schema comment to indicate rollback
COMMENT ON SCHEMA public IS 'ROLLBACK APPLIED: Restored JWT-based authentication on ' || CURRENT_TIMESTAMP::text;

COMMIT;

-- ============================================================================
-- POST-ROLLBACK MANUAL STEPS
-- ============================================================================
--
-- After running this SQL script, you MUST also:
--
-- 1. RESTORE HOOK IN SUPABASE DASHBOARD
--    - Go to Authentication > Hooks
--    - Select "Custom Access Token Hook"
--    - Enter function name: custom_access_token_hook
--    - Save configuration
--
-- 2. TEST JWT CLAIMS
--    - Login with a test user
--    - Decode JWT token
--    - Verify 'user_role' claim is present
--
-- 3. VERIFY RLS POLICIES
--    - Test admin can view all users
--    - Test member can only view own profile
--    - Test admin can update user roles
--
-- 4. ROLLBACK FRONTEND CODE (if already deployed)
--    - Restore role caching in localStorage
--    - Remove role polling logic
--    - Restore JWT-based role checks
--
-- 5. MONITOR FOR ISSUES
--    - Check for authentication errors
--    - Verify role changes require logout/login
--    - Monitor RLS policy performance
--
-- ============================================================================

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify JWT hook function exists
SELECT proname, pg_get_functiondef(oid) 
FROM pg_proc 
WHERE proname = 'custom_access_token_hook';

-- Verify policies use JWT claims
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'users'
  AND policyname IN ('Admins can view all users', 'Admins can update user roles', 'Admins can delete users')
ORDER BY policyname;

-- Verify no policies use database queries for role check on users table
SELECT 
  policyname,
  qual
FROM pg_policies
WHERE tablename = 'users'
  AND qual LIKE '%SELECT%role%FROM users%';
-- Should return 0 rows after rollback

-- ============================================================================
