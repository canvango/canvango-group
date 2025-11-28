# Product Sorting Implementation - Stock Priority

## 📋 Overview

Implementasi sorting produk dengan prioritas stok untuk halaman `/akun-bm` dan `/akun-personal`. Produk yang memiliki stok (`available`) akan **selalu ditampilkan di atas** produk yang sold out (`out_of_stock`), terlepas dari sorting yang dipilih user.

## ✅ Implementasi

### File yang Dimodifikasi

**`src/features/member-area/services/products.service.ts`**

### Perubahan Kode

```typescript
// Apply sorting
// PRIORITY 1: Always show available products first (stock_status = 'available')
// This ensures products with stock appear before sold out products
// Using ascending because 'available' < 'out_of_stock' alphabetically
query = query.order('stock_status', { ascending: true });

// PRIORITY 2: Apply user-selected sorting
let sortField = 'created_at';
if (params.sortBy === 'price') {
  sortField = 'price';
} else if (params.sortBy === 'name') {
  sortField = 'product_name';
} else if (params.sortBy === 'date') {
  sortField = 'created_at';
}

const sortOrder = params.sortOrder === 'asc' ? { ascending: true } : { ascending: false };
query = query.order(sortField, sortOrder);
```

## 🎯 Cara Kerja

### Prioritas Sorting

1. **PRIORITAS 1**: `stock_status` (ascending)
   - `available` muncul di atas
   - `out_of_stock` muncul di bawah

2. **PRIORITAS 2**: User-selected sorting
   - Newest/Oldest (by `created_at`)
   - Price: Low to High / High to Low (by `price`)
   - Name: A to Z / Z to A (by `product_name`)

### Contoh Hasil

#### Sort by "Newest First"
```
✅ BM NEW VERIFIED PT/CV (available) - Rp 250,000
✅ BM NEW VERIFIED (available) - Rp 200,000
✅ BM 50 NEW INDONESIA (available) - Rp 150,000
❌ BM TUA VERIFIED PT/CV (out_of_stock) - Rp 150,000
❌ BM50 NEW + PERSONAL TUA (out_of_stock) - Rp 125,000
```

#### Sort by "Price: Low to High"
```
✅ BM 50 NEW INDONESIA (available) - Rp 150,000
✅ BM NEW VERIFIED (available) - Rp 200,000
✅ BM NEW VERIFIED PT/CV (available) - Rp 250,000
❌ BM NEW VIETNAM VERIFIED (out_of_stock) - Rp 35,000
❌ BM50 NEW + PERSONAL TUA (out_of_stock) - Rp 125,000
```

#### Sort by "Name: A to Z"
```
✅ AKUN PERSONAL 1 TAHUN - BASIC (available)
✅ AKUN PERSONAL 2 TAHUN - STANDARD (available)
✅ AKUN PERSONAL 3+ TAHUN - PREMIUM (available)
❌ AKUN PERSONAL MUDA TAHUN 2025 (out_of_stock)
❌ AKUN PERSONAL TUA + ID CARD (out_of_stock)
```

## 🧪 Testing

### SQL Verification

```sql
-- Test BM Accounts
SELECT product_name, stock_status, price, created_at
FROM products
WHERE product_type = 'bm_account' AND is_active = true
ORDER BY stock_status ASC, created_at DESC
LIMIT 10;

-- Test Personal Accounts
SELECT product_name, stock_status, price
FROM products
WHERE product_type = 'personal_account' AND is_active = true
ORDER BY stock_status ASC, price ASC
LIMIT 10;
```

### Manual Testing

1. Buka `/akun-bm`
2. Pilih berbagai sorting options:
   - Newest First
   - Price: Low to High
   - Name: A to Z
3. Verifikasi produk `available` selalu di atas
4. Ulangi untuk `/akun-personal`

## 📊 Impact

### Halaman yang Terpengaruh

- ✅ `/akun-bm` - BM Accounts page
- ✅ `/akun-personal` - Personal Accounts page

### Komponen yang Terpengaruh

- `BMAccounts.tsx` - Menggunakan `useProducts` hook
- `PersonalAccounts.tsx` - Menggunakan `useProducts` hook
- `products.service.ts` - Query Supabase dimodifikasi

### User Experience

- **Sebelum**: Produk sold out bisa muncul di atas produk available
- **Sesudah**: Produk available **selalu** muncul di atas, sold out di bawah
- **Benefit**: User langsung melihat produk yang bisa dibeli tanpa scroll

## 🔧 Technical Details

### Database Field

- Field: `stock_status`
- Values: `'available'` | `'out_of_stock'`
- Type: `VARCHAR` with CHECK constraint

### Sorting Logic

```typescript
// Alphabetically: 'available' < 'out_of_stock'
// Therefore: ascending order puts 'available' first
query.order('stock_status', { ascending: true })
```

### Backward Compatibility

✅ Tidak ada breaking changes
✅ Semua sorting options tetap berfungsi
✅ Pagination tetap bekerja normal
✅ Filter by category tetap berfungsi

## 📝 Notes

- Implementasi menggunakan **multi-column sorting** di Supabase
- Tidak memerlukan perubahan di database schema
- Tidak memerlukan migration
- Perubahan hanya di application layer (service)
- Compatible dengan semua existing features

## ✅ Status

**IMPLEMENTED & TESTED** ✅

- [x] Code implementation
- [x] SQL verification
- [x] Diagnostics check
- [x] Documentation
- [x] Ready for production

---

**Date**: 2025-11-28
**Author**: Kiro AI Assistant
