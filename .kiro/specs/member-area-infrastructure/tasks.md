# Member Area Infrastructure - Implementation Tasks

## Task Overview

This document breaks down the implementation into actionable tasks, organized by priority and dependencies.

## Task List

### 🔴 PHASE 1: Core Infrastructure (Critical - Week 1)

#### Task 1: Create Layout Components (2 days)

**Priority**: CRITICAL
**Dependencies**: None
**Estimated Time**: 16 hours

**Subtasks**:

- [ ] 1.1 Create Header Component (4 hours)
  - Location: `canvango-app/frontend/src/components/layout/Header.tsx`
  - Reference: `src/features/member-area/components/layout/Header.tsx`
  - Features:
    - Fixed position header
    - Canvango Group logo
    - User profile button with dropdown
    - Responsive design
  - Acceptance: Header displays correctly on all screen sizes

- [ ] 1.2 Create Sidebar Component (6 hours)
  - Location: `canvango-app/frontend/src/components/layout/Sidebar.tsx`
  - Reference: `src/features/member-area/components/layout/Sidebar.tsx`
  - Features:
    - User profile card with balance
    - 3 menu sections (MENU UTAMA, AKUN & LAYANAN, LAINNYA)
    - Active state highlighting
    - Collapsible for mobile
    - Icons from @heroicons/react
  - Acceptance: Sidebar navigates correctly and highlights active page

- [ ] 1.3 Create Footer Component (1 hour)
  - Location: `canvango-app/frontend/src/components/layout/Footer.tsx`
  - Reference: `src/features/member-area/components/layout/Footer.tsx`
  - Features:
    - Copyright text with dynamic year
    - Responsive styling
  - Acceptance: Footer displays correctly

- [ ] 1.4 Create WhatsApp Button (2 hours)
  - Location: `canvango-app/frontend/src/components/layout/WhatsAppButton.tsx`
  - Reference: `src/features/member-area/components/layout/WhatsAppButton.tsx`
  - Features:
    - Fixed bottom-right position
    - WhatsApp green background
    - Click opens WhatsApp chat
    - Hover animation
  - Acceptance: Button opens WhatsApp with correct number

- [ ] 1.5 Create MemberAreaLayout (3 hours)
  - Location: `canvango-app/frontend/src/components/layout/MemberAreaLayout.tsx`
  - Reference: `src/features/member-area/components/MemberAreaLayout.tsx`
  - Features:
    - Integrates Header, Sidebar, Footer, WhatsApp Button
    - Responsive layout management
    - Outlet for child routes
  - Acceptance: Layout wraps all pages correctly

**Deliverable**: Complete layout system with navigation

---

#### Task 2: Configure Routing (1 day)

**Priority**: CRITICAL
**Dependencies**: Task 1
**Estimated Time**: 8 hours

**Subtasks**:

- [ ] 2.1 Setup React Router (2 hours)
  - Location: `canvango-app/frontend/src/App.tsx`
  - Install: `npm install react-router-dom`
  - Features:
    - BrowserRouter setup
    - Route configuration
    - Nested routes with MemberAreaLayout
  - Acceptance: Basic routing works

- [ ] 2.2 Configure Member Area Routes (3 hours)
  - Add routes for all 9 pages:
    - /member/dashboard
    - /member/riwayat-transaksi
    - /member/top-up
    - /member/akun-bm
    - /member/akun-personal
    - /member/jasa-verified-bm
    - /member/claim-garansi
    - /member/api
    - /member/tutorial
  - Acceptance: All pages accessible via URL

- [ ] 2.3 Implement Lazy Loading (2 hours)
  - Use React.lazy() for all page components
  - Add Suspense boundaries with loading fallback
  - Acceptance: Pages load on demand

- [ ] 2.4 Add Protected Routes (1 hour)
  - Wrap member routes with ProtectedRoute
  - Redirect to login if not authenticated
  - Acceptance: Unauthenticated users redirected

**Deliverable**: Full routing configuration with lazy loading

---

#### Task 3: Setup Authentication (1 day)

