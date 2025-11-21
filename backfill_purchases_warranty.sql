-- Backfill Script: Create purchases records for old transactions
-- This script creates purchase records with warranty for transactions that don't have them yet

-- Step 1: Check how many transactions need backfill
SELECT 
  COUNT(*) as total_transactions_without_purchases,
  COUNT(DISTINCT t.user_id) as affected_users
FROM transactions t
WHERE t.transaction_type = 'purchase'
  AND t.status = 'completed'
  AND NOT EXISTS (
    SELECT 1 FROM purchases pur WHERE pur.transaction_id = t.id
  );

-- Step 2: Preview what will be created
SELECT 
  t.id as transaction_id,
  t.user_id,
  t.product_id,
  p.product_name,
  t.amount,
  t.created_at as purchase_date,
  p.warranty_duration,
  p.warranty_enabled,
  CASE 
    WHEN p.warranty_enabled THEN t.created_at + (p.warranty_duration || ' days')::INTERVAL
    ELSE NULL
  END as calculated_warranty_expires_at,
  pa.id as product_account_id,
  pa.account_data
FROM transactions t
JOIN products p ON t.product_id = p.id
LEFT JOIN product_accounts pa ON pa.assigned_to_transaction_id = t.id
WHERE t.transaction_type = 'purchase'
  AND t.status = 'completed'
  AND NOT EXISTS (
    SELECT 1 FROM purchases pur WHERE pur.transaction_id = t.id
  )
ORDER BY t.created_at DESC
LIMIT 10;

-- Step 3: Execute backfill (UNCOMMENT TO RUN)
/*
INSERT INTO purchases (
  user_id,
  transaction_id,
  product_id,
  quantity,
  unit_price,
  total_price,
  account_details,
  warranty_expires_at,
  status,
  created_at,
  updated_at
)
SELECT 
  t.user_id,
  t.id as transaction_id,
  t.product_id,
  1 as quantity,
  t.amount as unit_price,
  t.amount as total_price,
  pa.account_data as account_details,
  CASE 
    WHEN p.warranty_enabled THEN t.created_at + (p.warranty_duration || ' days')::INTERVAL
    ELSE NULL
  END as warranty_expires_at,
  CASE
    WHEN t.created_at + (p.warranty_duration || ' days')::INTERVAL < NOW() THEN 'expired'
    ELSE 'active'
  END as status,
  t.created_at,
  NOW() as updated_at
FROM transactions t
JOIN products p ON t.product_id = p.id
LEFT JOIN product_accounts pa ON pa.assigned_to_transaction_id = t.id
WHERE t.transaction_type = 'purchase'
  AND t.status = 'completed'
  AND NOT EXISTS (
    SELECT 1 FROM purchases pur WHERE pur.transaction_id = t.id
  );
*/

-- Step 4: Verify backfill results
/*
SELECT 
  COUNT(*) as total_purchases_created,
  COUNT(CASE WHEN warranty_expires_at IS NOT NULL THEN 1 END) as with_warranty,
  COUNT(CASE WHEN warranty_expires_at IS NULL THEN 1 END) as without_warranty,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_status,
  COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_status
FROM purchases
WHERE created_at >= NOW() - INTERVAL '1 minute';
*/

-- Step 5: Test with get_member_transactions function
/*
SELECT 
  id,
  transaction_type,
  product_name,
  amount,
  status,
  purchase_id,
  warranty_expires_at,
  purchase_status,
  CASE 
    WHEN warranty_expires_at IS NULL THEN 'NO WARRANTY'
    WHEN warranty_expires_at < NOW() THEN 'EXPIRED'
    WHEN purchase_status = 'claimed' THEN 'CLAIMED'
    ELSE 'ACTIVE'
  END as warranty_status
FROM get_member_transactions(
  '57244e0a-d4b2-4499-937d-4fd71e90bc07'::UUID,  -- Replace with actual user_id
  'purchase',
  'completed',
  NULL,
  NULL,
  10,
  0
);
*/
