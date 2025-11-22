# Integrasi Detail Produk: Admin ↔ User

## ✅ Fitur yang Terintegrasi

### 1. **Detail Akun & Harga**
Admin mengisi di form → User lihat di modal detail

| Field Admin | Field Database | Tampilan User |
|------------|----------------|---------------|
| Product Name | `product_name` | Judul produk |
| Description | `description` | Deskripsi produk |
| Price | `price` | Harga Satuan (IDR) |
| Ad Limit | `ad_limit` | Limit Iklan |
| Verification Status | `verification_status` | Verifikasi |
| Ad Account Type | `ad_account_type` | Akun Iklan |
| Dynamic Detail Fields | `detail_fields` (JSONB) | Field custom |
| Stock | `product_accounts` (count) | Status Ketersediaan |
| Warranty Duration | `warranty_duration` | Periode Garansi |

### 2. **Keunggulan Produk**
Admin mengisi di tab "Product Details" → User lihat di section "Keunggulan Produk"

**Format Admin:**
```
Textarea "Advantages" - satu keunggulan per baris:
Sudah di buatkan akun iklan
Sudah di buatkan fanspage
Bisa merubah negara dan mata uang
```

**Format Database:**
```sql
advantages: TEXT (multiline)
```

**Tampilan User:**
```
✓ Sudah di buatkan akun iklan
✓ Sudah di buatkan fanspage
✓ Bisa merubah negara dan mata uang
```

### 3. **Kekurangan & Peringatan**
Admin mengisi di tab "Product Details" → User lihat di section "Kekurangan & Peringatan"

**Format Admin:**
```
Textarea "Disadvantages" - satu kekurangan per baris:
Tidak di rekomendasikan untuk langsung di gunakan
Tidak aman jika langsung mendaftarkan WhatsApp API
```

**Format Database:**
```sql
disadvantages: TEXT (multiline)
```

**Tampilan User:**
```
✕ Tidak di rekomendasikan untuk langsung di gunakan
✕ Tidak aman jika langsung mendaftarkan WhatsApp API
```

### 4. **Garansi & Ketentuan**
Admin mengisi di tab "Warranty & Terms" → User lihat di section "Garansi & Ketentuan"

**Format Admin:**
```
Warranty Duration: 30 (days)
Warranty Enabled: ✓

Textarea "Warranty Terms" - satu ketentuan per baris:
Garansi tidak berlaku jika membuat akun iklan baru
Garansi tidak berlaku akun BM mati saat menambahkan admin
```

**Format Database:**
```sql
warranty_duration: INTEGER
warranty_enabled: BOOLEAN
warranty_terms: TEXT (multiline)
```

**Tampilan User:**
```
Periode Garansi: 30 Hari

Syarat & Ketentuan Berlaku:
✓ Garansi tidak berlaku jika membuat akun iklan baru
✓ Garansi tidak berlaku akun BM mati saat menambahkan admin
```

## 🔄 Alur Data

### Create/Edit Product (Admin)
```
1. Admin mengisi form di /admin/products
2. Data disimpan ke database:
   - advantages → TEXT (multiline)
   - disadvantages → TEXT (multiline)
   - warranty_terms → TEXT (multiline)
   - detail_fields → JSONB array
3. productsService.create() atau .update()
```

### View Product (User)
```
1. User buka /akun-bm
2. fetchProducts() query dengan relasi product_accounts
3. Transform data:
   - Parse advantages → array features
   - Parse disadvantages → array limitations
   - Parse warranty_terms → array terms
   - Count available_stock dari product_accounts
4. Tampilkan di ProductDetailModal
```

## 📝 Format Data

### Advantages/Disadvantages/Warranty Terms
**Input (Admin):**
```
Line 1
Line 2
Line 3
```

**Database:**
```sql
"Line 1\nLine 2\nLine 3"
```

**Output (User):**
```javascript
['Line 1', 'Line 2', 'Line 3']
```

### Detail Fields
**Input (Admin):**
```javascript
[
  { label: "Limit Iklan", value: "$250/day", icon: "💰" },
  { label: "Verifikasi", value: "Blue Badge", icon: "✓" }
]
```

**Database:**
```json
[
  {"label": "Limit Iklan", "value": "$250/day", "icon": "💰"},
  {"label": "Verifikasi", "value": "Blue Badge", "icon": "✓"}
]
```

**Output (User):**
```
Limit Iklan: $250/day
Verifikasi: Blue Badge
```

## 🎯 Default Values

Jika admin tidak mengisi field, sistem menggunakan default berdasarkan `product_type`:

### BM Account Defaults:
- **Features:** 6 keunggulan default
- **Limitations:** 2 kekurangan default
- **Warranty Terms:** 5 ketentuan default
- **Warranty Duration:** 30 hari

