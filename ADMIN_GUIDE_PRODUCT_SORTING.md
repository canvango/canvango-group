# Admin Guide - Product Sorting Feature

## 📋 Overview

Fitur sorting produk otomatis yang memastikan produk dengan stok selalu ditampilkan di atas produk yang sold out.

## 🎯 Cara Kerja

### Untuk Member/User

Ketika user membuka halaman `/akun-bm` atau `/akun-personal`:

1. **Produk Available** (ada stok) akan **selalu muncul di atas**
2. **Produk Out of Stock** akan **selalu muncul di bawah**
3. User tetap bisa memilih sorting (Newest, Price, Name)
4. Sorting yang dipilih user akan diterapkan **dalam setiap grup** (available dan out of stock)

### Contoh Visual

```
User memilih: "Price: Low to High"

Hasil yang ditampilkan:
┌─────────────────────────────────┐
│ ✅ AVAILABLE (sorted by price)  │
│ Rp 150,000                      │
│ Rp 200,000                      │
│ Rp 250,000                      │
├─────────────────────────────────┤
│ ❌ OUT OF STOCK (sorted by price)│
│ Rp 35,000                       │
│ Rp 125,000                      │
│ Rp 150,000                      │
└─────────────────────────────────┘
```

## 🔧 Untuk Admin

### Mengubah Status Stok Produk

1. Buka **Admin Panel** → **Product Management**
2. Pilih produk yang ingin diubah
3. Edit field `stock_status`:
   - `available` = Produk akan muncul di atas
   - `out_of_stock` = Produk akan muncul di bawah
4. Save changes

### Tips Manajemen Stok

✅ **DO:**
- Set `stock_status = 'out_of_stock'` jika produk habis
- Set `stock_status = 'available'` jika produk tersedia lagi
- Gunakan field `is_active = false` untuk hide produk sepenuhnya

❌ **DON'T:**
- Jangan delete produk yang sudah pernah dibeli
- Jangan ubah `stock_status` manual jika ada sistem auto-update

## 📊 Monitoring

### Cek Distribusi Stok

```sql
-- Lihat jumlah produk available vs out of stock
SELECT 
  product_type,
  stock_status,
  COUNT(*) as total
FROM products
WHERE is_active = true
GROUP BY product_type, stock_status
ORDER BY product_type, stock_status;
```

### Cek Produk yang Perlu Restock

```sql
-- Produk out of stock yang populer (banyak terjual)
SELECT 
  p.product_name,
  p.stock_status,
  COUNT(pu.id) as total_sold
FROM products p
LEFT JOIN purchases pu ON p.id = pu.product_id
WHERE p.stock_status = 'out_of_stock'
  AND p.is_active = true
GROUP BY p.id, p.product_name, p.stock_status
ORDER BY total_sold DESC
LIMIT 10;
```

## 🔄 Update Stok Massal

### Via SQL (Supabase Dashboard)

```sql
-- Set multiple products to out_of_stock
UPDATE products
SET stock_status = 'out_of_stock'
WHERE id IN (
  'product-id-1',
  'product-id-2',
  'product-id-3'
);

-- Set multiple products to available
UPDATE products
SET stock_status = 'available'
WHERE id IN (
  'product-id-1',
  'product-id-2',
  'product-id-3'
);
```

### Via Admin Panel

1. Go to **Product Management**
2. Select multiple products (checkbox)
3. Click **Bulk Actions** → **Update Stock Status**
4. Choose `available` or `out_of_stock`
5. Confirm

## 📈 Impact on User Experience

### Before Implementation

```
❌ BM NEW VIETNAM VERIFIED (out_of_stock) - Rp 35,000
✅ BM 50 NEW INDONESIA (available) - Rp 150,000
❌ BM50 NEW + PERSONAL TUA (out_of_stock) - Rp 125,000
✅ BM NEW VERIFIED (available) - Rp 200,000
```

User harus scroll untuk menemukan produk yang bisa dibeli.

### After Implementation

```
✅ BM 50 NEW INDONESIA (available) - Rp 150,000
✅ BM NEW VERIFIED (available) - Rp 200,000
✅ BM NEW VERIFIED PT/CV (available) - Rp 250,000
❌ BM NEW VIETNAM VERIFIED (out_of_stock) - Rp 35,000
❌ BM50 NEW + PERSONAL TUA (out_of_stock) - Rp 125,000
```

User langsung melihat produk yang bisa dibeli di atas.

## 🎯 Best Practices

### 1. Update Stok Secara Real-time

Pastikan `stock_status` selalu up-to-date:
- Set `out_of_stock` segera setelah stok habis
- Set `available` segera setelah restock

### 2. Gunakan Product Accounts Pool

Sistem sudah terintegrasi dengan `product_accounts` table:
- Real stock dihitung dari jumlah accounts dengan `status = 'available'`
- Jika `product_accounts` habis, set `stock_status = 'out_of_stock'`

### 3. Monitoring Regular

Check weekly:
- Produk mana yang sering out of stock
- Produk mana yang perlu restock
- Distribusi available vs out of stock

## 🐛 Troubleshooting

### Produk Available Tidak Muncul di Atas

**Kemungkinan Penyebab:**
1. `stock_status` masih `out_of_stock` di database
2. Cache browser belum refresh

**Solusi:**
```sql
-- Cek status produk
SELECT id, product_name, stock_status 
FROM products 
WHERE id = 'product-id-here';

-- Update jika perlu
UPDATE products 
SET stock_status = 'available' 
WHERE id = 'product-id-here';
```

### Sorting Tidak Bekerja

**Kemungkinan Penyebab:**
1. Browser cache
2. Service worker cache

**Solusi:**
1. Hard refresh browser (Ctrl + Shift + R)
2. Clear cache
3. Check console for errors

## 📞 Support

Jika ada masalah dengan sorting:

1. Check database: Pastikan `stock_status` correct
2. Check console: Look for JavaScript errors
3. Check network: Verify API calls successful
4. Contact developer jika masalah persist

---

**Last Updated**: 2025-11-28  
**Feature Version**: 1.0  
**Status**: Production Ready ✅
