# Fix Top-Up Error 500

## Problem

Top-up feature menampilkan error 500 saat klik "Bayar Sekarang".

## Root Cause

Environment variable `GCP_PROXY_URL` tidak diset di Vercel, menyebabkan API route gagal connect ke GCP proxy server.

## Solution

### 1. Set Environment Variable di Vercel

**Go to:** https://vercel.com/canvango/canvango-group/settings/environment-variables

**Add new variable:**
```
Name: GCP_PROXY_URL
Value: http://34.182.126.200:3000
Environment: Production, Preview, Development
```

**Click:** Save

### 2. Redeploy Application

**Option A: Via Vercel Dashboard**
1. Go to: https://vercel.com/canvango/canvango-group
2. Click: "Redeploy" on latest deployment
3. Wait for deployment to complete

**Option B: Via Git Push**
```bash
git add .
git commit -m "Fix: Add better error handling for tripay-proxy"
git push origin main
```

### 3. Verify Fix

**Test 1: Check GCP Proxy (Local)**
```bash
curl http://34.182.126.200:3000/
```

Expected response:
```json
{
  "status": "ok",
  "message": "Tripay Proxy Server",
  "mode": "production"
}
```

**Test 2: Test Top-Up Flow**
1. Login ke aplikasi
2. Go to: Top Up menu
3. Pilih nominal (e.g., Rp 10,000)
4. Pilih metode pembayaran (e.g., QRIS)
5. Click: "Bayar Sekarang"
6. Should redirect to Tripay payment page ✅

## Changes Made

### File: `api/tripay-proxy.ts`

**Improvements:**
1. ✅ Added configuration logging on startup
2. ✅ Better error messages for connection issues
3. ✅ More detailed error logging
4. ✅ Specific error handling for ECONNREFUSED and ETIMEDOUT

**Error Messages:**
- `ECONNREFUSED` → "Cannot connect to payment gateway. Please try again later."
- `ETIMEDOUT` → "Payment gateway timeout. Please try again."
- Other errors → Show actual error message from GCP proxy

## Verification Checklist

- [ ] Environment variable `GCP_PROXY_URL` set di Vercel
- [ ] Application redeployed
- [ ] GCP proxy server running (curl test passed)
- [ ] Top-up flow working (payment page opens)
- [ ] Error messages user-friendly

## Monitoring

**Check Vercel Function Logs:**
1. Go to: https://vercel.com/canvango/canvango-group/logs
2. Filter: `/api/tripay-proxy`
3. Look for:
   - "Tripay Proxy Configuration" log
   - "Forwarding to GCP proxy" log
   - Any error messages

**Expected logs (success):**
```
Tripay Proxy Configuration: { gcpProxyUrl: 'http://34.182.126.200:3000', hasEnvVar: true }
Forwarding to GCP proxy: { url: 'http://34.182.126.200:3000/create-transaction', ... }
GCP proxy response: { status: 200, success: true, hasData: true }
```

**Error logs (if still failing):**
```
Error forwarding to GCP proxy: { message: '...', code: 'ECONNREFUSED', ... }
```

## Troubleshooting

### Error: "Cannot connect to payment gateway"

**Possible causes:**
1. GCP proxy server down
2. Network issue between Vercel and GCP
3. Firewall blocking connection

**Check:**
```bash
# Test from local machine
curl http://34.182.126.200:3000/

# Test payment channels
curl http://34.182.126.200:3000/payment-channels
```

**If GCP proxy down:**
```bash
# SSH to GCP VM
gcloud compute ssh tripay-proxy2 --zone=us-west1-a

# Check PM2 status
pm2 status

# Restart if needed
pm2 restart tripay-proxy

# Check logs
pm2 logs tripay-proxy
```

### Error: "Payment gateway timeout"

**Possible causes:**
1. GCP proxy slow response
2. Tripay API slow
3. Network latency

**Check:**
```bash
# Test response time
time curl http://34.182.126.200:3000/payment-channels
```

**If slow (>5 seconds):**
- Check GCP VM resources (CPU, memory)
- Check Tripay API status
- Consider increasing timeout in `api/tripay-proxy.ts`

### Error: Still getting 500

**Check Vercel logs:**
1. Go to: https://vercel.com/canvango/canvango-group/logs
2. Look for actual error message
3. Share error details for further debugging

## Architecture

```
User Browser (HTTPS)
    ↓
Vercel Frontend (canvango.com)
    ↓
Vercel API Route (/api/tripay-proxy)
    ↓
GCP Proxy (http://34.182.126.200:3000)
    ↓
Tripay API (https://tripay.co.id/api)
```

**Why this architecture?**
- Vercel → GCP: HTTP OK (internal network)
- GCP → Tripay: HTTPS (external API)
- GCP IP whitelisted in Tripay ✅
- Vercel handles HTTPS for users ✅

## Next Steps

After fix is verified:

1. ✅ Test with real payment (small amount)
2. ✅ Verify callback working (payment status updates)
3. ✅ Check transaction history shows correct data
4. ✅ Monitor for any errors in production

## Contact

If issue persists after following these steps, provide:
1. Screenshot of error
2. Vercel function logs
3. GCP proxy status (`curl http://34.182.126.200:3000/`)
