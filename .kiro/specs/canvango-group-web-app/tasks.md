# Implementation Plan

- [x] 1. Setup project structure dan konfigurasi awal





  - Inisialisasi project dengan React + TypeScript untuk frontend
  - Setup Node.js + Express + TypeScript untuk backend
  - Konfigurasi database PostgreSQL
  - Setup environment variables dan configuration files
  - Install dan konfigurasi dependencies (React Router, Axios, Tailwind CSS, dll)
  - _Requirements: Semua requirements membutuhkan project structure_

- [-] 2. Implementasi database schema dan models


  - [x] 2.1 Buat User model dengan fields dan validasi


    - Implementasi User model dengan role (guest, member, admin)
    - Setup password hashing dengan bcrypt
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [x] 2.2 Buat Transaction model


    - Implementasi Transaction model dengan relasi ke User
    - Setup enum untuk product types dan status
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8_
  
  - [x] 2.3 Buat TopUp model


    - Implementasi TopUp model dengan relasi ke User
    - Setup status tracking untuk top up
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [x] 2.4 Buat Claim model


    - Implementasi Claim model dengan relasi ke User dan Transaction
    - Setup status workflow untuk claim
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [x] 2.5 Buat Tutorial model


    - Implementasi Tutorial model dengan categories dan tags
    - Setup view counter
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [x] 2.6 Buat AdminAuditLog model



    - Implementasi audit log untuk tracking admin actions
    - Setup automatic logging mechanism
    - _Requirements: 17.4, 17.5_

- [x] 3. Implementasi authentication system





  - [x] 3.1 Buat JWT utility functions


    - Implementasi generate token dan verify token
    - Setup refresh token mechanism
    - _Requirements: 1.5_
  
  - [x] 3.2 Buat authentication middleware


    - Implementasi middleware untuk verify JWT token
    - Setup error handling untuk expired/invalid tokens
    - _Requirements: 1.5, 17.2_
  
  - [x] 3.3 Buat role-based authorization middleware


    - Implementasi middleware untuk check user role
    - Setup role permissions (guest, member, admin)
    - _Requirements: 2.1-2.10, 3.1-3.5, 17.1, 17.2, 17.3_
  
  - [x] 3.4 Implementasi register endpoint


    - Buat POST /api/auth/register endpoint
    - Validasi input dan create user baru
    - _Requirements: 1.1_
  
  - [x] 3.5 Implementasi login endpoint


    - Buat POST /api/auth/login endpoint
    - Validasi credentials dan generate JWT token
    - _Requirements: 1.2, 1.4_
  
  - [x] 3.6 Implementasi logout endpoint


    - Buat POST /api/auth/logout endpoint
    - Clear session dan invalidate token
    - _Requirements: 11.2, 11.3, 11.4_

- [x] 4. Implementasi user endpoints






  - [x] 4.1 Buat GET /api/users/me endpoint

    - Return current user profile
    - _Requirements: 1.3, 1.4_
  

  - [x] 4.2 Buat PUT /api/users/me endpoint

    - Update user profile
    - Validasi input data
    - _Requirements: 1.4_

- [x] 5. Implementasi frontend authentication





  - [x] 5.1 Buat AuthContext dan provider


    - Implementasi context untuk manage auth state
    - Setup login, register, logout functions
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [x] 5.2 Buat useAuth custom hook


    - Implementasi hook untuk access auth context
    - _Requirements: 1.3, 1.4_
  
  - [x] 5.3 Buat ProtectedRoute component


    - Implementasi route guard berdasarkan role
    - Setup redirect ke login untuk unauthorized access
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 17.2_
  
  - [x] 5.4 Buat LoginForm component dan Login page


    - Implementasi form login dengan validasi
    - Integrate dengan AuthContext
    - _Requirements: 1.2, 1.4_
  
  - [x] 5.5 Buat RegisterForm component dan Register page


    - Implementasi form registrasi dengan validasi
    - Integrate dengan AuthContext
    - _Requirements: 1.1_

- [x] 6. Implementasi layout components






  - [x] 6.1 Buat Header component

    - Implementasi header dengan conditional rendering
    - Tampilkan Login/Daftar untuk Guest
    - Tampilkan nama user dan Logout untuk Member/Admin
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 11.1_
  

  - [x] 6.2 Buat Sidebar component

    - Implementasi sidebar dengan menu navigation
    - Setup role-based menu visibility
    - Grouping menu ke sections (Main, Account, Other, Admin)
    - _Requirements: 2.1-2.10, 5.1, 5.2, 5.3, 5.4, 5.5, 17.1, 17.3_
  
  - [x] 6.3 Buat Layout component


    - Combine Header dan Sidebar
    - Setup responsive layout
    - _Requirements: 5.1_
