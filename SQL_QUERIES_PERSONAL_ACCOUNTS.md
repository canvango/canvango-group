# SQL Queries - Personal Accounts Management

Kumpulan SQL queries yang berguna untuk mengelola produk Akun Personal.

---

## 📊 VIEWING DATA

### 1. Lihat Semua Produk Personal Account
```sql
SELECT 
  p.id,
  p.product_name,
  p.category,
  c.name as category_name,
  p.price,
  p.stock_status,
  p.is_active,
  COUNT(pa.id) FILTER (WHERE pa.status = 'available') as available_stock,
  COUNT(pa.id) as total_accounts
FROM products p
LEFT JOIN categories c ON p.category = c.slug
LEFT JOIN product_accounts pa ON p.id = pa.product_id
WHERE p.product_type = 'personal_account'
GROUP BY p.id, p.product_name, p.category, c.name, p.price, p.stock_status, p.is_active
ORDER BY p.price ASC;
```

### 2. Lihat Detail Produk Spesifik
```sql
SELECT 
  p.*,
  c.name as category_name,
  COUNT(pa.id) FILTER (WHERE pa.status = 'available') as available_stock
FROM products p
LEFT JOIN categories c ON p.category = c.slug
LEFT JOIN product_accounts pa ON p.id = pa.product_id
WHERE p.id = '[PRODUCT_ID]'
GROUP BY p.id, c.name;
```

### 3. Lihat Stok Akun untuk Produk Tertentu
```sql
SELECT 
  pa.id,
  pa.account_data->>'email' as email,
  pa.account_data->>'account_name' as account_name,
  pa.account_data->>'created_year' as created_year,
  pa.status,
  pa.assigned_at,
  pa.created_at
FROM product_accounts pa
WHERE pa.product_id = '[PRODUCT_ID]'
ORDER BY pa.status, pa.created_at DESC;
```

---

## ➕ ADDING DATA

### 4. Tambah Produk Baru
```sql
INSERT INTO products (
  product_name,
  product_type,
  category,
  description,
  price,
  stock_status,
  is_active,
  warranty_duration,
  warranty_enabled,
  detail_fields
) VALUES (
  'NAMA PRODUK',
  'personal_account',
  'aged_1year', -- atau aged_2years, aged_3years
  'Deskripsi produk',
  100000, -- harga dalam rupiah
  'available',
  true,
  1, -- garansi 1 hari
  true,
  '[
    {"label": "Tipe Akun", "value": "Akun Personal", "icon": "👤"},
    {"label": "Friend Limit", "value": "100 - 1000 Teman", "icon": "👥"},
    {"label": "Umur Akun", "value": "1 Tahun", "icon": "📅"},
    {"label": "Limit Iklan", "value": "50$", "icon": "💰"},
    {"label": "Verifikasi", "value": "2FA Aktif", "icon": "🔐"},
    {"label": "Akun Iklan", "value": "1 Akun", "icon": "📊"},
    {"label": "Periode Garansi", "value": "1 Hari", "icon": "⏰"}
  ]'::jsonb
)
RETURNING id, product_name, price;
```

### 5. Tambah Stok Akun (Single)
```sql
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
)
RETURNING id, account_data->>'email' as email;
```

### 6. Tambah Stok Akun (Bulk - 10 akun)
```sql
INSERT INTO product_accounts (product_id, account_data, status)
SELECT 
  '[PRODUCT_ID]'::uuid,
  jsonb_build_object(
    'email', 'account_' || generate_series || '@example.com',
    'password', 'SecurePass' || generate_series || '!',
    'account_name', 'Account ' || generate_series,
    'created_year', '2023',
    'friends_count', (RANDOM() * 900 + 100)::int,
    'ad_limit', '50$',
    'two_factor_enabled', true
  ),
  'available'
FROM generate_series(1, 10);
```

---

## ✏️ UPDATING DATA

### 7. Update Harga Produk
```sql
UPDATE products
SET 
  price = 150000,
  updated_at = NOW()
WHERE id = '[PRODUCT_ID]';
```

### 8. Update Deskripsi Produk
```sql
UPDATE products
SET 
  description = 'Deskripsi baru yang lebih menarik',
  updated_at = NOW()
WHERE id = '[PRODUCT_ID]';
```

