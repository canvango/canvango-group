import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { UIProvider } from './contexts/UIContext';
import ToastContainer from './components/common/ToastContainer';
import { GuestRoute } from './components/auth/GuestRoute';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/shared';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Unauthorized from './pages/Unauthorized';
import { MemberAreaLayout } from './components/layout';

// Lazy load member area pages for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const TransactionHistory = lazy(() => import('./pages/TransactionHistory'));
const TopUp = lazy(() => import('./pages/TopUp'));
const AkunBM = lazy(() => import('./pages/AkunBM'));
const AkunPersonal = lazy(() => import('./pages/AkunPersonal'));
const JasaVerifiedBM = lazy(() => import('./pages/JasaVerifiedBM'));
const ClaimGaransi = lazy(() => import('./pages/ClaimGaransi'));
const API = lazy(() => import('./pages/API'));
const Tutorial = lazy(() => import('./pages/Tutorial'));

// Lazy load admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const TransactionManagement = lazy(() => import('./pages/admin/TransactionManagement'));
const ClaimManagement = lazy(() => import('./pages/admin/ClaimManagement'));
const TutorialManagement = lazy(() => import('./pages/admin/TutorialManagement'));
const ProductManagement = lazy(() => import('./pages/admin/ProductManagement'));
const SystemSettings = lazy(() => import('./pages/admin/SystemSettings'));
const AuditLog = lazy(() => import('./pages/admin/AuditLog'));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  </div>
);

/**
 * Main App component with routing configuration
 * Requirements: 5.5 - Setup routes untuk semua pages dan nested routes untuk admin pages
 * Requirements: 1.4, 11.3 - Redirect logic after login and logout
 */
function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <UIProvider>
          <ToastProvider>
            <AuthProvider>
              <div className="min-h-screen bg-gray-50">
            <Routes>
            {/* Auth routes - redirect to dashboard if already logged in */}
            <Route
              path="/login"
              element={
                <GuestRoute>
                  <Login />
                </GuestRoute>
              }
            />
            <Route
              path="/register"
              element={
                <GuestRoute>
                  <Register />
                </GuestRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <GuestRoute>
                  <ForgotPassword />
                </GuestRoute>
              }
            />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Member Area Routes - Accessible to all users (guest and authenticated) */}
            <Route path="/" element={<MemberAreaLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>} />
              <Route path="riwayat-transaksi" element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoader />}><TransactionHistory /></Suspense>
                </ProtectedRoute>
              } />
              <Route path="top-up" element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoader />}><TopUp /></Suspense>
                </ProtectedRoute>
              } />
              <Route path="akun-bm" element={<Suspense fallback={<PageLoader />}><AkunBM /></Suspense>} />
              <Route path="akun-personal" element={<Suspense fallback={<PageLoader />}><AkunPersonal /></Suspense>} />
              <Route path="jasa-verified-bm" element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoader />}><JasaVerifiedBM /></Suspense>
                </ProtectedRoute>
              } />
              <Route path="claim-garansi" element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoader />}><ClaimGaransi /></Suspense>
                </ProtectedRoute>
              } />
              <Route path="api" element={<Suspense fallback={<PageLoader />}><API /></Suspense>} />
              <Route path="tutorial" element={<Suspense fallback={<PageLoader />}><Tutorial /></Suspense>} />
              
              {/* Admin Routes - Require admin role */}
              <Route path="admin/dashboard" element={
                <ProtectedRoute requiredRole="admin">
                  <Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense>
                </ProtectedRoute>
              } />
              <Route path="admin/users" element={
                <ProtectedRoute requiredRole="admin">
                  <Suspense fallback={<PageLoader />}><UserManagement /></Suspense>
                </ProtectedRoute>
              } />
              <Route path="admin/transactions" element={
                <ProtectedRoute requiredRole="admin">
                  <Suspense fallback={<PageLoader />}><TransactionManagement /></Suspense>
                </ProtectedRoute>
              } />
              <Route path="admin/claims" element={
                <ProtectedRoute requiredRole="admin">
                  <Suspense fallback={<PageLoader />}><ClaimManagement /></Suspense>
                </ProtectedRoute>
              } />
              <Route path="admin/tutorials" element={
                <ProtectedRoute requiredRole="admin">
                  <Suspense fallback={<PageLoader />}><TutorialManagement /></Suspense>
                </ProtectedRoute>
              } />
              <Route path="admin/products" element={
                <ProtectedRoute requiredRole="admin">
                  <Suspense fallback={<PageLoader />}><ProductManagement /></Suspense>
                </ProtectedRoute>
              } />
              <Route path="admin/settings" element={
                <ProtectedRoute requiredRole="admin">
                  <Suspense fallback={<PageLoader />}><SystemSettings /></Suspense>
                </ProtectedRoute>
              } />
              <Route path="admin/audit-logs" element={
                <ProtectedRoute requiredRole="admin">
                  <Suspense fallback={<PageLoader />}><AuditLog /></Suspense>
                </ProtectedRoute>
              } />
            </Route>
            
            {/* Catch all - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
            <Toaster position="top-right" />
            <ToastContainer />
          </AuthProvider>
          </ToastProvider>
        </UIProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
