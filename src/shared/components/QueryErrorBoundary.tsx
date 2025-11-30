/**
 * Query Error Boundary Component
 * 
 * Displays user-friendly error UI with retry functionality
 * for React Query errors.
 */

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';

interface QueryErrorBoundaryProps {
  error: Error;
  reset: () => void;
}

export const QueryErrorBoundary: React.FC<QueryErrorBoundaryProps> = ({ error, reset }) => {
  const isNetworkError = 
    error.message?.includes('fetch') || 
    error.message?.includes('network') ||
    error.message?.includes('Failed to fetch');

  const isAuthError = 
    error.message?.includes('401') ||
    error.message?.includes('403') ||
    error.message?.includes('unauthorized') ||
    error.message?.includes('session');

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-lg p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-red-100 rounded-full p-3">
            <AlertTriangle className="w-12 h-12 text-red-600" />
          </div>
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {isAuthError ? 'Sesi Berakhir' : isNetworkError ? 'Koneksi Terputus' : 'Terjadi Kesalahan'}
        </h2>
        
        <p className="text-sm text-gray-700 mb-6">
          {isAuthError 
            ? 'Sesi Anda telah berakhir. Silakan login kembali untuk melanjutkan.'
            : isNetworkError
            ? 'Koneksi internet terputus. Periksa koneksi Anda dan coba lagi.'
            : 'Terjadi kesalahan saat memuat data. Silakan coba lagi.'}
        </p>

        <div className="flex gap-3 justify-center">
          <Button
            variant="primary"
            onClick={reset}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Coba Lagi
          </Button>
          
          {isAuthError && (
            <Button
              variant="outline"
              onClick={() => window.location.href = '/login'}
            >
              Login
            </Button>
          )}
        </div>

        {/* Show error details in development */}
        {import.meta.env.DEV && (
          <details className="mt-6 text-left">
            <summary className="text-xs text-gray-500 cursor-pointer mb-2">
              Detail Error (Development)
            </summary>
            <pre className="text-xs text-red-600 bg-red-50 p-3 rounded-xl overflow-auto max-h-40">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};
