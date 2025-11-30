# ✅ Tripay Callback Fix - Checklist

## 🎯 Goal
Fix HTTP 307 callback error dengan menggunakan GCP VM (IP whitelisted)

---

## 📋 Pre-Deployment Check

- [x] Root cause identified (IP whitelist mismatch)
- [x] GCP VM available (IP: 34.182.126.200)
- [x] GCP VM IP whitelisted in Tripay
- [x] Server code ready
- [x] Deployment scripts ready
- [x] Documentation complete

---

## 🚀 Deployment Steps

### Step 1: Deploy to GCP VM

- [ ] SSH to GCP VM (tripay-proxy2)
- [ ] Navigate to ~/tripay-proxy
- [ ] Backup existing server.js
- [ ] Copy new server.js with callback support
- [ ] Verify .env file exists
- [ ] Install/update dependencies
- [ ] Stop old PM2 process
- [ ] Start new PM2 process
- [ ] Verify PM2 status (online)
- [ ] Test health check (curl localhost:3000)
- [ ] Test callback endpoint (curl with test signature)
- [ ] Check PM2 logs (no errors)

**Commands:**
```bash
# Quick deploy
cd ~/tripay-proxy
# Copy-paste from gcp-vm/QUICK_DEPLOY.txt

# Verify
pm2 status
pm2 logs tripay-proxy --lines 20
curl http://localhost:3000/
```

---

### Step 2: Update Tripay Dashboard

- [ ] Login to Tripay Dashboard
- [ ] Navigate to Callback URL settings
- [ ] Change callback URL to: `http://34.182.126.200:3000/tripay-callback`
- [ ] Save changes
- [ ] Navigate to IP Whitelist settings
- [ ] Verify 34.182.126.200 is listed
- [ ] Verify IP status is Active
- [ ] Take screenshot (for reference)

**URL:** https://tripay.co.id/member

---

### Step 3: Test Callback

- [ ] Test 1: Manual curl test
  ```bash
  curl -X POST http://34.182.126.200:3000/tripay-callback \
    -H "Content-Type: application/json" \
    -H "X-Callback-Signature: test" \
    -d '{"test":"data"}'
  ```
  Expected: 401 Unauthorized ✅

- [ ] Test 2: Tripay Callback Tester
  - Go to: https://tripay.co.id/simulator/console/callback
  - Select transaction
  - Click "Send Callback"
  - Expected: HTTP 200 OK ✅

- [ ] Test 3: Real payment (optional)
  - Create topup Rp 10,000
  - Pay via QRIS
  - Wait for callback
  - Check transaction status updated
  - Check balance increased

---

## ✅ Verification

### GCP VM Server

- [ ] PM2 process running (status: online)
- [ ] No errors in PM2 logs
- [ ] Health check returns 200 OK
- [ ] Callback endpoint accessible
- [ ] Server logs showing startup message

### Tripay Dashboard

- [ ] Callback URL updated
- [ ] IP whitelist active
- [ ] No error messages
- [ ] Settings saved successfully

### Callback Testing

- [ ] Manual test returns 401 (correct)
- [ ] Tripay Callback Tester returns 200 OK
- [ ] No 307 redirects
- [ ] Callback received in GCP logs
- [ ] Forwarded to Supabase successfully

### Real Payment Flow

- [ ] Transaction created successfully
- [ ] Payment completed
- [ ] Callback received
- [ ] Transaction status updated
- [ ] Balance increased
- [ ] No errors in logs

---

## 🎯 Success Criteria

**All green when:**

✅ GCP VM server running  
✅ Callback URL updated in Tripay  
✅ IP whitelisted and active  
✅ Manual test returns 401  
✅ Tripay Callback Tester returns 200 OK  
✅ Real payment callback working  
✅ No 307 redirects  

---

## 📊 Status

**Current Status:** ⏳ PENDING DEPLOYMENT

**Progress:**
- [x] Code implementation (100%)
- [x] Documentation (100%)
- [ ] GCP VM deployment (0%)
- [ ] Tripay Dashboard update (0%)
- [ ] Testing (0%)

**Overall:** 40% Complete

---

## 🚨 Troubleshooting

### If deployment fails:
- Check: `pm2 logs tripay-proxy`
- Verify: .env file exists and correct
- Restart: `pm2 restart tripay-proxy`

### If callback still returns 307:
- Verify: Callback URL in Tripay Dashboard
- Check: IP whitelist is active
- Wait: 5 minutes for cache
- Test: Direct curl to GCP VM

### If callback returns 401:
- For manual test: This is CORRECT ✅
- For real Tripay: Check signature in logs

### If callback returns 500:
- Check: Supabase Edge Function logs
- Verify: Database connection
- Check: Transaction exists

---

## 📞 Need Help?

**Documentation:**
- Quick deploy: `gcp-vm/QUICK_DEPLOY.txt`
- Detailed guide: `gcp-vm/DEPLOY_TO_GCP_VM.md`
- Tripay update: `UPDATE_TRIPAY_CALLBACK_URL.md`
- Full summary: `IMPLEMENTATION_COMPLETE.md`

**Support:**
- Tripay: support@tripay.co.id
- GCP: https://console.cloud.google.com

---

## 🎉 After Completion

Mark as done when:
- ✅ All checklist items completed
- ✅ Tripay Callback Tester returns 200 OK
- ✅ Real payment callback working
- ✅ No 307 redirects
- ✅ Monitoring for 24 hours shows no errors

---

**Last Updated:** 2025-11-30  
**Version:** 1.0.0  
**Status:** Ready for deployment
