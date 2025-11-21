/**
 * Resource preloading utilities
 * Provides functions for preloading critical resources to improve performance
 */

export type PreloadResourceType = 'font' | 'style' | 'script' | 'image' | 'fetch';

export interface PreloadOptions {
  as: PreloadResourceType;
  type?: string;
  crossOrigin?: 'anonymous' | 'use-credentials';
  media?: string;
}

/**
 * Preload a single resource
 * @param href - Resource URL
 * @param options - Preload options
 */
export const preloadResource = (href: string, options: PreloadOptions): void => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  // Check if already preloaded
  const existing = document.querySelector(`link[rel="preload"][href="${href}"]`);
  if (existing) {
    return;
  }

  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = options.as;

  if (options.type) {
    link.type = options.type;
  }

  if (options.crossOrigin) {
    link.crossOrigin = options.crossOrigin;
  }

  if (options.media) {
    link.media = options.media;
  }

  document.head.appendChild(link);
};

/**
 * Preload multiple resources
 * @param resources - Array of resources to preload
 */
export const preloadResources = (
  resources: Array<{ href: string; options: PreloadOptions }>
): void => {
  resources.forEach(({ href, options }) => {
    preloadResource(href, options);
  });
};

/**
 * Preload fonts
 * @param fontUrls - Array of font URLs
 */
export const preloadFonts = (fontUrls: string[]): void => {
  fontUrls.forEach((url) => {
    preloadResource(url, {
      as: 'font',
      type: getFontType(url),
      crossOrigin: 'anonymous',
    });
  });
};

/**
 * Preload CSS files
 * @param cssUrls - Array of CSS URLs
 */
export const preloadStyles = (cssUrls: string[]): void => {
  cssUrls.forEach((url) => {
    preloadResource(url, {
      as: 'style',
    });
  });
};

/**
 * Preload JavaScript files
 * @param scriptUrls - Array of script URLs
 */
export const preloadScripts = (scriptUrls: string[]): void => {
  scriptUrls.forEach((url) => {
    preloadResource(url, {
      as: 'script',
    });
  });
};

/**
 * Prefetch resources for next navigation
 * @param href - Resource URL
 */
export const prefetchResource = (href: string): void => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  // Check if already prefetched
  const existing = document.querySelector(`link[rel="prefetch"][href="${href}"]`);
  if (existing) {
    return;
  }

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;

  document.head.appendChild(link);
};

/**
 * Prefetch multiple resources
 * @param hrefs - Array of resource URLs
 */
export const prefetchResources = (hrefs: string[]): void => {
  hrefs.forEach((href) => {
    prefetchResource(href);
  });
};

/**
 * DNS prefetch for external domains
 * @param domain - Domain to prefetch
 */
export const dnsPrefetch = (domain: string): void => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  const existing = document.querySelector(`link[rel="dns-prefetch"][href="${domain}"]`);
  if (existing) {
    return;
  }

  const link = document.createElement('link');
  link.rel = 'dns-prefetch';
  link.href = domain;

  document.head.appendChild(link);
};

/**
 * Preconnect to external domains
 * @param domain - Domain to preconnect
 * @param crossOrigin - Whether to use cross-origin
 */
export const preconnect = (domain: string, crossOrigin: boolean = false): void => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  const existing = document.querySelector(`link[rel="preconnect"][href="${domain}"]`);
  if (existing) {
    return;
  }

  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = domain;

  if (crossOrigin) {
    link.crossOrigin = 'anonymous';
  }

  document.head.appendChild(link);
};

/**
 * Get font type from URL
 */
const getFontType = (url: string): string => {
  const ext = url.split('.').pop()?.toLowerCase();
  
  switch (ext) {
    case 'woff2':
      return 'font/woff2';
    case 'woff':
      return 'font/woff';
    case 'ttf':
      return 'font/ttf';
    case 'otf':
      return 'font/otf';
    default:
      return 'font/woff2'; // Default to woff2
  }
};

/**
 * Preload critical resources for the application
 */
export const preloadCriticalResources = (): void => {
  // Preload fonts
  const fonts = [
    '/fonts/inter-var.woff2',
    // Add other critical fonts
  ];
  
  if (fonts.length > 0) {
    preloadFonts(fonts);
  }

  // Preconnect to external services
  const externalDomains = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    // Add other external domains (CDN, API, etc.)
  ];

  externalDomains.forEach((domain) => {
    preconnect(domain, true);
  });
};

/**
 * Prefetch next page resources
 * @param pagePath - Path to the next page
 */
export const prefetchNextPage = (pagePath: string): void => {
  // In a real app with code splitting, you would prefetch the chunk for this route
  // For now, we'll just prefetch the route
  prefetchResource(pagePath);
};

/**
 * Prefetch resources on hover (for links)
 * @param element - Link element
 * @returns Cleanup function
 */
export const prefetchOnHover = (element: HTMLAnchorElement): (() => void) => {
  let timeoutId: NodeJS.Timeout;

  const handleMouseEnter = () => {
    // Delay prefetch slightly to avoid prefetching on accidental hovers
    timeoutId = setTimeout(() => {
      const href = element.getAttribute('href');
      if (href && !href.startsWith('#') && !href.startsWith('mailto:')) {
        prefetchResource(href);
      }
    }, 100);
  };

  const handleMouseLeave = () => {
    clearTimeout(timeoutId);
  };

  element.addEventListener('mouseenter', handleMouseEnter);
  element.addEventListener('mouseleave', handleMouseLeave);

  // Cleanup
  return () => {
    element.removeEventListener('mouseenter', handleMouseEnter);
    element.removeEventListener('mouseleave', handleMouseLeave);
    clearTimeout(timeoutId);
  };
};

/**
 * Check if resource is already loaded
 * @param href - Resource URL
 * @param type - Resource type
 */
export const isResourceLoaded = (href: string, type: 'script' | 'style'): boolean => {
  if (typeof document === 'undefined') {
    return false;
  }

  if (type === 'script') {
    return !!document.querySelector(`script[src="${href}"]`);
  } else {
    return !!document.querySelector(`link[rel="stylesheet"][href="${href}"]`);
  }
};

/**
 * Load script dynamically
 * @param src - Script URL
 * @param async - Whether to load async
 */
export const loadScript = (src: string, async: boolean = true): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (isResourceLoaded(src, 'script')) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = async;

    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));

    document.head.appendChild(script);
  });
};

/**
 * Load stylesheet dynamically
 * @param href - Stylesheet URL
 */
export const loadStylesheet = (href: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (isResourceLoaded(href, 'style')) {
      resolve();
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;

    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to load stylesheet: ${href}`));

    document.head.appendChild(link);
  });
};
