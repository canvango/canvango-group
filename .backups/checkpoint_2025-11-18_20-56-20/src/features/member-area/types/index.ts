// Type exports
export * from './user';
export * from './product';
export * from './category';
export * from './transaction';
export * from './warranty';
export * from './api';
export * from './tutorial';
export * from './verified-bm';

// Re-export commonly used types for convenience
export type {
  User,
  UserStats,
  LoginCredentials,
  RegisterData
} from './user';

export type {
  Product,
  ProductFilters,
  ProductCategory,
  ProductType
} from './product';

export type {
  Category,
  CategoryFormData,
  CategoryFilters
} from './category';

export type {
  Transaction,
  TransactionStatus,
  TransactionType,
  Account
} from './transaction';

export type {
  WarrantyClaim,
  ClaimStatus,
  ClaimReason,
  Claim,
  CreateClaimInput,
  ClaimResponse
} from './warranty';

export type {
  APIKey,
  APIStats,
  APIEndpoint,
  APIParameter
} from './api';

export type {
  Tutorial,
  TutorialCategory
} from './tutorial';
