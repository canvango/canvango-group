# Implementation Plan - Role Management System

- [x] 1. Setup database schema dan enum types


  - Create migration file untuk user_role enum type
  - Create user_profiles table dengan kolom id, user_id, role, created_at, updated_at
  - Create role_audit_logs table dengan kolom id, user_id, changed_by_user_id, old_role, new_role, changed_at
  - Add foreign key constraints dan unique constraint pada user_id
  - _Requirements: 1.2, 1.4, 5.1, 5.2_

- [-] 2. Implement database triggers

  - [x] 2.1 Create trigger untuk auto-create user profile dengan role 'member' saat user baru sign up

    - Write function handle_new_user() yang insert record ke user_profiles dengan role 'member'
    - Create trigger on_auth_user_created yang execute setelah INSERT pada auth.users
    - _Requirements: 1.1, 1.3_
  

  - [ ] 2.2 Create trigger untuk auto-update timestamp
    - Write function update_updated_at() yang set updated_at ke NOW()
    - Create trigger update_user_profiles_updated_at yang execute sebelum UPDATE
    - _Requirements: 2.4_

  
  - [ ] 2.3 Create trigger untuk audit logging
    - Write function log_role_change() yang insert ke role_audit_logs saat role berubah
    - Function harus capture old_role, new_role, user_id, dan changed_by_user_id dari auth.uid()
    - Create trigger on_role_changed yang execute setelah UPDATE pada user_profiles
    - _Requirements: 5.1, 5.2_

  
  - [ ] 2.4 Create trigger untuk prevent last admin removal
    - Write function prevent_last_admin_removal() yang check admin count
    - Function harus RAISE EXCEPTION jika mencoba ubah admin terakhir menjadi member
    - Create trigger check_last_admin yang execute sebelum UPDATE
    - _Requirements: 6.1, 6.2, 6.3_

- [-] 3. Implement Row Level Security policies

  - [x] 3.1 Enable RLS pada user_profiles dan role_audit_logs tables

    - Execute ALTER TABLE statements untuk enable RLS
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  

  - [ ] 3.2 Create RLS policies untuk user_profiles table
    - Create policy "Users can read own profile" untuk SELECT dengan condition auth.uid() = user_id
    - Create policy "Admins can read all profiles" untuk SELECT dengan subquery check role = 'admin'
    - Create policy "Admins can update all profiles" untuk UPDATE dengan subquery check role = 'admin'
    - Create policy "Users cannot update own role" untuk UPDATE dengan condition auth.uid() != user_id
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  
  - [ ] 3.3 Create RLS policies untuk role_audit_logs table
    - Create policy "Admins can read audit logs" untuk SELECT dengan subquery check role = 'admin'
    - _Requirements: 5.3_

- [x] 4. Create database indexes untuk performance optimization

  - Create index pada user_profiles(user_id)
  - Create index pada user_profiles(role)
  - Create index pada role_audit_logs(user_id)
  - Create index pada role_audit_logs(changed_at DESC)
  - _Requirements: All (Performance)_

- [x] 5. Implement TypeScript types dan interfaces


  - Create UserRole enum dengan values 'member' dan 'admin'
  - Create UserProfile type dengan fields id, user_id, role, created_at, updated_at
  - Create RoleAuditLog type dengan fields id, user_id, changed_by_user_id, old_role, new_role, changed_at
  - Create RoleChangeResult type dengan fields success, message, profile, error
  - Create RoleManagementErrorCode enum dengan error codes
  - Create RoleManagementError class yang extends Error
  - _Requirements: All (Type Safety)_

