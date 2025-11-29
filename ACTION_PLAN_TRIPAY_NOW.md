# 🎯 Action Plan - Tripay Integration (Most Critical)

**Priority:** 🔴 CRITICAL  
**Goal:** Make payment system working NOW  
**Time:** 15-30 minutes

---

## 📊 Current Status

✅ **Database Ready**
- Tripay credentials configured (Production)
- Merchant Code: T47159
- Payment channels synced (6 active)

✅ **Backend Ready**
- Vercel API route exists: `/api/tripay-proxy`
- Signature generation implemented
- Transaction logic complete

✅ **Frontend Ready**
- Top Up page exists
- Payment selection UI ready
- Services configured

❓ **Unknown**
- Vercel environment variables set?
- Current implementation tested?
- End-to-end flow working?

---

## 🚀 Action Steps (In Order)

### Step 1: Verify Vercel Environment Variables (5 min)

**What to do:**
1. Go to https://vercel.com/your-project/settings/environment-variables
2. Check if `SUPABASE_SERVICE_ROLE_KEY` exists
3. If not, add it:
   - Get from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api
   - Copy **service_role** key
   - Add to Vercel (Production, Preview, Development)

**Documentation:** `CHECK_VERCEL_ENV.md`

**Success Criteria:**
- ✅ `SUPABASE_SERVICE_ROLE_KEY` exists in Vercel
- ✅ `VITE_SUPABASE_URL` exists in Vercel

---

### Step 2: Test API Route Directly (5 min)

**What to do:**
1. Open `test-tripay-current.html` in browser
2. Enter your site URL
3. Get user token from browser console:
   ```javascript
   supabase.auth.getSession().then(d => console.log(d.data.session.access_token))
   ```
4. Paste token
5. Click "Test Create Transaction"

**Expected Result:**
- ✅ Returns payment data
- ✅ Shows VA number or QR code
- ✅ Has checkout URL

**If Fails:**
- Check Vercel logs: `vercel logs`
- Check browser console for errors
- Verify token is valid

---

### Step 3: Test via UI (5 min)

**What to do:**
1. Login to your site
2. Go to **Top Up** page
3. Select payment method (e.g., BRI VA)
4. Enter amount: 50,000
5. Click **Bayar Sekarang**

**Expected Result:**
- ✅ Redirects to Tripay payment page
- ✅ Shows payment instructions
- ✅ Transaction saved to database

**If Fails:**
- Check browser console
- Check Network tab
- Check if user is logged in

---

### Step 4: Verify Database (2 min)

**What to do:**
Run SQL query:

```sql
SELECT 
  id,
  user_id,
  amount,
  status,
  payment_method,
  tripay_reference,
  tripay_checkout_url,
  created_at
FROM transactions
ORDER BY created_at DESC
LIMIT 5;
```

**Expected Result:**
- ✅ Transaction exists
- ✅ Has tripay_reference
- ✅ Has tripay_checkout_url
- ✅ Status is "pending"

---

### Step 5: Test Payment (Optional - 10 min)

**What to do:**
1. Create transaction with small amount (10,000 IDR)
2. Open payment page
3. Make actual payment (use sandbox if available)
4. Wait for callback
5. Check if status updated

**Expected Result:**
- ✅ Payment page loads
- ✅ Can see payment instructions
- ✅ After payment, status updates to "paid"
- ✅ Balance updated (if applicable)

---

## 🐛 Troubleshooting Guide

### Issue 1: "Missing authorization"

**Cause:** User not logged in or token invalid

**Fix:**
1. Verify user is logged in
2. Get fresh token from browser console
3. Check token format (starts with `eyJ`)

---

### Issue 2: "Tripay configuration not found"

**Cause:** Database missing tripay_config

**Fix:**
```sql
-- Check if exists
SELECT tripay_config FROM system_settings LIMIT 1;

-- If null, update via Admin UI:
-- System Settings → Tripay Configuration → Save
```

---

### Issue 3: "Signature invalid"

**Cause:** Wrong private key or merchant code

**Fix:**
1. Verify credentials in database:
   ```sql
   SELECT tripay_config FROM system_settings LIMIT 1;
   ```
2. Check with Tripay dashboard
3. Update if needed via Admin UI

---

### Issue 4: CORS Error

**Cause:** Missing CORS headers

**Fix:**
Check `api/tripay-proxy.ts` has:
```typescript
res.setHeader('Access-Control-Allow-Origin', '*');
```

Redeploy if needed:
```bash
vercel --prod
```

---

### Issue 5: 500 Server Error

**Cause:** Vercel environment variables missing

**Fix:**
1. Add `SUPABASE_SERVICE_ROLE_KEY` to Vercel
2. Redeploy: `vercel --prod`
3. Test again

---

## ✅ Success Checklist

Mark each when complete:

- [ ] Vercel environment variables verified
- [ ] API route tested with `test-tripay-current.html`
- [ ] UI test completed (Top Up page)
- [ ] Transaction saved to database
- [ ] Payment page opens correctly
- [ ] No console errors
- [ ] No Vercel errors

---

## 📝 Test Report Template

**Date:** ___________  
**Tester:** ___________

**Results:**

1. **Vercel Env Variables:**
   - SUPABASE_SERVICE_ROLE_KEY: ✅ / ❌
   - VITE_SUPABASE_URL: ✅ / ❌

2. **API Route Test:**
   - Status: ✅ / ❌
   - Response time: _____ ms
   - Error (if any): ___________

3. **UI Test:**
   - Payment channels load: ✅ / ❌
   - Can select method: ✅ / ❌
   - Can create transaction: ✅ / ❌
   - Redirects to payment: ✅ / ❌

4. **Database:**
   - Transaction saved: ✅ / ❌
   - Has tripay_reference: ✅ / ❌
   - Has checkout_url: ✅ / ❌

**Overall Status:** ✅ Working / ❌ Not Working

**Notes:**
```
(add any observations or issues)
```

---

## 🎯 After Success

Once everything works:

1. **Document the working setup**
2. **Test with real payment** (small amount)
3. **Monitor for 24 hours**
4. **Consider optimization:**
   - Migrate to Cloudflare Worker (better performance)
   - Add error handling
   - Add loading states
   - Add retry logic

---

## 📚 Related Documents

- `CRITICAL_TRIPAY_TEST_NOW.md` - Detailed testing guide
- `CHECK_VERCEL_ENV.md` - Environment variables guide
- `test-tripay-current.html` - Testing tool
- `QUICK_START_CLOUDFLARE_WORKER.md` - Future optimization

---

**START HERE:** Step 1 → Verify Vercel Environment Variables

**Estimated Total Time:** 15-30 minutes  
**Difficulty:** Easy 🟢  
**Priority:** 🔴 CRITICAL

🚀 **Let's make it work!**
