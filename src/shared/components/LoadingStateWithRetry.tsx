/**
 * Loading State with Retry Component
 * 
 * Shows loading spinner with timeout detection and retry button.
 * Prevents infinite loading states.
 */

import React, { useEffect, useState } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import Button from './Button';

interface LoadingStateWithRetryProps {
  message?: string;
  timeout?: number; // milliseconds before showing retry
  onRetry?: () => void;
}

export const LoadingStateWithRetry: React.FC<LoadingStateWithRetryProps> = ({
  message = 'Memuat data...',
  timeout = 15000, // 15 seconds default
  onRetry,
}) => {
  const [showRetry, setShowRetry] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    // Show retry button after timeout
    const timeoutId = setTimeout(() => {
      setShowRetry(true);
    }, timeout);

    // Update elapsed time every second
    const intervalId = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [timeout]);

  const handleRetry = () => {
    setShowRetry(false);
    setElapsedSeconds(0);
    onRetry?.();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
      <div className="max-w-md w-full text-center">
        {!showRetry ? (
          <>
            {/* Loading Spinner */}
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
            
            <p className="text-sm text-gray-700 mb-2">{message}</p>
            
            {elapsedSeconds > 5 && (
              <p className="text-xs text-gray-500">
                {elapsedSeconds} detik...
              </p>
            )}
          </>
        ) : (
          <>
            {/* Timeout Warning */}
            <div className="flex justify-center mb-4">
              <div className="bg-yellow-100 rounded-full p-3">
                <AlertCircle className="w-12 h-12 text-yellow-600" />
              </div>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Memuat Terlalu Lama
            </h3>
            
            <p className="text-sm text-gray-700 mb-6">
              Permintaan memakan waktu lebih lama dari biasanya. 
              Periksa koneksi internet Anda atau coba lagi.
            </p>

            <div className="flex gap-3 justify-center">
              <Button
                variant="primary"
                onClick={handleRetry}
                icon={<RefreshCw className="w-4 h-4" />}
              >
                Coba Lagi
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Refresh Halaman
              </Button>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              Jika masalah berlanjut, silakan hubungi support.
            </p>
          </>
        )}
      </div>
    </div>
  );
};
