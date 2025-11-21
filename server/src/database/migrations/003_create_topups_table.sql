-- Migration: Create TopUps table
-- Version: 003
-- Description: TopUps table for tracking balance top-up requests

CREATE TABLE IF NOT EXISTS topups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED')),
  transaction_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_topups_user_id ON topups(user_id);
CREATE INDEX IF NOT EXISTS idx_topups_status ON topups(status);

-- Create trigger for updated_at
CREATE TRIGGER update_topups_updated_at BEFORE UPDATE ON topups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
