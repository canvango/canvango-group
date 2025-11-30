# 🔴 Troubleshooting 307 Redirect Issue

## 📊 Current Situation

**Problem:** Tripay Callback Tester still returns HTTP 307

**Test Results:**
- From our terminal: ✅ 401 (working)
- From Tripay: ❌ 307 (not working)

**This indicates:** Edge cache or routing issue specific to Tripay's location/IP

---

## 🔍 Possible Causes

### 1. Vercel Edge Cache (Most Likely)
**Problem:** Different Vercel edge locations have different cache
- Our location: Cached new version (401)
- Tripay location: Cached old version (307)

**Solution:** Wait for cache propagation or force invalidate

### 2. Vercel Routing Configuration
**Problem:** `vercel.json` routing rules causing redirect
**Status:** ✅ Fixed (changed to rewrites)

### 3. DNS Propagation
**Problem:** DNS not fully propagated to all locations
**Status:** Unlikely (domain is old)

### 4. Vercel Deployment Not Fully Rolled Out
**Problem:** New deployment not yet on all edge nodes
**Solution:** Wait or force redeploy

---

## 🛠️ Fixes Applied

### Fix 1: Changed vercel.json Routing ✅
```json
// Before (BROKEN)
"routes": [
  { "src": "/api/(.*)", "dest": "/api/$1" },
  { "src": "/(.*)", "dest": "/index.html" }  // ← Catches everything!
]

// After (FIXED)
"rewrites": [
  { "source": "/((?!api).*)", "destination": "/index.html" }  // ← Excludes /api/*
]
```

### Fix 2: Added No-Cache Headers ✅
```json
"headers": [
  {
    "source": "/api/(.*)",
    "headers": [
      { "key": "Cache-Control", "value": "no-cache, no-store, must-revalidate" }
    ]
  }
]
```

### Fix 3: Added cleanUrls: false ✅
```json
"cleanUrls": false  // Prevent URL rewriting
```

### Fix 4: Force Redeploy ✅
- Updated comment in api/tripay-callback.ts
- Triggers new build and deployment
- Forces edge cache refresh

---

## 🧪 Testing Methods

### Method 1: Test from Terminal
```bash
curl -X POST https://canvango.com/api/tripay-callback \
  -H "Content-Type: application/json" \
  -H "X-Callback-Signature: test" \
  -d '{"test":"data"}' \
  -v
```

**Expected:** 401 Unauthorized (not 307)

### Method 2: Test from Different Location
```bash
# Use VPN or proxy to test from different location
# This simulates Tripay's server location
```

### Method 3: Test with Exact Tripay Headers
```bash
curl -X POST https://canvango.com/api/tripay-callback \
  -H "X-Callback-Event: payment_status" \
  -H "X-Callback-Signature: test" \
  -H "Content-Type: application/json" \
  -H "User-Agent: TriPay Payment/1.0" \
  -d '{"reference":"test"}' \
  -v
```

---

## ⏱️ Timeline

**Deployed Fixes:**
1. vercel.json routing: 2025-11-30 (1st deploy)
2. No-cache headers: 2025-11-30 (2nd deploy)
3. Force redeploy: 2025-11-30 (3rd deploy)

**Expected Cache Clear:**
- Vercel Edge: 5-10 minutes per deploy
- Total: 15-30 minutes after last deploy

---

## 🚀 Next Steps

### Immediate (Now):
- [x] Fix vercel.json routing
- [x] Add no-cache headers
- [x] Force redeploy
- [ ] Wait 5-10 minutes

### Short-term (15-30 minutes):
- [ ] Test from Tripay Callback Tester again
- [ ] If still 307, proceed to alternative solutions

### Alternative Solutions:

#### Option A: Purge Vercel Cache Manually
1. Go to Vercel Dashboard
2. Select project
3. Go to Settings → Caching
4. Click "Purge Cache"

#### Option B: Contact Vercel Support
- Report: Edge cache not clearing for specific location
- Provide: Callback URL and evidence

#### Option C: Contact Tripay Support
- Report: Callback URL returning 307 from their tester
- Provide: Evidence that endpoint works from other locations
- Request: Test from different server/location

#### Option D: Temporary Workaround (Last Resort)
Use Vercel preview URL temporarily:
1. Get preview URL from Vercel deployment
2. Update Tripay callback URL to preview URL
3. Test callback
4. Once working, switch back to production URL

---

## 📞 Support Contacts

### Vercel Support
- Dashboard: https://vercel.com/support
- Email: support@vercel.com
- Issue: Edge cache not clearing for API routes

### Tripay Support
- Email: support@tripay.co.id
- Issue: Callback tester returning 307 for valid endpoint

---

## 🔄 If Still 307 After 30 Minutes

### Step 1: Verify Deployment
```bash
# Check latest deployment
vercel ls

# Check deployment logs
vercel logs
```

### Step 2: Test from Multiple Locations
- Test from VPN (different countries)
- Test from mobile data (different ISP)
- Test from cloud server (AWS/GCP)

### Step 3: Check Vercel Dashboard
1. Go to: https://vercel.com/dashboard
2. Select project: canvango-group
3. Check: Latest deployment status
4. View: Deployment logs
5. Verify: No errors

### Step 4: Manual Cache Purge
1. Vercel Dashboard → Settings → Caching
2. Click "Purge Cache"
3. Wait 5 minutes
4. Test again

### Step 5: Contact Support
If all else fails, contact both Vercel and Tripay support with evidence.

---

## 📊 Evidence to Provide

### For Vercel Support:
```
Subject: Edge Cache Not Clearing for API Route

Issue: API route /api/tripay-callback returns 307 from some locations
       but 401 from others after multiple deployments.

Evidence:
- Test from our location: 401 (working)
- Test from Tripay location: 307 (cached old response)
- Deployments: 3 times in last hour
- Cache headers: Added no-cache, no-store, must-revalidate

Request: Please purge edge cache for /api/tripay-callback
```

### For Tripay Support:
```
Subject: Callback Tester Returns 307 for Valid Endpoint

Issue: Callback URL returns 307 from Tripay Callback Tester
       but works correctly from other locations.

Callback URL: https://canvango.com/api/tripay-callback

Evidence:
- curl test: Returns 401 (working)
- Postman test: Returns 401 (working)
- Tripay tester: Returns 307 (cached?)

Request: Please test from different server or clear cache
```

---

## ✅ Success Criteria

**Fixed when:**
- ✅ Test from terminal: 401
- ✅ Test from Tripay Callback Tester: 200 OK
- ✅ Real payment callback: Working
- ✅ Transaction status: Updated
- ✅ Balance: Increased

---

## 📝 Lessons Learned

1. **Vercel Edge Cache** can persist across deployments
2. **Different locations** may have different cache
3. **No-cache headers** should be added for API routes
4. **Force redeploy** may be needed to clear cache
5. **Testing from multiple locations** is important

---

**Last Updated:** 2025-11-30  
**Status:** Troubleshooting in progress  
**Next Check:** After latest deployment completes
