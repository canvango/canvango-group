---
inclusion: always
---

# Grid Layout Standards - DO NOT MODIFY

## ⚠️ CRITICAL: Established Grid Configuration

These grid settings are carefully configured. **DO NOT CHANGE** without explicit user approval.

## Product Grid - `.product-grid-responsive`

**File:** `src/index.css`

```css
.product-grid-responsive {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 0.5rem; /* 8px - DO NOT CHANGE */
  width: 100%;
}

.product-grid-responsive > * {
  max-width: 380px; /* DO NOT CHANGE - prevents stretched cards */
  width: 100%;
}
```

**Used in:**
- `src/features/member-area/components/products/ProductGrid.tsx`
- Pages: BMAccounts, PersonalAccounts

**Rules:**
- Gap MUST be `0.5rem` (8px) - tight spacing
- Max-width MUST be `380px` - prevents card stretching with few products
- Use `auto-fit` not `auto-fill` - fills full width
- Responsive breakpoints: 240px → 260px → 280px → 300px

## Main Content Container

**File:** `src/features/member-area/components/layout/MainContent.tsx`

```tsx
<div className="w-full mx-auto px-2 md:px-4 lg:px-6">
```

**Rules:**
- NO `max-w-7xl` or other width constraints
- Use `w-full` for full width
- Responsive padding: `px-2` → `px-4` → `px-6`

## Summary Cards & Admin Grids

**Established Responsive Gaps:**

```tsx
// Product Summary Cards (3 columns)
<div className="grid grid-cols-3 gap-2 md:gap-3">

// Admin Statistics Cards
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">

// Admin Filter Grids
<div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
```

**Rules:**
- Gaps MUST be responsive: `gap-2` or `gap-3` (mobile) → `gap-4` (tablet) → `gap-6` (desktop)
- NO fixed gaps like `gap-6` alone

## Configured Pages

**User:** BMAccounts, PersonalAccounts, Dashboard, TransactionHistory, VerifiedBMService, APIDocumentation

**Admin:** AdminDashboard, ProductManagement, TransactionManagement, TutorialManagement, AuditLog

## Before Modifying Grid Settings

**STOP and ask user first:**

1. Warn that established grid settings will be changed
2. Show current configuration
3. Reference `RESPONSIVE_GRID_FIX.md`
4. Wait for explicit user confirmation

**Warning template:**

> "⚠️ This will modify established grid settings:
> - Product grid gap: 0.5rem (tight)
> - Max-width card: 380px (no stretching)
> - Container: full width
> 
> Confirm to proceed?"
