/**
 * Security Constants
 * Tripay IP whitelist and security configuration
 */

// Tripay Official IP Addresses (CIDR notation)
export const TRIPAY_IP_WHITELIST = [
  '103.140.36.0/24',    // 103.140.36.0 - 103.140.36.255
  '103.140.37.0/24',    // 103.140.37.0 - 103.140.37.255
  '103.140.38.0/24',    // 103.140.38.0 - 103.140.38.255
  '103.140.39.0/24',    // 103.140.39.0 - 103.140.39.255
];

// Allow localhost for development/testing
export const DEVELOPMENT_IPS = [
  '127.0.0.1',
  '::1',
  'localhost',
];

// Feature flags (can be overridden by environment variables)
export const FEATURE_FLAGS = {
  ENABLE_IP_VALIDATION: Deno.env.get('ENABLE_IP_VALIDATION') === 'true',
  ENABLE_RATE_LIMITING: Deno.env.get('ENABLE_RATE_LIMITING') === 'true',
  ENABLE_ENCRYPTION: Deno.env.get('ENABLE_ENCRYPTION') === 'true',
  ENABLE_STRICT_MODE: Deno.env.get('ENABLE_STRICT_MODE') === 'true',
};

// Rate limit configurations
export const RATE_LIMITS = {
  CALLBACK: { limit: 100, window: 60 },           // 100 req/min
  PAYMENT_CREATION: { limit: 10, window: 60 },    // 10 req/min
  LOGIN: { limit: 5, window: 900 },               // 5 req/15min
  ACCOUNT_ACCESS: { limit: 20, window: 60 },      // 20 req/min
};

// Security event severity levels
export enum SecuritySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Security event types
export enum SecurityEventType {
  CALLBACK_RECEIVED = 'CALLBACK_RECEIVED',
  CALLBACK_SIGNATURE_FAIL = 'CALLBACK_SIGNATURE_FAIL',
  CALLBACK_IP_FAIL = 'CALLBACK_IP_FAIL',
  CALLBACK_IP_WARNING = 'CALLBACK_IP_WARNING',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  ENCRYPTION_KEY_ACCESS = 'ENCRYPTION_KEY_ACCESS',
  TRANSACTION_MISMATCH = 'TRANSACTION_MISMATCH',
  IDEMPOTENCY_CHECK = 'IDEMPOTENCY_CHECK',
}
