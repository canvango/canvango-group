# Fix: HTTP 307 Redirect - Trailing Slash & CORS

## 🔴 Root Cause

Setelah verifikasi bahwa auto-deploy sudah jalan dengan baik, masalah 307 kemungkinan besar disebabkan oleh:

1. **Trailing Slash** - TriPay mengirim request ke `/api/tripay-callback/` (dengan slash)
2. **CORS Preflight** - Browser/TriPay mengirim OPTIONS request dulu

## ✅ Solusi yang Diterapkan

### 1. Update `vercel.json`

Menambahkan konfigurasi untuk handle trailing slash:

```json
{
  "trailingSlash": false,
  "rewrites": [
    {
      "source": "/api/tripay-callback/:path*",
      "destination": "/api/tripay-callback"
    }
  ],
  "functions": {
    "api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

**Penjelasan:**
- `"trailingSlash": false` - Vercel akan redirect trailing slash ke non-trailing
- `rewrites` - Catch semua variasi URL dan route ke endpoint yang benar

### 2. Update `api/tripay-callback.ts`

Menambahkan handler untuk CORS preflight:

```typescript
// Handle CORS preflight
if (req.method === 'OPTIONS') {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Callback-Signature');
  return res.status(200).end();
}
```

**Penjelasan:**
- Handle OPTIONS request (CORS preflight)
- Return 200 OK dengan proper CORS headers
- Tidak block request dari TriPay

### 3. Enhanced Logging

Menambahkan logging detail untuk debugging:

```typescript
console.log('=== CALLBACK REQUEST ===');
console.log('Method:', req.method);
console.log('URL:', req.url);
console.log('Signature:', req.headers['x-callback-signature']);
console.log('Body length:', rawBody.length);
console.log('Raw body:', rawBody);
console.log('========================');
```

**Kegunaan:**
- Lihat exact request yang diterima
- Debug jika masih ada masalah
- Monitor callback di Vercel logs

## 📊 Deployment Status

**Commit:** `8e287e0`
**Message:** "fix: handle trailing slash and CORS preflight for tripay callback"
**Status:** ✅ Pushed to GitHub
**Auto-Deploy:** ⏳ In progress (Vercel)

## 🧪 Testing Steps

Setelah deployment selesai (2-3 menit):

### 1. Test dari TriPay Callback Tester

```
URL: https://canvango.com/api/tripay-callback
```

**Expected Result:**
```
Kode HTTP: 200 (OK)
Respon Server: {"success":false,"message":"Invalid signature"}
```

### 2. Test dengan Trailing Slash

```bash
curl -X POST https://canvango.com/api/tripay-callback/ \
  -H "Content-Type: application/json" \
  -H "X-Callback-Signature: test" \
  -d '{"test":"data"}'
```

**Expected:** Tidak ada 307, langsung dapat response dari function

### 3. Test OPTIONS Request

```bash
curl -X OPTIONS https://canvango.com/api/tripay-callback \
  -H "Origin: https://tripay.co.id" \
  -v
```

**Expected:** 200 OK dengan CORS headers

### 4. Check Vercel Logs

**Vercel Dashboard → Logs**

Filter: `/api/tripay-callback`

**Expected:** Lihat log detail request dari TriPay

## 📈 Expected Outcome

### Before Fix:
```
TriPay → POST /api/tripay-callback/
       → Vercel: 307 Redirect
       → TriPay: GAGAL DIKIRIM
```

### After Fix:
```
TriPay → POST /api/tripay-callback/ (dengan trailing slash)
       → Vercel: Rewrite ke /api/tripay-callback
       → Function: Process callback
       → TriPay: 200 OK ✅
```

## 🎯 Why This Should Work

### Trailing Slash Handling

**Problem:**
```
Request: POST /api/tripay-callback/
Vercel Default: 307 Redirect to /api/tripay-callback
TriPay: Reject redirect, mark as failed
```

**Solution:**
```
Request: POST /api/tripay-callback/
Vercel Config: Rewrite (internal) to /api/tripay-callback
Response: 200 OK (no redirect)
TriPay: Success ✅
```

**Key Difference:**
- **Redirect (307)** - Client harus kirim request lagi ke URL baru
- **Rewrite** - Server internal routing, client tidak tahu

### CORS Preflight Handling

**Problem:**
```
Browser → OPTIONS /api/tripay-callback
Function: 405 Method Not Allowed
Browser: Block actual POST request
```

**Solution:**
```
Browser → OPTIONS /api/tripay-callback
Function: 200 OK with CORS headers
Browser: Proceed with POST request ✅
```

## 🔍 Monitoring

Setelah fix deployed, monitor:

### 1. Vercel Logs
```
Vercel Dashboard → Logs
Filter: /api/tripay-callback
```

Look for:
- ✅ 200 OK responses
- ✅ "CALLBACK REQUEST" logs
- ❌ No more 307 redirects

### 2. TriPay Dashboard
```
TriPay Dashboard → Transactions
```

Check:
- ✅ Callback status: "Terkirim"
- ✅ Transaction status updated automatically

### 3. Database
```sql
SELECT * FROM transactions 
WHERE payment_status = 'PAID' 
ORDER BY updated_at DESC 
LIMIT 5;
```

Verify:
- ✅ Status updated from callback
- ✅ Timestamps correct

## 📝 Rollback Plan

Jika fix ini tidak berhasil:

### Option 1: Revert Changes

```bash
git revert 8e287e0
git push origin main
```

### Option 2: Use GCP Cloud Function

Deploy callback handler ke GCP (sudah ada di `gcp-functions/tripay-callback/`):

```bash
cd gcp-functions/tripay-callback
gcloud functions deploy tripay-callback \
  --runtime nodejs20 \
  --trigger-http \
  --allow-unauthenticated \
  --region asia-southeast2
```

Update TriPay callback URL ke GCP function URL.

## 🎯 Success Criteria

Fix dianggap berhasil jika:

- [ ] TriPay Callback Tester return 200 OK
- [ ] Tidak ada 307 Redirect di Vercel logs
- [ ] Real transaction callback berhasil update database
- [ ] Transaction status berubah dari UNPAID → PAID otomatis

## ⏱️ Timeline

- **Push to GitHub:** ✅ Done (just now)
- **Vercel Auto-Deploy:** ⏳ 2-3 minutes
- **Edge Network Propagation:** ⏳ 1-2 minutes
- **Ready to Test:** ~5 minutes from now

## 🚀 Next Steps

1. **Wait 5 minutes** untuk deployment selesai
2. **Test dari TriPay Callback Tester**
3. **Check Vercel logs** untuk verify request diterima
4. **Test real transaction** untuk confirm end-to-end working

---

**Status:** ⏳ DEPLOYED - Waiting for propagation
**ETA Ready:** ~5 minutes
**Action Required:** Test dari TriPay setelah 5 menit
