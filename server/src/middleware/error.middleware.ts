import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../types/index.js';

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR', details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error codes enum for standardized error handling
 */
export const ErrorCodes = {
  // Authentication errors (AUTH_xxx)
  AUTH_INVALID_CREDENTIALS: 'AUTH_001',
  AUTH_TOKEN_EXPIRED: 'AUTH_002',
  AUTH_UNAUTHORIZED: 'AUTH_003',
  AUTH_USER_EXISTS: 'AUTH_004',
  AUTH_INVALID_TOKEN: 'AUTH_005',
  
  // Transaction errors (TRANS_xxx)
  TRANS_NOT_FOUND: 'TRANS_001',
  TRANS_INSUFFICIENT_BALANCE: 'TRANS_002',
  TRANS_INVALID_STATUS: 'TRANS_003',
  
  // Claim errors (CLAIM_xxx)
  CLAIM_ALREADY_SUBMITTED: 'CLAIM_001',
  CLAIM_NOT_ELIGIBLE: 'CLAIM_002',
  CLAIM_NOT_FOUND: 'CLAIM_003',
  
  // Top up errors (TOPUP_xxx)
  TOPUP_INVALID_METHOD: 'TOPUP_001',
  TOPUP_MINIMUM_AMOUNT: 'TOPUP_002',
  TOPUP_MAXIMUM_AMOUNT: 'TOPUP_003',
  
  // User errors (USER_xxx)
  USER_NOT_FOUND: 'USER_001',
  USER_INVALID_DATA: 'USER_002',
  
  // Validation errors (VAL_xxx)
  VALIDATION_ERROR: 'VAL_001',
  VALIDATION_MISSING_FIELD: 'VAL_002',
  VALIDATION_INVALID_FORMAT: 'VAL_003',
  
  // Permission errors (PERM_xxx)
  PERMISSION_DENIED: 'PERM_001',
  PERMISSION_INSUFFICIENT_ROLE: 'PERM_002',
  
  // General errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  BAD_REQUEST: 'BAD_REQUEST',
  DATABASE_ERROR: 'DATABASE_ERROR',
};

/**
 * Global error handling middleware
 * Catches all errors and returns standardized error responses
 */
export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Default error values
  let statusCode = 500;
  let code = ErrorCodes.INTERNAL_ERROR;
  let message = 'Internal server error';
  let details: any = undefined;

  // Handle AppError instances
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details;
  }
  // Handle JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = ErrorCodes.AUTH_INVALID_TOKEN;
    message = 'Invalid authentication token';
  }
  else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = ErrorCodes.AUTH_TOKEN_EXPIRED;
    message = 'Authentication token has expired';
  }
  // Handle validation errors
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    code = ErrorCodes.VALIDATION_ERROR;
    message = err.message;
  }
  // Handle database errors
  else if (err.message.includes('database') || err.message.includes('query')) {
    statusCode = 500;
    code = ErrorCodes.DATABASE_ERROR;
    message = 'Database operation failed';
  }
  // Handle generic errors
  else {
    message = err.message || message;
  }

  // Log error for debugging (in production, use proper logging service)
  console.error('Error:', {
    name: err.name,
    message: err.message,
    code,
    statusCode,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // Send error response
  const errorResponse: ApiError = {
    success: false,
    error: {
      code,
      message,
      details: process.env.NODE_ENV === 'development' ? details || err.stack : details,
    },
  };

  res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (_req: Request, res: Response): void => {
  const errorResponse: ApiError = {
    success: false,
    error: {
      code: ErrorCodes.NOT_FOUND,
      message: 'The requested resource was not found',
    },
  };

  res.status(404).json(errorResponse);
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
