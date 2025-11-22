# Implementation Plan - CORS Fix Comprehensive

## Overview

Implementasi solusi untuk menghilangkan masalah CORS dengan cara menghapus backend Express dari arsitektur aplikasi dan menggunakan 100% direct Supabase access.

## Tasks

- [x] 1. Audit dan Identifikasi Service yang Masih Menggunakan Backend Express





  - Scan semua file service untuk menemukan penggunaan `apiClient` atau backend API calls
  - Buat daftar service yang perlu dimigrasi
  - Identifikasi business logic yang perlu dipindahkan ke frontend
  - _Requirements: 1.1, 1.2_

- [x] 2. Refactor Warranty Service ke Direct Supabase





  - [x] 2.1 Update `fetchWarrantyClaims` untuk menggunakan direct Supabase


    - Hapus dependency ke `apiClient`
    - Implementasi query dengan Supabase client
    - Include relasi ke `purchases` dan `products` table
    - _Requirements: 1.2, 1.3_
  
  - [x] 2.2 Update `submitWarrantyClaim` untuk menggunakan direct Supabase


    - Pindahkan business logic validation ke frontend
    - Check warranty eligibility sebelum insert
    - Check warranty expiration
    - Check duplicate claims
    - Implementasi insert dengan Supabase client
    - _Requirements: 1.2, 1.3, 4.4_
  
  - [x] 2.3 Update `fetchEligibleAccounts` untuk menggunakan direct Supabase


    - Query purchases dengan filter warranty_expires_at
    - Include relasi ke products table
    - _Requirements: 1.2, 1.3_
  
  - [x] 2.4 Update `fetchWarrantyStats` untuk menggunakan direct Supabase


    - Implementasi aggregation query dengan Supabase
    - _Requirements: 1.2, 1.3_

- [x] 3. Refactor Transaction Service ke Direct Supabase





  - [x] 3.1 Update `getUserTransactions` untuk menggunakan direct Supabase


    - Implementasi pagination dengan Supabase range()
    - Implementasi filtering dengan Supabase eq()
    - Include relasi ke products table
    - Calculate pagination metadata
    - _Requirements: 1.2, 1.3_
  

  - [x] 3.2 Update `getRecentTransactions` untuk menggunakan direct Supabase

    - Query transactions dengan limit
    - Filter by status completed
    - Order by created_at descending
    - _Requirements: 1.2, 1.3_

- [x] 4. Refactor Top-up Service ke Direct Supabase (jika ada)






  - [x] 4.1 Audit topup.service.ts untuk melihat dependency ke backend

    - Identifikasi endpoint yang digunakan
    - Identifikasi business logic yang perlu dipindahkan
    - _Requirements: 1.1, 1.2_
  
  - [x] 4.2 Update top-up operations untuk menggunakan direct Supabase


    - Implementasi transaction record dengan Supabase
    - Implementasi balance update dengan Supabase
    - _Requirements: 1.2, 1.3_

- [x] 5. Implementasi Supabase RLS Policies





  - [x] 5.1 Create RLS policies untuk warranty_claims table


    - Enable RLS pada table
    - Policy: Users can view own warranty claims
    - Policy: Users can create warranty claims for own purchases
    - Policy: Admins can view all warranty claims
    - Policy: Admins can update warranty claim status
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [x] 5.2 Create RLS policies untuk transactions table


    - Enable RLS pada table
    - Policy: Users can view own transactions
    - Policy: Admins can view all transactions
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [x] 5.3 Create RLS policies untuk purchases table


    - Enable RLS pada table
    - Policy: Users can view own purchases
    - Policy: Admins can view all purchases
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [x] 5.4 Create RLS policies untuk products table


    - Enable RLS pada table
    - Policy: Everyone can view active products
    - Policy: Only admins can create/update/delete products
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [x] 5.5 Create RLS policies untuk users table


    - Enable RLS pada table
    - Policy: Users can view own profile
    - Policy: Users can update own profile
    - Policy: Admins can view all users
    - Policy: Admins can update user roles
    - _Requirements: 4.1, 4.2, 4.3_

- [x] 6. Implementasi Error Handling untuk Supabase Operations





  - [x] 6.1 Create centralized error handler function
    - Implementasi `handleSupabaseOperation` helper
    - Map Supabase error codes ke user-friendly messages
    - Add logging untuk development mode
    - _Requirements: 5.2, 5.3_
  
  - [x] 6.2 Update semua service untuk menggunakan error handler


    - Wrap Supabase operations dengan error handler
    - Ensure consistent error handling across services
    - _Requirements: 5.2, 5.3_
  
  - [x] 6.3 Implementasi error boundary di React components



    - Create ErrorBoundary component
    - Wrap main app dengan ErrorBoundary
    - Display user-friendly error messages
    - _Requirements: 5.3, 5.5_

- [x] 7. Update Vercel Configuration






  - [x] 7.1 Simplify vercel.json untuk static site

    - Remove `functions` configuration
    - Remove `/api` rewrites
    - Remove CORS headers (not needed for static site)
    - Keep SPA fallback rewrite
    - Keep security headers
    - _Requirements: 2.5, 3.1, 3.2, 3.4_
  

  - [x] 7.2 Update build command di vercel.json

    - Ensure hanya build frontend
    - Remove backend build steps
    - _Requirements: 2.1, 3.1_

