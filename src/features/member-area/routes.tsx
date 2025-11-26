import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load all pages for code splitting and performance optimization
const Dashboard = lazy(() => import('./pages/Dashboard'));
const TransactionHistory = lazy(() => import('./pages/TransactionHistory'));
const TopUp = lazy(() => import('./pages/TopUp'));
const BMAccounts = lazy(() => import('./pages/BMAccounts'));
const PersonalAccounts = lazy(() => import('./pages/PersonalAccounts'));
const VerifiedBMService = lazy(() => import('./pages/VerifiedBMService'));
const ClaimWarranty = lazy(() => import('./pages/ClaimWarranty'));
const APIDocumentation = lazy(() => import('./pages/APIDocumentation'));
const TutorialCenter = lazy(() => import('./pages/TutorialCenter'));

// Admin pages
const UserManagement = lazy(() => import('./pages/UserManagement'));
const Unauthorized = lazy(() => import('./pages/Unauthorized'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const TransactionManagement = lazy(() => import('./pages/admin/TransactionManagement'));
const WarrantyClaimManagement = lazy(() => import('./pages/admin/WarrantyClaimManagement'));
const TutorialManagement = lazy(() => import('./pages/admin/TutorialManagement'));
const ProductManagement = lazy(() => import('./pages/admin/ProductManagement'));
const SystemSettings = lazy(() => import('./pages/admin/SystemSettings'));
const AuditLog = lazy(() => import('./pages/admin/AuditLog'));
const AnnouncementManagement = lazy(() => import('./pages/admin/AnnouncementManagement'));

/**
 * Loading component displayed while pages are being lazy loaded
 */
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
  </div>
);

/**
 * Member area routes configuration
 * All routes are protected and require authentication
 * Supports route parameters for filtering and navigation
 */
const MemberRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Default redirect to dashboard */}
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        
        {/* Dashboard - Main overview page - Accessible to guests */}
        <Route 
          path="dashboard" 
          element={<Dashboard />} 
        />
        
        {/* Transaction History - Supports tab parameter for filtering */}
        <Route 
          path="riwayat-transaksi" 
          element={
            <ProtectedRoute>
              <TransactionHistory />
            </ProtectedRoute>
          } 
        />
        
        {/* Top Up - Balance recharge page */}
        <Route 
          path="top-up" 
          element={
            <ProtectedRoute>
              <TopUp />
            </ProtectedRoute>
          } 
        />
        
        {/* BM Accounts - Accessible to guests */}
        <Route 
          path="akun-bm" 
          element={<BMAccounts />} 
        />
        
        {/* Personal Accounts - Accessible to guests */}
        <Route 
          path="akun-personal" 
          element={<PersonalAccounts />} 
        />
        
        {/* Verified BM Service - Accessible to guests */}
        <Route 
          path="jasa-verified-bm" 
          element={<VerifiedBMService />} 
        />
        
        {/* Warranty Claims */}
        <Route 
          path="claim-garansi" 
          element={
            <ProtectedRoute>
              <ClaimWarranty />
            </ProtectedRoute>
          } 
        />
        
        {/* API Documentation - Accessible to guests */}
        <Route 
          path="api" 
          element={<APIDocumentation />} 
        />
        
        {/* Tutorial Center - Accessible to guests */}
        <Route 
          path="tutorial" 
          element={<TutorialCenter />} 
        />
        
        {/* Unauthorized Page */}
        <Route 
          path="unauthorized" 
          element={<Unauthorized />} 
        />
        
        {/* Admin Routes */}
        <Route 
          path="admin/dashboard" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="admin/users" 
          element={
            <ProtectedRoute requiredRole="admin">
              <UserManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="admin/transactions" 
          element={
            <ProtectedRoute requiredRole="admin">
              <TransactionManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="admin/claims" 
          element={
            <ProtectedRoute requiredRole="admin">
              <WarrantyClaimManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="admin/tutorials" 
          element={
            <ProtectedRoute requiredRole="admin">
              <TutorialManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="admin/products" 
          element={
            <ProtectedRoute requiredRole="admin">
              <ProductManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="admin/settings" 
          element={
            <ProtectedRoute requiredRole="admin">
              <SystemSettings />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="admin/audit-logs" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AuditLog />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="admin/announcements" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AnnouncementManagement />
            </ProtectedRoute>
          } 
        />
        
        {/* Catch-all route - Redirect to dashboard for unknown paths */}
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </Suspense>
  );
};

export default MemberRoutes;
