# Purchase Modal Implementation

## Overview
Implementasi modal pembelian produk yang menampilkan detail pembelian, quantity selector, dan validasi saldo user sebelum konfirmasi pembelian.

## Features Implemented

### 1. Purchase Modal Component (`PurchaseModal.tsx`)
- ✅ Modal dengan design sesuai screenshot
- ✅ Menampilkan icon produk (Meta Infinity Logo)
- ✅ Detail produk (title, kategori)
- ✅ Detail pembelian:
  - Harga satuan
  - Stok tersedia
  - Quantity selector dengan tombol +/-
- ✅ Summary pembayaran:
  - Saldo user saat ini
  - Total pembayaran
- ✅ Validasi saldo:
  - Warning jika saldo tidak mencukupi
  - Disable tombol konfirmasi jika saldo kurang
- ✅ Loading state saat processing
- ✅ Border radius sesuai standar (rounded-3xl untuk modal, rounded-xl untuk buttons)

### 2. Integration dengan Pages
- ✅ BMAccounts.tsx - menggunakan PurchaseModal
- ✅ PersonalAccounts.tsx - menggunakan PurchaseModal
- ✅ Mengganti ConfirmDialog dengan PurchaseModal
- ✅ Handle quantity selection
- ✅ Handle purchase confirmation

## UI/UX Features

### Modal Design
- **Header**: Sticky header dengan icon ShoppingCart dan tombol close
- **Content**: 
  - Product icon dengan background circular
  - Product info (title & category)
  - Detail pembelian section dengan icon
  - Quantity selector dengan buttons
  - Summary box dengan background gray
  - Warning box untuk insufficient balance
- **Footer**: Sticky footer dengan tombol Kembali dan Konfirmasi

### Styling Standards
- Modal: `rounded-3xl` (24px)
- Buttons: `rounded-xl` (12px)
- Summary box: `rounded-2xl` (16px)
- Icon container: `rounded-full`
- Colors: Primary (indigo-600), Pink untuk warning
- Responsive: max-w-md, max-h-90vh dengan scroll

### User Flow
1. User klik tombol "Beli" di ProductCard
2. Modal muncul dengan detail produk
3. User dapat adjust quantity dengan tombol +/-
4. System menampilkan:
   - Saldo user saat ini
   - Total pembayaran
   - Warning jika saldo tidak cukup
5. User klik "Konfirmasi Pembelian" atau "Kembali"
6. Jika konfirmasi, purchase API dipanggil
7. Modal close setelah success/error

## Technical Details

### Props Interface
```typescript
interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onConfirm: (quantity: number) => void;
  isProcessing?: boolean;
}
```

### State Management
- Local state untuk quantity
- React Query untuk fetch user balance
- Parent component handle purchase mutation

### Validations
- Quantity min: 1
- Quantity max: product.stock
- Balance check: userBalance >= totalPrice
- Disable actions saat processing

## Files Modified

1. **New File**:
   - `src/features/member-area/components/products/PurchaseModal.tsx`

2. **Updated Files**:
   - `src/features/member-area/pages/BMAccounts.tsx`
   - `src/features/member-area/pages/PersonalAccounts.tsx`

## Dependencies
- React Query - untuk fetch user profile/balance
- Lucide React - untuk icons
- Tailwind CSS - untuk styling
- MetaInfinityLogo - custom icon component

## Testing Checklist
- [ ] Modal opens when clicking "Beli" button
- [ ] Quantity selector works correctly
- [ ] Balance validation works
- [ ] Warning shows when insufficient balance
- [ ] Confirm button disabled when balance insufficient
- [ ] Loading state shows during processing
- [ ] Modal closes after successful purchase
- [ ] Error handling works properly
- [ ] Responsive design works on mobile
- [ ] Keyboard navigation works (ESC to close)

## Future Enhancements
- [ ] Add animation untuk modal open/close
- [ ] Add success animation setelah purchase
- [ ] Add keyboard shortcuts (Enter untuk confirm)
- [ ] Add product image preview
- [ ] Add discount/promo code input
- [ ] Add payment method selection
- [ ] Add purchase history quick view

## Notes
- Modal menggunakan fixed positioning dengan backdrop
- Sticky header dan footer untuk better UX saat scroll
- Format currency menggunakan Intl.NumberFormat untuk IDR
- Icon emoji (📋) digunakan untuk "Detail Pembelian" section
