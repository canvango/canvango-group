# Vercel Deployment Guide - Full Stack App

## 🎯 Problem Analysis

### Issue: 404 NOT_FOUND on Login Page

**Symptoms:**
- ✅ Localhost works perfectly
- ❌ Vercel shows 404 error on `/login` route
- ❌ Error: `NOT_FOUND` with code `NOT_FOUND`

**Root Cause:**
Vercel doesn't know how to handle client-side routing (React Router) for a full-stack application. By default, Vercel treats each route as a separate file, causing 404 errors for SPA routes.

## 🏗️ Architecture

This is a **full-stack application** with:

```
┌─────────────────────────────────────┐
│         server.js (Entry)           │
│  ┌───────────────────────────────┐  │
│  │   Express Backend (API)       │  │
│  │   - /api/* routes             │  │
│  │   - Authentication            │  │
│  │   - Database operations       │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │   Static Frontend (SPA)       │  │
│  │   - React + Vite build        │  │
│  │   - Client-side routing       │  │
│  │   - /login, /dashboard, etc   │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

## ✅ Solution: Vercel Configuration

### 1. Create `vercel.json`

```json
{
  "version": 2,
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

**Explanation:**
- **builds**: Tell Vercel to build `server.js` as a Node.js serverless function
- **routes**: Route ALL requests to `server.js` (including SPA routes)
- Server handles both API routes and SPA fallback internally

### 2. How `server.js` Works

```javascript
// 1. Mount backend API routes
app.use('/api', backendApp);

// 2. Serve static frontend files
app.use(express.static('dist'));

// 3. SPA fallback - serve index.html for non-API routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
```

**Flow:**
1. Request comes to Vercel
2. Vercel routes to `server.js`
3. If `/api/*` → Express API handler
4. If other route → Serve `index.html` (React Router takes over)

## 🔧 Environment Variables

### Required in Vercel Dashboard

Go to: **Project Settings → Environment Variables**

```bash
# Supabase Configuration
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT Configuration
JWT_SECRET=your-jwt-secret-key
JWT_REFRESH_SECRET=your-jwt-refresh-secret-key

# Vite Frontend Variables (must start with VITE_)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_TURNSTILE_SITE_KEY=your-turnstile-site-key

# Optional
NODE_ENV=production
PORT=3000
```

## 📦 Build Configuration

### Build Commands (Automatic)

Vercel will run:
```bash
npm run build
```

Which executes:
```bash
npm run build:frontend  # Vite build → dist/
npm run build:server    # TypeScript → server/dist/
```

### Output Structure

```
dist/                    # Frontend build
├── index.html
├── assets/
│   ├── index-xxx.js
│   └── index-xxx.css
└── ...

server/dist/            # Backend build
├── index.js
├── controllers/
├── models/
└── ...

server.js               # Entry point (combines both)
```

## 🚀 Deployment Steps

### 1. Push to GitHub

```bash
git add vercel.json
git commit -m "fix: add Vercel configuration for full-stack deployment"
git push origin main
```

### 2. Vercel Auto-Deploy

Vercel will automatically:
1. ✅ Detect push to `main` branch
2. ✅ Run `npm install`
3. ✅ Run `npm run build`
4. ✅ Deploy `server.js` as serverless function
5. ✅ Deploy static files from `dist/`

### 3. Verify Deployment

Check these URLs:
- ✅ `https://your-app.vercel.app/` → Should load homepage
- ✅ `https://your-app.vercel.app/login` → Should load login page (not 404!)
- ✅ `https://your-app.vercel.app/api/health` → Should return API response

## 🐛 Troubleshooting

### Issue: Still Getting 404

**Check:**
1. ✅ `vercel.json` exists in root directory
2. ✅ Environment variables are set in Vercel dashboard
3. ✅ Build logs show successful build
4. ✅ `server.js` is in root directory

**Solution:**
```bash
# Force redeploy
git commit --allow-empty -m "trigger redeploy"
git push origin main
```

### Issue: API Routes Not Working

**Check:**
1. ✅ API routes are prefixed with `/api`
2. ✅ Backend environment variables are set
3. ✅ Supabase credentials are correct

**Test:**
```bash
curl https://your-app.vercel.app/api/health
```

### Issue: Environment Variables Not Working

**Check:**
1. ✅ Variables are set in Vercel dashboard (not just .env file)
2. ✅ Frontend variables start with `VITE_`
3. ✅ Redeploy after adding variables

**Note:** Vercel doesn't read `.env` files. You must set variables in the dashboard.

### Issue: Build Fails

**Check Build Logs:**
1. Go to Vercel dashboard
2. Click on failed deployment
3. Check "Build Logs" tab
4. Look for TypeScript errors or missing dependencies

**Common Fixes:**
```bash
# Locally test build
npm run build

# Check for TypeScript errors
npm run build:server
```

## 📊 Monitoring

### Check Deployment Status

1. **Vercel Dashboard**: https://vercel.com/dashboard
2. **Deployment Logs**: Click on deployment → View logs
3. **Function Logs**: Runtime → Functions → View logs

### Performance

- ✅ Cold start: ~1-2 seconds (first request)
- ✅ Warm requests: ~100-300ms
- ✅ Static assets: Cached on CDN

## 🔐 Security Checklist

- ✅ Environment variables set in Vercel (not in code)
- ✅ JWT secrets are strong and unique
- ✅ Supabase RLS policies enabled
- ✅ CORS configured properly
- ✅ Helmet middleware enabled
- ✅ Rate limiting configured

## 📝 Notes

### Why This Configuration?

**Alternative 1: Separate Frontend/Backend**
- ❌ More complex setup
- ❌ CORS issues
- ❌ Two deployments to manage

**Alternative 2: Static SPA Only**
- ❌ Can't use server-side logic
- ❌ Exposes API keys
- ❌ No backend processing

**Our Solution: Combined Deployment** ✅
- ✅ Single deployment
- ✅ No CORS issues
- ✅ Server-side logic available
- ✅ Secure API keys
- ✅ Simpler architecture

### Vercel Limitations

- ⚠️ Serverless functions have 10-second timeout (Hobby plan)
- ⚠️ 50MB function size limit
- ⚠️ Cold starts on first request
- ✅ Unlimited bandwidth (Hobby plan)
- ✅ Automatic HTTPS
- ✅ Global CDN

## 🎉 Success Criteria

Your deployment is successful when:

1. ✅ Build completes without errors
2. ✅ Homepage loads at root URL
3. ✅ Login page loads at `/login` (no 404!)
4. ✅ API endpoints respond at `/api/*`
5. ✅ Authentication works
6. ✅ Database operations work
7. ✅ No console errors in browser

## 🔗 Resources

- [Vercel Node.js Documentation](https://vercel.com/docs/functions/serverless-functions/runtimes/node-js)
- [Vercel Configuration](https://vercel.com/docs/projects/project-configuration)
- [Express on Vercel](https://vercel.com/guides/using-express-with-vercel)

---

**Last Updated**: 2025-11-21
**Status**: ✅ Configured and Ready for Deployment
