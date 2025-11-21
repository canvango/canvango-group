# Design Document: Fix Navigation URL Duplication

## Overview

This design addresses a critical bug in the member area navigation system where clicking menu items causes URL paths to duplicate infinitely. The root cause is inconsistent path handling between the Sidebar component's menu item definitions and the path normalization logic in the Link components.

The fix involves standardizing all navigation paths to use absolute paths with the `/member/` prefix and ensuring the path cleaning logic doesn't interfere with properly formatted paths.

## Architecture

### Current Problem Analysis

1. **Admin Menu Items**: Defined with relative paths (e.g., `'admin/dashboard'`)
2. **Path Cleaning Logic**: The Sidebar's Link component attempts to clean paths by removing `/member/` prefix
3. **React Router Behavior**: When given a relative path without leading slash, React Router appends it to the current location
4. **Result**: Each click appends the path segment again, creating `/dashboard/dashboard/dashboard/...`

### Solution Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Sidebar Component                        │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Menu Item Definitions                              │    │
│  │ - All paths use absolute format: /member/xxx       │    │
│  │ - Admin paths: /member/admin/xxx                   │    │
│  │ - Consistent format across all menu items          │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↓                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Path Processing                                     │    │
│  │ - Remove /member/ prefix for React Router          │    │
│  │ - Keep remaining path structure intact             │    │
│  │ - Result: /dashboard, /admin/dashboard, etc.       │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↓                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │ React Router Link                                   │    │
│  │ - Receives clean relative path                     │    │
│  │ - Navigates within /member route context           │    │
│  │ - Final URL: /member/dashboard, etc.               │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Sidebar Component Updates

**File**: `src/features/member-area/components/layout/Sidebar.tsx`

**Changes Required**:

```typescript
// BEFORE (Problematic)
const authenticatedMenuStructure = [
  // ... other sections
  ...(isAdmin ? [{
    section: 'ADMIN',
    items: [
      { icon: BarChart3, label: 'Dashboard Admin', path: 'admin/dashboard' }, // ❌ Relative path
      { icon: Users, label: 'Kelola Pengguna', path: 'admin/users' },
      // ... more items
    ]
  }] : [])
];

// AFTER (Fixed)
const authenticatedMenuStructure = [
  // ... other sections
  ...(isAdmin ? [{
    section: 'ADMIN',
    items: [
      { icon: BarChart3, label: 'Dashboard Admin', path: '/member/admin/dashboard' }, // ✅ Absolute path
      { icon: Users, label: 'Kelola Pengguna', path: '/member/admin/users' },
      // ... more items
    ]
  }] : [])
];
```

**Path Processing Logic**:
```typescript
// Clean path - remove /member prefix for React Router
const cleanPath = item.path.startsWith('/member/') 
  ? item.path.substring(8)  // Remove '/member/' (8 chars)
  : item.path.startsWith('/member') 
    ? item.path.substring(7)  // Remove '/member' (7 chars)
    : item.path;
```

This logic should remain unchanged as it correctly handles the absolute paths.

### 2. ROUTES Configuration Verification

**File**: `src/features/member-area/config/routes.config.ts`

**Current State**: Already uses absolute paths correctly
```typescript
export const ROUTES = {
  ROOT: '/member',
  DASHBOARD: '/member/dashboard',
  TRANSACTIONS: '/member/riwayat-transaksi',
  // ... all paths use /member/ prefix ✅
};
```

**Action**: No changes needed, but we should add admin routes to this configuration for consistency.

**Proposed Addition**:
```typescript
export const ROUTES = {
  // ... existing routes
  
  // Admin section
  ADMIN: {
    ROOT: '/member/admin',
    DASHBOARD: '/member/admin/dashboard',
    USERS: '/member/admin/users',
    TRANSACTIONS: '/member/admin/transactions',
    CLAIMS: '/member/admin/claims',
    TUTORIALS: '/member/admin/tutorials',
    PRODUCTS: '/member/admin/products',
    SETTINGS: '/member/admin/settings',
    AUDIT_LOGS: '/member/admin/audit-logs',
  },
} as const;
```

### 3. useNavigation Hook Verification

**File**: `src/features/member-area/hooks/useNavigation.ts`

**Current State**: Already handles path normalization correctly
```typescript
const navigateTo = useCallback(
  (path: string, params?: Record<string, string | number | boolean | undefined>) => {
    let cleanPath = path;
    if (path.startsWith('/member/')) {
      cleanPath = path.substring(8);
    } else if (path.startsWith('/member')) {
      cleanPath = path.substring(7);
    } else if (path.startsWith('/')) {
      cleanPath = path.substring(1);
    }
    
    const fullPath = buildRoute(cleanPath, params);
    navigate(fullPath);
  },
  [navigate]
);
```