-

- [x] 7. Implementasi Dashboard




  - [x] 7.1 Buat Dashboard page component


    - Implementasi welcome banner dengan conditional message
    - _Requirements: 6.1, 6.5, 6.6_
  
  - [x] 7.2 Buat AlertSection component


    - Tampilkan section Perhatian dengan informasi peringatan
    - _Requirements: 6.2_
  
  - [x] 7.3 Buat SupportSection component


    - Tampilkan Customer Support & Security info
    - _Requirements: 6.3_
  
  - [x] 7.4 Buat UpdateSection component


    - Tampilkan section Update Terbaru
    - _Requirements: 6.4_
-

- [x] 8. Implementasi Transaction features



  - [x] 8.1 Buat GET /api/transactions endpoint


    - Return transactions untuk current user
    - Implement pagination
    - _Requirements: 7.1, 7.8_
  
  - [x] 8.2 Buat TransactionTable component


    - Implementasi table dengan columns sesuai requirements
    - Display user, tanggal, produk, jumlah, total, status
    - _Requirements: 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_
  
  - [x] 8.3 Buat TransactionHistory page


    - Integrate TransactionTable component
    - Setup protected route untuk Member only
    - _Requirements: 7.1, 7.8, 3.1_

-

- [x] 9. Implementasi Top Up features



  - [x] 9.1 Buat GET /api/topup/methods endpoint


    - Return available payment methods
    - _Requirements: 8.3_
  
  - [x] 9.2 Buat POST /api/topup endpoint

    - Process top up request
    - Validate amount dan payment method
    - _Requirements: 8.4_
  
  - [x] 9.3 Buat TopUpForm component


    - Implementasi form dengan nominal dan payment method selection
    - Handle form submission
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [x] 9.4 Buat TopUp page


    - Integrate TopUpForm component
    - Setup protected route untuk Member only
    - Display success notification
    - _Requirements: 8.1, 8.5, 3.2_
-

- [x] 10. Implementasi Claim Garansi features





  - [x] 10.1 Buat POST /api/claims endpoint

    - Process claim submission
    - Validate transaction eligibility
    - _Requirements: 9.4_
  

  - [x] 10.2 Buat GET /api/claims endpoint

    - Return user claims
    - _Requirements: 9.1_

  
  - [x] 10.3 Buat ClaimForm component

    - Implementasi form dengan transaction selection dan description
    - _Requirements: 9.1, 9.2, 9.3_
  

  - [x] 10.4 Buat ClaimGaransi page

    - Integrate ClaimForm component
    - Setup protected route untuk Member only
    - Display success notification
    - _Requirements: 9.1, 9.5, 3.3_

- [x] 11. Implementasi Tutorial features




  - [x] 11.1 Buat GET /api/tutorials endpoint


    - Return all tutorials
    - Implement search functionality
    - _Requirements: 10.1, 10.5_
  
  - [x] 11.2 Buat GET /api/tutorials/:id endpoint

    - Return tutorial detail
    - Increment view count
    - _Requirements: 10.4_
  
  - [x] 11.3 Buat TutorialList component


    - Display list of tutorials dengan title dan description
    - Implement search bar
    - _Requirements: 10.1, 10.2, 10.3, 10.5_
  
  - [x] 11.4 Buat TutorialDetail component


    - Display full tutorial content
    - _Requirements: 10.4_
  
  - [x] 11.5 Buat Tutorial page


    - Integrate TutorialList dan TutorialDetail
    - Setup protected route untuk Member only
    - _Requirements: 10.1, 3.4_
-

- [x] 12. Implementasi Admin User Management




  - [x] 12.1 Buat GET /api/admin/users endpoint


    - Return all users dengan filtering dan search
    - Implement pagination
    - _Requirements: 12.1, 12.2, 12.3_
  
  - [x] 12.2 Buat PUT /api/admin/users/:id endpoint

    - Update user details
    - _Requirements: 12.4, 12.5_
  
  - [x] 12.3 Buat PUT /api/admin/users/:id/balance endpoint

    - Update user balance
    - Log action ke audit log
    - _Requirements: 12.6_
  
  - [x] 12.4 Buat PUT /api/admin/users/:id/role endpoint

    - Update user role
    - Log action ke audit log
    - _Requirements: 12.5_
  
  - [x] 12.5 Buat DELETE /api/admin/users/:id endpoint

    - Delete user (soft delete)
    - Log action ke audit log
    - _Requirements: 12.7, 12.8_
  
  - [x] 12.6 Buat UserManagement page component


    - Implementasi table dengan user list
    - Add search dan filter functionality
    - Add edit, delete, dan view detail actions
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8_
-

