-- Verify Forgot Password Configuration
-- Run this to check if password reset is working correctly

-- 1. Check recent password reset attempts
SELECT 
  id,
  email,
  recovery_sent_at,
  email_confirmed_at,
  created_at,
  updated_at,
  CASE 
    WHEN recovery_sent_at IS NOT NULL THEN 'Reset email sent'
    ELSE 'No reset email sent'
  END as reset_status
FROM auth.users
WHERE recovery_sent_at IS NOT NULL
ORDER BY recovery_sent_at DESC
LIMIT 10;

-- 2. Check user metadata for email verification
SELECT 
  id,
  email,
  raw_user_meta_data->>'email_verified' as email_verified,
  email_confirmed_at,
  recovery_sent_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- 3. Check if there are any users with pending password resets
SELECT 
  COUNT(*) as pending_resets,
  MAX(recovery_sent_at) as last_reset_sent
FROM auth.users
WHERE recovery_sent_at > NOW() - INTERVAL '24 hours';
