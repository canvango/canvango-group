import React from 'react';
import { useToast, Toast } from '../../contexts/ToastContext';
import {
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const ToastItem: React.FC<{ toast: Toast; onClose: (id: string) => void }> = ({ toast, onClose }) => {
  const icons = {
    success: CheckCircleIcon,
    error: XCircleIcon,
    info: InformationCircleIcon,
    warning: ExclamationTriangleIcon,
  };

  const styles = {
    success: 'bg-success-50 border-success-500 text-success-800',
    error: 'bg-danger-50 border-danger-500 text-danger-800',
    info: 'bg-primary-50 border-primary-500 text-primary-800',
    warning: 'bg-warning-50 border-warning-500 text-warning-800',
  };

  const iconStyles = {
    success: 'text-success-500',
    error: 'text-danger-500',
    info: 'text-primary-500',
    warning: 'text-warning-500',
  };

  const Icon = icons[toast.type];

  return (
    <div
      className={`flex items-start p-4 mb-3 rounded-lg border-l-4 shadow-lg ${styles[toast.type]} animate-slide-in-right`}
      role="alert"
    >
      <Icon className={`w-5 h-5 mr-3 flex-shrink-0 ${iconStyles[toast.type]}`} />
      <div className="flex-1 text-sm font-medium">{toast.message}</div>
      <button
        onClick={() => onClose(toast.id)}
        className="ml-3 flex-shrink-0 inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
        aria-label="Close"
      >
        <XMarkIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 w-full max-w-sm space-y-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
      ))}
    </div>
  );
};

export default ToastContainer;
