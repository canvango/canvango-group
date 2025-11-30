-- Manual Top-up for admin1@gmail.com
-- Transaction: T4715928751370JMVQX (Rp 10,000)
-- Reason: Callback failed, payment already completed in TriPay

-- Step 1: Check current balance
SELECT 
  id,
  email,
  balance,
  role
FROM users 
WHERE email = 'admin1@gmail.com';

-- Step 2: Add balance (UNCOMMENT TO EXECUTE)
-- UPDATE users 
-- SET 
--   balance = balance + 10000,
--   updated_at = NOW()
-- WHERE email = 'admin1@gmail.com';

-- Step 3: Create transaction record (UNCOMMENT TO EXECUTE)
-- INSERT INTO transactions (
--   id,
--   user_id,
--   transaction_type,
--   amount,
--   status,
--   tripay_reference,
--   tripay_merchant_ref,
--   tripay_status,
--   tripay_paid_at,
--   completed_at,
--   created_at,
--   updated_at
-- )
-- SELECT 
--   gen_random_uuid(),
--   id,
--   'topup',
--   10000,
--   'completed',
--   'T4715928751370JMVQX',
--   'TXN-1764497174322-8g7123wm5',
--   'PAID',
--   NOW(),
--   NOW(),
--   NOW(),
--   NOW()
-- FROM users
-- WHERE email = 'admin1@gmail.com';

-- Step 4: Verify balance updated
-- SELECT 
--   email,
--   balance,
--   updated_at
-- FROM users 
-- WHERE email = 'admin1@gmail.com';

-- Step 5: Verify transaction created
-- SELECT 
--   id,
--   transaction_type,
--   amount,
--   status,
--   tripay_reference,
--   tripay_merchant_ref,
--   created_at,
--   completed_at
-- FROM transactions
-- WHERE tripay_reference = 'T4715928751370JMVQX';
