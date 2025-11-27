# Mobile View Update - Verified BM & Warranty Claims

## Summary

Menambahkan tampilan mobile card yang konsisten dengan `/riwayat-transaksi` untuk:
1. `/jasa-verified-bm` - Riwayat Request
2. `/claim-garansi` - Riwayat Klaim Garansi

## Changes Made

### Files Modified
1. `src/features/member-area/components/verified-bm/VerifiedBMOrdersTable.tsx`
2. `src/features/member-area/components/warranty/WarrantyClaimsTable.tsx`
3. `src/features/member-area/components/warranty/ClaimResponseModal.tsx` - Redesigned with better colors and layout
4. `src/shared/components/Badge.tsx` - Updated color contrast for better visibility
5. `src/features/member-area/pages/TransactionHistory.tsx` - Added hover effect

### Implementation

#### Desktop View (md:block)
- Tetap menggunakan table layout yang sudah ada
- Tidak ada perubahan pada fungsionalitas desktop

#### Mobile View (md:hidden)
- **Card-based layout** dengan `rounded-3xl` border
- **Divider style**: `divide-y divide-dashed divide-gray-200` (sama seperti TransactionHistory)
- **Field layout**: Label di kiri, value di kanan
- **Typography**: `text-xs` untuk label dan value
- **Expand/collapse**: Button dengan icon ChevronUp/ChevronDown
- **Status badges**: Tetap menggunakan Badge component yang sudah ada
- **URL status summary**: Emoji indicators (✅ ⚠️ 🕐 ❌ 🔄)

### Mobile Card Structure

```tsx
<div className="bg-white rounded-3xl border border-gray-200">
  {/* Main Content */}
  <div className="p-4 divide-y divide-dashed divide-gray-200">
    {/* Request ID */}
    {/* Tanggal */}
    {/* Jumlah Akun + Status Summary */}
    {/* Total + Refund Info */}
    {/* Status Badge */}
    {/* Admin Notes (if any) */}
    {/* Expand Button */}
  </div>
  
  {/* Expanded Details */}
  {isExpanded && (
    <div className="bg-gray-50 p-4 space-y-4 border-t">
      {/* URL Details */}
      {/* Notes */}
      {/* Timestamps */}
    </div>
  )}
</div>
```

### Features Preserved

✅ Expand/collapse functionality
✅ URL status tracking (completed, processing, pending, failed, refunded)
✅ Refund amount calculation
✅ Admin notes display
✅ Timestamps (created, updated, completed, failed)
✅ External link icons for URLs
✅ Status badges with proper colors

### Design Consistency

- **Border radius**: `rounded-3xl` untuk cards, `rounded-2xl` untuk inner elements, `rounded-xl` untuk buttons
- **Text colors**: `text-gray-900` (headings), `text-gray-700` (body), `text-gray-600` (secondary), `text-gray-500` (labels)
- **Typography**: `text-xs` untuk mobile cards (konsisten dengan TransactionHistory)
- **Spacing**: `space-y-3` untuk card list, `py-2.5` untuk field rows
- **Dividers**: Dashed style untuk visual hierarchy
- **Hover effect**: `hover:shadow-md transition-shadow duration-200` untuk interactive feedback

### Responsive Behavior

- **Mobile (< md)**: Card-based layout dengan expand/collapse
- **Desktop (≥ md)**: Table layout dengan expand rows

## Testing Checklist

- [ ] Mobile view menampilkan cards dengan benar
- [ ] Desktop view tetap menampilkan table
- [ ] Expand/collapse berfungsi di mobile
- [ ] Status badges tampil dengan warna yang benar
- [ ] URL status summary tampil dengan emoji indicators
- [ ] Refund amount calculation benar
- [ ] Admin notes tampil jika ada
- [ ] Timestamps tampil dengan format yang benar
- [ ] External links berfungsi
- [ ] Responsive breakpoint (md) berfungsi dengan baik

## Warranty Claims Mobile Card Structure

