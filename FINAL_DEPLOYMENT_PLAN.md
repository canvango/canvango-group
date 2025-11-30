# 🚀 Final Deployment Plan - Tripay Callback Fix

## 📋 Architecture

**Requirement:** Tripay WAJIB menggunakan domain sendiri untuk callback URL

**Solution:** Multi-layer proxy

```
Tripay Server
    ↓
POST https://canvango.com/api/tripay-callback
    ↓
Vercel (api/tripay-callback.ts)
    ↓ Forward to GCP VM
POST http://34.182.126.200:3000/tripay-callback
    ↓
GCP VM (IP whitelisted in Tripay)
    ↓ Forward to Supabase
POST https://gpittnsfzgkdbqnccncn.supabase.co/functions/v1/tripay-callback
    ↓
Supabase Edge Function
    ↓
Process callback (verify signature, update transaction, update balance)
```

**Why this works:**
- ✅ Tripay sends to domain: `canvango.com` (requirement met)
- ✅ Vercel forwards to GCP VM IP: `34.182.126.200` (whitelisted)
- ✅ GCP VM forwards to Supabase (processing)
- ✅ No 307 redirect (proper forwarding)

---

## 🔧 What's Been Updated

### 1. Vercel Proxy (api/tripay-callback.ts) ✅

**Changed from:**
```typescript
// Forward directly to Supabase
const supabaseUrl = 'https://gpittnsfzgkdbqnccncn.supabase.co/functions/v1/tripay-callback';
```

**Changed to:**
```typescript
// Forward to GCP VM (which has whitelisted IP)
const gcpProxyUrl = 'http://34.182.126.200:3000/tripay-callback';
```

**Status:** ✅ Code updated, ready to deploy

---

### 2. GCP VM Server (server.js) ✅

**Already has callback endpoint:**
```javascript
app.post('/tripay-callback', async (req, res) => {
  // Receive from Vercel
  // Forward to Supabase Edge Function
  // Return response
});
```

**Status:** ✅ Code ready, needs deployment to GCP VM

---

## 🚀 Deployment Steps

### Step 1: Deploy GCP VM Server (15 minutes)

**Why first?** Vercel needs GCP VM to be ready to receive forwards.

**Action:**
1. SSH to GCP VM
2. Deploy new server.js with callback endpoint
3. Verify server running
4. Test callback endpoint

**Commands:** See `START_HERE.md`

---

### Step 2: Deploy Vercel Update (5 minutes)

**After GCP VM is ready:**

```bash
# Commit changes
git add api/tripay-callback.ts
git commit -m "fix: forward callback to GCP VM with whitelisted IP"
git push origin main
```

**Vercel will auto-deploy** (2-3 minutes)

---

### Step 3: Test End-to-End (5 minutes)

**Test flow:**
```bash
# Test 1: Vercel endpoint
curl -X POST https://canvango.com/api/tripay-callback \
  -H "Content-Type: application/json" \
  -H "X-Callback-Signature: test" \
  -d '{"test":"data"}'

# Expected: 401 Unauthorized (signature invalid, but flow working)
```

**Test 2: Tripay Callback Tester**
- Go to: https://tripay.co.id/simulator/console/callback
- Send callback
- Expected: 200 OK

---

## 📊 Flow Verification

### Request Flow:

```
1. Tripay sends callback
   POST https://canvango.com/api/tripay-callback
   Headers: { X-Callback-Signature: "..." }
   Body: { reference: "...", status: "PAID", ... }

2. Vercel receives (api/tripay-callback.ts)
   - Preserve raw body
   - Extract signature
   - Forward to GCP VM

3. GCP VM receives (server.js)
   POST http://34.182.126.200:3000/tripay-callback
   - Log request
   - Forward to Supabase Edge Function

4. Supabase Edge Function processes
   - Verify signature
   - Find transaction
   - Update status
   - Update balance
   - Return success

5. Response flows back
   Supabase → GCP VM → Vercel → Tripay
   Status: 200 OK
```

---

## ✅ Success Criteria

