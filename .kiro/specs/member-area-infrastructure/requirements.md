# Member Area Infrastructure - Requirements Document

## Introduction

This document outlines the requirements for implementing the infrastructure components needed to integrate the 9 migrated member area pages into the main Canvango Group application. This includes layout system, routing, authentication, API services, and supporting utilities.

## Context

**Current State**: 9 member area pages have been migrated to `canvango-app/frontend/src/pages/` with mock data and standalone implementations.

**Goal**: Create the infrastructure to connect these pages into a functional, production-ready member area with real API integration.

## Glossary

- **Layout System**: Header, Sidebar, Footer, and wrapper components that provide consistent navigation
- **Routing**: React Router configuration for client-side navigation
- **API Service Layer**: Axios-based services for backend communication
- **Custom Hooks**: React hooks for data fetching and state management
- **Shared Components**: Reusable UI components used across pages
- **Type Definitions**: TypeScript interfaces and types for type safety
- **Utility Functions**: Helper functions for formatting, validation, and common operations

## Requirements

### Requirement 1: Layout System Implementation

**User Story:** As a member, I want consistent navigation and layout across all pages, so that I can easily access different sections of the member area.

#### Acceptance Criteria

1. WHEN the member area loads, THE System SHALL display a fixed header with Canvango Group logo and user profile button
2. WHEN the member area loads, THE System SHALL display a collapsible sidebar with organized menu sections
3. WHEN a user clicks a menu item, THE System SHALL highlight the active item and navigate to the corresponding page
4. WHEN the member area loads on mobile, THE System SHALL collapse the sidebar into a hamburger menu
5. WHEN the member area loads, THE System SHALL display a WhatsApp floating button for customer support
6. WHEN the member area loads, THE System SHALL display a footer with copyright information
7. WHEN a user clicks the WhatsApp button, THE System SHALL open WhatsApp chat with predefined message

**Components Required:**
- Header.tsx
- Sidebar.tsx
- Footer.tsx
- WhatsAppButton.tsx
- MemberAreaLayout.tsx

**Reference Files:**
- `src/features/member-area/components/layout/Header.tsx`
- `src/features/member-area/components/layout/Sidebar.tsx`
- `src/features/member-area/components/layout/Footer.tsx`
- `src/features/member-area/components/layout/WhatsAppButton.tsx`
- `src/features/member-area/components/MemberAreaLayout.tsx`

---

### Requirement 2: Routing Configuration

**User Story:** As a member, I want to navigate between different pages using URLs, so that I can bookmark and share specific pages.

#### Acceptance Criteria

1. WHEN a user navigates to `/member/dashboard`, THE System SHALL display the Dashboard page
2. WHEN a user navigates to `/member/riwayat-transaksi`, THE System SHALL display the Transaction History page
3. WHEN a user navigates to `/member/top-up`, THE System SHALL display the Top Up page
4. WHEN a user navigates to `/member/akun-bm`, THE System SHALL display the BM Accounts page
5. WHEN a user navigates to `/member/akun-personal`, THE System SHALL display the Personal Accounts page
6. WHEN a user navigates to `/member/jasa-verified-bm`, THE System SHALL display the Verified BM Service page
7. WHEN a user navigates to `/member/claim-garansi`, THE System SHALL display the Claim Warranty page
8. WHEN a user navigates to `/member/api`, THE System SHALL display the API Documentation page
9. WHEN a user navigates to `/member/tutorial`, THE System SHALL display the Tutorial Center page
10. WHEN a user navigates to a member area page without authentication, THE System SHALL redirect to the login page
11. WHEN pages load, THE System SHALL use lazy loading to optimize initial bundle size
12. WHEN a user uses browser back/forward buttons, THE System SHALL navigate correctly

**Files to Update:**
- `canvango-app/frontend/src/App.tsx` or router configuration file

**Reference Files:**
- `src/features/member-area/routes.tsx`

---

### Requirement 3: Authentication System Integration

