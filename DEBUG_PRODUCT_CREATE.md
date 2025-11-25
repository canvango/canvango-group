# Debug: Product Create Issue

## 🔍 How to Debug

### Step 1: Open Browser Console
1. Buka halaman `/admin/products`
2. Tekan **F12** atau **Ctrl+Shift+I** (Windows) / **Cmd+Option+I** (Mac)
3. Klik tab **Console**

### Step 2: Try Creating Product
1. Klik "Tambah Produk"
2. Isi semua field yang required:
   - **Product Name** ✅
   - **Product Type** ✅ (dropdown)
   - **Category** ✅ (dropdown - HARUS PILIH!)
   - **Price** ✅
3. Klik "Create Product"

### Step 3: Check Console Logs
Anda akan melihat log seperti ini:

```
🎯 handleCreateProduct called
📋 Current form data: {product_name: "...", category: "...", ...}
⏳ isSubmitting: false
✅ Validation passed, creating product...
🚀 Sending payload to API: {...}
```

**Jika berhasil:**
```
✅ Product created successfully: {id: "...", product_name: "..."}
```

**Jika gagal:**
```
❌ Error creating product: Error: ...
❌ Error details: {message: "...", code: "...", ...}
```

## 🐛 Common Errors

### Error 1: "Missing required fields"
**Cause:** Field Product Name, Category, atau Price kosong

**Solution:**
- Pastikan **Product Name** diisi
- Pastikan **Category** dipilih dari dropdown (bukan kosong)
- Pastikan **Price** diisi dengan angka

### Error 2: "Foreign key constraint violation"
**Cause:** Category yang dipilih tidak valid

**Solution:**
- Pastikan memilih category dari dropdown
- Jangan ketik manual di field category
- Refresh halaman dan coba lagi

### Error 3: "Permission denied" atau "RLS policy"
**Cause:** User tidak memiliki role admin

**Solution:**
- Pastikan login sebagai admin
- Cek role di database:
```sql
SELECT id, email, role FROM users WHERE email = 'your-email@gmail.com';
```

### Error 4: Stuck di "Saving..." tanpa error
**Cause:** Request tidak sampai ke server

**Possible causes:**
1. **Network issue** - Cek tab Network di DevTools
2. **CORS issue** - Cek console untuk CORS error
3. **Supabase client error** - Cek apakah ada error di console

**Debug steps:**
1. Buka tab **Network** di DevTools
2. Filter by "products"
3. Klik "Create Product"
4. Lihat apakah ada request POST ke `/rest/v1/products`
5. Jika tidak ada request, berarti ada error di frontend
6. Jika ada request tapi failed, klik request tersebut dan lihat Response

## 📊 What to Look For

### In Console Tab:
- `🎯 handleCreateProduct called` - Function dipanggil
- `✅ Validation passed` - Validasi berhasil
- `🚀 Sending payload` - Request dikirim
- `✅ Product created` - Berhasil
- `❌ Error` - Gagal (lihat detail error)

### In Network Tab:
- **Request URL:** `https://...supabase.co/rest/v1/products`
- **Method:** POST
- **Status:** 
  - 201 = Success ✅
  - 400 = Bad Request (validation error)
  - 403 = Forbidden (permission denied)
  - 409 = Conflict (foreign key constraint)
  - 500 = Server Error

### In Response:
```json
// Success (201)
{
  "id": "...",
  "product_name": "...",
  "category": "bm_verified",
  ...
}

// Error (400/403/409)
{
  "code": "23503",
  "message": "insert or update on table \"products\" violates foreign key constraint \"fk_products_category\"",
  "details": "Key (category)=(BM VERIFIED) is not present in table \"categories\"."
}
```

## 🔧 Quick Fixes

### Fix 1: Clear Form and Retry
```javascript
// In console, run:
location.reload();
```

### Fix 2: Check Category Value
```javascript
// In console, check what category is selected:
console.log(document.querySelector('select[name="category"]').value);
```

### Fix 3: Manual Test Insert
```sql
-- Test insert directly in Supabase SQL Editor
INSERT INTO products (
  product_name,
  product_type,
  category,
  price,
  stock_status,
  is_active
) VALUES (
  'TEST PRODUCT',
  'bm_account',
  'bm_verified',  -- Use valid slug from categories table
  100000,
  'available',
  true
);
```

## 📝 Report Issue

Jika masih gagal, screenshot dan kirim:
1. **Console logs** (semua log yang muncul)
2. **Network tab** (request dan response)
3. **Form data** (apa yang Anda isi)
4. **Error message** (jika ada)

## 🎯 Expected Behavior

**Normal flow:**
1. User mengisi form
2. User klik "Create Product"
3. Console log: `🎯 handleCreateProduct called`
4. Console log: `✅ Validation passed`
5. Console log: `🚀 Sending payload`
6. Network request: POST `/rest/v1/products` (Status 201)
7. Console log: `✅ Product created successfully`
8. Toast notification: "Product created successfully"
9. Modal closes
10. Product list refreshes

**Current issue:**
- Stuck at "Saving..." without any console logs
- OR Console shows error but no network request
- OR Network request fails with error

## 🔗 Related Files
- `src/features/member-area/pages/admin/ProductManagement.tsx` - Main component
- `src/features/member-area/services/products.service.ts` - API service
- Database: `products` table, `categories` table