**Action**: No changes needed, logic is correct.

## Data Models

No data model changes required. This is purely a navigation/routing fix.

## Error Handling

### Potential Issues and Mitigations

1. **Issue**: Existing bookmarks or external links with old URL format
   - **Mitigation**: React Router will handle these naturally; no special handling needed

2. **Issue**: Browser history may contain duplicated URLs
   - **Mitigation**: Users can clear history; new navigation will work correctly

3. **Issue**: Active state highlighting might break temporarily
   - **Mitigation**: The `isPathActive` function already handles path normalization correctly

## Testing Strategy

### Manual Testing Checklist

1. **Main Menu Navigation**
   - [ ] Click Dashboard → Verify URL is `/member/dashboard`
   - [ ] Click Riwayat Transaksi → Verify URL is `/member/riwayat-transaksi`
   - [ ] Click Top Up → Verify URL is `/member/top-up`

2. **Account Menu Navigation**
   - [ ] Click Akun BM → Verify URL is `/member/akun-bm`
   - [ ] Click Akun Personal → Verify URL is `/member/akun-personal`

3. **Service Menu Navigation**
   - [ ] Click Jasa Verified BM → Verify URL is `/member/jasa-verified-bm`
   - [ ] Click Claim Garansi → Verify URL is `/member/claim-garansi`
   - [ ] Click API → Verify URL is `/member/api`
   - [ ] Click Tutorial → Verify URL is `/member/tutorial`

4. **Admin Menu Navigation** (requires admin user)
   - [ ] Click Dashboard Admin → Verify URL is `/member/admin/dashboard`
   - [ ] Click Kelola Pengguna → Verify URL is `/member/admin/users`
   - [ ] Click Kelola Transaksi → Verify URL is `/member/admin/transactions`
   - [ ] Click Kelola Klaim → Verify URL is `/member/admin/claims`
   - [ ] Click Kelola Tutorial → Verify URL is `/member/admin/tutorials`
   - [ ] Click Kelola Produk → Verify URL is `/member/admin/products`
   - [ ] Click Pengaturan Sistem → Verify URL is `/member/admin/settings`
   - [ ] Click Log Aktivitas → Verify URL is `/member/admin/audit-logs`

5. **Sequential Navigation Test**
   - [ ] Click Dashboard → Admin Dashboard → Users → Dashboard → Verify no path duplication
   - [ ] Navigate through 10+ different menu items → Verify URLs remain clean

6. **Browser Navigation Test**
   - [ ] Navigate through several pages → Click back button → Verify correct previous page
   - [ ] Click forward button → Verify correct next page
   - [ ] Verify browser history shows clean URLs

7. **Active State Test**
   - [ ] Navigate to each page → Verify correct menu item is highlighted
   - [ ] Verify only one menu item is highlighted at a time

### Automated Testing

While this is primarily a UI/navigation fix, we can add integration tests:

```typescript
describe('Navigation URL Duplication Fix', () => {
  it('should navigate to admin dashboard without URL duplication', () => {
    // Test navigation to admin pages
  });
  
  it('should maintain clean URLs after multiple navigations', () => {
    // Test sequential navigation
  });
  
  it('should highlight correct active menu item', () => {
    // Test active state
  });
});
```

## Implementation Notes

### Files to Modify

1. **`src/features/member-area/components/layout/Sidebar.tsx`**
   - Update admin menu items to use absolute paths with `/member/` prefix
   - Verify path cleaning logic remains unchanged

2. **`src/features/member-area/config/routes.config.ts`** (Optional but recommended)
   - Add ADMIN routes configuration for consistency
   - Update Sidebar to use ROUTES.ADMIN constants

### Backward Compatibility

- No breaking changes to existing functionality
- All existing routes continue to work
- No API or data structure changes

### Performance Impact

- Negligible performance impact
- No additional computations or network requests
- Same number of re-renders

## Rollback Plan

If issues arise after deployment:

1. Revert the Sidebar.tsx changes
2. The old behavior will return (with the bug)
3. No data loss or corruption possible
4. No database changes to rollback

## Success Criteria

1. ✅ All menu items navigate to correct URLs without duplication
2. ✅ URLs remain clean after multiple sequential navigations
3. ✅ Browser back/forward buttons work correctly
4. ✅ Active menu item highlighting works correctly
5. ✅ No console errors or warnings
6. ✅ All manual test cases pass
