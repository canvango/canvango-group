/**
 * Standard icon sizes for consistent UI
 * Use these constants throughout the application for icon sizing
 */

export const ICON_SIZES = {
  xs: 'w-3 h-3',      // 12px - Very small icons
  sm: 'w-4 h-4',      // 16px - Small icons (buttons, badges)
  md: 'w-5 h-5',      // 20px - Medium icons (default)
  lg: 'w-6 h-6',      // 24px - Large icons (headers, cards)
  xl: 'w-8 h-8',      // 32px - Extra large icons
  '2xl': 'w-10 h-10', // 40px - Very large icons
} as const;

export type IconSize = keyof typeof ICON_SIZES;

/**
 * Get icon size class
 * @param size - Icon size key
 * @returns Tailwind CSS classes for icon sizing
 */
export const getIconSize = (size: IconSize = 'md'): string => {
  return ICON_SIZES[size];
};