### 9. Update Detail Fields
```sql
UPDATE products
SET 
  detail_fields = '[
    {"label": "Tipe Akun", "value": "Akun Personal", "icon": "👤"},
    {"label": "Friend Limit", "value": "100 - 1000 Teman", "icon": "👥"},
    {"label": "Umur Akun", "value": "1 Tahun", "icon": "📅"},
    {"label": "Limit Iklan", "value": "100$", "icon": "💰"},
    {"label": "Verifikasi", "value": "2FA Aktif", "icon": "🔐"},
    {"label": "Akun Iklan", "value": "1 Akun", "icon": "📊"},
    {"label": "Status Ketersediaan", "value": "15 Tersedia", "icon": "✅"},
    {"label": "Periode Garansi", "value": "1 Hari", "icon": "⏰"}
  ]'::jsonb,
  updated_at = NOW()
WHERE id = '[PRODUCT_ID]';
```

### 10. Aktifkan/Nonaktifkan Produk
```sql
-- Nonaktifkan produk
UPDATE products
SET is_active = false, updated_at = NOW()
WHERE id = '[PRODUCT_ID]';

-- Aktifkan produk
UPDATE products
SET is_active = true, updated_at = NOW()
WHERE id = '[PRODUCT_ID]';
```

### 11. Update Stock Status
```sql
-- Set out of stock
UPDATE products
SET stock_status = 'out_of_stock', updated_at = NOW()
WHERE id = '[PRODUCT_ID]';

-- Set available
UPDATE products
SET stock_status = 'available', updated_at = NOW()
WHERE id = '[PRODUCT_ID]';
```

---

## 🗑️ DELETING DATA

### 12. Hapus Akun yang Belum Terjual
```sql
DELETE FROM product_accounts
WHERE product_id = '[PRODUCT_ID]'
  AND status = 'available';
```

### 13. Hapus Produk (Hati-hati!)
```sql
-- PERINGATAN: Ini akan menghapus produk dan semua akun yang terkait
-- Pastikan tidak ada transaksi yang masih aktif

-- Step 1: Hapus akun yang belum terjual
DELETE FROM product_accounts
WHERE product_id = '[PRODUCT_ID]'
  AND status = 'available';

-- Step 2: Nonaktifkan produk (lebih aman daripada hapus)
UPDATE products
SET is_active = false, updated_at = NOW()
WHERE id = '[PRODUCT_ID]';
```

---

## 📈 ANALYTICS & REPORTS

### 14. Top Selling Products
```sql
SELECT 
  p.product_name,
  p.price,
  COUNT(pu.id) as total_sold,
  SUM(pu.total_price) as total_revenue,
  AVG(pu.total_price) as avg_price
FROM products p
LEFT JOIN purchases pu ON p.id = pu.product_id
WHERE p.product_type = 'personal_account'
  AND pu.status = 'active'
GROUP BY p.id, p.product_name, p.price
ORDER BY total_sold DESC;
```

### 15. Revenue by Category
```sql
SELECT 
  c.name as category_name,
  COUNT(pu.id) as total_sales,
  SUM(pu.total_price) as total_revenue
FROM categories c
LEFT JOIN products p ON c.slug = p.category
LEFT JOIN purchases pu ON p.id = pu.product_id
WHERE p.product_type = 'personal_account'
  AND pu.status = 'active'
GROUP BY c.id, c.name
ORDER BY total_revenue DESC;
```

### 16. Stock Alert (Produk dengan Stok < 5)
```sql
SELECT 
  p.product_name,
  p.price,
  COUNT(pa.id) FILTER (WHERE pa.status = 'available') as available_stock
FROM products p
LEFT JOIN product_accounts pa ON p.id = pa.product_id
WHERE p.product_type = 'personal_account'
  AND p.is_active = true
GROUP BY p.id, p.product_name, p.price
HAVING COUNT(pa.id) FILTER (WHERE pa.status = 'available') < 5
ORDER BY available_stock ASC;
```

