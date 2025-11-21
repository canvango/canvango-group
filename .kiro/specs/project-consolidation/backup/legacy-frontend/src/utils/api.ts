import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';

/**
 * API client with error handling interceptors
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 17.2
 */

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

/**
 * Request interceptor
 * Add any auth tokens or custom headers here
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // You can add auth tokens here if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error: AxiosError) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor
 * Handle errors globally and provide user-friendly messages
 */
api.interceptors.response.use(
  (response) => {
    // Return successful responses as-is
    return response;
  },
  (error: AxiosError) => {
    // Handle network errors
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        toast.error('Request timeout. Please try again.');
      } else if (error.message === 'Network Error') {
        toast.error('Network error. Please check your internet connection.');
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
      return Promise.reject(error);
    }

    // Handle HTTP error responses
    const { status, data } = error.response;
    const errorMessage = (data as any)?.error?.message || 'An error occurred';
    const errorCode = (data as any)?.error?.code;

    switch (status) {
      case 400:
        // Bad Request - validation errors
        if (errorCode === 'VAL_001' || errorCode?.startsWith('VAL_')) {
          // Validation errors are usually handled by forms
          // Don't show toast for validation errors
        } else {
          toast.error(errorMessage);
        }
        break;

      case 401:
        // Unauthorized - authentication required
        const currentPath = window.location.pathname;
        
        // Don't redirect if already on auth pages
        if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
          toast.error('Your session has expired. Please login again.');
          
          // Store the current path to redirect back after login
          sessionStorage.setItem('redirectAfterLogin', currentPath);
          
          // Redirect to login page
          setTimeout(() => {
            window.location.href = '/login';
          }, 1000);
        } else {
          // Show error message on login/register pages
          toast.error(errorMessage);
        }
        break;

      case 403:
        // Forbidden - insufficient permissions
        toast.error(errorMessage || 'You do not have permission to perform this action.');
        
        // Redirect to unauthorized page if not already there
        const isUnauthorizedPage = window.location.pathname === '/unauthorized';
        if (!isUnauthorizedPage) {
          setTimeout(() => {
            window.location.href = '/unauthorized';
          }, 1500);
        }
        break;

      case 404:
        // Not Found
        toast.error(errorMessage || 'The requested resource was not found.');
        break;

      case 409:
        // Conflict - e.g., duplicate entry
        toast.error(errorMessage);
        break;

      case 422:
        // Unprocessable Entity - validation errors
        toast.error(errorMessage);
        break;

      case 429:
        // Too Many Requests - rate limiting
        toast.error('Too many requests. Please try again later.');
        break;

      case 500:
        // Internal Server Error
        toast.error('Server error. Please try again later.');
        console.error('Server error:', errorMessage);
        break;

      case 502:
        // Bad Gateway
        toast.error('Service temporarily unavailable. Please try again later.');
        break;

      case 503:
        // Service Unavailable
        toast.error('Service is currently unavailable. Please try again later.');
        break;

      default:
        // Other errors
        toast.error(errorMessage || 'An unexpected error occurred.');
        console.error('API error:', { status, errorCode, errorMessage });
    }

    return Promise.reject(error);
  }
);

/**
 * Helper function to extract error message from API response
 */
export const getErrorMessage = (error: any): string => {
  if (error.response?.data?.error?.message) {
    return error.response.data.error.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

/**
 * Helper function to check if error is a specific error code
 */
export const isErrorCode = (error: any, code: string): boolean => {
  return error.response?.data?.error?.code === code;
};

export default api;
