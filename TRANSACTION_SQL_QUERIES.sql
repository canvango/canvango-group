-- ============================================
-- TRANSACTION SYNC SQL QUERIES
-- Quick Reference untuk Query yang Sering Digunakan
-- ============================================

-- ============================================
-- 1. SUMMARY QUERIES
-- ============================================

-- Lihat summary semua member (termasuk yang belum transaksi)
SELECT 
  username,
  role,
  total_transactions,
  total_accounts_purchased,
  total_spending,
  total_topup,
  pending_transactions,
  completed_transactions
FROM transaction_summary_by_member 
ORDER BY username;

-- Lihat summary untuk member tertentu
SELECT * FROM transaction_summary_by_member 
WHERE user_id = 'your-user-id-here';

-- Lihat member dengan transaksi terbanyak
SELECT 
  username, 
  total_transactions, 
  total_spending,
  total_topup
FROM transaction_summary_by_member 
WHERE total_transactions > 0
ORDER BY total_transactions DESC;

-- Lihat member yang belum pernah transaksi
SELECT 
  username, 
  email, 
  role,
  balance
FROM transaction_summary_by_member 
WHERE total_transactions = 0;

-- Lihat member dengan spending tertinggi
SELECT 
  username,
  total_spending,
  total_accounts_purchased,
  total_topup
FROM transaction_summary_by_member 
WHERE total_spending > 0
ORDER BY total_spending DESC
LIMIT 10;

-- ============================================
-- 2. DETAIL TRANSACTION QUERIES
-- ============================================

-- Lihat semua transaksi member tertentu
SELECT * FROM get_member_transactions(
  'your-user-id-here'::UUID
);

-- Lihat hanya transaksi purchase yang completed
SELECT * FROM get_member_transactions(
  'your-user-id-here'::UUID,
  'purchase',    -- transaction_type
  'completed',   -- status
  NULL,          -- date_start
  NULL,          -- date_end
  50,            -- limit
  0              -- offset
);

-- Lihat hanya transaksi topup
SELECT * FROM get_member_transactions(
  'your-user-id-here'::UUID,
  'topup',       -- transaction_type
  NULL,          -- all status
  NULL,          -- date_start
  NULL,          -- date_end
  50,            -- limit
  0              -- offset
);

-- Lihat transaksi dalam rentang tanggal
SELECT * FROM get_member_transactions(
  'your-user-id-here'::UUID,
  NULL,                                    -- all transaction_type
  NULL,                                    -- all status
  '2025-11-01 00:00:00+00'::TIMESTAMPTZ, -- date_start
  '2025-11-30 23:59:59+00'::TIMESTAMPTZ, -- date_end
  50,                                      -- limit
  0                                        -- offset
);

-- Lihat transaksi pending saja
SELECT * FROM get_member_transactions(
  'your-user-id-here'::UUID,
  NULL,          -- all transaction_type
  'pending',     -- status
  NULL,          -- date_start
  NULL,          -- date_end
  50,            -- limit
  0              -- offset
);

-- ============================================
-- 3. ANALYTICS QUERIES
-- ============================================

-- Total revenue dari semua member
SELECT 
  SUM(total_spending) as total_revenue,
  SUM(total_topup) as total_topup,
  SUM(total_accounts_purchased) as total_accounts_sold,
  COUNT(*) as total_members,
  COUNT(CASE WHEN total_transactions > 0 THEN 1 END) as active_members
FROM transaction_summary_by_member;

-- Average spending per member
SELECT 
  AVG(total_spending) as avg_spending,
  AVG(total_topup) as avg_topup,
  AVG(total_transactions) as avg_transactions
FROM transaction_summary_by_member
WHERE total_transactions > 0;

-- Member dengan pending transactions
SELECT 
  username,
  email,
  pending_transactions,
  total_transactions
FROM transaction_summary_by_member 
WHERE pending_transactions > 0
ORDER BY pending_transactions DESC;

-- Member dengan failed transactions
SELECT 
  username,
  email,
  failed_transactions,
  total_transactions
FROM transaction_summary_by_member 
WHERE failed_transactions > 0
ORDER BY failed_transactions DESC;

-- Top 10 spenders
SELECT 
  username,
  email,
  total_spending,
  total_accounts_purchased,
  total_transactions
FROM transaction_summary_by_member 
ORDER BY total_spending DESC
LIMIT 10;

-- ============================================
-- 4. COMPARISON QUERIES
-- ============================================

-- Bandingkan spending vs topup per member
SELECT 
  username,
  total_spending,
  total_topup,
  (total_topup - total_spending) as balance_difference,
  CASE 
    WHEN total_topup > total_spending THEN 'Surplus'
    WHEN total_topup < total_spending THEN 'Deficit'
    ELSE 'Balanced'
  END as balance_status
FROM transaction_summary_by_member
WHERE total_transactions > 0
ORDER BY balance_difference DESC;

