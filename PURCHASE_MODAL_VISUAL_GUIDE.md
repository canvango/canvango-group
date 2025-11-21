# Purchase Modal - Visual Guide

## 🎯 Implementasi Selesai

Modal pembelian produk telah berhasil diimplementasikan sesuai dengan screenshot yang diberikan.

## 📱 Modal Structure

```
┌─────────────────────────────────────────┐
│  🛒 Beli Akun                      ✕    │ ← Header (Sticky)
├─────────────────────────────────────────┤
│                                         │
│              ┌─────────┐                │
│              │  Meta   │                │ ← Product Icon
│              │  Logo   │                │
│              └─────────┘                │
│                                         │
│     BM NEW VERIFIED | CEK DETAIL       │ ← Product Title
│           SEBELUM MEMBELI               │
│                                         │
│      Kategori: BM VERIFIED              │ ← Category
│                                         │
│  📋 Detail Pembelian                    │
│                                         │
│  Harga Satuan          Rp 125.000       │
│  Stok Tersedia         4 Akun           │
│                                         │
│  Jumlah Beli                            │
│       ┌───┐  ┌───┐  ┌───┐              │ ← Quantity Selector
│       │ - │  │ 1 │  │ + │              │
│       └───┘  └───┘  └───┘              │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Saldo Anda      Rp 0            │   │ ← Summary Box
│  │ Total Pembayaran  Rp 125.000    │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ⚠️ Saldo Anda tidak mencukupi untuk   │ ← Warning (if insufficient)
│     pembelian ini.                      │
│                                         │
├─────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────────────┐    │ ← Footer (Sticky)
│  │ ← Kembali│  │ ✓ Konfirmasi     │    │
│  └──────────┘  │   Pembelian      │    │
│                └──────────────────┘    │
└─────────────────────────────────────────┘
```

## 🎨 Design Specifications

### Colors
- **Primary**: Indigo-600 (#4F46E5)
- **Success**: Green-500
- **Warning**: Pink-500/Pink-700
- **Background**: White
- **Text**: Gray-900, Gray-700, Gray-600

### Border Radius (Sesuai Standar)
- Modal Container: `rounded-3xl` (24px)
- Buttons: `rounded-xl` (12px)
- Summary Box: `rounded-2xl` (16px)
- Icon Container: `rounded-full`
- Quantity Buttons: `rounded-xl` (12px)

### Spacing
- Modal Padding: `p-6` (24px)
- Section Gap: `space-y-6` (24px)
- Button Gap: `gap-3` (12px)

### Typography
- Modal Title: `text-lg font-bold`
- Product Title: `text-lg font-bold`
- Section Label: `font-semibold`
- Body Text: `text-sm`
- Total Price: `text-xl font-bold`

## ⚡ Features

### 1. Real-time Balance Check
```typescript
const { data: userProfile } = useQuery({
  queryKey: ['userProfile'],
  queryFn: fetchUserProfile,
});

const userBalance = userProfile?.balance || 0;
const isInsufficientBalance = userBalance < totalPrice;
```

### 2. Quantity Control
- Minimum: 1
- Maximum: product.stock
- Increment/Decrement buttons
- Disabled when out of range

### 3. Validation States
- ✅ Sufficient balance → Enable confirm button
- ❌ Insufficient balance → Show warning + Disable confirm
- 🔄 Processing → Show loading spinner + Disable all actions

### 4. Responsive Behavior
- Max width: `max-w-md` (448px)
- Max height: `max-h-[90vh]`
- Scrollable content
- Sticky header & footer

## 🔄 User Flow

```
ProductCard
    │
    ├─ Click "Beli" button
    │
    ▼
PurchaseModal Opens
    │
    ├─ Display product info
    ├─ Fetch user balance
    ├─ Calculate total price
    │
    ▼
User Interaction
    │
    ├─ Adjust quantity (+/-)
    ├─ View balance vs total
    │
    ▼
Decision Point
    │
    ├─ Insufficient Balance?
    │   ├─ YES → Show warning, disable confirm
    │   └─ NO → Enable confirm button
    │
    ▼
Action
    │
    ├─ Click "Kembali" → Close modal
    │
    └─ Click "Konfirmasi" → Purchase API
        │
        ├─ Success → Close modal + Show success message
        └─ Error → Show error message
```

## 📝 Component Props

```typescript
interface PurchaseModalProps {
  isOpen: boolean;           // Control modal visibility
  onClose: () => void;       // Handle modal close
  product: Product;          // Product to purchase
  onConfirm: (quantity: number) => void;  // Handle purchase
  isProcessing?: boolean;    // Show loading state
}
```

## 🎯 Integration Points

### BMAccounts.tsx & PersonalAccounts.tsx
```typescript
// State
const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

// Open modal
const handleBuy = (productId: string) => {
  const product = productsData?.data.find((p) => p.id === productId);
  setSelectedProduct(product);
  setIsPurchaseModalOpen(true);
};

// Confirm purchase
const handlePurchaseConfirm = async (quantity: number) => {
  await purchaseMutation.mutateAsync({ productId, quantity });
};

// Render
<PurchaseModal
  isOpen={isPurchaseModalOpen}
  onClose={handlePurchaseModalClose}
  product={selectedProduct}
  onConfirm={handlePurchaseConfirm}
  isProcessing={purchaseMutation.isPending}
/>
```

## ✅ Testing Scenarios

### Scenario 1: Sufficient Balance
1. User has balance: Rp 500.000
2. Product price: Rp 125.000
3. Quantity: 1
4. Total: Rp 125.000
5. Result: ✅ Confirm button enabled

### Scenario 2: Insufficient Balance
1. User has balance: Rp 0
2. Product price: Rp 125.000
3. Quantity: 1
4. Total: Rp 125.000
5. Result: ❌ Warning shown, confirm disabled

### Scenario 3: Multiple Quantity
1. User has balance: Rp 500.000
2. Product price: Rp 125.000
3. Quantity: 3
4. Total: Rp 375.000
5. Result: ✅ Confirm button enabled

### Scenario 4: Stock Limit
1. Product stock: 4
2. User tries to increase quantity to 5
3. Result: ❌ Plus button disabled at quantity 4

## 🚀 Next Steps

Untuk testing:
```bash
npm run dev
```

Kemudian:
1. Login ke aplikasi
2. Navigate ke BM Accounts atau Personal Accounts
3. Click tombol "Beli" pada product card
4. Modal akan muncul dengan semua fitur yang sudah diimplementasikan

## 📦 Files Created/Modified

### New Files
- `src/features/member-area/components/products/PurchaseModal.tsx`

### Modified Files
- `src/features/member-area/pages/BMAccounts.tsx`
- `src/features/member-area/pages/PersonalAccounts.tsx`

### Documentation
- `PURCHASE_MODAL_IMPLEMENTATION.md`
- `PURCHASE_MODAL_VISUAL_GUIDE.md`
