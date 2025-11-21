-- ============================================
-- Fix: Update existing purchases dengan product_name
-- Untuk mengatasi "Unknown Product" di warranty claims
-- ============================================

-- Step 1: Check berapa banyak purchases yang perlu diupdate
SELECT 
  COUNT(*) as total_purchases_without_product_name,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_purchases,
  COUNT(CASE WHEN status = 'claimed' THEN 1 END) as claimed_purchases
FROM purchases p
WHERE (p.account_details->>'product_name') IS NULL;

-- Step 2: Preview data yang akan diupdate (10 records pertama)
SELECT 
  p.id,
  p.product_id,
  p.status,
  p.created_at,
  p.account_details->>'product_name' as current_product_name,
  prod.product_name as new_product_name,
  prod.product_type as new_product_type,
  prod.category as new_category
FROM purchases p
JOIN products prod ON p.product_id = prod.id
WHERE (p.account_details->>'product_name') IS NULL
ORDER BY p.created_at DESC
LIMIT 10;

-- Step 3: Backup data sebelum update (PENTING!)
-- Uncomment untuk create backup table
/*
CREATE TABLE IF NOT EXISTS purchases_backup_20251120 AS
SELECT * FROM purchases
WHERE (account_details->>'product_name') IS NULL;

SELECT COUNT(*) as backed_up_records FROM purchases_backup_20251120;
*/

-- Step 4: Update purchases dengan product_name, product_type, dan category
-- HATI-HATI: Ini akan mengubah data!
-- Uncomment untuk execute update
/*
UPDATE purchases p
SET account_details = jsonb_set(
  jsonb_set(
    jsonb_set(
      COALESCE(p.account_details, '{}'::jsonb),
      '{product_name}',
      to_jsonb(prod.product_name)
    ),
    '{product_type}',
    to_jsonb(prod.product_type)
  ),
  '{category}',
  to_jsonb(prod.category)
)
FROM products prod
WHERE p.product_id = prod.id
  AND (p.account_details->>'product_name') IS NULL;
*/

-- Step 5: Verify update berhasil
SELECT 
  COUNT(*) as total_purchases,
  COUNT(CASE WHEN (account_details->>'product_name') IS NOT NULL THEN 1 END) as with_product_name,
  COUNT(CASE WHEN (account_details->>'product_name') IS NULL THEN 1 END) as still_missing,
  ROUND(
    100.0 * COUNT(CASE WHEN (account_details->>'product_name') IS NOT NULL THEN 1 END) / COUNT(*),
    2
  ) as percentage_complete
FROM purchases;

-- Step 6: Check specific purchases yang masih bermasalah (orphaned)
SELECT 
  p.id,
  p.product_id,
  p.status,
  p.created_at,
  p.account_details,
  prod.product_name,
  CASE 
    WHEN prod.id IS NULL THEN 'Product deleted/not found'
    ELSE 'OK'
  END as issue
FROM purchases p
LEFT JOIN products prod ON p.product_id = prod.id
WHERE (p.account_details->>'product_name') IS NULL
ORDER BY p.created_at DESC
LIMIT 10;

-- Step 7: Check warranty claims yang terpengaruh
SELECT 
  wc.id as claim_id,
  wc.status as claim_status,
  wc.created_at as claim_created,
  p.id as purchase_id,
  p.account_details->>'product_name' as product_name_in_details,
  pr.product_name as product_name_from_join,
  CASE 
    WHEN p.account_details->>'product_name' IS NOT NULL THEN '✅ Fixed'
    WHEN pr.product_name IS NOT NULL THEN '⚠️ Can use JOIN'
    ELSE '❌ No product info'
  END as status
FROM warranty_claims wc
JOIN purchases p ON wc.purchase_id = p.id
LEFT JOIN products pr ON p.product_id = pr.id
ORDER BY wc.created_at DESC
LIMIT 20;

-- Step 8: Statistics by product type
SELECT 
  prod.product_type,
  prod.category,
  COUNT(*) as total_purchases,
  COUNT(CASE WHEN (p.account_details->>'product_name') IS NOT NULL THEN 1 END) as with_product_name,
  COUNT(CASE WHEN (p.account_details->>'product_name') IS NULL THEN 1 END) as without_product_name
FROM purchases p
JOIN products prod ON p.product_id = prod.id
GROUP BY prod.product_type, prod.category
ORDER BY without_product_name DESC;

-- ============================================
-- ROLLBACK (jika diperlukan)
-- ============================================
/*
-- Restore dari backup
UPDATE purchases p
SET account_details = b.account_details
FROM purchases_backup_20251120 b
WHERE p.id = b.id;

-- Verify rollback
SELECT COUNT(*) FROM purchases 
WHERE (account_details->>'product_name') IS NULL;
*/

-- ============================================
-- CLEANUP (setelah verify berhasil)
-- ============================================
/*
-- Drop backup table setelah yakin fix berhasil
DROP TABLE IF EXISTS purchases_backup_20251120;
*/
