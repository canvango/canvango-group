// Export API client
export { default as apiClient } from './api';

// Export services
export { productsService, type Product, type ProductFilters } from './products.service';
export { transactionsService, type Transaction, type TransactionFilters } from './transactions.service';
export { topupService, type PaymentMethod, type TopUpRequest } from './topup.service';
export { userService, type UserProfile, type UserStats } from './user.service';

// Re-export for convenience
export {
  productsService as products,
  transactionsService as transactions,
  topupService as topup,
  userService as user
};