-- Member dengan conversion rate tertinggi (completed vs total)
SELECT 
  username,
  total_transactions,
  completed_transactions,
  CASE 
    WHEN total_transactions > 0 
    THEN ROUND((completed_transactions::NUMERIC / total_transactions::NUMERIC) * 100, 2)
    ELSE 0 
  END as completion_rate_percent
FROM transaction_summary_by_member
WHERE total_transactions > 0
ORDER BY completion_rate_percent DESC;

-- ============================================
-- 5. ADMIN QUERIES
-- ============================================

-- Lihat semua admin dan transaksi mereka
SELECT * FROM transaction_summary_by_member 
WHERE role = 'admin'
ORDER BY username;

-- Lihat semua member dan transaksi mereka
SELECT * FROM transaction_summary_by_member 
WHERE role = 'member'
ORDER BY total_transactions DESC;

-- Member yang perlu follow-up (ada pending atau failed)
SELECT 
  username,
  email,
  pending_transactions,
  failed_transactions,
  total_transactions
FROM transaction_summary_by_member 
WHERE pending_transactions > 0 OR failed_transactions > 0
ORDER BY pending_transactions DESC, failed_transactions DESC;

-- ============================================
-- 6. TESTING QUERIES
-- ============================================

-- Test: Verifikasi semua member muncul (termasuk yang belum transaksi)
SELECT 
  COUNT(*) as total_users_in_users_table
FROM users 
WHERE role IN ('member', 'admin');

SELECT 
  COUNT(*) as total_users_in_view
FROM transaction_summary_by_member;

-- Test: Verifikasi nilai 0 untuk member tanpa transaksi
SELECT 
  username,
  total_transactions,
  total_spending,
  total_topup
FROM transaction_summary_by_member 
WHERE total_transactions = 0;

-- Test: Verifikasi perhitungan stats
SELECT 
  u.username,
  COUNT(t.id) as manual_count,
  ts.total_transactions as view_count,
  CASE 
    WHEN COUNT(t.id) = ts.total_transactions THEN 'MATCH ✓'
    ELSE 'MISMATCH ✗'
  END as verification
FROM users u
LEFT JOIN transactions t ON u.id = t.user_id
LEFT JOIN transaction_summary_by_member ts ON u.id = ts.user_id
WHERE u.role IN ('member', 'admin')
GROUP BY u.id, u.username, ts.total_transactions
ORDER BY u.username;

-- ============================================
-- 7. MAINTENANCE QUERIES
-- ============================================

-- Refresh view (jika diperlukan)
REFRESH MATERIALIZED VIEW IF EXISTS transaction_summary_by_member;
-- Note: View ini adalah regular view, bukan materialized, jadi tidak perlu refresh

-- Check view definition
SELECT pg_get_viewdef('transaction_summary_by_member', true);

-- Check function definition
SELECT pg_get_functiondef('get_member_transactions'::regproc);

-- Check permissions
SELECT 
  grantee, 
  privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'transaction_summary_by_member';

-- ============================================
-- 8. SAMPLE DATA QUERIES (untuk testing)
-- ============================================

-- Insert sample transaction untuk testing
-- CAUTION: Hanya untuk development/testing!
/*
INSERT INTO transactions (user_id, transaction_type, product_id, amount, status, payment_method, notes, completed_at)
VALUES 
  ('your-user-id-here', 'topup', NULL, 500000, 'completed', 'BCA Virtual Account', 'Test top up', NOW()),
  ('your-user-id-here', 'purchase', (SELECT id FROM products LIMIT 1), 250000, 'completed', 'Balance', 'Test purchase', NOW());
*/

-- Delete sample transactions (cleanup)
-- CAUTION: Hanya untuk development/testing!
/*
DELETE FROM transactions 
WHERE notes LIKE 'Test%' OR notes LIKE '%sample%';
*/

-- ============================================
-- 9. EXPORT QUERIES
-- ============================================

-- Export summary untuk Excel/CSV
SELECT 
  username as "Username",
  email as "Email",
  role as "Role",
  total_transactions as "Total Transaksi",
  total_accounts_purchased as "Total Akun Dibeli",
  total_spending as "Total Pengeluaran (Rp)",
  total_topup as "Total Top Up (Rp)",
  pending_transactions as "Pending",
  completed_transactions as "Completed",
  failed_transactions as "Failed"
FROM transaction_summary_by_member 
ORDER BY total_transactions DESC;

-- Export detail transactions untuk member tertentu
SELECT 
  transaction_type as "Tipe",
  product_name as "Produk",
  amount as "Jumlah (Rp)",
  status as "Status",
  payment_method as "Metode Bayar",
  created_at as "Tanggal",
  notes as "Catatan"
FROM get_member_transactions('your-user-id-here'::UUID)
ORDER BY created_at DESC;

-- ============================================
-- NOTES:
-- - Replace 'your-user-id-here' dengan UUID user yang sebenarnya
-- - Semua query sudah dioptimasi untuk performa
-- - View dan function sudah di-grant ke role 'authenticated'
-- - RLS tetap berlaku pada tabel transactions
-- ============================================
