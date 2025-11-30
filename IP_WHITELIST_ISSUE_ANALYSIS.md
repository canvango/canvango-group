# 🔴 ROOT CAUSE: IP Whitelist Issue

## 📊 Problem Summary

**Status:** ❌ CALLBACK GAGAL  
**HTTP Code:** 307 (Temporary Redirect)  
**Response:** "Redirecting..."  
**Root Cause:** **IP WHITELIST MISMATCH**

---

## 🔍 What's Happening

### Current Architecture:
```
Tripay Server (callback sender)
    ↓
POST https://canvango.com/api/tripay-callback
    ↓
Vercel Edge Network (DYNAMIC IP - tidak bisa di-whitelist!)
    ↓
❌ Tripay: "IP ini tidak di-whitelist, REJECT!"
    ↓
307 Redirect (security measure)
```

### The Problem:

**Tripay mengirim callback KE:**
```
URL: https://canvango.com/api/tripay-callback
IP Source: Vercel Edge Network (DYNAMIC, berubah-ubah)
```

**Tripay IP Whitelist:**
```
Whitelisted IP: 34.182.126.200 (GCP VM)
Actual IP: Vercel Edge IP (TIDAK di-whitelist)
Result: ❌ REJECTED → 307 Redirect
```

---

## 🎯 Why This Happens

### 1. Vercel Uses Dynamic IPs

Vercel menggunakan **edge network** dengan **ratusan IP addresses** yang:
- ❌ Berubah-ubah (dynamic)
- ❌ Tidak bisa di-predict
- ❌ Tidak bisa di-whitelist semua

**Vercel IP ranges:**
```
76.76.21.0/24
76.76.19.0/24
... (ratusan subnet lainnya)
```

Tripay **TIDAK BISA** whitelist semua IP Vercel!

### 2. GCP IP Sudah Di-Whitelist

Dari database:
```sql
proxy_url: http://34.182.126.200:3000
```

IP **34.182.126.200** (GCP VM) sudah di-whitelist di Tripay, tapi:
- ✅ GCP proxy digunakan untuk **create payment** (frontend → GCP → Tripay)
- ❌ Callback URL masih pointing ke **Vercel** (Tripay → Vercel → rejected)

---

## 🔧 The Solution

### Option 1: Use GCP for Callback (RECOMMENDED)

**Change callback URL from:**
```
❌ https://canvango.com/api/tripay-callback (Vercel - dynamic IP)
```

**To:**
```
✅ http://34.182.126.200:3000/tripay-callback (GCP - static IP, whitelisted)
```

**Architecture:**
```
Tripay Server
    ↓
POST http://34.182.126.200:3000/tripay-callback
    ↓
GCP VM (IP: 34.182.126.200 - WHITELISTED!)
    ↓
✅ Tripay: "IP ini di-whitelist, ACCEPT!"
    ↓
GCP Proxy forwards to Supabase Edge Function
    ↓
Process callback (update transaction, balance, etc.)
```

**Benefits:**
- ✅ Static IP (34.182.126.200)
- ✅ Already whitelisted in Tripay
- ✅ No 307 redirect
- ✅ Callback will work

---

### Option 2: Use Cloudflare Worker (ALTERNATIVE)

**If you have Cloudflare Worker:**
```
✅ https://tripay-proxy.canvango.workers.dev/tripay-callback
```

**Cloudflare IP ranges** are known and can be whitelisted:
```
https://www.cloudflare.com/ips/
```

But you need to whitelist **ALL** Cloudflare IPs (not practical).

---

### Option 3: Disable IP Whitelist (NOT RECOMMENDED)

**Contact Tripay support** to disable IP whitelist for your account.

**Risks:**
- ❌ Less secure
- ❌ Anyone can send fake callbacks
- ❌ Need signature verification only

---

## 🚀 Implementation Steps

### Step 1: Add Callback Endpoint to GCP Proxy

**SSH to GCP VM:**
```bash
cd ~/tripay-proxy
nano server.js
```

**Add this endpoint BEFORE `app.listen()`:**
```javascript
// Tripay callback handler
app.post('/tripay-callback', async (req, res) => {
  try {
    console.log('📥 Tripay callback received');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);

    // Get signature from header
    const signature = req.headers['x-callback-signature'];
    
    if (!signature) {
      console.error('❌ Missing signature');
      return res.status(401).json({ 
        success: false, 
        message: 'Missing signature' 
      });
    }

    // Get raw body for signature verification
    const rawBody = JSON.stringify(req.body);
    
    // Forward to Supabase Edge Function
    const supabaseUrl = 'https://gpittnsfzgkdbqnccncn.supabase.co/functions/v1/tripay-callback';
    
    console.log('📤 Forwarding to Supabase Edge Function...');
    
    const response = await axios.post(supabaseUrl, rawBody, {
      headers: {
        'Content-Type': 'application/json',
        'X-Callback-Signature': signature,
      }
    });

    console.log('✅ Edge Function response:', response.status, response.data);
    
    // Return response from Edge Function
    res.status(response.status).json(response.data);
    
  } catch (error) {
    console.error('❌ Callback error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});
```

**Save:** Ctrl+O, Enter, Ctrl+X

**Restart server:**
```bash
pm2 restart tripay-proxy
pm2 logs tripay-proxy --lines 20
```

---

### Step 2: Update Callback URL in Tripay Dashboard