**Priority**: CRITICAL
**Dependencies**: None
**Estimated Time**: 8 hours

**Subtasks**:

- [ ] 3.1 Verify/Update AuthContext (3 hours)
  - Location: `canvango-app/frontend/src/contexts/AuthContext.tsx`
  - Reference: `src/features/member-area/contexts/AuthContext.tsx`
  - Features:
    - User state management
    - Login/logout methods
    - Token storage (localStorage or httpOnly cookie)
    - Token refresh logic
  - Acceptance: Auth state persists across page reloads

- [ ] 3.2 Create ProtectedRoute Component (2 hours)
  - Location: `canvango-app/frontend/src/components/ProtectedRoute.tsx`
  - Reference: `src/features/member-area/components/ProtectedRoute.tsx`
  - Features:
    - Check authentication status
    - Redirect to login if not authenticated
    - Support role-based access (optional)
  - Acceptance: Protected routes require authentication

- [ ] 3.3 Create Auth Service (3 hours)
  - Location: `canvango-app/frontend/src/services/auth.service.ts`
  - Features:
    - login(credentials)
    - logout()
    - refreshToken()
    - getCurrentUser()
  - Acceptance: Auth service methods work correctly

**Deliverable**: Working authentication system

---

#### Task 4: Create API Service Layer (2 days)

**Priority**: CRITICAL
**Dependencies**: Task 3
**Estimated Time**: 16 hours

**Subtasks**:

- [ ] 4.1 Configure Axios Client (3 hours)
  - Location: `canvango-app/frontend/src/services/api.ts`
  - Reference: `src/features/member-area/services/api.ts`
  - Install: `npm install axios`
  - Features:
    - Base URL configuration
    - Request interceptor (add auth token)
    - Response interceptor (handle errors)
    - Token refresh logic
  - Acceptance: API client configured and tested


- [ ] 4.2 Create Products Service (2 hours)
  - Location: `canvango-app/frontend/src/services/products.service.ts`
  - Reference: `src/features/member-area/services/products.service.ts`
  - Functions:
    - fetchProducts(filters)
    - fetchProductById(id)
    - purchaseProduct(productId, quantity)
  - Acceptance: Products can be fetched and purchased

- [ ] 4.3 Create Transactions Service (2 hours)
  - Location: `canvango-app/frontend/src/services/transactions.service.ts`
  - Reference: `src/features/member-area/services/transactions.service.ts`
  - Functions:
    - fetchTransactions(filters)
    - fetchTransactionById(id)
    - getTransactionAccounts(id)
  - Acceptance: Transactions can be fetched

- [ ] 4.4 Create Top Up Service (1.5 hours)
  - Location: `canvango-app/frontend/src/services/topup.service.ts`
  - Functions:
    - processTopUp(data)
    - fetchPaymentMethods()
    - fetchTopUpHistory()
  - Acceptance: Top up can be processed

- [ ] 4.5 Create Warranty Service (1.5 hours)
  - Location: `canvango-app/frontend/src/services/warranty.service.ts`
  - Reference: `src/features/member-area/services/warranty.service.ts`
  - Functions:
    - fetchWarrantyClaims()
    - submitWarrantyClaim(data)
    - fetchClaimById(id)
  - Acceptance: Warranty claims can be submitted

- [ ] 4.6 Create Verified BM Service (1.5 hours)
  - Location: `canvango-app/frontend/src/services/verified-bm.service.ts`
  - Reference: `src/features/member-area/services/verified-bm.service.ts`
  - Functions:
    - fetchVerifiedBMOrders()
    - submitVerifiedBMOrder(data)
    - fetchVerifiedBMStats()
  - Acceptance: Verified BM orders can be submitted

- [ ] 4.7 Create User Service (1.5 hours)
  - Location: `canvango-app/frontend/src/services/user.service.ts`
  - Reference: `src/features/member-area/services/user.service.ts`
  - Functions:
    - fetchUserProfile()
    - fetchUserStats()
    - updateUserProfile(data)
  - Acceptance: User data can be fetched and updated

