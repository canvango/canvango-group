import React from 'react';
import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react';
import { ApplicationError, ErrorType } from '../utils/errors';

interface ErrorFallbackProps {
  error: Error | ApplicationError;
  onRetry?: () => void;
  title?: string;
  showRetry?: boolean;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  onRetry,
  title = 'Terjadi Kesalahan',
  showRetry = true
}) => {
  const isNetworkError = error instanceof ApplicationError && error.type === ErrorType.NETWORK;
  const isServerError = error instanceof ApplicationError && error.type === ErrorType.SERVER;

  const getErrorIcon = () => {
    if (isNetworkError) {
      return <WifiOff className="w-8 h-8 text-red-600" />;
    }
    return <AlertCircle className="w-8 h-8 text-red-600" />;
  };

  const getErrorMessage = () => {
    if (isNetworkError) {
      return 'Tidak dapat terhubung ke server. Pastikan koneksi internet Anda stabil dan server backend sedang berjalan.';
    }
    if (isServerError) {
      return 'Server sedang mengalami masalah. Silakan coba lagi dalam beberapa saat.';
    }
    return error.message || 'Terjadi kesalahan yang tidak terduga.';
  };

  const getSuggestion = () => {
    if (isNetworkError) {
      return (
        <ul className="list-disc list-inside space-y-1 text-sm text-red-700 mt-2">
          <li>Periksa koneksi internet Anda</li>
          <li>Pastikan server backend sedang berjalan (npm run dev)</li>
          <li>Periksa apakah URL API sudah benar</li>
        </ul>
      );
    }
    if (isServerError) {
      return (
        <p className="text-sm text-red-700 mt-2">
          Jika masalah berlanjut, silakan hubungi administrator.
        </p>
      );
    }
    return null;
  };

  return (
    <div className="bg-red-50 border border-red-200 rounded-3xl p-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-0.5">
          {getErrorIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-red-900 mb-2">{title}</h3>
          <p className="text-red-700 mb-2">{getErrorMessage()}</p>
          {getSuggestion()}
          
          {showRetry && onRetry && (
            <button
              onClick={onRetry}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Coba Lagi
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Simplified version for inline errors
export const InlineError: React.FC<{ message: string; onRetry?: () => void }> = ({ 
  message, 
  onRetry 
}) => {
  return (
    <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl p-3">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
        <span className="text-sm text-red-700">{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm text-red-600 hover:text-red-700 font-medium"
        >
          Retry
        </button>
      )}
    </div>
  );
};
