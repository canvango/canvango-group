# Fix: Produk Tidak Muncul di Halaman /akun-bm

## 🐛 Masalah

User `member1` membuka halaman `/akun-bm` dan melihat:
- **Summary Card**: "4 Available Stock" ✅ (benar)
- **Product Grid**: Tidak ada produk yang ditampilkan ❌ (salah)

## 🔍 Root Cause Analysis

### Data Verification ✅

**Database Check:**
```sql
SELECT COUNT(*) FROM products 
WHERE product_type = 'bm_account' AND is_active = true;
-- Result: 11 products
```

**Stock Check:**
```sql
SELECT COUNT(*) FROM product_accounts 
WHERE status = 'available';
-- Result: 4 accounts available
```

Data di database **sudah benar** ✅

### Possible Issues

1. **Frontend Query Issue** - Query parameters tidak sesuai
2. **React Query Cache** - Data ter-cache dan tidak refresh
3. **Supabase RLS** - Row Level Security memblokir query
4. **Frontend Filtering** - Ada filter yang menyembunyikan produk
5. **API Response Transformation** - Data rusak saat transformasi

## ✅ Solution: Enhanced Logging

Menambahkan detailed logging di `products.service.ts` untuk debug:

### Changes Made

**File**: `src/features/member-area/services/products.service.ts`

```typescript
// 1. Log query execution
const { data, error, count } = await query;

console.log('🔍 fetchProducts - Query executed:', {
  params,
  count,
  dataLength: data?.length,
  error: error?.message,
  hasData: !!data,
  firstProduct: data?.[0]
});

// 2. Early return if no data
if (!data || data.length === 0) {
  console.warn('⚠️ No products found with params:', params);
  return {
    data: [],
    pagination: { page, pageSize, total: 0, totalPages: 0 }
  };
}

// 3. Log stock fetching
console.log('📦 Fetching stock for products:', productIds);

const { data: stockData, error: stockError } = await supabase
  .from('product_accounts')
  .select('product_id')
  .in('product_id', productIds)
  .eq('status', 'available');

console.log('📊 Stock query result:', {
  stockDataLength: stockData?.length,
  stockError: stockError?.message,
  stockData: stockData
});

// 4. Log each transformed product
const transformed = {
  id: item.id,
  category: (item.product_type === 'bm_account' ? 'bm' : 'personal'),
  type: item.category,
  title: item.product_name,
  stock: realStock,
  // ...
};

console.log(`🔄 Transformed product: ${item.product_name}`, {
  id: item.id,
  stock: realStock,
  price: transformed.price,
  category: transformed.category,
  type: transformed.type
});

// 5. Log final result
console.log('✅ Final transformed data:', {
  totalProducts: transformedData.length,
  pagination: { page, pageSize, total: count, totalPages }
});
```

## 🧪 Debugging Steps

### Step 1: Open Browser Console

1. Login sebagai `member1`
2. Buka halaman `/akun-bm`
3. Buka DevTools → Console
4. Lihat output logging

**Expected Output:**
```
🔍 fetchProducts - Query executed: {
  params: { category: 'bm', type: undefined, ... },
  count: 11,
  dataLength: 11,
  error: undefined,
  hasData: true,
  firstProduct: { id: '...', product_name: '...', ... }
}

📦 Fetching stock for products: ['id1', 'id2', ...]

📊 Stock query result: {
  stockDataLength: 4,
  stockError: undefined,
  stockData: [...]
}

✅ Stock map from product_accounts: {
  'product-id-1': 3,
  'product-id-2': 1
}

🔄 Transformed product: BM Verified - Basic {
  id: 'ce130862-9597-4139-b48d-73dcc03daeb2',
  stock: 1,
  price: 500000,
  category: 'bm',
  type: 'verified'
}

... (10 more products)

✅ Final transformed data: {
  totalProducts: 11,
  pagination: { page: 1, pageSize: 12, total: 11, totalPages: 1 }
}
```

### Step 2: Check for Errors

Jika ada error, akan muncul:
```
❌ Supabase query error: { message: '...', ... }
```

atau

```
⚠️ No products found with params: { category: 'bm', ... }
```

### Step 3: Verify Data Flow

1. **Query executed** → Should show `count: 11` ✅
2. **Stock fetched** → Should show `stockDataLength: 4` ✅
3. **Products transformed** → Should show 11 products ✅
4. **Final data** → Should show `totalProducts: 11` ✅

## 🎯 Common Issues & Solutions

### Issue 1: No Data Returned

**Symptom:**
```
⚠️ No products found with params: { category: 'bm', ... }
```

**Possible Causes:**
- Supabase RLS blocking query
- Wrong query parameters
- Database connection issue

**Solution:**
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'products';

-- Test query directly
SELECT * FROM products WHERE product_type = 'bm_account' AND is_active = true;
```

### Issue 2: Stock Not Fetched

**Symptom:**
```
📊 Stock query result: { stockDataLength: 0, ... }
```

**Possible Causes:**
- No accounts in `product_accounts` table
- RLS blocking `product_accounts` query
- Wrong product IDs

**Solution:**
```sql
-- Check product_accounts
SELECT * FROM product_accounts WHERE status = 'available';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'product_accounts';
```

### Issue 3: Transformation Error

**Symptom:**
```
❌ Error in transformation: ...
```

**Possible Causes:**
- Missing fields in database
- Type conversion error
- Null values

**Solution:**
- Check database schema
- Add null checks in transformation
- Verify data types

### Issue 4: React Query Cache

**Symptom:**
- Old data showing
- Data not refreshing

**Solution:**
```javascript
// Clear cache in browser console
localStorage.clear();
sessionStorage.clear();
location.reload();
```

## 📊 Expected Behavior

1. User opens `/akun-bm`
2. Query fetches 11 BM products from database
3. Stock fetched for each product (4 accounts available)
4. Products transformed to frontend format
5. ProductGrid displays all 11 products:
   - 4 products with stock > 0 → "Beli" button enabled
   - 7 products with stock = 0 → "Sold Out" button disabled

## 🔧 Next Steps

1. **Test dengan member1** - Buka `/akun-bm` dan check console
2. **Verify logging output** - Pastikan semua steps berhasil
3. **Check for errors** - Jika ada error, debug sesuai section "Common Issues"
4. **Remove logging** - Setelah masalah fixed, hapus console.log yang tidak perlu

## 📝 Files Modified

- ✅ `src/features/member-area/services/products.service.ts` - Added detailed logging

## 🎯 Success Criteria

- ✅ Console shows "Query executed" with count: 11
- ✅ Console shows "Stock fetched" with 4 accounts
- ✅ Console shows 11 transformed products
- ✅ ProductGrid displays 11 product cards
- ✅ Products with stock > 0 show "Beli" button
- ✅ Products with stock = 0 show "Sold Out" button

## ⚠️ Important Notes

1. **Logging is temporary** - Remove after debugging
2. **Check browser console** - All debug info will be there
3. **Supabase RLS** - Make sure policies allow SELECT on products and product_accounts
4. **React Query** - Clear cache if data seems stale

## 🔗 Related Files

- `src/features/member-area/services/products.service.ts` - Products service with logging
- `src/features/member-area/pages/BMAccounts.tsx` - BM Accounts page
- `src/features/member-area/components/products/ProductGrid.tsx` - Product grid component
- `src/features/member-area/components/products/ProductCard.tsx` - Product card component
- `PRODUCTS_NOT_SHOWING_DEBUG.md` - Detailed debugging guide
