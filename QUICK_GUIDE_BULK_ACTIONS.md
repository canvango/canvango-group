# Quick Guide: Bulk Actions - Product Management

## 🎯 Cara Menggunakan Bulk Actions

### 1. Pilih Produk

**Pilih Individual**:
- Klik checkbox di sebelah kiri nama produk
- Bisa pilih beberapa produk sekaligus

**Pilih Semua**:
- Klik checkbox di header tabel
- Semua produk di halaman saat ini akan terpilih

### 2. Pilih Action

Setelah produk terpilih, akan muncul bar biru di atas tabel dengan pilihan:

- **Activate** → Aktifkan produk (is_active = true)
- **Deactivate** → Nonaktifkan produk (is_active = false)
- **Mark Out of Stock** → Tandai stok habis
- **Delete** → Hapus produk (permanent!)

### 3. Apply

- Klik tombol **Apply** untuk menjalankan action
- Tunggu proses selesai (tombol akan disabled)
- Lihat notifikasi sukses/gagal
- Tabel akan refresh otomatis

### 4. Clear Selection

- Klik tombol **Clear** untuk membatalkan pilihan
- Atau pilih action lain dan apply

---

## 💡 Use Cases

### Nonaktifkan Produk Out of Stock
```
1. Filter: Stock Status → "Out of Stock"
2. Klik checkbox header (select all)
3. Action: "Deactivate"
4. Apply
✅ Semua produk out of stock jadi inactive
```

### Aktifkan Produk Baru
```
1. Filter: Status → "Inactive"
2. Pilih produk yang mau diaktifkan
3. Action: "Activate"
4. Apply
✅ Produk sekarang visible untuk user
```

### Hapus Produk Test/Duplikat
```
1. Search: "copy" atau "test"
2. Pilih produk yang mau dihapus
3. Action: "Delete"
4. Apply
⚠️ Hati-hati! Delete permanent!
```

### Update Stock Status Massal
```
1. Pilih beberapa produk
2. Action: "Mark Out of Stock"
3. Apply
✅ Stock status berubah jadi "out_of_stock"
```

---

## ⚠️ Perhatian

### Delete Action
- **PERMANENT** - tidak bisa di-undo!
- Pastikan produk yang dipilih benar
- Cek dulu sebelum apply

### Pagination
- Bulk action hanya untuk produk di halaman saat ini
- Jika mau bulk action semua produk, gunakan filter dulu

### Audit Log
- Semua bulk action tercatat di audit log
- Bisa dicek siapa yang melakukan action
- Timestamp dan detail perubahan tersimpan

---

## 🔍 Tips

1. **Gunakan Filter** sebelum bulk action untuk hasil lebih presisi
2. **Search** untuk menemukan produk spesifik
3. **Check Count** di bar biru untuk memastikan jumlah produk yang dipilih
4. **Clear Selection** setelah selesai untuk menghindari kesalahan

---

## 📱 Shortcut

- **Select All**: Klik checkbox header
- **Deselect All**: Klik checkbox header lagi atau tombol Clear
- **Quick Action**: Pilih produk → Pilih action → Apply (3 langkah!)

---

## 🎉 Keuntungan

✅ **Hemat Waktu** - Update banyak produk sekaligus
✅ **Efisien** - Tidak perlu edit satu-satu
✅ **Aman** - Ada konfirmasi dan audit log
✅ **Fleksibel** - Bisa pilih produk spesifik atau semua
