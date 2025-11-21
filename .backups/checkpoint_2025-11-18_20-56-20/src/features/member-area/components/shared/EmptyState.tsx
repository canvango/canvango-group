import React from 'react';
import { LucideIcon } from 'lucide-react';
import Button from '../../../../shared/components/Button';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  };
  className?: string;
}

/**
 * EmptyState component for displaying friendly messages when no data is available
 * Provides consistent styling with icon, title, description, and optional action button
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div
      className={`
        flex flex-col items-center justify-center
        py-12 px-4 text-center
        ${className}
      `}
      role="status"
      aria-live="polite"
    >
      {/* Icon */}
      <div className="mb-4 p-4 bg-gray-100 rounded-full">
        <Icon className="w-12 h-12 text-gray-400" aria-hidden="true" />
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-600 max-w-md mb-6">
        {description}
      </p>

      {/* Action Button */}
      {action && (
        <Button
          variant={action.variant || 'primary'}
          onClick={action.onClick}
          size="md"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
