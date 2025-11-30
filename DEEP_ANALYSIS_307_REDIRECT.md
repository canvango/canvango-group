# Deep Analysis: HTTP 307 Redirect Issue

## Problem Statement

Setelah deployment berhasil via Vercel CLI, test dari local (curl) berhasil, tapi TriPay Callback Tester masih mendapat HTTP 307 Redirect.

---

## Root Cause Analysis

### 1. **Vercel Deployment vs Domain Routing**

**Issue:** Ada 2 deployment yang berbeda:

```
Deployment 1 (CLI):
https://canvango-group-obv6fpcpe-canvangos-projects.vercel.app
✅ Working (test curl berhasil)

Deployment 2 (Custom Domain):
https://canvango.com
❌ Still redirecting (TriPay test gagal)
```

**Root Cause:** Custom domain `canvango.com` belum pointing ke deployment terbaru!

### 2. **DNS/CDN Caching**

**Possible Causes:**

a) **Vercel Edge Network Cache**
   - Old deployment masih di-cache di edge nodes
   - TTL belum expired
   - Custom domain belum propagate ke deployment baru

b) **DNS Propagation**
   - Domain `canvango.com` masih pointing ke old deployment
   - DNS records belum update

c) **Browser/CDN Cache**
   - TriPay server mungkin cache old response
   - Cloudflare (jika ada) cache old version

### 3. **Vercel Domain Configuration**

**Issue:** Custom domain tidak otomatis update ke deployment baru

**Why:**
- Vercel CLI deploy ke preview URL dulu
- Custom domain perlu manual assignment
- Atau perlu promote deployment to production

---

## Technical Deep Dive

### HTTP 307 Temporary Redirect

**What is 307?**
```
HTTP 307 Temporary Redirect
- Server tells client to retry request at different URL
- Method and body must be preserved
- Used for temporary URL changes
```

**Why Vercel returns 307?**

Kemungkinan scenarios:

#### Scenario 1: Routing Mismatch
```
Request: POST /api/tripay-callback
Vercel: "This route doesn't exist in current deployment"
Response: 307 Redirect to catch-all route
```

#### Scenario 2: Old Deployment Active
```
Custom Domain → Old Deployment (no api/tripay-callback.ts)
                ↓
                Catch-all route (index.html)
                ↓
                307 Redirect
```

#### Scenario 3: Build Output Issue
```
New Deployment:
- Frontend: ✅ Built
- API Routes: ❌ Not included in build
- Result: API routes missing → 307
```

---

## Evidence Analysis

### Test Results:

**Test 1: Direct Vercel URL (CLI deployment)**
```bash
curl https://canvango-group-obv6fpcpe-canvangos-projects.vercel.app/api/tripay-callback
Result: ✅ {"success":false,"message":"Invalid signature"}
```
✅ API route exists and working

**Test 2: Custom Domain (from local)**
```bash
curl https://canvango.com/api/tripay-callback
Result: ✅ {"success":false,"message":"Invalid signature"}
```
✅ Working from local (might be DNS cache or different routing)

**Test 3: TriPay Callback Tester**
```
URL: https://canvango.com/api/tripay-callback
Result: ❌ 307 Redirect
```
❌ Still failing from TriPay server

### Conclusion:

**Most Likely Cause:** 
Custom domain `canvango.com` belum fully pointing ke deployment terbaru di semua Vercel edge locations.

**Why local works but TriPay doesn't?**
- Local request hit edge node yang sudah update
- TriPay request hit edge node yang masih cache old deployment
- Geographic routing differences

---

## Solution Path

### Solution 1: Assign Custom Domain to New Deployment

**Steps:**

1. **Go to Vercel Dashboard**
   - https://vercel.com/dashboard
   - Select project "canvango-group"

2. **Go to Deployments**
   - Find latest deployment (from CLI)
   - Should show: "Production" badge

3. **Check Domains Tab**
   - Go to Settings → Domains
   - Verify `canvango.com` is assigned
   - If not, add it

4. **Promote Deployment**
   - If deployment is "Preview", promote to "Production"
   - This ensures custom domain points to it

### Solution 2: Force Cache Purge

**Vercel Edge Cache:**
```bash
# Redeploy to force cache invalidation
vercel --prod --force
```

**Cloudflare (if used):**
- Go to Cloudflare Dashboard
- Purge Cache for `canvango.com/api/*`

### Solution 3: Wait for Propagation

