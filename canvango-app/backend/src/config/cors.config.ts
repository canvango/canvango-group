import { CorsOptions } from 'cors';

/**
 * CORS Configuration
 * Whitelist allowed origins based on environment
 */

// Get allowed origins from environment variable or use defaults
const getAllowedOrigins = (): string[] => {
  const envOrigins = process.env.CORS_ALLOWED_ORIGINS;
  
  if (envOrigins) {
    // Parse comma-separated origins from environment
    return envOrigins.split(',').map(origin => origin.trim());
  }
  
  // Default origins for development
  if (process.env.NODE_ENV === 'production') {
    return [
      'https://canvango.com',
      'https://www.canvango.com',
    ];
  }
  
  return [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:3000',
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
      return callback(null, true);
    }
    
    // Check if origin is in whitelist
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️  CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
  ],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400, // 24 hours - how long the results of a preflight request can be cached
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
};

/**
 * Log CORS configuration on startup
 */
export const logCorsConfig = (): void => {
  console.log('🔒 CORS Configuration:');
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Allowed Origins: ${allowedOrigins.join(', ')}`);
};
