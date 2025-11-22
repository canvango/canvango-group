import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Props for the Input component
 * 
 * @interface InputProps
 * @extends {React.InputHTMLAttributes<HTMLInputElement>}
 * @property {string} [label] - Label text displayed above the input
 * @property {string} [error] - Error message to display (shows error state)
 * @property {string} [helperText] - Helper text displayed below input
 * @property {React.ReactNode} [prefixIcon] - Icon displayed at the start of input
 * @property {React.ReactNode} [suffixIcon] - Icon displayed at the end of input
 * @property {string} [leftAddon] - Text addon displayed at the left of input (e.g., "Rp", "$")
 * @property {string} [rightAddon] - Text addon displayed at the right of input (e.g., "%", "kg")
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  leftAddon?: string;
  rightAddon?: string;
}

/**
 * Input - Form input component with validation and icon support
 * 
 * @description
 * Provides a consistent input field with label, error handling, helper text,
 * and optional prefix/suffix icons. Automatically generates unique IDs for
 * accessibility and properly associates labels with inputs. Supports all
 * standard HTML input types and attributes.
 * 
 * @example
 * ```tsx
 * // Basic input
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="Enter your email"
 * />
 * 
 * // Input with error
 * <Input
 *   label="Password"
 *   type="password"
 *   error="Password must be at least 8 characters"
 * />
 * 
 * // Input with icons
 * <Input
 *   label="Search"
 *   prefixIcon={<SearchIcon />}
 *   placeholder="Search products..."
 * />
 * ```
 * 
 * @component
 * @category Shared
 * 
 * @accessibility
 * - Labels properly associated with inputs via htmlFor/id
 * - Error messages announced to screen readers with role="alert"
 * - aria-invalid set when error is present
 * - aria-describedby links to helper text or error message
 * - Minimum touch target size of 44px height
 * - Required fields indicated visually and semantically
 * 
 * @see {@link FormField} for complete form field with validation
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      prefixIcon,
      suffixIcon,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {prefixIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {prefixIcon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={`
              block w-full rounded-lg border min-h-[44px]
              ${hasError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'}
              ${prefixIcon ? 'pl-10' : 'pl-3'}
              ${suffixIcon ? 'pr-10' : 'pr-3'}
              py-2.5 text-gray-900 placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-offset-0
              disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
              transition-colors duration-200
              ${className}
            `}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />
          
          {suffixIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {suffixIcon}
            </div>
          )}
          
          {hasError && !suffixIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
          )}
        </div>
        
        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="mt-1 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
