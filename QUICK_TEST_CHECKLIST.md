# ✅ Quick Test Checklist

**Time:** 10 minutes  
**Goal:** Verify payment system works

---

## 🎯 Pre-Test (Already Done ✅)

- [x] Database verified (6 payment channels active)
- [x] Tripay configured (Production mode, Merchant T47159)
- [x] Build successful (no errors)
- [x] Services updated

---

## 🧪 Test Now (Do This)

### 1. Open Your Site (1 min)

```
URL: https://canvango.com
```

- [ ] Site loads
- [ ] Can login
- [ ] No errors in console (F12)

---

### 2. Go to Top Up Page (1 min)

- [ ] Top Up page loads
- [ ] Payment methods section visible
- [ ] Loading indicator (if any)

---

### 3. Check Payment Methods (2 min)

**Expected to see:**
- [ ] BCA Virtual Account
- [ ] BNI Virtual Account
- [ ] BRI Virtual Account
- [ ] BSI Virtual Account
- [ ] Mandiri Virtual Account
- [ ] QRIS

**Check:**
- [ ] All 6 methods visible
- [ ] Icons display correctly
- [ ] Names display correctly
- [ ] Can click/select methods

---

### 4. Create Test Transaction (3 min)

**Steps:**
1. Select payment method: **BRI Virtual Account**
2. Enter amount: **50000** (or more)
3. Click **"Bayar Sekarang"** or **"Pay Now"**

**Watch for:**
- [ ] Loading indicator appears
- [ ] No error messages
- [ ] Page redirects

**Expected Result:**
- [ ] Redirects to Tripay payment page
- [ ] Shows payment instructions
- [ ] Shows virtual account number
- [ ] Shows amount to pay

---

### 5. Check Browser Console (1 min)

Press **F12** → **Console** tab

**Look for:**
- [ ] No red errors
- [ ] API call successful
- [ ] Response received

**If errors:**
```
Copy error message here:
_________________________________
```

---

### 6. Verify Database (2 min)

Run this in Supabase SQL Editor:

```sql
SELECT 
  id,
  amount,
  status,
  payment_method,
  tripay_reference,
  tripay_checkout_url,
  created_at
FROM transactions
ORDER BY created_at DESC
LIMIT 1;
```

**Check:**
- [ ] New transaction exists
- [ ] Amount matches (50000)
- [ ] Status is "pending"
- [ ] Has tripay_reference (starts with T)
- [ ] Has tripay_checkout_url
- [ ] Created timestamp is recent

---

## 📊 Results

### ✅ If All Checks Pass

**Congratulations!** 🎉

Your payment system is working!

**Next steps:**
1. Document the test (fill TEST_RESULTS.md)
2. Make real payment (small amount)
3. Verify callback updates status
4. Monitor for 24 hours

---

### ❌ If Any Check Fails

**Don't panic!** Common issues:

#### Issue: Payment methods don't load

**Possible causes:**
- Database not synced
- API error
- Network issue

**Fix:**
```sql
-- Check database
SELECT COUNT(*) FROM tripay_payment_channels 
WHERE is_enabled = true AND is_active = true;
-- Should return 6
```

---

#### Issue: 403 Forbidden Error

**Cause:** IP not whitelisted in Tripay

**Fix:**
1. Open TRIPAY_WHITELIST_SETUP.md
2. Add IPs to Tripay dashboard
3. Wait 5-10 minutes
4. Test again

---

#### Issue: CORS Error

**Cause:** Missing CORS headers

**Fix:**
1. Check api/tripay-proxy.ts has CORS headers
2. Redeploy: `vercel --prod`
3. Test again

---

#### Issue: 500 Server Error

**Cause:** Environment variables missing

**Fix:**
1. Go to Vercel dashboard
2. Settings → Environment Variables
3. Add SUPABASE_SERVICE_ROLE_KEY
4. Redeploy
5. Test again

---

#### Issue: Transaction not created

**Cause:** API call failed

**Fix:**
1. Check Vercel logs: `vercel logs`
2. Look for errors in /api/tripay-proxy
3. Check error message
4. Fix accordingly

---

## 🆘 Quick Help

### "Payment methods not showing"
→ Check database: `SELECT * FROM tripay_payment_channels`

### "403 Forbidden error"
→ Add IP whitelist: See TRIPAY_WHITELIST_SETUP.md

### "CORS error"
→ Check CORS headers, redeploy

### "500 error"
→ Check Vercel environment variables

### "Transaction not saved"
→ Check Vercel logs for errors

---

## 📝 Document Your Test

After testing, fill out:
- **TEST_RESULTS.md** - Complete test report
- Take screenshots
- Note any errors
- Document solutions

---

## 🎯 Success Criteria

**Minimum to pass:**
- ✅ Payment methods load (6 methods)
- ✅ Can create transaction
- ✅ Redirects to payment page
- ✅ Transaction saved to database

**Bonus:**
- ✅ No console errors
- ✅ Fast response time (< 2 seconds)
- ✅ Good UX (smooth flow)

---

**Status:** Ready to test  
**Time:** 10 minutes  
**Difficulty:** Easy 🟢

🚀 **START TESTING NOW!**

Open https://canvango.com and follow the checklist above.
