-- Query untuk monitoring balance sync semua member
-- Gunakan query ini untuk cek apakah ada member dengan balance tidak sinkron

WITH balance_calculation AS (
  SELECT 
    user_id,
    COUNT(*) as total_transactions,
    SUM(CASE WHEN transaction_type = 'topup' AND status = 'completed' THEN amount ELSE 0 END) as total_topup,
    SUM(CASE WHEN transaction_type = 'purchase' AND status = 'completed' THEN amount ELSE 0 END) as total_purchase,
    SUM(CASE 
      WHEN transaction_type = 'topup' AND status = 'completed' THEN amount
      WHEN transaction_type = 'purchase' AND status = 'completed' THEN -amount
      ELSE 0
    END) as calculated_balance
  FROM transactions
  GROUP BY user_id
)
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.role,
  u.balance as current_balance,
  COALESCE(bc.total_transactions, 0) as total_transactions,
  COALESCE(bc.total_topup, 0) as total_topup,
  COALESCE(bc.total_purchase, 0) as total_purchase,
  COALESCE(bc.calculated_balance, 0) as calculated_balance,
  (u.balance - COALESCE(bc.calculated_balance, 0)) as difference,
  CASE 
    WHEN u.balance = COALESCE(bc.calculated_balance, 0) THEN '✅ SYNC'
    WHEN COALESCE(bc.calculated_balance, 0) < 0 AND u.balance = 0 THEN '✅ SYNC (Protected)'
    ELSE '❌ NOT SYNC'
  END as status
FROM users u
LEFT JOIN balance_calculation bc ON u.id = bc.user_id
WHERE u.role = 'member'
ORDER BY 
  CASE 
    WHEN u.balance = COALESCE(bc.calculated_balance, 0) THEN 1
    WHEN COALESCE(bc.calculated_balance, 0) < 0 AND u.balance = 0 THEN 2
    ELSE 0
  END,
  u.email;

-- Query untuk fix balance yang tidak sinkron (jika ditemukan)
-- UNCOMMENT dan jalankan jika ada yang NOT SYNC:
/*
WITH balance_calculation AS (
  SELECT 
    user_id,
    SUM(CASE 
      WHEN transaction_type = 'topup' AND status = 'completed' THEN amount
      WHEN transaction_type = 'purchase' AND status = 'completed' THEN -amount
      ELSE 0
    END) as calculated_balance
  FROM transactions
  GROUP BY user_id
)
UPDATE users u
SET balance = GREATEST(bc.calculated_balance, 0)
FROM balance_calculation bc
WHERE u.id = bc.user_id
  AND u.role = 'member'
  AND u.balance != GREATEST(bc.calculated_balance, 0)
RETURNING 
  u.id, 
  u.email, 
  u.full_name, 
  u.balance as new_balance;
*/
