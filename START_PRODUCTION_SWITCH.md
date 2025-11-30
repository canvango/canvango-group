# 🚀 Start Here: Tripay Production Switch

**Prerequisite:** Tripay production API sudah approved ✅

---

## 📋 Quick Summary

**Current Status:**
- ✅ GCP proxy running (sandbox mode)
- ✅ Static IP: 34.182.126.200
- ✅ Sandbox tested and working
- ✅ Architecture: Frontend (HTTPS) → Vercel API → GCP Proxy → Tripay
- ⏳ Ready to switch to production

**What We'll Do:**
1. Update GCP VM to production credentials
2. Update database to production mode
3. Update Vercel environment variable
4. Test production payment flow
5. Monitor and verify

**Estimated Time:** 30 minutes  
**Risk Level:** Low (rollback available)

---

## 🎯 Step-by-Step Guide

### Step 1: Update GCP VM (5 minutes)

**SSH to GCP:**
- Go to: https://console.cloud.google.com/compute/instances
- Click "SSH" on tripay-proxy2

**Run these commands:**
```bash
cd ~/tripay-proxy
cat > .env << 'EOF'
PORT=3000
TRIPAY_API_KEY=QfvISlE5WUUu4Eyxqcj6pJ3BMsdIZgKHZyWG17ZP
TRIPAY_PRIVATE_KEY=Fz27s-v8gGt-jDE8e-04Tbw-de1vi
TRIPAY_MERCHANT_CODE=T47159
IS_PRODUCTION=true
EOF
pm2 restart tripay-proxy
pm2 logs tripay-proxy --lines 20
```

**Verify:** Should see "Mode: PRODUCTION" in logs

**Test:**
```bash
curl http://localhost:3000/
# Should show: "mode":"production"
```

---

### Step 2: Update Database (2 minutes)

**Tell Kiro to run:**
```
Update database tripay_settings to production mode
```

**Or run manually in Supabase:**
```sql
UPDATE tripay_settings 
SET is_production = true,
    updated_at = NOW()
WHERE id = 'e3b84c2a-3a90-4aea-9814-11eb87582645';

SELECT is_production, proxy_url FROM tripay_settings;
```

---

### Step 3: Update Vercel Environment (3 minutes)

**Manual steps:**
1. Go to: https://vercel.com/canvango/canvango-group/settings/environment-variables
2. Find: `VITE_TRIPAY_MODE`
3. Change value from `sandbox` to `production`
4. Save
5. Redeploy (or wait for auto-deploy)

---

### Step 4: Test Production (10 minutes)

**Test 1: Health Check**
```bash
curl http://34.182.126.200:3000/
# Should show: "mode":"production"
```

**Test 2: Payment Channels**
```bash
curl http://34.182.126.200:3000/payment-channels
# Should return production channels
```

**Test 3: Frontend Payment Flow**
1. Go to: https://www.canvango.com/top-up
2. Select payment method
3. Enter amount (e.g., 20000)
4. Click "Bayar Sekarang"
5. Should redirect to Tripay production page
6. **⚠️ This will create REAL transaction!**

**Test 4: Complete Real Payment (Optional)**
- Scan QR code or follow payment instructions
- Complete payment
- Verify transaction saved in database
- Check callback received (if configured)

---

### Step 5: Monitor (10 minutes)

**Check GCP Logs:**
```bash
pm2 logs tripay-proxy --lines 50
```

**Check Vercel Logs:**
- Go to: https://vercel.com/canvango/canvango-group/logs
- Monitor for errors

**Check Database:**
```sql
SELECT * FROM transactions 
ORDER BY created_at DESC 
LIMIT 10;
```

**Check Tripay Dashboard:**
- Go to: https://tripay.co.id/member
- Verify transactions appearing

---

## ✅ Success Criteria

- [ ] GCP proxy mode: production
- [ ] Database is_production: true
- [ ] Vercel environment: production
- [ ] Payment channels loading
- [ ] Payment creation working
- [ ] Redirect to Tripay working
- [ ] Real payment successful (if tested)
- [ ] No errors in logs

---

## 🔄 Rollback (If Issues)

**Quick rollback to sandbox:**

**GCP:**
```bash
cd ~/tripay-proxy
cat > .env << 'EOF'
PORT=3000
TRIPAY_API_KEY=DEV-V745CsasrrsQ4BslYS5dzwbJZ6wLudy5joxBGq1G
TRIPAY_PRIVATE_KEY=BAo71-gUqRM-IahAp-Gt8AM-IS7Iq
TRIPAY_MERCHANT_CODE=T47116
IS_PRODUCTION=false
EOF
pm2 restart tripay-proxy
```

**Database:**
```sql
UPDATE tripay_settings SET is_production = false;
```

**Vercel:**
- Change `VITE_TRIPAY_MODE` back to `sandbox`
- Redeploy

---

## 📚 Reference Documents

- **Full Guide:** `TRIPAY_PRODUCTION_READY.md`
- **GCP Setup:** `GCP_SETUP_COMPLETE.md`
- **Tripay Reference:** `TRIPAY_QUICK_REFERENCE.md`

---

## 🎯 Tell Kiro

**To start production switch, say:**
```
"Tripay production API sudah approved, switch ke production mode"
```

**Kiro will:**
1. Update database to production
2. Guide you through GCP VM update
3. Remind you to update Vercel
4. Help test production flow
5. Monitor and verify

---

**Ready to go live!** 🚀
