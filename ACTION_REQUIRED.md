# 🚨 ACTION REQUIRED - Tripay Callback Fix

## 📋 Quick Summary

**Problem:** Callback gagal dengan HTTP 307 karena IP whitelist mismatch  
**Solution:** Gunakan GCP VM (IP: 34.182.126.200) untuk callback endpoint  
**Status:** ✅ Code ready, deployment needed  
**Time Required:** 20 minutes

---

## ✅ What's Done

1. ✅ Root cause identified (IP whitelist issue)
2. ✅ Server code created with callback support
3. ✅ Deployment scripts prepared
4. ✅ Documentation complete
5. ✅ Testing procedures documented

---

## 🎯 What You Need to Do

### Step 1: Deploy to GCP VM (15 minutes)

**Quick Method:**

1. **SSH to GCP VM:**
   ```bash
   # Via browser: GCP Console → Compute Engine → VM instances → SSH
   # Or via terminal:
   gcloud compute ssh tripay-proxy2 --zone=us-west1-a
   ```

2. **Copy-paste these commands:**
   ```bash
   cd ~/tripay-proxy
   
   # Backup existing file
   if [ -f server.js ]; then cp server.js server.js.backup.$(date +%Y%m%d_%H%M%S); fi
   
   # Download and run quick deploy
   # (Copy all commands from gcp-vm/QUICK_DEPLOY.txt)
   ```

3. **Or use the deployment script:**
   - Copy content from `gcp-vm/QUICK_DEPLOY.txt`
   - Paste into GCP VM terminal
   - Press Enter

4. **Verify deployment:**
   ```bash
   pm2 status
   # Should show: tripay-proxy | online
   
   pm2 logs tripay-proxy --lines 20
   # Should show: 🚀 Tripay Proxy Server Started
   ```

**Detailed Method:**
- Follow: `gcp-vm/DEPLOY_TO_GCP_VM.md`

---

### Step 2: Update Tripay Dashboard (5 minutes)

1. **Login to Tripay:**
   - URL: https://tripay.co.id/member
   - Login with your credentials

2. **Navigate to Callback Settings:**
   - Menu: **Settings** → **Callback URL**
   - Or: **Developer** → **Callback Configuration**

3. **Update Callback URL:**
   - **Old:** `https://canvango.com/api/tripay-callback`
   - **New:** `http://34.182.126.200:3000/tripay-callback`
   - Click **Save**

4. **Verify IP Whitelist:**
   - Menu: **Settings** → **IP Whitelist**
   - Check: `34.182.126.200` is listed and active
   - If not, add it

**Detailed Guide:**
- Follow: `UPDATE_TRIPAY_CALLBACK_URL.md`

---

### Step 3: Test Callback (5 minutes)

**Test 1: Manual Test**
```bash
curl -X POST http://34.182.126.200:3000/tripay-callback \
  -H "Content-Type: application/json" \
  -H "X-Callback-Signature: test" \
  -d '{"test":"data"}'
```
**Expected:** `{"success":false,"message":"Invalid signature"}` (This is correct!)

**Test 2: Tripay Callback Tester**
1. Go to: https://tripay.co.id/simulator/console/callback
2. Select a transaction
3. Click "Send Callback"
4. **Expected:** HTTP 200 OK (not 307!)

**Test 3: Real Payment (Optional)**
1. Create topup Rp 10,000
2. Pay via QRIS
3. Wait for callback
4. Check transaction status updated
5. Check balance increased

---

## 📁 Files Reference

| File | Purpose | Action |
|------|---------|--------|
| `gcp-vm/QUICK_DEPLOY.txt` | Quick deployment commands | Copy-paste to GCP VM |
| `gcp-vm/DEPLOY_TO_GCP_VM.md` | Detailed deployment guide | Read if needed |
| `UPDATE_TRIPAY_CALLBACK_URL.md` | Tripay Dashboard update guide | Follow steps |
| `IMPLEMENTATION_COMPLETE.md` | Complete implementation summary | Reference |
| `IP_WHITELIST_ISSUE_ANALYSIS.md` | Root cause analysis | Background info |

---

## 🎯 Success Indicators

**Deployment Successful When:**
- ✅ `pm2 status` shows tripay-proxy as "online"
- ✅ `curl http://34.182.126.200:3000/` returns status OK
- ✅ Callback endpoint returns 401 (for test signature)

**Tripay Update Successful When:**
- ✅ Callback URL saved in Tripay Dashboard
- ✅ IP 34.182.126.200 is whitelisted
- ✅ Tripay Callback Tester returns 200 OK (not 307!)

**Everything Working When:**
- ✅ Real payment triggers callback
- ✅ Transaction status updates to "completed"
- ✅ User balance increases
- ✅ No 307 redirects in Tripay logs

---

## 🚨 If You Get Stuck

### Issue: Cannot SSH to GCP VM
**Solution:** Use browser SSH from GCP Console
- Go to: https://console.cloud.google.com
- Navigate: Compute Engine → VM instances
- Click: SSH button next to tripay-proxy2

### Issue: PM2 command not found
**Solution:** Install PM2
```bash
sudo npm install -g pm2
```

### Issue: Callback still returns 307
**Check:**
1. Callback URL in Tripay Dashboard is exactly: `http://34.182.126.200:3000/tripay-callback`
2. IP 34.182.126.200 is whitelisted and active
3. GCP VM server is running: `pm2 status`
4. Wait 5 minutes for cache to clear

### Issue: Need help
**Contact:**
- Check logs: `pm2 logs tripay-proxy`
- Review: `IMPLEMENTATION_COMPLETE.md`
- Tripay support: support@tripay.co.id

---

## 📊 Timeline

| Task | Duration | Status |
|------|----------|--------|
| Deploy to GCP VM | 15 min | ⏳ TODO |
| Update Tripay Dashboard | 5 min | ⏳ TODO |
| Test callback | 5 min | ⏳ TODO |
| **TOTAL** | **25 min** | **0% DONE** |

---

## 🎉 After Completion

Once done, you should see:

**In Tripay Callback Tester:**
```
✅ Kode HTTP: 200 (OK)
✅ Status Koneksi: BERHASIL
✅ Status Callback: BERHASIL
✅ Response: {"success": true}
```

**NOT:**
```
❌ Kode HTTP: 307 (Temporary Redirect)
❌ Status Koneksi: GAGAL
❌ Response: Redirecting...
```

**In GCP VM Logs:**
```
=== TRIPAY CALLBACK RECEIVED ===
Timestamp: 2025-11-30...
IP: [Tripay IP]
Signature: 8bd49432ab2805a3c8a621dd7f6b2ef8b02f0b546e622d9b4cae76d52370e70b
📤 Forwarding to Supabase...
📥 Response: 200 {"success":true}
=================================
```

---

## 🚀 Ready to Start?

1. Open GCP Console: https://console.cloud.google.com
2. SSH to VM: tripay-proxy2
3. Copy commands from: `gcp-vm/QUICK_DEPLOY.txt`
4. Paste and run
5. Update Tripay Dashboard
6. Test callback
7. Done! 🎉

---

**Priority:** 🔴 HIGH (blocking payment callbacks)  
**Difficulty:** 🟢 EASY (copy-paste commands)  
**Time:** ⏱️ 25 minutes  
**Status:** ⏳ WAITING FOR ACTION

---

**Created:** 2025-11-30  
**Version:** 1.0.0
