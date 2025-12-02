-- Fix Payment Channel Groups
-- Set correct group_name for payment channels to enable proper grouping in UI

-- Update QRIS to E-Wallet group
UPDATE tripay_payment_channels
SET group_name = 'E-Wallet'
WHERE code = 'QRIS2';

-- Update Virtual Accounts to Virtual Account group
UPDATE tripay_payment_channels
SET group_name = 'Virtual Account'
WHERE code IN ('BCAVA', 'BNIVA', 'BRIVA', 'BSIVA', 'MANDIRIVA');

-- Verify the changes
SELECT code, name, group_name 
FROM tripay_payment_channels 
WHERE is_enabled = true 
ORDER BY group_name, name;