**User Story:** As a member, I want secure access to the member area, so that my account and data are protected.

#### Acceptance Criteria

1. WHEN a user accesses a protected route without authentication, THE System SHALL redirect to the login page
2. WHEN a user logs in successfully, THE System SHALL store the authentication token securely
3. WHEN a user's token expires, THE System SHALL automatically refresh the token or redirect to login
4. WHEN a user logs out, THE System SHALL clear all authentication data and redirect to the login page
5. WHEN the AuthContext loads, THE System SHALL provide user information to all child components
6. WHEN API requests are made, THE System SHALL automatically include the authentication token
7. WHEN a 401 response is received, THE System SHALL handle it appropriately (logout or refresh)

**Components Required:**
- AuthContext.tsx (verify/update existing)
- ProtectedRoute.tsx
- auth.service.ts

**Reference Files:**
- `src/features/member-area/contexts/AuthContext.tsx`
- `src/features/member-area/components/ProtectedRoute.tsx`

---

### Requirement 4: API Service Layer Implementation

**User Story:** As a developer, I want a centralized API service layer, so that all backend communication is consistent and maintainable.

#### Acceptance Criteria

1. WHEN the application initializes, THE System SHALL configure an Axios instance with base URL and default headers
2. WHEN an API request is made, THE System SHALL automatically include the authentication token in headers
3. WHEN an API request fails with 401, THE System SHALL trigger authentication refresh or logout
4. WHEN an API request fails with network error, THE System SHALL provide appropriate error messages
5. WHEN API responses are received, THE System SHALL parse and type them correctly
6. WHEN API requests are made, THE System SHALL handle loading states appropriately
7. WHEN API errors occur, THE System SHALL provide user-friendly error messages

**Services Required:**
- api.ts (Axios client configuration)
- products.service.ts
- transactions.service.ts
- topup.service.ts
- warranty.service.ts
- verified-bm.service.ts
- user.service.ts
- api-keys.service.ts
- tutorials.service.ts

**Reference Files:**
- `src/features/member-area/services/api.ts`
- `src/features/member-area/services/*.service.ts`

---

### Requirement 5: Custom Hooks Implementation

**User Story:** As a developer, I want reusable hooks for data fetching, so that data management is consistent across components.

#### Acceptance Criteria

1. WHEN a component needs product data, THE System SHALL provide useProducts hook with filtering and pagination
2. WHEN a component needs transaction data, THE System SHALL provide useTransactions hook with filtering
3. WHEN a component needs to purchase a product, THE System SHALL provide usePurchase mutation hook
4. WHEN a component needs to top up balance, THE System SHALL provide useTopUp mutation hook
5. WHEN a component needs to claim warranty, THE System SHALL provide useWarrantyClaim mutation hook
6. WHEN a component needs to order verified BM, THE System SHALL provide useVerifiedBMOrder mutation hook
7. WHEN a component needs API key data, THE System SHALL provide useAPIKeys hook
8. WHEN a component needs tutorial data, THE System SHALL provide useTutorials hook
9. WHEN mutations succeed, THE System SHALL invalidate relevant queries to refresh data
10. WHEN hooks are used, THE System SHALL provide loading, error, and data states

**Hooks Required:**
- useProducts.ts
- useTransactions.ts
- usePurchase.ts
- useTopUp.ts
- useWarrantyClaim.ts
- useVerifiedBMOrder.ts
- useAPIKeys.ts
- useTutorials.ts

**Reference Files:**
- `src/features/member-area/hooks/*.ts`

---

### Requirement 6: Shared Components Library

**User Story:** As a developer, I want reusable UI components, so that the interface is consistent and development is efficient.

#### Acceptance Criteria

