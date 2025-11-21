# Implementation Tasks - Fix Blank Screen & Restore Guest Access

## Overview
Tasks untuk memperbaiki blank screen dan mengembalikan fitur guest access yang hilang setelah project consolidation.

## Tasks

- [ ] 1. Remove duplicate context providers
  - Remove AuthProvider, UIProvider, ToastProvider from MemberArea.tsx
  - Verify all providers exist in main.tsx
  - Keep only QueryClientProvider in MemberArea.tsx if needed
  - Test that contexts are accessible in all components
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 2. Update MemberAreaLayout for guest access
  - [ ] 2.1 Remove null return for unauthenticated users
    - Remove `if (!user) return null` logic
    - _Requirements: 2.1, 6.1_
  
  - [ ] 2.2 Create guest user object
    - Define guestUser constant with default values
    - Create displayUser variable (user || guestUser)
    - Create isGuest boolean (!user)
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [ ] 2.3 Pass isGuest prop to child components
    - Update Header component call with isGuest prop
    - Update Sidebar component call with isGuest prop
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [ ] 2.4 Ensure layout always renders
    - Verify layout renders for both guest and authenticated users
    - Test with and without authentication
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 3. Update Header component for guest mode
  - [ ] 3.1 Add isGuest prop to Header interface
    - Update HeaderProps interface
    - _Requirements: 3.1, 3.2_
  
  - [ ] 3.2 Implement conditional rendering
    - Show Login and Register buttons for guests
    - Show profile dropdown for authenticated users
    - _Requirements: 3.1, 3.2_
  
  - [ ] 3.3 Add navigation handlers
    - Add useNavigate hook
    - Implement onClick handlers for Login button
    - Implement onClick handlers for Register button
    - _Requirements: 3.3, 3.4_
  
  - [ ] 3.4 Style buttons appropriately
    - Apply Tailwind classes for guest buttons
    - Ensure responsive design for mobile
    - _Requirements: 3.5_

- [ ] 4. Update Sidebar component for guest mode
  - [ ] 4.1 Add isGuest prop to Sidebar interface
    - Update SidebarProps interface
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [ ] 4.2 Create guest menu structure
    - Define guestMenuStructure array
    - Include: Dashboard, Akun BM, Akun Personal, API, Tutorial
    - _Requirements: 4.2, 4.5_
  
  - [ ] 4.3 Create authenticated menu structure
    - Define authenticatedMenuStructure array
    - Include all menu items with protected pages
    - _Requirements: 4.3_
  
  - [ ] 4.4 Implement menu filtering
    - Use isGuest to select appropriate menu structure
    - Render menu items based on selected structure
    - _Requirements: 4.1, 4.2, 4.3, 4.5_
  
  - [ ] 4.5 Update user profile card
    - Hide balance display for guests (show Rp 0)
    - Show appropriate username
    - _Requirements: 4.1_

- [ ] 5. Restructure routing in App.tsx
  - [ ] 5.1 Move auth routes to root level
    - Move /login route outside MemberArea
    - Move /register route outside MemberArea
    - Wrap with GuestRoute component
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  
  - [ ] 5.2 Remove ProtectedRoute from public pages
    - Remove ProtectedRoute from /dashboard
    - Remove ProtectedRoute from /akun-bm
    - Remove ProtectedRoute from /akun-personal
    - Remove ProtectedRoute from /api
    - Remove ProtectedRoute from /tutorial
    - _Requirements: 2.4, 5.5_
  
  - [ ] 5.3 Keep ProtectedRoute on protected pages
    - Verify ProtectedRoute on /riwayat-transaksi
    - Verify ProtectedRoute on /top-up
    - Verify ProtectedRoute on /jasa-verified-bm
    - Verify ProtectedRoute on /claim-garansi
    - _Requirements: 2.5, 5.5_
  
  - [ ] 5.4 Update root redirect
    - Set root path (/) to redirect to /dashboard
    - Remove redirect to /login for unauthenticated users at root
    - _Requirements: 5.3_

- [ ] 6. Test guest user flow
  - [ ] 6.1 Test guest browsing
    - Access app without login
    - Verify layout renders (no blank screen)
    - Verify guest menu shows correct items
    - Verify Login/Register buttons visible
    - _Requirements: 7.1, 7.2, 8.1_
  
  - [ ] 6.2 Test public page access
    - Navigate to /dashboard as guest
    - Navigate to /akun-bm as guest
    - Navigate to /akun-personal as guest
    - Navigate to /api as guest
    - Navigate to /tutorial as guest
    - _Requirements: 8.1, 8.2_
  
  - [ ] 6.3 Test protected page redirect
    - Try to access /riwayat-transaksi as guest
    - Try to access /top-up as guest
    - Try to access /jasa-verified-bm as guest
    - Try to access /claim-garansi as guest
    - Verify redirect to /login with return URL
    - _Requirements: 8.4_

- [ ] 7. Test authenticated user flow
  - [ ] 7.1 Test login flow
    - Login with valid credentials
    - Verify redirect to dashboard or intended page
    - Verify full menu appears
    - Verify profile dropdown shows
    - _Requirements: 7.3, 8.3_
  
  - [ ] 7.2 Test authenticated navigation
    - Access all public pages
    - Access all protected pages
    - Verify no redirects
    - _Requirements: 7.2, 8.3_
  
  - [ ] 7.3 Test logout flow
    - Click logout from profile dropdown
    - Verify redirect to guest state
    - Verify guest menu appears
    - Verify Login/Register buttons show
    - _Requirements: 7.4, 8.3_

- [ ] 8. Test edge cases and error handling
  - [ ] 8.1 Test navigation edge cases
    - Test browser back/forward buttons
    - Test direct URL access
    - Test invalid routes
    - _Requirements: 7.2_
  
  - [ ] 8.2 Test responsive design
    - Test on mobile viewport
    - Test on tablet viewport
    - Test on desktop viewport
    - Verify sidebar collapse on mobile
    - _Requirements: 3.5_
  
  - [ ] 8.3 Test error scenarios
    - Test with network errors
    - Test with API errors
    - Verify error messages display
    - Verify no blank screens on errors
    - _Requirements: 7.5_

- [ ] 9. Verify no duplicate providers
  - Check main.tsx has all providers
  - Check MemberArea.tsx has no duplicate providers
  - Test context access in nested components
  - Verify no console warnings about multiple providers
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 10. Final integration testing
  - [ ] 10.1 Complete guest journey
    - Start as guest → Browse products → Click buy → Redirect to login → Login → Complete purchase
    - _Requirements: All requirements_
  
  - [ ] 10.2 Complete authenticated journey
    - Login → Browse all pages → Make transaction → Logout → Return to guest
    - _Requirements: All requirements_
  
  - [ ] 10.3 Verify all acceptance criteria
    - Review all requirements
    - Check each acceptance criterion
    - Document any issues
    - _Requirements: All requirements_

## Notes

- Test each task thoroughly before moving to next
- Verify no blank screens at any point
- Ensure smooth transitions between guest and authenticated states
- Keep security in mind - protected pages must remain protected
- Maintain existing functionality for authenticated users
- Follow existing code patterns and conventions

## Success Criteria

- [ ] No blank screen for any user state
- [ ] Guest users can browse public pages
- [ ] Guest users see Login/Register buttons
- [ ] Guest users see limited sidebar menu
- [ ] Protected pages redirect to login
- [ ] Authenticated users see full menu
- [ ] Login redirects back to intended page
- [ ] Logout returns to guest state
- [ ] No duplicate context providers
- [ ] All tests passing