- [ ] 4.8 Create API Keys Service (1 hour)
  - Location: `canvango-app/frontend/src/services/api-keys.service.ts`
  - Reference: `src/features/member-area/services/api-keys.service.ts`
  - Functions:
    - fetchAPIKey()
    - generateAPIKey()
  - Acceptance: API keys can be generated

- [ ] 4.9 Create Tutorials Service (1 hour)
  - Location: `canvango-app/frontend/src/services/tutorials.service.ts`
  - Reference: `src/features/member-area/services/tutorials.service.ts`
  - Functions:
    - fetchTutorials(filters)
    - fetchTutorialBySlug(slug)
  - Acceptance: Tutorials can be fetched

- [ ] 4.10 Create Service Index (1 hour)
  - Location: `canvango-app/frontend/src/services/index.ts`
  - Export all services
  - Acceptance: Services can be imported easily

**Deliverable**: Complete API service layer

---

#### Task 5: Implement Purchase Flow (2 days)

**Priority**: CRITICAL
**Dependencies**: Task 4
**Estimated Time**: 16 hours

**Subtasks**:

- [ ] 5.1 Create PurchaseModal Component (6 hours)
  - Location: `canvango-app/frontend/src/components/purchase/PurchaseModal.tsx`
  - Features:
    - Display product details
    - Quantity selector
    - Total price calculation
    - Form validation
    - Loading state
  - Acceptance: Modal displays product info correctly

- [ ] 5.2 Create PurchaseConfirmation Component (3 hours)
  - Location: `canvango-app/frontend/src/components/purchase/PurchaseConfirmation.tsx`
  - Features:
    - Confirmation dialog
    - Display total amount
    - Cancel and confirm buttons
  - Acceptance: Confirmation works before purchase

- [ ] 5.3 Create usePurchase Hook (4 hours)
  - Location: `canvango-app/frontend/src/hooks/usePurchase.ts`
  - Reference: `src/features/member-area/hooks/usePurchase.ts`
  - Features:
    - Purchase mutation
    - Loading state
    - Error handling
    - Success callback
    - Query invalidation
  - Acceptance: Purchase flow works end-to-end

- [ ] 5.4 Integrate Purchase Flow into Pages (3 hours)
  - Update AkunBM.tsx and AkunPersonal.tsx
  - Add "Buy" button handlers
  - Show PurchaseModal on click
  - Handle success/error states
  - Acceptance: Users can purchase from product pages

**Deliverable**: Working purchase flow

---

### 🟡 PHASE 2: Essential Features (High Priority - Week 2)

#### Task 6: Create Custom Hooks (2 days)

**Priority**: HIGH
**Dependencies**: Task 4
**Estimated Time**: 16 hours

**Subtasks**:

- [ ] 6.1 Create useProducts Hook (2 hours)
  - Location: `canvango-app/frontend/src/hooks/useProducts.ts`
  - Reference: `src/features/member-area/hooks/useProducts.ts`
  - Features:
    - Fetch products with filters
    - Pagination support
    - Loading and error states
  - Acceptance: Products hook works in pages

- [ ] 6.2 Create useTransactions Hook (2 hours)
  - Location: `canvango-app/frontend/src/hooks/useTransactions.ts`
  - Reference: `src/features/member-area/hooks/useTransactions.ts`
  - Features:
    - Fetch transactions with filters
    - Pagination support
    - Type filtering (account/topup)
  - Acceptance: Transactions hook works

- [ ] 6.3 Create useTopUp Hook (2 hours)
  - Location: `canvango-app/frontend/src/hooks/useTopUp.ts`
  - Reference: `src/features/member-area/hooks/useTopUp.ts`
  - Features:
    - Top up mutation
    - Payment method selection
    - Balance update
  - Acceptance: Top up hook works

