-- Migration: Add case-insensitive index for username
-- This allows case-insensitive username lookups for login

-- Create a case-insensitive index on username using LOWER()
CREATE INDEX IF NOT EXISTS idx_users_username_lower ON users (LOWER(username));

-- Add a comment to explain the purpose
COMMENT ON INDEX idx_users_username_lower IS 'Case-insensitive index for username lookups during login';
