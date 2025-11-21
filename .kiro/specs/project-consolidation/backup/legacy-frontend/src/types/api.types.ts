/**
 * API Type Definitions
 * Centralized types for API-related data structures
 */

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE'
}

export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503
}

export interface APIResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: APIError;
  meta?: ResponseMeta;
}

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, any>;
  field?: string;
  timestamp: string;
}

export interface ResponseMeta {
  timestamp: string;
  requestId: string;
  version: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface APIKey {
  id: string;
  key: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  lastUsedAt?: string;
  expiresAt?: string;
  permissions: string[];
}

export interface APIEndpoint {
  id: string;
  method: HttpMethod;
  path: string;
  description: string;
  category: string;
  requiresAuth: boolean;
  rateLimit?: {
    requests: number;
    window: number; // in seconds
  };
  parameters?: APIParameter[];
  responses?: APIResponseExample[];
}

export interface APIParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  description: string;
  example?: any;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    enum?: any[];
  };
}

export interface APIResponseExample {
  status: HttpStatus;
  description: string;
  example: any;
}

export interface APIStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number; // in ms
  requestsToday: number;
  remainingQuota: number;
  quotaLimit: number;
  lastRequestAt?: string;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp
  retryAfter?: number; // seconds
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface BulkOperationResult<T> {
  success: boolean;
  total: number;
  successful: number;
  failed: number;
  results: Array<{
    item: T;
    success: boolean;
    error?: string;
  }>;
}
