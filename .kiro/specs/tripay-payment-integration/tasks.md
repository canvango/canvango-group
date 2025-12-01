# Implementation Plan - Tripay Payment Integration

## Task Overview

Implementation plan ini dibagi menjadi beberapa fase untuk memastikan integrasi Tripay berjalan incremental dan tidak merusak fitur yang sudah ada. Setiap task fokus pada coding activities dan terintegrasi dengan requirements & design yang sudah dibuat.

---

## Phase 1: Database & Core Infrastructure

- [x] 1. Setup database schema untuk Open Payment


  - Create migration file untuk tabel `open_payments`
  - Create migration file untuk tabel `open_payment_transactions`
  - Add indexes untuk performa query
  - Setup RLS policies untuk kedua tabel
  - Test migrations di development environment
  - _Requirements: 5.1, 5.7, 6.13, 15.17_

- [x] 2. Create Supabase Edge Function untuk Tripay callback handler


  - Create Edge Function di `supabase/functions/tripay-callback/index.ts`
  - Implement signature validation menggunakan HMAC-SHA256
  - Implement idempotency check untuk prevent double-processing
  - Implement callback processing logic (update transaction status)
  - Implement balance update logic (atomic transaction)
  - Add error handling dan logging
  - Deploy Edge Function ke Supabase
  - Test callback dengan mock data
  - _Requirements: 11.1-11.28_

---

## Phase 2: Service Layer Enhancement

- [x] 3. Enhance tripay.service.ts dengan signature generation functions


  - Implement `generateClosedPaymentSignature()` function
  - Implement `generateOpenPaymentSignature()` function
  - Implement `validateCallbackSignature()` function
  - Add unit tests untuk signature functions
  - _Requirements: 3.1-3.7, 4.1-4.8_

- [x] 4. Add Open Payment functions ke tripay.service.ts


  - Implement `createOpenPayment()` function
  - Implement `getOpenPaymentDetail()` function
  - Implement `getOpenPaymentTransactions()` function
  - Add error handling untuk Open Payment operations
  - _Requirements: 5.1-5.15, 6.1-6.15, 15.1-15.20_

- [x] 5. Add transaction detail functions ke tripay.service.ts


  - Implement `getTransactionDetail()` function (fetch from Tripay API)
  - Implement `quickCheckStatus()` function untuk polling
  - Implement `syncTransactionStatus()` function untuk admin
  - Add caching strategy untuk transaction details
  - _Requirements: 9.1-9.15, 10.1-10.10_

---

## Phase 3: API Routes (Vercel Serverless Functions)

- [x] 6. Create Vercel API route untuk payment channels sync


  - Create `api/tripay-channels.ts`
  - Implement GET endpoint untuk fetch channels dari Tripay
  - Add caching headers
  - Add error handling
  - _Requirements: 1.1-1.5_

- [x] 7. Create Vercel API route untuk Open Payment


  - Create `api/tripay-open-payment.ts`
  - Implement POST endpoint untuk create Open Payment
  - Implement GET endpoint untuk Open Payment detail
  - Implement GET endpoint untuk Open Payment transactions
  - Add authentication check
  - Add error handling
  - _Requirements: 5.1-5.15, 6.1-6.15, 15.1-15.20_

- [x] 8. Create Vercel API route untuk transaction detail


  - Create `api/tripay-transaction-detail.ts`
  - Implement GET endpoint dengan query parameter `reference`
  - Forward request ke Tripay API
  - Add authentication check
  - Add error handling
  - _Requirements: 9.1-9.15_

- [x] 9. Create Vercel API route untuk quick status check



  - Create `api/tripay-transaction-status.ts`
  - Implement GET endpoint untuk quick status check
  - Add polling optimization (lightweight response)
  - Add authentication check
  - _Requirements: 10.1-10.10_

---

## Phase 4: React Hooks Enhancement

- [x] 10. Add Open Payment hooks ke useTripay.ts


  - Implement `useCreateOpenPayment()` hook
  - Implement `useOpenPaymentDetail()` hook
  - Implement `useOpenPaymentTransactions()` hook
  - Add React Query configuration (caching, refetch)
  - Add error handling dengan useNotification
  - _Requirements: 5.1-5.15, 6.1-6.15, 15.1-15.20_

