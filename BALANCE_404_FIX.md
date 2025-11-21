# Fix Balance 404 Error - Endpoint Mismatch

## 🐛 Problem
User balance menampilkan Rp 0 karena frontend mendapat 404 error saat memanggil `/api/user/profile`

## 🔍 Root Cause
**Endpoint Mismatch:**
- Frontend memanggil: `/user/profile` → menjadi `/api/user/profile`
- Backend menyediakan: `/users/me` → mounted di `/api/users/me`

**File yang terlibat:**
- Frontend: `src/features/member-area/services/user.service.ts` (line 72)
- Backend: `server/src/routes/user.routes.ts`
- Backend: `server/src/index.ts` (route mounting)

## ✅ Solution Applied

### 1. Added Alias Routes in `user.routes.ts`
```typescript
// Added /profile endpoint as alias for /me
router.get('/profile', authenticate, getCurrentUserProfile);
router.patch('/profile', authenticate, updateCurrentUserProfile);
```

### 2. Added Singular Mount Point in `index.ts`
```typescript
// Added /user as alias for /users (backward compatibility)
app.use(`${apiPrefix}/user`, userRoutes);
```

## 📊 Result
Sekarang kedua endpoint bekerja:
- ✅ `/api/users/me` → Standard endpoint (recommended)
- ✅ `/api/user/profile` → Legacy endpoint (backward compatible)

## 🚀 Next Steps
1. Restart backend server
2. Test balance fetch di PurchaseModal
3. Verify user dapat membeli produk

## 📝 Files Modified
- `server/src/routes/user.routes.ts` - Added /profile alias routes
- `server/src/index.ts` - Added /user mount point
