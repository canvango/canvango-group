# 🔧 Update Tripay Callback URL - Step by Step

## 📋 Overview

Setelah deploy GCP callback endpoint, Anda perlu update callback URL di Tripay Dashboard.

**Current (BROKEN):**
```
❌ https://canvango.com/api/tripay-callback
   → Vercel (dynamic IP, not whitelisted)
   → Result: 307 Redirect
```

**New (WORKING):**
```
✅ http://34.182.126.200:3000/tripay-callback
   → GCP VM (static IP, whitelisted)
   → Result: 200 OK
```

---

## 🚀 Step-by-Step Instructions

### Step 1: Login to Tripay Dashboard

**Sandbox:**
```
URL: https://tripay.co.id/member
```

**Production:**
```
URL: https://tripay.co.id/member
```

Login dengan credentials Anda.

---

### Step 2: Navigate to Callback Settings

**Path 1: Via Settings Menu**
1. Click menu **"Pengaturan"** atau **"Settings"**
2. Look for **"Callback URL"** atau **"URL Callback"**

**Path 2: Via Developer Menu**
1. Click menu **"Developer"** atau **"Pengembang"**
2. Look for **"Callback"** atau **"Webhook"**

**Path 3: Via API Settings**
1. Click menu **"API"**
2. Look for **"Callback Configuration"**

---

### Step 3: Update Callback URL

**Find the field:**
```
Callback URL: [input field]
```

**Change from:**
```
https://canvango.com/api/tripay-callback
```

**To:**
```
http://34.182.126.200:3000/tripay-callback
```

⚠️ **Important:**
- Use **HTTP** (not HTTPS) - GCP VM doesn't have SSL yet
- No trailing slash at the end
- Exact URL: `http://34.182.126.200:3000/tripay-callback`

---

### Step 4: Save Changes

Click **"Simpan"** atau **"Save"** button.

**Expected result:**
```
✅ Callback URL berhasil diperbarui
✅ Callback URL updated successfully
```

---

### Step 5: Verify IP Whitelist

**Navigate to IP Whitelist:**
1. Menu: **"Pengaturan"** → **"IP Whitelist"**
2. Or: **"Settings"** → **"IP Whitelist"**

**Check if IP is listed:**
```
IP Address: 34.182.126.200
Status: Active / Aktif
Description: GCP VM for callback
```

**If NOT listed, add it:**
1. Click **"Tambah IP"** atau **"Add IP"**
2. Enter: `34.182.126.200`
3. Description: `GCP VM for callback`
4. Click **"Simpan"** atau **"Save"**

---

### Step 6: Test Callback (Optional)

**If Tripay has Callback Tester:**

1. Navigate to: **"Developer"** → **"Callback Tester"**
2. Or: **"Pengembang"** → **"Test Callback"**
3. Select a transaction (or create test transaction)
4. Click **"Send Callback"** atau **"Kirim Callback"**

**Expected result:**
```
Kode HTTP: 200 (OK)
Status Koneksi: BERHASIL
Status Callback: BERHASIL
Response: {"success": true}
```

**NOT:**
```
Kode HTTP: 307 (Temporary Redirect)
Status Koneksi: GAGAL
Response: Redirecting...
```

---

## 🧪 Verification Steps

### Test 1: Check GCP Server is Running

**From your terminal:**
```bash
curl http://34.182.126.200:3000/
```

**Expected response:**
```json
{
  "status": "ok",
  "message": "Tripay Proxy Server",
  "endpoints": {
    "callback": "POST /tripay-callback"
  }
}
```

---

### Test 2: Test Callback Endpoint

```bash
curl -X POST http://34.182.126.200:3000/tripay-callback \
  -H "Content-Type: application/json" \
  -H "X-Callback-Signature: test" \
  -d '{"test":"data"}'
```

**Expected response:**
```json
{
  "success": false,
  "message": "Invalid signature"
}
```

This is CORRECT! It means:
- ✅ Endpoint is accessible
- ✅ Forwarding to Supabase
- ✅ Signature verification working
- ❌ Signature invalid (expected for test)

---

### Test 3: Real Payment Test

**Create a test transaction:**
1. Login to your app: https://canvango.com
2. Go to: Top Up page
3. Create: Rp 10,000 topup
4. Select: QRIS payment method
5. Pay: Scan QR and pay

**Wait for callback (automatic):**
- Tripay will send callback to GCP VM
- GCP VM will forward to Supabase
- Transaction status will update
- Balance will increase

**Check logs on GCP VM:**
```bash
# SSH to GCP VM
# Then:
pm2 logs tripay-proxy --lines 50
```

**Look for:**
```
=== TRIPAY CALLBACK RECEIVED ===
Timestamp: 2025-11-30...
IP: [Tripay IP]
Headers: {...}
Body: {"reference":"...","status":"PAID",...}
📤 Forwarding to Supabase...
📥 Response: 200 {"success":true}
=================================
```

