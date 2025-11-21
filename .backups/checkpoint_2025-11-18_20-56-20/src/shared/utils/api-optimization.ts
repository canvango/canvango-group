/**
 * API optimization utilities
 * Provides request deduplication, caching, and query key optimization
 */

import { AxiosRequestConfig } from 'axios';

/**
 * In-flight request cache to prevent duplicate requests
 */
const inFlightRequests = new Map<string, Promise<any>>();

/**
 * Response cache for GET requests
 */
interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

const responseCache = new Map<string, CacheEntry>();

/**
 * Default cache duration (5 minutes)
 */
const DEFAULT_CACHE_DURATION = 5 * 60 * 1000;

/**
 * Generate cache key from request config
 */
export const generateCacheKey = (config: AxiosRequestConfig): string => {
  const { method = 'GET', url = '', params = {}, data } = config;
  
  // Sort params for consistent key generation
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {} as Record<string, any>);

  const key = JSON.stringify({
    method: method.toUpperCase(),
    url,
    params: sortedParams,
    data: method.toUpperCase() !== 'GET' ? data : undefined,
  });

  return key;
};

/**
 * Check if request is cacheable
 */
export const isCacheable = (config: AxiosRequestConfig): boolean => {
  const method = (config.method || 'GET').toUpperCase();
  
  // Only cache GET requests
  if (method !== 'GET') {
    return false;
  }

  // Don't cache if explicitly disabled
  if ((config as any).cache === false) {
    return false;
  }

  return true;
};

/**
 * Get cached response
 */
export const getCachedResponse = <T = any>(key: string): T | null => {
  const entry = responseCache.get(key);
  
  if (!entry) {
    return null;
  }

  // Check if cache has expired
  if (Date.now() > entry.expiresAt) {
    responseCache.delete(key);
    return null;
  }

  return entry.data;
};

/**
 * Set cached response
 */
export const setCachedResponse = <T = any>(
  key: string,
  data: T,
  duration: number = DEFAULT_CACHE_DURATION
): void => {
  const entry: CacheEntry<T> = {
    data,
    timestamp: Date.now(),
    expiresAt: Date.now() + duration,
  };

  responseCache.set(key, entry);
};

/**
 * Clear cached response
 */
export const clearCachedResponse = (key: string): void => {
  responseCache.delete(key);
};

/**
 * Clear all cached responses
 */
export const clearAllCache = (): void => {
  responseCache.clear();
};

/**
 * Clear expired cache entries
 */
export const clearExpiredCache = (): void => {
  const now = Date.now();
  
  for (const [key, entry] of responseCache.entries()) {
    if (now > entry.expiresAt) {
      responseCache.delete(key);
    }
  }
};

/**
 * Get cache statistics
 */
export const getCacheStats = () => {
  const now = Date.now();
  let validEntries = 0;
  let expiredEntries = 0;

  for (const entry of responseCache.values()) {
    if (now > entry.expiresAt) {
      expiredEntries++;
    } else {
      validEntries++;
    }
  }

  return {
    total: responseCache.size,
    valid: validEntries,
    expired: expiredEntries,
  };
};

/**
 * Deduplicate in-flight requests
 * Returns existing promise if request is already in flight
 */
export const deduplicateRequest = <T = any>(
  key: string,
  requestFn: () => Promise<T>
): Promise<T> => {
  // Check if request is already in flight
  const existingRequest = inFlightRequests.get(key);
  
  if (existingRequest) {
    return existingRequest;
  }

  // Execute request and store promise
  const promise = requestFn()
    .finally(() => {
      // Remove from in-flight requests when complete
      inFlightRequests.delete(key);
    });

  inFlightRequests.set(key, promise);
  
  return promise;
};

/**
 * Clear in-flight request
 */
export const clearInFlightRequest = (key: string): void => {
  inFlightRequests.delete(key);
};

/**
 * Clear all in-flight requests
 */
export const clearAllInFlightRequests = (): void => {
  inFlightRequests.clear();
};

/**
 * Get in-flight request statistics
 */
export const getInFlightStats = () => {
  return {
    count: inFlightRequests.size,
    keys: Array.from(inFlightRequests.keys()),
  };
};

/**
 * Invalidate cache by pattern
 * Useful for invalidating related cache entries
 */
export const invalidateCacheByPattern = (pattern: string | RegExp): number => {
  let count = 0;
  const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;

  for (const key of responseCache.keys()) {
    if (regex.test(key)) {
      responseCache.delete(key);
      count++;
    }
  }

  return count;
};

/**
 * Invalidate cache by URL
 */
export const invalidateCacheByUrl = (url: string): number => {
  return invalidateCacheByPattern(url);
};

/**
 * Batch invalidate cache
 */
export const batchInvalidateCache = (patterns: Array<string | RegExp>): number => {
  let totalCount = 0;

  patterns.forEach((pattern) => {
    totalCount += invalidateCacheByPattern(pattern);
  });

  return totalCount;
};

/**
 * Preload cache with data
 * Useful for prefetching data
 */
export const preloadCache = <T = any>(
  key: string,
  data: T,
  duration?: number
): void => {
  setCachedResponse(key, data, duration);
};

/**
 * Get cache size in bytes (approximate)
 */
