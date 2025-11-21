# Debug: Tombol Sold Out vs Beli

## 🐛 Masalah

BM50 - Standard punya stock 1 di database, tapi tombol masih menampilkan "Sold Out" (merah) bukan "Beli" (biru).

## 🔍 Flow Analysis

### 1. Database → Service

**Database (Supabase):**
```sql
SELECT * FROM product_accounts 
WHERE product_id = '0342427c-9a12-4310-88c0-730b59a1835a' 
AND status = 'available';
-- Result: 1 account ✅
```

**Service (products.service.ts):**
```typescript
// Fetch stock
const { data: stockData } = await supabase
  .from('product_accounts')
  .select('product_id')
  .in('product_id', productIds)
  .eq('status', 'available');

// Build stock map
stockData.forEach((item: any) => {
  stockMap[item.product_id] = (stockMap[item.product_id] || 0) + 1;
});

// Expected stockMap:
{
  '0342427c-9a12-4310-88c0-730b59a1835a': 1  // BM50 - Standard
}
```

### 2. Service → Component

**Transformation:**
```typescript
const transformed = {
  id: item.id,
  title: item.product_name,  // "BM50 - Standard"
  stock: stockMap[item.id] || 0,  // Should be 1
  // ...
};
```

### 3. Component → UI

**ProductCard Logic:**
```typescript
const isOutOfStock = product.stock === 0;

// If stock = 1:
// isOutOfStock = false ✅
// Shows "Beli" button ✅

// If stock = 0:
// isOutOfStock = true ❌
// Shows "Sold Out" button ❌
```

## 🧪 Debug Steps

### Step 1: Check Console Logs

Setelah refresh halaman, check console untuk:

```javascript
// From products.service.ts
📦 Fetching stock for products: [
  '0342427c-9a12-4310-88c0-730b59a1835a',  // BM50 - Standard
  // ... other product IDs
]

📊 Stock query result: {
  stockDataLength: 4,  // Should include BM50
  stockData: [
    { product_id: '0342427c-9a12-4310-88c0-730b59a1835a' },  // ✅
    { product_id: '6a420391-beca-4de6-8b43-e193ea5540f0' },
    { product_id: '6a420391-beca-4de6-8b43-e193ea5540f0' },
    { product_id: '6a420391-beca-4de6-8b43-e193ea5540f0' }
  ]
}

✅ Stock map from product_accounts: {
  '0342427c-9a12-4310-88c0-730b59a1835a': 1,  // ✅ BM50 - Standard
  '6a420391-beca-4de6-8b43-e193ea5540f0': 3   // BM Account - Limit 250
}

🔄 Transformed product: BM50 - Standard {
  id: '0342427c-9a12-4310-88c0-730b59a1835a',
  stock: 1,  // ✅ Should be 1, not 0
  price: 100000,
  category: 'bm',
  type: 'bm50'
}

// From ProductGrid
📦 ProductGrid - Products with stock: [
  { title: 'BM Account - Limit 250', stock: 3, id: '...' },
  { title: 'BM50 - Standard', stock: 1, id: '...' }  // ✅ Should appear
]

// From ProductCard
🎴 ProductCard [BM50 - Standard]: {
  stock: 1,  // ✅ Should be 1
  stockType: 'number',
  isOutOfStock: false,  // ✅ Should be false
  comparison: '1 === 0 = false'
}
```

### Step 2: Visual Verification

**Expected UI for BM50 - Standard:**

```
┌─────────────────────────────┐
│  [Meta Logo]                │
│  [Business Manager Badge]   │
├─────────────────────────────┤
│  BM50 - Standard            │
│  Business Manager account   │
│  with $50 spending limit... │
│                             │
│  Rp 100.000         [1]     │  ← Green badge with "1"
│  [Beli]      [Detail]       │  ← Blue "Beli" button
└─────────────────────────────┘
```

**Current UI (Wrong):**

```
┌─────────────────────────────┐
│  [Meta Logo]                │
│  [Business Manager Badge]   │
├─────────────────────────────┤
│  BM50 - Standard            │
│  Business Manager account   │
│  with $50 spending limit... │
│                             │
│  Rp 100.000    [Sold Out]   │  ← Red badge
│  [Sold Out]    [Detail]     │  ← Red disabled button
└─────────────────────────────┘
```

## 🎯 Possible Issues

### Issue 1: React Query Cache ⚠️

**Problem:** Frontend masih menggunakan data lama sebelum stock ditambahkan.

**Check:**
```javascript
// In browser console
console.log('Query cache:', window.__REACT_QUERY_DEVTOOLS_GLOBAL_HOOK__);
```

