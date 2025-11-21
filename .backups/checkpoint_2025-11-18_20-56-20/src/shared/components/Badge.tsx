import React from 'react';

export interface BadgeProps {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default' | 'primary' | 'pending' | 'approved' | 'rejected';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  icon,
  children,
  className = ''
}) => {
  // Using Canvango Group brand colors
  const variantStyles = {
    success: 'bg-success-100 text-success-800 border-success-200',
    warning: 'bg-warning-100 text-warning-800 border-warning-200',
    error: 'bg-danger-100 text-danger-800 border-danger-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    primary: 'bg-primary-100 text-primary-800 border-primary-200',
    default: 'bg-gray-100 text-gray-800 border-gray-200',
    // Status-specific variants
    pending: 'bg-warning-100 text-warning-800 border-warning-200',
    approved: 'bg-success-100 text-success-800 border-success-200',
    rejected: 'bg-danger-100 text-danger-800 border-danger-200',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-sm gap-1',
    lg: 'px-3 py-1.5 text-base gap-1.5'
  };

  const iconSizeStyles = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-2xl border transition-colors duration-200
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      role="status"
      aria-label={`Status: ${children}`}
    >
      {icon && (
        <span className={`flex-shrink-0 ${iconSizeStyles[size]}`}>
          {icon}
        </span>
      )}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
