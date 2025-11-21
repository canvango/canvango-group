import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'member' | 'admin';
}

/**
 * ProtectedRoute - Wrapper component for routes that require authentication
 * 
 * Redirects unauthenticated users to login page while preserving the intended destination
 * Supports role-based access control with requiredRole prop
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated, preserving the intended destination
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access control
  if (requiredRole && user?.role !== requiredRole) {
    // User is authenticated but doesn't have required role
    return <Navigate to="/unauthorized" replace />;
  }

  // User is authenticated and has required role (if specified), render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
