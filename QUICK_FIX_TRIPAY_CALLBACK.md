# Quick Fix: TriPay Callback

## Problem
Payment berhasil di TriPay, tapi saldo tidak bertambah.

## ✅ Fixed & Deployed!

Edge Function sudah diperbaiki dan di-deploy dengan signature verification yang benar.

## Solution (5 menit)

### Step 1: Update Callback URL di TriPay

1. Login: https://tripay.co.id/member/setting/callback
2. Merchant: **Canvango Group (T47159)**
3. Ganti Callback URL ke:
   ```
   https://gpittnsfzgkdbqnccncn.supabase.co/functions/v1/tripay-callback
   ```
4. Save

**Note:** Edge Function sudah menggunakan raw JSON body untuk signature verification (sesuai dokumentasi TriPay)

### Step 2: Test Transaksi Baru

1. Buat topup Rp 10.000
2. Bayar dengan QRIS
3. Tunggu 1-2 menit
4. Cek saldo bertambah ✅

### Step 3: Manual Top-up (Opsional)

Untuk transaksi yang sudah dibayar tapi gagal:

```sql
-- Check balance
SELECT email, balance FROM users WHERE email = 'admin1@gmail.com';

-- Add balance
UPDATE users 
SET balance = balance + 10000 
WHERE email = 'admin1@gmail.com';
```

## Verification

```bash
# Check logs
npx supabase functions logs tripay-callback --tail
```

Look for:
- ✅ "Signature verified"
- ✅ "Payment PAID"
- ✅ "Balance updated successfully"

## Done!

Semua transaksi topup berikutnya akan otomatis update saldo.

---

**Files:**
- Full guide: `TRIPAY_CALLBACK_ISSUE_SUMMARY.md`
- Manual SQL: `manual-topup-admin1.sql`
