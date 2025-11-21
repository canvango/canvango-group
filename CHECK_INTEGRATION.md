# Quick Integration Check

## 🚀 Cara Cepat Cek Integrasi ProductCard

### Step 1: Buka Halaman
1. Login sebagai `member1`
2. Buka halaman `/akun-bm`

### Step 2: Buka Console
1. Tekan `F12` atau `Ctrl+Shift+I`
2. Klik tab **Console**

### Step 3: Cek Output

Anda harus melihat log seperti ini:

```javascript
// ✅ GOOD - Products fetched successfully
🔍 fetchProducts - Query executed: {
  params: { category: 'bm', type: undefined, ... },
  count: 11,
  dataLength: 11,
  hasData: true
}

📦 Fetching stock for products: ['id1', 'id2', ...]

📊 Stock query result: {
  stockDataLength: 4,
  stockData: [...]
}

✅ Stock map from product_accounts: {
  'ce130862-9597-4139-b48d-73dcc03daeb2': 1,
  '6a420391-beca-4de6-8b43-e193ea5540f0': 3
}

🔄 Transformed product: BM Verified - Basic {
  id: 'ce130862-...',
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

BMAccounts Debug: {
  activeCategory: 'all',
  productType: undefined,
  isLoading: false,
  error: null,
  productsData: { data: [...], pagination: {...} },
  productsCount: 11
}
```

### Step 4: Verifikasi Visual

Anda harus melihat:

1. **Summary Cards:**
   - Available Stock: **4** ✅
   - Success Rate: **90.9%** ✅

2. **Product Grid:**
   - **11 product cards** ditampilkan ✅
   - Cards dengan stock > 0: tombol **"Beli"** aktif ✅
   - Cards dengan stock = 0: tombol **"Sold Out"** disabled ✅

3. **Product Card Example:**
   ```
   ┌─────────────────────────────┐
   │  [Meta Infinity Logo]       │
   │  [Business Manager Badge]   │
   ├─────────────────────────────┤
   │  BM Verified - Basic        │
   │  Business Manager account   │
   │  with verified status...    │
   │                             │
   │  Rp 500.000         [1]     │
   │  [Beli]      [Detail]       │
   └─────────────────────────────┘
   ```

## ❌ Jika Ada Masalah

### Masalah 1: Tidak Ada Produk

**Symptom:**
```
⚠️ No products found with params: { category: 'bm', ... }
```

**Solution:**
1. Check database:
   ```sql
   SELECT COUNT(*) FROM products 
   WHERE product_type = 'bm_account' AND is_active = true;
   ```
2. Pastikan ada 11 products
3. Check RLS policies di Supabase

### Masalah 2: Stock Tidak Muncul

**Symptom:**
```javascript
📊 Stock query result: { stockDataLength: 0 }
```

**Solution:**
1. Check database:
   ```sql
   SELECT * FROM product_accounts WHERE status = 'available';
   ```
2. Pastikan ada 4 accounts
3. Check RLS policies untuk product_accounts

### Masalah 3: Error di Console

**Symptom:**
```
❌ Supabase query error: { message: '...' }
```

**Solution:**
1. Copy error message
2. Check Supabase dashboard → Logs
3. Verify RLS policies
4. Check network tab untuk response

### Masalah 4: Products Array Empty

**Symptom:**
```javascript
BMAccounts Debug: {
  productsData: { data: [], pagination: {...} },
  productsCount: 0
}
```

**Solution:**
1. Clear cache:
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   location.reload();
   ```
2. Check React Query DevTools
3. Verify query key

## 🎯 Expected vs Actual

### ✅ Expected (CORRECT):
```javascript
count: 11
dataLength: 11
totalProducts: 11
productsCount: 11
```

### ❌ Actual (WRONG):
```javascript
count: 0
dataLength: 0
totalProducts: 0
productsCount: 0
```

## 📸 Screenshot Checklist

Jika mau share screenshot, include:
1. ✅ Browser console (full logs)
2. ✅ Network tab (Supabase requests)
3. ✅ Page view (product grid)
4. ✅ React Query DevTools (if available)

## 🔧 Quick Fixes

### Fix 1: Clear Cache
```javascript
// Paste in console
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Fix 2: Force Refetch
```javascript
// Paste in console
window.location.href = '/akun-bm?_=' + Date.now();
```

### Fix 3: Check Supabase Connection
```javascript
// Paste in console
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Has Anon Key:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
```

## 📊 Database Quick Check

Run this in Supabase SQL Editor:

```sql
-- Check products
SELECT 
  COUNT(*) as total_products,
  COUNT(*) FILTER (WHERE is_active = true) as active_products,
  COUNT(*) FILTER (WHERE product_type = 'bm_account') as bm_products
FROM products;

-- Check stock
SELECT 
  COUNT(*) as total_accounts,
  COUNT(*) FILTER (WHERE status = 'available') as available_accounts,
  COUNT(*) FILTER (WHERE status = 'sold') as sold_accounts
FROM product_accounts;

-- Check integration
SELECT 
  p.product_name,
  COUNT(pa.id) FILTER (WHERE pa.status = 'available') as stock
FROM products p
LEFT JOIN product_accounts pa ON pa.product_id = p.id
WHERE p.product_type = 'bm_account' AND p.is_active = true
GROUP BY p.id, p.product_name
ORDER BY stock DESC;
```

**Expected Results:**
```
total_products: 17
active_products: 17
bm_products: 11

total_accounts: 4
available_accounts: 4
sold_accounts: 0

BM Account - Limit 250: 3
BM Verified - Basic: 1
(other 9 products): 0
```

## ✅ Success Indicators

Jika semua benar, Anda akan melihat:
- ✅ Console logs lengkap tanpa error
- ✅ 11 product cards di grid
- ✅ Summary shows "4 Available Stock"
- ✅ Tombol "Beli" aktif untuk 2 products
- ✅ Tombol "Sold Out" untuk 9 products
- ✅ Price formatted: "Rp 500.000"
- ✅ No console errors

## 🆘 Need Help?

Jika masih ada masalah:
1. Screenshot console logs
2. Screenshot page view
3. Copy error messages
4. Share untuk debugging

## 📝 Related Docs

- `INTEGRATION_CHECK_SUMMARY.md` - Full integration verification
- `PRODUCT_CARD_INTEGRATION_TEST.md` - Detailed test guide
- `PRODUCTS_NOT_SHOWING_FIX.md` - Debugging guide
