# Quick Reference: Claim Garansi Dropdown

## 🎯 Perubahan Utama

Pemilihan akun di halaman Claim Garansi sekarang menggunakan **dropdown** yang lebih clean dan informatif.

## 📱 Cara Menggunakan

### 1. Buka Halaman Claim Garansi
```
/claim-garansi
```

### 2. Pilih Akun dari Dropdown
- Klik dropdown "Pilih produk yang ingin diklaim"
- Pilih akun yang ingin diklaim
- Format: `{Nama Produk} - {Email/ID} (Garansi: {Tanggal})`

### 3. Lihat Detail Akun
Setelah memilih, akan muncul info box biru dengan detail:
- Nama produk
- Email akun
- Tanggal pembelian
- Tanggal garansi berakhir

### 4. Lengkapi Form
- Pilih alasan klaim
- Tulis deskripsi masalah
- Upload screenshot (opsional)
- Submit claim

## 🎨 UI Components

### Dropdown Select
```tsx
<select className="rounded-xl">
  <option>Pilih produk yang ingin diklaim</option>
  <option>Akun BM Premium - user@email.com (Garansi: 20 Des 2025)</option>
  <option>Akun Personal - #abc12345 (Garansi: 21 Des 2025)</option>
</select>
```

### Info Box (Selected Account)
```tsx
<div className="bg-blue-50 border border-blue-200 rounded-xl">
  <div className="font-medium">Akun BM Premium</div>
  <div>user@email.com</div>
  <div>Dibeli: 20 Nov 2025 • Garansi hingga: 20 Des 2025</div>
</div>
```

## ✅ Keuntungan

1. **Lebih Clean**: Tidak memakan banyak space
2. **Lebih Jelas**: Nama produk ditampilkan dengan benar
3. **Lebih Informatif**: Menampilkan email dan tanggal
4. **Better UX**: Dropdown lebih familiar

## 🔧 Troubleshooting

### Masalah: Dropdown kosong
**Solusi**: Tidak ada akun yang eligible untuk claim
- Akun harus status 'active'
- Garansi harus masih berlaku
- Tidak boleh ada claim yang sedang pending

### Masalah: Nama produk "Unknown Product"
**Solusi**: Check backend logs
```bash
# Lihat logs di console
📦 Purchases found: X
📋 Sample purchase data: {...}
```

### Masalah: Tidak bisa submit
**Solusi**: Pastikan semua field terisi
- Akun sudah dipilih
- Alasan klaim sudah dipilih
- Deskripsi minimal 10 karakter

## 📚 Related Docs

- `CLAIM_DROPDOWN_UX_IMPROVEMENT.md` - Detail implementasi
- `BORDER_RADIUS_STANDARDS.md` - Standar UI
- `CLAIM_GARANSI_IMPLEMENTATION.md` - Implementasi awal
