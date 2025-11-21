# Product Stock Synchronization with Supabase

## 🎯 Overview

Stok produk sekarang tersinkronisasi dengan database Supabase melalui tabel `product_accounts`. Setiap produk menampilkan jumlah akun yang sebenarnya tersedia, bukan angka hardcoded.

## ✅ Perubahan yang Dilakukan

### Before (Hardcoded)
```typescript
stock: item.stock_status === 'available' ? 100 : 0  // ❌ Selalu 100
```

### After (Real-time dari Database)
```typescript
// Fetch real stock from product_accounts
const realStock = stockMap[item.id] || 0;  // ✅ Angka sebenarnya
stock: realStock
```

## 📊 Cara Kerja

### 1. Fetch Products (`fetchProducts`)

**Step 1**: Query produk dari tabel `products`
```sql
SELECT * FROM products WHERE is_active = true
```

**Step 2**: Query stok dari tabel `product_accounts`
```sql
SELECT product_id, COUNT(*) 
FROM product_accounts 
WHERE product_id IN (...) 
  AND status = 'available'
GROUP BY product_id
```

**Step 3**: Gabungkan data
```typescript
const stockMap = {
  'product-id-1': 5,  // 5 akun tersedia
  'product-id-2': 0,  // 0 akun tersedia
  'product-id-3': 12, // 12 akun tersedia
}
```

### 2. Fetch Single Product (`fetchProductById`)

**Step 1**: Query produk
```sql
SELECT * FROM products WHERE id = 'product-id' AND is_active = true
```

**Step 2**: Query stok
```sql
SELECT COUNT(*) 
FROM product_accounts 
WHERE product_id = 'product-id' 
  AND status = 'available'
```

**Step 3**: Return produk dengan stok real

## 🔄 Sinkronisasi Otomatis

Stok akan otomatis update dalam kondisi:

1. **Saat halaman di-load**: Query fresh data dari database
2. **Setelah pembelian**: React Query akan invalidate cache
3. **Setelah admin menambah akun**: Stok bertambah
4. **Setelah akun terjual**: Status berubah dari `available` → `sold`

## 📈 Contoh Skenario

### Skenario 1: Product Accounts Kosong (Saat Ini)
```
Product: BM 140 Limit - Premium
Stock di UI: 0 (karena product_accounts kosong)
Badge: 🔴 0 (merah, out of stock)
```

### Skenario 2: Admin Menambah 10 Akun
```sql
-- Admin menambahkan 10 akun ke pool
INSERT INTO product_accounts (product_id, account_data, status)
VALUES 
  ('product-id', {...}, 'available'),
  ('product-id', {...}, 'available'),
  ... (10 rows)
```

```
Product: BM 140 Limit - Premium
Stock di UI: 10 (real-time dari database)
Badge: 🟢 10 (hijau, in stock)
```

### Skenario 3: User Membeli 3 Akun
```sql
-- Sistem mengupdate 3 akun menjadi sold
UPDATE product_accounts 
SET status = 'sold', assigned_to_transaction_id = 'trans-id'
WHERE product_id = 'product-id' 
  AND status = 'available'
LIMIT 3
```

```
Product: BM 140 Limit - Premium
Stock di UI: 7 (10 - 3 = 7)
Badge: 🟢 7 (masih tersedia)
```

## 🎨 UI Changes

### Product Card Badge
```tsx
// Before
<span className="badge">100</span>  // ❌ Selalu 100

// After
<span className="badge">{product.stock}</span>  // ✅ Real stock
```

### Stock Status Colors
```typescript
stock === 0     → 🔴 Red (Out of stock)
stock > 0       → 🟢 Green (In stock)
stock < 5       → 🟡 Yellow (Low stock) // Optional
```

## 📊 Database Schema

### Table: `product_accounts`
```sql
CREATE TABLE product_accounts (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  account_data JSONB,
  status VARCHAR CHECK (status IN ('available', 'sold')),
  assigned_to_transaction_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- Index untuk performa
CREATE INDEX idx_product_accounts_product_status 
ON product_accounts(product_id, status);
```

### Query untuk Cek Stock
```sql
-- Total stock per produk
SELECT 
  p.product_name,
  COUNT(pa.id) FILTER (WHERE pa.status = 'available') as available_stock,
  COUNT(pa.id) FILTER (WHERE pa.status = 'sold') as sold_stock
FROM products p
LEFT JOIN product_accounts pa ON p.id = pa.product_id
WHERE p.product_type = 'bm_account'
GROUP BY p.id, p.product_name;
```

## 🔧 Files Modified

### Modified:
- `src/features/member-area/services/products.service.ts`
  - `fetchProducts()` - Added stock query from product_accounts
  - `fetchProductById()` - Added stock query from product_accounts

### Related Files:
- `src/features/member-area/services/bmStats.service.ts` - Uses same logic for total stock
- `src/features/member-area/components/products/ProductCard.tsx` - Displays stock badge
- `server/src/controllers/purchase.controller.ts` - Updates stock on purchase

## 🧪 Testing

### Manual Test
1. Buka halaman `/akun-bm`
2. Lihat badge stok di setiap product card
3. Saat ini semua harus menampilkan `0` (karena product_accounts kosong)

### Test dengan Data
```sql
-- Insert test data
INSERT INTO product_accounts (product_id, account_data, status)
SELECT 
  id,
  '{"email": "test@example.com", "password": "test123"}'::jsonb,
  'available'
FROM products 
WHERE product_type = 'bm_account'
LIMIT 5;

-- Refresh halaman, badge harus menampilkan angka > 0
```

### Verify Query
```sql
-- Cek stock yang ditampilkan
SELECT 
  p.id,
  p.product_name,
  COUNT(pa.id) as stock
FROM products p
LEFT JOIN product_accounts pa ON p.id = pa.product_id AND pa.status = 'available'
WHERE p.product_type = 'bm_account'
GROUP BY p.id, p.product_name;
```

## 🚀 Next Steps

1. **Admin Panel**: Tambahkan UI untuk admin menambah akun ke pool
2. **Stock Alerts**: Notifikasi saat stok < 5
3. **Stock History**: Track perubahan stok over time
4. **Auto-restock**: Integrasi dengan supplier API (optional)

## 📝 Notes

- Stok `0` = produk tidak bisa dibeli (button disabled)
- Stok real-time = tidak ada overselling
- Performance: Query dioptimasi dengan index
- Cache: React Query cache 30 detik, auto-refetch on window focus

## 🔗 Related Documentation

- `BM_STATS_INTEGRATION.md` - Statistik total stok
- `ACCOUNT_POOL_IMPLEMENTATION.md` - Sistem account pool
- `QUICK_START_ACCOUNT_POOL.md` - Cara menambah akun ke pool