- [ ] 6.4 Create useWarrantyClaim Hook (2 hours)
  - Location: `canvango-app/frontend/src/hooks/useWarrantyClaim.ts`
  - Reference: `src/features/member-area/hooks/useWarranty.ts`
  - Features:
    - Claim submission mutation
    - Fetch claims
    - Status tracking
  - Acceptance: Warranty claim hook works

- [ ] 6.5 Create useVerifiedBMOrder Hook (2 hours)
  - Location: `canvango-app/frontend/src/hooks/useVerifiedBMOrder.ts`
  - Reference: `src/features/member-area/hooks/useVerifiedBM.ts`
  - Features:
    - Order submission mutation
    - Fetch orders
    - Stats fetching
  - Acceptance: Verified BM hook works

- [ ] 6.6 Create useAPIKeys Hook (1 hour)
  - Location: `canvango-app/frontend/src/hooks/useAPIKeys.ts`
  - Reference: `src/features/member-area/hooks/useAPIKeys.ts`
  - Features:
    - Fetch API key
    - Generate new key
  - Acceptance: API keys hook works

- [ ] 6.7 Create useTutorials Hook (1 hour)
  - Location: `canvango-app/frontend/src/hooks/useTutorials.ts`
  - Reference: `src/features/member-area/hooks/useTutorials.ts`
  - Features:
    - Fetch tutorials with filters
    - Category filtering
    - Search functionality
  - Acceptance: Tutorials hook works

- [ ] 6.8 Create useUser Hook (2 hours)
  - Location: `canvango-app/frontend/src/hooks/useUser.ts`
  - Features:
    - Fetch user profile
    - Fetch user stats
    - Update profile mutation
  - Acceptance: User hook works

- [ ] 6.9 Create Hooks Index (1 hour)
  - Location: `canvango-app/frontend/src/hooks/index.ts`
  - Export all hooks
  - Acceptance: Hooks can be imported easily

- [ ] 6.10 Replace Mock Data in Pages (1 hour)
  - Update all 9 pages to use hooks instead of mock data
  - Remove mock data constants
  - Test data fetching
  - Acceptance: All pages use real API data

**Deliverable**: Complete custom hooks library

---

#### Task 7: Create Shared Components (3 days)

**Priority**: HIGH
**Dependencies**: None
**Estimated Time**: 24 hours

**Subtasks**:

- [ ] 7.1 Create DataTable Component (4 hours)
  - Location: `canvango-app/frontend/src/components/shared/DataTable.tsx`
  - Reference: `src/shared/components/DataTable.tsx`
  - Features:
    - Column configuration
    - Sorting
    - Custom cell rendering
    - Responsive
  - Acceptance: DataTable works with sample data

- [ ] 7.2 Create Pagination Component (2 hours)
  - Location: `canvango-app/frontend/src/components/shared/Pagination.tsx`
  - Reference: `src/shared/components/Pagination.tsx`
  - Features:
    - Page navigation
    - Page size selector
    - Total items display
  - Acceptance: Pagination works

- [ ] 7.3 Create Toast System (4 hours)
  - Location: `canvango-app/frontend/src/components/shared/Toast/`
  - Reference: `src/shared/components/Toast*.tsx`
  - Components:
    - Toast.tsx
    - ToastContainer.tsx
    - ToastContext.tsx
  - Features:
    - Success, error, warning, info variants
    - Auto-dismiss
    - Stack multiple toasts
  - Acceptance: Toast notifications work

- [ ] 7.4 Create ConfirmDialog Component (3 hours)
  - Location: `canvango-app/frontend/src/components/shared/ConfirmDialog.tsx`
  - Reference: `src/shared/components/ConfirmDialog.tsx`
  - Features:
    - Title and message
    - Cancel and confirm buttons
    - Variants (danger, warning, info)
    - Async confirmation
  - Acceptance: Confirmation dialogs work

- [ ] 7.5 Create ErrorBoundary Component (2 hours)
  - Location: `canvango-app/frontend/src/components/shared/ErrorBoundary.tsx`
  - Reference: `src/shared/components/ErrorBoundary.tsx`
  - Features:
    - Catch React errors
    - Fallback UI
    - Error reporting
  - Acceptance: Errors caught and displayed

