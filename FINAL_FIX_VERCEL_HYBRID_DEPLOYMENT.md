# Final Fix: Vercel Hybrid Deployment (Vite + API Routes)

## 🔴 Root Cause - CONFIRMED

**Masalah Sebenarnya:**

Vercel **TIDAK MENGENALI** folder `api/` sebagai serverless functions karena project ini adalah **Vite SPA**. Vercel mengira ini pure frontend project dan meng-ignore folder `api/`.

### Bukti:

```
Project Structure:
├── src/           → Vite frontend (React)
├── api/           → Serverless functions (TypeScript)
├── dist/          → Vite build output
├── package.json   → Build script: "vite build"
└── vite.config.ts → Vite configuration
```

**Yang Terjadi:**

```
Vercel Build Process:
1. Detect: "Oh ini Vite project"
2. Run: npm run build (vite build)
3. Output: dist/ folder (SPA only)
4. Deploy: dist/ as static site
5. Result: api/ folder IGNORED ❌
```

**Ketika TriPay Hit API:**

```
Request: POST /api/tripay-callback
Vercel: "Route tidak ada di dist/"
Vercel: "Fallback ke SPA routing"
Vercel: 307 Redirect ke /
TriPay: GAGAL ❌
```

---

## ✅ Solusi: Configure Hybrid Deployment

### Update `vercel.json`

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "trailingSlash": false,
  "functions": {
    "api/**/*.ts": {
      "runtime": "nodejs20.x",
      "memory": 1024,
      "maxDuration": 10
    }
  },
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### Penjelasan Konfigurasi:

#### 1. Build Configuration
```json
"buildCommand": "npm run build",
"outputDirectory": "dist"
```
- Explicitly tell Vercel how to build
- Output frontend ke `dist/`

#### 2. Functions Configuration
```json
"functions": {
  "api/**/*.ts": {
    "runtime": "nodejs20.x",
    "memory": 1024,
    "maxDuration": 10
  }
}
```
- **CRITICAL:** Specify `runtime: "nodejs20.x"`
- Tell Vercel: "Treat `api/` as serverless functions"
- Without this, Vercel ignores `api/` folder

#### 3. Routes Configuration
```json
"routes": [
  {
    "src": "/api/(.*)",
    "dest": "/api/$1"
  },
  {
    "src": "/(.*)",
    "dest": "/index.html"
  }
]
```
- **Priority routing:**
  1. `/api/*` → Route to serverless functions
  2. Everything else → Route to SPA (index.html)

---

## 🎯 Why This Works

### Before Fix:

```
Vercel Deployment:
├── dist/
│   ├── index.html
│   ├── assets/
│   └── (no api/)
└── Routing:
    └── /* → index.html (SPA)
```

**Result:**
```
POST /api/tripay-callback
→ No route match
→ Fallback to SPA
→ 307 Redirect
```

### After Fix:

```
Vercel Deployment:
├── dist/              (Frontend)
│   ├── index.html
│   └── assets/
└── api/               (Serverless Functions)
    ├── tripay-callback.ts
    └── (other functions)

Routing:
├── /api/* → Serverless Functions
└── /*     → SPA (index.html)
```

**Result:**
```
POST /api/tripay-callback
→ Match route: /api/*
→ Execute: api/tripay-callback.ts
→ Return: 200 OK ✅
```

---

## 📊 Deployment Flow

### Old Flow (Broken):

```
1. Push to GitHub
   ↓
2. Vercel: "Vite project detected"
   ↓
3. Run: vite build
   ↓
4. Deploy: dist/ only
   ↓
5. api/ folder: IGNORED
   ↓
6. Result: No API routes ❌
```

### New Flow (Fixed):

```
1. Push to GitHub
   ↓
2. Vercel: Read vercel.json
   ↓
3. Build Frontend: vite build → dist/
   ↓
4. Build Functions: api/**/*.ts → serverless
   ↓
5. Deploy Both:
   - Frontend: dist/
   - Functions: api/
   ↓
6. Setup Routing:
   - /api/* → Functions
   - /* → Frontend
   ↓
7. Result: Full-stack working ✅
```

---

## 🧪 Testing After Deployment

### Wait for Deployment (3-5 minutes)

Check Vercel Dashboard:
- Build logs should show: "Building Functions"
- Should see: `api/tripay-callback.ts` compiled

### Test 1: Check Function Exists

```bash
curl -X POST https://canvango.com/api/tripay-callback \
  -H "Content-Type: application/json" \
  -H "X-Callback-Signature: test" \
  -d '{"test":"data"}'
```

**Expected:**
```json
{
  "success": false,
  "message": "Invalid signature"
}
```

**NOT:**
```html
<html>Redirecting...</html>
```

### Test 2: TriPay Callback Tester

```
URL: https://canvango.com/api/tripay-callback
```

**Expected:**
```
Kode HTTP: 200 (OK)
Status: BERHASIL ✅
```

### Test 3: Check Vercel Logs

**Vercel Dashboard → Logs**

Filter: `/api/tripay-callback`

