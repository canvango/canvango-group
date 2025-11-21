import { useToast } from '../contexts/ToastContext';

/**
 * Custom hook for showing notifications
 * Provides a simple interface for success, error, info, and warning messages
 * 
 * This is a convenience wrapper around useToast that provides a simpler API
 * for common notification scenarios.
 * 
 * @example
 * ```tsx
 * const notification = useNotification();
 * 
 * // Show success message
 * notification.success('Profile updated successfully');
 * 
 * // Show error message
 * notification.error('Failed to save changes');
 * 
 * // Show info message
 * notification.info('New features available');
 * 
 * // Show warning message
 * notification.warning('Your session will expire soon');
 * ```
 */
export const useNotification = () => {
  const { showSuccess, showError, showInfo, showWarning } = useToast();

  return {
    /**
     * Show a success notification
     * @param message - The message to display
     * @param description - Optional description for more details
     */
    success: (message: string, description?: string) => {
      showSuccess(message, description);
    },
    
    /**
     * Show an error notification
     * @param message - The message to display
     * @param description - Optional description for more details
     */
    error: (message: string, description?: string) => {
      showError(message, description);
    },
    
    /**
     * Show an info notification
     * @param message - The message to display
     * @param description - Optional description for more details
     */
    info: (message: string, description?: string) => {
      showInfo(message, description);
    },
    
    /**
     * Show a warning notification
     * @param message - The message to display
     * @param description - Optional description for more details
     */
    warning: (message: string, description?: string) => {
      showWarning(message, description);
    },
  };
};