- [ ] 7.6 Create Enhanced SkeletonLoader (2 hours)
  - Location: `canvango-app/frontend/src/components/shared/SkeletonLoader.tsx`
  - Reference: `src/shared/components/SkeletonLoader.tsx`
  - Features:
    - Card skeleton
    - Table skeleton
    - Text skeleton
    - Custom shapes
  - Acceptance: Skeletons display correctly

- [ ] 7.7 Create Tooltip Component (2 hours)
  - Location: `canvango-app/frontend/src/components/shared/Tooltip.tsx`
  - Reference: `src/shared/components/Tooltip.tsx`
  - Features:
    - Hover and focus trigger
    - Positioning
    - Accessible
  - Acceptance: Tooltips work

- [ ] 7.8 Create FormField Component (2 hours)
  - Location: `canvango-app/frontend/src/components/shared/FormField.tsx`
  - Reference: `src/shared/components/FormField.tsx`
  - Features:
    - Label and input wrapper
    - Error message display
    - Helper text
  - Acceptance: FormField works with validation

- [ ] 7.9 Create Advanced Select Component (3 hours)
  - Location: `canvango-app/frontend/src/components/shared/Select.tsx`
  - Reference: `src/shared/components/SelectDropdown.tsx`
  - Features:
    - Search functionality
    - Custom option rendering
    - Keyboard navigation
    - Accessible
  - Acceptance: Select works with search

**Deliverable**: Complete shared components library

---

#### Task 8: Create Type Definitions (1 day)

**Priority**: HIGH
**Dependencies**: None
**Estimated Time**: 8 hours

**Subtasks**:

- [ ] 8.1 Create User Types (1 hour)
  - Location: `canvango-app/frontend/src/types/user.types.ts`
  - Reference: `src/features/member-area/types/`
  - Types:
    - User interface
    - UserStats interface
    - AuthCredentials interface
    - UserRole enum
  - Acceptance: User types defined

- [ ] 8.2 Create Product Types (1.5 hours)
  - Location: `canvango-app/frontend/src/types/product.types.ts`
  - Reference: `src/features/member-area/types/product.ts`
  - Types:
    - Product interface
    - ProductCategory enum
    - ProductType enum
    - ProductFilters interface
  - Acceptance: Product types defined

- [ ] 8.3 Create Transaction Types (1.5 hours)
  - Location: `canvango-app/frontend/src/types/transaction.types.ts`
  - Types:
    - Transaction interface
    - TransactionStatus enum
    - TransactionType enum
    - Account interface
  - Acceptance: Transaction types defined

- [ ] 8.4 Create Warranty Types (1 hour)
  - Location: `canvango-app/frontend/src/types/warranty.types.ts`
  - Reference: `src/features/member-area/types/`
  - Types:
    - WarrantyClaim interface
    - ClaimStatus enum
    - ClaimReason enum
  - Acceptance: Warranty types defined

- [ ] 8.5 Create API Types (1 hour)
  - Location: `canvango-app/frontend/src/types/api.types.ts`
  - Types:
    - APIKey interface
    - APIEndpoint interface
    - APIStats interface
    - APIResponse<T> generic
  - Acceptance: API types defined

- [ ] 8.6 Create Tutorial Types (0.5 hour)
  - Location: `canvango-app/frontend/src/types/tutorial.types.ts`
  - Types:
    - Tutorial interface
    - TutorialCategory enum
  - Acceptance: Tutorial types defined

- [ ] 8.7 Create Common Types (1 hour)
  - Location: `canvango-app/frontend/src/types/common.types.ts`
  - Types:
    - PaginationParams
    - PaginationResponse<T>
    - FilterParams
    - SortParams
  - Acceptance: Common types defined

- [ ] 8.8 Create Types Index (0.5 hour)
  - Location: `canvango-app/frontend/src/types/index.ts`
  - Export all types
  - Acceptance: Types can be imported easily

**Deliverable**: Complete type definitions

---

