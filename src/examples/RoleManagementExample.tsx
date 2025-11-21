/**
 * Role Management Example Usage
 * 
 * This file demonstrates how to use the Role Management System
 * in your React application.
 */

import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { RoleManagementClient } from '../clients/RoleManagementClient';
import { UserRoleManager, AuditLogViewer } from '../components';

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Initialize Role Management Client
const roleClient = new RoleManagementClient(supabaseClient);

/**
 * Admin Dashboard Example
 * 
 * This component shows how to use UserRoleManager and AuditLogViewer
 * in an admin dashboard.
 */
export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<'users' | 'audit'>('users');

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage user roles and view audit logs
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              User Management
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`${
                activeTab === 'audit'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Audit Log
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {activeTab === 'users' ? (
            <UserRoleManager roleClient={roleClient} />
          ) : (
            <AuditLogViewer roleClient={roleClient} />
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * User Profile Page Example
 * 
 * This shows how to display a specific user's role history
 */
export const UserProfilePage: React.FC<{ userId: string }> = ({ userId }) => {
  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">User Profile</h2>
      
      <div className="bg-white rounded-lg shadow p-6">
        <AuditLogViewer roleClient={roleClient} userId={userId} />
      </div>
    </div>
  );
};

/**
 * Protected Route Example
 * 
 * This shows how to protect admin routes using role check
 */
export const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = React.useState<boolean | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const adminStatus = await roleClient.isCurrentUserAdmin();
      setIsAdmin(adminStatus);
    } catch (error) {
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

/**
 * Usage in App Router
 * 
 * Example of how to integrate into your app routing:
 * 
 * import { AdminDashboard, ProtectedAdminRoute } from './examples/RoleManagementExample';
 * 
 * function App() {
 *   return (
 *     <Router>
 *       <Routes>
 *         <Route path="/admin" element={
 *           <ProtectedAdminRoute>
 *             <AdminDashboard />
 *           </ProtectedAdminRoute>
 *         } />
 *       </Routes>
 *     </Router>
 *   );
 * }
 */