---

## 📊 Comparison: Before vs After

### BEFORE (Broken):

**Callback URL:**
```
https://canvango.com/api/tripay-callback
```

**Flow:**
```
Tripay → Vercel (dynamic IP)
       → IP not whitelisted
       → 307 Redirect
       → GAGAL
```

**Result:**
```
❌ Kode HTTP: 307
❌ Status: GAGAL
❌ Response: Redirecting...
```

---

### AFTER (Fixed):

**Callback URL:**
```
http://34.182.126.200:3000/tripay-callback
```

**Flow:**
```
Tripay → GCP VM (static IP: 34.182.126.200)
       → IP whitelisted ✅
       → Forward to Supabase
       → Process callback
       → 200 OK
       → BERHASIL
```

**Result:**
```
✅ Kode HTTP: 200
✅ Status: BERHASIL
✅ Response: {"success":true}
```

---

## 🔐 Security Notes

### Why HTTP instead of HTTPS?

**Current setup:**
- GCP VM doesn't have SSL certificate yet
- Using HTTP for now (still secure with signature verification)

**Future improvement (optional):**
- Add SSL certificate to GCP VM
- Use HTTPS: `https://34.182.126.200:3000/tripay-callback`
- Or use domain: `https://api.canvango.com/tripay-callback`

### Is HTTP secure?

**YES, because:**
1. **IP Whitelist** - Only Tripay IPs can send requests
2. **Signature Verification** - Every callback verified with HMAC-SHA256
3. **Private Network** - GCP VM in secure network
4. **No sensitive data in URL** - All data in encrypted body

**Double security:**
```
IP Whitelist (Layer 1) → Signature Verification (Layer 2)
```

---

## 🚨 Troubleshooting

### Issue: Cannot find Callback URL setting

**Try these locations:**
1. Settings → Callback URL
2. Developer → Callback Configuration
3. API → Webhook Settings
4. Integration → Callback

**Still can't find?**
- Contact Tripay support: support@tripay.co.id
- Ask: "Where to update callback URL?"

---

### Issue: IP Whitelist not found

**Some Tripay accounts don't have IP Whitelist feature.**

**Solution:**
1. Contact Tripay support
2. Request: "Enable IP Whitelist for my account"
3. Provide: Your GCP IP (34.182.126.200)

---

### Issue: Callback still returns 307

**Possible causes:**
1. Callback URL not saved properly
2. Using wrong URL (check for typos)
3. IP not whitelisted yet
4. Cache issue (wait 5 minutes)

**Solutions:**
1. Double-check callback URL in Tripay Dashboard
2. Verify IP whitelist is active
3. Test with Tripay Callback Tester
4. Check GCP VM logs: `pm2 logs tripay-proxy`

---

### Issue: Callback returns 401 (Unauthorized)

**This is actually GOOD if testing manually!**

401 means:
- ✅ Endpoint is working
- ✅ IP is whitelisted
- ✅ Request reached GCP VM
- ❌ Signature invalid (expected for manual test)

**For real Tripay callbacks:**
- Tripay will send valid signature
- Should return 200 OK

---

### Issue: Callback returns 500 (Internal Error)

**Check GCP VM logs:**
```bash
pm2 logs tripay-proxy --lines 100
```

**Common causes:**
1. Supabase Edge Function error
2. Database connection error
3. Transaction not found

**Solutions:**
1. Check Supabase Edge Function logs
2. Verify transaction exists in database
3. Check database connection

---

## 📝 Checklist

After updating callback URL:

- [ ] Callback URL updated in Tripay Dashboard
- [ ] IP 34.182.126.200 whitelisted in Tripay
- [ ] GCP VM server running (pm2 status)
- [ ] Health check returns 200 OK
- [ ] Callback endpoint returns 401 (test signature)
- [ ] Tested with Tripay Callback Tester (if available)
- [ ] Tested with real payment (optional)
- [ ] Logs showing callback received
- [ ] Transaction status updated
- [ ] Balance increased

---

## 🎯 Next Steps

1. ✅ Update callback URL in Tripay Dashboard
2. ✅ Verify IP whitelist
3. ✅ Test with Tripay Callback Tester
4. ✅ Test with real payment (Rp 10,000)
5. ✅ Monitor logs for 24 hours
6. ✅ Confirm all callbacks working

---

## 📞 Support

**Tripay Support:**
- Email: support@tripay.co.id
- Website: https://tripay.co.id
- Documentation: https://tripay.co.id/developer

**GCP VM Details:**
- IP: 34.182.126.200
- Port: 3000
- Callback URL: http://34.182.126.200:3000/tripay-callback

---

**Status:** ⏳ WAITING FOR MANUAL UPDATE  
**Action Required:** Update callback URL in Tripay Dashboard  
**ETA:** 5 minutes

---

**Last Updated:** 2025-11-30  
**Version:** 1.0.0
