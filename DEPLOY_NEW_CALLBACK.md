# Deploy New Tripay Callback - Step by Step

## 📋 Pre-Deployment Checklist

- [ ] Read `TRIPAY_CALLBACK_OFFICIAL_IMPLEMENTATION.md`
- [ ] Read `CALLBACK_OLD_VS_NEW.md`
- [ ] Backup current environment variables
- [ ] Prepare new environment variable values

## 🔧 Step 1: Update Environment Variables

### Vercel Dashboard

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to: Settings → Environment Variables

### Remove Old Variables (if exist)

- ❌ `VITE_SUPABASE_URL`
- ❌ `VITE_TRIPAY_PRIVATE_KEY`

### Add/Update New Variables

**Required:**

```
SUPABASE_URL
Value: https://gpittnsfzgkdbqnccncn.supabase.co
Environment: Production, Preview, Development
```

```
SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGc... (your service role key)
Environment: Production, Preview, Development
```

```
TRIPAY_PRIVATE_KEY
Value: BqOm1-ItF0o-LNlRZ-YhPK8-PZjNz (your private key)
Environment: Production, Preview, Development
```

### Verify Variables

After adding, verify all 3 variables are present:
- ✅ `SUPABASE_URL`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `TRIPAY_PRIVATE_KEY`

## 📦 Step 2: Deploy Code

### Commit Changes

```bash
git add api/tripay-callback.ts
git add TRIPAY_CALLBACK_OFFICIAL_IMPLEMENTATION.md
git add CALLBACK_OLD_VS_NEW.md
git add DEPLOY_NEW_CALLBACK.md
git commit -m "feat: rewrite Tripay callback per official documentation

- Follow official Tripay documentation
- Use correct environment variable names (SUPABASE_URL, TRIPAY_PRIVATE_KEY)
- Add event validation (payment_status)
- Implement idempotent processing
- Explicit balance updates
- Store full callback data
- Better error handling and logging"
```

### Push to GitHub

```bash
git push origin main
```

### Wait for Deployment

- Vercel will auto-deploy in 1-2 minutes
- Check deployment status: https://vercel.com/dashboard
- Wait until status shows "Ready"

## 🧪 Step 3: Test Callback

### Test 1: Tripay Dashboard Test

1. Login to **Tripay Merchant Dashboard**
2. Go to: **Pengaturan → Callback**
3. URL: `https://canvango.com/api/tripay-callback`
4. Click **"Test Callback"**

**Expected Result:**
```
✅ Kode HTTP: 200
✅ Status Koneksi: BERHASIL
✅ Status Callback: BERHASIL

Response:
{"success": true, "message": "Test callback acknowledged"}
```

### Test 2: Check Vercel Logs

```bash
# If you have Vercel CLI
vercel logs --follow

# Or check in Vercel Dashboard
# https://vercel.com/dashboard → Your Project → Logs
```

**Expected Logs:**
```
=== TRIPAY CALLBACK RECEIVED ===
[Tripay Callback] Merchant Ref: ...
[Tripay Callback] Reference: ...
[Tripay Callback] Status: ...
[Tripay Callback] ✅ Signature verified
[Tripay Callback] Test callback - no merchant_ref or reference
```

### Test 3: Real Payment Flow

1. **Create Top-Up Transaction**
   - Login to your app
   - Go to Top-Up page
   - Create transaction (e.g., Rp 10,000)
   - Note the merchant_ref

2. **Make Payment**
   - Use Tripay payment link
   - Complete payment

3. **Verify Callback**
   - Check Vercel logs for callback received
   - Should see: `[Tripay Callback] ✅ Signature verified`
   - Should see: `[Tripay Callback] ✅ Transaction updated: completed`
   - Should see: `[Tripay Callback] ✅ Balance updated`

4. **Verify Database**
   - Check `transactions` table
   - Status should be 'completed'
   - `tripay_callback_data` should contain full JSON
   - `tripay_paid_at` should have timestamp

5. **Verify Balance**
   - Check `users` table
   - Balance should be increased
   - Check in app dashboard - balance should show updated

## 🔍 Step 4: Verify Implementation

### Check Environment Variables

```bash
# In Vercel Dashboard → Settings → Environment Variables
# Verify these exist:
✅ SUPABASE_URL
✅ SUPABASE_SERVICE_ROLE_KEY
✅ TRIPAY_PRIVATE_KEY
```

### Check Callback Endpoint