- [x] 11. Add transaction detail hooks ke useTripay.ts


  - Implement `useTransactionDetail()` hook
  - Implement `useQuickStatusCheck()` hook dengan polling
  - Add auto-stop polling when status is final (PAID/EXPIRED/FAILED)
  - _Requirements: 9.1-9.15, 10.1-10.10_

- [x] 12. Add admin hooks ke useTripay.ts


  - Implement `useAllTransactions()` hook untuk admin
  - Implement `useSyncTransactionStatus()` hook
  - Add filters support (status, payment method, date range)
  - Add pagination support
  - _Requirements: 13.1-13.5_

---

## Phase 5: UI Components - Payment Flow

- [x] 13. Create PaymentMethodSelector component


  - Create component di `src/features/payment/components/PaymentMethodSelector.tsx`
  - Implement payment channel grouping (Virtual Account, E-Wallet, QRIS, etc)
  - Implement fee calculation display per channel
  - Implement channel selection logic
  - Add loading state dan error handling
  - Style dengan Tailwind CSS sesuai design system
  - _Requirements: 1.1-1.5, 2.1-2.5_

- [x] 14. Create FeeCalculator component


  - Create component di `src/features/payment/components/FeeCalculator.tsx`
  - Display breakdown: base amount, flat fee, percentage fee, total
  - Implement real-time calculation saat amount berubah
  - Show warning jika amount tidak memenuhi min/max
  - Style dengan Tailwind CSS
  - _Requirements: 2.1-2.5_

- [x] 15. Create PaymentInstructions component


  - Create component di `src/features/payment/components/PaymentInstructions.tsx`
  - Implement tabbed interface untuk multiple instruction types
  - Display pay code dengan copy button
  - Display QR code jika tersedia
  - Implement countdown timer untuk expiration
  - Add auto-refresh status functionality
  - Style dengan Tailwind CSS
  - _Requirements: 12.1-12.5_

- [x] 16. Create TransactionDetailModal component


  - Create component di `src/features/payment/components/TransactionDetailModal.tsx`
  - Display full transaction information
  - Display payment instructions
  - Display order items list
  - Add refresh status button
  - Add copy reference button
  - Style dengan Tailwind CSS
  - _Requirements: 9.1-9.15_

---

## Phase 6: UI Components - Open Payment

- [x] 17. Create OpenPaymentCard component


  - Create component di `src/features/payment/components/OpenPaymentCard.tsx`
  - Display permanent pay code
  - Display QR code jika tersedia
  - Show status badge (Active/Expired)
  - Show expiration date
  - Show total amount received dan transaction count
  - Add "View History" button
  - Style dengan Tailwind CSS
  - _Requirements: 6.1-6.15, 15.1-15.20_

- [x] 18. Create OpenPaymentList page


  - Create page di `src/features/payment/pages/OpenPaymentList.tsx`
  - Display list of user's Open Payments
  - Implement filters (status, payment method)
  - Add "Create New" button
  - Integrate dengan useOpenPaymentDetail hook
  - Style dengan Tailwind CSS
  - _Requirements: 15.1-15.20_

- [x] 19. Create OpenPaymentTransactionHistory component



  - Create component di `src/features/payment/components/OpenPaymentTransactionHistory.tsx`
  - Display transaction history per Open Payment
  - Show amount, paid_at, status untuk setiap transaksi
  - Implement pagination
  - Add filters (date range, reference)
  - Style dengan Tailwind CSS
  - _Requirements: 15.1-15.20_

---

## Phase 7: UI Components - Admin

- [x] 20. Create AdminTransactionTable component


  - Create component di `src/features/admin/components/AdminTransactionTable.tsx`
  - Display all transactions dari semua users
  - Implement filters (status, payment method, user, date range)
  - Implement sortable columns
  - Implement pagination
  - Add "Sync Status" button per row
  - Add "View Detail" button per row
  - Style dengan Tailwind CSS sesuai admin design
  - _Requirements: 13.1-13.5_

