import React from 'react';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  label?: string;
  options: RadioOption[];
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}

/**
 * RadioGroup component with accessibility support
 * Provides keyboard navigation and screen reader support
 */
const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  label,
  options,
  value,
  onChange,
  error,
  helperText,
  required = false,
  orientation = 'vertical',
  className = ''
}) => {
  const groupId = `radio-group-${Math.random().toString(36).substring(2, 9)}`;
  const errorId = error ? `${groupId}-error` : undefined;
  const helperId = helperText ? `${groupId}-helper` : undefined;
  const hasError = !!error;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="mb-2">
          <span
            id={groupId}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
            {required && (
              <span className="text-red-500 ml-1" aria-label="required">
                *
              </span>
            )}
          </span>
        </div>
      )}

      <div
        role="radiogroup"
        aria-labelledby={label ? groupId : undefined}
        aria-describedby={errorId || helperId}
        aria-required={required}
        aria-invalid={hasError}
        className={`
          ${orientation === 'horizontal' ? 'flex flex-wrap gap-4' : 'space-y-3'}
        `}
      >
        {options.map((option) => {
          const optionId = `${name}-${option.value}`;
          const isChecked = value === option.value;

          return (
            <div key={option.value} className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  type="radio"
                  id={optionId}
                  name={name}
                  value={option.value}
                  checked={isChecked}
                  onChange={(e) => onChange(e.target.value)}
                  disabled={option.disabled}
                  className={`
                    w-4 h-4 border-gray-300 
                    ${hasError ? 'text-red-600 focus:ring-red-500' : 'text-primary-600 focus:ring-primary-500'}
                    focus:ring-2 focus:ring-offset-0
                    disabled:opacity-50 disabled:cursor-not-allowed
                    cursor-pointer
                  `}
                  aria-describedby={option.description ? `${optionId}-description` : undefined}
                />
              </div>
              <div className="ml-3">
                <label
                  htmlFor={optionId}
                  className={`
                    text-sm font-medium text-gray-900 cursor-pointer
                    ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  {option.label}
                </label>
                {option.description && (
                  <p
                    id={`${optionId}-description`}
                    className="text-sm text-gray-500"
                  >
                    {option.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <p id={errorId} className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {helperText && !error && (
        <p id={helperId} className="mt-2 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default RadioGroup;