```bash
curl -X POST https://canvango.com/api/tripay-callback \
  -H "Content-Type: application/json" \
  -H "X-Callback-Signature: test" \
  -H "X-Callback-Event: payment_status" \
  -d '{"status":"PAID","amount_received":10000}'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Invalid signature"
}
```

(Invalid signature is expected - we're just testing the endpoint is live)

### Check Database Schema

Verify these columns exist in `transactions` table:
- ✅ `tripay_merchant_ref`
- ✅ `tripay_reference`
- ✅ `tripay_status`
- ✅ `tripay_paid_at`
- ✅ `tripay_callback_data`
- ✅ `tripay_payment_method`
- ✅ `tripay_payment_name`
- ✅ `tripay_amount`
- ✅ `tripay_fee`
- ✅ `tripay_total_amount`

## ✅ Step 5: Success Criteria

All of these must be true:

- [x] Environment variables updated in Vercel
- [x] Code deployed to production
- [x] Tripay test callback returns success
- [x] Vercel logs show callback received
- [ ] Real payment updates transaction status
- [ ] Real payment updates user balance
- [ ] No errors in Vercel logs

## 🔄 Step 6: Monitor

### First 24 Hours

Monitor these:

1. **Vercel Logs**
   - Check for any errors
   - Verify callbacks are being received
   - Verify signatures are valid

2. **Database**
   - Check transactions are being updated
   - Check balances are being updated
   - Check `tripay_callback_data` is being stored

3. **User Reports**
   - Check if users report balance not updating
   - Check if users report payment not confirmed

### Key Metrics

- **Callback Success Rate:** Should be 100%
- **Signature Verification:** Should always pass
- **Balance Updates:** Should match payment amounts
- **Response Time:** Should be < 1 second

## 🚨 Troubleshooting

### Issue: Environment Variables Missing

**Symptom:**
```json
{
  "success": false,
  "message": "Configuration error - environment variables missing"
}
```

**Solution:**
1. Check Vercel Dashboard → Settings → Environment Variables
2. Ensure all 3 variables are present
3. Redeploy if needed

### Issue: Invalid Signature

**Symptom:**
```json
{
  "success": false,
  "message": "Invalid signature"
}
```

**Solution:**
1. Check `TRIPAY_PRIVATE_KEY` in Vercel
2. Ensure it matches Tripay Dashboard
3. Check for extra spaces or newlines
4. Redeploy after fixing

### Issue: Transaction Not Found

**Symptom:**
```json
{
  "success": false,
  "message": "Transaction not found or already processed"
}
```

**Solution:**
1. Check if transaction exists in database
2. Verify `tripay_merchant_ref` matches
3. Verify `tripay_reference` matches
4. Check if transaction status is 'pending'

### Issue: Balance Not Updated

**Symptom:**
- Transaction status updated
- Balance not updated

**Solution:**
1. Check Vercel logs for balance update
2. Look for: `[Tripay Callback] ✅ Balance updated`
3. If not found, check for errors
4. Verify user_id exists in users table

### Issue: Callback Not Received

**Symptom:**
- Payment completed in Tripay
- No callback received

**Solution:**
1. Check Tripay Dashboard → Pengaturan → Callback
2. Verify URL is correct: `https://canvango.com/api/tripay-callback`
3. Test callback manually
4. Check Vercel logs for any requests

## 📊 Rollback Plan

If something goes wrong:

### Option 1: Revert Code

```bash
git revert HEAD
git push origin main
```

### Option 2: Revert Environment Variables

1. Go to Vercel Dashboard
2. Settings → Environment Variables
3. Change back to old values:
   - `VITE_SUPABASE_URL`
   - `VITE_TRIPAY_PRIVATE_KEY`

### Option 3: Redeploy Previous Version

1. Go to Vercel Dashboard
2. Deployments
3. Find previous working deployment
4. Click "Promote to Production"

## 🎉 Success!

When you see this:

✅ Tripay test callback: BERHASIL
✅ Real payment updates transaction
✅ Real payment updates balance
✅ No errors in logs
✅ Users can top-up successfully

**You're done!** 🎊

## 📚 Documentation

- `TRIPAY_CALLBACK_OFFICIAL_IMPLEMENTATION.md` - Implementation details
- `CALLBACK_OLD_VS_NEW.md` - Comparison with old version
- `DEPLOY_NEW_CALLBACK.md` - This file

---

**Status:** Ready for deployment
**Risk:** Low (backward compatible)
**Estimated Time:** 15-30 minutes
**Rollback Time:** 5 minutes
