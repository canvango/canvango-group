export {
  ErrorType,
  ApplicationError,
  createValidationError,
  createAuthenticationError,
  createAuthorizationError,
  createNotFoundError,
  createServerError,
  createNetworkError,
  getErrorMessage,
  getErrorSuggestion,
  parseApiError
} from './errors';
export type { AppError } from './errors';

export {
  validateField,
  validateForm,
  ValidationPatterns,
  CommonValidationRules,
  sanitizeInput,
  isValidEmail,
  validatePasswordStrength,
  formatValidationErrors,
  hasErrors
} from './validation';
export type { ValidationRule, ValidationRules } from './validation';

export { default as analytics } from './analytics';
export type { 
  AnalyticsEvent, 
  PageViewEvent, 
  UserContext, 
  AnalyticsProvider as IAnalyticsProvider 
} from './analytics';
export {
  ConsoleAnalyticsProvider,
  GoogleAnalyticsProvider,
  CustomAPIAnalyticsProvider,
  AnalyticsManager
} from './analytics';

export {
  escapeHtml,
  stripHtmlTags,
  sanitizeUrl,
  sanitizeEmail,
  sanitizePhone,
  sanitizeNumber,
  sanitizeFilename,
  containsDangerousContent,
  sanitizeObjectKeys,
  createSafeHtml,
  assertSafeContent
} from './xss-prevention';

export {
  generateCSRFToken,
  getCSRFToken,
  setCSRFToken,
  clearCSRFToken,
  getCSRFHeaderName,
  getCSRFHeaders,
  validateCSRFToken,
  refreshCSRFToken
} from './csrf';

export {
  parseRateLimitHeaders,
  calculateRateLimitStatus,
  formatTimeUntilReset,
  getRateLimitColor,
  getRateLimitMessage,
  cacheRateLimitInfo,
  getCachedRateLimitInfo,
  clearRateLimitCache,
  isRateLimitError,
  getRetryAfter
} from './rate-limit';
export type { RateLimitInfo, RateLimitStatus } from './rate-limit';

export {
  isWebPSupported,
  getOptimizedImageSrc,
  generateSrcSet,
  preloadImages,
  createPlaceholder,
  getOptimalImageQuality
} from './image-optimization';

export {
  IMAGE_FORMATS,
  IMAGE_SIZES,
  IMAGE_OPTIMIZATION,
  CRITICAL_IMAGES,
  IMAGE_CDN,
  getImageSizes,
  generateResponsiveSrcSet,
  isFormatSupported,
  getBestImageFormat,
  buildOptimizedImageUrl
} from './image-config';
export type { ImageFormat, ImageSize } from './image-config';

export {
  preloadResource,
  preloadResources,
  preloadFonts,
  preloadStyles,
  preloadScripts,
  prefetchResource,
  prefetchResources,
  dnsPrefetch,
  preconnect,
  prefetchNextPage,
  prefetchOnHover,
  isResourceLoaded,
  loadScript,
  loadStylesheet,
  preloadCriticalResources
} from './resource-preload';
export type { PreloadResourceType, PreloadOptions } from './resource-preload';

export {
  generateCacheKey,
  isCacheable,
  getCachedResponse,
  setCachedResponse,
  clearCachedResponse,
  clearAllCache,
  clearExpiredCache,
  getCacheStats,
  deduplicateRequest,
  clearInFlightRequest,
  clearAllInFlightRequests,
  getInFlightStats,
  invalidateCacheByPattern,
  invalidateCacheByUrl,
  batchInvalidateCache,
  preloadCache,
  getCacheSize,
  createQueryKey,
  createMutationKey,
  getInvalidationKeys,
  CACHE_PRESETS,
  RequestPriority,
  requestQueue,
  RequestBatcher
} from './api-optimization';

export {
  transitions,
  focusRing,
  hoverEffects,
  shadows,
  rounded,
  spacing,
  iconSizes,
  typography,
  buttonBase,
  inputBase,
  cardBase,
  generateHoverClasses,
  generateResponsiveClasses,
  cn,
  statusColors,
  skeletonClasses,
  overlayClasses,
  modalClasses,
  tableClasses,
  formClasses,
  badgeClasses,
  alertClasses,
  dividerClasses,
  containerClasses,
  gridClasses
} from './ui-patterns';
