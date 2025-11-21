# 🚀 Quick Guide: Edit Garansi Produk

## 📍 Lokasi Fitur
**URL:** `/admin/products` (Kelola Produk)

## 🎯 Cara Menggunakan

### 1. Edit Garansi Produk Existing

```
1. Login sebagai admin
2. Buka menu "Kelola Produk"
3. Cari produk yang ingin diedit
4. Klik icon ✏️ (Edit) di kolom Actions
5. Scroll ke bagian warranty
6. Ubah "Warranty Duration (Days)"
7. Toggle "Warranty Enabled" jika perlu
8. Klik "Update"
```

### 2. Tambah Produk Baru dengan Garansi

```
1. Klik tombol "+ Tambah Produk"
2. Isi semua field produk
3. Set "Warranty Duration (Days)" (default: 30)
4. Centang "Warranty Enabled" (default: checked)
5. Klik "Create"
```

## 📋 Field Warranty

### Warranty Duration (Days)
- **Type:** Number input
- **Range:** 0 - 365 hari
- **Default:** 30 hari
- **Required:** Yes

**Rekomendasi:**
- BM Accounts: 30 hari
- Personal Accounts: 7 hari
- Verified BM: 30 hari
- API Products: 30 hari

### Warranty Enabled
- **Type:** Checkbox
- **Default:** Checked (true)
- **Purpose:** Enable/disable warranty untuk produk

## ✅ Validasi

### Frontend
- Min: 0 hari
- Max: 365 hari
- Required field
- Real-time validation

### Backend
- Range check: 0-365
- Type validation
- Error message jika invalid

## 🔍 Verifikasi

### Cek di Database
```sql
SELECT 
  product_name,
  warranty_duration,
  warranty_enabled
FROM products
WHERE id = 'product_id';
```

### Cek di Member Area
1. Logout dari admin
2. Login sebagai member
3. Buka halaman produk (BM/Personal)
4. Lihat warranty info di product card
5. Pastikan duration sesuai

## 🎨 UI Preview

```
┌─────────────────────────────────────────┐
│ Warranty Duration (Days) *              │
│ ┌─────────────────────────────────────┐ │
│ │ 30                                  │ │
│ └─────────────────────────────────────┘ │
│ ℹ️ Recommended: 30 days for BM accounts │
│                                         │
│ ☑ Warranty Enabled    ☑ Active         │
└─────────────────────────────────────────┘
```

## 📊 Status Produk Saat Ini

**Total Produk:** 17
**Semua produk:** ✅ Warranty configured

**Breakdown:**
- BM Accounts (11): 30 hari garansi
- Personal Accounts (2): 7 hari garansi
- Verified BM (2): 30 hari garansi
- API Products (2): 30 hari garansi

## 🔄 Sinkronisasi

### Database → Frontend
- Warranty duration otomatis ditampilkan di form edit
- Warranty enabled status tersinkron
- Real-time update setelah save

### Frontend → Member View
- Perubahan warranty langsung terlihat
- Warranty terms disesuaikan dengan duration
- Product card menampilkan info terbaru

## ⚠️ Catatan Penting

1. **Warranty Duration = 0**
   - Produk tetap bisa dijual
   - Tapi tidak ada garansi
   - Tidak direkomendasikan

2. **Warranty Enabled = false**
   - Garansi dinonaktifkan
   - Member tidak bisa claim
   - Gunakan untuk produk khusus

3. **Perubahan Warranty**
   - Hanya berlaku untuk pembelian baru
   - Pembelian lama tetap pakai warranty lama
   - Tercatat di audit log

## 🛠️ Troubleshooting

### Warranty tidak muncul di form
- Refresh halaman
- Clear browser cache
- Check console untuk error

### Gagal update warranty
- Check validasi (0-365 hari)
- Pastikan login sebagai admin
- Check network tab untuk error

### Warranty tidak sync ke member
- Verify di database
- Check API response
- Clear frontend cache

## 📞 Support

Jika ada masalah:
1. Check dokumentasi lengkap: `WARRANTY_EDIT_FEATURE_COMPLETE.md`
2. Check console log untuk error
3. Verify database dengan SQL query
4. Contact developer team

## ✨ Tips

- **Bulk Edit:** Edit satu per satu (belum ada bulk edit)
- **Audit Trail:** Semua perubahan tercatat di audit log
- **Testing:** Test di staging sebelum production
- **Backup:** Selalu backup database sebelum perubahan besar
