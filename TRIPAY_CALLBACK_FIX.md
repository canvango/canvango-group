# TriPay Callback Fix - Urgent Action Required

## Problem

Callback dari TriPay gagal dengan error **HTTP 307 (Temporary Redirect)**:
- Payment berhasil di TriPay
- Saldo admin tidak bertambah
- Transaksi tidak muncul di riwayat
- Email warning dari TriPay: "Callback Gagal"

## Root Cause

URL callback `https://canvango.com/api/tripay-callback` menggunakan Vercel proxy yang menyebabkan redirect loop. TriPay tidak bisa follow redirect dan callback gagal.

## Solution

**Gunakan URL Supabase Edge Function langsung** (tanpa proxy):

```
https://gpittnsfzgkdbqnccncn.supabase.co/functions/v1/tripay-callback
```

## Action Required

### 1. Update TriPay Dashboard

Login ke TriPay dashboard dan update **Callback URL**:

**Sandbox:**
- URL: `https://gpittnsfzgkdbqnccncn.supabase.co/functions/v1/tripay-callback`
- Merchant: Canvango Group (T47159)

**Production (nanti):**
- URL: `https://gpittnsfzgkdbqnccncn.supabase.co/functions/v1/tripay-callback`
- Merchant: [Production merchant code]

### 2. Test Callback

Setelah update URL, test dengan transaksi baru:

1. Buat transaksi topup baru (Rp 10.000)
2. Bayar menggunakan QRIS
3. Tunggu callback dari TriPay
4. Cek saldo admin bertambah
5. Cek riwayat transaksi muncul

### 3. Verify Edge Function Logs

```bash
npx supabase functions logs tripay-callback --tail
```

Atau check di Supabase Dashboard → Edge Functions → tripay-callback → Logs

## Technical Details

### What Changed

**Before (BROKEN):**
```
TriPay → https://canvango.com/api/tripay-callback (Vercel)
       → HTTP 307 Redirect
       → ❌ FAILED
```

**After (WORKING):**
```
TriPay → https://gpittnsfzgkdbqnccncn.supabase.co/functions/v1/tripay-callback
       → Edge Function processes callback
       → Updates transaction status
       → Updates user balance
       → ✅ SUCCESS
```

### Files Modified

1. **vercel.json** - Removed broken rewrite rules
2. **api/tripay-callback.ts** - Proxy no longer needed (can be deleted)

### Why Direct URL is Better

1. **No redirect** - TriPay can reach Edge Function directly
2. **Faster** - No proxy overhead
3. **More reliable** - One less point of failure
4. **Easier debugging** - Direct logs in Supabase

## Verification Checklist

After updating callback URL in TriPay dashboard:

- [ ] Create new topup transaction
- [ ] Pay with QRIS
- [ ] Check Edge Function logs show callback received
- [ ] Verify transaction status updated to "completed"
- [ ] Verify admin balance increased
- [ ] Verify transaction appears in history
- [ ] Check no error email from TriPay

## Monitoring

### Check Edge Function Logs

```bash
npx supabase functions logs tripay-callback --tail
```

Look for:
- ✅ "Signature verified"
- ✅ "Transaction found"
- ✅ "Payment PAID - marking as completed"
- ✅ "Balance updated successfully"

### Check Transaction in Database

```sql
SELECT 
  id,
  user_id,
  transaction_type,
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

## Rollback (if needed)

If you need to rollback to proxy (not recommended):

1. Revert vercel.json changes
2. Update TriPay callback URL back to `https://canvango.com/api/tripay-callback`
3. Redeploy Vercel

But this will still have the same redirect issue!

## Next Steps

1. **Immediate:** Update callback URL in TriPay dashboard
2. **Test:** Create test transaction and verify
3. **Monitor:** Check logs for 24 hours
4. **Cleanup:** Remove unused proxy files after confirmed working

## Support

If callback still fails after updating URL:

1. Check Edge Function logs for errors
2. Verify TRIPAY_PRIVATE_KEY secret is set correctly
3. Check transaction exists in database before payment
4. Verify signature calculation matches TriPay's

---

**Status:** Ready to deploy
**Priority:** URGENT - Blocking payments
**Estimated Time:** 5 minutes to update URL
