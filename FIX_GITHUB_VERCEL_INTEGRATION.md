# Fix GitHub-Vercel Integration

## Problem

Commit berhasil di GitHub tapi Vercel tidak auto-deploy.

## Possible Causes

1. ❌ Vercel Integration tidak aktif
2. ❌ Auto-deploy disabled di Vercel settings
3. ❌ Branch tidak di-watch oleh Vercel
4. ❌ Build error (silent failure)

---

## Solution 1: Check Vercel Integration (Recommended)

### Steps:

1. **Go to Vercel Dashboard**
   - URL: https://vercel.com/dashboard
   - Login dengan akun Anda

2. **Select Your Project**
   - Cari "canvango-group" atau nama project Anda
   - Klik untuk masuk

3. **Go to Settings → Git**
   - Klik tab "Settings"
   - Scroll ke section "Git"

4. **Check Integration Status**
   
   **If Connected:**
   ```
   ✅ Connected to GitHub
   Repository: canvango/canvango-group
   Branch: main
   ```
   
   **If Not Connected:**
   ```
   ⚠️ No Git repository connected
   [Connect Git Repository] button
   ```

5. **If Not Connected, Reconnect:**
   - Click "Connect Git Repository"
   - Select GitHub
   - Choose repository: canvango/canvango-group
   - Select branch: main
   - Click "Connect"

6. **Enable Auto-Deploy:**
   - Make sure "Production Branch" is set to `main`
   - Enable "Automatically deploy new commits"

---

## Solution 2: Check GitHub App Permissions

### Steps:

1. **Go to GitHub Settings**
   - URL: https://github.com/settings/installations
   - Look for "Vercel" app

2. **Check Repository Access**
   - Click "Configure" next to Vercel
   - Make sure "canvango-group" repository is selected
   - If not, add it to "Repository access"

3. **Grant Permissions**
   - Vercel needs:
     - ✅ Read access to code
     - ✅ Read and write access to deployments
     - ✅ Read access to metadata

4. **Save Changes**

---

## Solution 3: Manual Trigger (Quick Fix)

While fixing integration, you can manually deploy:

### Option A: Vercel Dashboard

1. Go to: https://vercel.com/dashboard
2. Select project
3. Tab "Deployments"
4. Click "..." on latest commit
5. Select "Redeploy"

### Option B: Vercel CLI

```bash
# Install CLI (if not installed)
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

---

## Solution 4: Check Build Logs

If deployment is triggered but fails:

### Steps:

1. **Go to Vercel Dashboard → Deployments**

2. **Look for Failed Deployments**
   - Red ❌ status
   - "Error" or "Failed" label

3. **Click Failed Deployment**
   - View "Build Logs"
   - Look for error messages

4. **Common Build Errors:**

   **TypeScript Error:**
   ```
   Error: Type 'X' is not assignable to type 'Y'
   Solution: Fix TypeScript errors
   ```

   **Module Not Found:**
   ```
   Error: Cannot find module 'xyz'
   Solution: npm install xyz --save
   ```

   **Build Timeout:**
   ```
   Error: Build exceeded maximum duration
   Solution: Optimize build or increase timeout
   ```

---

## Solution 5: Verify vercel.json

Check if `vercel.json` has correct configuration:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "functions": {
    "api/tripay-callback.ts": {
      "memory": 1024,
      "maxDuration": 10
    }
  },
  "routes": [
    {
      "src": "/api/tripay-callback",
      "dest": "/api/tripay-callback.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

**Important:**
- ✅ `buildCommand` should match your package.json script
- ✅ `outputDirectory` should be correct (usually `dist` or `build`)
- ✅ API routes should be defined

---

## Solution 6: Check Deployment Hooks

If you have deployment hooks or GitHub Actions:

### Check GitHub Actions:

1. Go to: https://github.com/canvango/canvango-group/actions
2. Look for failed workflows
3. Check if any workflow is blocking Vercel

### Check Vercel Hooks:

1. Vercel Dashboard → Settings → Git
2. Check "Deploy Hooks"
3. Make sure no hooks are blocking deployment

---

## Verification Steps

After fixing integration:

### 1. Test Auto-Deploy

```bash
# Make a small change
echo "# Test" >> README.md

# Commit and push
git add README.md
git commit -m "test: verify auto-deploy"
git push
```

### 2. Check Vercel Dashboard

- Go to Deployments tab
- Should see new deployment triggered
- Status: Building → Deploying → Ready

### 3. Verify Deployment

```bash
curl https://canvango.com/api/tripay-callback
```

Expected: Response (not 404)

---

## Quick Checklist

- [ ] Vercel project connected to GitHub repo
- [ ] GitHub App has access to repository
- [ ] Auto-deploy enabled in Vercel settings
- [ ] Production branch set to `main`
- [ ] No build errors in logs
- [ ] vercel.json configuration correct
- [ ] Test commit triggers deployment

---

## If All Else Fails

### Option 1: Recreate Vercel Project

1. Delete current Vercel project
2. Create new project
3. Import from GitHub
4. Select repository
5. Configure settings
6. Deploy

### Option 2: Use Vercel CLI Exclusively

```bash
# Always deploy via CLI
vercel --prod
```

### Option 3: Use GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Current Recommended Action

**For Now (Quick Fix):**
1. Manual deploy via Vercel Dashboard
2. Or use Vercel CLI: `vercel --prod`

**For Long Term (Fix Integration):**
1. Check Vercel Settings → Git
2. Verify GitHub App permissions
3. Test auto-deploy with small commit

---

**Time to Fix:**
- Manual deploy: 2-3 minutes
- Fix integration: 5-10 minutes

**Priority:** 
- 🔴 HIGH - Manual deploy now
- 🟡 MEDIUM - Fix integration later
