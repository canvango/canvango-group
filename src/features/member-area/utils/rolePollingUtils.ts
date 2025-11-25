/**
 * Role Polling Utilities
 * 
 * Provides error handling and retry logic for role polling
 */

import { supabase } from '../services/supabase';

/**
 * Configuration for exponential backoff retry logic
 */
interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffMultiplier: 2,
};

/**
 * State for tracking retry attempts
 */
class RetryState {
  private failureCount = 0;
  private lastSuccessTime = Date.now();
  private currentDelay = DEFAULT_RETRY_CONFIG.initialDelay;

  /**
   * Record a successful query
   */
  recordSuccess(): void {
    this.failureCount = 0;
    this.lastSuccessTime = Date.now();
    this.currentDelay = DEFAULT_RETRY_CONFIG.initialDelay;
  }

  /**
   * Record a failed query and calculate next retry delay
   * @returns The delay before next retry in milliseconds
   */
  recordFailure(): number {
    this.failureCount++;
    
    // Calculate exponential backoff delay
    const delay = Math.min(
      this.currentDelay * Math.pow(DEFAULT_RETRY_CONFIG.backoffMultiplier, this.failureCount - 1),
      DEFAULT_RETRY_CONFIG.maxDelay
    );
    
    this.currentDelay = delay;
    return delay;
  }

  /**
   * Check if max retries exceeded
   */
  isMaxRetriesExceeded(): boolean {
    return this.failureCount >= DEFAULT_RETRY_CONFIG.maxRetries;
  }

  /**
   * Get current failure count
   */
  getFailureCount(): number {
    return this.failureCount;
  }

  /**
   * Get time since last success
   */
  getTimeSinceLastSuccess(): number {
    return Date.now() - this.lastSuccessTime;
  }
}

/**
 * Global retry state instance
 */
const retryState = new RetryState();

/**
 * Query user role from database with error handling
 * 
 * @param userId - The user ID to query role for
 * @param cachedRole - Fallback role to use if query fails repeatedly
 * @returns The current role or cached role on failure
 */
export const queryUserRole = async (
  userId: string,
  cachedRole: string
): Promise<{ role: string; fromCache: boolean }> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) {
      throw error;
    }

    if (!data || !data.role) {
      throw new Error('No role data returned from query');
    }

    // Success - reset retry state
    retryState.recordSuccess();
    
    return {
      role: data.role,
      fromCache: false,
    };
  } catch (error: any) {
    // Record failure and get retry delay
    const retryDelay = retryState.recordFailure();
    
    // Log error details
    const errorType = getErrorType(error);
    console.error(
      `[Role Polling] Query failed (attempt ${retryState.getFailureCount()}/${DEFAULT_RETRY_CONFIG.maxRetries}):`,
      {
        errorType,
        message: error.message,
        code: error.code,
        nextRetryIn: `${retryDelay}ms`,
      }
    );

    // If max retries exceeded, fall back to cached role
    if (retryState.isMaxRetriesExceeded()) {
      console.warn(
        `[Role Polling] Max retries exceeded. Falling back to cached role: ${cachedRole}`
      );
      
      return {
        role: cachedRole,
        fromCache: true,
      };
    }

    // For transient errors, return cached role but continue retrying
    if (isTransientError(error)) {
      console.log(
        `[Role Polling] Transient error detected. Using cached role temporarily.`
      );
      
      return {
        role: cachedRole,
        fromCache: true,
      };
    }

    // For other errors, still return cached role
    return {
      role: cachedRole,
      fromCache: true,
    };
  }
};

/**
 * Determine the type of error for better logging
 */
function getErrorType(error: any): string {
  if (!error) return 'unknown';
  
  // Network errors
  if (error.message?.includes('fetch') || error.message?.includes('network')) {
    return 'network';
  }
  
  // Timeout errors
  if (error.message?.includes('timeout')) {
    return 'timeout';
  }
  
  // Database errors
  if (error.code?.startsWith('PG')) {
    return 'database';
  }
  
  // RLS policy errors
  if (error.code === 'PGRST301' || error.code === '42501') {
    return 'permission';
  }
  
  return 'unknown';
}

/**
 * Check if an error is transient (temporary) and should be retried
 */
function isTransientError(error: any): boolean {
  if (!error) return false;
  
  const errorType = getErrorType(error);
  
  // Network and timeout errors are typically transient
  if (errorType === 'network' || errorType === 'timeout') {
    return true;
  }
  
  // Some database errors are transient
  if (error.code === '08000' || error.code === '08003' || error.code === '08006') {
    return true; // Connection errors
  }
  
  // Rate limiting is transient
  if (error.status === 429) {
    return true;
  }
  
  return false;
}

/**
 * Get current retry state information for debugging
 */
export const getRetryStateInfo = () => {
  return {
    failureCount: retryState.getFailureCount(),
    timeSinceLastSuccess: retryState.getTimeSinceLastSuccess(),
    isMaxRetriesExceeded: retryState.isMaxRetriesExceeded(),
  };
};

/**
 * Reset retry state (useful for testing or manual recovery)
 */
export const resetRetryState = () => {
  retryState.recordSuccess();
};