**Deployment successful when:**

1. ✅ GCP VM server running
   ```bash
   pm2 status
   # tripay-proxy: online
   ```

2. ✅ Vercel deployed
   ```bash
   # Check Vercel dashboard
   # Latest deployment: success
   ```

3. ✅ Callback flow working
   ```bash
   curl https://canvango.com/api/tripay-callback
   # Returns: 401 (signature invalid, but flow OK)
   ```

4. ✅ Tripay Callback Tester
   ```
   Kode HTTP: 200 OK
   Status: BERHASIL
   ```

5. ✅ Real payment callback
   - Transaction status updated
   - Balance increased
   - No errors in logs

---

## 🎯 Deployment Order (IMPORTANT!)

**Must deploy in this order:**

1. **First:** GCP VM (so it's ready to receive from Vercel)
2. **Second:** Vercel (forward to GCP VM)
3. **Third:** Test end-to-end

**DO NOT deploy Vercel first!** It will fail because GCP VM is not ready.

---

## 📝 Checklist

### Pre-Deployment:
- [x] Vercel code updated (api/tripay-callback.ts)
- [x] GCP VM code ready (server.js)
- [x] Documentation complete
- [ ] GCP VM accessible via SSH

### Deployment:
- [ ] Deploy to GCP VM
- [ ] Verify GCP VM running
- [ ] Test GCP VM callback endpoint
- [ ] Deploy to Vercel (git push)
- [ ] Wait for Vercel deployment
- [ ] Verify Vercel deployment

### Testing:
- [ ] Test Vercel endpoint (curl)
- [ ] Test GCP VM logs (pm2 logs)
- [ ] Test Tripay Callback Tester
- [ ] Test real payment (optional)

### Verification:
- [ ] No 307 redirects
- [ ] Callback returns 200 OK
- [ ] Transaction status updated
- [ ] Balance increased
- [ ] No errors in logs

---

## 🚨 Important Notes

### About IP Whitelist:

**Question:** "Kenapa masih perlu IP whitelist jika pakai domain?"

**Answer:** 
- Tripay **menerima** callback URL dengan domain ✅
- Tapi Tripay **mengirim** callback dari IP mereka
- Tripay **menerima response** dari IP kita
- IP kita (GCP VM: 34.182.126.200) harus di-whitelist agar Tripay accept response

**Flow:**
```
Tripay IP (whitelisted di kita) 
    → canvango.com (domain OK)
    → Vercel (any IP, OK)
    → GCP VM (34.182.126.200, must be whitelisted di Tripay)
    → Supabase
```

### About Domain Requirement:

**Tripay requirement:**
- ✅ Callback URL must use domain (not IP)
- ✅ Must use HTTPS or HTTP
- ✅ Must return 200 OK for success

**Our solution:**
- ✅ Use domain: `canvango.com`
- ✅ Use HTTPS: `https://canvango.com/api/tripay-callback`
- ✅ Return proper status codes

---

## 🔄 Rollback Plan

**If something goes wrong:**

### Rollback Vercel:
```bash
# Revert api/tripay-callback.ts
git revert HEAD
git push origin main
```

### Rollback GCP VM:
```bash
# SSH to GCP VM
cd ~/tripay-proxy
cp server.js.backup.YYYYMMDD_HHMMSS server.js
pm2 restart tripay-proxy
```

---

## 📞 Support

**If you need help:**

1. Check GCP VM logs:
   ```bash
   pm2 logs tripay-proxy --lines 100
   ```

2. Check Vercel logs:
   - Go to: https://vercel.com/dashboard
   - Select project
   - View logs

3. Check Supabase logs:
   ```bash
   # Use Supabase MCP tool
   mcp_supabase_get_logs service="edge-function"
   ```

---

## 🎉 Ready to Deploy!

**Start with Step 1:** Deploy GCP VM Server

Follow instructions in: `START_HERE.md`

---

**Created:** 2025-11-30  
**Version:** 2.0.0 (Multi-layer proxy)  
**Status:** Ready for deployment
