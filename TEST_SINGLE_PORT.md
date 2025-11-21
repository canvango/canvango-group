# Test Single Port Implementation

## 🧪 Quick Test Guide

### **Test 1: Verify Files Created**

```bash
# Check if all files exist
ls server.js
ls SINGLE_PORT_DEPLOYMENT.md
ls ROLLBACK_SINGLE_PORT.md
ls SINGLE_PORT_IMPLEMENTATION_SUMMARY.md

# Should show all files
```

### **Test 2: Check Backend Build**

```bash
# Go to backend
cd canvango-app/backend

# Check if dist folder exists (if already built)
ls dist

# If not, build it
npm run build

# Should create dist/ folder with compiled files
cd ../..
```

### **Test 3: Check Frontend Build**

```bash
# Build frontend
npm run build:frontend

# Check if dist folder created
ls dist

# Should show:
# - index.html
# - assets/
# - stats.html (optional)
```

### **Test 4: Test Development Mode (Separate Ports)**

```bash
# Terminal 1: Start frontend
npm run dev

# Should start on http://localhost:5173
# Check output:
#   VITE v7.x.x  ready in xxx ms
#   ➜  Local:   http://localhost:5173/
```

```bash
# Terminal 2: Start backend
npm run dev:backend

# Should start on http://localhost:5000
# Check output:
#   🚀 Backend API Server is running on port 5000
#   📝 Environment: development
```

**Test in Browser:**
1. Open http://localhost:5173
2. Try login
3. Check Network tab - API calls should go to `/api` (proxied to 5000)
4. Should work normally

### **Test 5: Test Production Mode (Single Port)**

```bash
# 1. Build everything
npm run build

# Should run:
#   - npm run build:frontend (builds to dist/)
#   - npm run build:backend (builds to canvango-app/backend/dist/)

# 2. Start production server
npm start

# Should show:
#   🚀 ========================================
#   🚀  Canvango Server Started Successfully
#   🚀 ========================================
#   
#   📍 Server URL: http://localhost:3000
#   📍 API Base:   http://localhost:3000/api
#   📍 Frontend:   http://localhost:3000
#   
#   ✅ Backend API: Ready
#   ✅ Frontend:    Ready
```

**Test in Browser:**
1. Open http://localhost:3000
2. Frontend should load
3. Try login
4. Check Network tab - API calls should go to `/api` (same origin)
5. Should work normally
6. **No CORS errors!**

### **Test 6: Test API Endpoints**

```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Should return:
# {"status":"ok","message":"Canvango API is running"}

# Test 404 for non-existent API
curl http://localhost:3000/api/nonexistent

# Should return:
# {"success":false,"error":{"code":"NOT_FOUND","message":"API endpoint not found"}}
```

### **Test 7: Test Frontend Routes**

```bash
# Test root
curl http://localhost:3000/

# Should return HTML (index.html)

# Test dashboard route
curl http://localhost:3000/dashboard

# Should return HTML (index.html - React Router handles it)

# Test admin route
curl http://localhost:3000/admin

# Should return HTML (index.html - React Router handles it)
```

---

## ✅ Success Criteria

### **Development Mode:**
- [x] Frontend starts on port 5173
- [x] Backend starts on port 5000
- [x] Login works
- [x] API calls work (proxied)
- [x] No CORS errors
- [x] Hot reload works

### **Production Mode:**
- [x] Build succeeds (both frontend & backend)
- [x] Server starts on port 3000
- [x] Frontend loads at http://localhost:3000
- [x] API works at http://localhost:3000/api
- [x] Login works
- [x] No CORS errors
- [x] No console errors

---

## 🐛 Common Issues & Solutions

### **Issue 1: "Cannot find module './canvango-app/backend/dist/index.js'"**

**Cause:** Backend not built

**Solution:**
```bash
cd canvango-app/backend
npm run build
cd ../..
npm start
```

### **Issue 2: "EADDRINUSE: address already in use :::3000"**

**Cause:** Port 3000 already in use

**Solution:**
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID)
taskkill /PID <PID> /F

# Or use different port
$env:PORT=3001; npm start
```

### **Issue 3: Frontend shows blank page**

**Cause:** Frontend not built or build failed

**Solution:**
```bash
# Rebuild frontend
npm run build:frontend

# Check dist/ folder
ls dist

# Should have index.html and assets/
```

### **Issue 4: API returns 404**

**Cause:** Backend routes not prefixed with /api

**Solution:**
Check backend routes:
```typescript
// Should be:
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
// etc.
```

### **Issue 5: CORS errors in production**

**Cause:** CORS still enabled

**Solution:**
Check backend:
```typescript
// Should be:
if (process.env.NODE_ENV === 'development') {
  app.use(cors(corsOptions));
}
```

---

## 📊 Test Results Template

```
Date: ___________
Tester: ___________

Development Mode:
[ ] Frontend starts (5173)
[ ] Backend starts (5000)
[ ] Login works
[ ] API calls work
[ ] No errors

Production Mode:
[ ] Build succeeds
[ ] Server starts (3000)
[ ] Frontend loads
[ ] API works
[ ] Login works
[ ] No CORS errors

Notes:
_______________________
_______________________
_______________________
```

---

## 🎯 Quick Commands

```bash
# Development
npm run dev              # Frontend only
npm run dev:backend      # Backend only
npm run dev:all          # Both (concurrent)

# Production
npm run build            # Build both
npm start                # Start production server

# Testing
curl http://localhost:3000/api/health
curl http://localhost:3000/

# Cleanup
Remove-Item -Recurse -Force dist
Remove-Item -Recurse -Force canvango-app/backend/dist
```

---

## ✅ Final Checklist

Before deploying to production:

- [ ] All tests pass
- [ ] No console errors
- [ ] No network errors
- [ ] Login works
- [ ] API calls work
- [ ] Environment variables set
- [ ] .env files configured
- [ ] Documentation read
- [ ] Rollback plan understood

---

## 🎉 If All Tests Pass

**Congratulations!** 🎊

Aplikasi kamu siap untuk:
- ✅ Development (separate ports)
- ✅ Production (single port)
- ✅ Deployment

**Next steps:**
1. Commit changes to Git
2. Deploy to production platform
3. Monitor for issues
4. Celebrate! 🎉
