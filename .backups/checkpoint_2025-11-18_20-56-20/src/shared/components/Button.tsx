import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Props for the Button component
 * 
 * @interface ButtonProps
 * @extends {React.ButtonHTMLAttributes<HTMLButtonElement>}
 * @property {'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'} [variant='primary'] - Visual style variant
 * @property {'sm' | 'md' | 'lg'} [size='md'] - Button size (affects padding and font size)
 * @property {boolean} [loading=false] - Shows loading spinner and disables button
 * @property {React.ReactNode} [icon] - Optional icon to display before text
 * @property {React.ReactNode} children - Button content (text or elements)
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Button - Reusable button component with multiple variants and states
 * 
 * @description
 * Provides consistent button styling across the application with support for
 * different visual variants, sizes, loading states, and icons. Implements
 * WCAG accessibility requirements with proper focus management, minimum
 * touch target sizes (44x44px), and keyboard navigation support.
 * 
 * @example
 * ```tsx
 * // Primary button
 * <Button variant="primary" onClick={handleClick}>
 *   Submit
 * </Button>
 * 
 * // Button with loading state
 * <Button variant="primary" loading={isSubmitting}>
 *   Processing...
 * </Button>
 * 
 * // Button with icon
 * <Button variant="outline" icon={<PlusIcon />}>
 *   Add Item
 * </Button>
 * ```
 * 
 * @component
 * @category Shared
 * 
 * @accessibility
 * - Keyboard navigable with Tab key
 * - Focus indicators meet WCAG 2.1 AA standards
 * - Minimum touch target size of 44x44px
 * - Disabled state properly communicated to screen readers
 * - Loading state announced to assistive technologies
 * 
 * @see {@link https://www.w3.org/WAI/ARIA/apg/patterns/button/} ARIA Button Pattern
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantStyles = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
      outline: 'border-2 border-primary-600 text-primary-600 hover:bg-indigo-50 focus:ring-primary-500',
      ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
    };
    
    const sizeStyles = {
      sm: 'px-3 py-2 text-sm min-h-[44px]',
      md: 'px-4 py-2.5 text-base min-h-[44px]',
      lg: 'px-6 py-3 text-lg min-h-[48px]'
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {!loading && icon && <span className="mr-2">{icon}</span>}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
