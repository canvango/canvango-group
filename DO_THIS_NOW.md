# ⚡ DO THIS NOW - Quick Test

**Time:** 15 minutes  
**Goal:** Verify payment system works

---

## ⚠️ IMPORTANT: IP Whitelist

**Tripay requires IP whitelist!**

**Quick Check:**
- Using **Vercel API Route**? → Might not work (dynamic IPs)
- Using **Cloudflare Worker**? → Need to add Cloudflare IPs
- Using **Supabase Edge Functions**? → Need to add Supabase IPs

**See:** `TRIPAY_WHITELIST_SETUP.md` for complete guide

**For now:** Test in **sandbox mode** (might not need whitelist)

---

## Step 1: Check Vercel Environment Variables (2 min)

1. Go to: https://vercel.com/your-project/settings/environment-variables
2. Verify these exist:
   - ✅ `VITE_SUPABASE_URL`
   - ✅ `SUPABASE_SERVICE_ROLE_KEY`

**If missing:** Add `SUPABASE_SERVICE_ROLE_KEY` from Supabase Dashboard → Settings → API → service_role key

---

## Step 2: Test via Browser (5 min)

1. **Login** to your site: https://canvango.com
2. **Go to Top Up** page
3. **Check:** Do payment methods load?
   - Should see: BCA VA, BNI VA, BRI VA, BSI VA, Mandiri VA, QRIS
4. **Select** any payment method
5. **Enter amount:** 50000 (or more)
6. **Click** "Bayar Sekarang"

**Expected:**
- ✅ Redirects to Tripay payment page
- ✅ Shows payment instructions
- ✅ No errors in console (F12)

**If it works:** 🎉 You're done! System is working!

**If it fails:** Continue to Step 3

---

## Step 3: Check Database (2 min)

Run this SQL in Supabase:

```sql
-- Check if transaction was created
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
LIMIT 5;
```

**Expected:**
- ✅ New transaction exists
- ✅ Has `tripay_reference`
- ✅ Has `tripay_checkout_url`
- ✅ Status is "pending"

---

## Step 4: Check Vercel Logs (2 min)

If Step 2 failed:

```bash
vercel logs --follow
```

Or check in Vercel Dashboard → Deployments → Latest → Logs

**Look for:**
- ❌ Errors in `/api/tripay-proxy`
- ❌ Missing environment variables
- ❌ Tripay API errors

---

## Step 5: Fix Common Issues (4 min)

### Issue: "Missing authorization"
**Fix:** Make sure you're logged in

### Issue: "Tripay configuration not found"
**Fix:** Check database has tripay_config:
```sql
SELECT tripay_config FROM system_settings LIMIT 1;
```

### Issue: "CORS error"
**Fix:** Check `api/tripay-proxy.ts` has CORS headers, redeploy

### Issue: "500 error"
**Fix:** Add `SUPABASE_SERVICE_ROLE_KEY` to Vercel, redeploy

---

## ✅ Success Checklist

After testing:

- [ ] Payment methods load on Top Up page
- [ ] Can select payment method
- [ ] Can enter amount
- [ ] Click "Bayar" works
- [ ] Redirects to Tripay payment page
- [ ] Transaction saved to database
- [ ] No console errors
- [ ] No Vercel errors

---

## 🎉 If All Checks Pass

**Congratulations!** Your payment system is working!

**Next steps:**
1. Make a real test payment (small amount)
2. Verify callback updates status
3. Monitor for 24 hours
4. Consider deploying Cloudflare Worker for better performance

---

## 🆘 If Something Fails

**Don't panic!** Check these documents:

1. `CRITICAL_TRIPAY_TEST_NOW.md` - Detailed troubleshooting
2. `CHECK_VERCEL_ENV.md` - Environment variables guide
3. `ACTION_PLAN_TRIPAY_NOW.md` - Complete testing guide

Or run the visual test tool:
- Open `test-tripay-current.html` in browser
- Follow instructions

---

**Status:** Ready to test  
**Difficulty:** Easy 🟢  
**Time:** 15 minutes

🚀 **START NOW!**
