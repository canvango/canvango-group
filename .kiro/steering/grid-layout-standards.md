---
inclusion: always
---

# Grid Layout Standards - JANGAN DIUBAH

## ⚠️ PENTING: Pengaturan Grid Responsif yang Sudah Ditetapkan

Pengaturan grid layout berikut sudah dikonfigurasi dengan cermat dan **TIDAK BOLEH DIUBAH** tanpa persetujuan eksplisit dari user.

### 1. Product Grid (`.product-grid-responsive`)

**File**: `src/index.css`

```css
.product-grid-responsive {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 0.5rem; /* 8px - JANGAN DIUBAH */
  width: 100%;
}

.product-grid-responsive > * {
  max-width: 380px; /* JANGAN DIUBAH - mencegah card gepeng */
  width: 100%;
}
```

**Digunakan di:**
- `src/features/member-area/components/products/ProductGrid.tsx`
- Halaman: BMAccounts, PersonalAccounts

**Aturan:**
- ✅ Gap harus tetap `0.5rem` (8px) - card dempet
- ✅ Max-width harus tetap `380px` - mencegah card gepeng saat produk sedikit
- ✅ Gunakan `auto-fit` bukan `auto-fill` - untuk mengisi full width
- ✅ Breakpoint responsif: 240px → 260px → 280px → 300px

### 2. Main Content Container

**File**: `src/features/member-area/components/layout/MainContent.tsx`

```tsx
<div className="w-full mx-auto px-2 md:px-4 lg:px-6">
```

**Aturan:**
- ✅ JANGAN gunakan `max-w-7xl` atau pembatas width lainnya
- ✅ Gunakan `w-full` untuk full width
- ✅ Padding responsif: px-2 → px-4 → px-6

### 3. Summary Cards & Admin Grids

**Gap Responsif yang Sudah Ditetapkan:**

```tsx
// Product Summary Cards (3 kolom)
<div className="grid grid-cols-3 gap-2 md:gap-3">

// Admin Statistics Cards
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">

// Admin Filter Grids
<div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
```

**Aturan:**
- ✅ Gap harus responsif: `gap-2` atau `gap-3` (mobile) → `gap-4` (tablet) → `gap-6` (desktop)
- ✅ JANGAN gunakan gap fixed seperti `gap-6` saja

## Halaman yang Sudah Dikonfigurasi

### User Pages
- ✅ BMAccounts
- ✅ PersonalAccounts
- ✅ Dashboard
- ✅ TransactionHistory
- ✅ VerifiedBMService
- ✅ APIDocumentation

### Admin Pages
- ✅ AdminDashboard
- ✅ ProductManagement
- ✅ TransactionManagement
- ✅ TutorialManagement
- ✅ AuditLog

## Jika Ada Perubahan yang Diminta

**SEBELUM mengubah pengaturan grid:**

1. ⚠️ **STOP** dan tanyakan user terlebih dahulu
2. Ingatkan bahwa ada pengaturan grid yang sudah ditetapkan
3. Tunjukkan file `RESPONSIVE_GRID_FIX.md` untuk referensi
4. Tunggu konfirmasi eksplisit dari user

**Contoh peringatan:**

> "⚠️ Perubahan ini akan mengubah pengaturan grid responsif yang sudah ditetapkan sebelumnya. Pengaturan saat ini:
> - Product grid gap: 0.5rem (dempet)
> - Max-width card: 380px (tidak gepeng)
> - Container: full width tanpa batasan
> 
> Apakah Anda yakin ingin mengubahnya?"

## Dokumentasi

Lihat `RESPONSIVE_GRID_FIX.md` untuk dokumentasi lengkap tentang:
- Masalah yang diselesaikan
- Solusi yang diterapkan
- Hasil dan keuntungan
- Daftar file yang diupdate
