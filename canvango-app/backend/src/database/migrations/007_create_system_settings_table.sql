-- Migration: Create System Settings table
-- Version: 007
-- Description: System settings for application configuration

CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);

-- Create trigger for updated_at
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings
INSERT INTO system_settings (key, value, description) VALUES
  ('payment_methods', '["Bank Transfer", "E-Wallet", "Credit Card", "QRIS"]', 'Available payment methods for top-up'),
  ('notification_email', '{"enabled": true, "admin_email": "admin@canvango.com"}', 'Email notification settings'),
  ('notification_system', '{"enabled": true, "show_alerts": true}', 'System notification settings'),
  ('maintenance_mode', '{"enabled": false, "message": "System under maintenance"}', 'Maintenance mode configuration')
ON CONFLICT (key) DO NOTHING;
