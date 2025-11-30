# Manual Process Paid Transaction

## Problem

Transaksi `TXN-1764497174322-8g7123wm5` sudah PAID di TriPay tapi tidak ada di database kita. Ini terjadi karena:

1. Transaksi dibuat langsung di TriPay dashboard (bukan dari aplikasi)
2. Atau transaksi dibuat tapi gagal tersimpan di database

## Solution

Karena transaksi tidak ada di database, kita tidak bisa process callback-nya. Ada 2 opsi:

### Option 1: Refund di TriPay (Recommended)

Karena transaksi tidak ada di sistem kita, sebaiknya refund pembayaran ini:

1. Login ke TriPay dashboard
2. Cari transaksi `T4715928751370JMVQX`
3. Lakukan refund
4. Buat transaksi baru dari aplikasi

### Option 2: Manual Top-up (Quick Fix)

Jika tidak bisa refund, tambahkan saldo manual:

```sql
-- Check current balance
SELECT id, email, balance 
FROM users 
WHERE email = 'admin1@gmail.com';

-- Add balance manually (adjust user_id)
UPDATE users 
SET balance = balance + 10000,
    updated_at = NOW()
WHERE email = 'admin1@gmail.com';

-- Create transaction record for audit
INSERT INTO transactions (
  id,
  user_id,
  transaction_type,
  amount,
  status,
  tripay_reference,
  tripay_merchant_ref,
  tripay_status,
  completed_at,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  id,
  'topup',
  10000,
  'completed',
  'T4715928751370JMVQX',
  'TXN-1764497174322-8g7123wm5',
  'PAID',
  NOW(),
  NOW(),
  NOW()
FROM users
WHERE email = 'admin1@gmail.com';
```

## Prevention

Untuk mencegah masalah ini di masa depan:

1. **Always create transaction from app first** - Jangan buat transaksi langsung di TriPay
2. **Update callback URL** - Gunakan URL Supabase langsung (lihat TRIPAY_CALLBACK_FIX.md)
3. **Monitor logs** - Check Edge Function logs regularly

## Verification

After manual top-up:

```sql
-- Verify balance updated
SELECT email, balance 
FROM users 
WHERE email = 'admin1@gmail.com';

-- Verify transaction created
SELECT 
  id,
  transaction_type,
  amount,
  status,
  tripay_reference,
  created_at
FROM transactions
WHERE tripay_reference = 'T4715928751370JMVQX';
```

## Next Transaction

For next topup transaction:

1. **Update callback URL first** (see TRIPAY_CALLBACK_FIX.md)
2. Create transaction from app (Top Up page)
3. Pay using QRIS
4. Wait for callback
5. Verify balance updated automatically

---

**Important:** This is a one-time manual fix. After updating callback URL, all future transactions will be processed automatically.
