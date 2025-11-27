# Admin Dashboard Mobile UX Improvement

## Changes Made

### Product Performance Section - Mobile-Friendly Layout

Mengubah tampilan Product Performance dari table menjadi card-based layout untuk mobile, mirip dengan UX Riwayat Klaim Garansi.

**File Modified:**
- `src/features/member-area/pages/admin/AdminDashboard.tsx`

## Implementation

### Desktop View (Unchanged)
- Table layout dengan 4 kolom: Product Type, Transactions, Total Revenue, Avg Amount
- Tetap menggunakan `rounded-3xl` dan shadow

### Mobile View (NEW)
- Card-based layout dengan divider dashed
- Setiap product ditampilkan dalam card terpisah
- Format key-value dengan label di kiri, value di kanan
- Hover effect dengan shadow-md
- Responsive spacing: `py-2.5` untuk setiap row

## Card Structure

```tsx
<div className="bg-white rounded-3xl border border-gray-200 p-4 divide-y divide-dashed divide-gray-200">
  {/* Product Type - Bold */}
  <div className="flex justify-between items-start py-2.5 first:pt-0">
    <span className="text-xs text-gray-500">Product Type</span>
    <span className="text-xs font-semibold text-gray-900">Value</span>
  </div>
  
  {/* Transactions */}
  <div className="flex justify-between items-start py-2.5">
    <span className="text-xs text-gray-500">Transactions</span>
    <span className="text-xs font-medium text-gray-700">Value</span>
  </div>
  
  {/* Total Revenue */}
  <div className="flex justify-between items-start py-2.5">
    <span className="text-xs text-gray-500">Total Revenue</span>
    <span className="text-xs font-medium text-gray-700">Value</span>
  </div>
  
  {/* Avg Amount */}
  <div className="flex justify-between items-start py-2.5 last:pb-0">
    <span className="text-xs text-gray-500">Avg Amount</span>
    <span className="text-xs font-medium text-gray-700">Value</span>
  </div>
</div>
```

## Typography Standards

- Labels: `text-xs text-gray-500`
- Product Type: `text-xs font-semibold text-gray-900` (emphasized)
- Values: `text-xs font-medium text-gray-700`

## Border Radius Standards

- Cards: `rounded-3xl` (24px)
- Consistent dengan design system

## Responsive Behavior

- Desktop (md+): Table layout
- Mobile (<md): Card layout
- Smooth transition dengan `hover:shadow-md`

## Benefits

✅ Lebih mudah dibaca di mobile
✅ Tidak perlu horizontal scroll
✅ Consistent UX dengan Riwayat Klaim Garansi
✅ Touch-friendly dengan spacing yang cukup
✅ Visual hierarchy yang jelas

## Testing

Test di berbagai ukuran layar:
- Mobile: 375px, 414px
- Tablet: 768px
- Desktop: 1024px+

Pastikan:
- Card spacing konsisten
- Text tidak terpotong
- Hover effect smooth
- Divider dashed terlihat jelas
