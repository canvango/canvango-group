import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export interface ToastProps {
  id: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  message: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose: (id: string) => void;
}

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info
};

const colorMap = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: 'text-green-600',
    text: 'text-green-900'
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'text-red-600',
    text: 'text-red-900'
  },
  warning: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    icon: 'text-orange-600',
    text: 'text-orange-900'
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-600',
    text: 'text-blue-900'
  }
};

export const Toast: React.FC<ToastProps> = ({
  id,
  type = 'info',
  message,
  description,
  duration = 5000,
  action,
  onClose
}) => {
  const Icon = iconMap[type];
  const colors = colorMap[type];

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  return (
    <div
      className={`${colors.bg} ${colors.border} border rounded-3xl shadow-lg p-4 mb-3 min-w-[320px] max-w-md animate-slide-in-right`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <Icon className={`${colors.icon} w-5 h-5 flex-shrink-0 mt-0.5`} aria-hidden="true" />
        
        <div className="flex-1 min-w-0">
          <p className={`${colors.text} font-medium text-sm`}>
            {message}
          </p>
          {description && (
            <p className={`${colors.text} text-sm mt-1 opacity-90`}>
              {description}
            </p>
          )}
          {action && (
            <button
              onClick={action.onClick}
              className={`${colors.text} text-sm font-medium mt-2 hover:underline focus:outline-none focus:underline`}
            >
              {action.label}
            </button>
          )}
        </div>

        <button
          onClick={() => onClose(id)}
          className={`${colors.text} hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${type}-500 rounded-xl`}
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
