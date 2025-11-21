# Script Migrasi Member Area

## Step 1: Install Dependencies

```bash
cd canvango-app/frontend
npm install lucide-react
```

## Step 2: Struktur Folder Baru

Buat folder untuk shared components:
```
canvango-app/frontend/src/
├── components/
│   ├── shared/          # Shared UI components
│   │   ├── SummaryCard.tsx
│   │   ├── CategoryTabs.tsx
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   └── SearchSortBar.tsx
│   └── ...existing
└── ...
```

## Step 3: Copy Shared Components

Files yang perlu di-copy dari `src/features/member-area/` ke `canvango-app/frontend/src/components/shared/`:
- SummaryCard.tsx
- CategoryTabs.tsx (dari products/)
- ProductCard.tsx (dari products/)
- ProductGrid.tsx (dari products/)
- SearchSortBar.tsx (dari products/)

## Step 4: Update Pages

Replace semua halaman di `canvango-app/frontend/src/pages/` dengan versi baru.

## Step 5: Testing

Test setiap halaman:
- [ ] Dashboard
- [ ] Akun BM
- [ ] Akun Personal
- [ ] Transaction History
- [ ] Top Up
- [ ] Claim Garansi
- [ ] Jasa Verified BM
- [ ] API
- [ ] Tutorial