#### Task 9: Create Utility Functions (1 day)

**Priority**: HIGH
**Dependencies**: None
**Estimated Time**: 8 hours

**Subtasks**:

- [ ] 9.1 Create Formatters (2 hours)
  - Location: `canvango-app/frontend/src/utils/formatters.ts`
  - Reference: `src/features/member-area/utils/formatters.ts`
  - Install: `npm install date-fns`
  - Functions:
    - formatCurrency(amount, currency = 'IDR')
    - formatDate(date, format)
    - formatDateTime(date)
    - formatRelativeTime(date)
    - formatNumber(number)
  - Acceptance: Formatters work correctly

- [ ] 9.2 Create Validators (2 hours)
  - Location: `canvango-app/frontend/src/utils/validators.ts`
  - Functions:
    - isValidUrl(url)
    - isValidEmail(email)
    - isValidPhone(phone)
    - isValidAmount(amount, min, max)
  - Acceptance: Validators work correctly

- [ ] 9.3 Create Helpers (2 hours)
  - Location: `canvango-app/frontend/src/utils/helpers.ts`
  - Reference: `src/features/member-area/utils/helpers.ts`
  - Functions:
    - truncateText(text, length)
    - copyToClipboard(text)
    - debounce(fn, delay)
    - generateId()
    - sleep(ms)
  - Acceptance: Helpers work correctly

- [ ] 9.4 Create Constants (1 hour)
  - Location: `canvango-app/frontend/src/utils/constants.ts`
  - Constants:
    - API_BASE_URL
    - STATUS_COLORS
    - ICON_MAPPINGS
    - PAYMENT_METHODS
    - ROUTES
  - Acceptance: Constants defined

- [ ] 9.5 Create Utils Index (1 hour)
  - Location: `canvango-app/frontend/src/utils/index.ts`
  - Export all utilities
  - Acceptance: Utils can be imported easily

**Deliverable**: Complete utility functions

---

#### Task 10: Implement Error Handling (1 day)

**Priority**: HIGH
**Dependencies**: Task 7.3, 7.5
**Estimated Time**: 8 hours

**Subtasks**:

- [ ] 10.1 Create Error Types (2 hours)
  - Location: `canvango-app/frontend/src/utils/errors.ts`
  - Reference: `src/shared/utils/errors.ts`
  - Classes:
    - AppError class
    - ErrorType enum
    - Error factory functions
  - Acceptance: Error types defined

- [ ] 10.2 Integrate ErrorBoundary (2 hours)
  - Wrap App with ErrorBoundary
  - Add error logging
  - Test error catching
  - Acceptance: Errors caught globally

- [ ] 10.3 Integrate Toast System (2 hours)
  - Wrap App with ToastProvider
  - Create useToast hook
  - Test toast notifications
  - Acceptance: Toasts work globally

- [ ] 10.4 Add Error Handling to Services (2 hours)
  - Update API client error interceptor
  - Map API errors to user-friendly messages
  - Show toast on errors
  - Acceptance: API errors handled gracefully

**Deliverable**: Complete error handling system

---

#### Task 11: Create UIContext (0.5 day)

**Priority**: HIGH
**Dependencies**: None
**Estimated Time**: 4 hours

**Subtasks**:

- [ ] 11.1 Create UIContext (2 hours)
  - Location: `canvango-app/frontend/src/contexts/UIContext.tsx`
  - Reference: `src/features/member-area/contexts/UIContext.tsx`
  - State:
    - sidebarOpen
    - theme (optional)
  - Methods:
    - toggleSidebar()
    - setTheme()
  - Acceptance: UIContext works

- [ ] 11.2 Integrate UIContext (2 hours)
  - Wrap App with UIProvider
  - Update Sidebar to use UIContext
  - Update Header to use UIContext
  - Test sidebar toggle
  - Acceptance: Sidebar toggle works

**Deliverable**: Working UIContext

---

### 🟢 PHASE 3: Enhancement & Polish (Medium Priority - Week 3)

#### Task 12: Performance Optimization (2 days)

