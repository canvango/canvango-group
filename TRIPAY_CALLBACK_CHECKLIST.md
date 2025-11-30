# ✅ Tripay Callback Fix - Deployment Checklist

## 📋 Pre-Deployment Checklist

### Code Changes
- [x] `api/tripay-callback.ts` - Complete rewrite dengan signature verification
- [x] `.env` - Added `SUPABASE_SERVICE_ROLE_KEY`
- [x] Test scripts created (local & production)
- [x] Documentation complete

### Dependencies
- [x] `@supabase/supabase-js` - Already installed (v2.86.0)
- [x] `@vercel/node` - Already installed (v5.5.13)
- [x] `crypto` - Built-in Node.js module (no install needed)

### Configuration
- [x] `vercel.json` - Verified (no redirect issues)
- [x] No middleware interference
- [x] No Turnstile on API routes

## 🚀 Deployment Steps

### Step 1: Vercel Environment Variables

Login ke Vercel Dashboard → canvango → Settings → Environment Variables

**Add new variable:**

```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwaXR0bnNmemdrZGJxbmNjbmNuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzEwMTczMiwiZXhwIjoyMDc4Njc3NzMyfQ.9HFJDAoSEB8o82Q23mKyG9XgEmsjKDIfkpVpJUDuO0U
Environment: Production, Preview, Development
```

**Verify existing variables:**
- [ ] `VITE_SUPABASE_URL` = `https://gpittnsfzgkdbqnccncn.supabase.co`
- [ ] `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- [ ] `VITE_TRIPAY_PRIVATE_KEY` = `Fz27s-v8gGt-jDE8e-04Tbw-de1vi`
- [ ] `VITE_TRIPAY_API_KEY` = `QfvISlE5WUUu4Eyxqcj6pJ3BMsdIZgKHZyWG17ZP`
- [ ] `VITE_TRIPAY_MERCHANT_CODE` = `T47159`
- [ ] `VITE_TRIPAY_CALLBACK_URL` = `https://canvango.com/api/tripay-callback`
- [ ] `TURNSTILE_SECRET_KEY` = `0x4AAAAAACDJ0DnsHrp5rWoaR99We_g_UWU`

### Step 2: Git Commit & Push

```bash
# Check status
git status

# Add all changes
git add .

# Commit with descriptive message
git commit -m "fix: Tripay callback direct Supabase integration with HMAC-SHA256 signature verification

- Rewrite api/tripay-callback.ts for direct Supabase integration
- Add signature verification using HMAC-SHA256
- Always return HTTP 200 OK to prevent retry spam
- Remove GCP VM proxy dependency for callbacks
- Add comprehensive logging for debugging
- Auto-update balance via database trigger
- Add test scripts for local and production testing
- Add complete documentation"

# Push to trigger deployment
git push origin main
```

### Step 3: Monitor Deployment

Vercel Dashboard → Deployments

**Wait for:**
- [ ] Build: Success
- [ ] Duration: ~2-3 minutes
- [ ] Status: Ready
- [ ] URL: https://canvango.com

### Step 4: Test Callback Endpoint

**Test 1: Simple GET (Windows)**
```bash
test-callback-curl.bat production
```

**Test 1: Simple GET (Linux/Mac)**
```bash
bash test-callback-curl.sh production
```

**Test 2: Manual cURL**
```bash
curl -i https://canvango.com/api/tripay-callback
```

**Expected:**
```
HTTP/2 200
content-type: application/json

{"success":false,"message":"Method not allowed"}
```

✅ Status: 200 (NOT 307!)
✅ Content-Type: application/json (NOT text/html!)

### Step 5: Test di Tripay Dashboard

1. [ ] Login: https://tripay.co.id/member
2. [ ] Navigate: Settings → Callback URL
3. [ ] Verify URL: `https://canvango.com/api/tripay-callback`
4. [ ] Click: **Test Callback**

**Expected Result:**
```
✅ Status Koneksi: BERHASIL
✅ Status Callback: BERHASIL  
✅ Kode HTTP: 200
```

### Step 6: Verify Logs

**Vercel Logs:**
- [ ] Open: Vercel Dashboard → Logs
- [ ] Filter: `api/tripay-callback`
- [ ] Check for: "CALLBACK RECEIVED" messages

**Expected log:**
```
=== TRIPAY CALLBACK RECEIVED ===
Method: POST
Time: 2025-11-30T...
✅ Signature verified
✅ Transaction updated successfully
=== CALLBACK PROCESSED SUCCESSFULLY ===
```