1. WHEN displaying tabular data, THE System SHALL provide DataTable component with sorting and pagination
2. WHEN pagination is needed, THE System SHALL provide Pagination component with page size options
3. WHEN displaying notifications, THE System SHALL provide Toast component with different variants
4. WHEN confirmation is needed, THE System SHALL provide ConfirmDialog component
5. WHEN errors occur, THE System SHALL provide ErrorBoundary component to catch and display errors
6. WHEN loading data, THE System SHALL provide SkeletonLoader component for better UX
7. WHEN displaying tooltips, THE System SHALL provide Tooltip component
8. WHEN forms are used, THE System SHALL provide FormField component with validation
9. WHEN dropdowns are needed, THE System SHALL provide Select component with search
10. WHEN checkboxes are needed, THE System SHALL provide Checkbox component
11. WHEN radio buttons are needed, THE System SHALL provide RadioGroup component

**Components Required:**
- DataTable.tsx
- Pagination.tsx
- Toast/ToastContainer.tsx
- ConfirmDialog.tsx
- ErrorBoundary.tsx
- SkeletonLoader.tsx
- Tooltip.tsx
- FormField.tsx
- Select.tsx (advanced)
- Checkbox.tsx
- RadioGroup.tsx

**Reference Files:**
- `src/shared/components/*.tsx`

---

### Requirement 7: Type Definitions

**User Story:** As a developer, I want comprehensive TypeScript types, so that the codebase is type-safe and maintainable.

#### Acceptance Criteria

1. WHEN working with user data, THE System SHALL provide User, UserStats, and authentication types
2. WHEN working with products, THE System SHALL provide Product, ProductCategory, ProductType types
3. WHEN working with transactions, THE System SHALL provide Transaction, TransactionStatus, Account types
4. WHEN working with warranty, THE System SHALL provide WarrantyClaim, ClaimStatus, ClaimReason types
5. WHEN working with API, THE System SHALL provide APIKey, APIEndpoint, APIStats types
6. WHEN working with tutorials, THE System SHALL provide Tutorial, TutorialCategory types
7. WHEN working with common data, THE System SHALL provide common utility types

**Type Files Required:**
- user.types.ts
- product.types.ts
- transaction.types.ts
- warranty.types.ts
- api.types.ts
- tutorial.types.ts
- common.types.ts

**Reference Files:**
- `src/features/member-area/types/*.ts`

---

### Requirement 8: Utility Functions

**User Story:** As a developer, I want utility functions for common operations, so that code is DRY and consistent.

#### Acceptance Criteria

1. WHEN formatting currency, THE System SHALL provide formatCurrency function for IDR
2. WHEN formatting dates, THE System SHALL provide formatDate and formatDateTime functions
3. WHEN formatting relative time, THE System SHALL provide formatRelativeTime function
4. WHEN validating URLs, THE System SHALL provide isValidUrl function
5. WHEN validating emails, THE System SHALL provide isValidEmail function
6. WHEN validating amounts, THE System SHALL provide isValidAmount function
7. WHEN truncating text, THE System SHALL provide truncateText function
8. WHEN copying to clipboard, THE System SHALL provide copyToClipboard function
9. WHEN debouncing input, THE System SHALL provide debounce function
10. WHEN generating IDs, THE System SHALL provide generateId function

**Utility Files Required:**
- formatters.ts
- validators.ts
- helpers.ts
- constants.ts

**Reference Files:**
- `src/features/member-area/utils/*.ts`

---

### Requirement 9: Error Handling System

**User Story:** As a user, I want clear error messages and graceful error handling, so that I understand what went wrong and how to fix it.

#### Acceptance Criteria

1. WHEN an error occurs in a component, THE System SHALL catch it with ErrorBoundary
2. WHEN an API error occurs, THE System SHALL display user-friendly error messages
3. WHEN a success action completes, THE System SHALL display success toast notification
4. WHEN an error action occurs, THE System SHALL display error toast notification
5. WHEN displaying toasts, THE System SHALL auto-dismiss after appropriate duration
6. WHEN multiple toasts are shown, THE System SHALL stack them appropriately
7. WHEN errors are logged, THE System SHALL include relevant context for debugging