**Priority**: MEDIUM
**Dependencies**: All previous tasks
**Estimated Time**: 16 hours

**Subtasks**:

- [ ] 12.1 Setup React Query (3 hours)
  - Install: `npm install @tanstack/react-query`
  - Location: `canvango-app/frontend/src/config/react-query.ts`
  - Reference: `src/shared/config/react-query.config.ts`
  - Configure:
    - Query client
    - Cache times
    - Stale times
    - Retry logic
  - Acceptance: React Query configured

- [ ] 12.2 Migrate Hooks to React Query (4 hours)
  - Update all custom hooks to use React Query
  - Replace useState with useQuery/useMutation
  - Test data fetching
  - Acceptance: All hooks use React Query

- [ ] 12.3 Implement Code Splitting (2 hours)
  - Verify lazy loading works
  - Add loading fallbacks
  - Test bundle sizes
  - Acceptance: Bundle size optimized

- [ ] 12.4 Optimize Images (2 hours)
  - Add lazy loading to images
  - Compress images
  - Use appropriate formats
  - Acceptance: Images optimized

- [ ] 12.5 Add Resource Preloading (2 hours)
  - Preload fonts
  - Preload critical CSS
  - Prefetch next pages
  - Acceptance: Critical resources preloaded

- [ ] 12.6 Performance Testing (3 hours)
  - Run Lighthouse audits
  - Measure load times
  - Optimize bottlenecks
  - Acceptance: Performance score > 90

**Deliverable**: Optimized performance

---

#### Task 13: Accessibility Enhancement (2 days)

**Priority**: MEDIUM
**Dependencies**: All previous tasks
**Estimated Time**: 16 hours

**Subtasks**:

- [ ] 13.1 Add Keyboard Navigation (4 hours)
  - Ensure all interactive elements keyboard accessible
  - Add skip links
  - Test tab order
  - Acceptance: Full keyboard navigation

- [ ] 13.2 Add ARIA Labels (3 hours)
  - Add aria-label to all components
  - Add aria-live regions
  - Add role attributes
  - Acceptance: Screen reader compatible

- [ ] 13.3 Verify Color Contrast (2 hours)
  - Check all text contrast ratios
  - Fix low contrast issues
  - Test with contrast tools
  - Acceptance: WCAG AA compliant

- [ ] 13.4 Add Focus Management (3 hours)
  - Implement focus trap in modals
  - Return focus on close
  - Manage focus on navigation
  - Acceptance: Focus managed correctly

- [ ] 13.5 Accessibility Testing (4 hours)
  - Test with screen readers
  - Test keyboard-only navigation
  - Run automated accessibility tests
  - Fix issues
  - Acceptance: Accessibility compliant

**Deliverable**: Accessible application

---

#### Task 14: Security Implementation (1 day)

**Priority**: MEDIUM
**Dependencies**: Task 4
**Estimated Time**: 8 hours

**Subtasks**:

- [ ] 14.1 Implement CSRF Protection (2 hours)
  - Add CSRF token to requests
  - Validate tokens on server
  - Acceptance: CSRF protected

- [ ] 14.2 Implement XSS Prevention (2 hours)
  - Sanitize user input
  - Use React's built-in protection
  - Avoid dangerouslySetInnerHTML
  - Acceptance: XSS prevented

- [ ] 14.3 Add Rate Limiting Indicators (2 hours)
  - Show API rate limit status
  - Display warnings
  - Handle rate limit errors
  - Acceptance: Rate limits handled

- [ ] 14.4 Security Testing (2 hours)
  - Test authentication flows
  - Test authorization
  - Test input validation
  - Acceptance: Security verified

**Deliverable**: Secure application

---

#### Task 15: Analytics Integration (1 day)

**Priority**: MEDIUM
**Dependencies**: None
**Estimated Time**: 8 hours

**Subtasks**:

- [ ] 15.1 Setup Analytics (2 hours)
  - Choose analytics provider (Google Analytics, Mixpanel, etc.)
  - Install SDK
  - Configure tracking
  - Acceptance: Analytics configured

