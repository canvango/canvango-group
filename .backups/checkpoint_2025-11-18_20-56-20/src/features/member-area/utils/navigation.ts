import { ROUTES } from '../config/routes.config';

/**
 * Navigation helper functions for common navigation patterns
 */

/**
 * Navigate to product detail page
 * @param productId - Product ID
 * @param category - Product category (bm or personal)
 * @returns Route path
 */
export const getProductDetailPath = (
  productId: string,
  category: 'bm' | 'personal'
): string => {
  const basePath = category === 'bm' ? ROUTES.ACCOUNTS.BM : ROUTES.ACCOUNTS.PERSONAL;
  return `${basePath}?product=${productId}`;
};

/**
 * Navigate to transaction detail page
 * @param transactionId - Transaction ID
 * @returns Route path
 */
export const getTransactionDetailPath = (transactionId: string): string => {
  return `${ROUTES.TRANSACTIONS}?transaction=${transactionId}`;
};

/**
 * Navigate to filtered transactions
 * @param tab - Transaction tab (accounts or topup)
 * @param filters - Additional filters
 * @returns Route path
 */
export const getFilteredTransactionsPath = (
  tab?: 'accounts' | 'topup',
  filters?: {
    warranty?: string;
    page?: number;
    startDate?: string;
    endDate?: string;
  }
): string => {
  const params = new URLSearchParams();
  
  if (tab) params.append('tab', tab);
  if (filters?.warranty) params.append('warranty', filters.warranty);
  if (filters?.page) params.append('page', String(filters.page));
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);

  const queryString = params.toString();
  return queryString ? `${ROUTES.TRANSACTIONS}?${queryString}` : ROUTES.TRANSACTIONS;
};

/**
 * Navigate to filtered BM accounts
 * @param category - Account category
 * @param filters - Additional filters
 * @returns Route path
 */
export const getFilteredBMAccountsPath = (
  category?: string,
  filters?: {
    search?: string;
    sort?: string;
    page?: number;
  }
): string => {
  const params = new URLSearchParams();
  
  if (category) params.append('category', category);
  if (filters?.search) params.append('search', filters.search);
  if (filters?.sort) params.append('sort', filters.sort);
  if (filters?.page) params.append('page', String(filters.page));

  const queryString = params.toString();
  return queryString ? `${ROUTES.ACCOUNTS.BM}?${queryString}` : ROUTES.ACCOUNTS.BM;
};

/**
 * Navigate to filtered personal accounts
 * @param type - Account type (old or new)
 * @param filters - Additional filters
 * @returns Route path
 */
export const getFilteredPersonalAccountsPath = (
  type?: string,
  filters?: {
    search?: string;
    sort?: string;
    page?: number;
  }
): string => {
  const params = new URLSearchParams();
  
  if (type) params.append('type', type);
  if (filters?.search) params.append('search', filters.search);
  if (filters?.sort) params.append('sort', filters.sort);
  if (filters?.page) params.append('page', String(filters.page));

  const queryString = params.toString();
  return queryString ? `${ROUTES.ACCOUNTS.PERSONAL}?${queryString}` : ROUTES.ACCOUNTS.PERSONAL;
};

/**
 * Navigate to filtered tutorials
 * @param category - Tutorial category
 * @param search - Search query
 * @returns Route path
 */
export const getFilteredTutorialsPath = (
  category?: string,
  search?: string
): string => {
  const params = new URLSearchParams();
  
  if (category) params.append('category', category);
  if (search) params.append('search', search);

  const queryString = params.toString();
  return queryString ? `${ROUTES.TUTORIALS}?${queryString}` : ROUTES.TUTORIALS;
};

/**
 * Navigate to top up with preselected amount
 * @param amount - Preselected amount
 * @returns Route path
 */
export const getTopUpPath = (amount?: number): string => {
  if (!amount) return ROUTES.TOPUP;
  return `${ROUTES.TOPUP}?amount=${amount}`;
};

/**
 * Get the parent route path
 * @param currentPath - Current route path
 * @returns Parent route path or dashboard if at root
 */
export const getParentPath = (currentPath: string): string => {
  const segments = currentPath.split('/').filter(Boolean);
  
  if (segments.length <= 1) {
    return ROUTES.DASHBOARD;
  }
  
  segments.pop();
  return '/' + segments.join('/');
};

/**
 * Check if path is a child of parent path
 * @param childPath - Child path to check
 * @param parentPath - Parent path
 * @returns True if child is under parent
 */
export const isChildPath = (childPath: string, parentPath: string): boolean => {
  if (parentPath === '/') return true;
  return childPath.startsWith(parentPath + '/') || childPath === parentPath;
};

/**
 * Get route depth (number of segments)
 * @param path - Route path
 * @returns Number of path segments
 */
export const getRouteDepth = (path: string): number => {
  return path.split('/').filter(Boolean).length;
};

/**
 * Scroll to top of page
 * Useful after navigation
 */
export const scrollToTop = (behavior: ScrollBehavior = 'smooth'): void => {
  window.scrollTo({ top: 0, behavior });
};

/**
 * Scroll to element by ID
 * @param elementId - Element ID to scroll to
 * @param offset - Offset from top (for fixed headers)
 */
export const scrollToElement = (
  elementId: string,
  offset: number = 0
): void => {
  const element = document.getElementById(elementId);
  if (element) {
    const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }
};

/**
 * Save scroll position for current route
 * @param path - Route path
 */
export const saveScrollPosition = (path: string): void => {
  sessionStorage.setItem(`scroll_${path}`, String(window.pageYOffset));
};

/**
 * Restore scroll position for route
 * @param path - Route path
 */
export const restoreScrollPosition = (path: string): void => {
  const savedPosition = sessionStorage.getItem(`scroll_${path}`);
  if (savedPosition) {
    window.scrollTo({ top: parseInt(savedPosition, 10), behavior: 'auto' });
  }
};

/**
 * Clear saved scroll positions
 */
export const clearScrollPositions = (): void => {
  Object.keys(sessionStorage).forEach((key) => {
    if (key.startsWith('scroll_')) {
      sessionStorage.removeItem(key);
    }
  });
};
