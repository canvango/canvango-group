-- Migration: Create Product Account Pool Tables
-- Description: Tables for managing account pool feature
-- Date: 2025-11-19

-- =====================================================
-- 1. Create product_account_fields table
-- =====================================================
CREATE TABLE IF NOT EXISTS product_account_fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  field_name VARCHAR(100) NOT NULL,
  field_type VARCHAR(20) NOT NULL CHECK (field_type IN ('text', 'password', 'email', 'url', 'textarea')),
  is_required BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_product_account_fields_product_id 
  ON product_account_fields(product_id);

-- =====================================================
-- 2. Create product_accounts table
-- =====================================================
CREATE TABLE IF NOT EXISTS product_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  account_data JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'sold', 'claimed', 'replaced')),
  assigned_to_transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  assigned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_product_accounts_product_id 
  ON product_accounts(product_id);

CREATE INDEX IF NOT EXISTS idx_product_accounts_status 
  ON product_accounts(product_id, status);

CREATE INDEX IF NOT EXISTS idx_product_accounts_transaction 
  ON product_accounts(assigned_to_transaction_id);

-- =====================================================
-- 3. Create updated_at trigger function (if not exists)
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. Add triggers for updated_at
-- =====================================================
DROP TRIGGER IF EXISTS update_product_account_fields_updated_at ON product_account_fields;
CREATE TRIGGER update_product_account_fields_updated_at
  BEFORE UPDATE ON product_account_fields
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_accounts_updated_at ON product_accounts;
CREATE TRIGGER update_product_accounts_updated_at
  BEFORE UPDATE ON product_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. Add RLS (Row Level Security) policies
-- =====================================================

-- Enable RLS
ALTER TABLE product_account_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_accounts ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY "Admin full access to product_account_fields"
  ON product_account_fields
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admin full access to product_accounts"
  ON product_accounts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Users can view their purchased accounts
CREATE POLICY "Users can view their purchased accounts"
  ON product_accounts
  FOR SELECT
  TO authenticated
  USING (
    assigned_to_transaction_id IN (
      SELECT id FROM transactions
      WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- 6. Add comments for documentation
-- =====================================================
COMMENT ON TABLE product_account_fields IS 'Defines the structure/fields for accounts in the pool';
COMMENT ON TABLE product_accounts IS 'Stores actual account data for products';

COMMENT ON COLUMN product_accounts.account_data IS 'JSONB field containing all account credentials and info';
COMMENT ON COLUMN product_accounts.status IS 'available: ready to sell, sold: assigned to transaction, claimed: warranty claimed, replaced: replacement account';
COMMENT ON COLUMN product_accounts.assigned_to_transaction_id IS 'Transaction ID when account is sold';
COMMENT ON COLUMN product_accounts.assigned_at IS 'Timestamp when account was assigned to transaction';
