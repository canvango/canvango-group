# Implementation Plan - Admin User Role Management

## Overview

This implementation plan breaks down the development of the Admin User Role Management feature into discrete, actionable coding tasks. Each task builds incrementally on previous work.

---

## Tasks

- [x] 1. Create shared UserTableRow component


  - Create `src/features/member-area/components/user-management/UserTableRow.tsx`
  - Implement props interface with user, onRoleChange, updating, and variant
  - Build table row with avatar, user info, email, balance, role selector, and registration date
  - Add conditional styling based on variant (admin: red accent, member: blue accent)
  - Integrate SelectDropdown component for role selection
  - Add loading state when updating is true
  - Format balance using toLocaleString for IDR format
  - Format date using toLocaleDateString for Indonesian locale
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 4.5_



- [x] 2. Create UserStatsCards component


  - Create `src/features/member-area/components/user-management/UserStatsCards.tsx`
  - Implement props interface with totalUsers, totalAdmins, totalMembers
  - Build responsive grid layout (1 column mobile, 3 columns desktop)
  - Create three Card components for Total Users, Administrators, and Members
  - Apply appropriate text colors (gray for total, red for admins, blue for members)


  - Use existing Card component from shared components
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 3. Create AdminUsersTable component


  - Create `src/features/member-area/components/user-management/AdminUsersTable.tsx`
  - Implement props interface with users, onRoleChange, and updating
  - Build table structure with red-themed header (bg-red-50, border-red-200)
  - Add table columns: User, Email, Balance, Role, Registered
  - Map through users and render UserTableRow for each with variant="admin"


  - Add empty state message when no admin users exist
  - Wrap table in Card component for consistent styling
  - Make table responsive with overflow-x-auto
  - _Requirements: 1.1, 1.3, 3.1, 4.1_

- [x] 4. Create MemberUsersTable component


  - Create `src/features/member-area/components/user-management/MemberUsersTable.tsx`
  - Implement props interface with users, onRoleChange, and updating
  - Build table structure with blue-themed header (bg-blue-50, border-blue-200)


  - Add table columns: User, Email, Balance, Role, Registered
  - Map through users and render UserTableRow for each with variant="member"
  - Add empty state message when no member/guest users exist
  - Wrap table in Card component for consistent styling
  - Make table responsive with overflow-x-auto
  - _Requirements: 1.1, 1.4, 3.1, 4.2_



- [x] 5. Create index file for user-management components


  - Create `src/features/member-area/components/user-management/index.ts`
  - Export UserStatsCards component
  - Export AdminUsersTable component
  - Export MemberUsersTable component
  - Export UserTableRow component
  - _Requirements: 6.1, 6.2, 6.3, 6.6_



- [x] 6. Implement filtering and validation logic in UserManagement page

  - Open `src/features/member-area/pages/UserManagement.tsx`
  - Add useMemo hook to filter admin users (role === 'admin')
  - Add useMemo hook to filter member users (role === 'member' or 'guest')
  - Create validateRoleChange function to check if last admin is being removed
  - Update updateUserRole function to call validateRoleChange before updating
  - Add error handling for last admin validation
  - Update local state to move users between tables when role changes
  - _Requirements: 1.2, 3.3, 3.8_



- [x] 7. Refactor UserManagement page layout


  - Import new components: UserStatsCards, AdminUsersTable, MemberUsersTable
  - Replace existing stats cards with UserStatsCards component
  - Remove existing single table
  - Add section for "Administrator" with AdminUsersTable component
  - Add section for "Member & Guest" with MemberUsersTable component
  - Pass filtered adminUsers to AdminUsersTable


  - Pass filtered memberUsers to MemberUsersTable
  - Pass updateUserRole and updating state to both tables
  - Add section headers with appropriate styling
  - Maintain existing header with title and refresh button
  - _Requirements: 1.1, 1.3, 1.4, 1.5, 5.1, 5.2, 5.3, 5.4_

- [x] 8. Add accessibility improvements



  - Add aria-label to both tables ("Administrator users" and "Member users")
  - Add scope="col" to all table headers
  - Add aria-label to role SelectDropdown with user context
  - Ensure keyboard navigation works for all interactive elements
  - Add aria-live region for role change announcements
  - Test with screen reader to verify announcements
  - _Requirements: 6.6_

- [ ] 9. Add unit tests for filtering and validation logic
  - Create test file for filtering logic
  - Write test for filterUsersByRole with mixed roles
  - Write test for filterUsersByRole with empty array
  - Write test for validateRoleChange blocking last admin removal
  - Write test for validateRoleChange allowing admin removal when multiple exist
  - Write test for validateRoleChange allowing other role changes
  - _Requirements: 3.8_

- [ ] 10. Add integration tests for UserManagement page
  - Create test file for UserManagement page
  - Write test for initial render with users in correct tables
  - Write test for stats cards showing correct counts
  - Write test for role change moving user between tables
  - Write test for refresh button reloading data
  - Write test for last admin protection error
  - Mock Supabase client for tests
  - _Requirements: 1.1, 1.3, 1.4, 2.4, 3.3, 3.8_

---

## Notes

- All components use existing shared components (Card, Button, SelectDropdown) from `src/shared/components/`
- Toast notifications use existing ToastContext from `src/shared/contexts/ToastContext.tsx`
- Supabase client is already configured and imported
- User type interface already exists and doesn't need modification
- RLS policies are already implemented in the database (from role-management spec)
- No new dependencies are required for this implementation

## Testing Notes

- All tests are required for comprehensive coverage
- Focus on core functionality: filtering, validation, and role updates
- Manual testing should cover all user interactions and edge cases
- Accessibility testing should be done with keyboard and screen reader

## Success Criteria

Implementation is complete when:
- [ ] Admin users display in separate table at top
- [ ] Member/guest users display in separate table at bottom
- [ ] Stats cards show correct counts for each category
- [ ] Role changes work correctly in both tables
- [ ] Users move to correct table when role changes
- [ ] Last admin cannot be demoted (validation works)
- [ ] Loading states display during updates
- [ ] Success/error toasts show for role changes
- [ ] Refresh button reloads all data
- [ ] Page is responsive on mobile devices
- [ ] Keyboard navigation works for all interactions
