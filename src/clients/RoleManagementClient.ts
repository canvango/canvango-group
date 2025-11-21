import { SupabaseClient as SupabaseInstance } from '@supabase/supabase-js';
import {
  UserProfile,
  UserRole,

  RoleChangeResult,
  UserWithProfile,
  AuditLogWithDetails,
  RoleManagementError,
  RoleManagementErrorCode,
  isValidUserRole
} from '../types/roleManagement.js';

/**
 * RoleManagementClient
 * 
 * Client for managing user roles in Supabase.
 * Provides methods for querying and updating user roles,
 * with built-in authorization checks and error handling.
 */
export class RoleManagementClient {
  private client: SupabaseInstance;

  constructor(supabaseClient: SupabaseInstance) {
    this.client = supabaseClient;
  }

  // =====================================================
  // BASIC METHODS
  // =====================================================

  /**
   * Get user profile by user ID
   * @param userId - The user ID to query
   * @returns User profile or null if not found
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await this.client
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        throw new RoleManagementError(
          `Failed to get user profile: ${error.message}`,
          RoleManagementErrorCode.DATABASE_ERROR,
          error
        );
      }

      return data as UserProfile;
    } catch (error: any) {
      if (error instanceof RoleManagementError) {
        throw error;
      }
      throw new RoleManagementError(
        `Failed to get user profile: ${error.message}`,
        RoleManagementErrorCode.DATABASE_ERROR,
        error
      );
    }
  }

  /**
   * Get current authenticated user's role
   * @returns User role or null if not authenticated
   */
  async getCurrentUserRole(): Promise<UserRole | null> {
    try {
      const { data: { user } } = await this.client.auth.getUser();
      
      if (!user) {
        return null;
      }

      const profile = await this.getUserProfile(user.id);
      return profile?.role || null;
    } catch (error: any) {
      throw new RoleManagementError(
        `Failed to get current user role: ${error.message}`,
        RoleManagementErrorCode.DATABASE_ERROR,
        error
      );
    }
  }

  /**
   * Check if current user is admin
   * @returns True if current user is admin, false otherwise
   */
  async isCurrentUserAdmin(): Promise<boolean> {
    try {
      const role = await this.getCurrentUserRole();
      return role === UserRole.ADMIN;
    } catch (error: any) {
      // If error occurs, assume not admin for security
      return false;
    }
  }

  // =====================================================
  // ADMIN QUERY METHODS
  // =====================================================

  /**
   * Get all user profiles with email (admin only)
   * @returns Array of users with profiles
   * @throws RoleManagementError if not authorized
   */
  async getAllUserProfiles(): Promise<UserWithProfile[]> {
    try {
      // Check if current user is admin
      const isAdmin = await this.isCurrentUserAdmin();
      if (!isAdmin) {
        throw new RoleManagementError(
          'Only admins can view all user profiles',
          RoleManagementErrorCode.PERMISSION_DENIED
        );
      }

      // Query user_profiles with join to auth.users
      const { data, error } = await this.client
        .from('user_profiles')
        .select(`
          *,
          user:user_id (
            id,
            email
          )
        `);

      if (error) {
        throw new RoleManagementError(
          `Failed to get all user profiles: ${error.message}`,
          RoleManagementErrorCode.DATABASE_ERROR,
          error
        );
      }

      // Transform data to UserWithProfile format
      const users: UserWithProfile[] = (data || []).map((item: any) => ({
        id: item.user_id,
        email: item.user?.email || 'Unknown',
        profile: {
          id: item.id,
          user_id: item.user_id,
          role: item.role,
          created_at: item.created_at,
          updated_at: item.updated_at
        }
      }));

      return users;
    } catch (error: any) {
      if (error instanceof RoleManagementError) {
        throw error;
      }
      throw new RoleManagementError(
        `Failed to get all user profiles: ${error.message}`,
        RoleManagementErrorCode.DATABASE_ERROR,
        error
      );
    }
  }

