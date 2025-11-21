/**
 * Role Management System - Type Definitions
 * 
 * This file contains all TypeScript types, interfaces, and enums
 * for the role management system.
 */

// =====================================================
// ENUMS
// =====================================================

/**
 * User role enum matching database user_role type
 */
export enum UserRole {
  MEMBER = 'member',
  ADMIN = 'admin'
}

/**
 * Error codes for role management operations
 */
export enum RoleManagementErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  LAST_ADMIN = 'LAST_ADMIN',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  INVALID_ROLE = 'INVALID_ROLE',
  DATABASE_ERROR = 'DATABASE_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED'
}

// =====================================================
// DATABASE TYPES
// =====================================================

/**
 * User profile from database
 * Maps to user_profiles table
 */
export type UserProfile = {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

/**
 * Role audit log entry from database
 * Maps to role_audit_logs table
 */
export type RoleAuditLog = {
  id: string;
  user_id: string;
  changed_by_user_id: string | null;
  old_role: UserRole | null;
  new_role: UserRole;
  changed_at: string;
}

// =====================================================
// API RESPONSE TYPES
// =====================================================

/**
 * Result of role change operation
 */
export type RoleChangeResult = {
  success: boolean;
  message: string;
  profile?: UserProfile;
  error?: string;
}

/**
 * User with profile information
 * Combines auth.users and user_profiles
 */
export type UserWithProfile = {
  id: string;
  email: string;
  profile: UserProfile;
}

/**
 * Audit log with user details
 * Includes email of user who made the change
 */
export type AuditLogWithDetails = RoleAuditLog & {
  user_email?: string;
  changed_by_email?: string;
}

// =====================================================
// ERROR CLASS
// =====================================================

/**
 * Custom error class for role management operations
 */
export class RoleManagementError extends Error {
  constructor(
    message: string,
    public code: RoleManagementErrorCode,
    public details?: any
  ) {
    super(message);
    this.name = 'RoleManagementError';
    
    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RoleManagementError);
    }
  }
}

// =====================================================
// UTILITY TYPES
// =====================================================

/**
 * Type guard to check if a string is a valid UserRole
 */
export function isValidUserRole(role: string): role is UserRole {
  return role === UserRole.MEMBER || role === UserRole.ADMIN;
}

/**
 * Type guard to check if error is RoleManagementError
 */
export function isRoleManagementError(error: any): error is RoleManagementError {
  return error instanceof RoleManagementError;
}
