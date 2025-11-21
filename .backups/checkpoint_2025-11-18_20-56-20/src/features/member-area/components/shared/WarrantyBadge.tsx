import React from 'react';
import { Shield, AlertCircle, XCircle } from 'lucide-react';
import Badge from '../../../../shared/components/Badge';
import { formatDate } from '../../utils/formatters';

export interface WarrantyBadgeProps {
  expiresAt?: Date;
  claimed?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showDate?: boolean;
  className?: string;
}

/**
 * WarrantyBadge component for displaying warranty status
 * Shows active, expired, or claimed warranty status with appropriate styling
 */
const WarrantyBadge: React.FC<WarrantyBadgeProps> = ({
  expiresAt,
  claimed = false,
  size = 'md',
  showIcon = true,
  showDate = false,
  className = '',
}) => {
  // No warranty
  if (!expiresAt) {
    return (
      <Badge
        variant="default"
        size={size}
        icon={showIcon ? <XCircle className="w-4 h-4" /> : undefined}
        className={className}
      >
        No Warranty
      </Badge>
    );
  }

  const now = new Date();
  const expirationDate = new Date(expiresAt);
  const isExpired = expirationDate < now;

  // Claimed warranty
  if (claimed) {
    return (
      <Badge
        variant="info"
        size={size}
        icon={showIcon ? <Shield className="w-4 h-4" /> : undefined}
        className={className}
      >
        Claimed
      </Badge>
    );
  }

  // Expired warranty
  if (isExpired) {
    return (
      <Badge
        variant="error"
        size={size}
        icon={showIcon ? <AlertCircle className="w-4 h-4" /> : undefined}
        className={className}
      >
        Expired {showDate && `(${formatDate(expirationDate)})`}
      </Badge>
    );
  }

  // Active warranty
  const daysRemaining = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isExpiringSoon = daysRemaining <= 7;

  return (
    <Badge
      variant={isExpiringSoon ? 'warning' : 'success'}
      size={size}
      icon={showIcon ? <Shield className="w-4 h-4" /> : undefined}
      className={className}
    >
      {isExpiringSoon ? `${daysRemaining} days left` : 'Active'}
      {showDate && ` (${formatDate(expirationDate)})`}
    </Badge>
  );
};

export default WarrantyBadge;