### Personal Account Defaults:
- **Features:** 5 keunggulan default
- **Limitations:** 3 kekurangan default
- **Warranty Terms:** 4 ketentuan default
- **Warranty Duration:** 7 hari

## ✅ Testing Checklist

### Admin Side:
- [ ] Create product dengan advantages custom
- [ ] Create product dengan disadvantages custom
- [ ] Create product dengan warranty terms custom
- [ ] Create product dengan detail fields custom
- [ ] Edit product dan ubah semua field
- [ ] Kosongkan field → harus pakai default

### User Side:
- [ ] Lihat produk dengan data custom di /akun-bm
- [ ] Klik detail → semua field muncul
- [ ] Keunggulan tampil dengan icon ✓
- [ ] Kekurangan tampil dengan icon ✕
- [ ] Garansi tampil dengan durasi dan terms
- [ ] Detail fields custom tampil
- [ ] Stok real dari pool tampil

### Integration:
- [ ] Admin edit advantages → User lihat perubahan
- [ ] Admin edit disadvantages → User lihat perubahan
- [ ] Admin edit warranty → User lihat perubahan
- [ ] Admin tambah detail field → User lihat field baru
- [ ] Admin tambah akun di pool → Stok naik di user
- [ ] User beli → Stok turun

## 🚀 Cara Test

1. **Login sebagai Admin**
   ```
   http://localhost:5173/admin/products
   ```

2. **Create Product Baru**
   - Tab Basic: Isi nama, type, category, price
   - Tab Details: Isi advantages, disadvantages, detail fields
   - Tab Warranty: Isi duration, terms
   - Save

3. **View di Product Detail Modal (Admin)**
   - Klik icon mata (View Details)
   - Manage account pool

4. **Login sebagai User**
   ```
   http://localhost:5173/akun-bm
   ```

5. **View Product Detail**
   - Klik produk yang baru dibuat
   - Verifikasi semua field muncul:
     - Detail Akun & Harga ✓
     - Keunggulan Produk ✓
     - Kekurangan & Peringatan ✓
     - Garansi & Ketentuan ✓

## 📊 Database Schema

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  product_name VARCHAR NOT NULL,
  product_type VARCHAR NOT NULL,
  category VARCHAR NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  stock_status VARCHAR DEFAULT 'available',
  is_active BOOLEAN DEFAULT true,
  
  -- Detail fields
  ad_limit VARCHAR,
  verification_status VARCHAR,
  ad_account_type VARCHAR,
  
  -- Content fields (multiline text)
  advantages TEXT,
  disadvantages TEXT,
  warranty_terms TEXT,
  
  -- Warranty settings
  warranty_duration INTEGER DEFAULT 30,
  warranty_enabled BOOLEAN DEFAULT true,
  
  -- Dynamic fields (JSONB)
  detail_fields JSONB DEFAULT '[]',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE product_accounts (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  account_data JSONB NOT NULL,
  status VARCHAR DEFAULT 'available', -- 'available' | 'sold'
  assigned_to_transaction_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🎨 UI Components

### Admin Form (ProductManagement.tsx)
- Tab 1: Basic Info
- Tab 2: Product Details (advantages, disadvantages, detail_fields)
- Tab 3: Warranty & Terms (duration, enabled, terms)

### User Modal (ProductDetailModal.tsx)
- Hero Section (icon, title, description)
- Detail Akun & Harga (price, detail_fields, stock)
- Keunggulan Produk (features with ✓)
- Kekurangan & Peringatan (limitations with ✕)
- Garansi & Ketentuan (warranty info with ✓)

## ✅ Status Integrasi

| Fitur | Admin Input | Database | User Display | Status |
|-------|-------------|----------|--------------|--------|
| Product Name | ✅ | ✅ | ✅ | ✅ |
| Description | ✅ | ✅ | ✅ | ✅ |
| Price | ✅ | ✅ | ✅ | ✅ |
| Ad Limit | ✅ | ✅ | ✅ | ✅ |
| Verification Status | ✅ | ✅ | ✅ | ✅ |
| Ad Account Type | ✅ | ✅ | ✅ | ✅ |
| Advantages | ✅ | ✅ | ✅ | ✅ |
| Disadvantages | ✅ | ✅ | ✅ | ✅ |
| Warranty Terms | ✅ | ✅ | ✅ | ✅ |
| Warranty Duration | ✅ | ✅ | ✅ | ✅ |
| Detail Fields | ✅ | ✅ | ✅ | ✅ |
| Stock (Pool) | ✅ | ✅ | ✅ | ✅ |

**Semua fitur sudah terintegrasi 100%!** 🎉
