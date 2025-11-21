import { useToast } from '../contexts/ToastContext';

/**
 * Custom hook for showing notifications
 * Provides a simple interface for success, error, info, and warning messages
 */
export const useNotification = () => {
  const { showToast } = useToast();

  return {
    success: (message: string, duration?: number) => showToast('success', message, duration),
    error: (message: string, duration?: number) => showToast('error', message, duration),
    info: (message: string, duration?: number) => showToast('info', message, duration),
    warning: (message: string, duration?: number) => showToast('warning', message, duration),
  };
};
