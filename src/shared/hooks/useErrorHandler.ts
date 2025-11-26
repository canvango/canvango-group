import { useCallback } from 'react';
import { useToast } from '../contexts/ToastContext';
import { ApplicationError, getErrorMessage, getErrorSuggestion } from '../utils/errors';
import { isDev } from '../utils/env';

interface ErrorHandlerOptions {
  /**
   * Custom error message to display instead of the default
   */
  customMessage?: string;
  
  /**
   * Whether to show a toast notification for this error
   * @default true
   */
  showToast?: boolean;
  
  /**
   * Whether to include a retry action in the toast
   * @default false
   */
  showRetry?: boolean;
  
  /**
   * Callback to execute when retry is clicked
   */
  onRetry?: () => void;
  
  /**
   * Whether to log the error to console
   * @default true in development
   */
  logError?: boolean;
}

/**
 * Hook for consistent error handling across the application
 * 
 * @example
 * ```tsx
 * const { handleError } = useErrorHandler();
 * 
 * try {
 *   await purchaseProduct(productId);
 * } catch (error) {
 *   handleError(error, {
 *     customMessage: 'Failed to purchase product',
 *     showRetry: true,
 *     onRetry: () => purchaseProduct(productId)
 *   });
 * }
 * ```
 */
export const useErrorHandler = () => {
  const { showError, showWarning } = useToast();

  const handleError = useCallback(
    (error: unknown, options: ErrorHandlerOptions = {}) => {
      const {
        customMessage,
        showToast = true,
        showRetry = false,
        onRetry,
        logError = isDev()
      } = options;

      // Log error if enabled
      if (logError) {
        console.error('Error handled:', error);
      }

      // Get error message
      let message: string;
      let description: string | undefined;
      let isRetryable = false;

      if (error instanceof ApplicationError) {
        // Use custom message if provided, otherwise use error message
        message = customMessage || error.message || getErrorMessage(error);
        description = getErrorSuggestion(error);
        isRetryable = error.type === 'network' || error.type === 'server';
      } else {
        // Handle non-ApplicationError errors
        message = customMessage || getErrorMessage(error);
      }

      // Show toast notification if enabled
      if (showToast) {
        const toastAction = (showRetry || isRetryable) && onRetry
          ? {
              label: 'Coba Lagi',
              onClick: onRetry
            }
          : undefined;

        // Use warning for retryable errors, error for others
        if (isRetryable) {
          showWarning(message, description);
        } else {
          showError(message, description);
        }

        // If there's a retry action, show it in a separate toast
        if (toastAction) {
          setTimeout(() => {
            showWarning('Terjadi kesalahan', 'Klik untuk mencoba lagi');
          }, 100);
        }
      }

      // Return error details for further handling if needed
      return {
        message,
        description,
        isRetryable,
        originalError: error
      };
    },
    [showError, showWarning]
  );

  /**
   * Handle validation errors specifically
   * Useful for form validation errors
   */
  const handleValidationError = useCallback(
    (error: unknown, fieldErrors?: Record<string, string>) => {
      if (error instanceof ApplicationError && error.type === 'validation') {
        const message = 'Terdapat kesalahan pada input Anda';
        const description = error.details
          ? Object.values(error.details).join(', ')
          : 'Silakan periksa kembali form Anda';

        showError(message, description);

        return {
          message,
          description,
          fieldErrors: error.details || fieldErrors
        };
      }

      return handleError(error);
    },
    [handleError, showError]
  );

  /**
   * Handle authentication errors specifically
   * Redirects to login page
   */
  const handleAuthError = useCallback(
    (error: unknown) => {
      if (error instanceof ApplicationError && error.type === 'authentication') {
        showError(
          'Sesi Anda telah berakhir',
          'Silakan login kembali untuk melanjutkan'
        );

        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);

        return;
      }

      handleError(error);
    },
    [handleError, showError]
  );

  /**
   * Handle network errors specifically
   * Shows offline indicator
   */
  const handleNetworkError = useCallback(
    (error: unknown, onRetry?: () => void) => {
      if (error instanceof ApplicationError && error.type === 'network') {
        showError(
          'Koneksi internet terputus',
          'Periksa koneksi internet Anda dan coba lagi'
        );

        if (onRetry) {
          setTimeout(() => {
            showWarning('Koneksi terputus', 'Klik untuk mencoba lagi');
          }, 100);
        }

        return;
      }

      handleError(error, { showRetry: true, onRetry });
    },
    [handleError, showError, showWarning]
  );

  return {
    handleError,
    handleValidationError,
    handleAuthError,
    handleNetworkError
  };
};