**Components Required:**
- ErrorBoundary.tsx
- Toast.tsx
- ToastContainer.tsx
- ToastContext.tsx
- errors.ts (error types and utilities)

**Reference Files:**
- `src/shared/components/ErrorBoundary.tsx`
- `src/shared/components/Toast*.tsx`
- `src/shared/contexts/ToastContext.tsx`
- `src/shared/utils/errors.ts`

---

### Requirement 10: Purchase Flow Implementation

**User Story:** As a member, I want to purchase products easily, so that I can acquire accounts for my business needs.

#### Acceptance Criteria

1. WHEN a user clicks "Buy" on a product, THE System SHALL display a purchase modal
2. WHEN the purchase modal opens, THE System SHALL display product details and price
3. WHEN a user selects quantity, THE System SHALL calculate and display total price
4. WHEN a user confirms purchase, THE System SHALL display a confirmation dialog
5. WHEN a user confirms in the dialog, THE System SHALL process the purchase via API
6. WHEN purchase is processing, THE System SHALL display loading state and disable buttons
7. WHEN purchase succeeds, THE System SHALL display success message with transaction details
8. WHEN purchase fails, THE System SHALL display error message with retry option
9. WHEN purchase succeeds, THE System SHALL update user balance and transaction history
10. WHEN purchase modal closes, THE System SHALL reset form state

**Components Required:**
- PurchaseModal.tsx
- PurchaseConfirmation.tsx
- usePurchase.ts (hook)

**Reference Files:**
- `src/features/member-area/hooks/usePurchase.ts`

---

### Requirement 11: UIContext for Global State

**User Story:** As a developer, I want global UI state management, so that UI state is consistent across components.

#### Acceptance Criteria

1. WHEN the application loads, THE System SHALL provide UIContext to all components
2. WHEN sidebar state changes, THE System SHALL update all components using the context
3. WHEN toast notifications are triggered, THE System SHALL manage them through UIContext
4. WHEN theme changes (if implemented), THE System SHALL update through UIContext
5. WHEN mobile menu is toggled, THE System SHALL update sidebar state in UIContext

**Components Required:**
- UIContext.tsx
- useUI.ts (hook)

**Reference Files:**
- `src/features/member-area/contexts/UIContext.tsx`

---

### Requirement 12: Performance Optimization

**User Story:** As a user, I want fast page loads and smooth interactions, so that I can work efficiently.

#### Acceptance Criteria

1. WHEN pages load, THE System SHALL use code splitting to reduce initial bundle size
2. WHEN pages load, THE System SHALL lazy load route components
3. WHEN API data is fetched, THE System SHALL cache responses appropriately
4. WHEN images are displayed, THE System SHALL lazy load off-screen images
5. WHEN search input changes, THE System SHALL debounce API calls
6. WHEN critical resources are needed, THE System SHALL preload them
7. WHEN fonts are loaded, THE System SHALL prevent layout shift

**Configuration Required:**
- React Query configuration
- Lazy loading setup
- Image optimization
- Resource preloading

**Reference Files:**
- `src/shared/config/react-query.config.ts`
- `src/shared/utils/image-optimization.ts`

---

### Requirement 13: Accessibility Compliance

**User Story:** As a user with accessibility needs, I want the member area to be fully accessible, so that I can use all features regardless of my abilities.

#### Acceptance Criteria

1. WHEN navigating with keyboard, THE System SHALL provide visible focus indicators
2. WHEN using screen readers, THE System SHALL provide appropriate ARIA labels
3. WHEN displaying dynamic content, THE System SHALL announce changes to screen readers
4. WHEN displaying modals, THE System SHALL trap focus within the modal
5. WHEN displaying color-coded information, THE System SHALL provide non-color indicators
6. WHEN displaying images, THE System SHALL provide descriptive alt text
7. WHEN displaying forms, THE System SHALL associate labels with inputs
8. WHEN displaying interactive elements, THE System SHALL ensure minimum contrast ratios

