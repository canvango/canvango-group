# Implementation Plan

- [x] 1. Update Sidebar component admin menu paths to use absolute format


  - Modify the admin menu items array in `src/features/member-area/components/layout/Sidebar.tsx`
  - Change all admin paths from relative format (e.g., `'admin/dashboard'`) to absolute format (e.g., `'/member/admin/dashboard'`)
  - Ensure all 8 admin menu items are updated: Dashboard Admin, Kelola Pengguna, Kelola Transaksi, Kelola Klaim, Kelola Tutorial, Kelola Produk, Pengaturan Sistem, Log Aktivitas
  - Verify the path cleaning logic in the Link component remains unchanged
  - _Requirements: 1.1, 1.2, 2.1, 2.3_



- [ ] 2. Add admin routes to ROUTES configuration for consistency
  - Open `src/features/member-area/config/routes.config.ts`
  - Add new ADMIN section to ROUTES object with all admin paths
  - Include routes for: ROOT, DASHBOARD, USERS, TRANSACTIONS, CLAIMS, TUTORIALS, PRODUCTS, SETTINGS, AUDIT_LOGS


  - Update ROUTE_CONFIGS to include admin route metadata
  - _Requirements: 2.2, 2.5_

- [ ] 3. Update Sidebar to use ROUTES.ADMIN constants
  - Modify admin menu items in `src/features/member-area/components/layout/Sidebar.tsx`

  - Replace hardcoded path strings with ROUTES.ADMIN constants
  - Import ROUTES from routes.config.ts if not already imported
  - Ensure all admin menu items reference the correct ROUTES.ADMIN properties
  - _Requirements: 2.1, 2.3, 2.5_

- [x] 4. Verify navigation works correctly across all menu items

  - Test main menu navigation (Dashboard, Transactions, Top Up)
  - Test account menu navigation (BM Accounts, Personal Accounts)
  - Test service menu navigation (Verified BM, Warranty, API, Tutorials)
  - Test admin menu navigation for all 8 admin pages
  - Verify URLs are clean without duplication after each navigation
  - Verify browser back/forward buttons work correctly
  - Verify active menu item highlighting works correctly
  - _Requirements: 1.1, 1.2, 1.3, 1.5, 3.1, 3.2, 3.4, 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 5. Add integration tests for navigation behavior



  - Create test file for navigation URL duplication scenarios
  - Write test case for admin dashboard navigation without URL duplication
  - Write test case for sequential navigation maintaining clean URLs
  - Write test case for active menu item highlighting
  - Write test case for browser history navigation
  - _Requirements: 1.1, 1.3, 3.1, 3.2, 4.5_
