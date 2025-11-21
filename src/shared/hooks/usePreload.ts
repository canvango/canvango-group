import { useEffect } from 'react';
import {
  preloadResource,
  preloadFonts,
  preloadStyles,
  preloadScripts,
  prefetchResource,
  prefetchResources,
  preconnect,
  dnsPrefetch,
  type PreloadOptions,
} from '../utils/resource-preload';

/**
 * Hook to preload a single resource
 * @param href - Resource URL
 * @param options - Preload options
 */
export const usePreload = (href: string, options: PreloadOptions): void => {
  useEffect(() => {
    preloadResource(href, options);
  }, [href, options.as, options.type, options.crossOrigin]);
};

/**
 * Hook to preload multiple resources
 * @param resources - Array of resources to preload
 */
export const usePreloadResources = (
  resources: Array<{ href: string; options: PreloadOptions }>
): void => {
  useEffect(() => {
    resources.forEach(({ href, options }) => {
      preloadResource(href, options);
    });
  }, [resources]);
};

/**
 * Hook to preload fonts
 * @param fontUrls - Array of font URLs
 */
export const usePreloadFonts = (fontUrls: string[]): void => {
  useEffect(() => {
    preloadFonts(fontUrls);
  }, [fontUrls]);
};

/**
 * Hook to preload CSS files
 * @param cssUrls - Array of CSS URLs
 */
export const usePreloadStyles = (cssUrls: string[]): void => {
  useEffect(() => {
    preloadStyles(cssUrls);
  }, [cssUrls]);
};

/**
 * Hook to preload JavaScript files
 * @param scriptUrls - Array of script URLs
 */
export const usePreloadScripts = (scriptUrls: string[]): void => {
  useEffect(() => {
    preloadScripts(scriptUrls);
  }, [scriptUrls]);
};

/**
 * Hook to prefetch resources for next navigation
 * @param hrefs - Array of resource URLs to prefetch
 */
export const usePrefetch = (hrefs: string[]): void => {
  useEffect(() => {
    prefetchResources(hrefs);
  }, [hrefs]);
};

/**
 * Hook to preconnect to external domains
 * @param domains - Array of domains to preconnect
 */
export const usePreconnect = (domains: string[]): void => {
  useEffect(() => {
    domains.forEach((domain) => {
      preconnect(domain, true);
    });
  }, [domains]);
};

/**
 * Hook to DNS prefetch external domains
 * @param domains - Array of domains to DNS prefetch
 */
export const useDNSPrefetch = (domains: string[]): void => {
  useEffect(() => {
    domains.forEach((domain) => {
      dnsPrefetch(domain);
    });
  }, [domains]);
};

/**
 * Hook to prefetch on link hover
 * @param enabled - Whether to enable prefetch on hover
 */
export const usePrefetchOnHover = (enabled: boolean = true): void => {
  useEffect(() => {
    if (!enabled || typeof document === 'undefined') {
      return;
    }

    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link) {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('#') && !href.startsWith('mailto:')) {
          // Delay slightly to avoid prefetching on accidental hovers
          setTimeout(() => {
            prefetchResource(href);
          }, 100);
        }
      }
    };

    document.addEventListener('mouseenter', handleMouseEnter, true);

    return () => {
      document.removeEventListener('mouseenter', handleMouseEnter, true);
    };
  }, [enabled]);
};

/**
 * Hook to preload critical resources on app mount
 */
export const useCriticalResources = (): void => {
  useEffect(() => {
    // Preload critical fonts
    const fonts = [
      '/fonts/inter-var.woff2',
    ];
    preloadFonts(fonts);

    // Preconnect to external services
    const externalDomains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
    ];
    externalDomains.forEach((domain) => {
      preconnect(domain, true);
    });

    // DNS prefetch for API and CDN
    const apiDomains = [
      import.meta.env.VITE_API_URL,
      import.meta.env.VITE_CDN_URL,
    ].filter(Boolean) as string[];
    
    apiDomains.forEach((domain) => {
      dnsPrefetch(domain);
    });
  }, []);
};
