-- ============================================
-- Migration: Add product_name, product_type, category to purchases
-- Solusi simple untuk "Unknown Product" issue
-- ============================================

-- Step 1: Add new columns to purchases table
ALTER TABLE purchases 
ADD COLUMN IF NOT EXISTS product_name TEXT,
ADD COLUMN IF NOT EXISTS product_type TEXT,
ADD COLUMN IF NOT EXISTS category TEXT;

-- Step 2: Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_purchases_product_name ON purchases(product_name);
CREATE INDEX IF NOT EXISTS idx_purchases_product_type ON purchases(product_type);
CREATE INDEX IF NOT EXISTS idx_purchases_category ON purchases(category);

-- Step 3: Populate existing data from products table
UPDATE purchases p
SET 
  product_name = prod.product_name,
  product_type = prod.product_type,
  category = prod.category
FROM products prod
WHERE p.product_id = prod.id
  AND p.product_name IS NULL;

-- Step 4: Create or replace trigger function
CREATE OR REPLACE FUNCTION set_purchase_product_info()
RETURNS TRIGGER AS $$
BEGIN
  -- Get product info from products table
  SELECT 
    product_name,
    product_type,
    category
  INTO 
    NEW.product_name,
    NEW.product_type,
    NEW.category
  FROM products
  WHERE id = NEW.product_id;
  
  -- If product not found, set to NULL (will be handled by frontend)
  IF NOT FOUND THEN
    NEW.product_name := NULL;
    NEW.product_type := NULL;
    NEW.category := NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Drop old trigger if exists
DROP TRIGGER IF EXISTS trigger_set_purchase_product_info ON purchases;

-- Step 6: Create new trigger
CREATE TRIGGER trigger_set_purchase_product_info
  BEFORE INSERT OR UPDATE OF product_id ON purchases
  FOR EACH ROW
  EXECUTE FUNCTION set_purchase_product_info();

-- ============================================
-- Verification Queries
-- ============================================

-- Check how many purchases have product_name
SELECT 
  COUNT(*) as total_purchases,
  COUNT(product_name) as with_product_name,
  COUNT(*) - COUNT(product_name) as missing_product_name,
  ROUND(100.0 * COUNT(product_name) / COUNT(*), 2) as percentage_complete
FROM purchases;

-- Check sample data
SELECT 
  id,
  product_id,
  product_name,
  product_type,
  category,
  status,
  created_at
FROM purchases
ORDER BY created_at DESC
LIMIT 10;

-- Check purchases by product type
SELECT 
  product_type,
  category,
  COUNT(*) as total,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
  COUNT(CASE WHEN status = 'claimed' THEN 1 END) as claimed
FROM purchases
WHERE product_name IS NOT NULL
GROUP BY product_type, category
ORDER BY total DESC;

-- Check if any purchases still missing product_name
SELECT 
  p.id,
  p.product_id,
  p.product_name,
  p.status,
  p.created_at,
  prod.product_name as product_name_from_join,
  CASE 
    WHEN prod.id IS NULL THEN '❌ Product deleted'
    WHEN p.product_name IS NULL THEN '⚠️ Missing product_name'
    ELSE '✅ OK'
  END as status_check
FROM purchases p
LEFT JOIN products prod ON p.product_id = prod.id
WHERE p.product_name IS NULL
ORDER BY p.created_at DESC
LIMIT 10;

-- ============================================
-- Test Trigger (Optional)
-- ============================================

-- Test insert new purchase (uncomment to test)
/*
DO $$
DECLARE
  test_user_id UUID;
  test_product_id UUID;
  test_purchase_id UUID;
BEGIN
  -- Get a test user and product
  SELECT id INTO test_user_id FROM users LIMIT 1;
  SELECT id INTO test_product_id FROM products LIMIT 1;
  
  -- Insert test purchase
  INSERT INTO purchases (
    user_id,
    product_id,
    total_price,
    status
  ) VALUES (
    test_user_id,
    test_product_id,
    100000,
    'active'
  ) RETURNING id INTO test_purchase_id;
  
  -- Check if product_name was auto-populated
  RAISE NOTICE 'Test purchase created: %', test_purchase_id;
  
  -- Show the result
  PERFORM * FROM purchases WHERE id = test_purchase_id;
  
  -- Cleanup (delete test purchase)
  DELETE FROM purchases WHERE id = test_purchase_id;
  RAISE NOTICE 'Test purchase deleted';
END $$;
*/

-- ============================================
-- Rollback (if needed)
-- ============================================

/*
-- Remove columns
ALTER TABLE purchases 
DROP COLUMN IF EXISTS product_name,
DROP COLUMN IF EXISTS product_type,
DROP COLUMN IF EXISTS category;

-- Drop indexes
DROP INDEX IF EXISTS idx_purchases_product_name;
DROP INDEX IF EXISTS idx_purchases_product_type;
DROP INDEX IF EXISTS idx_purchases_category;

-- Drop trigger and function
DROP TRIGGER IF EXISTS trigger_set_purchase_product_info ON purchases;
DROP FUNCTION IF EXISTS set_purchase_product_info();
*/
