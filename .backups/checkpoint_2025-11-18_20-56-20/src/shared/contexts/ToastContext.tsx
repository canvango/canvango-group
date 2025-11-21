import React, { createContext, useContext, useState, useCallback } from 'react';
import { ToastContainer } from '../components/ToastContainer';
import { ToastProps } from '../components/Toast';

interface ToastOptions {
  type?: 'success' | 'error' | 'warning' | 'info';
  message: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  showToast: (options: ToastOptions) => void;
  showSuccess: (message: string, description?: string) => void;
  showError: (message: string, description?: string) => void;
  showWarning: (message: string, description?: string) => void;
  showInfo: (message: string, description?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((options: ToastOptions) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastProps = {
      id,
      type: options.type || 'info',
      message: options.message,
      description: options.description,
      duration: options.duration ?? 5000,
      action: options.action,
      onClose: removeToast
    };

    setToasts((prev) => [...prev, newToast]);
  }, [removeToast]);

  const showSuccess = useCallback((message: string, description?: string) => {
    showToast({ type: 'success', message, description });
  }, [showToast]);

  const showError = useCallback((message: string, description?: string) => {
    showToast({ type: 'error', message, description, duration: 7000 });
  }, [showToast]);

  const showWarning = useCallback((message: string, description?: string) => {
    showToast({ type: 'warning', message, description });
  }, [showToast]);

  const showInfo = useCallback((message: string, description?: string) => {
    showToast({ type: 'info', message, description });
  }, [showToast]);

  return (
    <ToastContext.Provider
      value={{
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        removeToast
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
