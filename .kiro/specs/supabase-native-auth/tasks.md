# Implementation Plan - Supabase Native Auth Migration

## Overview

Implementasi migrasi dari custom JWT claims ke Supabase native authentication. Tasks diorganisir dalam 4 fase: Database Migration, Frontend Core Updates, Role Detection, dan Testing & Cleanup.

---

## Phase 1: Database Migration

- [x] 1. Audit and prepare database






- [x] 1.1 Query all RLS policies that use JWT claims

  - Run SQL query to find policies using `auth.jwt()` or `user_role`
  - Document all affected tables and policies
  - Create backup of current policy definitions
  - _Requirements: 2.3, 4.1_

- [x] 1.2 Create performance indexes


  - Add composite index `idx_users_id_role` on users(id, role)
  - Verify index creation with EXPLAIN ANALYZE
  - Measure baseline query performance
  - _Requirements: 4.4, 4.5_

- [x] 1.3 Remove custom JWT hook function


  - Drop `custom_access_token_hook` function from database
  - Remove hook configuration from Supabase Dashboard (Auth > Hooks)
  - Verify function is removed with pg_proc query
  - Test that new logins don't have `user_role` in JWT claims
  - _Requirements: 2.2, 2.3_

- [x] 1.4 Update RLS policies to use database queries


  - Update users table policies to use `(SELECT role FROM users WHERE id = auth.uid())`
  - Update products table policies
  - Update transactions table policies
  - Update warranty_claims table policies
  - Update all other tables with role-based policies
  - Verify no policies use `auth.jwt()` anymore
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 1.5 Create rollback migration script


  - Write SQL script to restore old RLS policies
  - Write SQL script to recreate JWT hook
  - Document rollback procedure
  - _Requirements: 6.2_

---

## Phase 2: Frontend Core Updates

- [x] 2. Simplify auth service




- [x] 2.1 Update login function


  - Remove custom JWT logic from `auth.service.ts`
  - Ensure login only uses `supabase.auth.signInWithPassword`
  - Keep username-to-email conversion logic
  - Fetch user profile (including role) from database after login
  - Return tokens and user data without custom claims
  - _Requirements: 2.3, 2.4, 3.1, 3.2_

- [x] 2.2 Update getCurrentUser function


  - Modify to always query role from database
  - Remove any role caching logic
  - Ensure function queries `users` table with `auth.uid()`
  - Handle errors gracefully with fallback to 'member' role
  - _Requirements: 1.2, 2.1_

- [x] 2.3 Update register function


  - Ensure registration doesn't rely on JWT claims
  - Verify user profile is created with default 'member' role
  - Test that new users can login immediately
  - _Requirements: 2.3, 3.1_

- [x] 2.4 Update logout function


  - Ensure all tokens are cleared from localStorage
  - Verify Supabase session is properly terminated
  - Clear any cached user data
  - _Requirements: 2.4_

- [-] 3. Update Auth Context



- [x] 3.1 Remove role caching from localStorage


  - Remove `USER_DATA_KEY` from localStorage operations
  - Only store `TOKEN_KEY` and `REFRESH_TOKEN_KEY`
  - Update `login` function to not cache user data
  - Update `register` function to not cache user data
  - Remove `getCachedUserData` function or mark as deprecated
  - _Requirements: 2.4, 1.1_

- [x] 3.2 Implement role polling mechanism


  - Add useEffect hook to poll role every 5 seconds when user is logged in
  - Query `users` table for current role
  - Compare with current user state role
  - Update user state if role has changed
  - Add console logging for role changes
  - _Requirements: 1.1, 1.3, 5.2_

- [x] 3.3 Add role change notification


  - Show toast notification when role changes
  - Display message: "Your role has been updated to {newRole}"
  - Use existing toast/notification system
  - _Requirements: 5.4_

- [x] 3.4 Implement auto-redirect on role change


  - Redirect to `/admin/dashboard` if role changes to 'admin' and user is on member page
  - Redirect to `/dashboard` if role changes to 'member' and user is on admin page
  - Handle edge cases (guest role, unknown routes)
  - _Requirements: 5.3, 5.5_

- [x] 4. Update Protected Routes




