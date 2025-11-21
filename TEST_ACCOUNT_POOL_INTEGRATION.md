# Test Account Pool Integration

## 🧪 Manual Testing Guide

### Prerequisites
1. Server running on port 5000
2. User logged in dengan transaksi yang sudah completed
3. Product dengan account pool sudah disetup

### Test 1: View Single Account Transaction

**Steps:**
1. Login sebagai member
2. Buka halaman `/riwayat-transaksi`
3. Cari transaksi dengan quantity = 1
4. Klik tombol "Lihat Detail"

**Expected Result:**
```
URUTAN AKUN | DATA AKUN

1 | 129136990272169|https://business.facebook.com/invitation/?token=...
```

**API Call:**
```bash
GET /api/product-accounts/account/transaction/{transactionId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "account_data": {
      "id_bm": "129136990272169",
      "link_akses": "https://business.facebook.com/..."
    }
  },
  "count": 1
}
```

### Test 2: View Multiple Account Transaction

**Steps:**
1. Login sebagai member
2. Buka halaman `/riwayat-transaksi`
3. Cari transaksi dengan quantity > 1
4. Klik tombol "Lihat Detail"

**Expected Result:**
```
URUTAN AKUN | DATA AKUN

1 | 129136990272169|https://business.facebook.com/invitation/?token=...
2 | 198814490202944|https://business.facebook.com/invitation/?token=...
```

**API Call:**
```bash
GET /api/product-accounts/account/transaction/{transactionId}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "account_data": {
        "id_bm": "129136990272169",
        "link_akses": "https://business.facebook.com/..."
      }
    },
    {
      "id": "uuid-2",
      "account_data": {
        "id_bm": "198814490202944",
        "link_akses": "https://business.facebook.com/..."
      }
    }
  ],
  "count": 2
}
```

### Test 3: Copy Functionality

**Steps:**
1. Buka detail akun
2. Klik tombol copy pada baris pertama
3. Paste di notepad

**Expected Result:**
```
129136990272169|https://business.facebook.com/invitation/?token=...
```

**Steps:**
4. Klik tombol "Salin Semua"
5. Paste di notepad

**Expected Result:**
```
=====================================
DETAIL AKUN PEMBELIAN
Transaksi ID: #000359
Tanggal: 19/11/2025, 20.41.34
Produk: BM NEW VIETNAM VERIFIED
Status Garansi: Tidak ada garansi
=====================================

URUTAN AKUN | DATA AKUN

1 | 129136990272169|https://business.facebook.com/invitation/?token=...
2 | 198814490202944|https://business.facebook.com/invitation/?token=...

=====================================

KETERANGAN:

ID BM | Link Akses

Jika bingung cara akses akun BM nya, Hubungi customer service kami.

=====================================
```

### Test 4: Download Functionality

**Steps:**
1. Buka detail akun
2. Klik tombol "Download"
3. Check file `detail-akun-{transactionId}.txt`

**Expected Result:**
- File downloaded dengan nama `detail-akun-000359.txt`
- Content sama dengan "Salin Semua"

### Test 5: Additional Fields

**Setup:**
Admin menambahkan field tambahan di account pool:
```json
{
  "id_bm": "129136990272169",
  "link_akses": "https://...",
  "email": "test@example.com",
  "password": "SecurePass123"
}
```

**Expected Result:**
```
1 | 129136990272169|https://business.facebook.com/invitation/?token=...
  | email: test@example.com
  | password: SecurePass123
```

### Test 6: Expandable Details

**Steps:**
1. Buka detail akun
2. Klik "Lihat Detail Lengkap"

**Expected Result:**
- Section expand menampilkan:
  - Akun 1 dengan badge "Aktif"
  - ID: 129136990272169
  - Link: https://...
  - Email: test@example.com (if available)
  - Password: ******** (if available)

### Test 7: Error Handling

**Test 7a: No Account Assigned**

**Setup:**
- Transaction exists but no account assigned

**Expected Result:**
```
Tidak ada data akun tersedia
```

**Test 7b: API Error**

**Setup:**
- Server error atau network issue

**Expected Result:**
```
[Error message in red box]
Failed to load account data
```

### Test 8: Purchase Flow Integration

**Steps:**
1. Login sebagai member
2. Buka halaman BM Accounts
3. Pilih produk dengan stock > 0
4. Set quantity = 2
5. Klik "Beli Sekarang"
6. Konfirmasi pembelian

