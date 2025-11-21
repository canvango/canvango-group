# Fix Admin Products Page - Single Port Issue

## 🐛 Masalah

Setelah penggabungan port backend dan frontend, halaman `/admin/products` tidak menampilkan konten (blank/kosong).

## 🔍 Root Cause Analysis

### Masalah Utama: Double API Prefix

**Backend Routes** (`canvango-app/backend/src/index.ts`):
```typescript
// ❌ SEBELUM (SALAH)
app.use('/api/auth', authRoutes);
app.use('/api/admin/products', adminProductRoutes);
// dll...
```

**Server.js** (Production Server):
```javascript
// Mount backend dengan prefix /api
app.use('/api', backendApp);
```

**Hasil**: Endpoint menjadi `/api/api/admin/products` ❌

### Alur Request yang Salah

1. Frontend memanggil: `GET /api/admin/products`
2. Server.js mount backend di: `/api`
3. Backend routing: `/api/admin/products`
4. **Endpoint final**: `/api/api/admin/products` ❌
5. **404 Not Found** → Halaman kosong

## ✅ Solusi

### 1. Dynamic API Prefix untuk Development & Production

**File**: `canvango-app/backend/src/index.ts`

```typescript
// ✅ SETELAH (BENAR)
// Routes
// In development: use /api prefix (standalone backend)
// In production: no prefix (handled by server.js mounting)
const apiPrefix = process.env.NODE_ENV === 'production' ? '' : '/api';

app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/users`, userRoutes);
app.use(`${apiPrefix}/transactions`, transactionRoutes);
app.use(`${apiPrefix}/topup`, topupRoutes);
app.use(`${apiPrefix}/claims`, claimRoutes);
app.use(`${apiPrefix}/tutorials`, tutorialRoutes);
app.use(`${apiPrefix}/admin/users`, adminUserRoutes);
app.use(`${apiPrefix}/admin/transactions`, adminTransactionRoutes);
app.use(`${apiPrefix}/admin/claims`, adminClaimRoutes);
app.use(`${apiPrefix}/admin/tutorials`, adminTutorialRoutes);
app.use(`${apiPrefix}/admin/products`, adminProductRoutes);
app.use(`${apiPrefix}/admin/audit-logs`, adminAuditLogRoutes);
app.use(`${apiPrefix}/admin/stats`, adminStatsRoutes);
app.use(`${apiPrefix}/admin/settings`, adminSettingsRoutes);
```

**Penjelasan**:
- **Development**: Backend standalone di port 5000 → gunakan `/api` prefix
- **Production**: Backend di-mount oleh server.js → tanpa prefix (server.js yang handle)

### 2. Update Server.js untuk Load Backend .env

**File**: `server.js`

```javascript
// Load environment variables from backend .env
dotenv.config({ path: './canvango-app/backend/.env' });
```

### 3. Fix Express Wildcard Route

Express versi baru tidak support `app.get('*')`, gunakan middleware:

```javascript
// ❌ SEBELUM
app.get('*', (req, res) => { ... });

// ✅ SETELAH
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ 
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'API endpoint not found'
      }
    });
  }
  res.sendFile(path.join(frontendPath, 'index.html'));
});
```

### 4. Exclude Seed File dari Build

**File**: `canvango-app/backend/tsconfig.json`

```json
{
  "exclude": ["node_modules", "dist", "**/*.test.ts", "src/database/seed.ts"]
}
```

### 5. Install Dependencies di Root

```bash
npm install express dotenv
```

## 🔧 Alur Request yang Benar

1. Frontend memanggil: `GET /api/admin/products`
2. Server.js mount backend di: `/api`
3. Backend routing: `/admin/products` (tanpa prefix)
4. **Endpoint final**: `/api/admin/products` ✅
5. **200 OK** → Data produk ditampilkan

## 📝 Langkah-langkah Fix

```bash
# 1. Update backend routes (sudah dilakukan)
# Edit: canvango-app/backend/src/index.ts

# 2. Exclude seed file dari build
# Edit: canvango-app/backend/tsconfig.json

# 3. Rebuild backend
npm run build:backend

# 4. Install dependencies di root
npm install express dotenv

# 5. Update server.js (sudah dilakukan)
# Edit: server.js

# 6. Start production server
npm start
```

## ✅ Verifikasi

### Test Health Endpoint
```bash
curl http://localhost:5000/health
# Response: {"status":"ok","message":"Canvango API is running"}
```

### Test Admin Products (dengan auth token)
```bash
# Login dulu untuk dapat token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"admin","password":"your-password"}'

# Test products endpoint
curl http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test di Browser
1. Buka: `http://localhost:5000`
2. Login sebagai admin
3. Navigate ke: `/admin/products`
4. **Expected**: Tabel produk muncul dengan 17 produk

## 📊 Database Status

```sql
SELECT COUNT(*) as total FROM products;
-- Result: 17 products
```

## 🎯 Hasil

- ✅ Backend routes tanpa double prefix
- ✅ Server production berjalan di port 5000
- ✅ Frontend dan backend terintegrasi
- ✅ Admin products endpoint accessible
- ✅ Halaman `/admin/products` menampilkan data

## 🔗 Endpoint Structure

```
Production Server (port 5000)
├── /health                    → Backend health check
├── /api/                      → Backend API (mounted)
│   ├── /auth/*               → Auth routes
│   ├── /users/*              → User routes
│   ├── /admin/products/*     → Admin product routes ✅
│   └── ...
└── /*                         → Frontend SPA (React Router)
```

## 📚 Related Files

- `server.js` - Production server
- `canvango-app/backend/src/index.ts` - Backend app
- `canvango-app/backend/tsconfig.json` - TypeScript config
- `src/features/member-area/pages/admin/ProductManagement.tsx` - Frontend page
- `src/features/member-area/utils/api.ts` - API client

## 🚀 Next Steps

1. Test semua admin endpoints
2. Verify authentication flow
3. Test CRUD operations di product management
4. Deploy ke production

## 🎉 Development Mode

Kedua server sekarang berjalan dengan benar:

```bash
# Frontend (Vite)
npm run dev
# Running at: http://localhost:5174/

# Backend (Express + tsx watch)
npm run dev:backend
# Running at: http://localhost:5000/
# API endpoints: http://localhost:5000/api/*
```

### Test Development Mode

```bash
# Test endpoint (akan return auth error, tapi endpoint ditemukan ✅)
curl http://localhost:5000/api/admin/products

# Response: {"success":false,"error":{"code":"AUTH_002","message":"Invalid or expired token"}}
# ✅ Endpoint found! (bukan 404)
```

## 🚀 Production Mode

```bash
# Build & start production server
npm run build
npm start

# Single server at: http://localhost:5000
# - Frontend: http://localhost:5000/
# - API: http://localhost:5000/api/*
```

---

**Status**: ✅ FIXED & TESTED
**Date**: 2025-01-18
**Issue**: Double API prefix causing 404 in production, wrong prefix in development
**Solution**: Dynamic API prefix based on NODE_ENV
- Development: `/api` prefix (standalone backend)
- Production: No prefix (mounted by server.js)
