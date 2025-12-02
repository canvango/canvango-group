-- Migration: Enhanced RLS Policies for Security
-- Description: Implement strict RLS policies for encrypted data access
-- Date: 2024-12-02

-- =====================================================
-- 1. Drop existing policies on product_accounts
-- =====================================================
DROP POLICY IF EXISTS "Admin full access to product_accounts" ON product_accounts;
DROP POLICY IF EXISTS "Users can view their purchased accounts" ON product_accounts;

-- =====================================================
-- 2. Create superadmin-only access policy
-- =====================================================
CREATE POLICY "Superadmin full access to product_accounts"
  ON product_accounts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'superadmin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'superadmin'
    )
  );

-- =====================================================
-- 3. Create user access policy for purchased accounts
-- =====================================================
CREATE POLICY "Users can view their purchased accounts"
  ON product_accounts
  FOR SELECT
  TO authenticated
  USING (
    assigned_to_transaction_id IN (
      SELECT id FROM transactions
      WHERE user_id = auth.uid()
      AND status = 'completed'
    )
  );

-- =====================================================
-- 4. Enhanced RLS policies for transactions
-- =====================================================
DROP POLICY IF EXISTS "Users view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can view/create own transactions" ON transactions;

-- Users can view their own transactions
CREATE POLICY "Users view own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can create their own transactions
CREATE POLICY "Users create own transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Admins and superadmins can view all transactions
CREATE POLICY "Admins view all transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'superadmin')
    )
  );

-- Admins and superadmins can update transactions
CREATE POLICY "Admins update transactions"
  ON transactions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'superadmin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'superadmin')
    )
  );

-- =====================================================
-- 5. Enhanced RLS policies for users table
-- =====================================================
DROP POLICY IF EXISTS "Users can view/update own profile" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;

-- Users can view their own profile
CREATE POLICY "Users view own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Users can update their own profile (limited fields)
CREATE POLICY "Users update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid() AND
    -- Prevent users from changing their own role
    role = (SELECT role FROM users WHERE id = auth.uid())
  );

-- Admins can view all users
CREATE POLICY "Admins view all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'superadmin')
    )
  );

-- Admins can update users (including role changes)
CREATE POLICY "Admins update users"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'superadmin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'superadmin')
    )
  );

-- =====================================================
-- 6. Add comments for documentation
-- =====================================================
COMMENT ON POLICY "Superadmin full access to product_accounts" ON product_accounts IS 
  'Only superadmins can access encrypted account data directly';

COMMENT ON POLICY "Users can view their purchased accounts" ON product_accounts IS 
  'Users can only view accounts they have purchased through completed transactions';

COMMENT ON POLICY "Users view own transactions" ON transactions IS 
  'Users can view their own transaction history';

COMMENT ON POLICY "Admins view all transactions" ON transactions IS 
  'Admins and superadmins can view all transactions for management purposes';
