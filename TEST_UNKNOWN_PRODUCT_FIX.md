# Quick Test: Unknown Product Fix

## 🎯 Tujuan
Memverifikasi bahwa nama produk ditampilkan dengan benar di dropdown Claim Garansi.

## 🚀 Test Steps

### 1. Restart Server
```bash
# Stop server jika running
# Start server
cd server
npm run dev
```

### 2. Login sebagai Member
- Buka browser: `http://localhost:5173`
- Login dengan akun member yang punya purchases
- Contoh: `member1@test.com` / `password123`

### 3. Buka Halaman Claim Garansi
- Navigate ke: `/claim-garansi`
- Atau klik menu "Claim Garansi" di sidebar

### 4. Check Dropdown
**Expected Result:**
```
Dropdown menampilkan:
✅ BM Account - Limit 250 - user@email.com (Garansi: 20 Des 2025)
✅ BM Account - Limit 1000 - #abc12345 (Garansi: 21 Des 2025)

BUKAN:
❌ Unknown Product - #c6330170 (Garansi: N/A)
```

### 5. Select Akun
- Klik dropdown
- Pilih salah satu akun
- **Expected:** Info box biru muncul dengan detail lengkap

### 6. Check Backend Logs
**Expected Logs:**
```
📦 Purchases found: 5
📋 Sample purchase data: {
  "id": "c6330170-...",
  "products": {
    "product_name": "BM Account - Limit 250"
  }
}
📋 Product data check: {
  hasProducts: true,
  productName: "BM Account - Limit 250",
  productType: "object"
}
✅ Eligible accounts: 5
📋 Products in eligible purchases: [
  { purchaseId: "c6330170", productName: "BM Account - Limit 250" }
]
```

## ✅ Success Criteria

### Frontend
- [x] Dropdown menampilkan nama produk yang jelas
- [x] Format: `{Nama Produk} - {Email/ID} (Garansi: {Tanggal})`
- [x] Info box muncul setelah select
- [x] Tidak ada "Unknown Product"

### Backend
- [x] Logs menampilkan product_name dengan benar
- [x] Tidak ada log "⚠️ Product data missing"
- [x] Semua eligible purchases punya product data

## 🐛 Troubleshooting

### Issue: Masih "Unknown Product"

**Check 1: Backend Logs**
```bash
# Lihat logs di terminal server
# Cari: 📋 Product data check
# Pastikan: productName tidak null
```

**Check 2: Database**
```sql
-- Run di Supabase SQL Editor
SELECT 
  p.id,
  p.product_id,
  prod.product_name
FROM purchases p
LEFT JOIN products prod ON p.product_id = prod.id
WHERE p.user_id = '57244e0a-d4b2-4499-937d-4fd71e90bc07'
  AND p.status = 'active'
  AND p.warranty_expires_at > NOW()
LIMIT 5;

-- Expected: product_name terisi
```

**Check 3: Frontend Console**
```javascript
// Buka DevTools → Console
// Lihat response dari API
// Network → eligible-accounts → Response
// Pastikan: products.product_name ada
```

### Issue: Dropdown Kosong

**Penyebab:**
- Tidak ada purchases dengan garansi aktif
- Semua purchases sudah punya claim pending

**Solusi:**
```sql
-- Check purchases user
SELECT 
  id,
  product_id,
  status,
  warranty_expires_at,
  warranty_expires_at > NOW() as valid
FROM purchases
WHERE user_id = 'USER_ID'
ORDER BY created_at DESC;
```

### Issue: Fallback Triggered

**Jika melihat log:**
```
⚠️ Product data missing for purchase: xxx - fetching manually
✅ Product data fetched: BM Account - Limit 250
```

**Artinya:**
- Join gagal, tapi fallback berhasil
- Produk tetap ditampilkan dengan benar
- Perlu investigate kenapa join gagal

**Action:**
1. Check RLS policy products table
2. Check foreign key relationship
3. Check Supabase client version

## 📊 Test Results Template

```
Date: ___________
Tester: ___________

✅ / ❌  Dropdown menampilkan nama produk
✅ / ❌  Format display benar
✅ / ❌  Info box muncul setelah select
✅ / ❌  Backend logs benar
✅ / ❌  Tidak ada "Unknown Product"

Notes:
_________________________________
_________________________________
```

## 🎯 Quick SQL Verification

```sql
-- Verify eligible accounts dengan product names
SELECT 
  p.id as purchase_id,
  p.status,
  p.warranty_expires_at,
  prod.product_name,
  prod.product_type,
  (SELECT COUNT(*) 
   FROM warranty_claims wc 
   WHERE wc.purchase_id = p.id 
   AND wc.status IN ('pending', 'reviewing')) as active_claims
FROM purchases p
LEFT JOIN products prod ON p.product_id = prod.id
WHERE p.user_id = '57244e0a-d4b2-4499-937d-4fd71e90bc07'
  AND p.status = 'active'
  AND p.warranty_expires_at > NOW()
ORDER BY p.created_at DESC;

-- Expected:
-- ✅ product_name terisi (bukan NULL)
-- ✅ active_claims = 0
-- ✅ warranty_expires_at > NOW()
```

## 📚 Related Docs

- `UNKNOWN_PRODUCT_FIX_COMPLETE.md` - Detail implementasi
- `CLAIM_DROPDOWN_UX_IMPROVEMENT.md` - UI improvement
- `QUICK_REFERENCE_CLAIM_DROPDOWN.md` - User guide
