# Vercel Deployment Checklist

## ⚠️ CRITICAL: Environment Variables

Sebelum test deployment, **WAJIB** set environment variables di Vercel Dashboard:

### 📍 How to Set Environment Variables

1. Go to: https://vercel.com/dashboard
2. Select your project: `canvango-group`
3. Go to: **Settings** → **Environment Variables**
4. Add each variable below

### 🔑 Required Variables

Copy-paste dari `.env` lokal Anda:

```bash
# Backend - Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Backend - JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars

# Frontend - Supabase (must start with VITE_)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Frontend - Turnstile
VITE_TURNSTILE_SITE_KEY=0x4AAAAAAA...

# Optional
NODE_ENV=production
```

### ⚙️ Environment Settings

For each variable, set:
- **Environment**: Production, Preview, Development (check all 3)
- **Value**: Paste the value from your local `.env`

### ✅ Verification

After adding all variables:
1. Click **Save**
2. Go to **Deployments** tab
3. Click **Redeploy** on latest deployment
4. Wait for build to complete

## 🔍 Troubleshooting Steps

### Step 1: Check Build Logs

1. Go to Vercel Dashboard
2. Click on latest deployment
3. Check **Build Logs** tab
4. Look for errors

**Common Issues:**
- ❌ Missing environment variables
- ❌ TypeScript compilation errors
- ❌ Missing dependencies

### Step 2: Check Function Logs

1. Go to **Runtime** → **Functions**
2. Click on `server.js`
3. Check **Logs** tab

**Common Issues:**
- ❌ `Cannot find module './server/dist/index.js'`
  - **Fix**: Make sure `npm run build:server` runs in build
- ❌ `Missing environment variable: SUPABASE_URL`
  - **Fix**: Add environment variables in dashboard
- ❌ `Connection refused`
  - **Fix**: Check Supabase URL is correct

### Step 3: Test Endpoints

```bash
# Test homepage
curl https://canvango-group.vercel.app/

# Test API health
curl https://canvango-group.vercel.app/api/health

# Test login page
curl https://canvango-group.vercel.app/login
```

**Expected Results:**
- ✅ Homepage: Returns HTML
- ✅ API: Returns JSON response
- ✅ Login: Returns HTML (not 404!)

## 🐛 Common Errors & Solutions

### Error: 500 FUNCTION_INVOCATION_FAILED

**Cause:** Server initialization failed

**Solutions:**
1. ✅ Check environment variables are set
2. ✅ Check build logs for errors
3. ✅ Check function logs for stack trace
4. ✅ Verify `server/dist/index.js` exists after build

### Error: 404 NOT_FOUND

**Cause:** Route not configured properly

**Solutions:**
1. ✅ Check `vercel.json` exists
2. ✅ Verify routes configuration
3. ✅ Redeploy after changes

### Error: Cannot find module

**Cause:** Build didn't complete properly

**Solutions:**
1. ✅ Check `package.json` build script
2. ✅ Verify both frontend and backend build
3. ✅ Check build logs for errors

### Error: Missing environment variable

**Cause:** Environment variables not set in Vercel

**Solutions:**
1. ✅ Go to Settings → Environment Variables
2. ✅ Add all required variables
3. ✅ Redeploy after adding variables

## 📊 Deployment Status

### Current Status: 🔄 In Progress

- [x] TypeScript build errors fixed
- [x] Vercel configuration created
- [x] Server.js made serverless-compatible
- [ ] Environment variables set in Vercel
- [ ] Deployment successful
- [ ] Application accessible

### Next Actions:

1. **Set environment variables** in Vercel Dashboard
2. **Redeploy** from Vercel Dashboard
3. **Test** all endpoints
4. **Verify** login works

## 🎯 Success Criteria

Deployment is successful when:

1. ✅ Build completes without errors
2. ✅ Function deploys successfully
3. ✅ Homepage loads: `https://canvango-group.vercel.app/`
4. ✅ Login page loads: `https://canvango-group.vercel.app/login`
5. ✅ API responds: `https://canvango-group.vercel.app/api/health`
6. ✅ Can login with test credentials
7. ✅ Dashboard loads after login

## 📝 Notes

### Why Environment Variables Are Critical

- ❌ Vercel **DOES NOT** read `.env` files
- ✅ Must set variables in Vercel Dashboard
- ✅ Variables are injected at build time (VITE_*) and runtime (others)
- ✅ Changes require redeploy

### Build Process

```
1. npm install          → Install dependencies
2. npm run build        → Build frontend + backend
   ├─ vite build        → dist/
   └─ tsc -p server/    → server/dist/
3. Deploy server.js     → Serverless function
4. Deploy dist/         → Static files
```

### Architecture

```
Request → Vercel Edge
           ↓
       server.js (Serverless Function)
           ↓
    ┌──────┴──────┐
    ↓             ↓
/api/*        Other routes
    ↓             ↓
Backend       index.html
(Express)     (React SPA)
```

## 🔗 Quick Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Project Settings**: https://vercel.com/[your-username]/canvango-group/settings
- **Environment Variables**: https://vercel.com/[your-username]/canvango-group/settings/environment-variables
- **Deployments**: https://vercel.com/[your-username]/canvango-group/deployments
- **Function Logs**: https://vercel.com/[your-username]/canvango-group/logs

---

**Last Updated**: 2025-11-21
**Status**: 🔄 Waiting for environment variables configuration
