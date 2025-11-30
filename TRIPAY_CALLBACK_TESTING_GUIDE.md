# TriPay Callback Testing Guide

## Problem dengan Test Script

Test script lokal gagal karena `TRIPAY_PRIVATE_KEY` di Edge Function secrets mungkin berbeda dengan yang kita gunakan untuk generate signature.

## Solusi: Gunakan TriPay Callback Tester Resmi

TriPay menyediakan tool untuk test callback dengan signature yang benar.

### Method 1: Callback Tester (Sandbox)

**URL:** https://tripay.co.id/simulator/console/callback

**Steps:**
1. Login ke TriPay Sandbox
2. Buka Callback Tester
3. Pilih transaksi yang sudah ada (atau buat baru)
4. Klik "Send Callback"
5. Lihat response dari Edge Function

**Expected Response:**
```json
{
  "success": false,
  "message": "Transaction not found"
}
```

Ini normal karena transaksi tidak ada di database kita. Yang penting signature verified!

### Method 2: Callback Tester (Production)

**URL:** https://tripay.co.id/member/developer/callback-tester

**Steps:**
1. Login ke TriPay Production
2. Go to Developer → Callback Tester
3. Select a transaction
4. Click "Test Callback"
5. Check response

### Method 3: Real Transaction Test

**Best way to test end-to-end:**

1. **Update Callback URL first:**
   ```
   https://gpittnsfzgkdbqnccncn.supabase.co/functions/v1/tripay-callback
   ```

2. **Create transaction from app:**
   - Login as admin1
   - Go to Top Up page
   - Create Rp 10,000 topup
   - Select QRIS

3. **Pay the transaction:**
   - Scan QR code
   - Pay Rp 10,000

4. **Wait for callback:**
   - TriPay will send callback automatically
   - Check Edge Function logs
   - Verify balance updated

5. **Check logs:**
   ```bash
   npx supabase functions logs tripay-callback --tail
   ```

## Expected Flow

### Success Flow

```
1. User creates topup transaction
   → Transaction saved to database with status "pending"

2. User pays via QRIS
   → Payment processed by TriPay

3. TriPay sends callback
   → POST to Edge Function with signature

4. Edge Function verifies signature
   → ✅ Signature valid

5. Edge Function finds transaction
   → ✅ Transaction found in database

6. Edge Function updates transaction
   → Status: pending → completed
   → Tripay data saved

7. Edge Function updates balance
   → User balance increased

8. Edge Function returns success
   → { "success": true }

9. TriPay receives success response
   → No retry needed
   → No error email
```

### Failure Scenarios

**Scenario 1: Invalid Signature**
```
TriPay sends callback
→ Edge Function calculates signature
→ ❌ Signature mismatch
→ Return 401 Unauthorized
→ TriPay retries (max 3 times)
```

**Scenario 2: Transaction Not Found**
```
TriPay sends callback
→ ✅ Signature valid
→ ❌ Transaction not in database
→ Return 404 Not Found
→ TriPay retries (max 3 times)
```

**Scenario 3: Database Error**
```
TriPay sends callback
→ ✅ Signature valid
→ ✅ Transaction found
→ ❌ Failed to update database
→ Return 500 Internal Error
→ TriPay retries (max 3 times)
```

## Debugging

### Check Edge Function Logs

```bash
npx supabase functions logs tripay-callback --tail
```

**Look for:**
- `📥 Tripay callback received (raw)` - Callback received
- `🔐 Signature verification` - Signature check
- `✅ Signature verified` - Signature OK
- `✅ Transaction found` - Transaction exists
- `💰 Payment PAID` - Payment successful
- `✅ Balance updated successfully` - Balance updated
- `✅ Transaction updated successfully` - Transaction updated

### Check Transaction Status

```sql
SELECT 
  id,
  user_id,
  amount,
  status,
  tripay_status,
  tripay_reference,
  created_at,
  completed_at
FROM transactions
WHERE transaction_type = 'topup'
ORDER BY created_at DESC
LIMIT 5;
```

### Check User Balance

```sql
SELECT 
  email,
  balance,
  updated_at
FROM users
WHERE email = 'admin1@gmail.com';
```

## Verification Checklist

Before going live:

- [ ] Callback URL updated in TriPay dashboard
- [ ] Test with TriPay Callback Tester (signature verified)
- [ ] Create real test transaction
- [ ] Pay with QRIS
- [ ] Check Edge Function logs (no errors)
- [ ] Verify transaction status updated
- [ ] Verify balance increased
- [ ] Verify no error email from TriPay
- [ ] Test with different payment methods (optional)

## Common Issues

### Issue: Signature Verification Failed

**Possible Causes:**
1. `TRIPAY_PRIVATE_KEY` secret not set correctly
2. Using wrong private key (sandbox vs production)
3. Edge Function not using raw body

**Solution:**
```bash
# Check current secret
npx supabase secrets list

# Update secret if needed
npx supabase secrets set TRIPAY_PRIVATE_KEY=your_private_key
```

### Issue: Transaction Not Found

**Possible Causes:**
1. Transaction not created in app first
2. Wrong merchant_ref format
3. Transaction deleted/expired

**Solution:**
- Always create transaction from app before payment
- Check transaction exists in database
- Use correct merchant_ref (transaction ID)

### Issue: Balance Not Updated

**Possible Causes:**
1. RPC function `process_topup_transaction` not working
2. User not found
3. Transaction type not "topup"

**Solution:**
```sql
-- Test RPC function manually
SELECT process_topup_transaction('transaction_id_here');

-- Check if function exists
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'process_topup_transaction';
```

## Next Steps

1. **Update callback URL** in TriPay dashboard
2. **Test with Callback Tester** to verify signature
3. **Create real transaction** and pay
4. **Monitor logs** for 24 hours
5. **Confirm working** before going live

---

**Important:** Always test in Sandbox first before using Production!