```tsx
<div className="bg-white rounded-3xl border border-gray-200">
  <div className="p-4 divide-y divide-dashed divide-gray-200">
    {/* Transaction ID */}
    {/* Tanggal */}
    {/* Akun + Product Name */}
    {/* Alasan Klaim */}
    {/* Status Badge */}
    {/* Garansi Berakhir */}
    {/* View Response Button (if not pending) */}
  </div>
</div>
```

### Warranty Claims Features

✅ Transaction ID display
✅ Claim date formatting
✅ Account ID with product name
✅ Claim reason translation (Indonesian)
✅ Status badges with colors (Pending: Orange, Approved: Green, Rejected: Red, Reviewing: Blue, Completed: Green)
✅ Warranty expiry date
✅ View Response button (conditional) - Blue primary button for clear call-to-action

### Status Badge Colors (Mobile & Desktop)

| Status | Background | Text | Border |
|--------|-----------|------|--------|
| Pending | `bg-orange-100` | `text-orange-800` | `border-orange-200` |
| Approved | `bg-green-100` | `text-green-800` | `border-green-200` |
| Rejected | `bg-red-100` | `text-red-800` | `border-red-200` |
| Reviewing | `bg-blue-100` | `text-blue-800` | `border-blue-200` |
| Completed | `bg-green-100` | `text-green-800` | `border-green-200` |

## ClaimResponseModal Redesign

### Layout Improvements
- **Status Banner**: Centered layout dengan badge yang lebih besar (size="lg")
- **Detail Cards**: Grid layout dengan dividers untuk struktur yang lebih jelas
- **Color-coded sections**: 
  - Status banner menggunakan warna sesuai status (green/red/orange/blue)
  - Admin response dengan background biru untuk highlight
  - Pending message dengan background orange
- **Typography**: Konsisten dengan text-xs untuk labels, text-sm untuk content
- **Border radius**: `rounded-2xl` untuk semua cards dan sections

### Color Scheme
| Element | Background | Text | Border |
|---------|-----------|------|--------|
| Approved Status | `bg-green-50` | - | `border-green-200` |
| Rejected Status | `bg-red-50` | - | `border-red-200` |
| Pending Status | `bg-orange-50` | - | `border-orange-200` |
| Reviewing Status | `bg-blue-50` | - | `border-blue-200` |
| Admin Response | `bg-blue-50` | `text-blue-800` | `border-blue-200` |
| Detail Cards | `bg-white` | `text-gray-900` | `border-gray-200` |

**Note:** 
- Badge component telah diupdate untuk menggunakan warna yang lebih bold (text-800 instead of text-700) untuk kontras yang lebih baik di desktop dan mobile.
- Desktop view `getStatusBadge()` sekarang menangani semua status termasuk "completed" dan "reviewing".
- "View Response" button menggunakan variant="primary" (blue) untuk menunjukkan action yang bisa diklik oleh user.
- ClaimResponseModal menggunakan grid layout dengan dividers untuk struktur yang lebih rapi dan mudah dibaca.

## Notes

Format mobile ini sekarang **konsisten** dengan halaman `/riwayat-transaksi`, memberikan UX yang familiar untuk user di seluruh aplikasi.

### Consistency Across Pages

- `/riwayat-transaksi` ✅
- `/jasa-verified-bm` ✅
- `/claim-garansi` ✅

Semua halaman sekarang menggunakan:
- Card-based layout untuk mobile
- Dashed dividers (`divide-dashed`)
- Typography `text-xs` untuk semua field
- Border radius `rounded-3xl` untuk cards
- Hover effect `hover:shadow-md transition-shadow duration-200`
- Consistent spacing (`space-y-3`, `py-2.5`) dan colors

### UX Improvements

✅ **Visual Feedback**: Hover effect memberikan feedback visual saat user berinteraksi dengan cards
✅ **Smooth Transitions**: `duration-200` untuk transisi yang halus dan tidak mengganggu
✅ **Consistent Interaction**: Semua cards di ketiga halaman memiliki behavior yang sama
✅ **Professional Look**: Shadow effect memberikan depth dan hierarchy yang jelas
