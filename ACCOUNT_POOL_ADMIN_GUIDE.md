# 📚 Account Pool - Admin Quick Guide

## 🎯 Apa itu Account Pool?

Account Pool adalah sistem penyimpanan akun-akun yang siap dijual. Ketika member membeli produk, sistem otomatis mengambil 1 akun dari pool dan memberikannya ke member.

---

## 🚀 Cara Menggunakan

### Step 1: Buka Account Pool

1. Login sebagai **Admin**
2. Klik menu **"Kelola Produk"** di sidebar
3. Cari produk yang ingin dikelola
4. Klik icon **mata (👁️)** di kolom Actions
5. Klik tab **"Account Pool"**

### Step 2: Konfigurasi Field (Pertama Kali)

Sebelum menambah akun, tentukan dulu field apa saja yang diperlukan:

1. Klik tombol **"Edit Fields"**
2. Anda akan melihat field default:
   - Email (required)
   - Password (required)
3. Untuk menambah field baru:
   - Klik **"Add Field"**
   - Isi nama field (contoh: "BM ID", "Phone Number")
   - Pilih tipe field:
     - **Text** - untuk teks biasa
     - **Password** - untuk password (akan di-hide)
     - **Email** - untuk email (validasi format)
     - **URL** - untuk link
     - **Textarea** - untuk teks panjang
   - Centang **"Required"** jika wajib diisi
4. Klik **"Save Fields"**

**Contoh Field untuk BM Account:**
- Email (email, required)
- Password (password, required)
- BM ID (text, required)
- Phone Number (text, optional)
- Recovery Email (email, optional)

### Step 3: Tambah Akun ke Pool

1. Klik tombol **"Add Account"**
2. Isi semua field yang required (bertanda *)
3. Klik **"Save Account"**
4. Akun akan muncul di list dengan status **"available"**
5. Stats akan update otomatis

**Tips:**
- Pastikan data akun valid dan bisa digunakan
- Double-check email & password sebelum save
- Gunakan copy-paste untuk menghindari typo

### Step 4: Edit/Hapus Akun

**Edit Akun:**
1. Klik icon **pensil (✏️)** di samping akun
2. Ubah data yang perlu diubah
3. Klik **"Save Account"**

**Hapus Akun:**
1. Klik icon **sampah (🗑️)** di samping akun
2. Konfirmasi penghapusan
3. Akun akan dihapus permanent

⚠️ **Warning:** Hanya hapus akun yang statusnya "available". Jangan hapus akun yang sudah "sold"!

---

## 📊 Memahami Stats

Di bagian atas Account Pool, ada 3 kartu statistik:

### 🟢 Available
Jumlah akun yang **siap dijual**. Ini adalah stok aktual produk.

### ⚪ Sold
Jumlah akun yang **sudah terjual** dan diberikan ke member.

### 🔵 Total
Total semua akun (Available + Sold).

**Contoh:**
```
Available: 15 akun
Sold: 8 akun
Total: 23 akun
```
Artinya: Ada 15 akun siap dijual, 8 akun sudah terjual, total 23 akun pernah ditambahkan.

---

## 🔄 Workflow Lengkap

### Skenario: Menambah Produk Baru dengan Account Pool

1. **Buat Produk**
   - Klik "Tambah Produk"
   - Isi nama, kategori, harga, dll
   - Save produk

2. **Konfigurasi Field**
   - Buka Account Pool produk tersebut
   - Klik "Edit Fields"
   - Tambah field sesuai kebutuhan
   - Save fields

3. **Tambah Akun ke Pool**
   - Klik "Add Account"
   - Isi data akun pertama
   - Save
   - Ulangi untuk akun lainnya

4. **Verifikasi Stock**
   - Kembali ke halaman Kelola Produk
   - Cek kolom "Stock"
   - Harus muncul: "15 akun" (sesuai jumlah available)
   - Status: "Available"

5. **Produk Siap Dijual!**
   - Member bisa melihat produk di halaman mereka
   - Saat member beli, akun otomatis assigned
   - Stock berkurang otomatis

---

## 💡 Best Practices

### 1. Selalu Sediakan Stock Cukup
- Minimal 5-10 akun available
- Jangan sampai stock habis
- Set reminder untuk restock

### 2. Validasi Akun Sebelum Input
- Test login akun sebelum ditambahkan
- Pastikan password benar
- Cek akun tidak banned/disabled

### 3. Gunakan Field yang Jelas
- Nama field harus deskriptif
- Contoh: "BM ID" bukan "ID"
- Contoh: "Recovery Email" bukan "Email 2"

### 4. Backup Data Akun
- Export data akun secara berkala
- Simpan di tempat aman
- Jangan hanya andalkan database

### 5. Monitor Stock Regularly
- Cek stock setiap hari
- Restock sebelum habis
- Update harga jika perlu

---

## ⚠️ Common Issues & Solutions

### Issue 1: "Cannot add account"
**Penyebab:** Field belum dikonfigurasi
**Solusi:** 
1. Klik "Edit Fields"
2. Tambah minimal Email & Password
3. Save fields
4. Coba add account lagi

### Issue 2: Stock tidak update
**Penyebab:** Cache browser
**Solusi:**
1. Refresh halaman (F5)
2. Atau clear cache browser
3. Atau logout-login lagi

### Issue 3: Akun hilang dari pool
**Penyebab:** Akun sudah terjual (status = sold)
**Solusi:**
- Ini normal! Akun yang sold tidak muncul di list available
- Cek di tab "Sold" untuk melihat akun yang sudah terjual
- Tambah akun baru untuk restock

### Issue 4: Member komplain akun tidak bisa login
**Penyebab:** Data akun salah atau akun banned
**Solusi:**
1. Cek data akun di database
2. Test login manual
3. Jika akun bermasalah, berikan replacement
4. Hapus akun bermasalah dari pool

---

## 🎓 Advanced Tips

### Bulk Import (Coming Soon)
Fitur untuk import banyak akun sekaligus dari CSV/Excel.

**Format CSV:**
```csv
Email,Password,BM ID,Phone Number
test1@example.com,Pass123,123456,+6281234567890
test2@example.com,Pass456,789012,+6281234567891
```

### Field Types Explained

**Text:**
- Input biasa
- Untuk data umum (ID, nama, dll)

**Password:**
- Input ter-hide (••••)
- Untuk password/sensitive data

**Email:**
- Validasi format email
- Harus ada @ dan domain

**URL:**
- Validasi format URL
- Harus ada http:// atau https://

**Textarea:**
- Input multi-line
- Untuk notes/deskripsi panjang

---

## 📞 Need Help?

Jika ada masalah:
1. Cek dokumentasi ini dulu
2. Cek browser console untuk error
3. Screenshot error dan kirim ke developer
4. Jangan panik! Data aman di database

---

## ✅ Checklist Harian Admin

- [ ] Cek stock semua produk
- [ ] Restock produk yang < 5 akun
- [ ] Test random akun dari pool
- [ ] Cek komplain member tentang akun
- [ ] Update harga jika perlu
- [ ] Backup data akun

---

**Last Updated:** November 25, 2025
**Version:** 1.0
**Status:** Production Ready ✅
