/**
 * Route configuration for the member area
 * Centralizes all route paths and parameters for easy maintenance
 */

export interface RouteConfig {
  path: string;
  label: string;
  description?: string;
  params?: string[];
}

/**
 * Member area route paths
 * Use these constants throughout the application for type-safe navigation
 * 
 * NOTE: All paths are relative (no leading slash) because they are used within
 * the member area routing context. React Router will automatically resolve them
 * relative to the current route.
 */
export const ROUTES = {
  // Root
  ROOT: '',
  
  // Main sections
  DASHBOARD: 'dashboard',
  TRANSACTIONS: 'riwayat-transaksi',
  TOPUP: 'top-up',
  WARRANTY: 'claim-garansi',
  API: 'api',
  TUTORIALS: 'tutorial',
  
  // Accounts section
  ACCOUNTS: {
    ROOT: 'akun-bm',
    BM: 'akun-bm',
    PERSONAL: 'akun-personal',
  },
  
  // Services section
  SERVICES: {
    ROOT: 'jasa-verified-bm',
    VERIFIED_BM: 'jasa-verified-bm',
  },
  
  // Admin section
  ADMIN: {
    ROOT: 'admin',
    DASHBOARD: 'admin/dashboard',
    USERS: 'admin/users',
    TRANSACTIONS: 'admin/transactions',
    CLAIMS: 'admin/claims',
    TUTORIALS: 'admin/tutorials',
    PRODUCTS: 'admin/products',
    ANNOUNCEMENTS: 'admin/announcements',
    SETTINGS: 'admin/settings',
    AUDIT_LOGS: 'admin/audit-logs',
  },
} as const;

/**
 * Route configurations with metadata
 */
export const ROUTE_CONFIGS: Record<string, RouteConfig> = {
  DASHBOARD: {
    path: ROUTES.DASHBOARD,
    label: 'Dashboard',
    description: 'Overview of account statistics and recent activities',
  },
  TRANSACTIONS: {
    path: ROUTES.TRANSACTIONS,
    label: 'Riwayat Transaksi',
    description: 'View all account transactions and top-ups',
    params: ['tab', 'page', 'warranty'],
  },
  TOPUP: {
    path: ROUTES.TOPUP,
    label: 'Top Up',
    description: 'Add balance to your account',
  },
  BM_ACCOUNTS: {
    path: ROUTES.ACCOUNTS.BM,
    label: 'Akun BM',
    description: 'Browse and purchase Business Manager accounts',
    params: ['category', 'search', 'sort', 'page'],
  },
  PERSONAL_ACCOUNTS: {
    path: ROUTES.ACCOUNTS.PERSONAL,
    label: 'Akun Personal',
    description: 'Browse and purchase Personal Facebook accounts',
    params: ['type', 'search', 'sort', 'page'],
  },
  VERIFIED_BM: {
    path: ROUTES.SERVICES.VERIFIED_BM,
    label: 'Jasa Verified BM',
    description: 'Request verification for Business Manager accounts',
  },
  WARRANTY: {
    path: ROUTES.WARRANTY,
    label: 'Claim Garansi',
    description: 'Submit and track warranty claims',
  },
  API: {
    path: ROUTES.API,
    label: 'API',
    description: 'Developer resources and API documentation',
  },
  TUTORIALS: {
    path: ROUTES.TUTORIALS,
    label: 'Tutorial',
    description: 'Guides and tutorials for using the platform',
    params: ['category', 'search'],
  },
  ADMIN_DASHBOARD: {
    path: ROUTES.ADMIN.DASHBOARD,
    label: 'Dashboard Admin',
    description: 'Admin dashboard with system overview and statistics',
  },
  ADMIN_USERS: {
    path: ROUTES.ADMIN.USERS,
    label: 'Kelola Pengguna',
    description: 'Manage user accounts and permissions',
  },
  ADMIN_TRANSACTIONS: {
    path: ROUTES.ADMIN.TRANSACTIONS,
    label: 'Kelola Transaksi',
    description: 'Manage and review all transactions',
  },
  ADMIN_CLAIMS: {
    path: ROUTES.ADMIN.CLAIMS,
    label: 'Kelola Klaim',
    description: 'Manage warranty claims and requests',
  },
  ADMIN_TUTORIALS: {
    path: ROUTES.ADMIN.TUTORIALS,
    label: 'Kelola Tutorial',
    description: 'Manage tutorial content and documentation',
  },
  ADMIN_PRODUCTS: {
    path: ROUTES.ADMIN.PRODUCTS,
    label: 'Kelola Produk',
    description: 'Manage product catalog and inventory',
  },
  ADMIN_ANNOUNCEMENTS: {
    path: ROUTES.ADMIN.ANNOUNCEMENTS,
    label: 'Kelola Announcement',
    description: 'Manage announcements and updates for members',
  },
  ADMIN_SETTINGS: {
    path: ROUTES.ADMIN.SETTINGS,
    label: 'Pengaturan Sistem',
    description: 'Configure system settings and preferences',
  },
  ADMIN_AUDIT_LOGS: {
    path: ROUTES.ADMIN.AUDIT_LOGS,
    label: 'Log Aktivitas',
    description: 'View system audit logs and activity history',
  },
};

/**
 * Build a route path with parameters
 * @param basePath - The base route path
 * @param params - Query parameters to append
 * @returns Complete URL with query parameters
 */
export const buildRoute = (
  basePath: string,
  params?: Record<string, string | number | boolean | undefined>
): string => {
  if (!params || Object.keys(params).length === 0) {
    return basePath;
  }

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
};

/**
 * Parse query parameters from URL
 * @param search - The search string from location (e.g., "?tab=accounts&page=2")
 * @returns Object with parsed parameters
 */
export const parseQueryParams = (search: string): Record<string, string> => {
  const params = new URLSearchParams(search);
  const result: Record<string, string> = {};
  
  params.forEach((value, key) => {
    result[key] = value;
  });
  
  return result;
};

/**
 * Check if a route path matches the current location
 * @param currentPath - Current location pathname
 * @param routePath - Route path to check against
 * @param exact - Whether to match exactly or allow nested routes
 * @returns True if the route matches
 */
export const isRouteActive = (
  currentPath: string,
  routePath: string,
  exact: boolean = false
): boolean => {
  if (exact) {
    return currentPath === routePath;
  }
  return currentPath.startsWith(routePath);
};
