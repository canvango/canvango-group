# Fix: Saldo Tidak Sinkron di Purchase Modal

## 🐛 Masalah

User `member1` memiliki saldo **Rp 2.000.000** di database, tetapi ketika mencoba membeli produk **BM Verified - Basic** (Rp 500.000), muncul error "Saldo Anda tidak mencukupi untuk pembelian ini".

### Screenshot Masalah
- Saldo di database: **Rp 2.000.000** ✅
- Harga produk: **Rp 500.000** ✅
- Error yang muncul: "Saldo tidak mencukupi" ❌

## 🔍 Root Cause Analysis

### 1. Format Data Tidak Konsisten

**Backend (Supabase):**
```typescript
// server/src/controllers/user.controller.ts
const userProfile = {
  id: user.id,
  username: user.username,
  email: user.email,
  full_name: user.full_name,  // ❌ snake_case
  role: user.role,
  balance: user.balance,       // ⚠️ Dari Postgres numeric -> string "2000000.00"
  created_at: user.created_at, // ❌ snake_case
  updated_at: user.updated_at, // ❌ snake_case
  last_login_at: user.last_login_at, // ❌ snake_case
};
```

**Frontend (React):**
```typescript
// src/features/member-area/types/user.ts
export interface User {
  id: string;
  username: string;
  email: string;
  fullName?: string;      // ✅ camelCase
  role: 'guest' | 'member' | 'admin';
  balance: number;        // ✅ Expects number
  createdAt?: string;     // ✅ camelCase
  updatedAt?: string;     // ✅ camelCase
  lastLoginAt?: string;   // ✅ camelCase
}
```

### 2. Masalah Spesifik

1. **Key Mismatch**: Backend mengirim `full_name`, frontend mengharapkan `fullName`
2. **Type Mismatch**: Postgres `numeric` type dikembalikan sebagai **string** `"2000000.00"`, bukan **number** `2000000`
3. **Undefined Balance**: Karena key tidak match, `userProfile.balance` menjadi `undefined`
4. **Comparison Failure**: `undefined < 500000` = `true`, sehingga muncul error "saldo tidak mencukupi"

## ✅ Solusi

### Implementasi: Transform Response di API Client

**File**: `src/features/member-area/services/api.ts`

```typescript
/**
 * Transform snake_case keys to camelCase
 */
const toCamelCase = (str: string): string => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

/**
 * Recursively transform object keys from snake_case to camelCase
 */
const transformKeysToCamelCase = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => transformKeysToCamelCase(item));
  }
  
  if (typeof obj === 'object' && obj.constructor === Object) {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = toCamelCase(key);
      let value = transformKeysToCamelCase(obj[key]);
      
      // Convert numeric strings to numbers for specific fields
      if ((camelKey === 'balance' || camelKey === 'price' || camelKey === 'amount' || camelKey === 'totalPrice' || camelKey === 'unitPrice') && typeof value === 'string') {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          value = numValue;
        }
      }
      
      acc[camelKey] = value;
      return acc;
    }, {} as any);
  }
  
  return obj;
};

// Add to response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // ... existing code ...
    
    // Transform response data keys from snake_case to camelCase
    if (response.data) {
      response.data = transformKeysToCamelCase(response.data);
    }
    
    return response;
  },
  // ... error handler ...
);
```

### Keuntungan Solusi Ini

1. ✅ **Automatic Transformation**: Semua response dari backend otomatis di-transform
2. ✅ **Type Safety**: Numeric strings di-convert ke number untuk field finansial
3. ✅ **Recursive**: Bekerja untuk nested objects dan arrays
4. ✅ **No Backend Changes**: Tidak perlu mengubah backend code
5. ✅ **Consistent**: Semua API calls mendapat benefit yang sama

## 🧪 Testing

### Before Fix
```typescript
// Response dari backend
{
  "success": true,
  "data": {
    "id": "57244e0a-d4b2-4499-937d-4fd71e90bc07",
    "username": "member1",
    "email": "member1@gmail.com",
    "full_name": "Member One",
    "balance": "2000000.00",  // ❌ String
    "created_at": "2025-11-18T10:00:00Z"
  }
}

// Di frontend
userProfile.balance = undefined  // ❌ Key tidak match
userProfile.fullName = undefined // ❌ Key tidak match
```

### After Fix
```typescript
// Response setelah transform
{
  "success": true,
  "data": {
    "id": "57244e0a-d4b2-4499-937d-4fd71e90bc07",
    "username": "member1",
    "email": "member1@gmail.com",
    "fullName": "Member One",      // ✅ camelCase
    "balance": 2000000,             // ✅ Number
    "createdAt": "2025-11-18T10:00:00Z" // ✅ camelCase
  }
}

// Di frontend
userProfile.balance = 2000000    // ✅ Correct
userProfile.fullName = "Member One" // ✅ Correct
```

### Verification Steps

1. **Login sebagai member1**
2. **Buka halaman BM Accounts**
3. **Klik "Beli" pada produk BM Verified - Basic**
4. **Verify**:
   - ✅ Saldo ditampilkan: Rp 2.000.000
   - ✅ Total pembayaran: Rp 500.000
   - ✅ Tombol "Konfirmasi Pembelian" aktif (tidak disabled)
   - ✅ Tidak ada error "saldo tidak mencukupi"

## 📊 Impact

### Files Modified
- ✅ `src/features/member-area/services/api.ts` - Added response transformer

### Affected Features
- ✅ User Profile (balance display)
- ✅ Purchase Modal (balance check)
- ✅ Dashboard (balance display)
- ✅ Transaction History (amounts)
- ✅ Top-up (amounts)
- ✅ All API responses with snake_case keys

## 🎯 Next Steps

1. **Test Purchase Flow**: Verify pembelian bisa dilakukan
2. **Test Other Features**: Verify semua fitur yang menggunakan balance
3. **Monitor Logs**: Check untuk errors terkait data transformation
4. **Consider Backend Update**: Untuk consistency, pertimbangkan update backend untuk mengirim camelCase

## 📝 Notes

- Solusi ini adalah **client-side fix** yang tidak memerlukan perubahan backend
- Transformation dilakukan di **response interceptor** sehingga transparent untuk semua API calls
- Numeric fields (`balance`, `price`, `amount`, dll) otomatis di-convert dari string ke number
- Solusi ini **backward compatible** - jika backend sudah mengirim camelCase, tidak akan rusak

## ⚠️ Potential Issues

1. **Performance**: Transformation dilakukan untuk setiap response (minimal overhead)
2. **Edge Cases**: Jika ada field yang memang harus tetap snake_case, perlu special handling
3. **Nested Objects**: Pastikan semua nested objects juga ter-transform dengan benar

## 🔗 Related Files

- `src/features/member-area/services/api.ts` - API client with transformer
- `src/features/member-area/types/user.ts` - User type definition
- `src/features/member-area/components/products/PurchaseModal.tsx` - Purchase modal
- `server/src/controllers/user.controller.ts` - Backend user controller
- `server/src/models/User.model.ts` - Backend user model
