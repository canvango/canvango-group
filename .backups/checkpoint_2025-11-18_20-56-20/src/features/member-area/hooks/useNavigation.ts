import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useCallback, useMemo } from 'react';
import { buildRoute, parseQueryParams, isRouteActive } from '../config/routes.config';

/**
 * Navigation state and utilities
 */
export interface NavigationState {
  currentPath: string;
  queryParams: Record<string, string>;
  isActive: (path: string, exact?: boolean) => boolean;
  navigateTo: (path: string, params?: Record<string, string | number | boolean | undefined>) => void;
  updateQueryParams: (params: Record<string, string | number | boolean | undefined>) => void;
  goBack: () => void;
  replace: (path: string, params?: Record<string, string | number | boolean | undefined>) => void;
}

/**
 * Custom hook for navigation utilities
 * Provides type-safe navigation methods and current route information
 * 
 * @returns Navigation state and utility functions
 * 
 * @example
 * ```tsx
 * const { navigateTo, isActive, queryParams } = useNavigation();
 * 
 * // Navigate to a route with parameters
 * navigateTo('/accounts/bm', { category: 'verified', page: 1 });
 * 
 * // Check if route is active
 * const isAccountsActive = isActive('/accounts');
 * 
 * // Update query parameters without navigation
 * updateQueryParams({ search: 'facebook' });
 * ```
 */
export const useNavigation = (): NavigationState => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse current query parameters
  const queryParams = useMemo(() => {
    return parseQueryParams(location.search);
  }, [location.search]);

  /**
   * Check if a route is currently active
   */
  const isActive = useCallback(
    (path: string, exact: boolean = false): boolean => {
      // Add leading slash if not present for comparison
      const fullPath = path.startsWith('/') ? path : `/${path}`;
      return isRouteActive(location.pathname, fullPath, exact);
    },
    [location.pathname]
  );

  /**
   * Navigate to a route with optional query parameters
   */
  const navigateTo = useCallback(
    (path: string, params?: Record<string, string | number | boolean | undefined>) => {
      const fullPath = buildRoute(path, params);
      navigate(fullPath);
    },
    [navigate]
  );

  /**
   * Update query parameters without changing the route
   */
  const updateQueryParams = useCallback(
    (params: Record<string, string | number | boolean | undefined>) => {
      const newParams = new URLSearchParams(searchParams);
      
      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
          newParams.delete(key);
        } else {
          newParams.set(key, String(value));
        }
      });
      
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams]
  );

  /**
   * Navigate back to previous page
   */
  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  /**
   * Replace current route (doesn't add to history)
   */
  const replace = useCallback(
    (path: string, params?: Record<string, string | number | boolean | undefined>) => {
      const fullPath = buildRoute(path, params);
      navigate(fullPath, { replace: true });
    },
    [navigate]
  );

  return {
    currentPath: location.pathname,
    queryParams,
    isActive,
    navigateTo,
    updateQueryParams,
    goBack,
    replace,
  };
};
