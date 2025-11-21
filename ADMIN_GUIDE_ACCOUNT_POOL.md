# Admin Guide - Account Pool Management

## 📚 Panduan Lengkap untuk Admin

### 🎯 Overview

Account Pool adalah sistem untuk mengelola stok akun BM yang akan dijual kepada member. Setiap kali member membeli, sistem otomatis mengalokasikan akun dari pool.

## 🚀 Setup Account Pool

### Step 1: Buat Produk

1. Login sebagai admin
2. Buka `/admin/products`
3. Klik "Tambah Produk"
4. Isi detail produk:
   - Nama: "BM NEW VIETNAM VERIFIED"
   - Harga: 50000
   - Kategori: BM
   - Status: Aktif

### Step 2: Setup Field Structure

1. Buka detail produk
2. Tab "Account Pool"
3. Klik "Setup Fields"
4. Tambahkan field yang dibutuhkan:

**Contoh untuk BM Account:**
```
Field Name: id_bm
Field Type: text
Required: Yes
Display Order: 1

Field Name: link_akses
Field Type: url
Required: Yes
Display Order: 2

Field Name: email (optional)
Field Type: email
Required: No
Display Order: 3

Field Name: password (optional)
Field Type: password
Required: No
Display Order: 4
```

### Step 3: Import Accounts

**Option A: Manual Input**
1. Klik "Add Account"
2. Isi form sesuai field yang sudah disetup
3. Klik "Save"

**Option B: Bulk Import (CSV)**
1. Klik "Import CSV"
2. Upload file CSV dengan format:

```csv
id_bm,link_akses,email,password
129136990272169,https://business.facebook.com/invitation/?token=...,test1@mail.com,pass123
198814490202944,https://business.facebook.com/invitation/?token=...,test2@mail.com,pass456
```

3. Klik "Import"
4. Review preview
5. Confirm import

**Option C: Bulk Import (JSON)**
1. Klik "Import JSON"
2. Paste JSON array:

```json
[
  {
    "id_bm": "129136990272169",
    "link_akses": "https://business.facebook.com/invitation/?token=...",
    "email": "test1@mail.com",
    "password": "pass123"
  },
  {
    "id_bm": "198814490202944",
    "link_akses": "https://business.facebook.com/invitation/?token=...",
    "email": "test2@mail.com",
    "password": "pass456"
  }
]
```

3. Klik "Import"

## 📊 Monitor Stock

### Dashboard View

```
┌─────────────────────────────────────┐
│ BM NEW VIETNAM VERIFIED             │
├─────────────────────────────────────┤
│ Available: 45                       │
│ Sold: 15                            │
│ Total: 60                           │
└─────────────────────────────────────┘
```

### Stock Alerts

- 🟢 **Green**: Stock > 20 (Aman)
- 🟡 **Yellow**: Stock 10-20 (Perlu restock)
- 🔴 **Red**: Stock < 10 (Urgent restock)
- ⚫ **Black**: Stock = 0 (Habis)

## 🔄 Account Lifecycle

### Status Flow

```
available → sold → (optional: claimed/replaced)
```

### Status Explanation

1. **available**: Akun siap dijual
2. **sold**: Akun sudah terjual, assigned ke transaction
3. **claimed**: Akun bermasalah, di-claim warranty
4. **replaced**: Akun pengganti untuk claim

## 👥 Member View

### Saat Member Membeli

**Member Action:**
1. Pilih produk "BM NEW VIETNAM VERIFIED"
2. Set quantity = 2
3. Klik "Beli Sekarang"

**System Action:**
1. Check stock: available >= 2 ✓
2. Check balance: sufficient ✓
3. Deduct balance
4. Create transaction
5. Assign 2 accounts dari pool
6. Update stock: available -= 2

### Saat Member Lihat Detail

**Member Action:**
1. Buka "Riwayat Transaksi"
2. Klik "Lihat Detail" pada transaksi

**System Display:**
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

**Member Actions:**
- ✅ Copy single line
- ✅ Copy all
- ✅ Download as .txt
- ✅ Click link to open
- ✅ View expandable details

## 🛠️ Management Tasks

### Task 1: Restock Accounts

**When**: Stock < 20

**Steps:**
1. Prepare new accounts
2. Go to product detail
3. Tab "Account Pool"
4. Import new accounts (CSV/JSON)
5. Verify stock count updated

### Task 2: Check Sold Accounts

**Purpose**: Audit, verify assignments

**Steps:**
1. Go to product detail
2. Tab "Account Pool"
3. Filter: Status = "sold"
4. View list with transaction IDs
5. Click transaction ID to see buyer

### Task 3: Handle Problematic Account

**Scenario**: Member report akun bermasalah

**Steps:**
1. Find transaction ID
2. Go to "Claim Management"
3. View claim details
4. If valid:
   - Approve claim
   - System auto-assign replacement
   - Old account marked as "claimed"
   - New account marked as "replaced"

