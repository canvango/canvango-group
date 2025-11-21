# Quick Guide: Product Detail Fields

## 🎯 Cara Menggunakan Field Baru di Admin Product Management

### Akses Form Edit
1. Buka `/admin/products`
2. Klik icon **✏️ Edit** pada produk yang ingin diedit
3. Modal akan terbuka dengan 3 tabs

---

## 📋 Tab 1: Info Dasar

Field standar untuk informasi produk:
- **Nama Produk**: Nama yang ditampilkan ke user
- **Tipe Produk**: BM Account, Personal Account, dll
- **Kategori**: Kategori internal (limit_250, verified, dll)
- **Deskripsi Singkat**: Deskripsi pendek produk
- **Harga**: Harga dalam IDR
- **Status Stok**: Tersedia / Habis
- **Produk Aktif**: Toggle untuk mengaktifkan/nonaktifkan produk

---

## 🎯 Tab 2: Detail Produk

Field baru untuk informasi detail:

### 💰 Limit Iklan
**Contoh input:**
```
$250/hari
$500/hari
$1000/hari
Unlimited
```

### ✅ Status Verifikasi
**Contoh input:**
```
Verified
Unverified
Blue Badge Verified
Business Verified
```

### 🏢 Tipe Akun Iklan
**Contoh input:**
```
Business Manager
Personal Account
Agency Account
Enterprise Account
```

### ⭐ Keunggulan Produk
**Format:** Pisahkan setiap poin dengan enter (baris baru)

**Contoh input:**
```
- Limit tinggi $250/hari
- Akun sudah terverifikasi
- Support 24/7 via WhatsApp
- Garansi 30 hari full replacement
- Akses ke semua fitur premium
- Tutorial lengkap disertakan
```

**Tips:**
- Gunakan dash (-) di awal setiap poin
- Tulis benefit yang jelas dan spesifik
- Maksimal 5-7 poin agar tidak terlalu panjang

### ⚠️ Kekurangan & Peringatan
**Format:** Pisahkan setiap poin dengan enter (baris baru)

**Contoh input:**
```
- Tidak bisa refund setelah akun diterima
- Wajib ganti password setelah login pertama
- Jangan share akun ke orang lain
- Tidak boleh digunakan untuk konten ilegal
- Akun bisa di-ban jika melanggar TOS Facebook
```

**Tips:**
- Tulis peringatan yang penting
- Jelaskan batasan penggunaan
- Informasikan risiko yang mungkin terjadi

---

## 🛡️ Tab 3: Garansi

### Toggle Aktifkan Garansi
- ✅ Centang jika produk memiliki garansi
- ❌ Uncheck jika tidak ada garansi

### ⏱️ Durasi Garansi
**Rekomendasi:**
- BM Account: 30 hari
- Personal Account: 7 hari
- Verified BM: 30-60 hari
- API Access: 90 hari

### 📋 Ketentuan Garansi
**Format:** Numbering dengan penjelasan detail

**Contoh input:**
```
1. Garansi berlaku 30 hari sejak pembelian
2. Claim hanya untuk akun yang disabled/banned oleh Facebook
3. Tidak cover kesalahan user (spam, konten ilegal, dll)
4. Replacement 1x1 dengan produk yang sama atau setara
5. Wajib screenshot bukti error/banned
6. Proses claim maksimal 2x24 jam
7. Tidak ada refund, hanya replacement
```

**Tips:**
- Tulis ketentuan secara detail dan jelas
- Jelaskan apa yang di-cover dan tidak di-cover
- Sertakan prosedur claim
- Tentukan timeline proses claim

---

## 💡 Best Practices

### 1. Konsistensi Format
- Gunakan format yang sama untuk semua produk sejenis
- Contoh: Semua BM Account pakai format yang sama

### 2. Informasi Lengkap
- Jangan biarkan field kosong jika produk memiliki informasi tersebut
- User lebih percaya dengan informasi yang lengkap

### 3. Bahasa yang Jelas
- Gunakan bahasa yang mudah dipahami
- Hindari jargon teknis yang membingungkan
- Tulis dalam bahasa Indonesia yang baik

### 4. Update Berkala
- Review dan update informasi produk secara berkala
- Sesuaikan dengan perubahan kebijakan atau fitur

### 5. Transparansi
- Jujur tentang kekurangan produk
- Jangan overselling atau memberikan harapan palsu
- User akan lebih menghargai kejujuran

---

## 🎨 Preview di User Side

Field-field ini akan ditampilkan di:
1. **Product Detail Modal** - Saat user klik "Lihat Detail"
2. **Purchase Confirmation** - Sebelum user membeli
3. **Email Notification** - Setelah pembelian
4. **Warranty Claim Page** - Saat user claim garansi

---

## ⚡ Quick Tips

### Untuk Keunggulan:
✅ "Limit tinggi $250/hari"
✅ "Support 24/7 via WhatsApp"
✅ "Garansi 30 hari full replacement"

❌ "Bagus"
❌ "Recommended"
❌ "Best seller"

### Untuk Kekurangan:
✅ "Tidak bisa refund setelah akun diterima"
✅ "Wajib ganti password setelah login"

❌ "Ada beberapa kekurangan"
❌ "Baca ketentuan"

### Untuk Garansi:
✅ "Garansi berlaku 30 hari sejak pembelian"
✅ "Claim hanya untuk akun yang disabled/banned"

❌ "Ada garansi"
❌ "Hubungi admin untuk claim"

---

## 🚀 Shortcut Keyboard

- **Tab**: Pindah ke field berikutnya
- **Shift + Tab**: Kembali ke field sebelumnya
- **Ctrl + Enter**: Submit form (saat di textarea)
- **Esc**: Tutup modal

---

## 📞 Need Help?

Jika ada pertanyaan tentang cara mengisi field:
1. Lihat contoh produk yang sudah ada
2. Tanya ke tim product
3. Konsultasi dengan customer support untuk mengetahui pertanyaan umum user

---

**Last Updated:** November 2025
**Version:** 1.0
