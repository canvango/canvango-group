# Quick Fix: Top-Up Error 500

## Problem
Top-up menampilkan error 500 saat klik "Bayar Sekarang"

## Solution (2 Steps)

### Step 1: Set Environment Variable di Vercel

1. **Go to:** https://vercel.com/canvango/canvango-group/settings/environment-variables

2. **Click:** "Add New"

3. **Fill in:**
   ```
   Name: GCP_PROXY_URL
   Value: http://34.182.126.200:3000
   ```

4. **Select:** All environments (Production, Preview, Development)

5. **Click:** Save

### Step 2: Redeploy

**Option A: Redeploy via Dashboard**
1. Go to: https://vercel.com/canvango/canvango-group
2. Click "Redeploy" on latest deployment

**Option B: Push to Git**
```bash
git add .
git commit -m "Fix: Add GCP_PROXY_URL environment variable"
git push origin main
```

## Test

After deployment completes:

1. Login ke aplikasi
2. Go to: Top Up menu
3. Pilih nominal: Rp 10,000
4. Pilih metode: QRIS
5. Click: "Bayar Sekarang"
6. Should open Tripay payment page ✅

## Verification

Run this command to verify GCP proxy is working:

```bash
.\test-topup-fix.bat
```

Expected output:
```
✅ GCP Proxy is running
✅ Payment channels available
✅ All tests passed!
```

## What Changed?

**File:** `api/tripay-proxy.ts`
- ✅ Added better error logging
- ✅ Added user-friendly error messages
- ✅ Added configuration logging

**Environment:**
- ✅ Added `GCP_PROXY_URL` variable

## If Still Not Working

1. Check Vercel logs: https://vercel.com/canvango/canvango-group/logs
2. Look for error in `/api/tripay-proxy`
3. Share error message for further debugging

## Architecture

```
User → Vercel Frontend → Vercel API → GCP Proxy → Tripay API
       (HTTPS)           (/api/tripay-proxy)  (HTTP)    (HTTPS)
```

GCP Proxy IP `34.182.126.200` is whitelisted in Tripay ✅
