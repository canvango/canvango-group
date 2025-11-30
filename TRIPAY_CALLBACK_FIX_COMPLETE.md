# Tripay Callback Fix - Complete Solution

## 🎯 Masalah yang Diperbaiki

1. ❌ **Callback 307 Redirect** → ✅ Langsung return 200 OK
2. ❌ **Forward ke GCP VM** → ✅ Direct Supabase integration
3. ❌ **Method not allowed** → ✅ Proper POST handler
4. ❌ **Signature tidak diverifikasi** → ✅ HMAC-SHA256 verification

## 📁 File yang Diubah

### 1. `api/tripay-callback.ts` (COMPLETE REWRITE)

**Perubahan utama:**
- ✅ Verifikasi signature Tripay menggunakan HMAC-SHA256
- ✅ Update langsung ke Supabase (tidak perlu GCP proxy)
- ✅ SELALU return HTTP 200 OK (bahkan saat error)
- ✅ Logging yang aman (tidak log sensitive data)
- ✅ Auto-update balance via database trigger

**Flow baru:**
```
Tripay → Vercel API Route → Verify Signature → Update Supabase → Return 200 OK
```

### 2. `.env` (UPDATED)

**Ditambahkan:**
```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Diperlukan untuk:**
- Admin access ke Supabase dari serverless function
- Update transaction tanpa RLS restrictions

## 🔐 Signature Verification

Callback handler sekarang memverifikasi signature dari Tripay:

```typescript
const signature = crypto
  .createHmac('sha256', TRIPAY_PRIVATE_KEY)
  .update(rawBody)
  .digest('hex');
```

Jika signature tidak valid, tetap return 200 OK tapi dengan `success: false`.

## 🗄️ Database Integration

### Auto Balance Update

Tidak perlu manual update balance! Database trigger `auto_update_user_balance` otomatis:

1. Deteksi perubahan status transaksi ke `completed`
2. Update balance user sesuai `transaction_type`:
   - `topup` → tambah balance
   - `purchase` → kurangi balance

### Transaction Status Mapping

| Tripay Status | Database Status |
|---------------|-----------------|
| `PAID` | `completed` |
| `EXPIRED` | `expired` |
| `FAILED` | `failed` |
| `REFUND` | `refunded` |
| Other | `pending` |

## 🚀 Deployment ke Vercel

### 1. Update Environment Variables

Di Vercel Dashboard → Settings → Environment Variables, tambahkan:

```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwaXR0bnNmemdrZGJxbmNjbmNuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzEwMTczMiwiZXhwIjoyMDc4Njc3NzMyfQ.9HFJDAoSEB8o82Q23mKyG9XgEmsjKDIfkpVpJUDuO0U
```

**PENTING:** Pastikan semua environment variables sudah ada:
- ✅ `VITE_SUPABASE_URL`
- ✅ `VITE_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY` ← **BARU**
- ✅ `VITE_TRIPAY_PRIVATE_KEY`
- ✅ `TURNSTILE_SECRET_KEY`

### 2. Deploy ke Vercel

```bash
# Commit changes
git add .
git commit -m "fix: Tripay callback direct Supabase integration"

# Push to trigger auto-deploy
git push origin main
```

### 3. Verifikasi Deployment

Tunggu deployment selesai, lalu cek:

```bash
curl -i https://canvango.com/api/tripay-callback
```

**Expected response:**
```
HTTP/2 200
content-type: application/json

{"success":false,"message":"Method not allowed"}
```

✅ Status 200 (bukan 307 redirect)
✅ JSON response (bukan HTML)

## 🧪 Testing

### Test 1: Manual cURL (GET - Should fail gracefully)

```bash
curl -i -X GET https://canvango.com/api/tripay-callback
```

**Expected:**
- Status: `200 OK`
- Body: `{"success":false,"message":"Method not allowed"}`

### Test 2: Manual cURL (POST - Should work)

```bash
curl -i -X POST https://canvango.com/api/tripay-callback \
  -H "Content-Type: application/json" \
  -H "X-Callback-Signature: test123" \
  -d '{"test":"data"}'
