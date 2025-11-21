# 🚀 Quick Start - Account Pool System

## Admin: Setup Product Accounts (5 menit)

### Step 1: Buka Product Management
```
Admin Panel → Kelola Produk
```

### Step 2: Pilih Produk
- Klik icon **mata (👁️)** di sebelah kanan produk
- Modal "Product Detail" akan terbuka

### Step 3: Buka Tab "Account Pool"
- Klik tab **"Account Pool"** di atas
- Anda akan lihat stats: Available / Sold / Total

### Step 4: Define Fields (Pertama Kali)
- Klik tombol **"Edit Fields"**
- Tambah field sesuai kebutuhan produk:

**Contoh untuk BM Account:**
```
Field Name: Email          Type: email      Required: ✓
Field Name: Password       Type: password   Required: ✓
Field Name: ID BM          Type: text       Required: ✓
Field Name: Link Akses     Type: url        Required: ✓
Field Name: Recovery Email Type: email      Optional
Field Name: Notes          Type: textarea   Optional
```

- Klik **"Save Fields"**

### Step 5: Tambah Account
- Klik tombol **"+ Add Account"**
- Isi form sesuai field yang sudah didefinisikan
- Klik **"Save Account"**
- ✅ Stock otomatis bertambah!

### Step 6: Tambah Lebih Banyak Account
- Ulangi Step 5 untuk menambah account lainnya
- Atau tunggu fitur Bulk Import (coming soon)

---

## User: Beli & Akses Account (2 menit)

### Step 1: Beli Produk
```
BM Accounts / Personal Accounts → Pilih produk → Klik "Beli"
```

### Step 2: Konfirmasi Pembelian
- Masukkan quantity
- Klik "Konfirmasi"
- ✅ Balance otomatis terpotong
- ✅ Account otomatis ter-assign
- ✅ Stock otomatis berkurang

### Step 3: Lihat Detail Account
```
Transaction History → Klik transaksi → "Lihat Detail"
```

### Step 4: Gunakan Account
- Lihat semua data account (Email, Password, ID BM, Link)
- Klik icon **copy** untuk salin individual field
- Atau klik **"Salin Semua"** untuk copy semua data
- Atau klik **"Download"** untuk download sebagai .txt file

---

## 💡 Tips

### Untuk Admin:
- **Field Definition** hanya perlu dilakukan sekali per produk
- **Stock otomatis sync** dengan jumlah account available
- **Account yang sudah sold** tidak bisa diedit/dihapus
- Gunakan field type yang sesuai:
  - `password` → hide text saat input
  - `email` → validasi format email
  - `url` → validasi format URL
  - `textarea` → untuk text panjang

### Untuk User:
- Account data **hanya bisa diakses** setelah pembelian berhasil
- Simpan data account dengan aman
- Gunakan fitur **Download** untuk backup
- Hubungi CS jika ada masalah dengan account

---

## ⚠️ Troubleshooting

### "Insufficient balance"
- Top up saldo terlebih dahulu

### "Only X accounts available"
- Stock habis, hubungi admin untuk tambah account

### "Tidak ada data akun tersedia"
- Admin belum menambahkan account ke pool
- Atau account belum ter-assign (error sistem)

### Account tidak muncul di Transaction Detail
- Refresh halaman
- Atau hubungi admin

---

## 📞 Need Help?

Lihat dokumentasi lengkap:
- `IMPLEMENTATION_COMPLETE.md` - Full documentation
- `ACCOUNT_POOL_IMPLEMENTATION.md` - Technical details

Atau hubungi developer! 🚀
