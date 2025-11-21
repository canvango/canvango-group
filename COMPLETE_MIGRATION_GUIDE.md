# Panduan Lengkap Migrasi Member Area

## ✅ Status: Dependencies Installed

`lucide-react` sudah terinstall di `canvango-app/frontend`.

## 🎯 Tujuan

Menerapkan SEMUA hasil spec `member-area-content-framework` ke aplikasi yang berjalan di `canvango-app/frontend/`.

## 📋 Langkah-Langkah

### 1. Buat Folder Shared Components

```bash
mkdir -p canvango-app/frontend/src/components/shared
```

### 2. Copy File Shared Components

Copy files berikut dari `src/features/member-area/components/` ke `canvango-app/frontend/src/components/shared/`:

**Dashboard Components:**
- `dashboard/SummaryCard.tsx`
- `dashboard/WelcomeBanner.tsx`
- `dashboard/AlertBox.tsx`
- `dashboard/RecentTransactions.tsx`
- `dashboard/CustomerSupportSection.tsx`
- `dashboard/UpdatesSection.tsx`

**Product Components:**
- `products/CategoryTabs.tsx`
- `products/ProductCard.tsx`
- `products/ProductGrid.tsx`
- `products/SearchSortBar.tsx`
- `products/ProductDetailModal.tsx`

**Transaction Components:**
- `transactions/TabNavigation.tsx`
- `transactions/TransactionFilters.tsx`
- `transactions/TransactionTable.tsx`
- `transactions/TransactionDetailModal.tsx`

**Top Up Components:**
- `topup/TopUpForm.tsx`
- `topup/NominalSelector.tsx`
- `topup/PaymentMethodSelector.tsx`

**Verified BM Components:**
- `verified-bm/VerifiedBMStatusCards.tsx`
- `verified-bm/VerifiedBMOrderForm.tsx`
- `verified-bm/VerifiedBMOrdersTable.tsx`

**Warranty Components:**
- `warranty/WarrantyStatusCards.tsx`
- `warranty/ClaimSubmissionSection.tsx`
- `warranty/WarrantyClaimsTable.tsx`
- `warranty/ClaimResponseModal.tsx`

**API Components:**
- `api/APIKeyDisplay.tsx`
- `api/APIStatsCards.tsx`
- `api/APIEndpointCard.tsx`
- `api/APITabNavigation.tsx`

**Tutorial Components:**
- `tutorials/TutorialSearchBar.tsx`
- `tutorials/TutorialCategoryTabs.tsx`
- `tutorials/TutorialCard.tsx`
- `tutorials/TutorialGrid.tsx`

### 3. Copy Utilities & Helpers

Copy files berikut dari `src/features/member-area/` ke `canvango-app/frontend/src/`:

**Utils:**
- `utils/formatters.ts` → `utils/formatters.ts`
- `utils/helpers.ts` → `utils/helpers.ts`

**Types:**
- `types/product.ts` → `types/product.ts`
- `types/transaction.ts` → `types/transaction.ts`
- `types/verified-bm.ts` → `types/verified-bm.ts`

**Config:**
- `config/bm-categories.config.ts` → `config/bm-categories.config.ts`
- `config/personal-types.config.ts` → `config/personal-types.config.ts`

### 4. Update Import Paths

Setelah copy, update semua import paths di components yang di-copy:

**Dari:**
```typescript
import Button from '../../../../shared/components/Button';
import { Product } from '../../types/product';
```

**Menjadi:**
```typescript
import Button from '../common/Button'; // atau path yang sesuai
import { Product } from '../../types/product';
```

### 5. Replace Pages

Replace files di `canvango-app/frontend/src/pages/` dengan versi baru:

1. **Dashboard.tsx** - Copy dari `src/features/member-area/pages/Dashboard.tsx`
2. **AkunBM.tsx** - Sudah diganti (DONE ✅)
3. **AkunPersonal.tsx** - Copy dari `src/features/member-area/pages/PersonalAccounts.tsx`
4. **TransactionHistory.tsx** - Copy dari `src/features/member-area/pages/TransactionHistory.tsx`
5. **TopUp.tsx** - Copy dari `src/features/member-area/pages/TopUp.tsx`
6. **ClaimGaransi.tsx** - Copy dari `src/features/member-area/pages/ClaimWarranty.tsx`
7. **JasaVerifiedBM.tsx** - Copy dari `src/features/member-area/pages/VerifiedBMService.tsx`
8. **API.tsx** - Copy dari `src/features/member-area/pages/APIDocumentation.tsx`
9. **Tutorial.tsx** - Copy dari `src/features/member-area/pages/TutorialCenter.tsx`

### 6. Fix Import Paths di Pages

Setelah copy pages, update import paths:

**Dari:**
```typescript
import SummaryCard from '../components/dashboard/SummaryCard';
import { usePageTitle } from '../hooks/usePageTitle';
```

**Menjadi:**
```typescript
import SummaryCard from '../components/shared/SummaryCard';
// Remove usePageTitle atau buat versi sederhana
```

### 7. Handle Missing Dependencies

Beberapa dependencies yang mungkin perlu disesuaikan:

**React Query:**
- Jika tidak mau install `@tanstack/react-query`, ganti dengan `useState` + `useEffect`
- Atau install: `npm install @tanstack/react-query`

**Custom Hooks:**
- `usePageTitle` - Buat versi sederhana atau hapus
- `usePersistedFilters` - Buat versi sederhana dengan localStorage
- `useConfirmDialog` - Buat versi sederhana dengan window.confirm atau modal

**Shared Components:**
- `Pagination` - Copy dari `src/shared/components/Pagination.tsx`
- `Modal` - Copy dari `src/shared/components/Modal.tsx`
- `Badge` - Copy dari `src/shared/components/Badge.tsx`

## 🚀 Quick Migration Script

Saya akan membuat script otomatis untuk melakukan semua ini. Tunggu sebentar...

## ⚠️ Catatan Penting

1. **Backup dulu** semua file di `canvango-app/frontend/src/pages/` sebelum replace
2. **Test satu per satu** setelah migrasi
3. **Fix import errors** yang muncul
4. **Sesuaikan styling** jika perlu

## 🎯 Alternatif Cepat

Jika Anda ingin hasil CEPAT tanpa ribet dengan dependencies:

Saya bisa membuat versi "standalone" untuk setiap halaman yang:
- Tidak butuh external dependencies
- Semua komponen inline
- Langsung bisa dipakai

Tapi ini akan menghasilkan code yang kurang modular (seperti AkunBM.tsx yang sudah saya buat).

## 💡 Rekomendasi

Untuk hasil terbaik dan maintainable:

1. **Install React Query**: `npm install @tanstack/react-query`
2. **Copy semua shared components** dengan struktur folder yang rapi
3. **Update pages satu per satu** dan test
4. **Fix import paths** secara bertahap

Estimasi waktu: **2-3 jam** untuk migrasi lengkap dengan testing.

## ❓ Pilihan Anda

Mau saya:
1. **Buat script otomatis** untuk copy semua files? (Butuh 30 menit)
2. **Buat versi standalone** untuk semua halaman? (Cepat, 1 jam, tapi code duplication)
3. **Panduan manual** step-by-step yang detail? (Anda yang execute)

Pilih yang mana?
