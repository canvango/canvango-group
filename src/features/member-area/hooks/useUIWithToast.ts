import { useUI } from '../contexts/UIContext';
import { useToast } from '../../../shared/contexts/ToastContext';

/**
 * Combined hook that provides both UI context and Toast context
 * This is a convenience hook that combines useUI and useToast
 * 
 * @returns Combined UI and Toast context values
 * 
 * @example
 * ```tsx
 * const { 
 *   sidebarOpen, 
 *   toggleSidebar, 
 *   theme, 
 *   toggleTheme,
 *   showSuccess,
 *   showError 
 * } = useUIWithToast();
 * 
 * // Toggle sidebar
 * toggleSidebar();
 * 
 * // Show success notification
 * showSuccess('Operation completed successfully');
 * ```
 */
export const useUIWithToast = () => {
  const ui = useUI();
  const toast = useToast();

  return {
    ...ui,
    ...toast
  };
};
