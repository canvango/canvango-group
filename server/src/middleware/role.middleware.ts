import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/User.model.js';

/**
 * Role hierarchy for permission checking
 * Higher index = more permissions
 */
const ROLE_HIERARCHY: UserRole[] = ['guest', 'member', 'admin'];

/**
 * Get role level (higher number = more permissions)
 */
function getRoleLevel(role: UserRole): number {
  return ROLE_HIERARCHY.indexOf(role);
}

/**
 * Check if user has required role or higher
 */
function hasRequiredRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return getRoleLevel(userRole) >= getRoleLevel(requiredRole);
}

/**
 * Middleware to require specific role
 * Must be used after authenticate middleware
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Check if user is authenticated
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_003',
          message: 'Authentication required',
        },
      });
      return;
    }

    // Check if user has one of the allowed roles
    const userRole = req.user.role;
    const hasPermission = allowedRoles.some(role => userRole === role);

    if (!hasPermission) {
      res.status(403).json({
        success: false,
        error: {
          code: 'AUTH_004',
          message: 'Insufficient permissions',
          details: `Required role: ${allowedRoles.join(' or ')}`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Middleware to require minimum role level
 * Must be used after authenticate middleware
 */
export function requireMinRole(minRole: UserRole) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_003',
          message: 'Authentication required',
        },
      });
      return;
    }

    const userRole = req.user.role;
    if (!hasRequiredRole(userRole, minRole)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'AUTH_004',
          message: 'Insufficient permissions',
          details: `Minimum required role: ${minRole}`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Middleware to require member role (excludes guest)
 */
export const requireMember = requireMinRole('member');

/**
 * Middleware to require admin role
 */
export const requireAdmin = requireRole('admin');

/**
 * Middleware to check if user is guest
 */
export function isGuest(req: Request, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role === 'guest') {
    next();
  } else {
    res.status(403).json({
      success: false,
      error: {
        code: 'AUTH_004',
        message: 'This endpoint is only for guests',
      },
    });
  }
}

/**
 * Middleware to check if user owns the resource
 * Compares req.user.userId with req.params.userId or req.params.id
 */
export function requireOwnership(paramName: string = 'id') {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_003',
          message: 'Authentication required',
        },
      });
      return;
    }

    const resourceUserId = req.params[paramName] || req.params.userId;
    
    // Admin can access any resource
    if (req.user.role === 'admin') {
      next();
      return;
    }

    // Check if user owns the resource
    if (req.user.userId !== resourceUserId) {
      res.status(403).json({
        success: false,
        error: {
          code: 'AUTH_004',
          message: 'You can only access your own resources',
        },
      });
      return;
    }

    next();
  };
}
