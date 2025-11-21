# Implementation Plan - Admin Menu Management

## Overview

Implementation plan untuk menambahkan menu admin di sidebar dan mengimplementasikan 8 halaman admin: Dashboard Admin, Kelola Pengguna, Kelola Transaksi, Kelola Klaim, Kelola Tutorial, Kelola Produk, Pengaturan Sistem, dan Log Aktivitas.

---

## Tasks

- [x] 1. Setup database schema untuk products table



  - Create migration file untuk products table
  - Add indexes untuk product_type, stock_status, is_active
  - Test migration di development environment
  - _Requirements: 7.1, 7.3, 7.4, 7.5_

- [x] 2. Implement Product model dan endpoints

  - [x] 2.1 Create Product.model.ts dengan Supabase client


    - Implement findAll dengan pagination, search, dan filter
    - Implement findById untuk get product detail
    - Implement create untuk insert product baru
    - Implement update untuk update product data
    - Implement delete untuk soft/hard delete product
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10_
  
  - [x] 2.2 Create product.controller.ts


    - Implement getProducts handler dengan query params
    - Implement getProductById handler
    - Implement createProduct handler dengan validation
    - Implement updateProduct handler dengan validation
    - Implement deleteProduct handler dengan confirmation
    - Add audit log untuk setiap action
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.10, 7.11_
  
  - [x] 2.3 Create product routes dengan admin authorization


    - Setup GET /api/admin/products route
    - Setup POST /api/admin/products route
    - Setup PUT /api/admin/products/:id route
    - Setup DELETE /api/admin/products/:id route
    - Apply auth.middleware dan role.middleware (admin only)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 9.2, 9.3, 9.4, 9.5, 9.6_

- [x] 3. Implement Admin Dashboard backend

  - [x] 3.1 Create admin.controller.ts untuk dashboard stats


    - Implement getDashboardStats handler
    - Query total users dengan breakdown per role
    - Query total transactions dengan breakdown per status dan total amount
    - Query total claims dengan breakdown per status
    - Query total tutorials dengan total views
    - Query total products dengan breakdown per stock status
    - Query recent audit logs (last 10 activities)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_
  
  - [x] 3.2 Create admin routes untuk dashboard


    - Setup GET /api/admin/dashboard/stats route
    - Apply auth.middleware dan role.middleware (admin only)
    - _Requirements: 2.1, 2.8, 9.2, 9.3, 9.6_

- [x] 4. Update Sidebar component untuk menampilkan admin menu


  - [x] 4.1 Modify Sidebar.tsx


    - Add admin menu section di bawah Tutorial
    - Define adminMenuItems array dengan 8 menu items
    - Add icons untuk setiap menu (Heroicons)
    - Implement conditional rendering berdasarkan user role
    - Add styling untuk membedakan section admin
    - Ensure responsive design untuk mobile
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 5. Create Admin Dashboard page

  - [x] 5.1 Create AdminDashboard.tsx component


    - Setup page layout dengan header
    - Create statistics cards component untuk users, transactions, claims, tutorials, products
    - Implement data fetching dari /api/admin/dashboard/stats
    - Add loading state dengan skeleton
    - Add error state dengan error message
    - Display recent activities table
    - Add charts untuk visualisasi data (optional: recharts)
    - Implement protected route dengan admin authorization
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 11.6, 11.7, 11.8_

- [x] 6. Create Product Management page

  - [x] 6.1 Create ProductManagement.tsx component


    - Setup page layout dengan header dan "Tambah Produk" button
    - Create products table dengan columns: ID, Name, Type, Category, Price, Stock, Actions
    - Implement data fetching dari /api/admin/products
    - Add search input dengan debounce
    - Add filter untuk product type dan stock status
    - Add pagination controls
    - Add loading, error, dan empty states
    - _Requirements: 7.1, 7.2, 7.7, 7.8, 7.9, 11.6, 11.7, 11.8, 11.9_
  
  - [x] 6.2 Create Product form modals

    - Create CreateProductModal component dengan form fields
    - Create EditProductModal component dengan pre-filled data
    - Create DeleteProductModal component dengan confirmation
    - Implement form validation
    - Implement form submission dengan API calls
    - Add toast notifications untuk success/error
    - _Requirements: 7.3, 7.4, 7.5, 7.6, 7.10, 7.11_

