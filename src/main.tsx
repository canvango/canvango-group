import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Toaster as SonnerToaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';

// Import context providers
import { AuthProvider } from './features/member-area/contexts/AuthContext';
import { ToastProvider } from './shared/contexts/ToastContext';
import { UIProvider } from './features/member-area/contexts/UIContext';

// Create a client with optimized settings for idle connections and token expiration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        // Don't retry on auth errors (401, 403) - will be handled by global error handler
        if (error?.status === 401 || error?.status === 403) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
      staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
      gcTime: 10 * 60 * 1000, // 10 minutes - garbage collection time (formerly cacheTime)
      refetchOnReconnect: true, // Auto-retry when connection restored
      refetchOnMount: false, // Don't refetch if data is still fresh
      // Add network mode for better offline handling
      networkMode: 'online', // Only run queries when online
    },
    mutations: {
      retry: false, // Don't retry mutations by default
      networkMode: 'online',
    },
  },
});

// Import error boundary
import { ErrorBoundary } from './shared/components/ErrorBoundary';

// Import global error handler
import { useGlobalErrorHandler } from './shared/hooks/useGlobalErrorHandler';

// Import auth pages
import Login from './features/member-area/pages/Login';
import Register from './features/member-area/pages/Register';
import ForgotPassword from './features/member-area/pages/ForgotPassword';
import ResetPassword from './features/member-area/pages/ResetPassword';
import { GuestRoute } from './features/member-area/components/auth/GuestRoute';

// Import legal/public pages (standalone - no layout wrapper)
import PrivacyPolicy from './features/member-area/pages/PrivacyPolicy';
import TermsOfService from './features/member-area/pages/TermsOfService';
import ContactUs from './features/member-area/pages/ContactUs';
import SecurityCenter from './features/member-area/pages/SecurityCenter';

// Import main app component
import MemberArea from './features/member-area/MemberArea';

// Import welcome popup
import { WelcomePopup } from './components/WelcomePopup';

// Import Turnstile protection
import { TurnstileProtection } from './components/TurnstileProtection';

// Global error handler wrapper component
const AppWithErrorHandler: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useGlobalErrorHandler();
  return <>{children}</>;
};

// Production-ready entry point - console logs removed for performance

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
  </div>
);

// Global error handlers for debugging
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  console.error('Error message:', event.message);
  console.error('Error filename:', event.filename);
  console.error('Error line:', event.lineno);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Debug: Log environment info
console.log('Environment:', import.meta.env.MODE);
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Not set (using fallback)');
console.log('Base URL:', import.meta.env.BASE_URL);

const root = document.getElementById('root');
if (!root) {
  console.error('Root element not found!');
  document.body.innerHTML = '<div style="padding: 20px; color: red; font-family: monospace;">Error: Root element not found</div>';
} else {
  console.log('Initializing React app...');
  try {
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
                <AppWithErrorHandler>
                  <AuthProvider>
                    <TurnstileProtection>
                      <div className="min-h-screen bg-gray-50">
                        <React.Suspense fallback={<PageLoader />}>
                          <Routes>
                            {/* Auth routes - accessible only to guests */}
                            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
                            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
                            <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
                            
                            {/* Password reset - accessible with valid token from email */}
                            <Route path="/reset-password" element={<ResetPassword />} />
                            
                            {/* Legal/Public pages - standalone without layout wrapper for SEO */}
                            <Route path="/kebijakan-privasi" element={<PrivacyPolicy />} />
                            <Route path="/syarat-ketentuan" element={<TermsOfService />} />
                            <Route path="/hubungi-kami" element={<ContactUs />} />
                            <Route path="/pusat-keamanan" element={<SecurityCenter />} />
                            
                            {/* Member area routes - all other routes */}
                            <Route path="/*" element={<MemberArea />} />
                          </Routes>
                        </React.Suspense>
                      </div>
                      <Toaster position="top-right" />
                      <SonnerToaster position="top-right" richColors />
                      <WelcomePopup />
                    </TurnstileProtection>
                  </AuthProvider>
                </AppWithErrorHandler>
              </ToastProvider>
            </UIProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </ErrorBoundary>
    // </React.StrictMode>
    );
    console.log('React app initialized successfully!');
  } catch (error) {
    console.error('Failed to initialize React app:', error);
    document.body.innerHTML = `
      <div style="padding: 20px; color: red; font-family: monospace;">
        <h1>Failed to initialize app</h1>
        <pre>${error instanceof Error ? error.message : String(error)}</pre>
        <pre>${error instanceof Error ? error.stack : ''}</pre>
      </div>
    `;
  }
}