```

**Expected:**
- Status: `200 OK`
- Body: `{"success":false,"message":"Invalid signature"}` atau `{"success":false,"message":"Database update failed"}`

### Test 3: Automated Test Script

**Local testing:**
```bash
node test-tripay-callback-local.js
```

**Production testing:**
```bash
node test-tripay-callback-production.js
```

### Test 4: Tripay Dashboard Test

1. Login ke dashboard Tripay: https://tripay.co.id/member
2. Masuk ke **Settings → Callback URL**
3. Pastikan URL: `https://canvango.com/api/tripay-callback`
4. Klik **Test Callback**

**Expected result:**
- ✅ Status Koneksi: **BERHASIL**
- ✅ Status Callback: **BERHASIL**
- ✅ Kode HTTP: **200**

## 📊 Monitoring & Debugging

### Vercel Logs

Untuk melihat log callback:

1. Buka Vercel Dashboard
2. Pilih project **canvango**
3. Klik tab **Logs**
4. Filter: `api/tripay-callback`

**Log yang akan muncul:**
```
=== TRIPAY CALLBACK RECEIVED ===
Method: POST
Time: 2025-11-30T...
IP: 103.xxx.xxx.xxx
Body length: 234
Merchant Ref: TXN-...
Status: PAID
✅ Signature verified
Updating transaction: TXN-... → completed
✅ Transaction updated successfully
=== CALLBACK PROCESSED SUCCESSFULLY ===
```

### Supabase Logs

Untuk melihat database updates:

```sql
-- Check recent transactions
SELECT 
  merchant_ref,
  status,
  payment_method,
  total_amount,
  paid_at,
  updated_at
FROM transactions
ORDER BY updated_at DESC
LIMIT 10;

-- Check user balance changes
SELECT 
  id,
  email,
  balance,
  updated_at
FROM users
WHERE updated_at > NOW() - INTERVAL '1 hour'
ORDER BY updated_at DESC;
```

## 🔒 Security Checklist

- ✅ Signature verification menggunakan HMAC-SHA256
- ✅ Service role key tidak exposed ke frontend
- ✅ Raw body preserved untuk signature verification
- ✅ Logging tidak include sensitive data (signature, keys)
- ✅ CORS headers properly configured
- ✅ Always return 200 OK (prevent retry spam)

## ⚠️ Troubleshooting

### Problem: "Missing signature"

**Cause:** Header `X-Callback-Signature` tidak dikirim
**Solution:** Pastikan Tripay mengirim header ini (seharusnya otomatis)

### Problem: "Invalid signature"

**Cause:** Private key tidak match atau body ter-modify
**Solution:** 
1. Cek `VITE_TRIPAY_PRIVATE_KEY` di Vercel env vars
2. Pastikan tidak ada middleware yang modify request body

### Problem: "Database update failed"

**Cause:** Transaction dengan `merchant_ref` tidak ditemukan
**Solution:**
1. Cek apakah transaksi sudah dibuat di database
2. Pastikan `merchant_ref` match dengan yang dikirim Tripay

### Problem: Balance tidak update

**Cause:** Database trigger tidak jalan
**Solution:**
```sql
-- Check if trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'trigger_auto_update_user_balance';

-- Check trigger function
SELECT routine_name, routine_definition 
FROM information_schema.routines 
WHERE routine_name = 'auto_update_user_balance';
```

## 📝 Next Steps

1. ✅ Deploy ke Vercel
2. ✅ Update environment variables
3. ✅ Test dengan cURL
4. ✅ Test di Tripay dashboard
5. ✅ Monitor logs untuk callback pertama
6. ✅ Verify balance update works

## 🎉 Success Criteria

Callback dianggap berhasil jika:

- ✅ Tripay dashboard test callback: **BERHASIL**
- ✅ HTTP status: **200 OK**
- ✅ Transaction status updated di database
- ✅ User balance updated otomatis
- ✅ Tidak ada error di Vercel logs
- ✅ Tidak ada 307 redirect

---

**Updated:** 2025-11-30
**Status:** ✅ Ready for deployment
