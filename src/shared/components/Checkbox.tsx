import React from 'react';
import { Check, Minus } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  error?: string;
  indeterminate?: boolean;
}

/**
 * Checkbox component with accessibility support
 * Supports indeterminate state and proper ARIA attributes
 */
const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      description,
      error,
      indeterminate = false,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substring(2, 9)}`;
    const descriptionId = description ? `${checkboxId}-description` : undefined;
    const errorId = error ? `${checkboxId}-error` : undefined;
    const hasError = !!error;

    const checkboxRef = React.useRef<HTMLInputElement>(null);

    // Combine refs
    React.useImperativeHandle(ref, () => checkboxRef.current!);

    // Handle indeterminate state
    React.useEffect(() => {
      if (checkboxRef.current) {
        checkboxRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    return (
      <div className={`flex items-start ${className}`}>
        <div className="flex items-center h-5">
          <div className="relative">
            <input
              ref={checkboxRef}
              type="checkbox"
              id={checkboxId}
              className={`
                w-5 h-5 border-2 rounded
                ${hasError ? 'border-red-300 text-red-600 focus:ring-red-500' : 'border-gray-300 text-primary-600 focus:ring-primary-500'}
                focus:ring-2 focus:ring-offset-0
                disabled:opacity-50 disabled:cursor-not-allowed
                cursor-pointer
                transition-colors
              `}
              aria-describedby={descriptionId || errorId}
              aria-invalid={hasError}
              aria-checked={indeterminate ? 'mixed' : props.checked}
              {...props}
            />
            {/* Custom checkbox indicator */}
            {props.checked && !indeterminate && (
              <Check
                className="absolute top-0 left-0 w-5 h-5 text-white pointer-events-none"
                aria-hidden="true"
              />
            )}
            {indeterminate && (
              <Minus
                className="absolute top-0 left-0 w-5 h-5 text-white pointer-events-none"
                aria-hidden="true"
              />
            )}
          </div>
        </div>

        {(label || description) && (
          <div className="ml-3">
            {label && (
              <label
                htmlFor={checkboxId}
                className={`
                  text-sm font-medium text-gray-900 cursor-pointer
                  ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {label}
                {props.required && (
                  <span className="text-red-500 ml-1" aria-label="required">
                    *
                  </span>
                )}
              </label>
            )}
            {description && (
              <p
                id={descriptionId}
                className="text-sm text-gray-500"
              >
                {description}
              </p>
            )}
          </div>
        )}

        {error && (
          <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
