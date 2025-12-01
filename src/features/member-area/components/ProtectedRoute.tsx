import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/clients/supabase';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'guest' | 'member' | 'admin';
  redirectTo?: string;
}

/**
 * Loading component displayed while checking authentication
 */
const LoadingScreen: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

/**
 * ProtectedRoute Component
 * 
 * Wraps routes that require authentication and/or specific roles.
 * 
 * Features:
 * - Redirects unauthenticated users to login
 * - Preserves intended destination for post-login redirect
 * - Supports role-based access control with fresh database queries
 * - Shows loading state during auth and role verification
 * - Queries fresh role from database on every route access
 * 
 * @param children - The protected content to render
 * @param requiredRole - Optional role requirement ('member' or 'admin')
 * @param redirectTo - Optional custom redirect path (defaults to '/login')
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  redirectTo = '/login'
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  const [roleCheck, setRoleCheck] = useState<'checking' | 'allowed' | 'denied'>('checking');
  const [freshRole, setFreshRole] = useState<string | null>(null);

  // Query fresh role from database when user or requiredRole changes
  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const checkRole = async () => {
      // Reset to checking state
      setRoleCheck('checking');
      
      // Set timeout to prevent infinite loading (5 seconds max)
      timeoutId = setTimeout(() => {
        if (isMounted) {
          console.warn('⚠️ Role check timeout - allowing access with fallback');
          // On timeout, allow access if no role requirement
          if (!requiredRole) {
            setRoleCheck('allowed');
          } else if (user?.role === requiredRole) {
            // Use cached role as fallback
            setRoleCheck('allowed');
          } else {
            setRoleCheck('denied');
          }
        }
      }, 5000);
      
      // If no user or still loading auth, wait but don't get stuck
      if (!user || isLoading) {
        // If auth is loading, wait for it to complete
        if (isLoading) {
          return;
        }
        
        // If no user and not loading, deny access
        if (!user) {
          clearTimeout(timeoutId);
          setRoleCheck('denied');
          return;
        }
      }

      // If no role requirement, allow access immediately
      if (!requiredRole) {
        clearTimeout(timeoutId);
        setRoleCheck('allowed');
        return;
      }

      try {
        // Query fresh role from database with timeout
        const roleQueryPromise = supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Role query timeout')), 3000)
        );

        const { data, error } = await Promise.race([
          roleQueryPromise,
          timeoutPromise
        ]) as any;

        if (!isMounted) return;
        clearTimeout(timeoutId);

        if (error) {
          console.error('Failed to verify role:', error);
          // On error, fall back to user state role
          const currentRole = user.role;
          setFreshRole(currentRole);
          
          if (currentRole === requiredRole) {
            setRoleCheck('allowed');
          } else {
            setRoleCheck('denied');
          }
          return;
        }

        const currentRole = data?.role;
        setFreshRole(currentRole);

        // Check if role matches requirement
        if (currentRole === requiredRole) {
          setRoleCheck('allowed');
        } else {
          setRoleCheck('denied');
        }
      } catch (error) {
        if (!isMounted) return;
        clearTimeout(timeoutId);
        
        console.error('Role verification exception:', error);
        // On exception, fall back to user state role
        const currentRole = user.role;
        setFreshRole(currentRole);
        
        if (currentRole === requiredRole) {
          setRoleCheck('allowed');
        } else {
          setRoleCheck('denied');
        }
      }
    };

    checkRole();

    // Cleanup function
    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [user, requiredRole, isLoading]);

  // Show loading screen while checking authentication or role
  if (isLoading || roleCheck === 'checking') {
    return <LoadingScreen />;
  }

  // Redirect to login if not authenticated
  // Preserve the current location to redirect back after login
  if (!isAuthenticated) {
    return (
      <Navigate 
        to={redirectTo} 
        replace 
        state={{ from: location.pathname }}
      />
    );
  }

  // Check role-based access control
  if (roleCheck === 'denied') {
    // User is authenticated but doesn't have required role
    return (
      <Navigate 
        to="/unauthorized" 
        replace 
        state={{ 
          requiredRole,
          userRole: freshRole || user?.role,
          from: location.pathname 
        }}
      />
    );
  }

  // User is authenticated and has required role (if specified)
  return <>{children}</>;
};

/**
 * PublicRoute Component
 * 
 * Wraps routes that should only be accessible to unauthenticated users
 * (e.g., login, register pages)
 * 
 * @param children - The public content to render
 * @param redirectTo - Where to redirect authenticated users (defaults to '/dashboard')
 */
export const PublicRoute: React.FC<{
  children: React.ReactNode;
  redirectTo?: string;
}> = ({ children, redirectTo = '/dashboard' }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Redirect authenticated users away from public routes
  if (isAuthenticated) {
    // Check if there's a saved destination from previous navigation
    const from = (location.state as any)?.from || redirectTo;
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};

/**
 * RoleGuard Component
 * 
 * Can be used within protected routes to conditionally render content
 * based on user role without redirecting
 * 
 * @param children - Content to render if role matches
 * @param allowedRoles - Array of roles that can see the content
 * @param fallback - Optional fallback content for unauthorized users
 */
export const RoleGuard: React.FC<{
  children: React.ReactNode;
  allowedRoles: Array<'guest' | 'member' | 'admin'>;
  fallback?: React.ReactNode;
}> = ({ children, allowedRoles, fallback = null }) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
