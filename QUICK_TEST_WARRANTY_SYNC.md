# 🚀 Quick Test: Warranty Sync Fix

## ✅ Apa yang Sudah Diperbaiki?

Garansi produk di halaman **Riwayat Transaksi** sekarang **TERSINKRONISASI** dengan produk yang ada!

### Sebelum Fix ❌
- Garansi tidak muncul
- Detail akun tidak ada
- Status warranty tidak akurat

### Setelah Fix ✅
- Garansi muncul dengan benar
- Detail akun tersedia
- Status warranty akurat (AKTIF/EXPIRED/CLAIMED)

## 🧪 Cara Test (5 Menit)

### 1. Buka Halaman Riwayat Transaksi

```
URL: http://localhost:5000/riwayat-transaksi
```

### 2. Verify Summary Cards

Pastikan angka-angka ini muncul:
- ✅ Total Akun Dibeli
- ✅ Total Pengeluaran
- ✅ Total Top Up

### 3. Check Tab Transaksi Akun

Klik tab **"Transaksi Akun"** dan verify:
- ✅ Jumlah transaksi muncul di badge
- ✅ Tabel menampilkan transaksi purchase
- ✅ Kolom "Garansi & Aksi" ada

### 4. Test Filter Garansi

Coba filter berikut:
- **Semua Garansi** → Tampilkan semua
- **Tanpa Garansi** → Tampilkan yang tidak ada warranty
- **Garansi Aktif** → Tampilkan yang masih aktif
- **Garansi Kadaluarsa** → Tampilkan yang expired
- **Sudah Diklaim** → Tampilkan yang sudah diklaim

### 5. Klik "Detail Akun"

Pada salah satu transaksi, klik tombol **"Detail Akun"** dan verify:

**Header Modal**:
- ✅ Transaction ID muncul
- ✅ Badge warranty status dengan warna:
  - 🟢 Green = AKTIF
  - 🟡 Yellow = KADALUARSA SEGERA
  - 🔴 Red = KADALUARSA
  - 🔵 Blue = SUDAH DIKLAIM

**Account Details**:
- ✅ Format: `Urutan | ID BM | Link Akses`
- ✅ Tombol copy per baris berfungsi
- ✅ Additional info (email, password) muncul

**Action Buttons**:
- ✅ "Salin Semua" → Copy semua data
- ✅ "Download" → Download file .txt
- ✅ "Selesai" → Tutup modal

### 6. Test Purchase Baru (Optional)

1. Beli produk baru (BM Account atau Personal)
2. Buka Riwayat Transaksi
3. Verify transaksi baru muncul
4. Klik "Detail Akun"
5. Verify warranty = AKTIF
6. Verify account details muncul

## 📊 Expected Results

### Database Query Test

Jalankan di Supabase SQL Editor:

```sql
-- Test: Cek warranty data
SELECT 
  id,
  product_name,
  purchase_id,
  warranty_expires_at,
  CASE 
    WHEN warranty_expires_at IS NULL THEN 'NO WARRANTY'
    WHEN warranty_expires_at < NOW() THEN 'EXPIRED'
    ELSE 'ACTIVE'
  END as warranty_status
FROM get_member_transactions(
  (SELECT id FROM auth.users WHERE email = 'member1@example.com'),
  'purchase',
  'completed',
  NULL,
  NULL,
  5,
  0
);
```

**Expected**:
- ✅ `purchase_id` NOT NULL
- ✅ `warranty_expires_at` NOT NULL
- ✅ `warranty_status` = 'ACTIVE' atau 'EXPIRED'

### Frontend Display Test

**Riwayat Transaksi Page**:
```
✅ Tab "Transaksi Akun" → Badge menampilkan jumlah
✅ Filter garansi → Berfungsi dengan benar
✅ Kolom "Garansi & Aksi" → Status muncul
✅ Tombol "Detail Akun" → Tersedia
```

**Detail Akun Modal**:
```
✅ Header → Transaction ID + Badge warranty
✅ Account Details → Format: Urutan | ID | Link
✅ Copy buttons → Berfungsi
✅ Download button → Berfungsi
✅ Keterangan → Muncul di bawah
```

## 🐛 Troubleshooting

### Issue: Warranty tidak muncul

**Solution**:
```sql
-- Jalankan backfill script
-- File: backfill_purchases_warranty.sql
```

### Issue: Account details kosong

**Check**:
1. Apakah `product_accounts` ter-assign ke transaction?
2. Apakah `account_data` ada di product_accounts?

**Query**:
```sql
SELECT 
  pa.id,
  pa.assigned_to_transaction_id,
  pa.account_data
FROM product_accounts pa
WHERE pa.assigned_to_transaction_id = 'YOUR_TRANSACTION_ID';
```

### Issue: Modal tidak muncul

**Check**:
1. Browser console untuk errors
2. Network tab untuk API calls
3. React DevTools untuk state

## 📝 Notes

### Warranty Duration by Product

| Product Type | Warranty Duration |
|-------------|------------------|
| BM50 - Standard | 1 day |
| BM Account - Limit 250 | 30 days |
| BM 140 Limit - Standard | 30 days |
| BM Verified - Basic | 30 days |
| Personal Account | 7 days |

### Warranty Status Logic

```typescript
if (!warranty) return 'TANPA GARANSI';
if (warranty.claimed) return 'SUDAH DIKLAIM';
if (expiresAt < now) return 'KADALUARSA';

const daysLeft = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));
return `AKTIF (${daysLeft} hari tersisa)`;
```

## ✅ Success Criteria

Test dianggap **BERHASIL** jika:

1. ✅ Semua transaksi menampilkan warranty status
2. ✅ Filter garansi berfungsi dengan benar
3. ✅ Detail Akun modal menampilkan data lengkap
4. ✅ Copy dan Download berfungsi
5. ✅ Purchase baru otomatis dapat warranty

## 🎯 Quick Commands

### Start Development Server
```bash
npm run dev
```

### Check Database
```bash
# Open Supabase Studio
# Navigate to SQL Editor
# Run test queries
```

### View Logs
```bash
# Server logs
npm run dev

# Browser console
F12 → Console tab
```

## 📚 Related Documentation

- `WARRANTY_SYNC_FIX_COMPLETE.md` - Complete fix documentation
- `WARRANTY_SYNC_VERIFICATION_COMPLETE.md` - Verification results
- `backfill_purchases_warranty.sql` - Backfill script

---

**Status**: ✅ Ready for Testing
**Last Updated**: 2025-11-20
