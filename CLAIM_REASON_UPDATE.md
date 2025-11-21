# Update Alasan Klaim Garansi

## Perubahan yang Dilakukan

### 1. Enum ClaimReason Baru
File: `src/features/member-area/types/warranty.ts`

Opsi alasan klaim yang baru:
- `LOGIN_FAILED` - Akun tidak bisa login
- `CHECKPOINT` - Akun terkena checkpoint
- `DISABLED` - Akun disabled/dinonaktifkan
- `AD_LIMIT_MISMATCH` - Limit iklan tidak sesuai
- `INCOMPLETE_DATA` - Data akun tidak lengkap
- `OTHER` - Lainnya (Jelaskan di detail)

### 2. Form Submission
File: `src/features/member-area/components/warranty/ClaimSubmissionSection.tsx`

- Dropdown dengan placeholder "Pilih Alasan"
- Label yang sesuai untuk setiap opsi
- Validasi untuk memastikan alasan dipilih

### 3. Backend Controller
File: `server/src/controllers/warranty.controller.ts`

- Menyimpan reason dalam format: `{reason_type}: {description}`
- Contoh: `login_failed: Akun tidak bisa login setelah pembelian`
- `claim_type` default ke `replacement` (bisa diubah admin)

### 4. Admin Dashboard
File: `src/features/member-area/pages/admin/ClaimManagement.tsx`

- Fungsi `parseClaimReason()` untuk mem-parse format baru
- Menampilkan reason type dan description terpisah
- Tampilan di tabel dan modal detail

### 5. Member Dashboard
Files:
- `src/features/member-area/components/warranty/WarrantyClaimsTable.tsx`
- `src/features/member-area/components/warranty/ClaimResponseModal.tsx`

- Fungsi parser untuk menampilkan reason dengan benar
- Kompatibel dengan format lama dan baru

## Format Data

### Database (warranty_claims table)
```sql
claim_type: 'replacement' | 'refund' | 'repair'
reason: 'login_failed: User tidak bisa login ke akun'
```

### Frontend Display
```
Reason Type: Akun tidak bisa login
Description: User tidak bisa login ke akun
```

## Testing

1. Buka halaman `/claim-garansi`
2. Pilih akun yang eligible
3. Pilih alasan dari dropdown
4. Isi deskripsi detail
5. Submit klaim
6. Verifikasi di admin dashboard bahwa reason ditampilkan dengan benar

## Kompatibilitas

- ✅ Backward compatible dengan data lama
- ✅ Parser menangani format lama dan baru
- ✅ Admin dapat melihat reason dengan jelas
- ✅ Member dapat memilih alasan yang spesifik
