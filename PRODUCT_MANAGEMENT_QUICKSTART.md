# 🚀 Product Management - Quick Start Guide

## Setup dalam 5 Menit

### 1. Setup Environment Variables

**Backend (.env):**
```bash
cd canvango-app/backend
cp .env.example .env
# Edit .env dengan credentials Supabase Anda
```

**Frontend (.env):**
```bash
cd canvango-app/frontend
cp .env.example .env
# Edit .env dengan API URL dan Supabase credentials
```

### 2. Install Dependencies & Start

**Terminal 1 - Backend:**
```bash
cd canvango-app/backend
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd canvango-app/frontend
npm install
npm run dev
```

### 3. Login & Access

1. Buka browser: `http://localhost:5173`
2. Login dengan admin account:
   - Email: `admin1@gmail.com`
3. Klik sidebar → "Menu Admin" → "Kelola Produk"

---

## 🎯 Fitur Utama

### ✅ CRUD Operations
- **Create** - Tambah produk baru
- **Read** - List & detail produk
- **Update** - Edit produk
- **Delete** - Hapus produk
- **Duplicate** - Duplikat produk (BARU!)

### ✅ Advanced Features
- Search produk
- Filter by type & stock
- Pagination
- Statistics
- Audit logging

---

## 📝 Cara Menggunakan

### Tambah Produk Baru
1. Klik button "Tambah Produk"
2. Isi form:
   - Product Name *
   - Product Type *
   - Category *
   - Description
   - Price (IDR) *
   - Stock Status *
   - Active (checkbox)
3. Klik "Create"

### Edit Produk
1. Klik icon pensil (biru) di row produk
2. Edit field yang diinginkan
3. Klik "Update"

### Duplikat Produk (BARU!)
1. Klik icon copy (hijau) di row produk
2. Produk akan diduplikat dengan nama "(Copy)"
3. Edit nama jika perlu

### Hapus Produk
1. Klik icon trash (merah) di row produk
2. Konfirmasi penghapusan
3. Klik "Delete"

### Search & Filter
- **Search:** Ketik di search bar untuk cari by name/category/description
- **Filter Type:** Pilih product type dari dropdown
- **Filter Stock:** Pilih stock status dari dropdown

---

## 🔧 API Endpoints

```
GET    /api/admin/products              - List produk
GET    /api/admin/products/stats        - Statistik
GET    /api/admin/products/:id          - Detail produk
POST   /api/admin/products              - Create produk
POST   /api/admin/products/:id/duplicate - Duplicate produk
PUT    /api/admin/products/:id          - Update produk
DELETE /api/admin/products/:id          - Delete produk
```

---

## 🗄️ Database

### Table: products

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| product_name | VARCHAR(255) | Nama produk |
| product_type | VARCHAR(50) | Tipe produk |
| category | VARCHAR(100) | Kategori |
| description | TEXT | Deskripsi |
| price | NUMERIC | Harga (IDR) |
| stock_status | VARCHAR(20) | Status stok |
| is_active | BOOLEAN | Status aktif |
| created_at | TIMESTAMP | Tanggal dibuat |
| updated_at | TIMESTAMP | Tanggal diupdate |

### Product Types
- `bm_account` - BM Account
- `personal_account` - Personal Account
- `verified_bm` - Verified BM
- `api` - API Access

### Stock Status
- `available` - Tersedia
- `out_of_stock` - Habis

---

## 🐛 Troubleshooting

### Backend tidak bisa start
```bash
# Cek environment variables
cat canvango-app/backend/.env

# Cek port 3000 tidak digunakan
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows
```

### Frontend tidak bisa connect ke backend
```bash
# Cek VITE_API_BASE_URL di .env
cat canvango-app/frontend/.env

# Pastikan backend running
curl http://localhost:3000/health
```

### Error "Unauthorized"
```bash
# Login ulang sebagai admin
# Cek role di database:
SELECT email, role FROM users WHERE email = 'admin1@gmail.com';
```

---

## 📊 Sample Data

Insert sample products untuk testing:

```sql
INSERT INTO products (product_name, product_type, category, description, price, stock_status)
VALUES
  ('BM50 - Standard', 'bm_account', 'bm50', 'BM with $50 limit', 100000, 'available'),
  ('BM50 - Plus', 'bm_account', 'bm50', 'Enhanced BM50', 150000, 'available'),
  ('Personal - 1Y', 'personal_account', 'aged', 'Aged 1 year', 100000, 'available'),
  ('Verified BM', 'verified_bm', 'verified', 'Verified BM', 500000, 'available'),
  ('API Starter', 'api', 'api_access', 'API access', 200000, 'available');
```

---

## ✅ Checklist

- [ ] Backend running di port 3000
- [ ] Frontend running di port 5173
- [ ] Environment variables configured
- [ ] Database connected
- [ ] Admin user exists
- [ ] Can login as admin
- [ ] Can access Product Management page
- [ ] Can create product
- [ ] Can edit product
- [ ] Can duplicate product
- [ ] Can delete product
- [ ] Search & filter working
- [ ] Pagination working

---

## 🎉 Done!

Sistem Product Management siap digunakan dengan fitur duplikat produk!

**Dokumentasi lengkap:** `PRODUCT_MANAGEMENT_IMPLEMENTATION.md`  
**API Testing:** `test-product-api.http`