- [x] 13. Implementasi Admin Transaction Management




  - [x] 13.1 Buat GET /api/admin/transactions endpoint


    - Return all transactions dengan filtering
    - Implement pagination
    - _Requirements: 13.1, 13.2, 13.3_
  
  - [x] 13.2 Buat PUT /api/admin/transactions/:id endpoint


    - Update transaction status
    - Log action ke audit log
    - _Requirements: 13.5_
  
  - [x] 13.3 Buat POST /api/admin/transactions/:id/refund endpoint


    - Process refund
    - Update user balance
    - Log action ke audit log
    - _Requirements: 13.6_
  
  - [x] 13.4 Buat GET /api/admin/transactions/export endpoint


    - Export transactions to CSV/Excel
    - _Requirements: 13.7_
  
  - [x] 13.5 Buat TransactionManagement page component


    - Implementasi table dengan transaction list
    - Add filter by status dan date
    - Add view detail, update status, dan refund actions
    - Add export button
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7_
-

- [x] 14. Implementasi Admin Claim Management



  - [x] 14.1 Buat GET /api/admin/claims endpoint


    - Return all claims dengan filtering
    - _Requirements: 14.1, 14.2_
  
  - [x] 14.2 Buat PUT /api/admin/claims/:id endpoint

    - Update claim status (approve/reject)
    - Add response note
    - Log action ke audit log
    - _Requirements: 14.4, 14.5, 14.6_
  
  - [x] 14.3 Buat POST /api/admin/claims/:id/resolve endpoint

    - Process approved claim
    - Update user balance untuk refund
    - _Requirements: 14.7_
  
  - [x] 14.4 Buat ClaimManagement page component


    - Implementasi table dengan claim list
    - Add filter by status
    - Add view detail, approve, reject actions
    - Add response note input
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7_
-

- [x] 15. Implementasi Admin Tutorial Management



  - [x] 15.1 Buat POST /api/admin/tutorials endpoint


    - Create new tutorial
    - Log action ke audit log
    - _Requirements: 15.2_
  
  - [x] 15.2 Buat PUT /api/admin/tutorials/:id endpoint

    - Update tutorial
    - Log action ke audit log
    - _Requirements: 15.3_
  
  - [x] 15.3 Buat DELETE /api/admin/tutorials/:id endpoint

    - Delete tutorial
    - Log action ke audit log
    - _Requirements: 15.4_
  
  - [x] 15.4 Buat TutorialManagement page component


    - Implementasi table dengan tutorial list
    - Add create, edit, delete actions
    - Display view statistics
    - Add category management
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6_
-

- [x] 16. Implementasi Admin Dashboard dan Statistics




  - [x] 16.1 Buat GET /api/admin/stats/overview endpoint


    - Return system overview statistics
    - _Requirements: 16.1, 16.2, 16.3, 16.4_
  
  - [x] 16.2 Buat GET /api/admin/stats/users endpoint


    - Return user growth statistics
    - _Requirements: 16.6_
  
  - [x] 16.3 Buat GET /api/admin/stats/transactions endpoint


    - Return transaction statistics per period
    - _Requirements: 16.5_
  
  - [x] 16.4 Buat AdminDashboard page component


    - Display statistics cards (users, transactions, revenue, claims)
    - Display charts untuk transactions dan user growth
    - Display recent transactions table
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7_
-

- [x] 17. Implementasi Admin System Settings




  - [x] 17.1 Buat GET /api/admin/settings endpoint


    - Return current system settings
    - _Requirements: 18.1_
  
  - [x] 17.2 Buat PUT /api/admin/settings endpoint

    - Update system settings
    - Log action ke audit log
    - _Requirements: 18.2, 18.3, 18.5_
  
  - [x] 17.3 Buat GET /api/admin/logs endpoint

    - Return system logs dan audit logs
    - _Requirements: 18.4_
  
  - [x] 17.4 Buat SystemSettings page component


    - Implementasi form untuk payment methods configuration
    - Add notification settings
    - Display system logs
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5_

- [x] 18. Implementasi remaining public pages










  - [x] 18.1 Buat AkunBM page

    - Display informasi layanan Akun BM
    - Accessible untuk Guest dan Member
    - _Requirements: 2.2_
  

  - [x] 18.2 Buat AkunPersonal page

    - Display informasi layanan Akun Personal
    - Accessible untuk Guest dan Member
    - _Requirements: 2.3_
  
  - [x] 18.3 Buat JasaVerifiedBM page


    - Display informasi layanan Jasa Verified BM
    - Accessible untuk Guest dan Member
    - _Requirements: 2.4_
  

  - [x] 18.4 Buat API page

    - Display API documentation
    - Accessible untuk Guest dan Member
    - _Requirements: 2.5_

