/**
 * useErrorHandler Hook
 * Hook for handling errors with toast notifications
 */

import { useCallback } from 'react';
import { useToast } from '../components/shared/ToastProvider';
import { getUserFriendlyMessage, logError, AppError } from '../utils/errors';

interface UseErrorHandlerReturn {
  handleError: (error: any, context?: string) => void;
  handleErrorSilently: (error: any, context?: string) => void;
}

/**
 * useErrorHandler - Hook for centralized error handling
 */
export const useErrorHandler = (): UseErrorHandlerReturn => {
  const { error: showErrorToast } = useToast();

  /**
   * Handle error with toast notification
   */
  const handleError = useCallback(
    (error: any, context?: string) => {
      // Log error
      logError(error, context);

      // Get user-friendly message
      const message = getUserFriendlyMessage(error);

      // Show toast
      showErrorToast(message);
    },
    [showErrorToast]
  );

  /**
   * Handle error silently (log only, no toast)
   */
  const handleErrorSilently = useCallback((error: any, context?: string) => {
    logError(error, context);
  }, []);

  return {
    handleError,
    handleErrorSilently
  };
};

export default useErrorHandler;