**Utilities Required:**
- Keyboard navigation utilities
- ARIA utilities
- Focus management utilities

**Reference Files:**
- `src/shared/utils/aria.ts`
- `src/shared/utils/focus-management.ts`
- `src/shared/hooks/useKeyboardNavigation.ts`

---

### Requirement 14: Security Implementation

**User Story:** As a member, I want my data and account to be secure, so that I can trust the platform.

#### Acceptance Criteria

1. WHEN making state-changing requests, THE System SHALL include CSRF tokens
2. WHEN displaying user-generated content, THE System SHALL sanitize input to prevent XSS
3. WHEN approaching API rate limits, THE System SHALL display warnings
4. WHEN rate limits are exceeded, THE System SHALL handle errors gracefully
5. WHEN storing sensitive data, THE System SHALL use secure storage methods
6. WHEN logging out, THE System SHALL clear all sensitive data

**Utilities Required:**
- CSRF protection
- XSS prevention
- Rate limiting indicators

**Reference Files:**
- `src/shared/utils/xss-prevention.ts`
- `src/shared/utils/rate-limit.ts`

---

### Requirement 15: Analytics and Tracking

**User Story:** As a product owner, I want to track user behavior, so that I can improve the platform.

#### Acceptance Criteria

1. WHEN a user navigates to a page, THE System SHALL track page views
2. WHEN a user clicks important buttons, THE System SHALL track interactions
3. WHEN a user completes a purchase, THE System SHALL track conversion events
4. WHEN a user submits forms, THE System SHALL track form submissions
5. WHEN errors occur, THE System SHALL track error events
6. WHEN tracking events, THE System SHALL include relevant context

**Utilities Required:**
- Analytics utilities
- Event tracking

**Reference Files:**
- `src/shared/utils/analytics.ts`
- `src/shared/hooks/useAnalytics.ts`

---

## Non-Functional Requirements

### Performance
- Initial page load < 2 seconds on 3G connection
- Time to interactive < 3 seconds
- Lighthouse performance score > 90

### Accessibility
- WCAG 2.1 Level AA compliance
- Keyboard navigation support
- Screen reader compatibility

### Security
- HTTPS only
- Secure token storage
- XSS and CSRF protection
- Rate limiting

### Browser Support
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

### Device Support
- Desktop (1920x1080, 1366x768)
- Tablet (768x1024, 1024x768)
- Mobile (375x667, 414x896)

---

## Dependencies

### Required Packages
- react-router-dom (v6+)
- axios
- @tanstack/react-query (v4+)
- @heroicons/react (v2+)
- react-hook-form
- zod
- date-fns (for date formatting)

### Optional Packages
- @sentry/react (error tracking)
- mixpanel-browser (analytics)

---

## Success Criteria

### Phase 1 Complete When:
- [ ] All layout components implemented
- [ ] Routing configured and working
- [ ] Authentication integrated
- [ ] User can navigate between all 9 pages
- [ ] Sidebar highlights active page

### Phase 2 Complete When:
- [ ] All API services implemented
- [ ] Custom hooks working
- [ ] Purchase flow functional
- [ ] Data fetched from API (not mock)
- [ ] Error handling working

### Phase 3 Complete When:
- [ ] All shared components available
- [ ] Type definitions complete
- [ ] Utility functions implemented
- [ ] Toast notifications working
- [ ] Confirmation dialogs working

### Production Ready When:
- [ ] All requirements met
- [ ] Performance optimized
- [ ] Accessibility compliant
- [ ] Security measures implemented
- [ ] No critical bugs
- [ ] Documentation complete

---

## References

- Original Spec: `.kiro/specs/member-area-content-framework/`
- Migrated Pages: `canvango-app/frontend/src/pages/`
- Reference Implementation: `src/features/member-area/`
- Gap Analysis: `SPEC_GAP_ANALYSIS.md`
- Priority Guide: `NEXT_STEPS_PRIORITY.md`
