# Testing BM Statistics Integration

## 🧪 Manual Testing Steps

### 1. Buka Halaman BM Accounts
- Navigate ke `/akun-bm`
- Buka Browser Console (F12)

### 2. Cek Console Logs
Anda harus melihat log seperti ini:

```
[useBMStats] Fetching BM statistics...
[BMStats] Starting to fetch statistics...
[BMStats] BM Product IDs: 11
[BMStats] Total BM account stock from product_accounts: 0
[BMStats] Success rate: 90.9 (10/11)
[BMStats] Total sold this month: 10
[BMStats] Final result: { totalStock: 0, successRate: 90.9, totalSoldThisMonth: 10 }
[useBMStats] Successfully fetched: { totalStock: 0, successRate: 90.9, totalSoldThisMonth: 10 }
[useBMStats] Current data: { totalStock: 0, successRate: 90.9, totalSoldThisMonth: 10 }
```

### 3. Verifikasi UI
Ketiga kotak statistik harus menampilkan:

**Kotak Kiri (Available Stock):**
- Icon: Package
- Value: `0` (jumlah stok akun BM dari product_accounts)
- Label: "Available Stock"
- Background: Light blue
- Note: Menampilkan 0 karena belum ada akun di pool

**Kotak Tengah (Success Rate):**
- Icon: TrendingUp
- Value: `90.9%`
- Label: "Success Rate"
- Sub-info: "High quality accounts" (green)
- Background: Light green

**Kotak Kanan (Total Sold):**
- Icon: CheckCircle
- Value: `10`
- Label: "Total Sold"
- Sub-info: "This month" (orange)
- Background: Light orange

### 4. Test Auto-Refresh
- Tunggu 30 detik
- Console harus menampilkan log fetch baru
- Data harus ter-update otomatis

### 5. Test Window Focus
- Switch ke tab lain
- Kembali ke tab halaman BM Accounts
- Console harus menampilkan log fetch baru

## 🐛 Troubleshooting

### Kotak menampilkan "..." terus-menerus
**Penyebab**: Query masih loading atau error
**Solusi**:
1. Cek console untuk error message
2. Pastikan Supabase connection berfungsi
3. Cek RLS policies di Supabase

### Kotak menampilkan "0" semua
**Penyebab**: Data tidak ada atau query error
**Solusi**:
1. Cek console log `[BMStats]`
2. Verifikasi data di Supabase:
   ```sql
   -- Cek products
   SELECT COUNT(*) FROM products WHERE is_active = true AND stock_status = 'available';
   
   -- Cek BM products
   SELECT COUNT(*) FROM products WHERE product_type = 'bm_account';
   
   -- Cek transactions
   SELECT COUNT(*) FROM transactions WHERE transaction_type = 'purchase';
   ```

### Success Rate tidak akurat
**Penyebab**: Data transaksi tidak lengkap
**Solusi**:
1. Pastikan `product_id` di tabel `transactions` valid
2. Cek apakah ada transaksi dengan status `completed`
3. Verifikasi join antara `transactions` dan `products`

### Total Sold This Month selalu 0
**Penyebab**: Tidak ada transaksi completed di bulan ini
**Solusi**:
1. Cek timezone database vs aplikasi
2. Verifikasi query dengan:
   ```sql
   SELECT COUNT(*) 
   FROM transactions t
   INNER JOIN products p ON t.product_id = p.id
   WHERE p.product_type = 'bm_account'
     AND t.transaction_type = 'purchase'
     AND t.status = 'completed'
     AND DATE_TRUNC('month', t.created_at) = DATE_TRUNC('month', CURRENT_TIMESTAMP);
   ```

## 📊 Expected Console Output

### Successful Fetch
```
[useBMStats] Fetching BM statistics...
[BMStats] Starting to fetch statistics...
[BMStats] Total stock: 17
[BMStats] BM Product IDs: 11
[BMStats] Success rate: 90.9 (10/11)
[BMStats] Total sold this month: 10
[BMStats] Final result: {totalStock: 17, successRate: 90.9, totalSoldThisMonth: 10}
[useBMStats] Successfully fetched: {totalStock: 17, successRate: 90.9, totalSoldThisMonth: 10}
```

### Error Case
```
[useBMStats] Fetching BM statistics...
[BMStats] Starting to fetch statistics...
[BMStats] Error fetching total stock: {message: "...", details: "..."}
[BMStats] Error in fetchBMStats: Error: ...
[useBMStats] Error fetching stats: Error: ...
[useBMStats] Query error: Error: ...
```

## ✅ Success Criteria

- [ ] Ketiga kotak menampilkan angka (bukan "..." atau "0")
- [ ] Console log menampilkan `[BMStats] Final result` dengan data valid
- [ ] Tidak ada error di console
- [ ] Data ter-update setiap 30 detik
- [ ] Data ter-update saat window focus
- [ ] Loading state ("...") muncul saat pertama kali load

## 🔍 SQL Verification Queries

Jalankan query ini di Supabase SQL Editor untuk verifikasi:

```sql
-- 1. Total Stock (BM accounts dari product_accounts)
SELECT COUNT(*) as total_bm_account_stock
FROM product_accounts pa
INNER JOIN products p ON pa.product_id = p.id
WHERE p.product_type = 'bm_account'
  AND pa.status = 'available';

-- 1b. Fallback: BM Products (jika product_accounts kosong)
SELECT COUNT(*) as bm_products_fallback
FROM products 
WHERE product_type = 'bm_account';

-- 3. Success Rate
WITH bm_products AS (
  SELECT id FROM products WHERE product_type = 'bm_account'
)
SELECT 
  COUNT(*) as total_transactions,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_transactions,
  CASE WHEN COUNT(*) > 0 
    THEN ROUND((COUNT(*) FILTER (WHERE status = 'completed')::numeric / COUNT(*)::numeric) * 100, 1)
    ELSE 0 
  END as success_rate
FROM transactions 
WHERE product_id IN (SELECT id FROM bm_products)
  AND transaction_type = 'purchase';

-- 4. Total Sold This Month
WITH bm_products AS (
  SELECT id FROM products WHERE product_type = 'bm_account'
)
SELECT COUNT(*) as total_sold_this_month
FROM transactions 
WHERE product_id IN (SELECT id FROM bm_products)
  AND transaction_type = 'purchase'
  AND status = 'completed'
  AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_TIMESTAMP);
```

Expected results:
```
total_bm_account_stock: 0 (saat ini)
bm_products_fallback: 11 (tidak digunakan lagi)
success_rate: 90.9
total_sold_this_month: 10
```
