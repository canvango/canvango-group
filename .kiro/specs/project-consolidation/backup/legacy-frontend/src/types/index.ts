/**
 * Type Definitions Index
 * Central export point for all type definitions
 */

// User types
export * from './user.types';

// Product types
export * from './product.types';

// Transaction types
export * from './transaction.types';

// Warranty types
export * from './warranty.types';

// API types
export * from './api.types';

// Tutorial types
export * from './tutorial.types';

// Common types
export * from './common.types';

// Re-export commonly used types for convenience
export type {
  User,
  UserProfile,
  UserStats,
  AuthCredentials
} from './user.types';

export type {
  Product,
  ProductFilters,
  PurchaseRequest,
  PurchaseResponse
} from './product.types';

export type {
  Transaction,
  TransactionFilters,
  TransactionStats
} from './transaction.types';

export type {
  WarrantyClaim,
  SubmitClaimRequest,
  ClaimResponse
} from './warranty.types';

export type {
  APIResponse,
  PaginatedResponse,
  PaginationParams,
  APIKey
} from './api.types';

export type {
  Tutorial,
  TutorialFilters
} from './tutorial.types';

export type {
  SortParams,
  FilterParams,
  SelectOption,
  AsyncState
} from './common.types';
