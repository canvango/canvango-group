# Cloudflare Worker Deployment Guide - Tripay Proxy

Panduan lengkap untuk deploy Cloudflare Worker sebagai proxy Tripay API.

## 🎯 Keuntungan Cloudflare Worker

✅ **Gratis** - 100,000 requests/day  
✅ **Global CDN** - Low latency worldwide  
✅ **No Server Management** - Serverless  
✅ **CORS Handling** - Built-in  
✅ **Secure** - API keys di environment variables  
✅ **Fast** - Edge computing  

## 📋 Prerequisites

1. Akun Cloudflare (gratis)
2. Node.js 18+ installed
3. npm atau yarn
4. Tripay API credentials (sandbox atau production)

## 🚀 Step-by-Step Deployment

### Step 1: Install Wrangler CLI

```bash
npm install -g wrangler
```

### Step 2: Login ke Cloudflare

```bash
wrangler login
```

Browser akan terbuka, login dengan akun Cloudflare Anda.

### Step 3: Setup Project

```bash
cd cloudflare-worker
npm install
```

### Step 4: Configure Environment Variables (Development)

Buat file `.dev.vars` di folder `cloudflare-worker/`:

```env
TRIPAY_API_KEY=DEV-xxxxxxxxxxxxx
TRIPAY_PRIVATE_KEY=xxxxx-xxxxx-xxxxx-xxxxx-xxxxx
TRIPAY_MERCHANT_CODE=T0000
ALLOWED_ORIGINS=http://localhost:5173,https://yourdomain.com
```

**⚠️ PENTING:** File `.dev.vars` sudah ada di `.gitignore`, jangan commit!

### Step 5: Test Locally

```bash
npm run dev
```

Worker akan berjalan di `http://localhost:8787`

Test dengan curl:

```bash
# Test payment channels
curl "http://localhost:8787/payment-channels?sandbox=true"

# Test dengan origin header
curl -H "Origin: http://localhost:5173" \
  "http://localhost:8787/payment-channels?sandbox=true"
```

### Step 6: Deploy ke Cloudflare

#### Deploy ke Staging

```bash
npm run deploy:staging
```

#### Deploy ke Production

```bash
npm run deploy:production
```

Output akan menampilkan URL worker:
```
✨ Published tripay-proxy (production)
   https://tripay-proxy-production.your-subdomain.workers.dev
```

### Step 7: Set Environment Variables di Cloudflare

Setelah deploy, set environment variables via Cloudflare Dashboard:

