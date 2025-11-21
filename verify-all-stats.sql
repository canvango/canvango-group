-- ============================================
-- COMPLETE STATS VERIFICATION QUERY
-- Run this in Supabase SQL Editor to verify all dashboard data
-- ============================================

-- 1. ADMIN DASHBOARD OVERVIEW
SELECT '=== ADMIN DASHBOARD OVERVIEW ===' as section;

SELECT 
  'Total Users' as metric,
  COUNT(*) as value
FROM users
UNION ALL
SELECT 
  'Admin Users',
  COUNT(*) FROM users WHERE role = 'admin'
UNION ALL
SELECT 
  'Member Users',
  COUNT(*) FROM users WHERE role = 'member'
UNION ALL
SELECT 
  'Total Transactions',
  COUNT(*) FROM transactions
UNION ALL
SELECT 
  'Completed Transactions',
  COUNT(*) FROM transactions WHERE status = 'completed'
UNION ALL
SELECT 
  'Pending Transactions',
  COUNT(*) FROM transactions WHERE status = 'pending'
UNION ALL
SELECT 
  'Total Revenue (IDR)',
  SUM(amount) FROM transactions WHERE status = 'completed'
UNION ALL
SELECT 
  'Total Products',
  COUNT(*) FROM products
UNION ALL
SELECT 
  'Available Products',
  COUNT(*) FROM products WHERE stock_status = 'available'
UNION ALL
SELECT 
  'Pending Claims',
  COUNT(*) FROM warranty_claims WHERE status IN ('pending', 'reviewing')
UNION ALL
SELECT 
  'Approved Claims',
  COUNT(*) FROM warranty_claims WHERE status = 'approved'
UNION ALL
SELECT 
  'Total Tutorials',
  COUNT(*) FROM tutorials
UNION ALL
SELECT 
  'Total Tutorial Views',
  COALESCE(SUM(view_count), 0) FROM tutorials;

-- 2. BM ACCOUNT STATISTICS
SELECT '' as blank, '' as blank2;
SELECT '=== BM ACCOUNT STATISTICS ===' as section, '' as blank;

WITH bm_products AS (
  SELECT id FROM products WHERE product_type = 'bm_account'
),
bm_transactions AS (
  SELECT * FROM transactions 
  WHERE product_id IN (SELECT id FROM bm_products)
    AND transaction_type = 'purchase'
)
SELECT 
  'Total BM Products' as metric,
  (SELECT COUNT(*) FROM bm_products)::text as value
UNION ALL
SELECT 
  'Available BM Accounts (Stock)',
  (SELECT COUNT(*) FROM product_accounts 
   WHERE product_id IN (SELECT id FROM bm_products) 
   AND status = 'available')::text
UNION ALL
SELECT 
  'Total BM Transactions',
  (SELECT COUNT(*) FROM bm_transactions)::text
UNION ALL
SELECT 
  'Completed BM Transactions',
  (SELECT COUNT(*) FROM bm_transactions WHERE status = 'completed')::text
UNION ALL
SELECT 
  'Pending BM Transactions',
  (SELECT COUNT(*) FROM bm_transactions WHERE status = 'pending')::text
UNION ALL
SELECT 
  'Success Rate (%)',
  ROUND((SELECT COUNT(*)::numeric FROM bm_transactions WHERE status = 'completed') / 
        NULLIF((SELECT COUNT(*) FROM bm_transactions), 0) * 100, 1)::text
UNION ALL
SELECT 
  'Sold This Month',
  (SELECT COUNT(*) FROM bm_transactions 
   WHERE status = 'completed' 
   AND created_at >= date_trunc('month', CURRENT_DATE))::text
UNION ALL
SELECT 
  'BM Revenue (IDR)',
  (SELECT SUM(amount) FROM bm_transactions WHERE status = 'completed')::text;

-- 3. PRODUCT PERFORMANCE BY TYPE
SELECT '' as blank, '' as blank2;
SELECT '=== PRODUCT PERFORMANCE ===' as section, '' as blank;

SELECT 
  p.product_type,
  COUNT(t.id) as transactions,
  SUM(t.amount) as total_revenue,
  ROUND(AVG(t.amount)::numeric, 0) as avg_amount
FROM transactions t
JOIN products p ON t.product_id = p.id
WHERE t.transaction_type = 'purchase'
GROUP BY p.product_type
ORDER BY transactions DESC;

-- 4. TRANSACTION STATUS BREAKDOWN
SELECT '' as blank, '' as blank2;
SELECT '=== TRANSACTION STATUS ===' as section, '' as blank;

SELECT 
  status,
  COUNT(*) as count,
  SUM(amount) as total_amount
FROM transactions
GROUP BY status
ORDER BY count DESC;

-- 5. WARRANTY CLAIMS STATUS
SELECT '' as blank, '' as blank2;
SELECT '=== WARRANTY CLAIMS ===' as section, '' as blank;

SELECT 
  status,
  COUNT(*) as count
FROM warranty_claims
GROUP BY status
ORDER BY count DESC;