  /**
   * Get count of admin users
   * @returns Number of admin users
   */
  async getAdminCount(): Promise<number> {
    try {
      const { count, error } = await this.client
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', UserRole.ADMIN);

      if (error) {
        throw new RoleManagementError(
          `Failed to get admin count: ${error.message}`,
          RoleManagementErrorCode.DATABASE_ERROR,
          error
        );
      }

      return count || 0;
    } catch (error: any) {
      if (error instanceof RoleManagementError) {
        throw error;
      }
      throw new RoleManagementError(
        `Failed to get admin count: ${error.message}`,
        RoleManagementErrorCode.DATABASE_ERROR,
        error
      );
    }
  }

  // =====================================================
  // ROLE UPDATE METHOD
  // =====================================================

  /**
   * Update user role (admin only)
   * @param userId - The user ID to update
   * @param newRole - The new role to assign
   * @returns Result of the operation
   */
  async updateUserRole(
    userId: string,
    newRole: UserRole
  ): Promise<RoleChangeResult> {
    try {
      // Validate role value
      if (!isValidUserRole(newRole)) {
        return {
          success: false,
          message: 'Invalid role value',
          error: 'INVALID_ROLE'
        };
      }

      // Check if current user is admin
      const isAdmin = await this.isCurrentUserAdmin();
      if (!isAdmin) {
        return {
          success: false,
          message: 'Only admins can update user roles',
          error: 'PERMISSION_DENIED'
        };
      }

      // Check if user exists
      const existingProfile = await this.getUserProfile(userId);
      if (!existingProfile) {
        return {
          success: false,
          message: 'User not found',
          error: 'USER_NOT_FOUND'
        };
      }

      // Check if trying to remove last admin
      if (existingProfile.role === UserRole.ADMIN && newRole === UserRole.MEMBER) {
        const adminCount = await this.getAdminCount();
        if (adminCount <= 1) {
          return {
            success: false,
            message: 'Cannot remove the last admin. At least one admin must exist.',
            error: 'LAST_ADMIN'
          };
        }
      }

      // Update role
      const { data, error } = await this.client
        .from('user_profiles')
        .update({ role: newRole })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        // Check for last admin error from trigger
        if (error.message.includes('Cannot remove the last admin')) {
          return {
            success: false,
            message: 'Cannot remove the last admin. At least one admin must exist.',
            error: 'LAST_ADMIN'
          };
        }

        return {
          success: false,
          message: `Failed to update role: ${error.message}`,
          error: 'DATABASE_ERROR'
        };
      }

      return {
        success: true,
        message: `Successfully updated role to ${newRole}`,
        profile: data as UserProfile
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Failed to update role: ${error.message}`,
        error: 'DATABASE_ERROR'
      };
    }
  }

  // =====================================================
  // AUDIT LOG METHODS
  // =====================================================

  /**
   * Get role change audit logs (admin only)
   * @param userId - Optional user ID to filter logs
   * @returns Array of audit logs with user details
   */
  async getRoleAuditLogs(userId?: string): Promise<AuditLogWithDetails[]> {
    try {
      // Check if current user is admin
      const isAdmin = await this.isCurrentUserAdmin();
      if (!isAdmin) {
        throw new RoleManagementError(
          'Only admins can view audit logs',
          RoleManagementErrorCode.PERMISSION_DENIED
        );
      }

      // Build query
      let query = this.client
        .from('role_audit_logs')
        .select(`
          *,
          user:user_id (email),
          changed_by:changed_by_user_id (email)
        `)
        .order('changed_at', { ascending: false });

      // Filter by user if provided
      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        throw new RoleManagementError(
          `Failed to get audit logs: ${error.message}`,
          RoleManagementErrorCode.DATABASE_ERROR,
          error
        );
      }

      // Transform data to include email details
      const logs: AuditLogWithDetails[] = (data || []).map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        changed_by_user_id: item.changed_by_user_id,
        old_role: item.old_role,
        new_role: item.new_role,
        changed_at: item.changed_at,
        user_email: item.user?.email,
        changed_by_email: item.changed_by?.email
      }));

      return logs;
    } catch (error: any) {
      if (error instanceof RoleManagementError) {
        throw error;
      }
      throw new RoleManagementError(
        `Failed to get audit logs: ${error.message}`,
        RoleManagementErrorCode.DATABASE_ERROR,
        error
      );
    }
  }
}
