/**
 * Role-Based Access Control (RBAC)
 * Permission checking and role validation
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

export enum UserRole {
  GUEST = 'guest',
  MEMBER = 'member',
  ADMIN = 'admin',
  SUPERADMIN = 'superadmin',
}

export enum Resource {
  PRODUCTS = 'products',
  TRANSACTIONS = 'transactions',
  USERS = 'users',
  ACCOUNT_DATA = 'account_data',
  SETTINGS = 'settings',
  ENCRYPTION_KEYS = 'encryption_keys',
}

export enum Action {
  VIEW = 'view',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
}

/**
 * Permission matrix
 * Defines what each role can do with each resource
 */
const PERMISSION_MATRIX: Record<UserRole, Record<Resource, Action[]>> = {
  [UserRole.GUEST]: {
    [Resource.PRODUCTS]: [Action.VIEW],
    [Resource.TRANSACTIONS]: [],
    [Resource.USERS]: [],
    [Resource.ACCOUNT_DATA]: [],
    [Resource.SETTINGS]: [],
    [Resource.ENCRYPTION_KEYS]: [],
  },
  [UserRole.MEMBER]: {
    [Resource.PRODUCTS]: [Action.VIEW],
    [Resource.TRANSACTIONS]: [Action.VIEW, Action.CREATE],
    [Resource.USERS]: [Action.VIEW], // Own profile only
    [Resource.ACCOUNT_DATA]: [Action.VIEW], // Own purchased accounts only
    [Resource.SETTINGS]: [],
    [Resource.ENCRYPTION_KEYS]: [],
  },
  [UserRole.ADMIN]: {
    [Resource.PRODUCTS]: [Action.VIEW, Action.CREATE, Action.UPDATE, Action.DELETE],
    [Resource.TRANSACTIONS]: [Action.VIEW, Action.UPDATE],
    [Resource.USERS]: [Action.VIEW, Action.UPDATE, Action.MANAGE],
    [Resource.ACCOUNT_DATA]: [], // Cannot access encrypted data
    [Resource.SETTINGS]: [Action.VIEW, Action.UPDATE],
    [Resource.ENCRYPTION_KEYS]: [],
  },
  [UserRole.SUPERADMIN]: {
    [Resource.PRODUCTS]: [Action.VIEW, Action.CREATE, Action.UPDATE, Action.DELETE, Action.MANAGE],
    [Resource.TRANSACTIONS]: [Action.VIEW, Action.UPDATE, Action.DELETE, Action.MANAGE],
    [Resource.USERS]: [Action.VIEW, Action.CREATE, Action.UPDATE, Action.DELETE, Action.MANAGE],
    [Resource.ACCOUNT_DATA]: [Action.VIEW, Action.CREATE, Action.UPDATE, Action.DELETE, Action.MANAGE],
    [Resource.SETTINGS]: [Action.VIEW, Action.UPDATE, Action.MANAGE],
    [Resource.ENCRYPTION_KEYS]: [Action.VIEW, Action.MANAGE],
  },
};

/**
 * Check if user role has permission for resource and action
 */
export function hasPermission(
  userRole: UserRole,
  resource: Resource,
  action: Action
): boolean {
  const permissions = PERMISSION_MATRIX[userRole]?.[resource];
  if (!permissions) {
    return false;
  }
  return permissions.includes(action);
}

/**
 * Get user role from database
 */
export async function getUserRole(
  supabase: SupabaseClient,
  userId: string
): Promise<UserRole> {
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return UserRole.GUEST;
  }

  return data.role as UserRole;
}

/**
 * Require specific role or higher
 * Throws error if user doesn't have required role
 */
export async function requireRole(
  supabase: SupabaseClient,
  userId: string,
  requiredRole: UserRole
): Promise<void> {
  const userRole = await getUserRole(supabase, userId);
  
  const roleHierarchy = [
    UserRole.GUEST,
    UserRole.MEMBER,
    UserRole.ADMIN,
    UserRole.SUPERADMIN,
  ];
  
  const userRoleLevel = roleHierarchy.indexOf(userRole);
  const requiredRoleLevel = roleHierarchy.indexOf(requiredRole);
  
  if (userRoleLevel < requiredRoleLevel) {
    throw new Error(`Insufficient permissions. Required: ${requiredRole}, Current: ${userRole}`);
  }
}

/**
 * Check if user has required role
 */
export async function hasRole(
  supabase: SupabaseClient,
  userId: string,
  requiredRole: UserRole
): Promise<boolean> {
  try {
    await requireRole(supabase, userId, requiredRole);
    return true;
  } catch {
    return false;
  }
}

/**
 * Require permission for resource and action
 */
export async function requirePermission(
  supabase: SupabaseClient,
  userId: string,
  resource: Resource,
  action: Action
): Promise<void> {
  const userRole = await getUserRole(supabase, userId);
  
  if (!hasPermission(userRole, resource, action)) {
    throw new Error(`Insufficient permissions for ${action} on ${resource}`);
  }
}
