import React from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle, Loader } from 'lucide-react';
import Badge from '../../../../shared/components/Badge';

export type Status = 
  | 'success' 
  | 'failed' 
  | 'pending' 
  | 'processing' 
  | 'approved' 
  | 'rejected' 
  | 'completed' 
  | 'cancelled'
  | 'active'
  | 'expired';

export interface StatusBadgeProps {
  status: Status;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const STATUS_CONFIG: Record<Status, {
  label: string;
  variant: 'success' | 'warning' | 'error' | 'info' | 'default' | 'primary' | 'pending' | 'approved' | 'rejected';
  icon: React.ReactNode;
}> = {
  success: {
    label: 'Success',
    variant: 'success',
    icon: <CheckCircle className="w-4 h-4" />,
  },
  failed: {
    label: 'Failed',
    variant: 'error',
    icon: <XCircle className="w-4 h-4" />,
  },
  pending: {
    label: 'Pending',
    variant: 'pending',
    icon: <Clock className="w-4 h-4" />,
  },
  processing: {
    label: 'Processing',
    variant: 'info',
    icon: <Loader className="w-4 h-4 animate-spin" />,
  },
  approved: {
    label: 'Approved',
    variant: 'approved',
    icon: <CheckCircle className="w-4 h-4" />,
  },
  rejected: {
    label: 'Rejected',
    variant: 'rejected',
    icon: <XCircle className="w-4 h-4" />,
  },
  completed: {
    label: 'Completed',
    variant: 'success',
    icon: <CheckCircle className="w-4 h-4" />,
  },
  cancelled: {
    label: 'Cancelled',
    variant: 'default',
    icon: <XCircle className="w-4 h-4" />,
  },
  active: {
    label: 'Active',
    variant: 'success',
    icon: <CheckCircle className="w-4 h-4" />,
  },
  expired: {
    label: 'Expired',
    variant: 'error',
    icon: <AlertCircle className="w-4 h-4" />,
  },
};

/**
 * StatusBadge component for displaying status indicators
 * Provides consistent styling and icons for different status types
 */
const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
  className = '',
}) => {
  const config = STATUS_CONFIG[status];

  if (!config) {
    console.warn(`Unknown status: ${status}`);
    return (
      <Badge variant="default" size={size} className={className}>
        {status}
      </Badge>
    );
  }

  return (
    <Badge
      variant={config.variant}
      size={size}
      icon={showIcon ? config.icon : undefined}
      className={className}
    >
      {config.label}
    </Badge>
  );
};

export default StatusBadge;