- [x] 21. Create PaymentChannelManager component


  - Create component di `src/features/admin/components/PaymentChannelManager.tsx`
  - Display list of payment channels dari Tripay
  - Implement enable/disable toggle per channel
  - Implement drag-and-drop reordering
  - Add "Sync from Tripay" button
  - Display last sync timestamp
  - Display fee information per channel
  - Style dengan Tailwind CSS sesuai admin design
  - _Requirements: 1.1-1.5_

---

## Phase 8: Integration & Pages

- [x] 22. Integrate payment flow ke TopUp page



  - Update `src/features/member-area/pages/TopUp.tsx`
  - Replace manual payment dengan Tripay payment flow
  - Integrate PaymentMethodSelector component
  - Integrate FeeCalculator component
  - Integrate PaymentInstructions component
  - Add success/error handling
  - _Requirements: 7.1-7.15_

- [x] 23. Integrate payment flow ke Product Purchase


  - Update product purchase flow untuk menggunakan Tripay
  - Integrate PaymentMethodSelector untuk product payment
  - Calculate total dengan product price + fee
  - Create transaction dengan product_id
  - Handle callback untuk create purchase record
  - _Requirements: 7.1-7.15_

- [x] 24. Create Transaction History page enhancement


  - Update `src/features/member-area/pages/TransactionHistory.tsx`
  - Add filters (status, payment method, reference, merchant_ref)
  - Add pagination controls
  - Add "View Detail" button per transaction
  - Integrate TransactionDetailModal
  - Add auto-refresh untuk pending transactions
  - _Requirements: 8.1-8.12_

- [x] 25. Add Open Payment section ke member area

  - Create navigation menu item untuk Open Payment
  - Integrate OpenPaymentList page
  - Add route untuk Open Payment pages
  - _Requirements: 15.1-15.20_

- [x] 26. Integrate admin transaction management

  - Add menu item di admin sidebar
  - Create admin transaction management page
  - Integrate AdminTransactionTable component
  - Add export to CSV functionality
  - _Requirements: 13.1-13.5_

- [x] 27. Integrate payment channel management ke admin settings

  - Add payment channel section di admin settings
  - Integrate PaymentChannelManager component
  - Add sync functionality
  - _Requirements: 1.1-1.5_

---

## Phase 9: Error Handling & Logging

- [x] 28. Implement comprehensive error handling


  - Create TripayError class dengan error codes
  - Implement error mapping untuk user-friendly messages
  - Add error logging ke console dan database
  - Implement retry strategy untuk network errors
  - Add error boundaries di React components
  - _Requirements: 16.1-16.5_

- [x] 29. Add audit logging untuk callback events

  - Log semua callback events ke `audit_logs` table
  - Include merchant_ref, reference, status, timestamp, IP address
  - Add admin view untuk callback logs
  - _Requirements: 11.24, 16.1-16.5_

---

## Phase 10: Testing & Documentation

- [x]* 30. Write unit tests untuk service layer


  - Test signature generation functions
  - Test fee calculation functions
  - Test callback validation
  - Test error handling
  - _Requirements: All_

- [x]* 31. Write integration tests untuk payment flow


  - Test full payment creation flow
  - Test callback processing flow
  - Test balance update logic
  - Test idempotency
  - _Requirements: All_

- [x]* 32. Write component tests



  - Test PaymentMethodSelector
  - Test FeeCalculator
  - Test PaymentInstructions
  - Test TransactionDetailModal
  - _Requirements: All_

- [x] 33. Update environment variables documentation


  - Document required environment variables
  - Document Tripay configuration
  - Document callback URL setup
  - Add setup guide untuk development dan production
  - _Requirements: 14.1-14.5_

- [x] 34. Create user documentation



  - Write guide untuk payment flow
  - Write guide untuk Open Payment
  - Write FAQ untuk common issues
  - Add troubleshooting guide
  - _Requirements: All_

---

## Notes

- Tasks marked with `*` are optional (testing & documentation)
- Each task should be completed and tested before moving to next
- Always check existing functionality tidak rusak setelah implementasi
- Follow design system standards (typography, colors, spacing, border-radius)
- Use React Query untuk semua data fetching
- Use Supabase client untuk database operations
- Implement proper error handling di setiap layer

