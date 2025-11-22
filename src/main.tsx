import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';

// Import context providers
import { AuthProvider } from './features/member-area/contexts/AuthContext';
import { ToastProvider } from './shared/contexts/ToastContext';
import { UIProvider } from './features/member-area/contexts/UIContext';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Import error boundary
import { ErrorBoundary } from './shared/components/ErrorBoundary';

// Import auth pages
import Login from './features/member-area/pages/Login';
import Register from './features/member-area/pages/Register';
import { GuestRoute } from './features/member-area/components/auth/GuestRoute';

// Import main app component
import MemberArea from './features/member-area/MemberArea';

// Production-ready entry point - console logs removed for performance

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
  </div>
);

const root = document.getElementById('root');
if (!root) {
  document.body.innerHTML = '<div style="padding: 20px;">Error: Root element not found</div>';
} else {
  ReactDOM.createRoot(root).render(
    // StrictMode disabled to prevent double API calls in development
    // React StrictMode intentionally double-invokes functions to detect side effects
    // This causes purchase mutations to be called twice, resulting in double balance deduction
    // <React.StrictMode>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
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
        </QueryClientProvider>
      </ErrorBoundary>
    // </React.StrictMode>
  );
}
