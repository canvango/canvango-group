# Rollback Guide - Single Port Deployment

## 🔙 Cara Rollback Jika Ada Masalah

Jika penggabungan port menyebabkan masalah, ikuti langkah ini untuk kembali ke konfigurasi sebelumnya (separate ports).

---

## 📋 Quick Rollback (Menggunakan Backup)

### **Opsi 1: Manual Restore dari Backup**

```bash
# 1. Restore backend index.ts
Copy-Item ".backups/auto-logout-fix/api.ts.backup" "canvango-app/backend/src/index.ts" -Force

# 2. Restore vite.config.ts
git checkout vite.config.ts

# 3. Restore package.json
git checkout package.json

# 4. Restore api.ts
Copy-Item ".backups/auto-logout-fix/api.ts.backup" "src/features/member-area/services/api.ts" -Force

# 5. Delete server.js
Remove-Item server.js

# 6. Restart development servers
npm run dev              # Frontend (Port 5173)
npm run dev:backend      # Backend (Port 5000)
```

---

## 📋 Detailed Rollback Steps

### **Step 1: Restore Backend CORS**

File: `canvango-app/backend/src/index.ts`

**Kembalikan ke:**
```typescript
// Security Middleware
app.use(helmet());
app.use(cors(corsOptions));  // ← Always enabled
app.use(express.json({ limit: '10mb' }));
```

**Hapus:**
```typescript
// CORS - Only needed in development...
if (process.env.NODE_ENV === 'development') {
  app.use(cors(corsOptions));
}
```

### **Step 2: Restore Backend Server Start**

File: `canvango-app/backend/src/index.ts`

**Kembalikan ke:**
```typescript
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  logCorsConfig();
});

export default app;
```

**Hapus:**
```typescript
if (process.env.NODE_ENV !== 'production' || ...) {
  app.listen(PORT, () => { ... });
}
```

**Hapus import:**
```typescript
import { fileURLToPath } from 'url';  // ← Hapus ini
```

### **Step 3: Restore Vite Proxy**

File: `vite.config.ts`

**Kembalikan ke:**
```typescript
server: {
  host: true,
  port: 5173,
  open: true,
  strictPort: false,
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
    },
  },
},
```

### **Step 4: Restore Package.json Scripts**

File: `package.json`

**Kembalikan ke:**
```json
"scripts": {
  "build": "tsc && vite build",
  "build:tsc": "tsc",
  "dev": "vite",
  "preview": "vite preview",
  ...
}
```

**Hapus:**
```json
"build:frontend": "vite build",
"build:backend": "cd canvango-app/backend && npm run build",
"dev:backend": "cd canvango-app/backend && npm run dev",
"dev:all": "concurrently \"npm run dev\" \"npm run dev:backend\"",
"start": "node server.js",
```

### **Step 5: Restore API Base URL**

File: `src/features/member-area/services/api.ts`

**Kembalikan ke:**
```typescript
const getApiBaseUrl = (): string => {
  const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
  
  if (supabaseUrl) {
    return `${supabaseUrl}/rest/v1`;
  }
  
  return '/api';
};
```

### **Step 6: Delete New Files**

```bash
# Delete server.js
Remove-Item server.js

# Delete documentation (optional)
Remove-Item SINGLE_PORT_DEPLOYMENT.md
Remove-Item ROLLBACK_SINGLE_PORT.md
```

---

## ✅ Verification After Rollback

### **1. Start Development Servers**

```bash
# Terminal 1: Frontend
npm run dev
# Should start on http://localhost:5173

# Terminal 2: Backend
cd canvango-app/backend
npm run dev
# Should start on http://localhost:5000
```

### **2. Test Frontend**

```bash
# Open browser
http://localhost:5173

# Check:
- ✅ Page loads
- ✅ Login works
- ✅ API calls work
- ✅ No CORS errors
```

### **3. Test Backend**

```bash
# Test API directly
curl http://localhost:5000/health

# Should return:
{
  "status": "ok",
  "message": "Canvango API is running"
}
```

---

## 🐛 Troubleshooting After Rollback

### **Issue: CORS errors**

**Check:**
```typescript
// canvango-app/backend/src/index.ts
app.use(cors(corsOptions));  // ← Should be enabled
```

### **Issue: API not found**

**Check:**
```typescript
// vite.config.ts
proxy: {
  '/api': {
    target: 'http://localhost:5000',  // ← Should point to backend
    changeOrigin: true,
  },
}
```

### **Issue: Backend not starting**

**Check:**
```bash
# Make sure backend dependencies installed
cd canvango-app/backend
npm install

# Check .env file exists
ls .env

# Try starting manually
npm run dev
```

---

## 📝 Files Changed (For Reference)

Jika rollback manual, ini file yang diubah:

1. ✅ `server.js` (NEW - delete)
2. ✅ `canvango-app/backend/src/index.ts` (MODIFIED - restore)
3. ✅ `vite.config.ts` (MODIFIED - restore)
4. ✅ `package.json` (MODIFIED - restore)
5. ✅ `src/features/member-area/services/api.ts` (MODIFIED - restore)
6. ✅ `SINGLE_PORT_DEPLOYMENT.md` (NEW - delete)
7. ✅ `ROLLBACK_SINGLE_PORT.md` (NEW - delete)

---

## 🔄 Git Rollback (If Committed)

Jika sudah commit, rollback dengan Git:

```bash
# Check commit history
git log --oneline

# Rollback to previous commit
git revert HEAD

# Or reset (WARNING: loses changes)
git reset --hard HEAD~1
```

---

## ✅ Rollback Checklist

- [ ] Backend CORS restored
- [ ] Backend server start restored
- [ ] Vite proxy restored
- [ ] Package.json scripts restored
- [ ] API base URL restored
- [ ] server.js deleted
- [ ] Frontend starts on 5173
- [ ] Backend starts on 5000
- [ ] Login works
- [ ] API calls work
- [ ] No CORS errors

---

## 📞 Need Help?

Jika masih ada masalah setelah rollback:

1. Check console errors (browser & terminal)
2. Check network tab (browser DevTools)
3. Verify .env files
4. Restart both servers
5. Clear browser cache

---

## 🎯 Summary

**Before (Separate Ports):**
```
Frontend: http://localhost:5173
Backend:  http://localhost:5000
CORS:     Enabled
Proxy:    Vite proxy /api → localhost:5000
```

**After Rollback:**
```
✅ Same as before
✅ Everything works as before
✅ No changes to functionality
```
