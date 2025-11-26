# Quick Start: Verified BM Per-Link Refund

## 🚀 Cara Menggunakan Sistem Refund Per-Link

### Untuk Admin

#### 1. Akses Admin Panel
```
URL: /admin/verified-bm
```

#### 2. Lihat Request yang Perlu Diproses
- Click tab **"Pending"** untuk lihat request baru
- Atau tab **"Processing"** untuk request yang sedang dikerjakan

#### 3. Expand Request untuk Lihat Detail URLs
- Click icon **chevron (▼)** di sebelah kiri request
- Akan muncul list semua URLs yang disubmit member

#### 4. Proses Setiap URL

**URL Status: Pending (🕐)**
```
Action: Click tombol "Proses"
Result: Status berubah jadi Processing
```

**URL Status: Processing (⚠️)**
```
Action 1: Click "Selesai" jika berhasil diverifikasi
Result: Status jadi Completed ✅

Action 2: Click "Gagal" jika tidak bisa diverifikasi
Result: Status jadi Failed ❌
```

**URL Status: Failed atau Completed**
```
Action: Click "Refund" untuk kembalikan uang
Steps:
1. Click tombol "Refund"
2. Modal muncul
3. Input admin notes (REQUIRED) - jelaskan alasan refund
4. Click "Confirm Refund"
5. System auto-refund balance ke user
6. Status URL jadi Refunded 🔄
```

#### 5. Status Request Auto-Update
System akan otomatis update status request berdasarkan status URLs:
- Semua completed → Request completed
- Semua refunded → Request failed
- Mix completed/refunded → Request completed (partial)
- Ada yang processing → Request processing

### Untuk Member

#### 1. Akses Halaman Verified BM
```
URL: /jasa-verified-bm
```

#### 2. Lihat Riwayat Request
- Scroll ke section **"Riwayat Request"**
- Semua request ditampilkan dalam tabel

#### 3. Expand Request untuk Detail
- Click icon **chevron (▼)** di kolom pertama
- Akan muncul detail semua URLs

#### 4. Lihat Status Setiap URL
Setiap URL akan menampilkan:
- **Status badge** dengan warna berbeda
- **URL lengkap** yang disubmit
- **Admin notes** jika ada
- **Refund info** jika URL di-refund (amount + timestamp)

## 💡 Contoh Kasus

### Scenario: Member Order 5 Akun, 1 Gagal

**Step 1: Member Submit Request**
```
Quantity: 5 akun
Total: Rp 1,000,000 (Rp 200,000 per akun)
URLs: 5 Facebook Business Manager URLs
Balance deducted: Rp 1,000,000
```

**Step 2: Admin Proses URLs**
```
URL #1: Pending → [Proses] → Processing → [Selesai] → Completed ✅
URL #2: Pending → [Proses] → Processing → [Selesai] → Completed ✅
URL #3: Pending → [Proses] → Processing → [Gagal] → Failed ❌
URL #4: Pending → [Proses] → Processing → [Selesai] → Completed ✅
URL #5: Pending → [Proses] → Processing → [Selesai] → Completed ✅
```

**Step 3: Admin Refund URL #3**
```
1. Click "Refund" pada URL #3
2. Modal muncul
3. Input notes: "Akun tidak bisa diverifikasi karena limit tercapai"
4. Click "Confirm Refund"
5. System refund Rp 200,000 ke member
6. URL #3 status: Refunded 🔄
```

**Step 4: Final Result**
```
Request Status: Completed (4 completed, 1 refunded)
Member Balance: +Rp 200,000 (refund)
Net Cost: Rp 800,000 (4 akun berhasil)
Transaction Record: Created (type: refund, amount: Rp 200,000)
```

**Step 5: Member View**
```
Member bisa lihat di halaman Verified BM:
- Akun #1: ✅ Selesai
- Akun #2: ✅ Selesai
- Akun #3: 🔄 Refund - Rp 200,000
  Catatan Admin: "Akun tidak bisa diverifikasi karena limit tercapai"
- Akun #4: ✅ Selesai
- Akun #5: ✅ Selesai
```

## 🎨 Status Badges

| Badge | Warna | Arti | Action Available |
|-------|-------|------|------------------|
| 🕐 Pending | Gray | Menunggu diproses | [Proses] |
| ⚠️ Processing | Blue | Sedang diproses | [Selesai] [Gagal] |
| ✅ Completed | Green | Berhasil | [Refund] |
| ❌ Failed | Red | Gagal | [Refund] |
| 🔄 Refunded | Purple | Sudah di-refund | - |

## ⚠️ Important Notes

### Untuk Admin
1. **Admin notes REQUIRED** saat refund - jelaskan alasan dengan jelas
2. **Tidak bisa refund 2x** - system akan prevent double refund
3. **Refund amount otomatis** - system hitung: total / quantity
4. **Status auto-update** - tidak perlu manual update request status

### Untuk Member
1. **Balance langsung masuk** saat admin refund
2. **Transaction record dibuat** untuk audit trail
3. **Admin notes visible** - bisa lihat alasan refund
4. **Real-time updates** - status update langsung terlihat

## 🔍 Troubleshooting

### Admin tidak bisa refund URL
**Kemungkinan**: URL sudah di-refund sebelumnya
**Solusi**: Check status URL, jika sudah "Refunded" tidak bisa refund lagi

### Member tidak lihat URL details
**Kemungkinan**: Request dibuat sebelum system update
**Solusi**: URL details akan muncul setelah admin expand request pertama kali

### Refund amount tidak sesuai
**Kemungkinan**: Bug calculation
**Solusi**: Check di database: `SELECT amount, quantity, (amount/quantity) FROM verified_bm_requests WHERE id = 'xxx'`

## 📞 Support

Jika ada masalah atau pertanyaan:
1. Check dokumentasi lengkap di `VERIFIED_BM_PER_LINK_REFUND.md`
2. Check implementation summary di `VERIFIED_BM_REFUND_IMPLEMENTATION_SUMMARY.md`
3. Check database dengan query di dokumentasi

## ✅ Checklist Testing

### Admin Testing
- [ ] Login sebagai admin
- [ ] Navigate ke `/admin/verified-bm`
- [ ] Expand request dengan multiple URLs
- [ ] Update status URL: pending → processing
- [ ] Update status URL: processing → completed
- [ ] Update status URL: processing → failed
- [ ] Refund URL dengan admin notes
- [ ] Verify balance updated di user
- [ ] Verify transaction record created

### Member Testing
- [ ] Login sebagai member
- [ ] Navigate ke `/jasa-verified-bm`
- [ ] Expand request di riwayat
- [ ] Verify URL details tampil
- [ ] Verify status badges tampil
- [ ] Verify refund info tampil (jika ada)
- [ ] Verify admin notes tampil (jika ada)

---

**Quick Start Guide**
**Version**: 1.0
**Date**: November 26, 2025
**Status**: ✅ Ready to Use
