import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { parseApiError, ApplicationError } from '../../../shared/utils/errors';
import { getCSRFToken, getCSRFHeaderName } from '../../../shared/utils/csrf';
import { parseRateLimitHeaders, cacheRateLimitInfo } from '../../../shared/utils/rate-limit';

// Token storage keys
const TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

/**
 * Process queued requests after token refresh
 */
const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  
  failedQueue = [];
};

/**
 * Get API base URL from environment
 */
const getApiBaseUrl = (): string => {
  // In production (same port), use relative path
  // In development, use proxy or explicit URL
  const apiUrl = import.meta.env?.VITE_API_URL;
  
  if (apiUrl) {
    return apiUrl;
  }
  
  // Default: use relative path (works in both dev with proxy and production)
  return '/api';
};

/**
 * We no longer use mock data - always use real API
 */
const USE_MOCK_DATA = false;

/**
 * Create Axios instance with base configuration
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: USE_MOCK_DATA ? 'http://mock-api' : getApiBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Mock response handler removed - we now use real Supabase API

/**
 * Request interceptor
 * Adds authentication token, Supabase API key, and CSRF token to all requests
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_KEY);
    const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;
    
    // Add Supabase API key
    if (supabaseAnonKey && config.headers) {
      config.headers['apikey'] = supabaseAnonKey;
    }
    
    // Add authentication token
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add CSRF token to state-changing requests (POST, PUT, PATCH, DELETE)
    if (config.method && ['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
      if (config.headers) {
        config.headers[getCSRFHeaderName()] = getCSRFToken();
      }
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Transform snake_case keys to camelCase
 */
const toCamelCase = (str: string): string => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

/**
 * Recursively transform object keys from snake_case to camelCase
 */
const transformKeysToCamelCase = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => transformKeysToCamelCase(item));
  }
  
  if (typeof obj === 'object' && obj.constructor === Object) {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = toCamelCase(key);
      let value = transformKeysToCamelCase(obj[key]);
      
      // Convert numeric strings to numbers for specific fields
      if ((camelKey === 'balance' || camelKey === 'price' || camelKey === 'amount' || camelKey === 'totalPrice' || camelKey === 'unitPrice') && typeof value === 'string') {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          value = numValue;
        }
      }
      
      acc[camelKey] = value;
      return acc;
    }, {} as any);
  }
  
  return obj;
};

