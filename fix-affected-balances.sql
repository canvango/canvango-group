-- Script untuk Fix Saldo User yang Terdampak Double Topup Bug
-- JALANKAN DENGAN HATI-HATI!

-- ============================================================================
-- STEP 1: AUDIT - Cek user yang terdampak
-- ============================================================================

-- Cek semua user dengan transaksi topup completed
SELECT 
  u.id,
  u.email,
  u.balance as current_balance,
  -- Hitung saldo yang seharusnya
  COALESCE(SUM(
    CASE 
      WHEN t.transaction_type = 'topup' THEN t.amount
      WHEN t.transaction_type = 'purchase' THEN -t.amount
      ELSE 0
    END
  ), 0) as calculated_balance,
  -- Selisih (jika positif = kelebihan saldo)
  u.balance - COALESCE(SUM(
    CASE 
      WHEN t.transaction_type = 'topup' THEN t.amount
      WHEN t.transaction_type = 'purchase' THEN -t.amount
      ELSE 0
    END
  ), 0) as difference
FROM users u
LEFT JOIN transactions t ON t.user_id = u.id AND t.status = 'completed'
GROUP BY u.id, u.email, u.balance
HAVING u.balance != COALESCE(SUM(
  CASE 
    WHEN t.transaction_type = 'topup' THEN t.amount
    WHEN t.transaction_type = 'purchase' THEN -t.amount
    ELSE 0
  END
), 0)
ORDER BY difference DESC;

-- ============================================================================
-- STEP 2: DETAIL - Cek transaksi user admin1 (contoh)
-- ============================================================================

-- User admin1 yang terdampak
SELECT 
  t.id,
  t.transaction_type,
  t.amount,
  t.tripay_amount,
  t.tripay_fee,
  t.status,
  t.created_at,
  t.completed_at
FROM transactions t
WHERE t.user_id = '4565ef2e-575e-4973-8e61-c9af5c9c8622'
  AND t.status = 'completed'
ORDER BY t.created_at ASC;

-- Expected balance: 10.000
-- Current balance: 19.180
-- Difference: 9.180 (kelebihan)

-- ============================================================================
-- STEP 3: FIX - Koreksi saldo user yang terdampak
-- ============================================================================

-- OPTION A: Fix manual untuk user admin1
-- HANYA JALANKAN JIKA SUDAH YAKIN!
/*
UPDATE users
SET 
  balance = 10000.00,  -- Saldo yang benar
  updated_at = NOW()
WHERE id = '4565ef2e-575e-4973-8e61-c9af5c9c8622'
  AND balance = 19180.00;  -- Safety check: hanya update jika saldo masih 19180

-- Verify
SELECT id, email, balance FROM users WHERE id = '4565ef2e-575e-4973-8e61-c9af5c9c8622';
*/

-- OPTION B: Fix otomatis untuk semua user yang terdampak
-- HANYA JALANKAN JIKA SUDAH YAKIN!
/*
WITH calculated_balances AS (
  SELECT 
    u.id,
    u.balance as current_balance,
    COALESCE(SUM(
      CASE 
        WHEN t.transaction_type = 'topup' THEN t.amount
        WHEN t.transaction_type = 'purchase' THEN -t.amount
        ELSE 0
      END
    ), 0) as correct_balance
  FROM users u
  LEFT JOIN transactions t ON t.user_id = u.id AND t.status = 'completed'
  GROUP BY u.id, u.balance
  HAVING u.balance != COALESCE(SUM(
    CASE 
      WHEN t.transaction_type = 'topup' THEN t.amount
      WHEN t.transaction_type = 'purchase' THEN -t.amount
      ELSE 0
    END
  ), 0)
)
UPDATE users u
SET 
  balance = cb.correct_balance,
  updated_at = NOW()
FROM calculated_balances cb
WHERE u.id = cb.id;

-- Verify all users
SELECT 
  u.id,
  u.email,
  u.balance as current_balance,
  COALESCE(SUM(
    CASE 
      WHEN t.transaction_type = 'topup' THEN t.amount
      WHEN t.transaction_type = 'purchase' THEN -t.amount
      ELSE 0
    END
  ), 0) as calculated_balance
FROM users u
LEFT JOIN transactions t ON t.user_id = u.id AND t.status = 'completed'
GROUP BY u.id, u.email, u.balance
ORDER BY u.email;
*/

-- ============================================================================
-- STEP 4: AUDIT LOG - Catat koreksi saldo
-- ============================================================================

-- Insert audit log untuk koreksi saldo
/*
INSERT INTO audit_logs (
  admin_id,
  action,
  resource,
  resource_id,
  details,
  created_at
)
SELECT 
  NULL, -- System action
  'UPDATE',
  'users',
  u.id,
  jsonb_build_object(
    'reason', 'Fix double topup bug',
    'old_balance', u.balance,
    'new_balance', cb.correct_balance,
    'difference', u.balance - cb.correct_balance,
    'fixed_at', NOW()
  ),
  NOW()
FROM users u
JOIN calculated_balances cb ON cb.id = u.id
WHERE u.balance != cb.correct_balance;
*/

-- ============================================================================
-- NOTES
-- ============================================================================

-- 1. BACKUP DATABASE SEBELUM MENJALANKAN FIX!
-- 2. Test di development environment dulu
-- 3. Jalankan STEP 1 untuk audit dulu
-- 4. Verify hasil STEP 1 sebelum lanjut ke STEP 3
-- 5. Uncomment STEP 3 (OPTION A atau B) untuk fix
-- 6. Jalankan STEP 4 untuk audit log
-- 7. Verify semua user setelah fix

-- ============================================================================
-- PREVENTION
-- ============================================================================

-- Bug sudah difix di:
-- - supabase/functions/tripay-callback/index.ts
-- - Deployed: 2025-12-01

-- Monitoring query (jalankan berkala):
SELECT 
  COUNT(*) as affected_users,
  SUM(u.balance - COALESCE(SUM(
    CASE 
      WHEN t.transaction_type = 'topup' THEN t.amount
      WHEN t.transaction_type = 'purchase' THEN -t.amount
      ELSE 0
    END
  ), 0)) as total_difference
FROM users u
LEFT JOIN transactions t ON t.user_id = u.id AND t.status = 'completed'
GROUP BY u.id, u.balance
HAVING u.balance != COALESCE(SUM(
  CASE 
    WHEN t.transaction_type = 'topup' THEN t.amount
    WHEN t.transaction_type = 'purchase' THEN -t.amount
    ELSE 0
  END
), 0);
