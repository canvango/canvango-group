-- Migration: Enhance Audit Logs with Security Action Types
-- Description: Add new action types for security events while maintaining backward compatibility
-- Date: 2024-12-02

-- =====================================================
-- 1. Drop existing constraint if exists
-- =====================================================
ALTER TABLE audit_logs 
  DROP CONSTRAINT IF EXISTS audit_logs_action_check;

-- =====================================================
-- 2. Add new constraint with security action types
-- =====================================================
ALTER TABLE audit_logs 
  ADD CONSTRAINT audit_logs_action_check 
  CHECK (action IN (
    -- Existing action types (backward compatible)
    'CREATE',
    'UPDATE',
    'DELETE',
    'VIEW',
    'APPROVE',
    'REJECT',
    'REFUND',
    'EXPORT',
    -- New security-related action types
    'CALLBACK_RECEIVED',
    'CALLBACK_SIGNATURE_FAIL',
    'CALLBACK_IP_FAIL',
    'RATE_LIMIT_EXCEEDED',
    'UNAUTHORIZED_ACCESS',
    'ENCRYPTION_KEY_ACCESS',
    'TRANSACTION_MISMATCH',
    'IDEMPOTENCY_CHECK',
    'tripay_callback'
  ));

-- =====================================================
-- 3. Add comments for new action types
-- =====================================================
COMMENT ON CONSTRAINT audit_logs_action_check ON audit_logs IS 
  'Valid action types including security events: CALLBACK_RECEIVED, CALLBACK_SIGNATURE_FAIL, CALLBACK_IP_FAIL, RATE_LIMIT_EXCEEDED, UNAUTHORIZED_ACCESS, ENCRYPTION_KEY_ACCESS, TRANSACTION_MISMATCH, IDEMPOTENCY_CHECK';