## 🧪 Testing Checklist

### Local Testing (Optional)
- [ ] Start dev server: `npm run dev`
- [ ] Run test: `node test-tripay-callback-local.js`
- [ ] Check console for logs

### Production Testing
- [ ] Test GET request: Should return 200 + error message
- [ ] Test POST without signature: Should return 200 + "Missing signature"
- [ ] Test POST with invalid signature: Should return 200 + "Invalid signature"
- [ ] Test OPTIONS (CORS): Should return 200 + CORS headers
- [ ] Test from Tripay dashboard: Should return BERHASIL

### Real Transaction Testing
- [ ] Create test transaction (small amount)
- [ ] Wait for payment
- [ ] Check callback received in Vercel logs
- [ ] Verify transaction status updated in Supabase
- [ ] Verify user balance updated correctly

## 🔍 Verification Queries

### Check Recent Transactions
```sql
SELECT 
  merchant_ref,
  status,
  payment_method,
  total_amount,
  paid_at,
  updated_at
FROM transactions
ORDER BY updated_at DESC
LIMIT 10;
```

### Check Balance Updates
```sql
SELECT 
  u.email,
  u.balance,
  t.merchant_ref,
  t.status,
  t.amount,
  t.transaction_type
FROM users u
JOIN transactions t ON t.user_id = u.id
WHERE t.updated_at > NOW() - INTERVAL '1 hour'
ORDER BY t.updated_at DESC;
```

### Check Database Trigger
```sql
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_auto_update_user_balance';
```

## ⚠️ Troubleshooting

### Issue: 307 Redirect
**Solution:**
- [ ] Clear Vercel cache: Deployments → Redeploy
- [ ] Check `vercel.json` not modified
- [ ] Verify no trailing slash in URL

### Issue: 500 Internal Error
**Check:**
- [ ] `SUPABASE_SERVICE_ROLE_KEY` added to Vercel?
- [ ] `VITE_TRIPAY_PRIVATE_KEY` correct?
- [ ] Check Vercel logs for error details

### Issue: Invalid Signature
**Check:**
- [ ] Private key matches Tripay dashboard
- [ ] Production: `Fz27s-v8gGt-jDE8e-04Tbw-de1vi`
- [ ] Sandbox: `BAo71-gUqRM-IahAp-Gt8AM-IS7Iq`

### Issue: Transaction Not Updated
**Check:**
- [ ] Transaction exists in database?
- [ ] `merchant_ref` matches?
- [ ] Check Supabase logs for errors

### Issue: Balance Not Updated
**Check:**
- [ ] Database trigger exists?
- [ ] Transaction status = 'completed'?
- [ ] Transaction type = 'topup' or 'purchase'?

## 📊 Success Metrics

### Immediate Success (After Deployment)
- [x] Code deployed successfully
- [ ] No build errors
- [ ] Endpoint returns 200 OK
- [ ] Tripay dashboard test: BERHASIL

### Short-term Success (First Transaction)
- [ ] Callback received and logged
- [ ] Signature verified successfully
- [ ] Transaction status updated
- [ ] Balance updated automatically
- [ ] No errors in logs

### Long-term Success (Production)
- [ ] All callbacks processed successfully
- [ ] No 307 redirects
- [ ] No retry spam from Tripay
- [ ] Balance always accurate
- [ ] Users receive topup instantly

## 📚 Documentation Reference

- **Technical Details:** `TRIPAY_CALLBACK_FIX_COMPLETE.md`
- **Deployment Guide:** `DEPLOY_TRIPAY_CALLBACK_FIX.md`
- **Summary:** `TRIPAY_CALLBACK_SUMMARY.md`
- **This Checklist:** `TRIPAY_CALLBACK_CHECKLIST.md`

## 🎯 Final Verification

Before marking as complete, verify:

- [ ] All code changes committed and pushed
- [ ] Vercel deployment successful
- [ ] Environment variables added
- [ ] Callback endpoint returns 200 OK
- [ ] Tripay dashboard test: BERHASIL
- [ ] Logs show successful callback processing
- [ ] Test transaction processed correctly
- [ ] Balance updated automatically
- [ ] No errors in production

## ✅ Sign-off

**Deployed by:** _________________
**Date:** _________________
**Verified by:** _________________
**Status:** [ ] Complete [ ] Issues found

---

**Ready to deploy?** Start with Step 1! 🚀
