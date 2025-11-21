import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for login endpoint
 * Limits to 5 attempts per 15 minutes per IP address
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Terlalu banyak percobaan login. Silakan coba lagi setelah 15 menit.',
    },
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: false, // Count successful requests
  skipFailedRequests: false, // Count failed requests
});

/**
 * General API rate limiter
 * Limits to 100 requests per 15 minutes per IP address
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Terlalu banyak permintaan. Silakan coba lagi nanti.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});
