-- Migration: Create Tutorials table
-- Version: 005
-- Description: Tutorials table for member guides and documentation

CREATE TABLE IF NOT EXISTS tutorials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  tags TEXT[],
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tutorials_category ON tutorials(category);

-- Create trigger for updated_at
CREATE TRIGGER update_tutorials_updated_at BEFORE UPDATE ON tutorials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
