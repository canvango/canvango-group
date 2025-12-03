import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Dashboard from '../../pages/Dashboard';

/**
 * Conditional Dashboard Route Component
 * 
 * Behavior:
 * - Guest (not logged in): Render Dashboard at root path "/"
 * - Authenticated: Redirect to "/dashboard"
 * 
 * This ensures:
 * - Guests see dashboard content at https://www.canvango.com/
 * - Logged-in users see dashboard at https://www.canvango.com/dashboard
 */
export const ConditionalDashboardRoute: React.FC = () => {
  const { user, loading } = useAuth();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // If user is authenticated, redirect to /dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // If guest, render Dashboard directly (no redirect)
  return <Dashboard />;
};
