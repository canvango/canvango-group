/**
 * useRateLimit Hook
 * 
 * React hook for tracking and managing API rate limit information
 */

import { useState, useEffect, useCallback } from 'react';
import {
  RateLimitInfo,
  RateLimitStatus,
  parseRateLimitHeaders,
  calculateRateLimitStatus,
  cacheRateLimitInfo,
  getCachedRateLimitInfo,
  isRateLimitError,
  getRetryAfter,
} from '../utils/rate-limit';

interface UseRateLimitOptions {
  /**
   * Endpoint to track rate limit for
   */
  endpoint?: string;
  
  /**
   * Callback when rate limit is exceeded
   */
  onExceeded?: () => void;
  
  /**
   * Callback when approaching rate limit (>75%)
   */
  onApproaching?: () => void;
  
  /**
   * Whether to show warnings
   */
  showWarnings?: boolean;
}

interface UseRateLimitReturn {
  /**
   * Current rate limit information
   */
  rateLimitInfo: RateLimitInfo | null;
  
  /**
   * Current rate limit status
   */
  status: RateLimitStatus | null;
  
  /**
   * Whether rate limit is exceeded
   */
  isExceeded: boolean;
  
  /**
   * Whether approaching rate limit
   */
  isApproaching: boolean;
  
  /**
   * Update rate limit info from response headers
   */
  updateFromHeaders: (headers: Record<string, string>) => void;
  
  /**
   * Handle rate limit error
   */
  handleRateLimitError: (error: any) => void;
  
  /**
   * Reset rate limit info
   */
  reset: () => void;
}

/**
 * Hook for managing rate limit state
 * 
 * @example
 * const { rateLimitInfo, isExceeded, updateFromHeaders } = useRateLimit({
 *   endpoint: '/api/products',
 *   onExceeded: () => toast.error('Rate limit exceeded'),
 * });
 * 
 * // In API call
 * const response = await fetch('/api/products');
 * updateFromHeaders(response.headers);
 */
export const useRateLimit = (options: UseRateLimitOptions = {}): UseRateLimitReturn => {
  const {
    endpoint,
    onExceeded,
    onApproaching,
    showWarnings = true,
  } = options;

  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo | null>(() => {
    // Try to get cached info on mount
    return endpoint ? getCachedRateLimitInfo(endpoint) : null;
  });

  const [status, setStatus] = useState<RateLimitStatus | null>(null);

  // Calculate status when rate limit info changes
  useEffect(() => {
    if (!rateLimitInfo) {
      setStatus(null);
      return;
    }

    const newStatus = calculateRateLimitStatus(rateLimitInfo);
    setStatus(newStatus);

    // Trigger callbacks
    if (newStatus.isExceeded && onExceeded) {
      onExceeded();
    } else if (newStatus.isApproaching && onApproaching && showWarnings) {
      onApproaching();
    }
  }, [rateLimitInfo, onExceeded, onApproaching, showWarnings]);

  /**
   * Update rate limit info from response headers
   */
  const updateFromHeaders = useCallback((headers: Record<string, string>) => {
    const info = parseRateLimitHeaders(headers);
    
    if (info) {
      setRateLimitInfo(info);
      
      // Cache the info if endpoint is provided
      if (endpoint) {
        cacheRateLimitInfo(endpoint, info);
      }
    }
  }, [endpoint]);

  /**
   * Handle rate limit error
   */
  const handleRateLimitError = useCallback((error: any) => {
    if (!isRateLimitError(error)) {
      return;
    }

    // Try to extract rate limit info from error response
    const headers = error?.response?.headers || {};
    updateFromHeaders(headers);

    // Get retry-after if available
    const retryAfter = getRetryAfter(headers);
    
    if (retryAfter && showWarnings) {
      console.warn(`Rate limit exceeded. Retry after ${retryAfter}ms`);
    }

    // Trigger exceeded callback
    if (onExceeded) {
      onExceeded();
    }
  }, [updateFromHeaders, onExceeded, showWarnings]);

  /**
   * Reset rate limit info
   */
  const reset = useCallback(() => {
    setRateLimitInfo(null);
    setStatus(null);
  }, []);

  return {
    rateLimitInfo,
    status,
    isExceeded: status?.isExceeded || false,
    isApproaching: status?.isApproaching || false,
    updateFromHeaders,
    handleRateLimitError,
    reset,
  };
};

/**
 * Hook for tracking global rate limit across all API calls
 */
export const useGlobalRateLimit = (options: UseRateLimitOptions = {}): UseRateLimitReturn => {
  return useRateLimit({
    ...options,
    endpoint: 'global',
  });
};

export default useRateLimit;
