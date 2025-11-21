# Network Error Handling Improvement

## 🎯 Masalah yang Diperbaiki

Sebelumnya, ketika backend server offline atau tidak dapat diakses, aplikasi menampilkan error yang tidak informatif dan tidak memberikan opsi untuk retry. User harus refresh halaman secara manual.

## ✅ Solusi yang Diterapkan

### 1. **ErrorFallback Component** (`src/shared/components/ErrorFallback.tsx`)
Komponen error yang lebih informatif dengan:
- Icon yang sesuai dengan jenis error (WifiOff untuk network error, AlertCircle untuk error lain)
- Pesan error yang jelas dan mudah dipahami
- Saran troubleshooting untuk network error:
  - Periksa koneksi internet
  - Pastikan server backend berjalan
  - Periksa URL API
- Tombol "Coba Lagi" untuk retry tanpa refresh halaman

### 2. **Offline Detector** (`src/shared/components/OfflineDetector.tsx`)
Komponen global yang mendeteksi status koneksi internet:
- Menampilkan notifikasi ketika offline
- Menampilkan notifikasi ketika kembali online
- Auto-hide setelah 3 detik untuk online notification
- Menggunakan browser API `navigator.onLine`

### 3. **Improved React Query Configuration**
Update `src/shared/config/react-query.config.ts`:
- Network error retry hingga 3x (sebelumnya 2x)
- Exponential backoff dengan max delay 10s
- Automatic refetch ketika reconnect
- Better error type detection

### 4. **Updated Pages**
Halaman yang sudah diupdate dengan error handling yang lebih baik:
- ✅ `ClaimWarranty.tsx` - Menggunakan ErrorFallback dengan retry
- ✅ `TransactionHistory.tsx` - Menggunakan ErrorFallback dengan retry
- ✅ `MemberArea.tsx` - Menambahkan OfflineDetector global

## 🔧 Perbaikan Backend

### Fixed Import Errors:
1. **admin.middleware** → `role.middleware`
   - File: `server/src/routes/productAccount.routes.ts`
   - File: `server/src/routes/purchase.routes.ts`

2. **authenticateToken** → `authenticate`
   - File: `server/src/routes/productAccount.routes.ts`
   - File: `server/src/routes/purchase.routes.ts`

3. **supabase import** → `getSupabaseClient()`
   - File: `server/src/models/productAccountField.model.ts`
   - File: `server/src/models/productAccount.model.ts`
   - File: `server/src/controllers/purchase.controller.ts`

## 📊 Hasil

### Sebelum:
```
❌ Error: "Gagal Memuat Data"
❌ Tidak ada informasi detail
❌ Tidak ada opsi retry
❌ Harus refresh halaman manual
```

### Sesudah:
```
✅ Error informatif dengan icon yang sesuai
✅ Pesan error yang jelas dan saran troubleshooting
✅ Tombol "Coba Lagi" untuk retry
✅ Notifikasi offline/online detection
✅ Auto-retry dengan exponential backoff
✅ Loading state yang jelas
```

## 🚀 Cara Menggunakan

### ErrorFallback Component:
```tsx
import { ErrorFallback } from '../../../shared/components/ErrorFallback';

// Di component:
if (error) {
  return (
    <ErrorFallback
      error={error as ApplicationError}
      title="Gagal Memuat Data"
      onRetry={() => refetch()}
    />
  );
}
```

### Inline Error:
```tsx
import { InlineError } from '../../../shared/components/ErrorFallback';

<InlineError 
  message="Gagal memuat data" 
  onRetry={() => refetch()} 
/>
```

## 🔍 Testing

### Test Network Error:
1. Jalankan `npm run dev`
2. Stop backend server (Ctrl+C pada terminal backend)
3. Buka halaman Claim Garansi atau Transaction History
4. Lihat error message yang informatif dengan tombol retry
5. Start backend server kembali
6. Klik tombol "Coba Lagi"
7. Data berhasil dimuat

### Test Offline Detection:
1. Jalankan aplikasi
2. Matikan koneksi internet (atau gunakan DevTools → Network → Offline)
3. Lihat notifikasi "Tidak Ada Koneksi"
4. Nyalakan kembali koneksi internet
5. Lihat notifikasi "Kembali Online" (auto-hide setelah 3 detik)

## 📝 Next Steps

Halaman lain yang bisa diupdate dengan error handling yang sama:
- [ ] Dashboard
- [ ] BMAccounts
- [ ] PersonalAccounts
- [ ] VerifiedBMService
- [ ] Admin pages (ProductManagement, TransactionManagement, dll)

## 🎨 UI/UX Improvements

- Menggunakan border-radius standar (rounded-3xl untuk cards)
- Consistent color scheme (red-50/red-200 untuk error)
- Smooth animations (slide-in-right untuk notifications)
- Clear visual hierarchy dengan icons dan typography
