import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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
 * - Supports role-based access control
 * - Shows loading state during auth check
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

  // Show loading screen while checking authentication
  if (isLoading) {
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
  if (requiredRole && user?.role !== requiredRole) {
    // User is authenticated but doesn't have required role
    return (
      <Navigate 
        to="/unauthorized" 
        replace 
        state={{ 
          requiredRole,
          userRole: user?.role,
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