- [x] 19. Implementasi error handling dan validation




  - [x] 19.1 Setup global error handler di backend


    - Implementasi centralized error handling middleware
    - Return standardized error responses
    - _Requirements: Semua requirements_
  
  - [x] 19.2 Setup form validation di frontend


    - Implementasi validation untuk semua forms
    - Display user-friendly error messages
    - _Requirements: 1.1, 1.2, 8.1, 9.1, 15.2_
  
  - [x] 19.3 Setup API error interceptor di frontend


    - Handle 401 unauthorized (redirect to login)
    - Handle 403 forbidden (show error message)
    - Handle network errors
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 17.2_
-

- [x] 20. Implementasi security features





  - [x] 20.1 Setup rate limiting untuk login endpoint

    - Limit 5 attempts per 15 minutes
    - _Requirements: 1.2_
  
  - [x] 20.2 Setup CORS configuration


    - Whitelist allowed origins
    - _Requirements: Semua requirements_
  
  - [x] 20.3 Setup input sanitization


    - Prevent XSS attacks
    - Prevent SQL injection
    - _Requirements: Semua requirements_
  
  - [x] 20.4 Setup HTTPS enforcement


    - Redirect HTTP to HTTPS di production
    - _Requirements: Semua requirements_



- [x] 21. Setup routing dan navigation



  - [x] 21.1 Configure React Router


    - Setup routes untuk semua pages
    - Setup nested routes untuk admin pages
    - _Requirements: 5.5_
  
  - [x] 21.2 Implement navigation guards


    - Protect member routes dari Guest
    - Protect admin routes dari Guest dan Member
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 17.2_
  
  - [x] 21.3 Setup redirect logic


    - Redirect after login based on role
    - Redirect after logout
    - _Requirements: 1.4, 11.3_

- [x] 22. Styling dan responsive design





  - [x] 22.1 Implement responsive layout


    - Mobile-first approach
    - Responsive sidebar (collapsible on mobile)
    - _Requirements: 5.1_
  
  - [x] 22.2 Style all components dengan Tailwind CSS


    - Consistent color scheme
    - Consistent spacing dan typography
    - _Requirements: Semua requirements_
  

  - [x] 22.3 Add loading states dan skeletons

    - Loading spinners untuk async operations
    - Skeleton screens untuk data fetching
    - _Requirements: Semua requirements_
  
  - [x] 22.4 Add toast notifications


    - Success notifications
    - Error notifications
    - Info notifications
    - _Requirements: 8.5, 9.5, 18.5_

- [x] 23. Database seeding dan initial data



  - [x] 23.1 Create database migration files


    - Setup migration untuk semua tables
    - _Requirements: Semua requirements_
  
  - [x] 23.2 Create seed data


    - Seed admin user
    - Seed sample members
    - Seed sample transactions
    - Seed sample tutorials
    - _Requirements: Semua requirements_
-

- [ ] 24. Testing

  - [x] 24.1 Write unit tests untuk backend services


    - Test auth service
    - Test user service
    - Test transaction service
    - _Requirements: Semua requirements_
  
  - [ ] 24.2 Write unit tests untuk frontend components
    - Test authentication components
    - Test protected routes
    - Test form validations
    - _Requirements: Semua requirements_
  
  - [ ] 24.3 Write integration tests untuk API endpoints
    - Test auth endpoints
    - Test user endpoints
    - Test admin endpoints
    - _Requirements: Semua requirements_
-

- [x] 25. Documentation




  - [x] 25.1 Write API documentation
    - Document all endpoints dengan examples
    - _Requirements: Semua requirements_

  

  - [x] 25.2 Write README
    - Setup instructions
    - Environment variables
    - Running the application
    - _Requirements: Semua requirements_

  

  - [x] 25.3 Write deployment guide

    - Production deployment steps
    - Environment configuration
    - _Requirements: Semua requirements_

- [x] 26. Implementasi Forgot Password & Reset Password dengan Supabase Auth

  - [x] 26.1 Fix useNotification hook usage di ForgotPassword dan ResetPassword pages
    - Ganti showSuccess/showError menjadi success/error
    - _Requirements: 19.2, 19.3, 19.10_

  - [x] 26.2 Tambahkan routes untuk forgot-password dan reset-password di App.tsx
    - Setup GuestRoute untuk forgot-password
    - Setup route untuk reset-password (accessible dengan valid token)
    - _Requirements: 19.1, 19.5_

  - [x] 26.3 Verifikasi integrasi Supabase Auth
    - Pastikan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY sudah dikonfigurasi
    - Test forgot password flow end-to-end
    - Test reset password flow dengan token validation
    - _Requirements: 19.3, 19.4, 19.6, 19.7, 19.8, 19.9, 19.11_
