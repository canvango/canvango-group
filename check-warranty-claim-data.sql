-- ============================================
-- SQL Query untuk Mengecek Data Warranty Claims
-- ============================================

-- 1. Cek warranty claims dengan data lengkap
SELECT 
  wc.id as claim_id,
  wc.claim_type,
  wc.status,
  wc.reason,
  wc.created_at,
  wc.purchase_id,
  wc.user_id,
  -- User info
  u.username,
  u.email,
  u.full_name,
  -- Purchase info
  p.id as purchase_id,
  p.product_id,
  p.warranty_expires_at,
  p.account_details,
  -- Product info
  pr.product_name,
  pr.product_type,
  pr.category,
  pr.price
FROM warranty_claims wc
LEFT JOIN users u ON wc.user_id = u.id
LEFT JOIN purchases p ON wc.purchase_id = p.id
LEFT JOIN products pr ON p.product_id = pr.id
WHERE wc.status = 'pending'
ORDER BY wc.created_at DESC
LIMIT 10;

-- 2. Cek warranty claims yang tidak memiliki product info (orphaned)
SELECT 
  wc.id as claim_id,
  wc.claim_type,
  wc.status,
  wc.purchase_id,
  p.product_id,
  pr.product_name,
  CASE 
    WHEN p.id IS NULL THEN 'Purchase not found'
    WHEN pr.id IS NULL THEN 'Product not found'
    ELSE 'OK'
  END as issue
FROM warranty_claims wc
LEFT JOIN purchases p ON wc.purchase_id = p.id
LEFT JOIN products pr ON p.product_id = pr.id
WHERE p.id IS NULL OR pr.id IS NULL
ORDER BY wc.created_at DESC;

-- 3. Cek warranty claims dengan data tidak lengkap
SELECT 
  wc.id as claim_id,
  wc.claim_type,
  wc.status,
  wc.created_at,
  CASE 
    WHEN wc.claim_type IS NULL THEN 'Missing claim_type'
    WHEN wc.reason IS NULL OR wc.reason = '' THEN 'Missing reason'
    WHEN wc.created_at IS NULL THEN 'Missing created_at'
    ELSE 'OK'
  END as issue
FROM warranty_claims wc
WHERE 
  wc.claim_type IS NULL 
  OR wc.reason IS NULL 
  OR wc.reason = ''
  OR wc.created_at IS NULL
ORDER BY wc.created_at DESC;

-- 4. Cek purchases yang tidak memiliki product
SELECT 
  p.id as purchase_id,
  p.user_id,
  p.product_id,
  p.warranty_expires_at,
  pr.product_name,
  CASE 
    WHEN pr.id IS NULL THEN 'Product deleted or not found'
    ELSE 'OK'
  END as status
FROM purchases p
LEFT JOIN products pr ON p.product_id = pr.id
WHERE pr.id IS NULL
LIMIT 20;

-- 5. Statistik warranty claims
SELECT 
  COUNT(*) as total_claims,
  COUNT(CASE WHEN p.id IS NULL THEN 1 END) as missing_purchase,
  COUNT(CASE WHEN pr.id IS NULL THEN 1 END) as missing_product,
  COUNT(CASE WHEN wc.claim_type IS NULL THEN 1 END) as missing_claim_type,
  COUNT(CASE WHEN wc.reason IS NULL OR wc.reason = '' THEN 1 END) as missing_reason
FROM warranty_claims wc
LEFT JOIN purchases p ON wc.purchase_id = p.id
LEFT JOIN products pr ON p.product_id = pr.id;

-- 6. Cek specific claim yang bermasalah (ganti dengan ID yang sesuai)
-- SELECT 
--   wc.*,
--   p.*,
--   pr.*
-- FROM warranty_claims wc
-- LEFT JOIN purchases p ON wc.purchase_id = p.id
-- LEFT JOIN products pr ON p.product_id = pr.id
-- WHERE wc.id = 'CLAIM_ID_HERE';

-- 7. Fix orphaned warranty claims (HATI-HATI - backup dulu!)
-- UPDATE warranty_claims
-- SET status = 'rejected',
--     admin_notes = 'Automatically rejected - Product no longer available',
--     resolved_at = NOW()
-- WHERE purchase_id IN (
--   SELECT p.id 
--   FROM purchases p
--   LEFT JOIN products pr ON p.product_id = pr.id
--   WHERE pr.id IS NULL
-- )
-- AND status IN ('pending', 'reviewing');
