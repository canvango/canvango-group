-- Migration: Create Security Events Table
-- Description: Table for comprehensive security event logging and monitoring
-- Date: 2024-12-02

-- =====================================================
-- 1. Create security_events table
-- =====================================================
CREATE TABLE IF NOT EXISTS security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  source_ip VARCHAR(45),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  endpoint VARCHAR(255),
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. Create indexes for query performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_security_events_type 
  ON security_events(event_type);

CREATE INDEX IF NOT EXISTS idx_security_events_severity 
  ON security_events(severity);

CREATE INDEX IF NOT EXISTS idx_security_events_created_at 
  ON security_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_security_events_source_ip 
  ON security_events(source_ip);

CREATE INDEX IF NOT EXISTS idx_security_events_user_id 
  ON security_events(user_id);

-- =====================================================
-- 3. Enable RLS (Row Level Security)
-- =====================================================
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. Create RLS policies
-- =====================================================

-- Only admins and superadmins can view security events
CREATE POLICY "Admins can view security events"
  ON security_events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'superadmin')
    )
  );

-- Only service role can insert security events (from Edge Functions)
CREATE POLICY "Service role can insert security events"
  ON security_events
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- =====================================================
-- 5. Add comments for documentation
-- =====================================================
COMMENT ON TABLE security_events IS 'Comprehensive security event logging for monitoring and incident response';
COMMENT ON COLUMN security_events.event_type IS 'Type of security event (e.g., CALLBACK_SIGNATURE_FAIL, RATE_LIMIT_EXCEEDED)';
COMMENT ON COLUMN security_events.severity IS 'Severity level: low, medium, high, critical';
COMMENT ON COLUMN security_events.source_ip IS 'Source IP address of the request';
COMMENT ON COLUMN security_events.user_id IS 'User ID if authenticated, NULL for anonymous';
COMMENT ON COLUMN security_events.endpoint IS 'API endpoint where event occurred';
COMMENT ON COLUMN security_events.details IS 'Additional event details in JSON format';
