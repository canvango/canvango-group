import React from 'react';
import Input, { InputProps } from './Input';

interface FormFieldProps extends Omit<InputProps, 'onChange' | 'onBlur'> {
  name: string;
  value: any;
  error?: string;
  touched?: boolean;
  onChange: (name: string, value: any) => void;
  onBlur: (name: string) => void;
}

export const FormField: React.FC<FormFieldProps> = ({
  name,
  value,
  error,
  touched,
  onChange,
  onBlur,
  ...inputProps
}) => {
  return (
    <Input
      {...inputProps}
      value={value}
      error={touched ? error : undefined}
      onChange={(e) => onChange(name, e.target.value)}
      onBlur={() => onBlur(name)}
    />
  );
};

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          className={`
            block w-full rounded-lg border
            ${hasError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'}
            px-3 py-2.5 text-gray-900 placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            transition-colors duration-200
            ${className}
          `}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
          {...props}
        />

        {error && (
          <p id={`${textareaId}-error`} className="mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={`${textareaId}-helper`} className="mt-1 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

interface FormTextAreaFieldProps extends Omit<TextAreaProps, 'onChange' | 'onBlur'> {
  name: string;
  value: any;
  error?: string;
  touched?: boolean;
  onChange: (name: string, value: any) => void;
  onBlur: (name: string) => void;
}

export const FormTextAreaField: React.FC<FormTextAreaFieldProps> = ({
  name,
  value,
  error,
  touched,
  onChange,
  onBlur,
  ...textareaProps
}) => {
  return (
    <TextArea
      {...textareaProps}
      value={value}
      error={touched ? error : undefined}
      onChange={(e) => onChange(name, e.target.value)}
      onBlur={() => onBlur(name)}
    />
  );
};
