# ⚠️ CRITICAL: Check Environment Variable

## Problem
API masih error 500, kemungkinan besar environment variable belum diset.

## IMMEDIATE ACTION REQUIRED

### Step 1: Check if Variable is Set

1. **Go to:** https://vercel.com/canvango/canvango-group/settings/environment-variables

2. **Look for:** `GCP_PROXY_URL`

3. **Check:**
   - ✅ Variable exists?
   - ✅ Value is: `http://34.182.126.200:3000`
   - ✅ Applied to: Production, Preview, Development

### Step 2: If NOT Set

**Add it now:**

1. Click: "Add New" button
2. Fill in:
   ```
   Name: GCP_PROXY_URL
   Value: http://34.182.126.200:3000
   ```
3. Select: ✅ Production ✅ Preview ✅ Development
4. Click: Save

### Step 3: Redeploy

**After setting variable, you MUST redeploy:**

1. Go to: https://vercel.com/canvango/canvango-group
2. Find latest deployment
3. Click: "..." menu → "Redeploy"
4. Wait for deployment to complete (2-3 minutes)

## Why This is Critical

Environment variables are only loaded during deployment. Even if you set it now, the current deployment doesn't have it yet.

**Timeline:**
1. Set variable → Variable saved in Vercel
2. Redeploy → New deployment loads the variable
3. Test → API should work now

## Alternative: Check Vercel Logs

While waiting, check what error is happening:

1. Go to: https://vercel.com/canvango/canvango-group/logs
2. Filter: `/api/tripay-proxy`
3. Look for recent errors
4. Share screenshot if you see specific error message

## Expected Logs (After Fix)

**Success logs should show:**
```
Tripay Proxy Configuration: { 
  gcpProxyUrl: 'http://34.182.126.200:3000', 
  hasEnvVar: true 
}
Forwarding to GCP proxy: { ... }
GCP proxy response: { status: 200, success: true }
```

**Current error logs probably show:**
```
Tripay Proxy Configuration: { 
  gcpProxyUrl: 'http://34.182.126.200:3000', 
  hasEnvVar: false  ← This means variable NOT set
}
Error forwarding to GCP proxy: { ... }
```

## Test After Redeploy

1. Clear browser cache (Ctrl+Shift+Delete)
2. Refresh page (Ctrl+F5)
3. Try top-up again
4. Should work ✅

## Still Not Working?

If still error after:
- ✅ Variable is set
- ✅ Redeployed
- ✅ Waited 5 minutes

Then we need to check:
1. Vercel function logs (detailed error)
2. GCP proxy logs (if request reaches it)
3. Network connectivity between Vercel and GCP

**Share:**
- Screenshot of environment variables page
- Screenshot of Vercel logs
- Screenshot of error in browser console
