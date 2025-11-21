# Debug: Produk Tidak Muncul di Halaman /akun-bm

## 🐛 Masalah

User `member1` membuka halaman `/akun-bm` dan melihat:
- **Summary Card**: "4 Available Stock" ✅
- **Product Grid**: Tidak ada produk yang ditampilkan ❌

## 🔍 Data Verification

### Database Check ✅

```sql
SELECT 
  p.product_name,
  p.product_type,
  p.category,
  p.is_active,
  COUNT(pa.id) FILTER (WHERE pa.status = 'available') as available_stock
FROM products p
LEFT JOIN product_accounts pa ON pa.product_id = p.id
WHERE p.product_type = 'bm_account' AND p.is_active = true
GROUP BY p.id
ORDER BY p.product_name;
```

**Results:**
- BM Account - Limit 250: 3 available ✅
- BM Verified - Basic: 1 available ✅
- Total: 4 available ✅

### Frontend Query

**File**: `src/features/member-area/pages/BMAccounts.tsx`

```typescript
const { data: productsData, isLoading, error } = useProducts({
  category: ProductCategory.BM,  // 'bm'
  type: productType,              // undefined when activeCategory = 'all'
  search: searchQuery,
  sortBy,
  sortOrder,
  page: currentPage,
  pageSize: 12,
});
```

**Expected Query** (when activeCategory = 'all'):
```typescript
supabase
  .from('products')
  .select('*')
  .eq('is_active', true)
  .eq('product_type', 'bm_account')  // from category: 'bm'
  // NO filter on 'category' field because type is undefined
```

## 🎯 Possible Causes

### 1. API Response Transformer Issue ⚠️

Baru saja menambahkan transformer di `api.ts` untuk convert snake_case → camelCase:

```typescript
// src/features/member-area/services/api.ts
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Transform response data keys from snake_case to camelCase
    if (response.data) {
      response.data = transformKeysToCamelCase(response.data);
    }
    return response;
  }
);
```

**TAPI**: `products.service.ts` menggunakan **Supabase client langsung**, bukan axios API client!

```typescript
// src/features/member-area/services/products.service.ts
import { supabase } from './supabase';  // ❌ Tidak melalui API client

export const fetchProducts = async (params) => {
  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .eq('is_active', true);
  // ...
};
```

Jadi transformer **TIDAK BERLAKU** untuk products query. ✅

### 2. Stock Calculation Issue ⚠️

```typescript
// Fetch real stock counts from product_accounts
const { data: stockData, error: stockError } = await supabase
  .from('product_accounts')
  .select('product_id')
  .in('product_id', productIds)
  .eq('status', 'available');

// Count available accounts per product
stockData.forEach((item: any) => {
  stockMap[item.product_id] = (stockMap[item.product_id] || 0) + 1;
});
```

Ini seharusnya bekerja dengan benar. ✅

### 3. Frontend Filtering Issue ⚠️

**ProductGrid.tsx** tidak memfilter produk berdasarkan stock:

```typescript
if (products.length === 0) {
  return <EmptyState />;
}
```

Jadi jika `products.length === 0`, akan muncul "No Products Found". ❌

### 4. React Query Cache Issue ⚠️

Mungkin data di-cache dan belum di-refresh setelah perubahan transformer.

## 🧪 Debugging Steps

### Step 1: Check Browser Console

Buka browser console dan lihat:

```javascript
// Di BMAccounts.tsx ada console.log
console.log('BMAccounts Debug:', {
  activeCategory,
  productType,
  searchQuery,
  sortBy,
  sortOrder,
  currentPage,
  isLoading,
  error,
  productsData,
  productsCount: productsData?.data?.length
});
```

**Expected Output:**
```javascript
{
  activeCategory: "all",
  productType: undefined,
  searchQuery: "",
  sortBy: "date",
  sortOrder: "desc",
  currentPage: 1,
  isLoading: false,
  error: null,
  productsData: {
    data: [...],  // Should have 11 products
    pagination: { total: 11, ... }
  },
  productsCount: 11
}
```

### Step 2: Check Network Tab

1. Buka DevTools → Network tab
2. Filter: `products`
3. Lihat response dari Supabase query
4. Verify:
   - Status: 200 ✅
   - Response body contains products ✅
   - `count` header shows total products ✅

### Step 3: Check React Query DevTools

1. Install React Query DevTools (jika belum)
2. Buka DevTools
3. Cari query key: `['products', ...]`
4. Lihat:
   - Status: success ✅
   - Data: should contain products ✅
   - Error: null ✅

### Step 4: Clear Cache

```javascript
// Di browser console
localStorage.clear();
sessionStorage.clear();
location.reload();
```

## ✅ Quick Fix

Jika masalahnya adalah cache, tambahkan force refresh:

```typescript
// src/features/member-area/hooks/useProducts.ts
export const useProducts = (params: FetchProductsParams) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => fetchProducts(params),
    staleTime: 0,  // ← Add this to force refresh
    cacheTime: 0,  // ← Add this to disable cache
  });
};
```

## 🔧 Permanent Fix

### Option 1: Add Logging

```typescript
// src/features/member-area/services/products.service.ts
export const fetchProducts = async (params) => {
  // ... existing code ...
  
  console.log('fetchProducts called with:', params);
  console.log('Query result:', { count, dataLength: data?.length });
  console.log('Stock map:', stockMap);
  console.log('Transformed data:', transformedData);
  
  return {
    data: transformedData,
    pagination: { ... }
  };
};
```

### Option 2: Add Error Boundary

```typescript
// src/features/member-area/pages/BMAccounts.tsx
if (productsError) {
  return (
    <div className="text-red-600">
      Error loading products: {productsError.message}
    </div>
  );
}
```

## 📊 Expected vs Actual

### Expected Behavior
1. User opens `/akun-bm`
2. Summary shows "4 Available Stock" ✅
3. Product grid shows 11 products (some with stock 0, some with stock > 0) ✅
4. Products with stock 0 show "Sold Out" button ✅
5. Products with stock > 0 show "Beli" button ✅

### Actual Behavior
1. User opens `/akun-bm`
2. Summary shows "4 Available Stock" ✅
3. Product grid shows "No Products Found" ❌

## 🎯 Next Actions

1. **Check browser console** untuk melihat output dari `console.log('BMAccounts Debug:', ...)`
2. **Check network tab** untuk melihat response dari Supabase
3. **Clear cache** dan reload halaman
4. **Add logging** di `fetchProducts` untuk debug
5. **Check React Query DevTools** untuk melihat query status

## 📝 Notes

- Transformer API client **TIDAK BERLAKU** untuk Supabase queries
- Products service sudah melakukan transformasi manual
- ProductGrid tidak memfilter produk berdasarkan stock
- Masalah kemungkinan ada di **React Query cache** atau **frontend state**