- [x] 4.1 Add role verification to ProtectedRoute component


  - Query fresh role from database on route access
  - Add loading state while checking role
  - Show unauthorized page if role doesn't match
  - Cache role check result for current navigation (not across sessions)
  - _Requirements: 1.1, 1.4_

- [x] 4.2 Update admin route guards


  - Ensure all admin routes use ProtectedRoute with `requiredRole="admin"`
  - Test that members cannot access admin routes
  - Test that admins can access admin routes
  - _Requirements: 4.1, 7.1_

---

## Phase 3: Role Detection Enhancement

- [x] 5. Optimize role polling




- [x] 5.1 Add polling interval configuration


  - Create constant for polling interval (default 5000ms)
  - Make interval configurable via environment variable
  - Add ability to disable polling if needed
  - _Requirements: 1.3, 5.2_


- [x] 5.2 Implement polling error handling

  - Handle network errors gracefully
  - Retry failed role queries with exponential backoff
  - Log errors without disrupting user experience
  - Fallback to cached role on repeated failures
  - _Requirements: 1.3_


- [x] 5.3 Implement Realtime subscription alternative

  - Add Supabase Realtime subscription for role changes
  - Subscribe to `users` table updates filtered by user ID
  - Handle realtime events for instant role updates
  - Add feature flag to switch between polling and realtime
  - _Requirements: 5.2_

---

## Phase 4: Testing & Cleanup

- [-] 6. Write comprehensive tests




- [x] 6.1 Write unit tests for auth service


  - Test login with email returns fresh role from DB
  - Test login with username converts to email
  - Test getCurrentUser queries role from database
  - Test error handling for invalid credentials
  - _Requirements: 2.1, 2.3, 3.1, 3.2_

- [x] 6.2 Write unit tests for Auth Context


  - Test role polling detects changes
  - Test role change triggers notification
  - Test role change triggers redirect
  - Test that role is not cached in localStorage
  - _Requirements: 1.3, 5.2, 5.4, 5.5_

- [x] 6.3 Write integration tests for role change flow





  - Test user can login after admin changes their role
  - Test RLS policies work with new subquery pattern
  - Test admin can read all users
  - Test member can only read own profile
  - _Requirements: 1.1, 4.1, 4.2_

- [x] 6.4 Write E2E tests for complete auth flow





  - Test login, role change detection, and auto-redirect
  - Test that user sees notification when role changes
  - Test that admin dashboard is accessible after role upgrade
  - _Requirements: 1.1, 5.2, 5.3, 5.4_

- [x] 7. Performance validation






- [x] 7.1 Measure RLS query performance

  - Run EXPLAIN ANALYZE on role subqueries
  - Verify index is being used
  - Ensure query time is < 1ms
  - Compare with baseline performance
  - _Requirements: 4.5_


- [x] 7.2 Measure polling overhead

  - Monitor network requests during polling
  - Measure average query time over 100 requests
  - Ensure polling doesn't impact app responsiveness
  - _Requirements: 5.2_

- [x] 8. Cleanup and documentation





- [x] 8.1 Remove deprecated code


  - Delete unused JWT helper functions
  - Remove old role caching logic
  - Clean up unused localStorage keys
  - Remove commented-out code
  - _Requirements: 2.2_

- [x] 8.2 Update code documentation


  - Add JSDoc comments to updated functions
  - Document new role query pattern
  - Update inline comments for clarity
  - _Requirements: 6.4_


- [x] 8.3 Create migration documentation

  - Document migration steps performed
  - Create troubleshooting guide
  - Update README with new auth flow
  - Add FAQ section for common issues
  - _Requirements: 6.4, 6.5_


- [x] 8.4 Update admin guide

  - Document new role change behavior
  - Explain that users don't need to logout after role change
  - Add section on role change audit logs
  - _Requirements: 7.2, 7.4_

---

## Notes

- **All tasks are required** for comprehensive implementation
- **Phase 1 (Database)** should be completed first as it's the foundation
- **Phase 2 (Frontend Core)** can be done immediately after Phase 1
- **Phase 3 (Role Detection)** adds the auto-detection feature
- **Phase 4 (Testing & Cleanup)** ensures quality and maintainability
- Each task should be completed and verified before moving to the next
- Rollback plan is available if any issues occur during migration

