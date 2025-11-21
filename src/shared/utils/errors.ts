export enum ErrorType {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  SERVER = 'server',
  NETWORK = 'network',
  UNKNOWN = 'unknown'
}

export interface AppError {
  type: ErrorType;
  message: string;
  details?: Record<string, any>;
  code?: string;
  statusCode?: number;
}

export class ApplicationError extends Error implements AppError {
  type: ErrorType;
  details?: Record<string, any>;
  code?: string;
  statusCode?: number;

  constructor(
    type: ErrorType,
    message: string,
    details?: Record<string, any>,
    code?: string,
    statusCode?: number
  ) {
    super(message);
    this.name = 'ApplicationError';
    this.type = type;
    this.details = details;
    this.code = code;
    this.statusCode = statusCode;

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApplicationError);
    }
  }
}

// Error factory functions
export const createValidationError = (
  message: string,
  details?: Record<string, any>
): ApplicationError => {
  return new ApplicationError(ErrorType.VALIDATION, message, details, 'VALIDATION_ERROR', 400);
};

export const createAuthenticationError = (
  message: string = 'Authentication required'
): ApplicationError => {
  return new ApplicationError(ErrorType.AUTHENTICATION, message, undefined, 'AUTH_ERROR', 401);
};

export const createAuthorizationError = (
  message: string = 'You do not have permission to perform this action'
): ApplicationError => {
  return new ApplicationError(ErrorType.AUTHORIZATION, message, undefined, 'FORBIDDEN', 403);
};

export const createNotFoundError = (
  resource: string = 'Resource'
): ApplicationError => {
  return new ApplicationError(
    ErrorType.NOT_FOUND,
    `${resource} not found`,
    undefined,
    'NOT_FOUND',
    404
  );
};

export const createServerError = (
  message: string = 'An unexpected error occurred'
): ApplicationError => {
  return new ApplicationError(ErrorType.SERVER, message, undefined, 'SERVER_ERROR', 500);
};

export const createNetworkError = (
  message: string = 'Network connection failed'
): ApplicationError => {
  return new ApplicationError(ErrorType.NETWORK, message, undefined, 'NETWORK_ERROR');
};

// Error message helpers
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof ApplicationError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
};

export const getErrorSuggestion = (error: unknown): string | undefined => {
  if (!(error instanceof ApplicationError)) {
    return undefined;
  }

  switch (error.type) {
    case ErrorType.VALIDATION:
      return 'Please check your input and try again.';
    case ErrorType.AUTHENTICATION:
      return 'Please log in to continue.';
    case ErrorType.AUTHORIZATION:
      return 'Contact support if you believe you should have access.';
    case ErrorType.NOT_FOUND:
      return 'The item you are looking for may have been removed or does not exist.';
    case ErrorType.NETWORK:
      return 'Please check your internet connection and try again.';
    case ErrorType.SERVER:
      return 'Please try again later or contact support if the problem persists.';
    default:
      return 'Please try again or contact support if the problem persists.';
  }
};

// Parse API errors
export const parseApiError = (error: any): ApplicationError => {
  // Handle Axios errors
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;
    
    if (status === 400) {
      return createValidationError(
        data.message || 'Invalid request',
        data.errors
      );
    }
    
    if (status === 401) {
      return createAuthenticationError(data.message);
    }
    
    if (status === 403) {
      return createAuthorizationError(data.message);
    }
    
    if (status === 404) {
      return createNotFoundError(data.resource);
    }
    
    if (status >= 500) {
      return createServerError(data.message);
    }
  }
  
  // Handle network errors
  if (error.request && !error.response) {
    return createNetworkError();
  }
  
  // Handle unknown errors
  return new ApplicationError(
    ErrorType.UNKNOWN,
    getErrorMessage(error)
  );
};
