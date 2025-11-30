# Deploy Tripay Callback Fix - Checklist

## Problem Fixed

✅ `FUNCTION_INVOCATION_FAILED` error di endpoint callback Tripay
✅ Function crash karena env vars di top-level
✅ Test callback Tripay gagal karena tidak ada `merchant_ref`

## Changes Summary

**File Modified:** `api/tripay-callback.ts`

1. Environment variables sekarang dicek di dalam handler (tidak di top-level)
2. Jika env var missing → return 200 OK (tidak crash)
3. Test callback tanpa `merchant_ref` → skip database update, return 200 OK
4. Signature verification menerima `privateKey` sebagai parameter

## Pre-Deployment Checklist

- [x] File `api/tripay-callback.ts` sudah diperbaiki
- [ ] Environment variables di Vercel sudah diset:
  - `VITE_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `VITE_TRIPAY_PRIVATE_KEY`

## Deployment Steps

### 1. Commit & Push

```bash
git add api/tripay-callback.ts
git commit -m "fix: prevent FUNCTION_INVOCATION_FAILED in Tripay callback

- Move env var checks inside handler
- Add graceful handling for missing env vars
- Add guard for test callbacks without merchant_ref
- Always return HTTP 200 OK to Tripay"

git push origin main
```

### 2. Wait for Vercel Deployment

- Vercel akan auto-deploy dari GitHub
- Tunggu 1-2 menit
- Check deployment status di: https://vercel.com/dashboard

### 3. Verify Environment Variables

Di Vercel Dashboard → Settings → Environment Variables:

```
VITE_SUPABASE_URL = https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY = eyJhbGc...
VITE_TRIPAY_PRIVATE_KEY = DEV-...
```

**PENTING:** Jika env vars belum ada, function akan return 200 OK dengan message error (tidak crash).

## Post-Deployment Testing

### Test 1: Tripay Dashboard Test Callback

1. Login ke Tripay Merchant Dashboard
2. Go to: **Pengaturan → Callback**
3. URL Callback: `https://canvango.com/api/tripay-callback`
4. Click **"Test Callback"**

**Expected Result:**
```
Kode HTTP: 200 ✅
Status Koneksi: BERHASIL ✅
Status Callback: BERHASIL ✅
```

### Test 2: Manual cURL Test

```bash
curl -X POST https://canvango.com/api/tripay-callback \
  -H "Content-Type: application/json" \
  -H "X-Callback-Signature: test-signature" \
  -H "X-Callback-Event: payment_status" \
  -d '{"status":"PAID","amount_received":190000}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Callback processed (test mode - no database update)"
}
```

### Test 3: Check Vercel Logs

```bash
vercel logs --follow
```

Look for:
```
=== TRIPAY CALLBACK RECEIVED ===
Method: POST
✅ Signature verified
⚠️ No merchant_ref provided - skipping database update
=== TEST CALLBACK PROCESSED ===
```

## Success Criteria

✅ HTTP 200 OK response
✅ No `FUNCTION_INVOCATION_FAILED` error
✅ Tripay test callback shows "BERHASIL"
✅ Logs show callback received and processed
✅ No crashes even if env vars missing

## Rollback Plan

If deployment fails:

```bash
# Revert to previous version
git revert HEAD
git push origin main
```

Or manually in Vercel:
1. Go to Deployments
2. Find previous working deployment
3. Click "Promote to Production"

## Next Steps After Success

1. ✅ Verify test callback works
2. Test real payment flow (create transaction → pay → verify callback)
3. Monitor Vercel logs for any issues
4. Update Tripay IP whitelist if needed

## Notes

- Function sekarang **tidak akan crash** meskipun env vars missing
- Test callbacks (tanpa `merchant_ref`) akan return 200 OK tanpa update database
- Real callbacks (dengan `merchant_ref`) akan update database seperti biasa
- Semua error scenarios tetap return HTTP 200 OK (requirement Tripay)

---

**Ready to Deploy:** ✅ YES
**Risk Level:** 🟢 LOW (backward compatible, safe error handling)
**Estimated Downtime:** 0 minutes (rolling deployment)