- [ ] 15.2 Implement Page View Tracking (2 hours)
  - Track page navigation
  - Include user context
  - Test tracking
  - Acceptance: Page views tracked

- [ ] 15.3 Implement Event Tracking (3 hours)
  - Track button clicks
  - Track form submissions
  - Track purchases
  - Track errors
  - Acceptance: Events tracked

- [ ] 15.4 Test Analytics (1 hour)
  - Verify events in dashboard
  - Test different scenarios
  - Acceptance: Analytics working

**Deliverable**: Analytics tracking

---

### 🔵 PHASE 4: Testing & Documentation (Low Priority - Week 4)

#### Task 16: Testing (5 days)

**Priority**: LOW
**Dependencies**: All previous tasks
**Estimated Time**: 40 hours

**Subtasks**:

- [ ] 16.1 Write Unit Tests (16 hours)
  - Test utility functions
  - Test custom hooks
  - Test components
  - Acceptance: 80% code coverage

- [ ] 16.2 Write Integration Tests (12 hours)
  - Test purchase flow
  - Test top-up flow
  - Test warranty claim flow
  - Acceptance: Critical flows tested

- [ ] 16.3 E2E Testing (8 hours)
  - Setup Playwright or Cypress
  - Write E2E tests for critical paths
  - Run tests
  - Acceptance: E2E tests passing

- [ ] 16.4 Cross-Browser Testing (4 hours)
  - Test on Chrome, Firefox, Safari, Edge
  - Fix browser-specific issues
  - Acceptance: Works on all browsers

**Deliverable**: Tested application

---

#### Task 17: Documentation (2 days)

**Priority**: LOW
**Dependencies**: All previous tasks
**Estimated Time**: 16 hours

**Subtasks**:

- [ ] 17.1 Add JSDoc Comments (8 hours)
  - Document all components
  - Document all hooks
  - Document all services
  - Acceptance: All code documented

- [ ] 17.2 Create README (4 hours)
  - Document folder structure
  - Add setup instructions
  - Add development guidelines
  - Acceptance: README complete

- [ ] 17.3 Create API Documentation (4 hours)
  - Document all API endpoints
  - Document request/response types
  - Add examples
  - Acceptance: API documented

**Deliverable**: Complete documentation

---

## Summary

### Total Estimated Time

| Phase | Tasks | Days | Hours |
|-------|-------|------|-------|
| Phase 1 (Critical) | 1-5 | 8 | 64 |
| Phase 2 (High) | 6-11 | 10.5 | 84 |
| Phase 3 (Medium) | 12-15 | 6 | 48 |
| Phase 4 (Low) | 16-17 | 7 | 56 |
| **TOTAL** | **17** | **31.5** | **252** |

### Dependencies Graph

```
Task 1 (Layout) → Task 2 (Routing)
Task 3 (Auth) → Task 4 (API Services)
Task 4 → Task 5 (Purchase Flow)
Task 4 → Task 6 (Custom Hooks)
Task 7 (Shared Components) → Task 10 (Error Handling)
All → Task 12 (Performance)
All → Task 13 (Accessibility)
All → Task 16 (Testing)
All → Task 17 (Documentation)
```

### Success Criteria

**Phase 1 Complete**:
- [ ] Layout system working
- [ ] Routing configured
- [ ] Authentication working
- [ ] API services created
- [ ] Purchase flow functional

**Phase 2 Complete**:
- [ ] Custom hooks working
- [ ] Shared components available
- [ ] Types defined
- [ ] Utilities created
- [ ] Error handling working

**Phase 3 Complete**:
- [ ] Performance optimized
- [ ] Accessibility compliant
- [ ] Security implemented
- [ ] Analytics tracking

**Production Ready**:
- [ ] All phases complete
- [ ] No critical bugs
- [ ] Performance metrics met
- [ ] Accessibility verified
- [ ] Security tested

---

**Document Version**: 1.0
**Last Updated**: Current Session
**Status**: Ready for Implementation