- [x] 7. Create User Management page

  - [x] 7.1 Create UserManagement.tsx component

    - Setup page layout dengan header
    - Create users table dengan columns: ID, Username, Email, Role, Balance, Status, Actions
    - Implement data fetching dari /api/admin/users
    - Add search input dengan debounce
    - Add filter untuk role
    - Add pagination controls
    - Add loading, error, dan empty states
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 11.6, 11.7, 11.8, 11.9_
  
  - [x] 7.2 Create User edit and delete modals

    - Create EditUserModal component dengan form untuk username, email, role, balance
    - Create DeleteUserModal component dengan confirmation
    - Implement form validation
    - Implement form submission dengan API calls
    - Add toast notifications untuk success/error
    - _Requirements: 3.6, 3.7, 3.8, 3.9_

- [x] 8. Create Transaction Management page

  - [x] 8.1 Create TransactionManagement.tsx component

    - Setup page layout dengan header
    - Create transactions table dengan columns: ID, User, Product, Quantity, Amount, Status, Date, Actions
    - Implement data fetching dari /api/admin/transactions
    - Add search input dengan debounce
    - Add filter untuk status
    - Add date range filter
    - Add pagination controls
    - Add loading, error, dan empty states
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 11.6, 11.7, 11.8, 11.9_
  
  - [x] 8.2 Create Transaction action modals

    - Create UpdateStatusModal component
    - Create RefundModal component dengan confirmation
    - Create TransactionDetailModal component untuk view detail
    - Implement API calls untuk update status dan refund
    - Add toast notifications untuk success/error
    - _Requirements: 4.6, 4.7, 4.8, 4.9_

- [x] 9. Create Claim Management page

  - [x] 9.1 Create ClaimManagement.tsx component

    - Setup page layout dengan header
    - Create claims table dengan columns: ID, User, Transaction, Description, Status, Date, Actions
    - Implement data fetching dari /api/admin/claims
    - Add filter untuk status
    - Add pagination controls
    - Add loading, error, dan empty states
    - _Requirements: 5.1, 5.2, 5.3, 11.6, 11.7, 11.8, 11.9_
  
  - [x] 9.2 Create Claim review modals

    - Create ReviewClaimModal component dengan detail claim dan approve/reject form
    - Implement approve action dengan admin response
    - Implement reject action dengan admin response
    - Implement refund processing untuk approved claims
    - Add toast notifications untuk success/error
    - _Requirements: 5.4, 5.5, 5.6, 5.7, 5.8, 5.9_

- [x] 10. Create Tutorial Management page

  - [x] 10.1 Create TutorialManagement.tsx component

    - Setup page layout dengan header dan "Tambah Tutorial" button
    - Create tutorials table dengan columns: ID, Title, Category, Tags, Views, Date, Actions
    - Implement data fetching dari /api/admin/tutorials
    - Add search input dengan debounce
    - Add pagination controls
    - Add loading, error, dan empty states
    - _Requirements: 6.1, 6.2, 6.7, 6.8, 11.6, 11.7, 11.8, 11.9_
  
  - [x] 10.2 Create Tutorial form modals

    - Create CreateTutorialModal component dengan form fields
    - Create EditTutorialModal component dengan pre-filled data
    - Create DeleteTutorialModal component dengan confirmation
    - Implement form validation
    - Implement form submission dengan API calls
    - Add toast notifications untuk success/error
    - _Requirements: 6.3, 6.4, 6.5, 6.6, 6.9_

- [x] 11. Create System Settings page

  - [x] 11.1 Create SystemSettings.tsx component

    - Setup page layout dengan header
    - Create settings form dengan fields: site_name, maintenance_mode, email_notifications, payment_methods
    - Implement data fetching dari /api/admin/settings
    - Add toggle switches untuk boolean settings
    - Add save button dengan confirmation
    - Display last updated timestamp
    - Add loading, error states
    - _Requirements: 8.1, 8.2, 8.3, 8.7, 11.6, 11.7, 11.8_
  
  - [x] 11.2 Implement settings update

    - Implement form submission dengan API call
    - Add validation untuk required fields
    - Add toast notifications untuk success/error
    - Track changes dan enable/disable save button
    - _Requirements: 8.4, 8.5, 8.6_

