import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info, AlertCircle, X } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

// Support both old and new format for backward compatibility
export interface ToastProps {
  id: string;
  message: string;
  variant?: ToastVariant;
  type?: ToastVariant; // Alias for variant (backward compatibility)
  description?: string; // Optional description (backward compatibility)
  duration?: number;
  action?: { // Optional action button (backward compatibility)
    label: string;
    onClick: () => void;
  };
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({
  id,
  message,
  variant,
  type,
  description,
  duration = 5000,
  action,
  onClose
}) => {
  // Support both variant and type (backward compatibility)
  const toastVariant = variant || type || 'info';
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const getVariantStyles = () => {
    switch (toastVariant) {
      case 'success':
        return {
          bg: 'bg-green-50 border-green-200',
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          text: 'text-green-900'
        };
      case 'error':
        return {
          bg: 'bg-red-50 border-red-200',
          icon: <XCircle className="w-5 h-5 text-red-600" />,
          text: 'text-red-900'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 border-yellow-200',
          icon: <AlertCircle className="w-5 h-5 text-yellow-600" />,
          text: 'text-yellow-900'
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-50 border-blue-200',
          icon: <Info className="w-5 h-5 text-blue-600" />,
          text: 'text-blue-900'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      className={`${styles.bg} border rounded-xl p-4 shadow-lg flex items-start gap-3 min-w-[320px] max-w-md animate-slide-in`}
      role="alert"
    >
      <div className="flex-shrink-0 mt-0.5">{styles.icon}</div>
      <div className="flex-1">
        <div className={`text-sm font-medium ${styles.text}`}>{message}</div>
        {description && (
          <div className={`text-xs mt-1 ${styles.text} opacity-80`}>{description}</div>
        )}
        {action && (
          <button
            onClick={action.onClick}
            className={`text-xs mt-2 font-medium ${styles.text} hover:underline`}
          >
            {action.label}
          </button>
        )}
      </div>
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Export both named and default for compatibility
export { Toast };
export default Toast;
