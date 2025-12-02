/**
 * Rate Limiting Utility
 * Uses Deno KV for high-performance rate limiting
 */

import { RATE_LIMITS, FEATURE_FLAGS } from './constants.ts';

export interface RateLimitConfig {
  key: string;      // IP address or user_id
  limit: number;    // Max requests
  window: number;   // Time window in seconds
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  total: number;
}

/**
 * Check rate limit using Deno KV
 */
export async function checkRateLimit(config: RateLimitConfig): Promise<RateLimitResult> {
  try {
    const kv = await Deno.openKv();
    const key = ['rate_limit', config.key];
    
    // Get current count
    const entry = await kv.get<number>(key);
    const now = Date.now();
    const windowMs = config.window * 1000;
    
    if (!entry.value) {
      // First request in window
      await kv.set(key, 1, { expireIn: windowMs });
      
      return {
        allowed: true,
        remaining: config.limit - 1,
        resetAt: now + windowMs,
        total: 1,
      };
    }
    
    const currentCount = entry.value;
    
    if (currentCount >= config.limit) {
      // Rate limit exceeded
      return {
        allowed: false,
        remaining: 0,
        resetAt: now + windowMs,
        total: currentCount,
      };
    }
    
    // Increment counter
    await kv.set(key, currentCount + 1, { expireIn: windowMs });
    
    return {
      allowed: true,
      remaining: config.limit - currentCount - 1,
      resetAt: now + windowMs,
      total: currentCount + 1,
    };
  } catch (error) {
    console.error('❌ Rate limit check failed:', error);
    // On error, allow the request (fail open)
    return {
      allowed: true,
      remaining: 0,
      resetAt: Date.now(),
      total: 0,
    };
  }
}

/**
 * Get rate limit configuration for endpoint
 */
export function getRateLimitConfig(endpoint: string, identifier: string): RateLimitConfig {
  let limit: number;
  let window: number;
  
  switch (endpoint) {
    case '/tripay-callback':
      limit = RATE_LIMITS.CALLBACK.limit;
      window = RATE_LIMITS.CALLBACK.window;
      break;
    case '/tripay-create-payment':
      limit = RATE_LIMITS.PAYMENT_CREATION.limit;
      window = RATE_LIMITS.PAYMENT_CREATION.window;
      break;
    case '/login':
    case '/auth/login':
      limit = RATE_LIMITS.LOGIN.limit;
      window = RATE_LIMITS.LOGIN.window;
      break;
    case '/get-account-data':
      limit = RATE_LIMITS.ACCOUNT_ACCESS.limit;
      window = RATE_LIMITS.ACCOUNT_ACCESS.window;
      break;
    default:
      // Default rate limit
      limit = 60;
      window = 60;
  }
  
  return {
    key: `${endpoint}:${identifier}`,
    limit,
    window,
  };
}

/**
 * Check rate limit for request
 * Returns result or throws error if rate limit exceeded
 */
export async function enforceRateLimit(
  endpoint: string,
  identifier: string,
  enabled: boolean = FEATURE_FLAGS.ENABLE_RATE_LIMITING
): Promise<RateLimitResult> {
  // If rate limiting is disabled, allow all requests
  if (!enabled) {
    return {
      allowed: true,
      remaining: 999,
      resetAt: Date.now() + 60000,
      total: 0,
    };
  }
  
  const config = getRateLimitConfig(endpoint, identifier);
  const result = await checkRateLimit(config);
  
  return result;
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.total.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.resetAt).toISOString(),
    ...(result.allowed ? {} : { 'Retry-After': Math.ceil((result.resetAt - Date.now()) / 1000).toString() }),
  };
}

/**
 * Reset rate limit for a key (admin function)
 */
export async function resetRateLimit(key: string): Promise<void> {
  try {
    const kv = await Deno.openKv();
    await kv.delete(['rate_limit', key]);
    console.log('✅ Rate limit reset for key:', key);
  } catch (error) {
    console.error('❌ Failed to reset rate limit:', error);
  }
}

/**
 * Get rate limit stats for monitoring
 */
export async function getRateLimitStats(key: string): Promise<{
  count: number;
  exists: boolean;
}> {
  try {
    const kv = await Deno.openKv();
    const entry = await kv.get<number>(['rate_limit', key]);
    
    return {
      count: entry.value || 0,
      exists: entry.value !== null,
    };
  } catch (error) {
    console.error('❌ Failed to get rate limit stats:', error);
    return {
      count: 0,
      exists: false,
    };
  }
}
