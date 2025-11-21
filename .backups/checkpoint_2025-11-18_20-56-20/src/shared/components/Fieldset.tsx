import React from 'react';

export interface FieldsetProps {
  legend: string;
  children: React.ReactNode;
  description?: string;
  required?: boolean;
  className?: string;
}

/**
 * Fieldset component for grouping related form inputs
 * Provides semantic structure and accessibility for form groups
 */
const Fieldset: React.FC<FieldsetProps> = ({
  legend,
  children,
  description,
  required = false,
  className = ''
}) => {
  const legendId = `fieldset-${Math.random().toString(36).substring(2, 9)}`;
  const descriptionId = description ? `${legendId}-description` : undefined;

  return (
    <fieldset
      className={`border border-gray-200 rounded-lg p-4 ${className}`}
      aria-describedby={descriptionId}
    >
      <legend
        id={legendId}
        className="text-sm font-medium text-gray-900 px-2 -ml-2"
      >
        {legend}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">
            *
          </span>
        )}
      </legend>

      {description && (
        <p
          id={descriptionId}
          className="text-sm text-gray-600 mt-1 mb-3"
        >
          {description}
        </p>
      )}

      <div className="space-y-4 mt-3">
        {children}
      </div>
    </fieldset>
  );
};

export default Fieldset;
