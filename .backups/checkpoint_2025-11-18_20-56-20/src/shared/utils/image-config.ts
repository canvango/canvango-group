/**
 * Image optimization configuration
 * Central configuration for image formats, sizes, and optimization settings
 */

export interface ImageFormat {
  format: 'webp' | 'avif' | 'jpg' | 'png';
  quality: number;
  fallback?: string;
}

export interface ImageSize {
  name: string;
  width: number;
  height?: number;
  quality?: number;
}

/**
 * Supported image formats in order of preference
 */
export const IMAGE_FORMATS: ImageFormat[] = [
  { format: 'avif', quality: 80, fallback: 'webp' },
  { format: 'webp', quality: 85, fallback: 'jpg' },
  { format: 'jpg', quality: 85 },
];

/**
 * Standard image sizes for responsive images
 */
export const IMAGE_SIZES: Record<string, ImageSize> = {
  thumbnail: { name: 'thumbnail', width: 150, height: 150, quality: 80 },
  small: { name: 'small', width: 320, quality: 85 },
  medium: { name: 'medium', width: 640, quality: 85 },
  large: { name: 'large', width: 1024, quality: 80 },
  xlarge: { name: 'xlarge', width: 1920, quality: 75 },
};

/**
 * Image optimization settings
 */
export const IMAGE_OPTIMIZATION = {
  // Enable lazy loading by default
  lazyLoad: true,
  
  // Intersection observer margin (start loading before entering viewport)
  rootMargin: '50px',
  
  // Blur placeholder while loading
  usePlaceholder: true,
  
  // Preload critical images (above the fold)
  preloadCritical: true,
  
  // Maximum file size before warning (in bytes)
  maxFileSize: 500 * 1024, // 500KB
  
  // Compression quality by connection type
  qualityByConnection: {
    'slow-2g': 50,
    '2g': 60,
    '3g': 70,
    '4g': 85,
    'unknown': 80,
  },
};

/**
 * Critical images that should be preloaded
 */
export const CRITICAL_IMAGES = [
  '/assets/logo.svg',
  '/assets/icons/canvango-icon.svg',
];

/**
 * Image CDN configuration (if using a CDN)
 */
export const IMAGE_CDN = {
  enabled: false,
  baseUrl: import.meta.env.VITE_IMAGE_CDN_URL || '',
  transformations: {
    auto: 'format,compress',
    quality: 'auto:good',
  },
};

/**
 * Get responsive image sizes attribute
 */
export const getImageSizes = (breakpoints?: Record<string, string>): string => {
  if (breakpoints) {
    return Object.entries(breakpoints)
      .map(([bp, size]) => `(max-width: ${bp}) ${size}`)
      .join(', ');
  }
  
  // Default responsive sizes
  return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
};

/**
 * Generate srcset for responsive images
 */
export const generateResponsiveSrcSet = (
  basePath: string,
  sizes: number[] = [320, 640, 1024, 1920]
): string => {
  return sizes
    .map((size) => `${basePath}?w=${size} ${size}w`)
    .join(', ');
};

/**
 * Check if format is supported
 */
export const isFormatSupported = (format: 'webp' | 'avif'): boolean => {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  if (!canvas.getContext || !canvas.getContext('2d')) {
    return false;
  }
  
  return canvas.toDataURL(`image/${format}`).indexOf(`data:image/${format}`) === 0;
};

/**
 * Get best supported image format
 */
export const getBestImageFormat = (): 'avif' | 'webp' | 'jpg' => {
  if (isFormatSupported('avif')) return 'avif';
  if (isFormatSupported('webp')) return 'webp';
  return 'jpg';
};

/**
 * Build optimized image URL
 */
export const buildOptimizedImageUrl = (
  src: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpg' | 'png';
  }
): string => {
  if (!IMAGE_CDN.enabled) {
    return src;
  }
  
  const params = new URLSearchParams();
  if (options?.width) params.append('w', options.width.toString());
  if (options?.height) params.append('h', options.height.toString());
  if (options?.quality) params.append('q', options.quality.toString());
  if (options?.format) params.append('f', options.format);
  
  const queryString = params.toString();
  return queryString ? `${src}?${queryString}` : src;
};