- [x] 8. Simplify Environment Variables






  - [x] 8.1 Update .env file

    - Remove backend Express variables (PORT, NODE_ENV, JWT_SECRET, etc.)
    - Remove VITE_API_URL
    - Remove CORS_ALLOWED_ORIGINS
    - Keep only VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
    - _Requirements: 6.2, 6.3, 6.4, 6.5_
  

  - [x] 8.2 Update .env.example file

    - Remove backend variables
    - Update documentation
    - _Requirements: 6.2, 6.3_
  

  - [x] 8.3 Update Vercel environment variables

    - Remove backend variables dari Vercel dashboard
    - Ensure Supabase variables are set
    - _Requirements: 6.1, 6.4_

- [x] 9. Cleanup Backend Express Code





  - [x] 9.1 Delete server folder


    - Backup server folder ke branch terpisah (jika diperlukan)
    - Delete `server/` folder dari main branch
    - _Requirements: 2.2, 2.3, 7.1_
  
  - [x] 9.2 Delete API serverless function



    - Delete `api/index.js`
    - _Requirements: 2.2, 2.3, 7.1_
  
  - [x] 9.3 Delete production server file



    - Delete `server.js`
    - _Requirements: 2.2, 2.3, 7.1_
  
  - [x] 9.4 Update package.json


    - Remove backend dependencies (express, cors, helmet, etc.)
    - Remove backend scripts (build:server, start:server, etc.)
    - Keep only frontend dependencies
    - _Requirements: 7.5_
  
  - [x] 9.5 Delete api.ts client file



    - Delete `src/features/member-area/services/api.ts`
    - Ensure no service imports from this file
    - _Requirements: 7.1, 7.2_
-

- [x] 10. Write Unit Tests untuk Refactored Services



  - [x] 10.1 Write tests untuk warranty.service.ts


    - Test fetchWarrantyClaims
    - Test submitWarrantyClaim with validation
    - Test fetchEligibleAccounts
    - Test error handling
    - _Requirements: 8.1, 8.2_
  
  - [x] 10.2 Write tests untuk transaction.service.ts


    - Test getUserTransactions with pagination
    - Test getUserTransactions with filtering
    - Test getRecentTransactions
    - Test error handling
    - _Requirements: 8.1, 8.2_
-

- [x] 11. Write Integration Tests untuk Supabase RLS




  - [x] 11.1 Test RLS policies untuk warranty_claims


    - Test user can only see own claims
    - Test user cannot create claims for others
    - Test admin can see all claims
    - _Requirements: 8.1, 8.2_
  
  - [x] 11.2 Test RLS policies untuk transactions

    - Test user can only see own transactions
    - Test admin can see all transactions
    - _Requirements: 8.1, 8.2_
  
  - [x] 11.3 Test RLS policies untuk purchases

    - Test user can only see own purchases
    - Test admin can see all purchases
    - _Requirements: 8.1, 8.2_
-

- [x] 12. Write E2E Tests




  - [x] 12.1 Test all pages load without errors


    - Test dashboard
    - Test bm-accounts
    - Test personal-accounts
    - Test claim-garansi
    - Test transactions
    - Test top-up
    - _Requirements: 8.1, 8.3_
  

  - [x] 12.2 Test no requests to /api endpoint





    - Monitor network requests
    - Ensure all requests go to Supabase
    - _Requirements: 8.3_

  
  - [ ] 12.3 Test warranty claim submission flow









    - Fill form
    - Submit claim
    - Verify success message
    - Verify claim appears in list
    - _Requirements: 8.1, 8.2_


- [x] 13. Update Documentation





  - [x] 13.1 Update README.md

    - Document new architecture (Frontend + Supabase only)
    - Remove backend setup instructions
    - Update development setup
    - Update deployment instructions
    - _Requirements: 2.1, 3.1_
  
  - [x] 13.2 Create migration guide


    - Document changes from old to new architecture
    - Explain why backend was removed
    - Provide troubleshooting tips
    - _Requirements: 2.1_
  
  - [x] 13.3 Document Supabase RLS policies


    - List all RLS policies
    - Explain purpose of each policy
    - Provide examples
    - _Requirements: 4.1, 4.2_

- [x] 14. Deploy dan Verify






  - [x] 14.1 Deploy ke Vercel

    - Push changes ke main branch
    - Monitor Vercel build logs
    - Ensure build succeeds
    - _Requirements: 2.1, 3.1_
  

  - [x] 14.2 Verify no CORS errors

    - Open browser console
    - Navigate to all pages
    - Check for CORS errors
    - _Requirements: 2.5, 8.1_
  


  - [ ] 14.3 Verify all functionality works



    - Test warranty claim submission
    - Test transaction history
    - Test product listing
    - Test user authentication
    - _Requirements: 8.1, 8.2, 8.4_

  
  - [ ] 14.4 Monitor Supabase logs
    - Check for errors
    - Check for unauthorized access attempts
    - Verify RLS policies are working

    - _Requirements: 4.1, 5.1, 5.2_
  
  - [ ] 14.5 Performance testing
    - Measure page load times
    - Measure API response times
    - Compare with previous architecture
    - _Requirements: 8.1_

