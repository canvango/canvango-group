# Top-Up Error 500 - Complete Summary

## Issue
User melaporkan bahwa fitur top-up yang sebelumnya berfungsi (bisa bayar dan redirect ke Tripay payment page) sekarang menampilkan error 500.

## Root Cause Analysis

### What Happened?
1. ✅ GCP Proxy server masih berjalan dengan baik (verified)
2. ✅ Payment channels tersedia (verified)
3. ❌ Environment variable `GCP_PROXY_URL` tidak diset di Vercel
4. ❌ API route `/api/tripay-proxy` gagal connect ke GCP proxy

### Why Error 500?
Ketika `GCP_PROXY_URL` tidak diset di Vercel:
- API route menggunakan fallback: `http://34.182.126.200:3000`
- Tapi jika ada network issue atau timeout, error tidak ter-handle dengan baik
- User melihat generic error 500

## Solution Implemented

### 1. Improved Error Handling

**File:** `api/tripay-proxy.ts`

**Changes:**
```typescript
// Added configuration logging
console.log('Tripay Proxy Configuration:', {
  gcpProxyUrl: GCP_PROXY_URL,
  hasEnvVar: !!process.env.GCP_PROXY_URL,
});

// Better error messages
if (error.code === 'ECONNREFUSED') {
  errorMessage = 'Cannot connect to payment gateway. Please try again later.';
} else if (error.code === 'ETIMEDOUT') {
  errorMessage = 'Payment gateway timeout. Please try again.';
}

// More detailed error logging
console.error('Error forwarding to GCP proxy:', {
  message: error.message,
  code: error.code,
  isAxiosError: axios.isAxiosError(error),
});
```

**Benefits:**
- ✅ User-friendly error messages
- ✅ Better debugging with detailed logs
- ✅ Specific handling for connection errors

### 2. Environment Variable Setup

**Required Action:**
Set `GCP_PROXY_URL` in Vercel environment variables.

**Why?**
- Explicit configuration is better than fallback
- Easier to debug if value is wrong
- Can be changed without code deployment

## Deployment Steps

### Step 1: Set Environment Variable

1. Go to: https://vercel.com/canvango/canvango-group/settings/environment-variables
2. Click: "Add New"
3. Fill in:
   - Name: `GCP_PROXY_URL`
   - Value: `http://34.182.126.200:3000`
   - Environments: All (Production, Preview, Development)
4. Click: Save

### Step 2: Deploy Changes

**Option A: Git Push (Recommended)**
```bash
git add .
git commit -m "Fix: Improve error handling for top-up payment gateway"
git push origin main
```

**Option B: Redeploy via Dashboard**
1. Go to: https://vercel.com/canvango/canvango-group
2. Click: "Redeploy" on latest deployment

### Step 3: Verify

**Test 1: Check GCP Proxy**
```bash
.\test-topup-fix.bat
```

Expected output:
```
✅ GCP Proxy is running
✅ Payment channels available
✅ All tests passed!
```

**Test 2: Test Top-Up Flow**
1. Login ke aplikasi
2. Go to: Top Up menu
3. Pilih nominal: Rp 10,000
4. Pilih metode: QRIS
5. Click: "Bayar Sekarang"
6. Should redirect to Tripay payment page ✅

## Files Changed

### Modified Files
1. `api/tripay-proxy.ts` - Improved error handling and logging

### New Files
1. `FIX_TOPUP_ERROR_500.md` - Detailed fix documentation
2. `QUICK_FIX_TOPUP_500.md` - Quick reference guide
3. `test-topup-fix.bat` - Automated testing script
4. `TOPUP_ERROR_500_SUMMARY.md` - This file

## Testing Results

### GCP Proxy Health Check
```bash
curl http://34.182.126.200:3000/
```

**Result:** ✅ 200 OK
```json
{
  "status": "ok",
  "message": "Tripay Proxy Server",
  "mode": "production"
}
```

### Payment Channels
```bash
curl http://34.182.126.200:3000/payment-channels
```

