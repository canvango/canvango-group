/**
 * Rate Limiting Utilities
 * 
 * Provides utilities for tracking and displaying API rate limit information
 */

export interface RateLimitInfo {
  /**
   * Maximum number of requests allowed
   */
  limit: number;
  
  /**
   * Number of requests remaining
   */
  remaining: number;
  
  /**
   * Timestamp when the rate limit resets (Unix timestamp in seconds)
   */
  reset: number;
  
  /**
   * Number of requests used
   */
  used: number;
}

export interface RateLimitStatus {
  /**
   * Percentage of rate limit used (0-100)
   */
  usagePercentage: number;
  
  /**
   * Whether the rate limit is approaching (>75%)
   */
  isApproaching: boolean;
  
  /**
   * Whether the rate limit has been exceeded
   */
  isExceeded: boolean;
  
  /**
   * Time until reset in milliseconds
   */
  timeUntilReset: number;
  
  /**
   * Human-readable time until reset
   */
  resetTimeFormatted: string;
  
  /**
   * Status level: 'safe', 'warning', 'danger', 'exceeded'
   */
  level: 'safe' | 'warning' | 'danger' | 'exceeded';
}

/**
 * Parse rate limit headers from API response
 */
export const parseRateLimitHeaders = (headers: Record<string, string>): RateLimitInfo | null => {
  const limit = headers['x-ratelimit-limit'] || headers['ratelimit-limit'];
  const remaining = headers['x-ratelimit-remaining'] || headers['ratelimit-remaining'];
  const reset = headers['x-ratelimit-reset'] || headers['ratelimit-reset'];
  
  if (!limit || !remaining || !reset) {
    return null;
  }
  
  const limitNum = parseInt(limit, 10);
  const remainingNum = parseInt(remaining, 10);
  const resetNum = parseInt(reset, 10);
  
  return {
    limit: limitNum,
    remaining: remainingNum,
    reset: resetNum,
    used: limitNum - remainingNum,
  };
};

/**
 * Calculate rate limit status
 */
export const calculateRateLimitStatus = (info: RateLimitInfo): RateLimitStatus => {
  const usagePercentage = (info.used / info.limit) * 100;
  const now = Math.floor(Date.now() / 1000);
  const timeUntilReset = Math.max(0, (info.reset - now) * 1000);
  
  let level: RateLimitStatus['level'] = 'safe';
  if (info.remaining === 0) {
    level = 'exceeded';
  } else if (usagePercentage >= 90) {
    level = 'danger';
  } else if (usagePercentage >= 75) {
    level = 'warning';
  }
  
  return {
    usagePercentage,
    isApproaching: usagePercentage >= 75,
    isExceeded: info.remaining === 0,
    timeUntilReset,
    resetTimeFormatted: formatTimeUntilReset(timeUntilReset),
    level,
  };
};

/**
 * Format time until reset in human-readable format
 */
export const formatTimeUntilReset = (milliseconds: number): string => {
  if (milliseconds <= 0) {
    return 'now';
  }
  
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
  
  if (minutes > 0) {
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }
  
  return `${seconds}s`;
};

/**
 * Get color class based on rate limit level
 */
export const getRateLimitColor = (level: RateLimitStatus['level']): {
  bg: string;
  text: string;
  border: string;
} => {
  switch (level) {
    case 'exceeded':
      return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
      };
    case 'danger':
      return {
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200',
      };
    case 'warning':
      return {
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        border: 'border-yellow-200',
      };
    case 'safe':
    default:
      return {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
      };
  }
};

/**
 * Get message based on rate limit status
 */
export const getRateLimitMessage = (status: RateLimitStatus, info: RateLimitInfo): string => {
  if (status.isExceeded) {
    return `Rate limit exceeded. Resets in ${status.resetTimeFormatted}.`;
  }
  
  if (status.level === 'danger') {
    return `Warning: ${info.remaining} requests remaining. Resets in ${status.resetTimeFormatted}.`;
  }
  
  if (status.level === 'warning') {
    return `Approaching rate limit: ${info.remaining} requests remaining.`;
  }
  
  return `${info.remaining} of ${info.limit} requests remaining.`;
};

/**
 * Store rate limit info in memory
 */
const rateLimitCache = new Map<string, RateLimitInfo>();

/**
 * Cache rate limit info for an endpoint
 */
export const cacheRateLimitInfo = (endpoint: string, info: RateLimitInfo): void => {
  rateLimitCache.set(endpoint, info);
};

/**
 * Get cached rate limit info for an endpoint
 */
export const getCachedRateLimitInfo = (endpoint: string): RateLimitInfo | null => {
  return rateLimitCache.get(endpoint) || null;
};

/**
 * Clear rate limit cache
 */
export const clearRateLimitCache = (): void => {
  rateLimitCache.clear();
};

/**
 * Check if rate limit error
 */
export const isRateLimitError = (error: any): boolean => {
  return (
    error?.response?.status === 429 ||
    error?.statusCode === 429 ||
    error?.code === 'RATE_LIMIT_EXCEEDED'
  );
};

/**
 * Extract retry-after header value
 */
export const getRetryAfter = (headers: Record<string, string>): number | null => {
  const retryAfter = headers['retry-after'] || headers['Retry-After'];
  
  if (!retryAfter) {
    return null;
  }
  
  // If it's a number, it's seconds
  const seconds = parseInt(retryAfter, 10);
  if (!isNaN(seconds)) {
    return seconds * 1000; // Convert to milliseconds
  }
  
  // If it's a date string, parse it
  const date = new Date(retryAfter);
  if (!isNaN(date.getTime())) {
    return Math.max(0, date.getTime() - Date.now());
  }
  
  return null;
};