- [x] 12. Create Audit Log page

  - [x] 12.1 Create AuditLog.tsx component


    - Setup page layout dengan header
    - Create audit logs table dengan columns: ID, Admin, Action, Entity, Changes, IP, Date
    - Implement data fetching dari /api/admin/audit-logs
    - Add filter untuk admin user
    - Add filter untuk action type
    - Add filter untuk entity type
    - Add date range filter
    - Add pagination controls
    - Add loading, error, dan empty states
    - Make table read-only (no edit/delete buttons)
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.9, 11.6, 11.7, 11.8, 11.9_
  
  - [x] 12.2 Create Audit Log detail modal

    - Create AuditLogDetailModal component
    - Display full log details
    - Format changes JSON untuk readability
    - Add syntax highlighting untuk JSON (optional)
    - _Requirements: 9.7, 9.8_

- [x] 13. Setup protected routes untuk admin pages

  - [x] 13.1 Update App.tsx atau router configuration


    - Add routes untuk semua 8 admin pages
    - Wrap admin routes dengan ProtectedRoute component
    - Set requiredRole to 'admin'
    - Ensure redirect ke /unauthorized untuk non-admin users
    - _Requirements: 9.1, 9.2, 9.6, 10.1, 10.2_

- [x] 14. Update backend authorization middleware

  - [x] 14.1 Verify role.middleware.ts

    - Ensure middleware checks for admin role
    - Return 403 Forbidden untuk non-admin users
    - Log unauthorized access attempts
    - _Requirements: 10.3, 10.4, 10.5, 10.6, 10.7_

- [x] 15. Integration testing dan bug fixes

  - [x] 15.1 Test admin menu visibility

    - Login sebagai admin dan verify menu muncul
    - Login sebagai member dan verify menu tidak muncul
    - Test responsive design di mobile
    - _Requirements: 1.1, 1.2, 1.3, 11.4_
  
  - [x] 15.2 Test all admin pages

    - Test Dashboard Admin dengan data loading
    - Test Product Management CRUD operations
    - Test User Management CRUD operations
    - Test Transaction Management operations
    - Test Claim Management operations
    - Test Tutorial Management CRUD operations
    - Test System Settings update
    - Test Audit Log filtering dan pagination
    - _Requirements: All requirements_
  
  - [x] 15.3 Test authorization

    - Test admin endpoints dengan admin token (should succeed)
    - Test admin endpoints dengan member token (should fail 403)
    - Test admin endpoints tanpa token (should fail 401)
    - Test admin pages access dengan non-admin user (should redirect)
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_
  
  - [x] 15.4 Test audit logging

    - Perform admin actions dan verify audit logs created
    - Check audit log contains correct data (user, action, entity, changes, IP)
    - Verify audit logs are immutable
    - _Requirements: 3.8, 4.8, 5.8, 6.9, 7.10, 8.6, 9.7_

- [x] 16. UI/UX polish dan final touches


  - [x] 16.1 Improve UI consistency

    - Ensure all pages use consistent Tailwind classes
    - Verify all icons are from Heroicons
    - Check active state highlighting di sidebar
    - Test responsive design di berbagai screen sizes
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_
  
  - [x] 16.2 Add loading skeletons

    - Add skeleton loaders untuk tables
    - Add skeleton loaders untuk cards
    - Improve loading UX
    - _Requirements: 11.7_
  
  - [x] 16.3 Improve error handling

    - Add user-friendly error messages
    - Add retry buttons untuk failed requests
    - Improve error state UI
    - _Requirements: 11.8_
  
  - [x] 16.4 Add empty states

    - Add empty state untuk tables tanpa data
    - Add helpful messages dan call-to-action
    - _Requirements: 11.9_

---

## Notes

- Semua tasks harus mengikuti existing code patterns dan conventions
- Gunakan TypeScript untuk type safety
- Gunakan Tailwind CSS untuk styling
- Gunakan Heroicons untuk icons
- Gunakan React Hot Toast untuk notifications
- Semua admin endpoints harus protected dengan auth dan role middleware
- Semua admin actions harus logged di audit log
- Test setiap feature sebelum melanjutkan ke task berikutnya
