import React, { useState, useEffect, useRef } from 'react';
import {
  getBestImageFormat,
  buildOptimizedImageUrl,
  IMAGE_OPTIMIZATION,
  getImageSizes,
  generateResponsiveSrcSet,
} from '../utils/image-config';
import { createPlaceholder } from '../utils/image-optimization';

interface OptimizedImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  sizes?: string;
  priority?: boolean; // If true, don't lazy load
  placeholder?: 'blur' | 'empty' | string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
  responsive?: boolean; // Generate srcset for responsive images
}

/**
 * OptimizedImage component with automatic format selection, lazy loading, and responsive images
 * 
 * Features:
 * - Automatic WebP/AVIF format selection based on browser support
 * - Lazy loading with Intersection Observer
 * - Responsive images with srcset
 * - Blur placeholder while loading
 * - Priority loading for above-the-fold images
 * 
 * @example
 * ```tsx
 * <OptimizedImage
 *   src="/images/product.jpg"
 *   alt="Product image"
 *   width={800}
 *   height={600}
 *   responsive
 * />
 * ```
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  quality,
  sizes,
  priority = false,
  placeholder = 'blur',
  className = '',
  onLoad,
  onError,
  responsive = false,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Generate placeholder
  const placeholderSrc = placeholder === 'blur'
    ? createPlaceholder(width || 400, height || 300)
    : placeholder === 'empty'
    ? ''
    : placeholder;

  useEffect(() => {
    // Get best format for browser
    const format = getBestImageFormat();
    
    // Build optimized URL
    const optimizedSrc = buildOptimizedImageUrl(src, {
      width,
      height,
      quality,
      format,
    });

    // If priority, load immediately
    if (priority) {
      setImageSrc(optimizedSrc);
      return;
    }

    // If lazy loading is disabled, load immediately
    if (!IMAGE_OPTIMIZATION.lazyLoad) {
      setImageSrc(optimizedSrc);
      return;
    }

    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
      setImageSrc(optimizedSrc);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImageSrc(optimizedSrc);
            if (imgRef.current) {
              observer.unobserve(imgRef.current);
            }
          }
        });
      },
      {
        rootMargin: IMAGE_OPTIMIZATION.rootMargin,
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src, width, height, quality, priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Generate srcset for responsive images
  const srcSet = responsive && width
    ? generateResponsiveSrcSet(src, [
        Math.floor(width * 0.5),
        width,
        Math.floor(width * 1.5),
        Math.floor(width * 2),
      ])
    : undefined;

  // Generate sizes attribute
  const sizesAttr = sizes || (responsive ? getImageSizes() : undefined);

  return (
    <img
      ref={imgRef}
      src={imageSrc || placeholderSrc}
      srcSet={srcSet}
      sizes={sizesAttr}
      alt={alt}
      width={width}
      height={height}
      className={`${className} ${
        isLoaded ? 'opacity-100' : 'opacity-0'
      } transition-opacity duration-300 ${
        hasError ? 'bg-gray-200' : ''
      }`}
      onLoad={handleLoad}
      onError={handleError}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      {...props}
    />
  );
};

export default OptimizedImage;