**Solution:**
```javascript
// Hard refresh
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Issue 2: Stock Map Not Including BM50 ⚠️

**Problem:** Query product_accounts tidak mengembalikan BM50 account.

**Check Console:**
```javascript
📊 Stock query result: {
  stockDataLength: 3,  // ❌ Should be 4
  stockData: [...]  // ❌ Missing BM50
}
```

**Possible Causes:**
- Account created after page load
- RLS policy blocking query
- Account status not 'available'

**Solution:**
- Refresh page
- Check RLS policies
- Verify account status in database

### Issue 3: Product ID Mismatch ⚠️

**Problem:** Product ID in stockMap doesn't match product ID in products array.

**Check Console:**
```javascript
🔄 Transformed product: BM50 - Standard {
  id: 'abc123',  // Product ID
  stock: 0  // ❌ stockMap['abc123'] is undefined
}

✅ Stock map: {
  'xyz789': 1  // ❌ Different ID
}
```

**Solution:**
- Verify product_id in product_accounts table
- Check if product was recreated with new ID

### Issue 4: Type Coercion ⚠️

**Problem:** Stock is string "1" instead of number 1.

**Check Console:**
```javascript
🎴 ProductCard [BM50 - Standard]: {
  stock: "1",  // ❌ String
  stockType: 'string',  // ❌ Should be 'number'
  isOutOfStock: true,  // ❌ "1" === 0 is false, but "1" == 0 is false too
}
```

**Solution:**
- Ensure stock is converted to number in transformation
- Check `Number(stockMap[item.id])` or `parseInt()`

## ✅ Expected Console Output (After Fix)

```javascript
📦 Fetching stock for products: Array(11)

📊 Stock query result: {
  stockDataLength: 4,
  stockData: [
    { product_id: '0342427c-9a12-4310-88c0-730b59a1835a' },  // BM50
    { product_id: '6a420391-beca-4de6-8b43-e193ea5540f0' },  // Limit 250
    { product_id: '6a420391-beca-4de6-8b43-e193ea5540f0' },
    { product_id: '6a420391-beca-4de6-8b43-e193ea5540f0' }
  ]
}

✅ Stock map from product_accounts: {
  '0342427c-9a12-4310-88c0-730b59a1835a': 1,
  '6a420391-beca-4de6-8b43-e193ea5540f0': 3
}

🔄 Transformed product: BM50 - Standard {
  stock: 1,
  price: 100000
}

📦 ProductGrid - Products with stock: [
  { title: 'BM Account - Limit 250', stock: 3 },
  { title: 'BM50 - Standard', stock: 1 }
]

🎴 ProductCard [BM50 - Standard]: {
  stock: 1,
  stockType: 'number',
  isOutOfStock: false,
  comparison: '1 === 0 = false'
}
```

## 🔧 Quick Fix

### Option 1: Hard Refresh
```
Press: Ctrl + Shift + R (Windows/Linux)
       Cmd + Shift + R (Mac)
```

### Option 2: Clear Cache
```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Option 3: Use Refresh Button
```
Click the "Refresh" button that was added to BMAccounts page
```

## 📊 Verification Checklist

After refresh, verify:

- [ ] Console shows `stockDataLength: 4`
- [ ] Console shows BM50 in stockData array
- [ ] Console shows `stock: 1` for BM50 - Standard
- [ ] Console shows `isOutOfStock: false` for BM50
- [ ] UI shows green badge with "1"
- [ ] UI shows blue "Beli" button (not red "Sold Out")
- [ ] Clicking "Beli" opens purchase modal
- [ ] Purchase modal shows correct price (Rp 100.000)

## 🎯 Root Cause

**Most Likely:** React Query cache holding old data from before stock was added.

**Solution:** Hard refresh or clear cache to fetch fresh data from Supabase.

**Prevention:** 
- Reduce `staleTime` from 5 minutes to 30 seconds ✅ (already done)
- Add `refetchOnWindowFocus: true` ✅ (already done)
- Add manual refresh button ✅ (already done)

## 📝 Files Modified

1. ✅ `src/features/member-area/hooks/useProducts.ts` - Reduced staleTime
2. ✅ `src/features/member-area/pages/BMAccounts.tsx` - Added refresh button
3. ✅ `src/features/member-area/components/products/ProductCard.tsx` - Added debug logging
4. ✅ `src/features/member-area/components/products/ProductGrid.tsx` - Added debug logging

## 🔗 Next Steps

1. **Refresh halaman** `/akun-bm`
2. **Check console logs** untuk verify stock data
3. **Verify tombol** berubah dari "Sold Out" → "Beli"
4. **Test purchase** untuk ensure flow works end-to-end
5. **Remove debug logs** setelah confirmed working