### Task 4: Bulk Update Accounts

**Scenario**: Need to update field for multiple accounts

**Steps:**
1. Export current accounts (CSV)
2. Edit in Excel/Sheets
3. Delete old accounts (optional)
4. Import updated accounts

### Task 5: Remove Invalid Accounts

**Scenario**: Found invalid/duplicate accounts

**Steps:**
1. Go to product detail
2. Tab "Account Pool"
3. Find account by ID
4. Click "Delete"
5. Confirm deletion

**⚠️ Warning**: Cannot delete sold accounts!

## 📈 Reports & Analytics

### Stock Report

```sql
-- Get stock summary per product
SELECT 
  p.product_name,
  COUNT(CASE WHEN pa.status = 'available' THEN 1 END) as available,
  COUNT(CASE WHEN pa.status = 'sold' THEN 1 END) as sold,
  COUNT(*) as total
FROM products p
LEFT JOIN product_accounts pa ON p.id = pa.product_id
WHERE p.product_type = 'BM'
GROUP BY p.id, p.product_name
ORDER BY available ASC;
```

### Sales Report

```sql
-- Get sales per product (last 30 days)
SELECT 
  p.product_name,
  COUNT(DISTINCT t.id) as transactions,
  SUM(t.quantity) as accounts_sold,
  SUM(t.total_amount) as revenue
FROM transactions t
JOIN products p ON t.product_id = p.id
WHERE t.created_at >= NOW() - INTERVAL '30 days'
  AND t.status = 'BERHASIL'
GROUP BY p.id, p.product_name
ORDER BY revenue DESC;
```

### Assignment Report

```sql
-- Get recent assignments
SELECT 
  t.id as transaction_id,
  u.email as buyer,
  p.product_name,
  t.quantity,
  COUNT(pa.id) as accounts_assigned,
  t.created_at
FROM transactions t
JOIN users u ON t.user_id = u.id
JOIN products p ON t.product_id = p.id
LEFT JOIN product_accounts pa ON t.id = pa.assigned_to_transaction_id
WHERE t.created_at >= NOW() - INTERVAL '7 days'
GROUP BY t.id, u.email, p.product_name, t.quantity, t.created_at
ORDER BY t.created_at DESC;
```

## 🔐 Security Best Practices

### 1. Field Visibility

**Sensitive Fields:**
- Password
- Email
- Recovery codes

**Action**: Mark as "sensitive" in field setup
**Result**: Masked in admin view, visible only to buyer

### 2. Access Control

- ✅ Only admin can manage account pool
- ✅ Only buyer can view their purchased accounts
- ✅ No sharing between users
- ✅ Audit log for all changes

### 3. Data Protection

- ✅ HTTPS only
- ✅ Encrypted at rest (database)
- ✅ No logging of sensitive data
- ✅ Regular backups

## 🐛 Troubleshooting

### Issue 1: Stock not updating after purchase

**Symptoms**: Available count same after sale

**Diagnosis:**
```sql
-- Check if accounts assigned
SELECT * FROM product_accounts 
WHERE assigned_to_transaction_id = 'TRANSACTION_ID';
```

**Fix**: 
- Check purchase controller logs
- Verify assignment logic
- Manual assign if needed

### Issue 2: Member can't see account details

**Symptoms**: "No accounts assigned" error

**Diagnosis:**
```sql
-- Check transaction and accounts
SELECT 
  t.id,
  t.quantity,
  COUNT(pa.id) as assigned_count
FROM transactions t
LEFT JOIN product_accounts pa ON t.id = pa.assigned_to_transaction_id
WHERE t.id = 'TRANSACTION_ID'
GROUP BY t.id, t.quantity;
```

**Fix**:
- If assigned_count = 0: Manually assign accounts
- If assigned_count < quantity: Assign remaining
- Check API endpoint response

### Issue 3: Duplicate accounts in pool

**Symptoms**: Same ID_BM appears multiple times

**Diagnosis:**
```sql
-- Find duplicates
SELECT 
  account_data->>'id_bm' as id_bm,
  COUNT(*) as count
FROM product_accounts
WHERE product_id = 'PRODUCT_ID'
GROUP BY account_data->>'id_bm'
HAVING COUNT(*) > 1;
```

**Fix**:
- Delete duplicates (keep sold ones)
- Add unique constraint if needed

### Issue 4: Import fails

**Common Causes:**
- Invalid JSON format
- Missing required fields
- Wrong field names
- Special characters in data

**Fix**:
- Validate JSON/CSV format
- Check field names match setup
- Escape special characters
- Use UTF-8 encoding

## 📞 Support

### For Admin Issues
- Check audit logs
- Review error logs
- Contact tech support

### For Member Issues
- Check transaction details
- Verify account assignment
- Provide manual account if needed
- Log issue for investigation

---

**Last Updated**: 2025-11-19
**Version**: 1.0.0
**Contact**: admin@yoursite.com