**Time-based solution:**
- Edge cache TTL: 5-10 minutes
- DNS propagation: up to 24 hours (usually 5-15 minutes)
- Wait 10-15 minutes and test again

### Solution 4: Use Direct Vercel URL Temporarily

**Workaround:**

Update TriPay callback URL to:
```
https://canvango-group-obv6fpcpe-canvangos-projects.vercel.app/api/tripay-callback
```

**Pros:**
- ✅ Works immediately
- ✅ No DNS/cache issues

**Cons:**
- ❌ Not using registered domain
- ❌ URL might change on redeploy

---

## Verification Steps

### Step 1: Check Deployment Status

```bash
vercel ls
```

Look for:
```
Production: https://canvango.com
Latest: https://canvango-group-xxx.vercel.app
```

If different, custom domain not pointing to latest!

### Step 2: Check Domain Assignment

Vercel Dashboard → Settings → Domains

Should show:
```
canvango.com → Production (latest deployment)
```

### Step 3: Test from Different Locations

```bash
# Test from different DNS
curl --dns-servers 8.8.8.8 https://canvango.com/api/tripay-callback

# Test with verbose
curl -v https://canvango.com/api/tripay-callback
```

Look for `Location:` header in 307 response

### Step 4: Check Vercel Logs

Vercel Dashboard → Logs

Filter by:
- Path: `/api/tripay-callback`
- Status: 307

See where it's redirecting to

---

## Why This Happened

### Timeline of Events:

1. **Initial Setup**
   - Vercel project created
   - Custom domain `canvango.com` assigned
   - Old code deployed (with rewrite issues)

2. **Code Changes**
   - Fixed `api/tripay-callback.ts`
   - Fixed `vercel.json`
   - Pushed to GitHub

3. **GitHub → Vercel Integration Issue**
   - Auto-deploy not working
   - Custom domain still pointing to old deployment

4. **Manual Deploy via CLI**
   - New deployment created
   - But deployed to preview URL
   - Custom domain not updated

5. **Result**
   - Preview URL: ✅ Working
   - Custom domain: ❌ Still old deployment

---

## The Real Problem

**Vercel has 2 deployment types:**

### Preview Deployments
- Created by: CLI, PR, non-production branches
- URL: `project-name-xxx.vercel.app`
- Custom domain: ❌ Not assigned

### Production Deployments
- Created by: Push to main branch (if auto-deploy enabled)
- URL: `project-name.vercel.app`
- Custom domain: ✅ Assigned

**What happened:**
- CLI deploy created **Preview** deployment
- Custom domain still points to old **Production** deployment
- Need to promote Preview → Production

---

## Immediate Action Required

### Option A: Promote CLI Deployment to Production

1. Vercel Dashboard → Deployments
2. Find CLI deployment
3. Click "..." → "Promote to Production"
4. Wait 2-3 minutes for propagation

### Option B: Trigger Production Deploy

1. Make small change in code
2. Commit and push to `main` branch
3. Manually trigger deploy in Vercel Dashboard
4. Ensure it deploys as "Production"

### Option C: Redeploy with Production Flag

```bash
vercel --prod --force
```

Then check:
```bash
vercel ls
```

Should show custom domain pointing to latest deployment

---

## Prevention for Future

### Fix GitHub → Vercel Integration

1. **Vercel Dashboard → Settings → Git**
   - Ensure GitHub connected
   - Production Branch: `main`
   - Auto-deploy: ✅ Enabled

2. **GitHub Repository Settings**
   - Settings → Integrations → Vercel
   - Ensure repository access granted

3. **Test Auto-Deploy**
   ```bash
   # Make small change
   echo "# Test" >> README.md
   git add README.md
   git commit -m "test: verify auto-deploy"
   git push
   ```
   
   Check Vercel Dashboard for new deployment

---

## Summary

**Root Cause:**
Custom domain `canvango.com` pointing to old deployment, not latest CLI deployment.

**Why:**
- CLI deploy created Preview deployment
- Custom domain only assigned to Production deployment
- GitHub auto-deploy not working, so no Production deployment created

**Solution:**
Promote CLI deployment to Production, or fix GitHub integration and redeploy.

**Time to Fix:**
- Promote deployment: 2-3 minutes
- Fix integration: 5-10 minutes
- Cache propagation: 5-15 minutes

---

**Next Action:** Promote latest deployment to Production in Vercel Dashboard!
