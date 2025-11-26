-- Test Query: Verifikasi Claim Limit Implementation
-- Run these queries to test the claim limit feature

-- 1. Check constraint exists
SELECT 
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'warranty_claims'
  AND tc.constraint_name = 'warranty_claims_purchase_id_unique';

-- 2. Get eligible accounts (not yet claimed) for a user
-- Replace 'USER_ID_HERE' with actual user ID
WITH claimed_purchases AS (
  SELECT DISTINCT purchase_id
  FROM warranty_claims
  WHERE user_id = 'USER_ID_HERE'
)
SELECT 
  p.id,
  p.product_name,
  p.warranty_expires_at,
  p.status,
  p.created_at,
  CASE 
    WHEN cp.purchase_id IS NOT NULL THEN 'Already Claimed'
    ELSE 'Can Claim'
  END as claim_status
FROM purchases p
LEFT JOIN claimed_purchases cp ON cp.purchase_id = p.id
WHERE p.user_id = 'USER_ID_HERE'
  AND p.status = 'active'
  AND p.warranty_expires_at IS NOT NULL
  AND p.warranty_expires_at > NOW()
ORDER BY p.created_at DESC;

-- 3. Count eligible vs claimed accounts
SELECT 
  COUNT(*) FILTER (WHERE wc.id IS NULL) as eligible_count,
  COUNT(*) FILTER (WHERE wc.id IS NOT NULL) as claimed_count,
  COUNT(*) as total_with_warranty
FROM purchases p
LEFT JOIN warranty_claims wc ON wc.purchase_id = p.id
WHERE p.user_id = 'USER_ID_HERE'
  AND p.status = 'active'
  AND p.warranty_expires_at IS NOT NULL
  AND p.warranty_expires_at > NOW();

-- 4. Test duplicate claim prevention (should fail)
-- This will fail with unique constraint violation if run twice
-- INSERT INTO warranty_claims (user_id, purchase_id, claim_type, reason, status)
-- VALUES (
--   'USER_ID_HERE',
--   'PURCHASE_ID_HERE',
--   'replacement',
--   'test',
--   'pending'
-- );

-- 5. View all claims with purchase info
SELECT 
  wc.id as claim_id,
  wc.purchase_id,
  wc.status as claim_status,
  wc.created_at as claimed_at,
  p.product_name,
  p.warranty_expires_at
FROM warranty_claims wc
JOIN purchases p ON p.id = wc.purchase_id
WHERE wc.user_id = 'USER_ID_HERE'
ORDER BY wc.created_at DESC;