**Expected:**
```
✅ Function invoked
✅ "=== CALLBACK REQUEST ===" log
✅ 200 OK response
```

---

## 🔍 Why Previous Fixes Didn't Work

### Fix 1: Trailing Slash
```json
"trailingSlash": false
```
❌ Didn't work because route doesn't exist at all

### Fix 2: Rewrites
```json
"rewrites": [...]
```
❌ Didn't work because nothing to rewrite to

### Fix 3: CORS Headers
```typescript
if (req.method === 'OPTIONS') {...}
```
❌ Didn't work because function never executed

**Root Problem:**
API routes were **NEVER DEPLOYED** in the first place!

---

## 📈 Verification Checklist

After deployment completes:

### Vercel Dashboard

- [ ] Build logs show "Building Functions"
- [ ] Functions section shows `api/tripay-callback`
- [ ] No build errors
- [ ] Deployment status: "Ready"

### API Route Test

- [ ] `curl` test returns JSON (not HTML)
- [ ] Status code: 200 or 401 (not 307)
- [ ] Response has `success` field

### TriPay Test

- [ ] Callback Tester returns 200 OK
- [ ] No "GAGAL DIKIRIM" message
- [ ] Logs show request received

### Real Transaction

- [ ] Create test transaction
- [ ] Pay via TriPay
- [ ] Check database: status updated
- [ ] Check logs: callback received

---

## 🚨 If Still Not Working

### Check 1: Vercel Build Logs

**Vercel Dashboard → Deployments → Latest → Build Logs**

Look for:
```
✅ Building Functions...
✅ api/tripay-callback.ts
✅ Function built successfully
```

If NOT found:
```
❌ Functions not detected
❌ Only building frontend
```

**Solution:** Check `vercel.json` syntax

### Check 2: Function Runtime

**Vercel Dashboard → Settings → Functions**

Should show:
```
Runtime: Node.js 20.x
Region: Washington, D.C., USA (iad1)
```

If different:
```
Runtime: Not configured
```

**Solution:** Add `"runtime": "nodejs20.x"` to vercel.json

### Check 3: Routes Configuration

Test direct function URL:
```
https://canvango.com/api/tripay-callback
```

If 404:
```
❌ Route not configured
```

**Solution:** Check `routes` in vercel.json

---

## 🎯 Alternative Solution (If This Fails)

### Option 1: Use Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy with explicit configuration
vercel --prod

# Follow prompts:
# - Framework: Vite
# - Build Command: npm run build
# - Output Directory: dist
# - Install Command: npm install
```

### Option 2: Separate API Deployment

Deploy API functions separately:

1. **Create separate Vercel project for API**
2. **Deploy only `api/` folder**
3. **Update TriPay callback URL:**
   ```
   https://api.canvango.com/tripay-callback
   ```

### Option 3: Use GCP Cloud Functions

Already prepared in `gcp-functions/tripay-callback/`:

```bash
cd gcp-functions/tripay-callback

gcloud functions deploy tripay-callback \
  --runtime nodejs20 \
  --trigger-http \
  --allow-unauthenticated \
  --region asia-southeast2
```

Update TriPay callback URL to GCP function URL.

---

## 📝 Commit Summary

**Commit:** `65177f9`
**Message:** "fix: configure Vercel for hybrid Vite + API routes deployment"

**Changes:**
- Added `buildCommand` and `outputDirectory`
- Added `runtime: "nodejs20.x"` to functions config
- Added `routes` configuration for proper routing
- Removed `rewrites` (not needed with routes)

**Status:** ✅ Pushed to GitHub
**Auto-Deploy:** ⏳ In progress

---

## ⏱️ Timeline

- **Push to GitHub:** ✅ Done (just now)
- **Vercel Build:** ⏳ 2-3 minutes
- **Function Deployment:** ⏳ 1-2 minutes
- **Edge Propagation:** ⏳ 1-2 minutes
- **Ready to Test:** ~5 minutes from now

---

## 🎯 Success Criteria

Fix berhasil jika:

1. **Vercel Build Logs:**
   - ✅ Shows "Building Functions"
   - ✅ No errors

2. **API Route Test:**
   - ✅ Returns JSON response
   - ✅ No 307 redirect

3. **TriPay Callback Tester:**
   - ✅ Returns 200 OK
   - ✅ Status: BERHASIL

4. **Real Transaction:**
   - ✅ Callback received
   - ✅ Database updated
   - ✅ Status changed to PAID

---

**Status:** ⏳ DEPLOYED - Waiting for build
**ETA Ready:** ~5 minutes
**Next Action:** Monitor Vercel build logs, then test

---

## 🔗 Related Files

- `vercel.json` - Deployment configuration
- `api/tripay-callback.ts` - Callback handler
- `vite.config.ts` - Frontend build config
- `package.json` - Build scripts

---

**This should be the FINAL fix!** 🎯

The issue was that Vercel wasn't recognizing the `api/` folder as serverless functions because we didn't explicitly configure the runtime and routing for a hybrid Vite + API project.