- [-] 6. Implement RoleManagementClient class


  - [x] 6.1 Setup RoleManagementClient constructor dan basic methods

    - Create class dengan constructor yang accept SupabaseClient instance
    - Implement getUserProfile(userId) method yang query user_profiles by user_id
    - Implement getCurrentUserRole() method yang get role untuk authenticated user
    - Implement isCurrentUserAdmin() method yang return boolean check role = 'admin'
    - _Requirements: 1.4, 4.3_
  

  - [ ] 6.2 Implement admin query methods
    - Implement getAllUserProfiles() method yang query semua user_profiles dengan join ke auth.users untuk email
    - Implement getAdminCount() method yang count users dengan role = 'admin'
    - Add error handling untuk unauthorized access
    - _Requirements: 3.1, 6.3_

  
  - [ ] 6.3 Implement role update method
    - Implement updateUserRole(userId, newRole) method yang update role di user_profiles
    - Add validation untuk check current user is admin
    - Add validation untuk check newRole is valid ('member' atau 'admin')
    - Return RoleChangeResult dengan success status dan message
    - Handle errors (LAST_ADMIN, UNAUTHORIZED, USER_NOT_FOUND)
    - _Requirements: 2.1, 2.2, 3.2, 3.3, 4.1, 4.2, 4.4, 6.1, 6.2_

  
  - [ ] 6.4 Implement audit log methods
    - Implement getRoleAuditLogs(userId?) method yang query role_audit_logs
    - Support optional userId parameter untuk filter by specific user
    - Order by changed_at DESC
    - Join dengan auth.users untuk get email dari changed_by_user_id
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 7. Write unit tests untuk RoleManagementClient


  - Write tests untuk getUserProfile method (success, not found, error cases)
  - Write tests untuk getCurrentUserRole method (admin, member, unauthenticated)
  - Write tests untuk isCurrentUserAdmin method (true/false cases)
  - Write tests untuk getAllUserProfiles method (admin access, member denied)
  - Write tests untuk updateUserRole method (success, unauthorized, last admin, invalid role)
  - Write tests untuk getRoleAuditLogs method (all logs, filtered by user)
  - Mock Supabase client responses untuk isolated testing
  - _Requirements: All (Testing)_

- [-] 8. Implement Admin Interface components


  - [x] 8.1 Create UserRoleManager component

    - Create component yang display list of all users dengan their roles
    - Implement filter by role (all/member/admin)
    - Implement search by email
    - Add loading states dan error handling
    - Integrate dengan RoleManagementClient.getAllUserProfiles()
    - _Requirements: 3.1_
  
  - [x] 8.2 Create RoleChangeConfirmation dialog component


    - Create modal/dialog component untuk confirm role change
    - Display current role dan new role
    - Show warning message jika changing last admin
    - Implement onConfirm callback yang call RoleManagementClient.updateUserRole()
    - Implement onCancel callback untuk close dialog
    - _Requirements: 3.3, 6.2_
  

  - [ ] 8.3 Implement role change functionality
    - Add "Change Role" button/dropdown untuk each user di UserRoleManager
    - Open RoleChangeConfirmation dialog saat button clicked
    - Call updateUserRole method on confirmation
    - Display success notification setelah role changed
    - Display error notification jika role change failed
    - Refresh user list setelah successful change
    - _Requirements: 3.2, 3.4, 3.5_

  
  - [x] 8.4 Create AuditLogViewer component

    - Create component yang display role change history
    - Show timeline view dengan user, old role, new role, changed by, timestamp
    - Implement filter by date range
    - Add pagination untuk large datasets
    - Integrate dengan RoleManagementClient.getRoleAuditLogs()
    - _Requirements: 5.3_

- [x] 9. Write integration tests untuk database triggers dan RLS


  - Test trigger creates profile dengan role 'member' saat user sign up
  - Test trigger prevents last admin removal
  - Test trigger logs role changes ke audit table
  - Test RLS allows admin to read all profiles
  - Test RLS prevents member from updating roles
  - Test RLS allows user to read own profile
  - Test RLS allows admin to read audit logs
  - _Requirements: All (Integration Testing)_


- [x] 10. Write E2E tests untuk Admin Interface


  - Test admin can view all users
  - Test admin can change user role
  - Test confirmation dialog appears before role change
  - Test success notification shows after role change
  - Test error notification shows when role change fails
  - Test audit log updates after role change
  - Test member cannot access admin interface
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 5.3_

- [x] 11. Create migration script dan setup documentation

  - Create SQL migration file yang combine semua database changes (tables, triggers, RLS, indexes)
  - Write setup instructions untuk run migration
  - Document cara set initial admin user
  - Create rollback script untuk undo migration
  - _Requirements: All (Deployment)_

- [x] 12. Integrate RoleManagementClient dengan existing SupabaseClient


  - Update SupabaseClient class untuk expose RoleManagementClient instance
  - Add method getRoleManagementClient() yang return initialized RoleManagementClient
  - Ensure proper initialization dengan authenticated Supabase client
  - _Requirements: All (Integration)_
