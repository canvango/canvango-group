/**
 * Production Server - Serves both Frontend and Backend
 * 
 * This server combines the Express backend API with the built frontend
 * static files, serving everything from a single port.
 * 
 * Compatible with both:
 * - Traditional Node.js server (npm start)
 * - Vercel Serverless Functions
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './server/.env' });
dotenv.config(); // Also load from root .env

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Check if running on Vercel
const isVercel = process.env.VERCEL === '1';

// Setup app
async function setupApp() {
  try {
    // Import backend app (API routes)
    const backendModule = await import('./server/dist/index.js');
    const backendApp = backendModule.default;
    
    // 1. Mount backend API routes
    app.use('/api', backendApp);
    
    // 2. Serve static frontend files
    const frontendPath = path.join(__dirname, 'dist');
    app.use(express.static(frontendPath));
    
    // 3. SPA fallback - serve index.html for all non-API routes
    app.use((req, res, next) => {
      // Don't serve index.html for API routes
      if (req.path.startsWith('/api')) {
        return res.status(404).json({ 
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'API endpoint not found'
          }
        });
      }
      
      // Serve index.html for all other routes (React Router)
      res.sendFile(path.join(frontendPath, 'index.html'));
    });
    
    return app;
  } catch (error) {
    console.error('❌ Failed to setup server:', error);
    throw error;
  }
}

// For Vercel: Export the app as serverless function
if (isVercel) {
  // Vercel serverless function handler
  let appPromise = null;
  
  export default async function handler(req, res) {
    try {
      // Initialize app once and reuse
      if (!appPromise) {
        appPromise = setupApp();
      }
      
      const app = await appPromise;
      return app(req, res);
    } catch (error) {
      console.error('Serverless function error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Server initialization failed',
          details: error.message
        }
      });
    }
  }
} else {
  // For traditional Node.js server
  setupApp()
    .then((app) => {
      app.listen(PORT, () => {
        console.log('');
        console.log('🚀 ========================================');
        console.log('🚀  Canvango Server Started Successfully');
        console.log('🚀 ========================================');
        console.log('');
        console.log(`📍 Server URL: http://localhost:${PORT}`);
        console.log(`📍 API Base:   http://localhost:${PORT}/api`);
        console.log(`📍 Frontend:   http://localhost:${PORT}`);
        console.log('');
        console.log(`📝 Environment: ${process.env.NODE_ENV || 'production'}`);
        console.log('');
        console.log('✅ Backend API: Ready');
        console.log('✅ Frontend:    Ready');
        console.log('');
        console.log('Press Ctrl+C to stop the server');
        console.log('');
      });
    })
    .catch((error) => {
      console.error('❌ Failed to start server:', error);
      console.error('');
      console.error('Make sure you have built the server first:');
      console.error('  npm run build:server');
      console.error('');
      process.exit(1);
    });
}
