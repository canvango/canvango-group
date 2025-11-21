# Vercel Setup From Scratch - Step by Step

## 📋 Prerequisites

Pastikan sudah ada:
- ✅ GitHub repository: `canvango/canvango-group`
- ✅ Code sudah ter-push ke branch `main`
- ✅ File `vercel.json` sudah ada di root
- ✅ File `server.js` sudah compatible dengan serverless

## 🚀 Step 1: Create New Vercel Project

### 1.1 Login ke Vercel

1. Go to: https://vercel.com
2. Click **Sign Up** atau **Log In**
3. Login dengan **GitHub account** (recommended)

### 1.2 Import Project

1. Click **Add New...** → **Project**
2. Select **Import Git Repository**
3. Pilih repository: `canvango/canvango-group`
4. Click **Import**

## ⚙️ Step 2: Configure Project Settings

### 2.1 Framework Preset

- **Framework Preset**: Other (atau biarkan kosong)
- **Root Directory**: `.` (default)
- **Build Command**: `npm run build` (akan otomatis terdeteksi dari vercel.json)
- **Output Directory**: `dist` (akan otomatis terdeteksi)
- **Install Command**: `npm install` (default)

### 2.2 Environment Variables

**⚠️ PENTING:** Tambahkan SEMUA environment variables sebelum deploy!

Click **Environment Variables** dan tambahkan satu per satu:

#### Backend Variables

```bash
# Supabase Configuration
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_REFRESH_SECRET=your-super-secret-refresh-key-minimum-32-characters-long
```

#### Frontend Variables (must start with VITE_)

```bash
# Supabase for Frontend
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Cloudflare Turnstile
VITE_TURNSTILE_SITE_KEY=0x4AAAAAAA...
```

#### Optional Variables

```bash
NODE_ENV=production
PORT=3000
```

**For each variable:**
- Environment: Check **Production**, **Preview**, dan **Development**
- Value: Paste dari `.env` lokal Anda

### 2.3 Deploy Settings

- **Production Branch**: `main`
- **Automatically deploy**: ✅ Enabled
- **Ignore Build Step**: ❌ Disabled

## 🎯 Step 3: Deploy

1. Click **Deploy**
2. Wait for build to complete (2-5 minutes)
3. Monitor build logs

### Expected Build Output

```
Running "npm install"
✓ Dependencies installed

Running "npm run build"
✓ Frontend built (vite build)
✓ Backend built (tsc -p server/tsconfig.json)

Building serverless function...
✓ server.js deployed

Deployment completed!
```

## ✅ Step 4: Verify Deployment

### 4.1 Check Deployment Status

1. Go to **Deployments** tab
2. Latest deployment should show **Ready**
3. Click on deployment to see details

### 4.2 Test Endpoints

```bash
# Replace with your actual Vercel URL
VERCEL_URL="https://canvango-group.vercel.app"

# Test homepage
curl $VERCEL_URL/

# Test login page (should NOT be 404!)
curl $VERCEL_URL/login

# Test API health
curl $VERCEL_URL/api/health
```

### 4.3 Test in Browser

1. Open: `https://your-project.vercel.app`
2. ✅ Homepage should load
3. ✅ Click login → Should show login page (not 404!)
4. ✅ Try to login with test credentials
5. ✅ Dashboard should load after login

## 🐛 Troubleshooting

### Issue: Build Failed

**Check Build Logs:**
1. Go to deployment
2. Click **Building** tab
3. Look for errors

**Common Issues:**
- ❌ TypeScript errors → Check `npm run build` locally
- ❌ Missing dependencies → Check `package.json`
- ❌ Environment variables → Add in settings

### Issue: 500 Internal Server Error

**Check Function Logs:**
1. Go to deployment
2. Click **Functions** tab
3. Click `server.js`
4. Check **Logs**

**Common Issues:**
- ❌ Missing environment variables
- ❌ Backend not built (check build logs)
- ❌ Supabase connection failed

### Issue: 404 on Routes

**Check:**
1. ✅ `vercel.json` exists in root
2. ✅ Routes configuration correct
3. ✅ Redeploy if needed

### Issue: Environment Variables Not Working

**Fix:**
1. Go to **Settings** → **Environment Variables**
2. Verify all variables are set
3. Check **Production** is selected
4. **Redeploy** after adding variables

## 📊 Post-Deployment Checklist

- [ ] Build completed successfully
- [ ] No errors in build logs
- [ ] Homepage loads
- [ ] Login page loads (not 404)
- [ ] Can login with credentials
- [ ] Dashboard loads after login
- [ ] API endpoints respond
- [ ] No console errors in browser
- [ ] Environment variables working

## 🔧 Configuration Files

### vercel.json (Already in repo)

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ]
}
```

### server.js (Already in repo)

- ✅ Exports handler function for Vercel
- ✅ Serves both API and frontend
- ✅ Handles SPA routing

## 🎨 Custom Domain (Optional)

### Add Custom Domain

1. Go to **Settings** → **Domains**
2. Click **Add Domain**
3. Enter your domain: `app.canvango.com`
4. Follow DNS configuration instructions
5. Wait for DNS propagation (5-60 minutes)

### DNS Configuration

Add these records to your domain:

```
Type: CNAME
Name: app (or @)
Value: cname.vercel-dns.com
```

## 📈 Monitoring

### View Logs

1. **Build Logs**: Deployments → Click deployment → Building
2. **Function Logs**: Deployments → Click deployment → Functions → server.js → Logs
3. **Analytics**: Analytics tab (requires Pro plan)

### Performance

- **Cold Start**: ~1-2 seconds (first request)
- **Warm Requests**: ~100-300ms
- **Static Assets**: Cached on CDN globally

## 🔐 Security

### Recommended Settings

1. **Environment Variables**: Never commit to git
2. **Secrets**: Use Vercel environment variables
3. **HTTPS**: Automatic (Vercel provides SSL)
4. **Headers**: Configured in backend (Helmet.js)

## 📝 Maintenance

### Update Deployment

```bash
# Make changes locally
git add .
git commit -m "your changes"
git push origin main

# Vercel auto-deploys!
```

### Manual Redeploy

1. Go to **Deployments**
2. Click **...** on latest deployment
3. Click **Redeploy**

### Rollback

1. Go to **Deployments**
2. Find previous working deployment
3. Click **...** → **Promote to Production**

## 🎯 Success Criteria

Your deployment is successful when:

1. ✅ Build completes without errors
2. ✅ All tests pass
3. ✅ Homepage accessible
4. ✅ Login works
5. ✅ Dashboard loads
6. ✅ API responds correctly
7. ✅ No 404 errors on routes
8. ✅ No 500 errors
9. ✅ Environment variables working
10. ✅ Database operations work

## 📞 Support

### Vercel Documentation

- [Vercel Docs](https://vercel.com/docs)
- [Node.js Functions](https://vercel.com/docs/functions/serverless-functions/runtimes/node-js)
- [Environment Variables](https://vercel.com/docs/projects/environment-variables)

### Project Documentation

- `VERCEL_DEPLOYMENT_GUIDE.md` - Comprehensive guide
- `VERCEL_CHECKLIST.md` - Quick checklist
- `VERCEL_BUILD_FIX.md` - TypeScript fixes

---

**Created**: 2025-11-21
**Status**: ✅ Ready for deployment
**Estimated Time**: 10-15 minutes

## 🚀 Quick Start Commands

```bash
# Verify local build works
npm run build

# Check for TypeScript errors
npm run build:server

# Test locally
npm start

# Then deploy to Vercel via dashboard
```

Good luck! 🎉
