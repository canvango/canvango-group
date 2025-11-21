import toast from 'react-hot-toast';

/**
 * Fetch-based API client with error handling
 * Replaces axios to reduce bundle size by ~38KB
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 17.2, 14.1
 */

export interface FetchOptions extends RequestInit {
  timeout?: number;
  baseURL?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

class FetchClient {
  private baseURL: string;
  private defaultTimeout: number;

  constructor(baseURL?: string, timeout = 30000) {
    this.baseURL = baseURL || import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    this.defaultTimeout = timeout;
  }

  /**
   * Main fetch method with timeout and error handling
   */
  private async fetchWithTimeout(
    url: string,
    options: FetchOptions = {}
  ): Promise<Response> {
    const { timeout = this.defaultTimeout, baseURL, ...fetchOptions } = options;
    const fullURL = url.startsWith('http') ? url : `${baseURL || this.baseURL}${url}`;

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(fullURL, {
        ...fetchOptions,
        signal: controller.signal,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions.headers,
        },
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please try again.');
      }
      
      if (error.message === 'Failed to fetch') {
        throw new Error('Network error. Please check your internet connection.');
      }
      
      throw error;
    }
  }

  /**
   * Handle API response and errors
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    // Handle successful responses
    if (response.ok) {
      // Handle 204 No Content
      if (response.status === 204) {
        return {} as T;
      }
      
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return response.json();
      }
      
      return response.text() as any;
    }

    // Handle error responses
    const status = response.status;
    let errorData: any = {};
    
    try {
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        errorData = await response.json();
      } else {
        errorData = { message: await response.text() };
      }
    } catch {
      errorData = { message: 'An error occurred' };
    }

    const errorMessage = errorData?.error?.message || errorData?.message || 'An error occurred';
    const errorCode = errorData?.error?.code;

    // Handle different status codes
    switch (status) {
      case 400:
        // Bad Request - validation errors
        if (!errorCode?.startsWith('VAL_')) {
          toast.error(errorMessage);
        }
        break;

      case 401:
        // Unauthorized - authentication required
        const currentPath = window.location.pathname;
        
        if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
          toast.error('Your session has expired. Please login again.');
          sessionStorage.setItem('redirectAfterLogin', currentPath);
          
          setTimeout(() => {
            window.location.href = '/login';
          }, 1000);
        } else {
          toast.error(errorMessage);
        }
        break;

      case 403:
        // Forbidden - insufficient permissions
        toast.error(errorMessage || 'You do not have permission to perform this action.');
        
        const isUnauthorizedPage = window.location.pathname === '/unauthorized';
        if (!isUnauthorizedPage) {
          setTimeout(() => {
            window.location.href = '/unauthorized';
          }, 1500);
        }
        break;

      case 404:
        toast.error(errorMessage || 'The requested resource was not found.');
        break;

      case 409:
        toast.error(errorMessage);
        break;

      case 422:
        toast.error(errorMessage);
        break;

      case 429:
        toast.error('Too many requests. Please try again later.');
        break;

      case 500:
        toast.error('Server error. Please try again later.');
        console.error('Server error:', errorMessage);
        break;

      case 502:
        toast.error('Service temporarily unavailable. Please try again later.');
        break;

      case 503:
        toast.error('Service is currently unavailable. Please try again later.');
        break;

      default:
        toast.error(errorMessage || 'An unexpected error occurred.');
        console.error('API error:', { status, errorCode, errorMessage });
    }

    const error: ApiError = {
      message: errorMessage,
      code: errorCode,
      status,
    };

    throw error;
  }

  /**
   * GET request
   */
  async get<T = any>(url: string, options?: FetchOptions): Promise<T> {
    const response = await this.fetchWithTimeout(url, {
      ...options,
      method: 'GET',
    });
    return this.handleResponse<T>(response);
  }

  /**
   * POST request
   */
  async post<T = any>(url: string, data?: any, options?: FetchOptions): Promise<T> {
    const response = await this.fetchWithTimeout(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  /**
   * PUT request
   */
  async put<T = any>(url: string, data?: any, options?: FetchOptions): Promise<T> {
    const response = await this.fetchWithTimeout(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  /**
   * PATCH request
   */
  async patch<T = any>(url: string, data?: any, options?: FetchOptions): Promise<T> {
    const response = await this.fetchWithTimeout(url, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  /**
   * DELETE request
   */
  async delete<T = any>(url: string, options?: FetchOptions): Promise<T> {
    const response = await this.fetchWithTimeout(url, {
      ...options,
      method: 'DELETE',
    });
    return this.handleResponse<T>(response);
  }
}

// Create and export default instance
const api = new FetchClient();

/**
 * Helper function to extract error message from API response
 */
export const getErrorMessage = (error: any): string => {
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

/**
 * Helper function to check if error is a specific error code
 */
export const isErrorCode = (error: any, code: string): boolean => {
  return error.code === code;
};

export default api;