**Expected Result:**
- Balance berkurang
- Transaction created dengan status "BERHASIL"
- 2 accounts assigned dari pool
- Stock berkurang 2

**Verify:**
7. Buka Riwayat Transaksi
8. Klik "Lihat Detail" pada transaksi baru
9. Harus muncul 2 akun

### Test 9: Field Name Flexibility

**Test different field name formats:**

**Format 1: snake_case**
```json
{
  "id_bm": "123",
  "link_akses": "https://..."
}
```

**Format 2: PascalCase**
```json
{
  "ID_BM": "123",
  "Link_Akses": "https://..."
}
```

**Format 3: Mixed**
```json
{
  "id_bm": "123",
  "Link_Akses": "https://..."
}
```

**Expected Result:**
All formats should work correctly.

## 🔍 SQL Verification Queries

### Check Account Assignment

```sql
-- Check accounts assigned to transaction
SELECT 
  pa.id,
  pa.account_data,
  pa.status,
  pa.assigned_to_transaction_id,
  pa.assigned_at,
  t.id as transaction_id,
  t.quantity
FROM product_accounts pa
JOIN transactions t ON pa.assigned_to_transaction_id = t.id
WHERE t.id = 'YOUR_TRANSACTION_ID';
```

### Check Available Stock

```sql
-- Check available accounts per product
SELECT 
  p.product_name,
  COUNT(CASE WHEN pa.status = 'available' THEN 1 END) as available,
  COUNT(CASE WHEN pa.status = 'sold' THEN 1 END) as sold,
  COUNT(*) as total
FROM products p
LEFT JOIN product_accounts pa ON p.id = pa.product_id
GROUP BY p.id, p.product_name;
```

### Check Transaction with Accounts

```sql
-- Get transaction with all assigned accounts
SELECT 
  t.id as transaction_id,
  t.quantity,
  t.total_amount,
  t.status,
  json_agg(
    json_build_object(
      'account_id', pa.id,
      'account_data', pa.account_data,
      'assigned_at', pa.assigned_at
    )
  ) as accounts
FROM transactions t
LEFT JOIN product_accounts pa ON t.id = pa.assigned_to_transaction_id
WHERE t.id = 'YOUR_TRANSACTION_ID'
GROUP BY t.id;
```

## ✅ Checklist

### Backend
- [ ] Purchase controller assigns multiple accounts
- [ ] Get account by transaction returns all accounts
- [ ] Account status updated to 'sold'
- [ ] Transaction ID properly linked
- [ ] Rollback works on failure

### Frontend
- [ ] Modal displays compact format
- [ ] Multiple accounts shown correctly
- [ ] Copy single line works
- [ ] Copy all works
- [ ] Download works
- [ ] Expandable details works
- [ ] Loading state shows
- [ ] Error state shows
- [ ] Empty state shows

### Integration
- [ ] Purchase → Account assignment works
- [ ] View detail → Fetch accounts works
- [ ] Stock count updates correctly
- [ ] User balance updates correctly
- [ ] Transaction status correct

### Edge Cases
- [ ] Single account (quantity = 1)
- [ ] Multiple accounts (quantity > 1)
- [ ] No accounts assigned
- [ ] API error handling
- [ ] Network error handling
- [ ] Different field name formats
- [ ] Missing optional fields

## 🐛 Common Issues

### Issue 1: "No accounts assigned"
**Cause**: Purchase didn't assign accounts
**Fix**: Check purchase controller logic

### Issue 2: Only 1 account shown for quantity > 1
**Cause**: API returning single object instead of array
**Fix**: Check `getAccountByTransaction` controller

### Issue 3: Field not showing
**Cause**: Field name mismatch
**Fix**: Add field name variant in transformation logic

### Issue 4: Copy not working
**Cause**: Browser clipboard permission
**Fix**: Use HTTPS or localhost

## 📊 Performance

### Expected Response Times
- Get account by transaction: < 100ms
- Purchase with assignment: < 500ms
- Modal open: < 200ms

### Database Queries
- Should use indexes on:
  - `product_accounts.assigned_to_transaction_id`
  - `product_accounts.product_id, status`

---

**Test Date**: 2025-11-19
**Tester**: [Your Name]
**Status**: [ ] PASS / [ ] FAIL
**Notes**: 
