/**
 * UI Pattern utilities
 * Provides consistent styling patterns across the application
 */

/**
 * Transition classes
 */
export const transitions = {
  fast: 'transition-all duration-150 ease-in-out',
  base: 'transition-all duration-200 ease-in-out',
  slow: 'transition-all duration-300 ease-in-out',
  colors: 'transition-colors duration-200 ease-in-out',
  transform: 'transition-transform duration-200 ease-in-out',
  shadow: 'transition-shadow duration-200 ease-in-out',
  opacity: 'transition-opacity duration-200 ease-in-out',
} as const;

/**
 * Focus ring classes
 */
export const focusRing = {
  default: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
  primary: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
  secondary: 'focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2',
  error: 'focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
  success: 'focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
} as const;

/**
 * Hover effects
 */
export const hoverEffects = {
  scale: 'hover:scale-105 active:scale-95',
  shadow: 'hover:shadow-lg',
  brightness: 'hover:brightness-110',
  opacity: 'hover:opacity-80',
  underline: 'hover:underline',
} as const;

/**
 * Shadow classes
 */
export const shadows = {
  sm: 'shadow-sm',
  base: 'shadow',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
  none: 'shadow-none',
} as const;

/**
 * Border radius classes
 */
export const rounded = {
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
 * Spacing scale
 */
export const spacing = {
  xs: 'p-2',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
  '2xl': 'p-12',
} as const;

/**
 * Icon sizes
 */
export const iconSizes = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  base: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
  '2xl': 'w-10 h-10',
} as const;

/**
 * Typography classes
 */
export const typography = {
  h1: 'text-3xl font-bold',
  h2: 'text-2xl font-bold',
  h3: 'text-xl font-semibold',
  h4: 'text-lg font-semibold',
  h5: 'text-base font-medium',
  h6: 'text-sm font-medium',
  body: 'text-base',
  bodyLarge: 'text-lg',
  bodySmall: 'text-sm',
  caption: 'text-xs',
} as const;

/**
 * Button base classes
 */
export const buttonBase = [
  'inline-flex items-center justify-center',
  'font-medium',
  rounded.md,
  transitions.base,
  focusRing.default,
  'disabled:opacity-50 disabled:cursor-not-allowed',
].join(' ');

/**
 * Input base classes
 */
export const inputBase = [
  'w-full',
  'px-4 py-2',
  'border border-gray-300',
  rounded.lg,
  'focus:border-blue-500',
  focusRing.default,
  transitions.colors,
  'disabled:bg-gray-100 disabled:cursor-not-allowed',
].join(' ');

/**
 * Card base classes
 */
export const cardBase = [
  'bg-white',
  rounded.lg,
  shadows.base,
  'overflow-hidden',
].join(' ');

/**
 * Generate hover classes
 */
export const generateHoverClasses = (options: {
  scale?: boolean;
  shadow?: boolean;
  brightness?: boolean;
  opacity?: boolean;
}): string => {
  const classes: string[] = [];

  if (options.scale) classes.push(hoverEffects.scale);
  if (options.shadow) classes.push(hoverEffects.shadow);
  if (options.brightness) classes.push(hoverEffects.brightness);
  if (options.opacity) classes.push(hoverEffects.opacity);

  return classes.join(' ');
};

/**
 * Generate responsive classes
 */
export const generateResponsiveClasses = (
  mobile: string,
  tablet?: string,
  desktop?: string
): string => {
  const classes = [mobile];

  if (tablet) classes.push(`md:${tablet}`);
  if (desktop) classes.push(`lg:${desktop}`);

  return classes.join(' ');
};

/**
 * Combine classes utility
 */
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

/**
 * Status color classes
 */
export const statusColors = {
  success: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-300',
    badge: 'bg-green-500 text-white',
  },
  warning: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-300',
    badge: 'bg-yellow-500 text-white',
  },
  error: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-300',
    badge: 'bg-red-500 text-white',
  },
  info: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-300',
    badge: 'bg-blue-500 text-white',
  },
  neutral: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-300',
    badge: 'bg-gray-500 text-white',
  },
} as const;

/**
 * Loading skeleton classes
 */
export const skeletonClasses = [
  'animate-pulse',
  'bg-gray-200',
  rounded.base,
].join(' ');

/**
 * Overlay classes
 */
export const overlayClasses = [
  'fixed inset-0',
  'bg-black bg-opacity-50',
  'z-40',
  transitions.opacity,
].join(' ');

/**
 * Modal classes
 */
export const modalClasses = {
  container: [
    'fixed inset-0',
    'z-50',
    'flex items-center justify-center',
    'p-4',
  ].join(' '),
  content: [
    'bg-white',
    rounded.lg,
    shadows.xl,
    'max-w-lg w-full',
    'max-h-[90vh] overflow-y-auto',
  ].join(' '),
  header: [
    'flex items-center justify-between',
    'px-6 py-4',
    'border-b border-gray-200',
  ].join(' '),
  body: [
    'px-6 py-4',
  ].join(' '),
  footer: [
    'flex items-center justify-end gap-3',
    'px-6 py-4',
    'border-t border-gray-200',
  ].join(' '),
};

/**
 * Table classes
 */
export const tableClasses = {
  container: [
    'overflow-x-auto',
    rounded.lg,
    'border border-gray-200',
  ].join(' '),
  table: [
    'min-w-full',
    'divide-y divide-gray-200',
  ].join(' '),
  header: [
    'bg-gray-50',
  ].join(' '),
  headerCell: [
    'px-6 py-3',
    'text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
  ].join(' '),
  body: [
    'bg-white',
    'divide-y divide-gray-200',
  ].join(' '),
  row: [
    'hover:bg-gray-50',
    transitions.colors,
  ].join(' '),
  cell: [
    'px-6 py-4',
    'whitespace-nowrap',
  ].join(' '),
};

/**
 * Form classes
 */
export const formClasses = {
  group: 'space-y-2',
  label: 'block text-sm font-medium text-gray-700',
  required: 'text-red-500',
  input: inputBase,
  error: 'text-sm text-red-600',
  helper: 'text-sm text-gray-500',
};

/**
 * Badge classes
 */
export const badgeClasses = {
  base: [
    'inline-flex items-center',
    'px-2.5 py-0.5',
    'text-xs font-medium',
    rounded.full,
  ].join(' '),
  success: statusColors.success.badge,
  warning: statusColors.warning.badge,
  error: statusColors.error.badge,
  info: statusColors.info.badge,
  neutral: statusColors.neutral.badge,
};

/**
 * Alert classes
 */
export const alertClasses = {
  base: [
    'p-4',
    rounded.lg,
    'border-l-4',
  ].join(' '),
  success: [
    statusColors.success.bg,
    statusColors.success.text,
    statusColors.success.border,
  ].join(' '),
  warning: [
    statusColors.warning.bg,
    statusColors.warning.text,
    statusColors.warning.border,
  ].join(' '),
  error: [
    statusColors.error.bg,
    statusColors.error.text,
    statusColors.error.border,
  ].join(' '),
  info: [
    statusColors.info.bg,
    statusColors.info.text,
    statusColors.info.border,
  ].join(' '),
};

/**
 * Divider classes
 */
export const dividerClasses = {
  horizontal: 'border-t border-gray-200 my-4',
  vertical: 'border-l border-gray-200 mx-4',
};

/**
 * Container classes
 */
export const containerClasses = {
  base: 'container mx-auto px-4 sm:px-6 lg:px-8',
  narrow: 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8',
  wide: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
};

/**
 * Grid classes
 */
export const gridClasses = {
  responsive: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4',
  products: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6',
  cards: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
};