**Result:** ✅ 200 OK
- 16 payment methods available
- Virtual Accounts: Permata, BNI, BRI, Mandiri, BCA, etc.
- E-Wallets: OVO, QRIS, DANA, ShopeePay

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         User Browser                         │
│                         (HTTPS)                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Vercel Frontend                           │
│                  canvango.com (HTTPS)                        │
│                                                              │
│  Components:                                                 │
│  - TopUp.tsx                                                 │
│  - TopUpForm.tsx                                             │
│  - PaymentChannelSelection.tsx                               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Vercel API Route                            │
│              /api/tripay-proxy (HTTPS)                       │
│                                                              │
│  Functions:                                                  │
│  - Authenticate user                                         │
│  - Transform request                                         │
│  - Forward to GCP proxy                                      │
│  - Save transaction to DB                                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      GCP Proxy                               │
│           http://34.182.126.200:3000 (HTTP)                  │
│                                                              │
│  Features:                                                   │
│  - Static IP (whitelisted in Tripay)                         │
│  - Forward requests to Tripay API                            │
│  - Handle callbacks from Tripay                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      Tripay API                              │
│              https://tripay.co.id/api (HTTPS)                │
│                                                              │
│  Endpoints:                                                  │
│  - GET /merchant/payment-channel                             │
│  - POST /transaction/create                                  │
│  - GET /transaction/detail                                   │
└─────────────────────────────────────────────────────────────┘
```

## Why This Architecture?

1. **HTTPS for Users:** Vercel handles SSL/TLS
2. **IP Whitelist:** GCP static IP whitelisted in Tripay
3. **Security:** User authentication via Supabase
4. **Reliability:** GCP VM with PM2 auto-restart
5. **Monitoring:** Detailed logs at each layer

## Monitoring & Debugging

### Check Vercel Logs
```
URL: https://vercel.com/canvango/canvango-group/logs
Filter: /api/tripay-proxy
```

**Look for:**
- "Tripay Proxy Configuration" - Shows if env var is set
- "Forwarding to GCP proxy" - Shows request details
- "GCP proxy response" - Shows success/failure
- Error messages with codes (ECONNREFUSED, ETIMEDOUT)

### Check GCP Proxy Logs
```bash
# SSH to GCP VM
gcloud compute ssh tripay-proxy2 --zone=us-west1-a

# Check PM2 status
pm2 status

# View logs
pm2 logs tripay-proxy

# Restart if needed
pm2 restart tripay-proxy
```

### Check Supabase Transactions
```sql
-- Recent transactions
SELECT * FROM transactions 
WHERE transaction_type = 'topup' 
ORDER BY created_at DESC 
LIMIT 10;

-- Failed transactions
SELECT * FROM transactions 
WHERE transaction_type = 'topup' 
AND status = 'failed'
ORDER BY created_at DESC;
```

## Common Issues & Solutions

### Issue 1: "Cannot connect to payment gateway"

**Cause:** GCP proxy down or unreachable

**Solution:**
```bash
# Check GCP proxy
curl http://34.182.126.200:3000/

# If down, SSH and restart
gcloud compute ssh tripay-proxy2 --zone=us-west1-a
pm2 restart tripay-proxy
```

### Issue 2: "Payment gateway timeout"

**Cause:** Slow response from GCP or Tripay

**Solution:**
- Check GCP VM resources (CPU, memory)
- Check Tripay API status
- Consider increasing timeout in `api/tripay-proxy.ts`

### Issue 3: Still getting 500 error

**Cause:** Other error not handled

**Solution:**
1. Check Vercel logs for actual error
2. Check GCP proxy logs
3. Verify environment variable is set
4. Test GCP proxy directly with curl

## Success Criteria

- [x] GCP proxy running and accessible
- [x] Payment channels available
- [x] Error handling improved
- [x] Logging enhanced
- [ ] Environment variable set in Vercel
- [ ] Application redeployed
- [ ] Top-up flow tested and working
- [ ] Payment page opens successfully

## Next Steps

1. **Immediate:**
   - Set `GCP_PROXY_URL` in Vercel
   - Redeploy application
   - Test top-up flow

2. **Verification:**
   - Monitor Vercel logs for errors
   - Test with small amount (Rp 10,000)
   - Verify transaction saved to database
   - Check callback updates status

3. **Future Improvements:**
   - Add retry logic for failed requests
   - Add circuit breaker pattern
   - Add health check endpoint
   - Add metrics/monitoring dashboard

## Contact & Support

If issue persists after following these steps, provide:

1. **Screenshot** of error in browser
2. **Vercel logs** from `/api/tripay-proxy`
3. **GCP proxy status:**
   ```bash
   curl http://34.182.126.200:3000/
   ```
4. **Environment variable** screenshot from Vercel

## References

- **Detailed Fix Guide:** `FIX_TOPUP_ERROR_500.md`
- **Quick Reference:** `QUICK_FIX_TOPUP_500.md`
- **Test Script:** `test-topup-fix.bat`
- **Tripay Documentation:** `TRIPAY_PRODUCTION_READY.md`
- **GCP Setup:** `GCP_SETUP_COMPLETE.md`
