# 🚀 Deploy Tripay Callback Fix - Quick Guide

## ⚡ Quick Deploy (5 menit)

### Step 1: Update Vercel Environment Variables

Buka Vercel Dashboard → canvango → Settings → Environment Variables

**Tambahkan variable baru:**

| Name | Value | Environment |
|------|-------|-------------|
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwaXR0bnNmemdrZGJxbmNjbmNuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzEwMTczMiwiZXhwIjoyMDc4Njc3NzMyfQ.9HFJDAoSEB8o82Q23mKyG9XgEmsjKDIfkpVpJUDuO0U` | Production, Preview, Development |

**Verifikasi variables yang sudah ada:**

```
✅ VITE_SUPABASE_URL
✅ VITE_SUPABASE_ANON_KEY
✅ VITE_TRIPAY_PRIVATE_KEY
✅ VITE_TRIPAY_API_KEY
✅ VITE_TRIPAY_MERCHANT_CODE
✅ VITE_TRIPAY_CALLBACK_URL
✅ TURNSTILE_SECRET_KEY
```

### Step 2: Deploy ke Vercel

```bash
# Commit semua perubahan
git add .
git commit -m "fix: Tripay callback direct Supabase integration with signature verification"

# Push untuk trigger auto-deploy
git push origin main
```

### Step 3: Tunggu Deployment Selesai

Monitor di Vercel Dashboard → Deployments

**Expected:**
- ✅ Build: Success
- ✅ Duration: ~2-3 menit
- ✅ Status: Ready

### Step 4: Test Callback Endpoint

```bash
# Test 1: GET request (should return 200 with error message)
curl -i https://canvango.com/api/tripay-callback

# Expected:
# HTTP/2 200
# {"success":false,"message":"Method not allowed"}
```

```bash
# Test 2: POST request (should return 200)
curl -i -X POST https://canvango.com/api/tripay-callback \
  -H "Content-Type: application/json" \
  -H "X-Callback-Signature: test" \
  -d '{"test":"data"}'

# Expected:
# HTTP/2 200
# {"success":false,"message":"Invalid signature"}
```

### Step 5: Test di Tripay Dashboard

1. Login: https://tripay.co.id/member
2. Menu: **Settings → Callback URL**
3. URL: `https://canvango.com/api/tripay-callback`
4. Klik: **Test Callback**

**Expected Result:**
```
✅ Status Koneksi: BERHASIL
✅ Status Callback: BERHASIL
✅ Kode HTTP: 200
```

## 🎯 Success Checklist

- [ ] Environment variable `SUPABASE_SERVICE_ROLE_KEY` ditambahkan di Vercel
- [ ] Code di-commit dan di-push
- [ ] Deployment berhasil (status: Ready)
- [ ] Test cURL GET: return 200 OK
- [ ] Test cURL POST: return 200 OK
- [ ] Tripay dashboard test: BERHASIL
- [ ] Tidak ada error di Vercel logs

## 🔍 Verify Logs

Setelah test callback, cek logs di Vercel:

**Vercel Dashboard → Logs → Filter: `api/tripay-callback`**

**Expected log output:**
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

## ⚠️ Troubleshooting

### Deployment Failed

**Check:**
1. Apakah semua dependencies terinstall? (`npm install`)
2. Apakah TypeScript compile? (`npm run build`)
3. Cek error di Vercel deployment logs

### Test Callback Gagal (307 Redirect)

**Solution:**
1. Clear Vercel cache: Deployments → ... → Redeploy
2. Pastikan `vercel.json` tidak berubah
3. Pastikan tidak ada middleware yang redirect

### Test Callback Gagal (500 Error)

**Check:**
1. Apakah `SUPABASE_SERVICE_ROLE_KEY` sudah ditambahkan?
2. Apakah `VITE_TRIPAY_PRIVATE_KEY` benar?
3. Cek Vercel logs untuk error detail

### Signature Invalid

**Check:**
1. Pastikan `VITE_TRIPAY_PRIVATE_KEY` di Vercel sama dengan di Tripay dashboard
2. Production key: `Fz27s-v8gGt-jDE8e-04Tbw-de1vi`
3. Sandbox key: `BAo71-gUqRM-IahAp-Gt8AM-IS7Iq`

## 📞 Support

Jika masih ada masalah:

1. **Cek Vercel Logs:** Dashboard → Logs
2. **Cek Supabase Logs:** Dashboard → Logs → API
3. **Test dengan script:** `node test-tripay-callback-production.js`

---

**Ready to deploy?** Follow Step 1-5 above! 🚀