### 17. Sales Performance (Last 30 Days)
```sql
SELECT 
  DATE(pu.created_at) as sale_date,
  COUNT(pu.id) as total_sales,
  SUM(pu.total_price) as daily_revenue
FROM purchases pu
JOIN products p ON pu.product_id = p.id
WHERE p.product_type = 'personal_account'
  AND pu.created_at >= NOW() - INTERVAL '30 days'
  AND pu.status = 'active'
GROUP BY DATE(pu.created_at)
ORDER BY sale_date DESC;
```

### 18. Customer Purchase History
```sql
SELECT 
  u.full_name,
  u.email,
  p.product_name,
  pu.total_price,
  pu.created_at,
  pu.status,
  pu.warranty_expires_at
FROM purchases pu
JOIN users u ON pu.user_id = u.id
JOIN products p ON pu.product_id = p.id
WHERE p.product_type = 'personal_account'
ORDER BY pu.created_at DESC
LIMIT 50;
```

---

## 🔍 DEBUGGING & TROUBLESHOOTING

### 19. Cek Produk yang Tidak Muncul di Frontend
```sql
SELECT 
  p.id,
  p.product_name,
  p.is_active,
  p.stock_status,
  c.is_active as category_active,
  COUNT(pa.id) FILTER (WHERE pa.status = 'available') as available_stock
FROM products p
LEFT JOIN categories c ON p.category = c.slug
LEFT JOIN product_accounts pa ON p.id = pa.product_id
WHERE p.product_type = 'personal_account'
GROUP BY p.id, p.product_name, p.is_active, p.stock_status, c.is_active
HAVING COUNT(pa.id) FILTER (WHERE pa.status = 'available') = 0
   OR p.is_active = false
   OR c.is_active = false;
```

### 20. Cek Transaksi yang Gagal
```sql
SELECT 
  t.id,
  u.email,
  p.product_name,
  t.amount,
  t.status,
  t.notes,
  t.created_at
FROM transactions t
JOIN users u ON t.user_id = u.id
LEFT JOIN products p ON t.product_id = p.id
WHERE p.product_type = 'personal_account'
  AND t.status IN ('failed', 'cancelled')
ORDER BY t.created_at DESC
LIMIT 20;
```

### 21. Cek Akun yang Terjual tapi Tidak Ter-assign
```sql
SELECT 
  pa.id,
  pa.account_data->>'email' as email,
  pa.status,
  pa.assigned_to_transaction_id,
  pa.assigned_at
FROM product_accounts pa
JOIN products p ON pa.product_id = p.id
WHERE p.product_type = 'personal_account'
  AND pa.status = 'sold'
  AND pa.assigned_to_transaction_id IS NULL;
```

---

## 🛡️ MAINTENANCE

### 22. Reset Akun yang Stuck (Hati-hati!)
```sql
-- Reset akun yang statusnya 'sold' tapi tidak ada transaksi
UPDATE product_accounts
SET 
  status = 'available',
  assigned_to_transaction_id = NULL,
  assigned_at = NULL,
  updated_at = NOW()
WHERE status = 'sold'
  AND assigned_to_transaction_id IS NULL;
```

### 23. Clean Up Old Backup Tables
```sql
-- Cek ukuran backup tables
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE tablename LIKE '%backup%'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Hapus backup tables (jika sudah tidak diperlukan)
-- DROP TABLE IF EXISTS balance_backup_20251125;
-- DROP TABLE IF EXISTS users_backup_purchase_fix_20251125;
-- DROP TABLE IF EXISTS transactions_backup_purchase_fix_20251125;
-- DROP TABLE IF EXISTS purchases_backup_purchase_fix_20251125;
```

---

## 📝 NOTES

### Best Practices
1. Selalu backup data sebelum melakukan UPDATE/DELETE massal
2. Gunakan `RETURNING` clause untuk verifikasi hasil INSERT/UPDATE
3. Test query di development environment dulu
4. Gunakan transactions untuk operasi yang kompleks
5. Monitor performance dengan `EXPLAIN ANALYZE`

### Security
- Jangan expose password dalam query results
- Gunakan RLS policies untuk akses control
- Audit log semua perubahan penting
- Encrypt sensitive data di `account_data`

---

**Last Updated:** 28 November 2025  
**Version:** 1.0  
**Database:** Supabase PostgreSQL
