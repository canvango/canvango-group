# 🚀 Quick Start - Cloudflare Worker Tripay Proxy

**Waktu Setup:** 10-15 menit  
**Biaya:** Gratis (100k requests/day)

---

## ✅ Prerequisites

- [x] Akun Cloudflare (gratis) - [Daftar di sini](https://dash.cloudflare.com/sign-up)
- [x] Node.js 18+ installed
- [x] Tripay API credentials (sandbox atau production)

---

## 📝 Step-by-Step (Copy-Paste Ready)

### 1️⃣ Install Wrangler CLI

```bash
npm install -g wrangler
```

### 2️⃣ Login ke Cloudflare

```bash
wrangler login
```

Browser akan terbuka → Login dengan akun Cloudflare

### 3️⃣ Setup Project

```bash
cd cloudflare-worker
npm install
```

### 4️⃣ Edit Credentials

Edit file `cloudflare-worker/.dev.vars`:

```env
TRIPAY_API_KEY=DEV-xxxxxxxxxxxxx
TRIPAY_PRIVATE_KEY=xxxxx-xxxxx-xxxxx-xxxxx-xxxxx
TRIPAY_MERCHANT_CODE=T0000
ALLOWED_ORIGINS=http://localhost:5173,https://yourdomain.com
```

**⚠️ Ganti dengan credentials Tripay Anda!**

### 5️⃣ Test Locally

```bash
npm run dev
```

Worker berjalan di: `http://localhost:8787`

**Test dengan browser:**
- Buka `cloudflare-worker/test-worker.html`
- Set URL: `http://localhost:8787`
- Klik "Run Test"

### 6️⃣ Deploy ke Production

```bash
npm run deploy:production
```

Output:
```
✨ Published tripay-proxy-production
   https://tripay-proxy-production.your-subdomain.workers.dev
```

**📋 Copy URL ini!**

### 7️⃣ Set Environment Variables di Cloudflare

1. Buka [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. **Workers & Pages** → Klik `tripay-proxy-production`
3. **Settings** → **Environment Variables**
4. Klik **Add variable** untuk setiap:

```
TRIPAY_API_KEY = your-production-api-key
TRIPAY_PRIVATE_KEY = your-production-private-key
TRIPAY_MERCHANT_CODE = your-merchant-code
ALLOWED_ORIGINS = https://yourdomain.com
```

5. Klik **Save and Deploy**

### 8️⃣ Update Frontend

**Option A: Via Admin Dashboard (Recommended)**

1. Login sebagai admin
2. **System Settings** → **Tripay Configuration**
3. Paste Worker URL di field **Cloudflare Worker Proxy URL**
4. Klik **Save Settings**

**Option B: Via Environment Variable**

Edit `.env.production`:

```env
VITE_TRIPAY_PROXY_URL=https://tripay-proxy-production.your-subdomain.workers.dev
VITE_TRIPAY_MODE=production
```

### 9️⃣ Test Production

```bash
# Test payment channels
curl "https://tripay-proxy-production.your-subdomain.workers.dev/payment-channels?sandbox=false"
```

Expected response:
```json
{
  "success": true,
  "data": [
    {
      "code": "BRIVA",
      "name": "BRI Virtual Account",
      ...
    }
  ]
}
```

### 🔟 Deploy Frontend

```bash
npm run build
vercel --prod
```

---

## ✅ Verification Checklist

Test di production:

- [ ] Worker deployed successfully
- [ ] Environment variables set
- [ ] Payment channels API working
- [ ] Frontend can fetch payment methods
- [ ] Create transaction working
- [ ] Payment URL redirects correctly

---

## 🐛 Troubleshooting

### Issue: CORS Error

**Error:** `Access-Control-Allow-Origin`

**Fix:**
```bash
# Check ALLOWED_ORIGINS di Cloudflare Dashboard
# Pastikan domain Anda ada di list
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Issue: 403 Forbidden

**Error:** Origin not allowed

**Fix:** Tambahkan domain ke `ALLOWED_ORIGINS`

### Issue: Signature Invalid

**Error:** Tripay rejects transaction

**Fix:** Verify credentials:
- `TRIPAY_API_KEY` benar
- `TRIPAY_PRIVATE_KEY` benar
- `TRIPAY_MERCHANT_CODE` benar

### Issue: Worker Not Found

**Error:** 404

**Fix:**
```bash
# Check deployment
wrangler deployments list

# Redeploy
npm run deploy:production
```

---

## 📊 Monitoring

### View Real-time Logs

```bash
wrangler tail tripay-proxy-production
```

### View Metrics

1. [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. **Workers & Pages** → `tripay-proxy-production`
3. Tab **Metrics**

---

## 💰 Cost

**Free Tier:**
- 100,000 requests/day
- Unlimited bandwidth
- Global CDN

**Estimasi:**
- 1,000 users × 10 req/day = 10,000 req/day → **FREE ✅**
- 10,000 users × 10 req/day = 100,000 req/day → **FREE ✅**

---

## 🎯 Next Steps

1. ✅ Worker deployed
2. ✅ Environment variables set
3. ✅ Frontend updated
4. ⏭️ Test payment flow end-to-end
5. ⏭️ Monitor logs for errors
6. ⏭️ Setup production Tripay account

---

## 📚 Resources

- **Full Guide:** `CLOUDFLARE_WORKER_DEPLOYMENT_GUIDE.md`
- **Implementation Details:** `CLOUDFLARE_WORKER_IMPLEMENTATION_COMPLETE.md`
- **Test UI:** `cloudflare-worker/test-worker.html`
- **Cloudflare Docs:** https://developers.cloudflare.com/workers/

---

## 🆘 Need Help?

1. Check logs: `wrangler tail tripay-proxy-production`
2. Test with curl
3. Verify environment variables
4. Check Tripay API status

---

**Status:** ✅ Ready to deploy  
**Estimated Time:** 10-15 minutes  
**Difficulty:** Easy 🟢
