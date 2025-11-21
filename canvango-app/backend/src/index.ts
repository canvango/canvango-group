import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import transactionRoutes from './routes/transaction.routes.js';
import topupRoutes from './routes/topup.routes.js';
import claimRoutes from './routes/claim.routes.js';
import tutorialRoutes from './routes/tutorial.routes.js';
import adminUserRoutes from './routes/admin.user.routes.js';
import adminTransactionRoutes from './routes/admin.transaction.routes.js';
import adminClaimRoutes from './routes/admin.claim.routes.js';
import adminTutorialRoutes from './routes/admin.tutorial.routes.js';
import adminProductRoutes from './routes/admin.product.routes.js';
import adminAuditLogRoutes from './routes/admin.auditLog.routes.js';
import adminStatsRoutes from './routes/admin.stats.routes.js';
import adminSettingsRoutes from './routes/admin.settings.routes.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import { corsOptions, logCorsConfig } from './config/cors.config.js';
import { sanitizeInput, preventSQLInjection } from './middleware/sanitize.middleware.js';
import { httpsSecurityMiddleware } from './middleware/https.middleware.js';

dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\nPlease check your .env file and ensure all required variables are set.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// HTTPS Enforcement (must be first)
app.use(httpsSecurityMiddleware);

// Security Middleware
app.use(helmet()); // Set security HTTP headers

// CORS - Only needed in development when frontend and backend are separate
// In production (single port), CORS is not needed
if (process.env.NODE_ENV === 'development') {
  app.use(cors(corsOptions));
  console.log('🔓 CORS enabled for development');
} else {
  console.log('🔒 CORS disabled (same origin in production)');
}

app.use(express.json({ limit: '10mb' })); // Limit body size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Sanitization Middleware
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(sanitizeInput); // Sanitize input to prevent XSS
app.use(preventSQLInjection); // Prevent SQL injection

// Request logging middleware
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Canvango API is running' });
});

// Routes
// In development: use /api prefix (standalone backend)
// In production: no prefix (handled by server.js mounting)
const apiPrefix = process.env.NODE_ENV === 'production' ? '' : '/api';

app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/users`, userRoutes);
app.use(`${apiPrefix}/transactions`, transactionRoutes);
app.use(`${apiPrefix}/topup`, topupRoutes);
app.use(`${apiPrefix}/claims`, claimRoutes);
app.use(`${apiPrefix}/tutorials`, tutorialRoutes);
app.use(`${apiPrefix}/admin/users`, adminUserRoutes);
app.use(`${apiPrefix}/admin/transactions`, adminTransactionRoutes);
app.use(`${apiPrefix}/admin/claims`, adminClaimRoutes);
app.use(`${apiPrefix}/admin/tutorials`, adminTutorialRoutes);
app.use(`${apiPrefix}/admin/products`, adminProductRoutes);
app.use(`${apiPrefix}/admin/audit-logs`, adminAuditLogRoutes);
app.use(`${apiPrefix}/admin/stats`, adminStatsRoutes);
app.use(`${apiPrefix}/admin/settings`, adminSettingsRoutes);

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Global error handling middleware - must be last
app.use(errorHandler);

// Only start server if running directly (not imported)
// In production, this will be imported by server.js
if (process.env.NODE_ENV !== 'production' || process.argv[1] === fileURLToPath(import.meta.url)) {
  app.listen(PORT, () => {
    console.log(`🚀 Backend API Server is running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    logCorsConfig();
  });
}

export default app;
