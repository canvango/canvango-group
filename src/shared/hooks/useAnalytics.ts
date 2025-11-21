/**
 * useAnalytics Hook
 * 
 * Provides easy access to analytics tracking functionality in React components
 */

import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import analytics from '../utils/analytics';

/**
 * Hook for tracking analytics events
 */
export const useAnalytics = () => {
  /**
   * Track a custom event
   */
  const trackEvent = useCallback(
    (
      category: string,
      action: string,
      label?: string,
      value?: number,
      metadata?: Record<string, any>
    ) => {
      analytics.trackEvent(category, action, label, value, metadata);
    },
    []
  );

  /**
   * Track a page view manually
   */
  const trackPageView = useCallback((path: string, title: string, metadata?: Record<string, any>) => {
    analytics.trackPageView(path, title, metadata);
  }, []);

  /**
   * Set user context for analytics
   */
  const setUserContext = useCallback((context: {
    userId?: string;
    username?: string;
    role?: string;
  }) => {
    analytics.setUserContext(context);
  }, []);

  /**
   * Clear user context (e.g., on logout)
   */
  const clearUserContext = useCallback(() => {
    analytics.clearUserContext();
  }, []);

  return {
    trackEvent,
    trackPageView,
    setUserContext,
    clearUserContext
  };
};

/**
 * Hook for automatic page view tracking
 * Tracks page views whenever the route changes
 */
export const usePageViewTracking = (pageTitle?: string) => {
  const location = useLocation();
  const previousPath = useRef<string>('');

  useEffect(() => {
    // Only track if the path has changed
    if (location.pathname !== previousPath.current) {
      const title = pageTitle || document.title || 'Untitled Page';
      
      analytics.trackPageView(location.pathname, title, {
        search: location.search,
        hash: location.hash
      });

      previousPath.current = location.pathname;
    }
  }, [location, pageTitle]);
};

/**
 * Hook for tracking button clicks
 */
export const useButtonTracking = (category: string, label: string) => {
  const { trackEvent } = useAnalytics();

  return useCallback(() => {
    trackEvent(category, 'click', label);
  }, [trackEvent, category, label]);
};

/**
 * Hook for tracking form submissions
 */
export const useFormTracking = (formName: string) => {
  const { trackEvent } = useAnalytics();

  const trackFormStart = useCallback(() => {
    trackEvent('Form', 'start', formName);
  }, [trackEvent, formName]);

  const trackFormSubmit = useCallback((success: boolean, metadata?: Record<string, any>) => {
    trackEvent('Form', success ? 'submit_success' : 'submit_error', formName, undefined, metadata);
  }, [trackEvent, formName]);

  const trackFormError = useCallback((errorField: string, errorMessage: string) => {
    trackEvent('Form', 'validation_error', formName, undefined, {
      field: errorField,
      error: errorMessage
    });
  }, [trackEvent, formName]);

  return {
    trackFormStart,
    trackFormSubmit,
    trackFormError
  };
};

/**
 * Hook for tracking search interactions
 */
export const useSearchTracking = (searchContext: string) => {
  const { trackEvent } = useAnalytics();

  const trackSearch = useCallback((query: string, resultsCount?: number) => {
    trackEvent('Search', 'query', searchContext, resultsCount, {
      query,
      resultsCount
    });
  }, [trackEvent, searchContext]);

  const trackSearchResultClick = useCallback((query: string, resultId: string, position: number) => {
    trackEvent('Search', 'result_click', searchContext, position, {
      query,
      resultId,
      position
    });
  }, [trackEvent, searchContext]);

  return {
    trackSearch,
    trackSearchResultClick
  };
};

/**
 * Hook for tracking purchase events
 */
export const usePurchaseTracking = () => {
  const { trackEvent } = useAnalytics();

  const trackPurchaseStart = useCallback((productId: string, productName: string, price: number) => {
    trackEvent('Purchase', 'start', productName, price, {
      productId,
      productName,
      price
    });
  }, [trackEvent]);

  const trackPurchaseComplete = useCallback((
    transactionId: string,
    productId: string,
    productName: string,
    quantity: number,
    total: number
  ) => {
    trackEvent('Purchase', 'complete', productName, total, {
      transactionId,
      productId,
      productName,
      quantity,
      total
    });
  }, [trackEvent]);

  const trackPurchaseError = useCallback((productId: string, productName: string, error: string) => {
    trackEvent('Purchase', 'error', productName, undefined, {
      productId,
      productName,
      error
    });
  }, [trackEvent]);

  return {
    trackPurchaseStart,
    trackPurchaseComplete,
    trackPurchaseError
  };
};

/**
 * Hook for tracking navigation events
 */
export const useNavigationTracking = () => {
  const { trackEvent } = useAnalytics();

  const trackNavigation = useCallback((destination: string, source?: string) => {
    trackEvent('Navigation', 'click', destination, undefined, {
      destination,
      source
    });
  }, [trackEvent]);

  const trackExternalLink = useCallback((url: string, label?: string) => {
    trackEvent('Navigation', 'external_link', label || url, undefined, {
      url
    });
  }, [trackEvent]);

  return {
    trackNavigation,
    trackExternalLink
  };
};

/**
 * Hook for tracking modal/dialog interactions
 */
export const useModalTracking = (modalName: string) => {
  const { trackEvent } = useAnalytics();

  const trackModalOpen = useCallback(() => {
    trackEvent('Modal', 'open', modalName);
  }, [trackEvent, modalName]);

  const trackModalClose = useCallback((method: 'button' | 'backdrop' | 'escape') => {
    trackEvent('Modal', 'close', modalName, undefined, { method });
  }, [trackEvent, modalName]);

  const trackModalAction = useCallback((action: string) => {
    trackEvent('Modal', action, modalName);
  }, [trackEvent, modalName]);

  return {
    trackModalOpen,
    trackModalClose,
    trackModalAction
  };
};

/**
 * Hook for tracking filter/sort interactions
 */
export const useFilterTracking = (context: string) => {
  const { trackEvent } = useAnalytics();

  const trackFilterChange = useCallback((filterName: string, filterValue: string) => {
    trackEvent('Filter', 'change', context, undefined, {
      filterName,
      filterValue
    });
  }, [trackEvent, context]);

  const trackSortChange = useCallback((sortBy: string, sortOrder: string) => {
    trackEvent('Sort', 'change', context, undefined, {
      sortBy,
      sortOrder
    });
  }, [trackEvent, context]);

  return {
    trackFilterChange,
    trackSortChange
  };
};

export default useAnalytics;
