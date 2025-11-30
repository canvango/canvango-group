/**
 * Supabase Error Handler Utility
 * 
 * Provides centralized error handling for Supabase operations.
 * Handles common errors like token expiration, network issues, and RLS violations.
 */

import { PostgrestError } from '@supabase/supabase-js';

export interface SupabaseErrorInfo {
  isAuthError: boolean;
  isNetworkError: boolean;
  isRLSError: boolean;
  isTimeoutError: boolean;
  shouldRetry: boolean;
  shouldLogout: boolean;
  userMessage: string;
  originalError: any;
}

/**
 * Analyze Supabase error and provide actionable information
 */
export function analyzeSupabaseError(error: any): SupabaseErrorInfo {
  const errorMessage = error?.message?.toLowerCase() || '';
  const errorCode = error?.code || '';
  const errorStatus = error?.status || 0;

  // Check for auth errors
  const isAuthError = 
    errorStatus === 401 ||
    errorStatus === 403 ||
    errorCode === 'PGRST301' || // JWT expired
    errorMessage.includes('jwt') ||
    errorMessage.includes('token') ||
    errorMessage.includes('unauthorized') ||
    errorMessage.includes('session');

  // Check for network errors
  const isNetworkError = 
    errorMessage.includes('fetch') ||
    errorMessage.includes('network') ||
    errorMessage.includes('connection') ||
    errorMessage.includes('timeout') ||
    error?.name === 'NetworkError' ||
    error?.name === 'TypeError';

  // Check for RLS (Row Level Security) errors
  const isRLSError = 
    errorCode === '42501' || // Insufficient privilege
    errorCode === 'PGRST116' || // No rows returned
    errorMessage.includes('permission denied') ||
    errorMessage.includes('row-level security');

  // Check for timeout errors
  const isTimeoutError = 
    errorCode === '57014' || // Query cancelled
    errorMessage.includes('timeout') ||
    errorMessage.includes('cancelled');

  // Determine if should retry
  const shouldRetry = 
    isNetworkError || 
    isTimeoutError ||
    (isAuthError && !errorMessage.includes('invalid')); // Retry auth errors except invalid credentials

  // Determine if should logout
  const shouldLogout = 
    isAuthError && 
    !shouldRetry &&
    (errorMessage.includes('expired') || errorMessage.includes('invalid'));

  // Generate user-friendly message
  let userMessage = 'Terjadi kesalahan. Silakan coba lagi.';
  
  if (isAuthError) {
    if (errorMessage.includes('expired')) {
      userMessage = 'Sesi Anda telah berakhir. Silakan login kembali.';
    } else if (errorMessage.includes('invalid')) {
      userMessage = 'Kredensial tidak valid. Silakan login kembali.';
    } else {
      userMessage = 'Autentikasi gagal. Silakan login kembali.';
    }
  } else if (isNetworkError) {
    userMessage = 'Koneksi internet terputus. Periksa koneksi Anda.';
  } else if (isRLSError) {
    userMessage = 'Anda tidak memiliki akses ke data ini.';
  } else if (isTimeoutError) {
    userMessage = 'Permintaan memakan waktu terlalu lama. Silakan coba lagi.';
  } else if (error?.message) {
    // Use original message if available
    userMessage = error.message;
  }

  return {
    isAuthError,
    isNetworkError,
    isRLSError,
    isTimeoutError,
    shouldRetry,
    shouldLogout,
    userMessage,
    originalError: error,
  };
}

/**
 * Handle Supabase operation with automatic error handling
 * 
 * @example
 * ```typescript
 * const data = await handleSupabaseOperation(
 *   async () => supabase.from('users').select('*'),
 *   'fetchUsers'
 * );
 * ```
 */
export async function handleSupabaseOperation<T>(
  operation: () => Promise<{ data: T; error: PostgrestError | null }>,
  operationName: string = 'operation'
): Promise<T> {
  try {
    const { data, error } = await operation();

    if (error) {
      const errorInfo = analyzeSupabaseError(error);
      
      console.error(`❌ Supabase ${operationName} failed:`, {
        error,
        errorInfo,
      });

      // Throw enhanced error with analysis
      const enhancedError: any = new Error(errorInfo.userMessage);
      enhancedError.originalError = error;
      enhancedError.errorInfo = errorInfo;
      enhancedError.status = error.code === 'PGRST301' ? 401 : 500;
      
      throw enhancedError;
    }

    return data;
  } catch (error: any) {
    // If error is already enhanced, rethrow it
    if (error.errorInfo) {
      throw error;
    }

    // Otherwise, analyze and enhance it
    const errorInfo = analyzeSupabaseError(error);
    
    console.error(`❌ Supabase ${operationName} exception:`, {
      error,
      errorInfo,
    });

    const enhancedError: any = new Error(errorInfo.userMessage);
    enhancedError.originalError = error;
    enhancedError.errorInfo = errorInfo;
    enhancedError.status = errorInfo.isAuthError ? 401 : 500;
    
    throw enhancedError;
  }
}

/**
 * Wrap Supabase query with timeout
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 30000,
  operationName: string = 'operation'
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`${operationName} timeout after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: any): boolean {
  const errorInfo = analyzeSupabaseError(error);
  return errorInfo.shouldRetry;
}

/**
 * Check if error requires logout
 */
export function requiresLogout(error: any): boolean {
  const errorInfo = analyzeSupabaseError(error);
  return errorInfo.shouldLogout;
}
