# Admin Guide - Mengelola Produk Akun Personal

## 📋 Quick Reference

### Status Saat Ini
- ✅ 5 Produk aktif
- ✅ 28 Akun tersedia untuk dijual
- ✅ 3 Kategori aktif (1 Year, 2 Years, 3+ Years)

---

## 🛠️ Cara Menambah Produk Baru

### Via Admin Dashboard

1. **Login sebagai Admin**
   - Buka `/admin/products`

2. **Klik "Add Product"**
   - Pilih Product Type: `personal_account`
   - Pilih Category: `aged_1year`, `aged_2years`, atau `aged_3years`

3. **Isi Detail Produk**
   ```
   Product Name: AKUN PERSONAL [DESKRIPSI]
   Price: [Harga dalam Rupiah]
   Description: [Deskripsi singkat]
   Warranty Duration: 1 (hari)
   Stock Status: available
   ```

4. **Tambahkan Detail Fields**
   - Klik "Add Field"
   - Format: Label, Value, Icon (emoji)
   - Contoh:
     - Label: "Tipe Akun", Value: "Akun Personal", Icon: "👤"
     - Label: "Friend Limit", Value: "100 - 1000 Teman", Icon: "👥"
     - Label: "Umur Akun", Value: "1 Tahun", Icon: "📅"

5. **Save Product**

---

## 📦 Cara Menambah Stok Akun

### Via SQL (Recommended untuk bulk insert)

```sql
-- Template untuk menambah stok
INSERT INTO product_accounts (product_id, account_data, status)
VALUES (
  '[PRODUCT_ID]'::uuid,
  jsonb_build_object(
    'email', 'email@example.com',
    'password', 'SecurePassword123!',
    'account_name', 'Account Name',
    'created_year', '2023',
    'friends_count', 500,
    'ad_limit', '50$',
    'two_factor_enabled', true
  ),
  'available'
);
```

### Via Admin Dashboard (Coming Soon)
- Fitur "Add Account" di Product Management
- Upload CSV untuk bulk import

---

## 💰 Pricing Strategy

### Rekomendasi Harga Berdasarkan Umur

| Umur Akun | Harga Range | Target Market |
|-----------|-------------|---------------|
| 1 Year | Rp 50.000 - 100.000 | Pemula, Budget Terbatas |
| 2 Years | Rp 100.000 - 150.000 | Intermediate, Bisnis Kecil |
| 3+ Years | Rp 150.000 - 200.000 | Professional, Bisnis Besar |
| Vintage (8+ Years) | Rp 200.000 - 300.000 | Premium, High Trust Score |

### Faktor yang Mempengaruhi Harga
- ✅ Umur akun (semakin tua = semakin mahal)
- ✅ Friend limit (lebih banyak teman = lebih mahal)
- ✅ Ad limit (limit iklan lebih tinggi = lebih mahal)
- ✅ Verifikasi status (verified = lebih mahal)
- ✅ Kelangkaan (stok terbatas = lebih mahal)

---

## 📊 Monitoring & Analytics

### Query untuk Cek Performa Produk

```sql
-- Top selling products
SELECT 
  p.product_name,
  COUNT(pu.id) as total_sold,
  SUM(pu.total_price) as total_revenue
FROM products p
LEFT JOIN purchases pu ON p.id = pu.product_id
WHERE p.product_type = 'personal_account'
GROUP BY p.id, p.product_name
ORDER BY total_sold DESC;
```

```sql
-- Stock availability
SELECT 
  p.product_name,
  p.price,
  COUNT(pa.id) FILTER (WHERE pa.status = 'available') as available_stock,
  COUNT(pa.id) FILTER (WHERE pa.status = 'sold') as sold_stock
FROM products p
LEFT JOIN product_accounts pa ON p.id = pa.product_id
WHERE p.product_type = 'personal_account'
GROUP BY p.id, p.product_name, p.price
ORDER BY available_stock ASC;
```

---

## 🔧 Maintenance Tasks

### Daily
- [ ] Cek stok produk yang hampir habis
- [ ] Monitor warranty claims
- [ ] Verifikasi akun yang baru dijual

### Weekly
- [ ] Update harga berdasarkan demand
- [ ] Tambah stok untuk produk populer
- [ ] Review customer feedback

### Monthly
- [ ] Analisis penjualan per kategori
- [ ] Optimize pricing strategy
- [ ] Clean up expired accounts

---

## ⚠️ Troubleshooting

### Produk Tidak Muncul di Frontend

**Cek:**
1. `is_active = true`
2. `stock_status = 'available'`
3. Ada stok di `product_accounts` dengan status `available`
4. Kategori aktif (`categories.is_active = true`)

**Query untuk debug:**
```sql
SELECT 
  p.id,
  p.product_name,
  p.is_active,
  p.stock_status,
  COUNT(pa.id) FILTER (WHERE pa.status = 'available') as available_stock
FROM products p
LEFT JOIN product_accounts pa ON p.id = pa.product_id
WHERE p.product_type = 'personal_account'
GROUP BY p.id, p.product_name, p.is_active, p.stock_status;
```

### Stok Tidak Berkurang Setelah Pembelian

**Cek:**
1. Transaction status = `completed`
2. Purchase record ada di tabel `purchases`
3. Account status berubah dari `available` → `sold`
4. `assigned_to_transaction_id` terisi

**Query untuk debug:**
```sql
SELECT 
  t.id as transaction_id,
  t.status as transaction_status,
  pu.id as purchase_id,
  pa.status as account_status,
  pa.assigned_to_transaction_id
FROM transactions t
LEFT JOIN purchases pu ON t.id = pu.transaction_id
LEFT JOIN product_accounts pa ON pa.assigned_to_transaction_id = t.id
WHERE t.transaction_type = 'purchase'
ORDER BY t.created_at DESC
LIMIT 5;
```

---

## 📞 Support

Jika ada masalah yang tidak bisa diselesaikan:

1. Cek logs di Supabase Dashboard
2. Review RLS policies
3. Verifikasi foreign key constraints
4. Contact developer untuk assistance

---

**Last Updated:** 28 November 2025  
**Version:** 1.0  
**Status:** ✅ Production Ready
