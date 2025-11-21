/**
 * Utilities Index
 * Central export point for all utility functions
 */

// Export all utilities
export * from './formatters';
export * from './validators';
export * from './constants';
export * from './helpers';
export * from './breadcrumbs';
export * from './navigation';

// Re-export commonly used utilities for convenience
export {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  truncateText,
  formatNumber,
  formatTime,
  formatFileSize,
  formatPercentage,
  formatPhoneNumber,
  formatDuration,
  capitalize,
  toTitleCase,
  formatAccountEmail,
  formatTransactionId
} from './formatters';

export {
  isValidEmail,
  isValidPhone,
  isValidUrl,
  validatePassword,
  isValidAmount,
  isValidUsername,
  isValidDateRange,
  isValidFileType,
  isValidFileSize,
  isRequired,
  hasMinLength,
  hasMaxLength,
  isNumeric,
  isAlphanumeric,
  isValidKTP,
  isValidCreditCard,
  isValidPostalCode,
  isInRange,
  hasMinItems,
  hasMaxItems
} from './validators';

export {
  copyToClipboard,
  debounce,
  throttle,
  generateId,
  generateUUID,
  sleep,
  deepClone,
  isEmpty,
  removeDuplicates,
  groupBy,
  sortBy,
  chunk,
  randomItem,
  shuffle,
  omit,
  pick,
  mergeDeep,
  parseQueryParams,
  toQueryString,
  downloadFile,
  downloadJSON,
  getFileExtension,
  isMobile,
  scrollToElement,
  getContrastColor
} from './helpers';

export {
  API_CONFIG,
  API_ENDPOINTS,
  STATUS_COLORS,
  PAYMENT_METHODS,
  TOPUP_NOMINALS,
  TOPUP_AMOUNTS,
  MIN_TOPUP_AMOUNT,
  MAX_TOPUP_AMOUNT,
  PAGINATION,
  FILE_UPLOAD,
  DATE_FORMATS,
  ROUTES,
  STORAGE_KEYS,
  VALIDATION,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  TUTORIAL_CATEGORIES,
  PRODUCT_CATEGORIES,
  CLAIM_REASONS,
  WHATSAPP,
  SOCIAL_MEDIA,
  APP_INFO,
  FEATURES
} from './constants';
