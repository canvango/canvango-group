import { Request, Response, NextFunction } from 'express';
import { getSupabaseClient } from '../config/supabase.js';
import { UserRole } from '../models/User.model.js';

// Extend Express Request type to include user
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: UserRole;
  };
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: UserRole;
      };
    }
  }
}

/**
 * Authentication middleware - verifies Supabase JWT token
 * Extracts token from Authorization header and validates with Supabase
 */
export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_003',
          message: 'No authentication token provided',
        },
      });
      return;
    }

    const token = authHeader.substring(7);
    const supabase = getSupabaseClient();

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_002',
          message: 'Invalid or expired token',
        },
      });
      return;
    }

    // Fetch user role from database
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single<{ role: UserRole }>();

    if (dbError || !userData) {
      // User not in database yet, default to member role
      req.user = {
        userId: user.id,
        email: user.email!,
        role: 'member' as UserRole
      };
    } else {
      req.user = {
        userId: user.id,
        email: user.email!,
        role: userData.role
      };
    }

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error during authentication',
      },
    });
    return;
  }
}

/**
 * Optional authentication middleware
 * Attaches user to request if token is valid, but doesn't fail if no token
 */
export async function optionalAuthenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const supabase = getSupabaseClient();

      try {
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (!error && user) {
          // Fetch user role from database
          const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single<{ role: UserRole }>();

          req.user = {
            userId: user.id,
            email: user.email!,
            role: userData?.role || 'member'
          };
        }
      } catch (error) {
        // Silently fail for optional auth
      }
    }
    
    next();
  } catch (error) {
    next();
  }
}
