import React from 'react';
import { AlertTriangle, Info, AlertCircle, HelpCircle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info' | 'default';
  isLoading?: boolean;
}

const variantConfig = {
  danger: {
    icon: AlertCircle,
    iconColor: 'text-red-600',
    iconBg: 'bg-red-100',
    confirmVariant: 'danger' as const
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-100',
    confirmVariant: 'primary' as const
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
    confirmVariant: 'primary' as const
  },
  default: {
    icon: HelpCircle,
    iconColor: 'text-gray-600',
    iconBg: 'bg-gray-100',
    confirmVariant: 'primary' as const
  }
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  isLoading = false
}) => {
  const config = variantConfig[variant];
  const Icon = config.icon;

  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Confirmation action failed:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 ${config.iconBg} rounded-full p-3`}>
            <Icon className={`w-6 h-6 ${config.iconColor}`} aria-hidden="true" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {title}
            </h3>
            <p className="text-sm text-gray-600">
              {message}
            </p>
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={config.confirmVariant}
            onClick={handleConfirm}
            loading={isLoading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Hook for using confirmation dialogs
export const useConfirmDialog = () => {
  const [dialogState, setDialogState] = React.useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void | Promise<void>;
    variant?: 'danger' | 'warning' | 'info' | 'default';
    confirmLabel?: string;
    cancelLabel?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    variant: 'default'
  });

  const [isLoading, setIsLoading] = React.useState(false);

  const confirm = (options: {
    title: string;
    message: string;
    onConfirm: () => void | Promise<void>;
    variant?: 'danger' | 'warning' | 'info' | 'default';
    confirmLabel?: string;
    cancelLabel?: string;
  }) => {
    setDialogState({
      isOpen: true,
      ...options
    });
  };

  const handleClose = () => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
    setIsLoading(false);
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await dialogState.onConfirm();
      handleClose();
    } catch (error) {
      console.error('Confirmation action failed:', error);
      setIsLoading(false);
    }
  };

  const ConfirmDialogComponent = () => (
    <ConfirmDialog
      isOpen={dialogState.isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
      title={dialogState.title}
      message={dialogState.message}
      variant={dialogState.variant}
      confirmLabel={dialogState.confirmLabel}
      cancelLabel={dialogState.cancelLabel}
      isLoading={isLoading}
    />
  );

  return {
    confirm,
    ConfirmDialog: ConfirmDialogComponent
  };
};
