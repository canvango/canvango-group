import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types/user.types';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

/**
 * ProtectedRoute component that guards routes based on authentication and role
 * 
 * Navigation Guards Implementation:
 * - Protects member routes from Guest (Requirements: 3.1, 3.2, 3.3, 3.4)
 * - Protects admin routes from Guest and Member (Requirements: 17.2)
 * - Redirects unauthenticated users to login page
 * - Redirects unauthorized users to unauthorized page
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 17.2
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  allowedRoles,
  redirectTo = '/login',
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Guard 1: Redirect to login if not authenticated (Guest trying to access protected routes)
  // Requirements: 3.1, 3.2, 3.3, 3.4 - Protect member routes from Guest
  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Guard 2: Check if user has required role
  // Requirements: 17.2 - Protect admin routes from Guest and Member
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Guard 3: Check if user role is in allowed roles
  // Requirements: 3.1, 3.2, 3.3, 3.4, 17.2 - Role-based access control
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // User is authenticated and has proper role - allow access
  return <>{children}</>;
};
