# Border Radius Standards - Canvango App

## 📐 Standar Lengkungan Sudut (Border Radius)

Dokumen ini mendefinisikan standar border-radius yang konsisten di seluruh aplikasi berdasarkan analisis desain modern.

## 🎯 Hierarki Border Radius

### 1. **rounded-3xl (24px)** - Large Containers
**Penggunaan:**
- Card utama (product cards, dashboard cards)
- Modal dialogs
- Main content containers
- Table containers
- Section wrappers

**Contoh:**
```tsx
<div className="bg-white rounded-3xl shadow p-6">
  {/* Main card content */}
</div>
```

### 2. **rounded-2xl (16px)** - Medium Elements
**Penggunaan:**
- Badges (status, category)
- Pills (stock indicators)
- Icon containers
- Small cards
- Notification boxes

**Contoh:**
```tsx
<span className="inline-flex items-center px-3 py-1.5 rounded-2xl bg-green-100 text-green-800">
  Active
</span>
```

### 3. **rounded-xl (12px)** - Small Elements
**Penggunaan:**
- Buttons
- Input fields
- Dropdowns
- Small interactive elements
- Close buttons

**Contoh:**
```tsx
<button className="px-4 py-2 rounded-xl bg-indigo-600 text-white">
  Submit
</button>
```

### 4. **rounded-lg (8px)** - Deprecated
**Status:** ⚠️ Sedang diganti dengan rounded-xl atau rounded-3xl
**Catatan:** Hindari penggunaan rounded-lg untuk konsistensi

## 📋 Komponen yang Sudah Diupdate

### ✅ Core Components
- [x] `src/index.css` - Global styles & utility classes
- [x] `src/shared/components/Button.tsx` - rounded-xl
- [x] `src/shared/components/Badge.tsx` - rounded-2xl
- [x] `src/shared/components/Modal.tsx` - rounded-3xl

### ✅ Product Components
- [x] `src/features/member-area/components/products/ProductCard.tsx`
  - Card container: rounded-3xl
  - Stock badge: rounded-2xl

### ✅ Admin Pages
- [x] `src/features/member-area/pages/admin/AdminDashboard.tsx`
  - All stat cards: rounded-3xl
  - Icon containers: rounded-2xl
  - Input fields: rounded-xl

### ✅ Warranty Components
- [x] `src/features/member-area/components/warranty/WarrantyClaimsTable.tsx`
  - Table container: rounded-3xl
  - Icon container: rounded-2xl

## 🎨 Design Principles

### Progressive Rounding
Elemen yang lebih besar memiliki radius yang lebih besar, menciptakan hierarki visual yang konsisten:
- **Large** (24px) → Main containers, cards
- **Medium** (16px) → Badges, pills, icons
- **Small** (12px) → Buttons, inputs

### Visual Harmony
- Sudut yang lebih melengkung memberikan kesan modern dan friendly
- Konsistensi radius menciptakan visual yang cohesive
- Hierarki yang jelas membantu user navigation

### Accessibility
- Radius yang lebih besar meningkatkan readability
- Touch targets tetap memenuhi standar WCAG (44x44px minimum)
- Focus indicators tetap visible dengan radius yang konsisten

## 🔧 Implementation Guidelines

### DO ✅
```tsx
// Large containers
<div className="card"> {/* Uses rounded-3xl from global CSS */}

// Medium badges
<Badge variant="success"> {/* Uses rounded-2xl */}

// Small buttons
<Button variant="primary"> {/* Uses rounded-xl */}
```

### DON'T ❌
```tsx
// Jangan mix-and-match tanpa alasan
<div className="bg-white rounded-lg"> {/* Deprecated */}

// Jangan gunakan rounded-full untuk non-circular elements
<button className="rounded-full px-4 py-2"> {/* Wrong */}

// Jangan override tanpa konsultasi
<div className="card rounded-sm"> {/* Breaks consistency */}
```

## 📊 Migration Status

### Phase 1: Core Components ✅ COMPLETED
- Global CSS utilities
- Button, Badge, Modal components
- Product cards
- Admin dashboard

### Phase 2: Feature Pages 🔄 IN PROGRESS
- Transaction pages
- User management
- Tutorial center
- API documentation

### Phase 3: Shared Components 📋 PENDING
- Tables
- Forms
- Dropdowns
- Tooltips

## 🚀 Quick Reference

| Element Type | Class | Size | Usage |
|-------------|-------|------|-------|
| Main Cards | `rounded-3xl` | 24px | Product cards, dashboard cards, modals |
| Badges | `rounded-2xl` | 16px | Status badges, category pills |
| Buttons | `rounded-xl` | 12px | All buttons, inputs, dropdowns |
| Icons | `rounded-2xl` | 16px | Icon containers, avatars (non-circular) |
| Circular | `rounded-full` | 50% | Avatars, dots, circular indicators |

## 📝 Notes

- Standar ini berlaku untuk semua komponen baru
- Komponen existing akan diupdate secara bertahap
- Jangan ubah standar tanpa diskusi dengan tim
- Dokumentasi ini akan diupdate seiring progress migration

## 🔗 Related Files

- `src/index.css` - Global CSS dengan component classes
- `grid-layout-standards.md` - Grid layout standards (JANGAN DIUBAH)
- Component files di `src/shared/components/`
- Feature components di `src/features/member-area/`

---

**Last Updated:** 2024-11-18
**Status:** Active Implementation
**Version:** 1.0.0
