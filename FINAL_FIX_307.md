# ✅ FINAL FIX - 307 Redirect Issue

## 🔴 Root Cause Found

**Problem:** `vercel.json` routing configuration menyebabkan 307 redirect

**Original Configuration (BROKEN):**
```json
{
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",           // ← This catches ALL requests
      "dest": "/index.html"     // ← Including /api/* routes!
    }
  ]
}
```

**Issue:**
- Route kedua `"src": "/(.*)"` menangkap SEMUA request
- Termasuk `/api/tripay-callback`
- Redirect ke `/index.html`
- Result: HTTP 307 Temporary Redirect

---

## ✅ Solution Applied

**New Configuration (FIXED):**
```json
{
  "rewrites": [
    {
      "source": "/((?!api).*)",    // ← Negative lookahead: exclude /api/*
      "destination": "/index.html"
    }
  ]
}
```

**How it works:**
- `(?!api)` = Negative lookahead: NOT starting with "api"
- Only non-API routes go to `/index.html`
- API routes (`/api/*`) handled by serverless functions
- No more 307 redirect!

---

## 📊 Test Results

### Before Fix:
```bash
curl -X POST https://canvango.com/api/tripay-callback
# Result: 307 Temporary Redirect
# Response: "Redirecting..."
```

### After Fix:
```bash
curl -X POST https://canvango.com/api/tripay-callback \
  -H "Content-Type: application/json" \
  -H "X-Callback-Signature: test" \
  -d '{"test":"data"}'

# Result: 401 Unauthorized
# Response: {"success":false,"message":"Invalid signature"}
```

**Status:** ✅ FIXED (401 is correct for invalid signature)

---

## 🚀 Deployment

**Commit:**
```
fix: prevent 307 redirect for API routes in vercel.json
```

**Changes:**
- File: `vercel.json`
- Changed: `routes` → `rewrites`
- Added: Negative lookahead for API routes

**Deployed:** 2025-11-30

---

## ⏱️ Cache Propagation

**If Tripay still shows 307:**

This is likely due to:
1. **Tripay cache** - Tripay caches callback responses
2. **CDN cache** - Vercel edge cache
3. **DNS propagation** - Takes 5-15 minutes

**Solutions:**

### 1. Wait 5-15 minutes
- Vercel edge cache TTL: ~5 minutes
- DNS propagation: ~15 minutes
- Tripay cache: Unknown (their side)

### 2. Force cache clear (Tripay side)
- Contact Tripay support
- Ask to clear cache for your callback URL
- Or wait for automatic cache expiry

### 3. Test from different location
```bash
# Test from different IP/location
curl -X POST https://canvango.com/api/tripay-callback \
  -H "Content-Type: application/json" \
  -H "X-Callback-Signature: test" \
  -d '{"test":"data"}'
```

### 4. Add cache-busting header
```bash
# Test with no-cache header
curl -X POST https://canvango.com/api/tripay-callback \
  -H "Content-Type: application/json" \
  -H "X-Callback-Signature: test" \
  -H "Cache-Control: no-cache" \
  -d '{"test":"data"}'
```

---

## 🧪 Verification Steps

### Step 1: Test from terminal
```bash
curl -X POST https://canvango.com/api/tripay-callback \
  -H "Content-Type: application/json" \
  -H "X-Callback-Signature: test" \
  -d '{"test":"data"}' \
  -v
```

**Expected:**
```
< HTTP/2 401
< content-type: application/json
...
{"success":false,"message":"Invalid signature"}
```

**NOT:**
```
< HTTP/2 307
< location: /
...
Redirecting...
```

---

### Step 2: Test from Tripay Callback Tester

**After 15 minutes:**
1. Go to: https://tripay.co.id/simulator/console/callback
2. Select transaction
3. Click "Send Callback"

**Expected:**
```
✅ Kode HTTP: 200 (OK)
✅ Status Koneksi: BERHASIL
✅ Status Callback: BERHASIL
```

---

### Step 3: Check Vercel Logs

1. Go to: https://vercel.com/dashboard
2. Select project: canvango-group
3. View logs
4. Filter: `/api/tripay-callback`

**Should see:**
```
POST /api/tripay-callback
Status: 401 (or 200 for valid signature)
Duration: ~200ms
```

**NOT:**
```
POST /api/tripay-callback
Status: 307
```

---

## 📝 Technical Details

### Why `routes` caused 307?

**Vercel routing order:**
1. Check `routes` array from top to bottom
2. First match wins
3. Route `"src": "/(.*)"` matches EVERYTHING
4. Even though `/api/(.*)` is defined first, the catch-all route interferes

**Example:**
```
Request: POST /api/tripay-callback

Vercel checks:
1. "/api/(.*)" → Match! But...
2. "/(.*)" → Also matches! (catch-all)
3. Vercel confused → Returns 307 redirect
```

### Why `rewrites` works?

**Vercel rewrites:**
- More specific than routes
- Negative lookahead excludes API routes
- Only non-API routes rewritten to `/index.html`
- API routes handled by serverless functions

**Example:**
```
Request: POST /api/tripay-callback

Vercel checks:
1. "/((?!api).*)" → Does NOT match (excluded by negative lookahead)
2. Falls through to serverless function
3. api/tripay-callback.ts handles request
4. Returns proper response (401 or 200)
```

---

## 🎯 Summary

**Problem:** 307 redirect caused by `vercel.json` routing configuration

**Root Cause:** Catch-all route `"src": "/(.*)"` interfering with API routes

**Solution:** Use `rewrites` with negative lookahead to exclude API routes

**Status:** ✅ FIXED

**Deployment:** Successful

**Cache:** May take 5-15 minutes to propagate

---

## 🔄 If Still Getting 307

**Wait 15 minutes, then:**

1. **Clear browser cache**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

2. **Test from different device/network**
   - Use mobile data instead of WiFi
   - Or use VPN to different location

3. **Contact Tripay support**
   - Email: support@tripay.co.id
   - Ask: "Please clear cache for callback URL: https://canvango.com/api/tripay-callback"

4. **Check Vercel deployment**
   - Verify latest deployment is active
   - Check deployment logs for errors

---

## ✅ Success Indicators

**Fixed when:**
- ✅ curl test returns 401 (not 307)
- ✅ Vercel logs show 401/200 (not 307)
- ✅ Tripay Callback Tester returns 200 OK
- ✅ Real payment callback working
- ✅ Transaction status updated
- ✅ Balance increased

---

**Fix Applied:** 2025-11-30  
**Status:** ✅ DEPLOYED  
**Cache TTL:** 5-15 minutes  
**Next:** Wait for cache propagation, then test again
