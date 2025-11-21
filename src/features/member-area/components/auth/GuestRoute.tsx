import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface GuestRouteProps {
  children: ReactNode;
}

/**
 * GuestRoute component that redirects authenticated users away from auth pages
 * Prevents logged-in users from accessing login/register pages
 * 
 * Requirements: 1.4 - Redirect logic after login
 */
export const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If user is authenticated, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // User is not authenticated, allow access to auth pages
  return <>{children}</>;
};
