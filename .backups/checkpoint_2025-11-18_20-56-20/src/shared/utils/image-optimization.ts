/**
 * Image optimization utilities
 * Provides functions for optimizing image loading and format selection
 */

/**
 * Check if WebP format is supported by the browser
 */
export const isWebPSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  if (canvas.getContext && canvas.getContext('2d')) {
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }
  return false;
};

/**
 * Get optimized image source based on browser support
 * @param imagePath - Base image path without extension
 * @param fallbackExt - Fallback extension (default: 'png')
 * @returns Optimized image path
 */
export const getOptimizedImageSrc = (
  imagePath: string,
  fallbackExt: string = 'png'
): string => {
  if (isWebPSupported()) {
    return `${imagePath}.webp`;
  }
  return `${imagePath}.${fallbackExt}`;
};

/**
 * Generate srcset for responsive images
 * @param basePath - Base image path
 * @param sizes - Array of sizes (e.g., [320, 640, 1024])
 * @returns srcset string
 */
export const generateSrcSet = (basePath: string, sizes: number[]): string => {
  return sizes
    .map((size) => `${basePath}-${size}w.webp ${size}w`)
    .join(', ');
};

/**
 * Preload critical images
 * @param imageUrls - Array of image URLs to preload
 */
export const preloadImages = (imageUrls: string[]): void => {
  if (typeof window === 'undefined') return;

  imageUrls.forEach((url) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
};

/**
 * Create a placeholder data URL for images
 * @param width - Image width
 * @param height - Image height
 * @param color - Background color (default: '#f3f4f6')
 * @returns Data URL for placeholder
 */
export const createPlaceholder = (
  width: number = 400,
  height: number = 300,
  color: string = '#f3f4f6'
): string => {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}'%3E%3Crect fill='${encodeURIComponent(color)}' width='${width}' height='${height}'/%3E%3C/svg%3E`;
};

/**
 * Compress image quality based on connection speed
 * @returns Quality level (0-100)
 */
export const getOptimalImageQuality = (): number => {
  if (typeof window === 'undefined' || !('connection' in navigator)) {
    return 80; // Default quality
  }

  const connection = (navigator as any).connection;
  const effectiveType = connection?.effectiveType;

  switch (effectiveType) {
    case 'slow-2g':
    case '2g':
      return 50; // Low quality for slow connections
    case '3g':
      return 70; // Medium quality
    case '4g':
    default:
      return 80; // High quality for fast connections
  }
};
