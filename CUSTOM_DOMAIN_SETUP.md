# 🌐 Custom Domain Setup for Tripay Callback

## 🎯 Goal

Setup custom domain `api.canvango.com` untuk Supabase Edge Function, sehingga URL callback jadi:
```
https://api.canvango.com/functions/v1/tripay-callback
```

---

## 📋 Prerequisites

- [x] Domain `canvango.com` sudah dimiliki
- [x] Akses ke DNS management (Cloudflare/Namecheap/GoDaddy/dll)
- [x] Supabase Edge Function sudah deployed ✅

---

## 🚀 Step-by-Step Setup

### Step 1: Add Custom Domain di Supabase

1. **Login ke Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/gpittnsfzgkdbqnccncn
   ```

2. **Go to Settings → General:**
   ```
   https://supabase.com/dashboard/project/gpittnsfzgkdbqnccncn/settings/general
   ```

3. **Scroll ke "Custom Domains" section**

4. **Click "Add custom domain"**

5. **Enter subdomain:**
   ```
   api.canvango.com
   ```
   
   **Alternative options:**
   - `callback.canvango.com`
   - `tripay.canvango.com`
   - `payment.canvango.com`

6. **Click "Add"**

7. **Supabase akan show DNS records** yang harus ditambahkan:
   ```
   Type: CNAME
   Name: api
   Value: gpittnsfzgkdbqnccncn.supabase.co
   ```

---

### Step 2: Add DNS Record

#### **Option A: Cloudflare** (Recommended)

1. Login ke Cloudflare Dashboard
2. Select domain `canvango.com`
3. Go to **DNS** → **Records**
4. Click **Add record**
5. Fill:
   - **Type:** CNAME
   - **Name:** api
   - **Target:** gpittnsfzgkdbqnccncn.supabase.co
   - **Proxy status:** DNS only (grey cloud) ⚠️ IMPORTANT
   - **TTL:** Auto
6. Click **Save**

**⚠️ IMPORTANT:** Set proxy to **DNS only** (grey cloud), bukan **Proxied** (orange cloud). Supabase butuh direct connection untuk SSL.

---

#### **Option B: Namecheap**

1. Login ke Namecheap
2. Go to **Domain List** → Select `canvango.com`
3. Click **Manage** → **Advanced DNS**
4. Click **Add New Record**
5. Fill:
   - **Type:** CNAME Record
   - **Host:** api
   - **Value:** gpittnsfzgkdbqnccncn.supabase.co
   - **TTL:** Automatic
6. Click **Save**

---

#### **Option C: GoDaddy**

1. Login ke GoDaddy
2. Go to **My Products** → **DNS**
3. Select `canvango.com`
4. Click **Add** → **CNAME**
5. Fill:
   - **Name:** api
   - **Value:** gpittnsfzgkdbqnccncn.supabase.co
   - **TTL:** 1 Hour
6. Click **Save**

---

#### **Option D: Other DNS Providers**

Add CNAME record dengan format:
```
Type: CNAME
Name: api
Value: gpittnsfzgkdbqnccncn.supabase.co
TTL: 3600 (or Auto)
```

---

### Step 3: Verify Domain di Supabase

1. **Tunggu DNS propagation** (~5-30 menit)
   
   Check DNS propagation:
   ```bash
   nslookup api.canvango.com
   ```
   
   Atau online tool:
   ```
   https://dnschecker.org/#CNAME/api.canvango.com
   ```

2. **Kembali ke Supabase Dashboard**

3. **Click "Verify" button** di custom domain

4. **Tunggu SSL certificate provisioning** (~5-10 menit)

5. **Status akan berubah:**
   - ⏳ Pending → Verifying DNS
   - 🔄 Provisioning SSL
   - ✅ Active

---

### Step 4: Test Custom Domain

Setelah status **Active**, test:

```bash
# Test Edge Function via custom domain
curl https://api.canvango.com/functions/v1/tripay-callback \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

Expected response:
```json
{
  "success": false,
  "message": "Missing signature"
}
```

✅ Jika dapat response ini, custom domain sudah working!

---

### Step 5: Update Tripay Dashboard

1. **Login ke Tripay:**
   ```
   https://tripay.co.id/member/merchant
   ```

2. **Edit Merchant Settings**

