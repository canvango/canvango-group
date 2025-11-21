/**
 * Error Utilities
 * Centralized error handling and error types
 */

import { ERROR_MESSAGES } from './constants';

/**
 * Error Types
 */
export enum ErrorType {
  NETWORK = 'NETWORK_ERROR',
  SERVER = 'SERVER_ERROR',
  VALIDATION = 'VALIDATION_ERROR',
  AUTHENTICATION = 'AUTHENTICATION_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND_ERROR',
  TIMEOUT = 'TIMEOUT_ERROR',
  UNKNOWN = 'UNKNOWN_ERROR'
}

/**
 * Custom Application Error
 */
export class AppError extends Error {
  type: ErrorType;
  statusCode?: number;
  details?: any;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    statusCode?: number,
    details?: any
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

/**
 * Network Error
 */
export class NetworkError extends AppError {
  constructor(message: string = ERROR_MESSAGES.NETWORK_ERROR, details?: any) {
    super(message, ErrorType.NETWORK, undefined, details);
    this.name = 'NetworkError';
  }
}

/**
 * Server Error
 */
export class ServerError extends AppError {
  constructor(
    message: string = ERROR_MESSAGES.SERVER_ERROR,
    statusCode: number = 500,
    details?: any
  ) {
    super(message, ErrorType.SERVER, statusCode, details);
    this.name = 'ServerError';
  }
}

/**
 * Validation Error
 */
export class ValidationError extends AppError {
  constructor(message: string = ERROR_MESSAGES.VALIDATION_ERROR, details?: any) {
    super(message, ErrorType.VALIDATION, 422, details);
    this.name = 'ValidationError';
  }
}

/**
 * Authentication Error
 */
export class AuthenticationError extends AppError {
  constructor(message: string = ERROR_MESSAGES.UNAUTHORIZED, details?: any) {
    super(message, ErrorType.AUTHENTICATION, 401, details);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization Error
 */
export class AuthorizationError extends AppError {
  constructor(message: string = ERROR_MESSAGES.FORBIDDEN, details?: any) {
    super(message, ErrorType.AUTHORIZATION, 403, details);
    this.name = 'AuthorizationError';
  }
}

/**
 * Not Found Error
 */
export class NotFoundError extends AppError {
  constructor(message: string = ERROR_MESSAGES.NOT_FOUND, details?: any) {
    super(message, ErrorType.NOT_FOUND, 404, details);
    this.name = 'NotFoundError';
  }
}

/**
 * Timeout Error
 */
export class TimeoutError extends AppError {
  constructor(message: string = ERROR_MESSAGES.TIMEOUT_ERROR, details?: any) {
    super(message, ErrorType.TIMEOUT, 408, details);
    this.name = 'TimeoutError';
  }
}

/**
 * Parse error from API response
 */
export const parseAPIError = (error: any): AppError => {
  // Network error
  if (!error.response) {
    return new NetworkError(
      error.message || ERROR_MESSAGES.NETWORK_ERROR,
      error
    );
  }

  const { status, data } = error.response;
  const message = data?.message || data?.error || ERROR_MESSAGES.UNKNOWN_ERROR;

  // Map status codes to error types
  switch (status) {
    case 400:
      return new ValidationError(message, data);
    case 401:
      return new AuthenticationError(message, data);
    case 403:
      return new AuthorizationError(message, data);
    case 404:
      return new NotFoundError(message, data);
    case 408:
      return new TimeoutError(message, data);
    case 422:
      return new ValidationError(message, data);
    case 500:
    case 502:
    case 503:
    case 504:
      return new ServerError(message, status, data);
    default:
      return new AppError(message, ErrorType.UNKNOWN, status, data);
  }
};

/**
 * Get user-friendly error message
 */
export const getUserFriendlyMessage = (error: any): string => {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error.response) {
    const { status } = error.response;
    switch (status) {
      case 400:
      case 422:
        return ERROR_MESSAGES.VALIDATION_ERROR;
      case 401:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case 403:
        return ERROR_MESSAGES.FORBIDDEN;
      case 404:
        return ERROR_MESSAGES.NOT_FOUND;
      case 408:
        return ERROR_MESSAGES.TIMEOUT_ERROR;
      case 500:
      case 502:
      case 503:
      case 504:
        return ERROR_MESSAGES.SERVER_ERROR;
      default:
        return ERROR_MESSAGES.UNKNOWN_ERROR;
    }
  }

  if (error.request) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  return error.message || ERROR_MESSAGES.UNKNOWN_ERROR;
};

/**
 * Check if error is network error
 */
export const isNetworkError = (error: any): boolean => {
  return (
    error instanceof NetworkError ||
    (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') ||
    !error.response
  );
};

/**
 * Check if error is authentication error
 */
export const isAuthError = (error: any): boolean => {
  return (
    error instanceof AuthenticationError ||
    error.response?.status === 401
  );
};

/**
 * Check if error is authorization error
 */
export const isAuthorizationError = (error: any): boolean => {
  return (
    error instanceof AuthorizationError ||
    error.response?.status === 403
  );
};

/**
 * Check if error is validation error
 */
export const isValidationError = (error: any): boolean => {
  return (
    error instanceof ValidationError ||
    error.response?.status === 400 ||
    error.response?.status === 422
  );
};

/**
 * Check if error is server error
 */
export const isServerError = (error: any): boolean => {
  return (
    error instanceof ServerError ||
    (error.response?.status >= 500 && error.response?.status < 600)
  );
};

/**
 * Log error to console (development) or error tracking service (production)
 */
export const logError = (error: any, context?: string): void => {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[Error${context ? ` - ${context}` : ''}]:`, error);
    
    if (error instanceof AppError) {
      console.error('Error Type:', error.type);
      console.error('Status Code:', error.statusCode);
      console.error('Details:', error.details);
    }
  } else {
    // In production, send to error tracking service (e.g., Sentry)
    // Sentry.captureException(error, { tags: { context } });
  }
};

/**
 * Handle error with toast notification
 */
export const handleErrorWithToast = (
  error: any,
  showToast: (type: string, message: string) => void,
  context?: string
): void => {
  logError(error, context);
  
  const message = getUserFriendlyMessage(error);
  showToast('error', message);
};

/**
 * Retry function with exponential backoff
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: any;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Don't retry on client errors (4xx)
      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
};

/**
 * Create error handler for async operations
 */
export const createErrorHandler = (
  onError?: (error: AppError) => void
) => {
  return (error: any): AppError => {
    const appError = parseAPIError(error);
    logError(appError);

    if (onError) {
      onError(appError);
    }

    return appError;
  };
};
