# Product Account Authentication Fix

## 🐛 Masalah

Error 401 (Unauthorized) saat mengakses endpoint `/admin/products` dan mencoba mengelola Account Pool:

```
Failed to load resource: the server responded with a status of 401 (Unauthorized)
/api/product-accounts/fields/ce130862-9597-4139-b48d-73dcc03daeb2
/api/product-accounts/accounts/ce130862-9597-4139-b48d-73dcc03daeb2
```

## 🔍 Root Cause

**Mismatch antara cara frontend mengirim token dan cara backend menerima token:**

1. **Backend** (`server/src/middleware/auth.middleware.ts`):
   - Mengharapkan token di **Authorization header**: `Bearer <token>`
   
2. **Frontend** (`src/features/admin/services/productAccount.service.ts`):
   - Menggunakan `axios` langsung dengan `withCredentials: true`
   - Tidak mengirim Authorization header
   - Tidak menggunakan API client yang sudah dikonfigurasi dengan interceptor

## ✅ Solusi

### File yang Diubah: `src/features/admin/services/productAccount.service.ts`

**Sebelum:**
```typescript
import axios from 'axios';

const API_BASE = '/api/product-accounts';

export const fetchAccountFields = async (productId: string) => {
  const response = await axios.get(`${API_BASE}/fields/${productId}`, { 
    withCredentials: true 
  });
  return response.data.data;
};
```

**Sesudah:**
```typescript
import api from '../../member-area/utils/api';

const API_BASE = '/product-accounts';

export const fetchAccountFields = async (productId: string) => {
  const response = await api.get(`${API_BASE}/fields/${productId}`);
  return response.data.data;
};
```

### Perubahan yang Dilakukan:

1. ✅ **Ganti import**: `axios` → `api` (configured axios instance)
2. ✅ **Ganti base URL**: `/api/product-accounts` → `/product-accounts` (api client sudah include `/api`)
3. ✅ **Hapus `withCredentials`**: Tidak perlu karena interceptor sudah handle token
4. ✅ **Semua method diupdate**: GET, POST, PUT, DELETE

### Keuntungan Menggunakan API Client:

```typescript
// src/features/member-area/utils/api.ts
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  
  return config;
});
```

- ✅ Otomatis menambahkan Authorization header
- ✅ Auto-refresh token jika expired (401)
- ✅ Konsisten dengan service lain
- ✅ Centralized error handling

## 🧪 Testing

1. Login sebagai admin
2. Buka `/admin/products`
3. Klik produk untuk membuka detail modal
4. Klik tab "Account Pool"
5. Klik "Add Field" untuk menambah field definition
6. Klik "Add Account" untuk menambah account

**Expected Result:**
- ✅ Tidak ada error 401
- ✅ Fields dan accounts berhasil di-fetch
- ✅ CRUD operations berfungsi normal

## 📝 Catatan

Service lain yang sudah benar menggunakan API client:
- `src/features/member-area/services/products.service.ts`
- `src/features/member-area/services/adminClaimService.ts`
- `src/features/member-area/services/bmStats.service.ts`
- `src/features/member-area/services/personalStats.service.ts`

**Best Practice:** Selalu gunakan `api` client, bukan `axios` langsung!
