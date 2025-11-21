/**
 * Canvango Group Design System
 * Centralized design tokens for consistent styling across the application
 */

/**
 * Shadow utilities
 */
export const SHADOWS = {
  none: 'shadow-none',
  sm: 'shadow-sm',
  base: 'shadow',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
  soft: 'shadow-soft',
  card: 'shadow-card',
} as const;

/**
 * Border radius utilities
 */
export const ROUNDED = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  base: 'rounded',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
} as const;

/**
 * Transition utilities
 */
export const TRANSITIONS = {
  none: 'transition-none',
  all: 'transition-all duration-200 ease-smooth',
  colors: 'transition-colors duration-200 ease-smooth',
  opacity: 'transition-opacity duration-200 ease-smooth',
  transform: 'transition-transform duration-200 ease-smooth',
  fast: 'transition-all duration-150 ease-smooth',
  slow: 'transition-all duration-300 ease-smooth',
} as const;

/**
 * Hover state utilities
 */
export const HOVER_EFFECTS = {
  // Background hover effects
  bgGray: 'hover:bg-gray-100',
  bgPrimary: 'hover:bg-primary-50',
  bgPrimaryDark: 'hover:bg-primary-700',
  bgSuccess: 'hover:bg-success-50',
  bgWarning: 'hover:bg-warning-50',
  bgDanger: 'hover:bg-danger-50',
  
  // Scale hover effects
  scaleUp: 'hover:scale-105',
  scaleDown: 'hover:scale-95',
  
  // Shadow hover effects
  shadowMd: 'hover:shadow-md',
  shadowLg: 'hover:shadow-lg',
  shadowXl: 'hover:shadow-xl',
  
  // Opacity hover effects
  opacity80: 'hover:opacity-80',
  opacity90: 'hover:opacity-90',
} as const;

/**
 * Focus state utilities
 */
export const FOCUS_STYLES = {
  ring: 'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
  ringInset: 'focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500',
  outline: 'focus:outline-2 focus:outline-primary-500',
} as const;

/**
 * Interactive element base styles
 */
export const INTERACTIVE_BASE = `
  ${TRANSITIONS.colors}
  ${FOCUS_STYLES.ring}
  cursor-pointer
  select-none
`.trim();

/**
 * Card base styles
 */
export const CARD_BASE = `
  bg-white
  ${ROUNDED.lg}
  ${SHADOWS.card}
  border border-gray-200
`.trim();

/**
 * Button base styles
 */
export const BUTTON_BASE = `
  ${INTERACTIVE_BASE}
  inline-flex
  items-center
  justify-center
  font-medium
  ${ROUNDED.lg}
  disabled:opacity-50
  disabled:cursor-not-allowed
`.trim();

/**
 * Input base styles
 */
export const INPUT_BASE = `
  ${TRANSITIONS.colors}
  ${FOCUS_STYLES.ring}
  w-full
  px-4
  py-2
  border
  border-gray-300
  ${ROUNDED.lg}
  placeholder:text-gray-400
  disabled:bg-gray-50
  disabled:cursor-not-allowed
`.trim();

/**
 * Get combined classes for common patterns
 */
export const getCardClasses = (hover = false): string => {
  return `${CARD_BASE} ${hover ? HOVER_EFFECTS.shadowMd : ''}`.trim();
};

export const getButtonClasses = (variant: 'primary' | 'secondary' | 'outline' | 'ghost' = 'primary'): string => {
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50',
    ghost: 'text-primary-600 hover:bg-primary-50',
  };
  
  return `${BUTTON_BASE} ${variantClasses[variant]}`.trim();
};

export const getInputClasses = (hasError = false): string => {
  const errorClasses = hasError 
    ? 'border-danger-500 focus:ring-danger-500' 
    : 'border-gray-300 focus:ring-primary-500';
  
  return `${INPUT_BASE} ${errorClasses}`.trim();
};

/**
 * Spacing scale (matches Tailwind's spacing)
 */
export const SPACING = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
} as const;

/**
 * Typography scale
 */
export const TYPOGRAPHY = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl',
} as const;

/**
 * Font weights
 */
export const FONT_WEIGHTS = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
} as const;

/**
 * Color utilities
 */
export const COLORS = {
  primary: {
    50: 'bg-primary-50',
    100: 'bg-primary-100',
    500: 'bg-primary-500',
    600: 'bg-primary-600',
    700: 'bg-primary-700',
  },
  success: {
    50: 'bg-success-50',
    100: 'bg-success-100',
    500: 'bg-success-500',
    600: 'bg-success-600',
  },
  warning: {
    50: 'bg-warning-50',
    100: 'bg-warning-100',
    500: 'bg-warning-500',
    600: 'bg-warning-600',
  },
  danger: {
    50: 'bg-danger-50',
    100: 'bg-danger-100',
    500: 'bg-danger-500',
    600: 'bg-danger-600',
  },
  gray: {
    50: 'bg-gray-50',
    100: 'bg-gray-100',
    200: 'bg-gray-200',
    500: 'bg-gray-500',
    600: 'bg-gray-600',
    700: 'bg-gray-700',
    800: 'bg-gray-800',
    900: 'bg-gray-900',
  },
} as const;

/**
 * Text color utilities
 */
export const TEXT_COLORS = {
  primary: 'text-primary-600',
  success: 'text-success-600',
  warning: 'text-warning-600',
  danger: 'text-danger-600',
  gray: {
    500: 'text-gray-500',
    600: 'text-gray-600',
    700: 'text-gray-700',
    800: 'text-gray-800',
    900: 'text-gray-900',
  },
} as const;