/**
 * Response interceptor
 * Handles authentication errors, token refresh, rate limiting, and error transformation
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Parse and cache rate limit headers from successful responses
    if (response.headers) {
      const rateLimitInfo = parseRateLimitHeaders(response.headers as any);
      if (rateLimitInfo && response.config.url) {
        cacheRateLimitInfo(response.config.url, rateLimitInfo);
      }
    }
    
    // Transform response data keys from snake_case to camelCase
    if (response.data) {
      response.data = transformKeysToCamelCase(response.data);
      
      // Note: We keep the wrapper { success, data } structure
      // Services should access response.data.data for the actual data
      // This maintains backward compatibility with existing services
    }
    
    return response;
  },
  async (error: any) => {
    const axiosError = error as AxiosError;
    // Parse and cache rate limit headers from error responses
    if (axiosError.response?.headers) {
      const rateLimitInfo = parseRateLimitHeaders(axiosError.response.headers as any);
      if (rateLimitInfo && axiosError.config?.url) {
        cacheRateLimitInfo(axiosError.config.url, rateLimitInfo);
      }
    }
    
    // Handle 429 Rate Limit errors specifically
    if (axiosError.response?.status === 429) {
      const appError = parseApiError(axiosError);
      appError.code = 'RATE_LIMIT_EXCEEDED';
      
      // Log rate limit error in development
      if (import.meta.env?.DEV) {
        console.warn('Rate limit exceeded:', {
          url: axiosError.config?.url,
          headers: axiosError.response.headers,
        });
      }
      
      return Promise.reject(appError);
    }
    const originalRequest = axiosError.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized errors
    if (axiosError.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Check if this is a refresh token request to avoid infinite loop
      if (originalRequest.url?.includes('/auth/refresh')) {
        // Refresh token is invalid, logout user
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        window.location.href = '/login';
        
        // Transform error to ApplicationError
        const appError = parseApiError(axiosError);
        return Promise.reject(appError);
      }

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      // Mark request as retry to prevent infinite loop
      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

      if (!refreshToken) {
        // No refresh token available, redirect to login
        localStorage.removeItem(TOKEN_KEY);
        window.location.href = '/login';
        
        // Transform error to ApplicationError
        const appError = parseApiError(axiosError);
        return Promise.reject(appError);
      }

      try {
        // Attempt to refresh the token
        const response = await axios.post(
          `${getApiBaseUrl()}/auth/refresh`,
          { refreshToken },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        const { token: newToken, refreshToken: newRefreshToken } = response.data;

        // Store new tokens
        localStorage.setItem(TOKEN_KEY, newToken);
        if (newRefreshToken) {
          localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
        }

        // Update authorization header
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        // Process queued requests
        processQueue(null, newToken);

        // Retry original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        processQueue(refreshError as Error, null);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        window.location.href = '/login';
        
        // Transform error to ApplicationError
        const appError = parseApiError(refreshError);
        return Promise.reject(appError);
      } finally {
        isRefreshing = false;
      }
    }

    // Transform all errors to ApplicationError for consistent error handling
    const appError = parseApiError(axiosError);
    
    // Log errors in development
    if (import.meta.env?.DEV) {
      console.error('API Error:', {
        type: appError.type,
        message: appError.message,
        code: appError.code,
        statusCode: appError.statusCode,
        details: appError.details
      });
    }

    return Promise.reject(appError);
  }
);

/**
 * Helper function to set auth token
 */
export const setAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Helper function to get auth token
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Helper function to clear auth tokens
 */
export const clearAuthTokens = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

/**
 * Helper function to handle API errors with user-friendly messages
 * Maps common API error codes to user-friendly messages
 */
export const getApiErrorMessage = (error: ApplicationError): string => {
  // Check for specific error codes
  const errorCodeMessages: Record<string, string> = {
    'INSUFFICIENT_BALANCE': 'Saldo Anda tidak mencukupi. Silakan top up terlebih dahulu.',
    'PRODUCT_OUT_OF_STOCK': 'Produk ini sedang habis. Silakan coba lagi nanti.',
    'INVALID_PAYMENT_METHOD': 'Metode pembayaran tidak valid. Silakan pilih metode lain.',
    'TRANSACTION_FAILED': 'Transaksi gagal. Silakan coba lagi.',
    'WARRANTY_EXPIRED': 'Garansi produk ini telah habis.',
    'WARRANTY_ALREADY_CLAIMED': 'Garansi untuk produk ini sudah pernah diklaim.',
    'INVALID_API_KEY': 'API key tidak valid. Silakan generate API key baru.',
    'RATE_LIMIT_EXCEEDED': 'Anda telah mencapai batas permintaan. Silakan coba lagi nanti.',
    'ACCOUNT_SUSPENDED': 'Akun Anda telah ditangguhkan. Hubungi customer support.',
    'INVALID_CREDENTIALS': 'Email atau password salah.',
    'EMAIL_ALREADY_EXISTS': 'Email sudah terdaftar.',
    'WEAK_PASSWORD': 'Password terlalu lemah. Gunakan kombinasi huruf, angka, dan simbol.',
  };

  // Return specific message if available
  if (error.code && errorCodeMessages[error.code]) {
    return errorCodeMessages[error.code];
  }

  // Return the error message from the API
  return error.message;
};

/**
 * Helper function to check if error is retryable
 */
export const isRetryableError = (error: ApplicationError): boolean => {
  // Network errors and server errors are retryable
  return error.type === 'network' || error.type === 'server';
};

export default apiClient;
