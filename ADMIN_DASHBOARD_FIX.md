# Admin Dashboard Fix - Database Query Errors

## 🐛 Masalah

Dashboard admin menampilkan error:
```
Failed to load statistics
Error 400: Bad Request from Supabase
```

**Root Cause:**
- Query mencoba mengakses kolom `product_type` yang tidak ada di tabel `transactions`
- Status mapping tidak sesuai dengan schema database

## ✅ Solusi yang Diterapkan

### 1. Fix Transaction Stats Query

**Sebelum:**
```typescript
.select('created_at, amount, product_type')  // ❌ product_type tidak ada
```

**Sesudah:**
```typescript
.select(`
  created_at,
  amount,
  transaction_type,
  products (
    product_type,
    product_name
  )
`)  // ✅ Join dengan tabel products
```

### 2. Fix Status Mapping

**Database Schema Status:**
- Transactions: `pending`, `processing`, `completed`, `failed`, `cancelled`
- Warranty Claims: `pending`, `reviewing`, `approved`, `rejected`, `completed`

**Mapping ke Dashboard:**
```typescript
// Transactions
BERHASIL: completed
PENDING: pending + processing
GAGAL: failed + cancelled

// Claims
APPROVED: approved + completed
REJECTED: rejected
PENDING: pending + reviewing
```

### 3. Tambah Data Real untuk Tutorials & Products

**Sebelum:** Hardcoded `0`

**Sesudah:**
```typescript
// Tutorials
const { data: tutorials } = await supabase
  .from('tutorials')
  .select('id, view_count');

// Products
const { data: products } = await supabase
  .from('products')
  .select('id, stock_status');
```

### 4. Fix Revenue Calculation

**Sebelum:** Menghitung semua transaksi

**Sesudah:** Hanya menghitung transaksi `completed`
```typescript
const totalRevenue = transactions?.reduce((sum, txn) => {
  if (txn.status === 'completed') {
    return sum + (txn.amount || 0);
  }
  return sum;
}, 0) || 0;
```

## 📊 Hasil

Dashboard admin sekarang menampilkan:
- ✅ Total Users (dengan breakdown role)
- ✅ Total Transactions (dengan breakdown status)
- ✅ Total Revenue (hanya dari completed transactions)
- ✅ Pending Claims (dengan breakdown status)
- ✅ Total Tutorials (dengan total views)
- ✅ Total Products (dengan breakdown stock)
- ✅ Transaction Volume Chart (7 hari terakhir)
- ✅ User Growth Chart (7 hari terakhir)
- ✅ Product Performance Table

## 🔧 File yang Diubah

- `src/features/member-area/services/adminStatsService.ts`

## 🧪 Testing

### 1. Refresh Browser
Buka `/admin/dashboard` dan refresh halaman (Ctrl+F5 atau Cmd+Shift+R)

### 2. Check Console Logs
Anda akan melihat logging seperti ini:
```
📊 Fetching overview stats...
✅ Users fetched: 4
✅ Transactions fetched: 6
✅ Claims fetched: 0
✅ Tutorials fetched: 4
✅ Products fetched: 17
📊 Fetching transaction stats...
✅ Transaction stats fetched: 6
```

### 3. Verify Dashboard Display
Pastikan:
1. ✅ Tidak ada error "Failed to load statistics"
2. ✅ Semua statistics cards menampilkan angka (bukan 0 semua)
3. ✅ Charts menampilkan data dengan benar
4. ✅ Period selector berfungsi (7d, 30d, 90d, 365d)
5. ✅ Product Performance Table menampilkan data

### 4. Check Data Accuracy
- Total Users: Harus sesuai dengan jumlah user di database
- Total Transactions: Harus sesuai dengan jumlah transaksi
- Total Revenue: Hanya menghitung transaksi `completed`
- Total Products: Harus sesuai dengan jumlah produk

## 📝 Notes

- Revenue calculation sekarang hanya menghitung transaksi yang `completed`
- Product type diambil dari join dengan tabel `products`
- Jika transaksi tidak memiliki product (topup), akan menggunakan `transaction_type`
