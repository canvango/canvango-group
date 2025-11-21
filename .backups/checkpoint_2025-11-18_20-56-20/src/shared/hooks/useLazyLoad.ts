import { useEffect, useRef, useState } from 'react';

interface UseLazyLoadOptions {
  rootMargin?: string;
  threshold?: number;
}

/**
 * Custom hook for lazy loading elements using Intersection Observer
 * @param options - Configuration options for the intersection observer
 * @returns Object containing ref to attach to element and isVisible state
 */
export const useLazyLoad = (options: UseLazyLoadOptions = {}) => {
  const { rootMargin = '50px', threshold = 0.01 } = options;
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
      // Fallback: make element visible immediately
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [rootMargin, threshold]);

  return { ref: elementRef, isVisible };
};
