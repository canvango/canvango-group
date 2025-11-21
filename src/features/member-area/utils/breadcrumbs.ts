import { ROUTES } from '../config/routes.config';

/**
 * Breadcrumb item interface
 */
export interface Breadcrumb {
  label: string;
  path: string;
  isActive: boolean;
}

/**
 * Route label mappings for breadcrumb generation
 */
const ROUTE_LABELS: Record<string, string> = {
  '/': 'Home',
  '/dashboard': 'Dashboard',
  '/transactions': 'Transaction History',
  '/topup': 'Top Up',
  '/accounts': 'Accounts',
  '/accounts/bm': 'BM Accounts',
  '/accounts/personal': 'Personal Accounts',
  '/services': 'Services',
  '/services/verified-bm': 'Verified BM Service',
  '/warranty': 'Claim Warranty',
  '/api': 'API Documentation',
  '/tutorials': 'Tutorial Center',
};

/**
 * Generate breadcrumbs from current path
 * 
 * @param pathname - Current location pathname
 * @param customLabels - Optional custom labels for specific paths
 * @returns Array of breadcrumb items
 * 
 * @example
 * ```tsx
 * const breadcrumbs = generateBreadcrumbs('/accounts/bm');
 * // Returns: [
 * //   { label: 'Home', path: '/', isActive: false },
 * //   { label: 'Accounts', path: '/accounts', isActive: false },
 * //   { label: 'BM Accounts', path: '/accounts/bm', isActive: true }
 * // ]
 * ```
 */
export const generateBreadcrumbs = (
  pathname: string,
  customLabels?: Record<string, string>
): Breadcrumb[] => {
  // Remove trailing slash and split path
  const cleanPath = pathname.replace(/\/$/, '');
  const segments = cleanPath.split('/').filter(Boolean);

  // Always start with home
  const breadcrumbs: Breadcrumb[] = [
    {
      label: 'Home',
      path: ROUTES.DASHBOARD,
      isActive: cleanPath === ROUTES.DASHBOARD || cleanPath === '/',
    },
  ];

  // Build breadcrumbs from path segments
  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === segments.length - 1;

    // Get label from custom labels, route labels, or capitalize segment
    const label =
      customLabels?.[currentPath] ||
      ROUTE_LABELS[currentPath] ||
      capitalizeSegment(segment);

    breadcrumbs.push({
      label,
      path: currentPath,
      isActive: isLast,
    });
  });

  return breadcrumbs;
};

/**
 * Generate breadcrumbs with query parameter context
 * 
 * @param pathname - Current location pathname
 * @param queryParams - Current query parameters
 * @returns Array of breadcrumb items with context
 * 
 * @example
 * ```tsx
 * const breadcrumbs = generateBreadcrumbsWithContext(
 *   '/accounts/bm',
 *   { category: 'verified' }
 * );
 * // Returns breadcrumbs with "Verified" context added
 * ```
 */
export const generateBreadcrumbsWithContext = (
  pathname: string,
  queryParams: Record<string, string>
): Breadcrumb[] => {
  const baseBreadcrumbs = generateBreadcrumbs(pathname);

  // Add context from query parameters to the last breadcrumb
  if (baseBreadcrumbs.length > 0 && Object.keys(queryParams).length > 0) {
    const lastBreadcrumb = baseBreadcrumbs[baseBreadcrumbs.length - 1];
    const contextLabel = buildContextLabel(pathname, queryParams);

    if (contextLabel) {
      lastBreadcrumb.label = `${lastBreadcrumb.label} - ${contextLabel}`;
    }
  }

  return baseBreadcrumbs;
};

/**
 * Build context label from query parameters
 */
const buildContextLabel = (
  pathname: string,
  queryParams: Record<string, string>
): string | null => {
  // Transaction history context
  if (pathname === ROUTES.TRANSACTIONS && queryParams.tab) {
    return queryParams.tab === 'topup' ? 'Top Up' : 'Account Transactions';
  }

  // BM Accounts category context
  if (pathname === ROUTES.ACCOUNTS.BM && queryParams.category) {
    return formatCategoryLabel(queryParams.category);
  }

  // Personal Accounts type context
  if (pathname === ROUTES.ACCOUNTS.PERSONAL && queryParams.type) {
    return formatTypeLabel(queryParams.type);
  }

  // Tutorial category context
  if (pathname === ROUTES.TUTORIALS && queryParams.category) {
    return formatCategoryLabel(queryParams.category);
  }

  return null;
};

/**
 * Format category label for display
 */
const formatCategoryLabel = (category: string): string => {
  const categoryLabels: Record<string, string> = {
    'all': 'All',
    'verified': 'Verified',
    'limit-250': 'Limit 250$',
    'bm50': 'BM50',
    'whatsapp-api': 'WhatsApp API',
    'limit-140': 'Limit 140',
    'getting-started': 'Getting Started',
    'account': 'Account',
    'transaction': 'Transaction',
    'api': 'API',
    'troubleshoot': 'Troubleshoot',
  };

  return categoryLabels[category] || capitalizeSegment(category);
};

/**
 * Format type label for display
 */
const formatTypeLabel = (type: string): string => {
  const typeLabels: Record<string, string> = {
    'all': 'All Accounts',
    'old': 'Old Accounts',
    'new': 'New Accounts',
  };

  return typeLabels[type] || capitalizeSegment(type);
};

/**
 * Capitalize and format a path segment
 */
const capitalizeSegment = (segment: string): string => {
  return segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Get breadcrumb path for a specific route
 * Useful for navigation from breadcrumbs
 * 
 * @param breadcrumb - Breadcrumb item
 * @param preserveParams - Whether to preserve query parameters
 * @param currentParams - Current query parameters to preserve
 * @returns Full path with optional parameters
 */
export const getBreadcrumbPath = (
  breadcrumb: Breadcrumb,
  preserveParams: boolean = false,
  currentParams?: Record<string, string>
): string => {
  if (!preserveParams || !currentParams || Object.keys(currentParams).length === 0) {
    return breadcrumb.path;
  }

  const searchParams = new URLSearchParams(currentParams);
  return `${breadcrumb.path}?${searchParams.toString()}`;
};
