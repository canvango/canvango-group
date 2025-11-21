import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './index.css';

// Import context providers
import { AuthProvider } from './features/member-area/contexts/AuthContext';
import { ToastProvider } from './shared/contexts/ToastContext';
import { UIProvider } from './features/member-area/contexts/UIContext';

// Import error boundary
import { ErrorBoundary } from './shared/components/ErrorBoundary';

// Import auth pages
import Login from './features/member-area/pages/Login';
import Register from './features/member-area/pages/Register';
import { GuestRoute } from './features/member-area/components/auth/GuestRoute';

// Import main app component
import MemberArea from './features/member-area/MemberArea';

// Log for debugging
console.log('Main.tsx loaded');
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
  </div>
);

const root = document.getElementById('root');
if (!root) {
  console.error('Root element not found!');
  document.body.innerHTML = '<div style="padding: 20px;">Error: Root element not found</div>';
} else {
  console.log('Root element found, rendering app...');
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ErrorBoundary>
        <BrowserRouter>
          <UIProvider>
            <ToastProvider>
              <AuthProvider>
                <div className="min-h-screen bg-gray-50">
                  <React.Suspense fallback={<PageLoader />}>
                    <Routes>
                      {/* Auth routes - accessible only to guests */}
                      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
                      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
                      
                      {/* Member area routes - all other routes */}
                      <Route path="/*" element={<MemberArea />} />
                    </Routes>
                  </React.Suspense>
                </div>
                <Toaster position="top-right" />
              </AuthProvider>
            </ToastProvider>
          </UIProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </React.StrictMode>
  );
}