**Login to Tripay Dashboard:**
1. Go to: https://tripay.co.id/member
2. Navigate to: **Settings** → **Callback URL**

**Change from:**
```
❌ https://canvango.com/api/tripay-callback
```

**To:**
```
✅ http://34.182.126.200:3000/tripay-callback
```

**Save changes.**

---

### Step 3: Verify IP Whitelist

**In Tripay Dashboard:**
1. Go to: **Settings** → **IP Whitelist**
2. Verify: **34.182.126.200** is in the list
3. Status: **Active**

If not listed, add it:
```
IP Address: 34.182.126.200
Description: GCP VM for callback
```

---

### Step 4: Test Callback

**Use Tripay Callback Tester:**
1. Go to: https://tripay.co.id/simulator/console/callback
2. Select a transaction
3. Click "Send Callback"

**Expected Result:**
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

## 🧪 Testing Checklist

### Test 1: GCP Callback Endpoint
```bash
curl -X POST http://34.182.126.200:3000/tripay-callback \
  -H "Content-Type: application/json" \
  -H "X-Callback-Signature: test" \
  -d '{"test":"data"}'
```

**Expected:** 401 Unauthorized (signature invalid, but endpoint working)

### Test 2: From Tripay Callback Tester
**Use Tripay Dashboard callback tester**

**Expected:** 200 OK with success response

### Test 3: Real Payment Flow
1. Create topup transaction
2. Pay via QRIS
3. Wait for callback
4. Check transaction status updated
5. Check balance increased

---

## 📊 Comparison: Before vs After

### BEFORE (Current - BROKEN):
```
Callback URL: https://canvango.com/api/tripay-callback
IP Source: Vercel Edge (dynamic, not whitelisted)
Tripay Check: ❌ IP not whitelisted
Result: 307 Redirect
Status: ❌ GAGAL
```

### AFTER (Fixed):
```
Callback URL: http://34.182.126.200:3000/tripay-callback
IP Source: GCP VM (static, whitelisted)
Tripay Check: ✅ IP whitelisted
Result: 200 OK
Status: ✅ BERHASIL
```

---

## 🔐 Security Considerations

### Why IP Whitelist?

Tripay menggunakan IP whitelist untuk:
1. **Prevent fake callbacks** - Hanya IP terpercaya yang bisa kirim callback
2. **DDoS protection** - Limit request sources
3. **Compliance** - Security requirement

### Signature Verification Still Active

Meskipun IP di-whitelist, **signature verification tetap aktif**:
```
1. Tripay check IP → ✅ Whitelisted
2. Tripay send callback with signature
3. Your server verify signature → ✅ Valid
4. Process callback
```

**Double security:** IP whitelist + Signature verification

---

## 🎯 Why Vercel Can't Work for Callback

### Vercel Edge Network:
```
Global edge network with 100+ locations
Each location has different IP ranges
IPs are dynamic and change frequently
Total IPs: Thousands
```

### Tripay IP Whitelist:
```
Maximum entries: ~50 IPs (typical limit)
Need static IPs
Cannot whitelist entire cloud provider
```

**Conclusion:** Vercel is great for frontend, but **NOT for callback endpoints** that require IP whitelist.

---

## 💡 Alternative Architectures

### Architecture 1: GCP for Everything (Current)
```
Frontend (Vercel) → GCP Proxy → Tripay API (create payment)
Tripay → GCP Proxy → Supabase (callback)
```
**Pros:** Single IP to whitelist  
**Cons:** GCP dependency

### Architecture 2: Hybrid (Recommended)
```
Frontend (Vercel) → Supabase Edge Function → Tripay API (create payment)
Tripay → GCP Proxy → Supabase (callback only)
```
**Pros:** Less GCP dependency  
**Cons:** Need to maintain GCP for callback

### Architecture 3: Cloudflare Worker
```
Frontend (Vercel) → Cloudflare Worker → Tripay API
Tripay → Cloudflare Worker → Supabase
```
**Pros:** Cloudflare IPs are known  
**Cons:** Need to whitelist many IPs

---

## 📝 Summary

### Root Cause:
```
Callback URL menggunakan Vercel (dynamic IP)
Tripay hanya accept dari whitelisted IPs
Vercel IP tidak di-whitelist
Result: 307 Redirect
```

### Solution:
```
Change callback URL to GCP (static IP: 34.182.126.200)
IP ini sudah di-whitelist di Tripay
Callback akan diterima dengan 200 OK
```

### Action Required:
1. ✅ Add callback endpoint to GCP proxy
2. ✅ Update callback URL in Tripay Dashboard
3. ✅ Verify IP whitelist
4. ✅ Test callback

**ETA:** 10 minutes to implement  
**Downtime:** 0 (just update callback URL)

---

## 🚨 IMPORTANT

**DO NOT** try to whitelist Vercel IPs:
- ❌ Vercel has thousands of IPs
- ❌ IPs change frequently
- ❌ Tripay won't accept that many IPs
- ❌ Not practical or secure

**USE** GCP static IP instead:
- ✅ Single static IP
- ✅ Already whitelisted
- ✅ Easy to maintain
- ✅ Secure and reliable

---

**Status:** 🔴 ISSUE IDENTIFIED  
**Next Step:** Implement GCP callback endpoint  
**Priority:** HIGH (blocking payment callbacks)

