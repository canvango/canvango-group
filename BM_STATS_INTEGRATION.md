# BM Statistics Integration - Supabase

## 📊 Overview

Halaman `/akun-bm` sekarang terintegrasi dengan Supabase untuk menampilkan statistik real-time yang akurat dari database.

## ✅ Implementasi

### 1. Service Layer (`bmStats.service.ts`)

Service baru yang mengambil data statistik langsung dari Supabase:

```typescript
export interface BMStats {
  totalStock: number;          // Total produk BM yang available
  successRate: number;          // Persentase transaksi sukses
  totalSoldThisMonth: number;   // Total terjual bulan ini
}
```

**Query SQL yang digunakan:**

#### Total Stock (Kotak Kiri)
```sql
-- Count BM accounts from product_accounts
SELECT COUNT(*) 
FROM product_accounts pa
INNER JOIN products p ON pa.product_id = p.id
WHERE p.product_type = 'bm_account'
  AND pa.status = 'available'
```
- Menghitung **jumlah stok akun BM** dari tabel `product_accounts`
- Menampilkan 0 jika tidak ada akun di pool (tidak ada fallback)
- **Hasil saat ini: 0** (belum ada akun di product_accounts)

#### Success Rate (Kotak Tengah)
```sql
SELECT 
  ROUND((COUNT(*) FILTER (WHERE status = 'completed') / COUNT(*)) * 100, 1)
FROM transactions t
INNER JOIN products p ON t.product_id = p.id
WHERE p.product_type = 'bm_account'
  AND t.transaction_type = 'purchase'
```
- Menghitung persentase transaksi completed vs total transaksi
- **Hasil saat ini: 90.9%**

#### Total Sold This Month (Kotak Kanan)
```sql
SELECT COUNT(*) 
FROM transactions t
INNER JOIN products p ON t.product_id = p.id
WHERE p.product_type = 'bm_account'
  AND t.transaction_type = 'purchase'
  AND t.status = 'completed'
  AND DATE_TRUNC('month', t.created_at) = DATE_TRUNC('month', CURRENT_TIMESTAMP)
```
- Menghitung transaksi completed di bulan berjalan
- **Reset otomatis setiap awal bulan**
- **Hasil saat ini: 10 transaksi**

### 2. Custom Hook (`useBMStats.ts`)

React Query hook untuk fetching dan caching:

```typescript
const { data: stats, isLoading } = useBMStats();
```

**Features:**
- ✅ Auto-refetch setiap 30 detik
- ✅ Stale time: 20 detik
- ✅ Refetch on window focus
- ✅ Retry logic (2x)
- ✅ Caching dengan React Query

### 3. UI Integration (`BMAccounts.tsx`)

Kotak statistik sekarang menampilkan data real-time:

```tsx
<SummaryCard
  icon={Package}
  value={stats?.totalStock || 0}
  label="Available Stock"
/>

<SummaryCard
  icon={TrendingUp}
  value={`${stats?.successRate || 0}%`}
  label="Success Rate"
  subInfo={{ text: 'High quality accounts', color: 'green' }}
/>

<SummaryCard
  icon={CheckCircle}
  value={stats?.totalSoldThisMonth || 0}
  label="Total Sold"
  subInfo={{ text: 'This month', color: 'orange' }}
/>
```

## 📈 Data Characteristics

### Kotak Kiri - Available Stock
- **Sumber**: Tabel `product_accounts`
- **Filter**: `product_type = 'bm_account'`, `status = 'available'`
- **Update**: Real-time saat akun ditambah/dijual
- **Scope**: **Stok akun BM** (jumlah akun yang tersedia, bukan jumlah produk)
- **Behavior**: Menampilkan 0 jika tidak ada akun di pool
- **Note**: Menghitung actual account inventory, bukan product count

### Kotak Tengah - Success Rate
- **Sumber**: Tabel `transactions` + `products`
- **Kalkulasi**: (Completed / Total) × 100
- **Update**: Real-time saat transaksi berubah status
- **Scope**: Semua transaksi BM (bukan per user)

### Kotak Kanan - Total Sold This Month
- **Sumber**: Tabel `transactions` + `products`
- **Filter**: Status `completed`, bulan berjalan
- **Reset**: Otomatis setiap tanggal 1
- **Scope**: Semua transaksi bulan ini (bukan per user)

## 🔄 Auto-Refresh

Statistik akan otomatis refresh dalam kondisi:
1. ⏱️ Setiap 30 detik (interval)
2. 👁️ Saat user kembali ke tab/window
3. 🔄 Saat user manual refetch
4. 📱 Saat component mount

## 🎯 Benefits

1. **Akurasi**: Data langsung dari database, bukan mock data
2. **Real-time**: Auto-refresh untuk data terkini
3. **Performance**: Caching dengan React Query
4. **Scalability**: Query optimized untuk performa
5. **Maintainability**: Service layer terpisah dan reusable

## 📁 Files Modified/Created

### Created:
- `src/features/member-area/services/bmStats.service.ts`
- `src/features/member-area/hooks/useBMStats.ts`

### Modified:
- `src/features/member-area/pages/BMAccounts.tsx`

## 🧪 Testing

Untuk test manual:
1. Buka halaman `/akun-bm`
2. Lihat 3 kotak statistik di atas
3. Data akan otomatis update setiap 30 detik
4. Buat transaksi baru untuk melihat perubahan

## 📊 Current Data (Nov 19, 2025)

```
Total Stock: 0 akun BM (real count dari product_accounts)
Success Rate: 90.9% (khusus transaksi BM)
Total Sold This Month: 10 transaksi (khusus BM)
```

**Note**: Total Stock menampilkan jumlah akun yang sebenarnya tersedia di `product_accounts`. Jika 0, berarti admin belum menambahkan akun ke pool. Setelah admin menambahkan akun, angka ini akan otomatis bertambah.

## 🔗 Related Changes

### Product Stock Synchronization
Stok produk di product cards juga sudah tersinkronisasi dengan `product_accounts`:
- **Before**: Hardcoded `100` untuk semua produk
- **After**: Real-time count dari database
- **Current**: Semua produk menampilkan `0` (karena product_accounts kosong)

Lihat `PRODUCT_STOCK_SYNC.md` untuk detail lengkap.

## 🐛 Troubleshooting

### Data tidak muncul / menampilkan 0
1. Buka browser console (F12)
2. Cari log dengan prefix `[BMStats]`
3. Periksa error message yang muncul
4. Pastikan RLS (Row Level Security) di Supabase sudah dikonfigurasi dengan benar

### Success Rate menampilkan 0%
- Pastikan ada transaksi dengan `transaction_type = 'purchase'` di database
- Cek apakah `product_id` di tabel `transactions` valid dan merujuk ke produk BM

### Total Sold This Month menampilkan 0
- Pastikan ada transaksi dengan status `completed` di bulan berjalan
- Cek timezone server vs database (gunakan UTC)

### Query Performance Issues
- Pastikan ada index pada kolom:
  - `products.product_type`
  - `products.is_active`
  - `products.stock_status`
  - `transactions.product_id`
  - `transactions.transaction_type`
  - `transactions.status`
  - `transactions.created_at`

## 🔮 Future Enhancements

Potensial improvements:
- [ ] Add loading skeleton untuk better UX
- [ ] Add error boundary untuk error handling
- [ ] Add tooltip dengan detail breakdown
- [ ] Add trend indicator (naik/turun vs bulan lalu)
- [ ] Add export data functionality
- [ ] Separate total stock by product type (BM vs Personal)
