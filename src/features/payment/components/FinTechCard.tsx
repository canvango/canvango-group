/**
 * FinTech Card Components
 * Reusable card components with modern fintech styling
 */

import React from 'react';

// Info Row Component
interface InfoRowProps {
  label: string;
  value: string | React.ReactNode;
  valueClassName?: string;
}

export const InfoRow: React.FC<InfoRowProps> = ({ label, value, valueClassName = '' }) => {
  return (
    <div className="flex justify-between items-start gap-4 py-3 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-600 font-medium">{label}</span>
      <span className={`text-sm text-slate-900 font-semibold text-right ${valueClassName}`}>
        {value}
      </span>
    </div>
  );
};

// Section Header
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold text-slate-900 mb-1">{title}</h2>
      {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
    </div>
  );
};

// Alert Box
interface AlertBoxProps {
  type: 'info' | 'success' | 'warning' | 'error';
  children: React.ReactNode;
}

export const AlertBox: React.FC<AlertBoxProps> = ({ type, children }) => {
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    error: 'bg-red-50 border-red-200 text-red-800',
  };

  return (
    <div className={`rounded-xl border px-4 py-3 ${styles[type]}`}>
      <div className="text-xs leading-relaxed">{children}</div>
    </div>
  );
};

// Divider
export const Divider: React.FC = () => {
  return <div className="border-t border-slate-200 my-6" />;
};

// Amount Display
interface AmountDisplayProps {
  label: string;
  amount: number;
  highlight?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const AmountDisplay: React.FC<AmountDisplayProps> = ({
  label,
  amount,
  highlight = false,
  size = 'md',
}) => {
  const sizeStyles = {
    sm: 'text-base',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="text-center py-4">
      <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">{label}</p>
      <p
        className={`font-bold ${sizeStyles[size]} ${
          highlight ? 'text-blue-600' : 'text-slate-900'
        }`}
      >
        {formatCurrency(amount)}
      </p>
    </div>
  );
};

// Button
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  fullWidth = false,
  disabled = false,
}) => {
  const baseStyles = 'px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200';
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    outline: 'border-2 border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${
        fullWidth ? 'w-full' : ''
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};

// QR Code Container
interface QRCodeContainerProps {
  qrUrl: string;
  title?: string;
  subtitle?: string;
}

export const QRCodeContainer: React.FC<QRCodeContainerProps> = ({
  qrUrl,
  title,
  subtitle,
}) => {
  return (
    <div className="text-center">
      {title && (
        <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      )}
      <div className="inline-block p-6 bg-white rounded-xl border-2 border-slate-200 shadow-sm">
        <img
          src={qrUrl}
          alt="QR Code"
          className="w-64 h-64 lg:w-72 lg:h-72"
        />
      </div>
      {subtitle && (
        <p className="text-xs text-slate-500 mt-4 max-w-xs mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
};

// Timer Display
interface TimerDisplayProps {
  label: string;
  timeString: string;
  sublabel?: string;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  label,
  timeString,
  sublabel,
}) => {
  return (
    <div className="text-right">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-red-500 tabular-nums">{timeString}</p>
      {sublabel && <p className="text-xs text-slate-400 mt-1">{sublabel}</p>}
    </div>
  );
};
