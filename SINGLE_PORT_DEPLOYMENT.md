# Single Port Deployment Guide

## 📋 Overview

Frontend dan backend sekarang berjalan di **satu port** untuk production deployment.

```
Port 3000 (Production)
├── /api/*     → Backend API (Express)
├── /*         → Frontend (React Static Files)
```

---

## 🚀 Development Mode

### **Opsi 1: Separate Ports (Recommended untuk Development)**

```bash
# Terminal 1: Frontend (Port 5173)
npm run dev

# Terminal 2: Backend (Port 5000)
npm run dev:backend
```

**Akses:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

### **Opsi 2: Concurrent (Jalankan Bersamaan)**

```bash
npm run dev:all
```

---

## 🏭 Production Mode

### **Build & Start**

```bash
# 1. Build frontend dan backend
npm run build

# 2. Start production server
npm start
```

**Akses:**
- Frontend & API: http://localhost:3000
- API Endpoint: http://localhost:3000/api

---

## 📁 File Structure

```
canvango-app/
├── server.js                    # Production server entry point
├── dist/                        # Built frontend files
├── canvango-app/
│   └── backend/
│       ├── src/                 # Backend source
│       └── dist/                # Built backend files
└── src/                         # Frontend source
```

---

## 🔧 Configuration

### **Environment Variables**

```env
# .env
NODE_ENV=production
PORT=3000

# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx

# Backend
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx
JWT_SECRET=xxx
JWT_REFRESH_SECRET=xxx
```

### **Backend .env**

```env
# canvango-app/backend/.env
NODE_ENV=production
PORT=5000  # Not used in production (served via server.js)

SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx
JWT_SECRET=xxx
JWT_REFRESH_SECRET=xxx
```

---

## ✅ Benefits

### **1. No CORS Issues**
```typescript
// Backend: canvango-app/backend/src/index.ts
// CORS disabled in production (same origin)
if (process.env.NODE_ENV === 'development') {
  app.use(cors(corsOptions));
}
```

### **2. Simpler Deployment**
- ✅ Single service to deploy
- ✅ Single domain/port
- ✅ Single SSL certificate
- ✅ Lower hosting cost

### **3. Better Security**
- ✅ No cross-origin requests
- ✅ Cookies work seamlessly
- ✅ Same-site policy enforced

---

## 🔄 How It Works

### **Request Flow**

```
Browser Request
    ↓
http://localhost:3000/api/products
    ↓
server.js (Port 3000)
    ↓
Check if /api/* → Route to Backend API
    ↓
Express Backend Handler
    ↓
Response
```

```
Browser Request
    ↓
http://localhost:3000/dashboard
    ↓
server.js (Port 3000)
    ↓
Not /api/* → Serve index.html
    ↓
React Router handles /dashboard
    ↓
Frontend Page
```

---

## 🐛 Troubleshooting

### **Issue: "Cannot find module './canvango-app/backend/dist/index.js'"**

**Solution:**
```bash
# Build backend first
cd canvango-app/backend
npm run build
cd ../..

# Then start server
npm start
```

### **Issue: API returns 404**

**Check:**
1. Backend routes are prefixed with `/api`
2. Backend is built (`canvango-app/backend/dist/` exists)
3. Environment variables are set

### **Issue: Frontend shows blank page**

**Check:**
1. Frontend is built (`dist/` folder exists)
2. `dist/index.html` exists
3. Check browser console for errors

---

## 📦 Deployment

### **Vercel / Netlify**

```json
// vercel.json
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
      "src": "/api/(.*)",
      "dest": "server.js"
    },
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

### **Railway / Render**

```yaml
# railway.toml
[build]
builder = "NIXPACKS"
buildCommand = "npm run build"

[deploy]
startCommand = "npm start"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

### **Docker**

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY canvango-app/backend/package*.json ./canvango-app/backend/

# Install dependencies
RUN npm ci
RUN cd canvango-app/backend && npm ci

# Copy source
COPY . .

# Build
RUN npm run build

# Expose port
EXPOSE 3000

# Start
CMD ["npm", "start"]
```

---

## 🔙 Rollback to Separate Ports

Jika ada masalah, rollback dengan:

```bash
# 1. Restore CORS config
git checkout canvango-app/backend/src/index.ts

# 2. Restore Vite proxy
git checkout vite.config.ts

# 3. Restore package.json scripts
git checkout package.json

# 4. Delete server.js
rm server.js

# 5. Run separate servers
npm run dev              # Frontend
npm run dev:backend      # Backend
```

---

## 📝 Notes

1. **Development**: Tetap pakai separate ports (5173 & 5000)
2. **Production**: Pakai single port (3000)
3. **CORS**: Disabled di production, enabled di development
4. **Proxy**: Vite proxy hanya untuk development
5. **Build**: Harus build frontend DAN backend sebelum start

---

## ✅ Checklist

- [x] server.js created
- [x] Backend CORS conditional
- [x] Backend export app
- [x] Vite proxy updated
- [x] Package.json scripts updated
- [x] API base URL updated
- [x] Documentation created

---

## 🎉 Success!

Aplikasi sekarang bisa:
- ✅ Development: Separate ports (5173 & 5000)
- ✅ Production: Single port (3000)
- ✅ No CORS issues
- ✅ Easy deployment
- ✅ Better security

**Test Production Mode:**
```bash
npm run build
npm start
```

**Open:** http://localhost:3000