export const getCacheSize = (): number => {
  let size = 0;

  for (const entry of responseCache.values()) {
    // Approximate size calculation
    size += JSON.stringify(entry.data).length;
  }

  return size;
};

/**
 * Optimize React Query keys
 * Provides consistent key generation for React Query
 */
export const createQueryKey = (
  resource: string,
  params?: Record<string, any>
): Array<string | Record<string, any>> => {
  if (!params || Object.keys(params).length === 0) {
    return [resource];
  }

  // Sort params for consistent key generation
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      // Only include defined values
      if (params[key] !== undefined && params[key] !== null) {
        acc[key] = params[key];
      }
      return acc;
    }, {} as Record<string, any>);

  return [resource, sortedParams];
};

/**
 * Create mutation key
 */
export const createMutationKey = (
  resource: string,
  action: string
): string[] => {
  return [resource, action];
};

/**
 * Invalidate React Query cache by resource
 */
export const getInvalidationKeys = (resource: string): string[][] => {
  return [
    [resource], // Invalidate all queries for this resource
  ];
};

/**
 * Cache configuration presets
 */
export const CACHE_PRESETS = {
  // Very short cache (30 seconds) - for frequently changing data
  realtime: 30 * 1000,
  
  // Short cache (1 minute) - for dynamic data
  short: 60 * 1000,
  
  // Medium cache (5 minutes) - default
  medium: 5 * 60 * 1000,
  
  // Long cache (15 minutes) - for relatively static data
  long: 15 * 60 * 1000,
  
  // Very long cache (1 hour) - for static data
  static: 60 * 60 * 1000,
  
  // Infinite cache - for data that never changes
  infinite: Infinity,
};

/**
 * Request priority levels
 */
export enum RequestPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Priority queue for requests
 */
class RequestQueue {
  private queues: Map<RequestPriority, Array<() => Promise<any>>> = new Map([
    [RequestPriority.CRITICAL, []],
    [RequestPriority.HIGH, []],
    [RequestPriority.NORMAL, []],
    [RequestPriority.LOW, []],
  ]);

  private processing = false;


  /**
   * Add request to queue
   */
  add<T>(priority: RequestPriority, requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const queue = this.queues.get(priority);
      
      if (queue) {
        queue.push(() =>
          requestFn()
            .then(resolve)
            .catch(reject)
        );
      }

      this.process();
    });
  }

  /**
   * Process queue
   */
  private async process(): Promise<void> {
    if (this.processing) {
      return;
    }

    this.processing = true;

    while (this.hasRequests()) {
      const request = this.getNextRequest();
      
      if (request) {
        try {
          await request();
        } catch (error) {
          // Error already handled by promise
        }
      }
    }

    this.processing = false;
  }

  /**
   * Check if there are pending requests
   */
  private hasRequests(): boolean {
    for (const queue of this.queues.values()) {
      if (queue.length > 0) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get next request by priority
   */
  private getNextRequest(): (() => Promise<any>) | null {
    // Process in priority order
    const priorities = [
      RequestPriority.CRITICAL,
      RequestPriority.HIGH,
      RequestPriority.NORMAL,
      RequestPriority.LOW,
    ];

    for (const priority of priorities) {
      const queue = this.queues.get(priority);
      if (queue && queue.length > 0) {
        return queue.shift() || null;
      }
    }

    return null;
  }

  /**
   * Clear all queues
   */
  clear(): void {
    for (const queue of this.queues.values()) {
      queue.length = 0;
    }
  }

  /**
   * Get queue statistics
   */
  getStats() {
    const stats: Record<string, number> = {};
    
    for (const [priority, queue] of this.queues.entries()) {
      stats[priority] = queue.length;
    }

    return stats;
  }
}

/**
 * Global request queue instance
 */
export const requestQueue = new RequestQueue();

/**
 * Batch requests together
 * Useful for combining multiple API calls into one
 */
export class RequestBatcher<T = any> {
  private batch: Array<{
    params: any;
    resolve: (value: T) => void;
    reject: (reason: any) => void;
  }> = [];

  private timeout: NodeJS.Timeout | null = null;
  private batchDelay: number;
  private batchFn: (params: any[]) => Promise<T[]>;

  constructor(batchFn: (params: any[]) => Promise<T[]>, batchDelay: number = 50) {
    this.batchFn = batchFn;
    this.batchDelay = batchDelay;
  }

  /**
   * Add request to batch
   */
  add(params: any): Promise<T> {
    return new Promise((resolve, reject) => {
      this.batch.push({ params, resolve, reject });

      // Clear existing timeout
      if (this.timeout) {
        clearTimeout(this.timeout);
      }

      // Set new timeout to execute batch
      this.timeout = setTimeout(() => {
        this.execute();
      }, this.batchDelay);
    });
  }

  /**
   * Execute batch
   */
  private async execute(): Promise<void> {
    if (this.batch.length === 0) {
      return;
    }

    const currentBatch = [...this.batch];
    this.batch = [];

    try {
      const params = currentBatch.map((item) => item.params);
      const results = await this.batchFn(params);

      // Resolve individual promises
      currentBatch.forEach((item, index) => {
        item.resolve(results[index]);
      });
    } catch (error) {
      // Reject all promises in batch
      currentBatch.forEach((item) => {
        item.reject(error);
      });
    }
  }
}