3. **Update fields:**
   
   **URL Website:**
   ```
   https://canvango.com
   ```
   
   **URL Callback:**
   ```
   https://api.canvango.com/functions/v1/tripay-callback
   ```
   
   **Whitelist IP:**
   ```
   (kosongkan)
   ```
   
   **Izinkan Inkonsistensi Nilai:**
   ```
   Tidak
   ```

4. **Save**

---

### Step 6: Update Frontend Config

Update `.env` file:

```bash
# Update callback URL
VITE_TRIPAY_CALLBACK_URL=https://api.canvango.com/functions/v1/tripay-callback
```

Restart dev server:
```bash
npm run dev
```

---

## 🧪 Testing

### Test 1: DNS Resolution
```bash
nslookup api.canvango.com
```

Expected:
```
api.canvango.com canonical name = gpittnsfzgkdbqnccncn.supabase.co
```

### Test 2: SSL Certificate
```bash
curl -I https://api.canvango.com/functions/v1/tripay-callback
```

Expected: No SSL errors

### Test 3: Edge Function
```bash
curl https://api.canvango.com/functions/v1/tripay-callback \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

Expected: `{"success":false,"message":"Missing signature"}`

### Test 4: Create Payment
```bash
npm run dev
# Login → Top-Up → Test payment
```

---

## 🐛 Troubleshooting

### DNS not resolving?

**Check DNS propagation:**
```bash
nslookup api.canvango.com
# or
dig api.canvango.com
```

**Wait longer:** DNS propagation bisa 5 menit - 24 jam

**Check DNS provider:** Pastikan CNAME record sudah saved

---

### SSL Certificate error?

**Check Cloudflare proxy:**
- Harus **DNS only** (grey cloud)
- Bukan **Proxied** (orange cloud)

**Wait for provisioning:**
- SSL certificate butuh 5-10 menit
- Check status di Supabase Dashboard

---

### Supabase verification failed?

**Check CNAME value:**
```
Value harus: gpittnsfzgkdbqnccncn.supabase.co
Bukan: https://gpittnsfzgkdbqnccncn.supabase.co (no https://)
```

**Check TTL:**
- Set TTL ke Auto atau 3600
- Jangan terlalu tinggi (>1 day)

---

### Tripay still reject callback URL?

**Check URL format:**
```
✅ Correct: https://api.canvango.com/functions/v1/tripay-callback
❌ Wrong: http://api.canvango.com/... (no http)
❌ Wrong: api.canvango.com/... (no https://)
```

**Check domain match:**
- URL Website: `https://canvango.com`
- URL Callback: `https://api.canvango.com/...`
- Subdomain OK, harus same root domain

---

## ⏱️ Timeline

| Step | Time | Status |
|------|------|--------|
| Add custom domain | 2 min | Instant |
| Add DNS record | 2 min | Instant |
| DNS propagation | 5-30 min | Wait |
| SSL provisioning | 5-10 min | Wait |
| Verify & test | 5 min | Active |
| **Total** | **~20-50 min** | ✅ |

---

## 📊 Before & After

### Before (Supabase Domain)
```
URL Website: https://gpittnsfzgkdbqnccncn.supabase.co
URL Callback: https://gpittnsfzgkdbqnccncn.supabase.co/functions/v1/tripay-callback
❌ Tripay reject: Domain tidak match
```

### After (Custom Domain)
```
URL Website: https://canvango.com
URL Callback: https://api.canvango.com/functions/v1/tripay-callback
✅ Tripay accept: Domain match!
```

---

## 🎯 Summary

**What you need:**
1. Add CNAME record di DNS provider
2. Verify domain di Supabase
3. Wait for SSL certificate
4. Update Tripay callback URL

**Total time:** ~20-50 minutes (mostly waiting)

**Difficulty:** ⭐⭐ Medium (need DNS access)

---

## 📞 Support

**Supabase Custom Domains:**
- Docs: https://supabase.com/docs/guides/platform/custom-domains
- Support: https://supabase.com/dashboard/support

**DNS Providers:**
- Cloudflare: https://dash.cloudflare.com
- Namecheap: https://www.namecheap.com/support
- GoDaddy: https://www.godaddy.com/help

---

**Ready?** Start with Step 1: Add custom domain di Supabase Dashboard! 🚀
