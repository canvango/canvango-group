/**
 * React Query configuration
 * Optimized settings for data fetching and caching
 */

import { QueryClient, DefaultOptions } from '@tanstack/react-query';
import { CACHE_PRESETS } from '../utils/api-optimization';

/**
 * Default query options
 */
const defaultQueryOptions: DefaultOptions = {
  queries: {
    // Stale time - how long data is considered fresh
    staleTime: CACHE_PRESETS.medium, // 5 minutes
    
    // Cache time - how long inactive data stays in cache
    gcTime: CACHE_PRESETS.long, // 15 minutes (formerly cacheTime)
    
    // Retry configuration
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors (client errors)
      if (error?.statusCode >= 400 && error?.statusCode < 500) {
        return false;
      }
      
      // Retry network errors more times
      if (error?.type === 'network' || error?.code === 'NETWORK_ERROR') {
        return failureCount < 3; // Retry 3 times for network errors
      }
      
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    
    // Retry delay with exponential backoff
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Max 10s delay
    
    // Refetch configuration
    refetchOnWindowFocus: false, // Don't refetch on window focus by default
    refetchOnReconnect: true, // Refetch when reconnecting to network
    refetchOnMount: true, // Refetch when component mounts
    
    // Network mode
    networkMode: 'online', // Only fetch when online
    
    // Structural sharing for better performance
    structuralSharing: true,
  },
  
  mutations: {
    // Retry configuration for mutations
    retry: 0, // Don't retry mutations by default
    
    // Network mode
    networkMode: 'online',
  },
};

/**
 * Create optimized Query Client
 */
export const createQueryClient = (): QueryClient => {
  return new QueryClient({
    defaultOptions: defaultQueryOptions,
  });
};

/**
 * Query key factories
 * Provides consistent key generation for different resources
 */
export const queryKeys = {
  // User queries
  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
    stats: () => [...queryKeys.user.all, 'stats'] as const,
  },
  
  // Product queries
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (filters?: Record<string, any>) => 
      [...queryKeys.products.lists(), filters] as const,
    details: () => [...queryKeys.products.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.products.details(), id] as const,
  },
  
  // Transaction queries
  transactions: {
    all: ['transactions'] as const,
    lists: () => [...queryKeys.transactions.all, 'list'] as const,
    list: (filters?: Record<string, any>) => 
      [...queryKeys.transactions.lists(), filters] as const,
    details: () => [...queryKeys.transactions.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.transactions.details(), id] as const,
    accounts: (id: string) => 
      [...queryKeys.transactions.detail(id), 'accounts'] as const,
  },
  
  // Warranty queries
  warranty: {
    all: ['warranty'] as const,
    claims: () => [...queryKeys.warranty.all, 'claims'] as const,
    claim: (id: string) => [...queryKeys.warranty.claims(), id] as const,
  },
  
  // Verified BM queries
  verifiedBM: {
    all: ['verified-bm'] as const,
    orders: () => [...queryKeys.verifiedBM.all, 'orders'] as const,
    order: (id: string) => [...queryKeys.verifiedBM.orders(), id] as const,
  },
  
  // API keys queries
  apiKeys: {
    all: ['api-keys'] as const,
    current: () => [...queryKeys.apiKeys.all, 'current'] as const,
    stats: () => [...queryKeys.apiKeys.all, 'stats'] as const,
  },
  
  // Tutorial queries
  tutorials: {
    all: ['tutorials'] as const,
    lists: () => [...queryKeys.tutorials.all, 'list'] as const,
    list: (filters?: Record<string, any>) => 
      [...queryKeys.tutorials.lists(), filters] as const,
    details: () => [...queryKeys.tutorials.all, 'detail'] as const,
    detail: (slug: string) => [...queryKeys.tutorials.details(), slug] as const,
  },
  
  // Top-up queries
  topup: {
    all: ['topup'] as const,
    methods: () => [...queryKeys.topup.all, 'methods'] as const,
    history: () => [...queryKeys.topup.all, 'history'] as const,
  },
};

/**
 * Cache time presets for different data types
 */
export const cacheConfig = {
  // Real-time data (30 seconds)
  realtime: {
    staleTime: CACHE_PRESETS.realtime,
    gcTime: CACHE_PRESETS.short,
  },
  
  // Dynamic data (1 minute)
  dynamic: {
    staleTime: CACHE_PRESETS.short,
    gcTime: CACHE_PRESETS.medium,
  },
  
  // Standard data (5 minutes)
  standard: {
    staleTime: CACHE_PRESETS.medium,
    gcTime: CACHE_PRESETS.long,
  },
  
  // Static data (15 minutes)
  static: {
    staleTime: CACHE_PRESETS.long,
    gcTime: CACHE_PRESETS.static,
  },
  
  // Permanent data (1 hour)
  permanent: {
    staleTime: CACHE_PRESETS.static,
    gcTime: Infinity,
  },
};

/**
 * Invalidation helpers
 */
export const invalidationHelpers = {
  // Invalidate all user data
  invalidateUser: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
  },
  
  // Invalidate all products
  invalidateProducts: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
  },
  
  // Invalidate all transactions
  invalidateTransactions: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
  },
  
  // Invalidate specific transaction
  invalidateTransaction: (queryClient: QueryClient, id: string) => {
    return queryClient.invalidateQueries({ 
      queryKey: queryKeys.transactions.detail(id) 
    });
  },
  
  // Invalidate all warranty claims
  invalidateWarranty: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.warranty.all });
  },
  
  // Invalidate all verified BM orders
  invalidateVerifiedBM: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.verifiedBM.all });
  },
  
  // Invalidate API keys
  invalidateAPIKeys: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys.all });
  },
  
  // Invalidate all tutorials
  invalidateTutorials: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.tutorials.all });
  },
};

/**
 * Prefetch helpers
 */
export const prefetchHelpers = {
  // Prefetch user profile
  prefetchUserProfile: async (queryClient: QueryClient, fetchFn: () => Promise<any>) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.user.profile(),
      queryFn: fetchFn,
      staleTime: CACHE_PRESETS.medium,
    });
  },
  
  // Prefetch products
  prefetchProducts: async (
    queryClient: QueryClient,
    fetchFn: () => Promise<any>,
    filters?: Record<string, any>
  ) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.products.list(filters),
      queryFn: fetchFn,
      staleTime: CACHE_PRESETS.medium,
    });
  },
  
  // Prefetch product detail
  prefetchProductDetail: async (
    queryClient: QueryClient,
    id: string,
    fetchFn: () => Promise<any>
  ) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.products.detail(id),
      queryFn: fetchFn,
      staleTime: CACHE_PRESETS.long,
    });
  },
};

/**
 * Export default query client instance
 */
export const queryClient = createQueryClient();
