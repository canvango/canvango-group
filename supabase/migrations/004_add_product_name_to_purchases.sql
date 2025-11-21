-- Migration: Add product_name to purchases account_details
-- This ensures product name is always available without JOIN

-- Step 1: Update existing purchases to include product_name
UPDATE purchases p
SET account_details = 
  CASE 
    WHEN account_details IS NULL THEN 
      jsonb_build_object('product_name', prod.product_name)
    ELSE 
      account_details || jsonb_build_object('product_name', prod.product_name)
  END,
  updated_at = NOW()
FROM products prod
WHERE p.product_id = prod.id
  AND (p.account_details IS NULL OR NOT p.account_details ? 'product_name');

-- Step 2: Create function to auto-add product_name on insert
CREATE OR REPLACE FUNCTION add_product_name_to_purchase()
RETURNS TRIGGER AS $$
BEGIN
  -- Add product_name to account_details if not already present
  IF NEW.product_id IS NOT NULL THEN
    SELECT 
      CASE 
        WHEN NEW.account_details IS NULL THEN 
          jsonb_build_object('product_name', p.product_name)
        WHEN NOT NEW.account_details ? 'product_name' THEN
          NEW.account_details || jsonb_build_object('product_name', p.product_name)
        ELSE
          NEW.account_details
      END
    INTO NEW.account_details
    FROM products p
    WHERE p.id = NEW.product_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create trigger to run on INSERT and UPDATE
DROP TRIGGER IF EXISTS trigger_add_product_name ON purchases;
CREATE TRIGGER trigger_add_product_name
  BEFORE INSERT OR UPDATE OF product_id ON purchases
  FOR EACH ROW
  EXECUTE FUNCTION add_product_name_to_purchase();

-- Step 4: Verify migration
DO $$
DECLARE
  total_purchases INTEGER;
  purchases_with_product_name INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_purchases FROM purchases WHERE product_id IS NOT NULL;
  SELECT COUNT(*) INTO purchases_with_product_name FROM purchases WHERE account_details ? 'product_name';
  
  RAISE NOTICE 'Migration completed:';
  RAISE NOTICE '  Total purchases with product_id: %', total_purchases;
  RAISE NOTICE '  Purchases with product_name in account_details: %', purchases_with_product_name;
  
  IF total_purchases != purchases_with_product_name THEN
    RAISE WARNING 'Some purchases may not have product_name. Please investigate.';
  END IF;
END $$;