1. Buka [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Pilih **Workers & Pages**
3. Klik worker **tripay-proxy-production**
4. Klik tab **Settings**
5. Scroll ke **Environment Variables**
6. Klik **Add variable** untuk setiap variable:

**Production Variables:**
```
TRIPAY_API_KEY = your-production-api-key
TRIPAY_PRIVATE_KEY = your-production-private-key
TRIPAY_MERCHANT_CODE = your-merchant-code
ALLOWED_ORIGINS = https://yourdomain.com,https://www.yourdomain.com
```

**Staging Variables:**
```
TRIPAY_API_KEY = DEV-xxxxxxxxxxxxx
TRIPAY_PRIVATE_KEY = xxxxx-xxxxx-xxxxx-xxxxx-xxxxx
TRIPAY_MERCHANT_CODE = T0000
ALLOWED_ORIGINS = https://staging.yourdomain.com
```

7. Klik **Save and Deploy**

### Step 8: Update Frontend Environment Variables

Update file `.env.production`:

```env
# Cloudflare Worker Proxy URL
VITE_TRIPAY_PROXY_URL=https://tripay-proxy-production.your-subdomain.workers.dev

# Tripay Mode
VITE_TRIPAY_MODE=production
```

Update file `.env.development.local`:

```env
# Cloudflare Worker Proxy URL (local development)
VITE_TRIPAY_PROXY_URL=http://localhost:8787

# Tripay Mode
VITE_TRIPAY_MODE=sandbox
```

### Step 9: Test Production Worker

```bash
# Test payment channels
curl "https://tripay-proxy-production.your-subdomain.workers.dev/payment-channels?sandbox=false"

# Test create transaction
curl -X POST "https://tripay-proxy-production.your-subdomain.workers.dev/create-transaction" \
  -H "Content-Type: application/json" \
  -H "Origin: https://yourdomain.com" \
  -d '{
    "method": "BRIVA",
    "merchant_ref": "TEST-123",
    "amount": 50000,
    "customer_name": "Test User",
    "customer_email": "test@example.com",
    "customer_phone": "081234567890",
    "order_items": [
      {
        "name": "Top Up Balance",
        "price": 50000,
        "quantity": 1
      }
    ],
    "return_url": "https://yourdomain.com/payment/success",
    "sandbox": false
  }'
```

### Step 10: Deploy Frontend

```bash
# Build frontend
npm run build

# Deploy ke Vercel
vercel --prod
```

## 🔍 Monitoring & Debugging

### View Logs

```bash
# Real-time logs
wrangler tail tripay-proxy-production

# Filter by status
wrangler tail tripay-proxy-production --status error
```

### Cloudflare Dashboard

1. Buka [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Workers & Pages → tripay-proxy-production
3. Tab **Metrics** untuk analytics
4. Tab **Logs** untuk real-time logs

### Common Issues

#### 1. CORS Error

**Problem:** `Access-Control-Allow-Origin` error

**Solution:** Pastikan domain Anda ada di `ALLOWED_ORIGINS`:
```
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

#### 2. 403 Forbidden

**Problem:** Origin not allowed

**Solution:** Check `ALLOWED_ORIGINS` di environment variables

#### 3. Signature Invalid

**Problem:** Tripay menolak signature

**Solution:** 
- Verify `TRIPAY_PRIVATE_KEY` benar
- Verify `TRIPAY_MERCHANT_CODE` benar
- Check timestamp tidak expired

#### 4. Worker Not Found

**Problem:** 404 error

**Solution:** 
- Verify worker sudah deployed: `wrangler deployments list`
- Check URL benar

## 📊 Cost Estimation

### Free Tier (Included)
- 100,000 requests/day
- 10ms CPU time per request
- Unlimited bandwidth

### Paid Tier ($5/month)
- 10 million requests/month included
- $0.50 per additional million requests
- 50ms CPU time per request

**Estimasi untuk 1000 users:**
- Average 10 requests/user/day = 10,000 requests/day
- 300,000 requests/month
- **Cost: $0 (Free tier cukup)**

**Estimasi untuk 10,000 users:**
- Average 10 requests/user/day = 100,000 requests/day
- 3,000,000 requests/month
- **Cost: $5/month (Paid tier)**

## 🔐 Security Best Practices

1. **Never commit API keys** - Use environment variables
2. **Whitelist origins** - Set specific domains di `ALLOWED_ORIGINS`
3. **Use HTTPS** - Always use HTTPS di production
4. **Rotate keys** - Rotate API keys secara berkala
5. **Monitor logs** - Check logs untuk suspicious activity

## 🎯 Next Steps

1. ✅ Deploy Cloudflare Worker
2. ✅ Set environment variables
3. ✅ Update frontend `.env`
4. ✅ Test payment flow
5. ✅ Monitor logs
6. ✅ Setup alerts (optional)

## 📚 Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [Tripay API Docs](https://tripay.co.id/developer)

## 🆘 Support

Jika ada masalah:

1. Check logs: `wrangler tail tripay-proxy-production`
2. Verify environment variables di Cloudflare Dashboard
3. Test dengan curl untuk isolate issue
4. Check Tripay API status

## ✅ Verification Checklist

Sebelum production:

- [ ] Worker deployed successfully
- [ ] Environment variables set di Cloudflare
- [ ] CORS working (test dari browser)
- [ ] Payment channels API working
- [ ] Create transaction API working
- [ ] Transaction detail API working
- [ ] Frontend `.env` updated
- [ ] Frontend deployed
- [ ] End-to-end payment flow tested
- [ ] Monitoring setup
- [ ] Logs checked for errors

---

**Status:** Ready for deployment  
**Last Updated:** 2025-11-29  
**Version:** 1.0.0
