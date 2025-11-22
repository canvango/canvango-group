import { CorsOptions } from 'cors';

/**
 * CORS Configuration
 * Whitelist allowed origins based on environment
 */

// Get allowed origins from environment variable or use defaults
const getAllowedOrigins = (): (string | RegExp)[] => {
  const envOrigins = process.env.CORS_ALLOWED_ORIGINS;
  
  if (envOrigins) {
    // Parse comma-separated origins from environment
    return envOrigins.split(',').map(origin => origin.trim());
  }
  
  // Default origins for production
  if (process.env.NODE_ENV === 'production') {
    const origins: (string | RegExp)[] = [
      'https://canvango.com',
      'https://www.canvango.com',
    ];
    
    // Add Vercel preview URLs
    if (process.env.VERCEL === '1') {
      // Add Vercel deployment URL
      if (process.env.VERCEL_URL) {
        origins.push(`https://${process.env.VERCEL_URL}`);
      }
      // Add Vercel project URL pattern (allow all preview deployments)
      origins.push(/^https:\/\/.*\.vercel\.app$/);
    }
    
    return origins;
  }
  
  // Allow all localhost ports in development
  return [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://localhost:5177',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5175',
    'http://127.0.0.1:5176',
    'http://127.0.0.1:5177',
  ];
};

const allowedOrigins = getAllowedOrigins();

/**
 * CORS options configuration
 */
export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) {
      console.log('✅ CORS: Allowing request with no origin');
      return callback(null, true);
    }
    
    // In development, allow all localhost/127.0.0.1 origins
    if (process.env.NODE_ENV !== 'production') {
      const localhostPattern = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/;
      if (localhostPattern.test(origin)) {
        console.log(`✅ CORS: Allowing localhost origin: ${origin}`);
        return callback(null, true);
      }
    }
    
    // Check if origin is in whitelist (string or regex)
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        const match = allowed === origin;
        if (match) console.log(`✅ CORS: Origin matched string: ${origin}`);
        return match;
      }
      if (allowed instanceof RegExp) {
        const match = allowed.test(origin);
        if (match) console.log(`✅ CORS: Origin matched regex ${allowed}: ${origin}`);
        return match;
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`⚠️  CORS BLOCKED: Origin not in whitelist: ${origin}`);
      console.warn(`   Allowed origins:`, allowedOrigins);
      // TEMPORARY: Allow all origins for debugging
      console.warn(`   🔓 TEMPORARY: Allowing anyway for debugging`);
      callback(null, true);
      // TODO: Uncomment this after fixing origin whitelist
      // callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'apikey', // Supabase API key header
    'X-CSRF-Token', // CSRF protection
    'X-Client-Info', // Supabase client info
    'Cache-Control',
    'Pragma',
  ],
  exposedHeaders: [
    'Set-Cookie',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
  ],
  preflightContinue: false, // Pass preflight response to next handler
  maxAge: 86400, // 24 hours - how long the results of a preflight request can be cached
  optionsSuccessStatus: 204, // Standard preflight response
};

/**
 * Log CORS configuration on startup
 */
export const logCorsConfig = (): void => {
  console.log('🔒 CORS Configuration:');
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Vercel: ${process.env.VERCEL === '1' ? 'Yes' : 'No'}`);
  console.log(`   Vercel URL: ${process.env.VERCEL_URL || 'N/A'}`);
  console.log(`   Allowed Origins:`);
  allowedOrigins.forEach((origin, index) => {
    if (origin instanceof RegExp) {
      console.log(`     ${index + 1}. ${origin.toString()} (regex)`);
    } else {
      console.log(`     ${index + 1}. ${origin}`);
    }
  });
};
