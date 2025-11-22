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
    console.log('🔧 Setting up server...');
    console.log('📂 Current directory:', process.cwd());
    console.log('📂 __dirname:', __dirname);
    
    // Import backend app (API routes)
    const backendPath = './server/dist/index.js';
    console.log('📦 Importing backend from:', backendPath);
    
    const backendModule = await import(backendPath);
    const backendApp = backendModule.default;
    
    console.log('✅ Backend module loaded successfully');
    
    // 1. Mount backend API routes
    app.use('/api', backendApp);
    console.log('✅ API routes mounted at /api');
    
    // 2. Serve static frontend files
    const frontendPath = path.join(__dirname, 'dist');
    console.log('📂 Frontend path:', frontendPath);
    app.use(express.static(frontendPath));
    console.log('✅ Static files configured');
    
    // 3. SPA fallback - serve index.html for all non-API routes
    app.use((req, res) => {
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
    
    console.log('✅ SPA fallback configured');
    console.log('🎉 Server setup complete');
    
    return app;
  } catch (error) {
    console.error('');
    console.error('❌ ========================================');
    console.error('❌  Server Setup Failed');
    console.error('❌ ========================================');
    console.error('');
    console.error('Error Type:', error.name);
    console.error('Error Message:', error.message);
    console.error('');
    
    // Enhanced error details for module resolution
    if (error.code === 'ERR_MODULE_NOT_FOUND' || error.message.includes('Cannot find module')) {
      console.error('📦 Module Resolution Failure:');
      console.error('');
      
      const moduleMatch = error.message.match(/Cannot find module '([^']+)'/);
      if (moduleMatch) {
        console.error('Missing Module:', moduleMatch[1]);
        console.error('');
      }
      
      console.error('Search Context:');
      console.error('  Working Directory:', process.cwd());
      console.error('  Script Location:', __dirname);
      console.error('  Backend Path:', path.join(__dirname, 'server/dist/index.js'));
      console.error('');
      
      console.error('💡 Common Causes:');
      console.error('  1. Backend not built - run: npm run build:server');
      console.error('  2. Missing .js extensions in import statements');
      console.error('  3. Case sensitivity mismatch (Linux vs Windows)');
      console.error('  4. Missing dependencies in node_modules');
      console.error('');
    }
    
    console.error('Stack Trace:');
    console.error(error.stack);
    console.error('');
    console.error('❌ ========================================');
    console.error('');
    
    throw error;
  }
}

// Vercel serverless function handler
let appPromise = null;

async function handler(req, res) {
  try {
    // Initialize app once and reuse
    if (!appPromise) {
      appPromise = setupApp();
    }
    
    const app = await appPromise;
    return app(req, res);
  } catch (error) {
    // Enhanced error logging for debugging module resolution failures
    console.error('');
    console.error('❌ ========================================');
    console.error('❌  Serverless Function Error');
    console.error('❌ ========================================');
    console.error('');
    console.error('Error Type:', error.name);
    console.error('Error Message:', error.message);
    console.error('');
    
    // Log module resolution details if it's a module error
    if (error.code === 'ERR_MODULE_NOT_FOUND' || error.message.includes('Cannot find module')) {
      console.error('📦 Module Resolution Details:');
      console.error('');
      console.error('Module Search Paths:');
      if (typeof module !== 'undefined' && module.paths) {
        module.paths.forEach((p, i) => {
          console.error(`  ${i + 1}. ${p}`);
        });
      } else {
        console.error('  (Module paths not available in ES module context)');
      }
      console.error('');
      console.error('Current Working Directory:', process.cwd());
      console.error('__dirname:', __dirname);
      console.error('__filename:', __filename);
      console.error('');
      
      // Try to extract the missing module name
      const moduleMatch = error.message.match(/Cannot find module '([^']+)'/);
      if (moduleMatch) {
        console.error('Missing Module:', moduleMatch[1]);
        console.error('');
        console.error('💡 Troubleshooting Tips:');
        console.error('  1. Check if the module file exists in the build output');
        console.error('  2. Verify import statements have .js extensions for ES modules');
        console.error('  3. Ensure file names match exactly (case-sensitive on Linux)');
        console.error('  4. Check that all dependencies are in package.json');
        console.error('');
      }
    }
    
    // Log full stack trace for debugging
    console.error('Stack Trace:');
    console.error(error.stack);
    console.error('');
    console.error('Environment Info:');
    console.error('  Node Version:', process.version);
    console.error('  Platform:', process.platform);
    console.error('  Architecture:', process.arch);
    console.error('  NODE_ENV:', process.env.NODE_ENV || 'not set');
    console.error('  VERCEL:', process.env.VERCEL || 'not set');
    console.error('');
    console.error('❌ ========================================');
    console.error('');
    
    return res.status(500).json({
      success: false,
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message: 'Server initialization failed',
        details: error.message,
        ...(process.env.NODE_ENV === 'development' && {
          stack: error.stack,
          type: error.name,
          cwd: process.cwd()
        })
      }
    });
  }
}

// For traditional Node.js server (when not on Vercel)
if (!isVercel) {
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
      console.error('');
      console.error('❌ ========================================');
      console.error('❌  Server Startup Failed');
      console.error('❌ ========================================');
      console.error('');
      console.error('Error Type:', error.name);
      console.error('Error Message:', error.message);
      console.error('');
      
      if (error.code === 'ERR_MODULE_NOT_FOUND' || error.message.includes('Cannot find module')) {
        console.error('📦 Module Not Found:');
        console.error('');
        
        const moduleMatch = error.message.match(/Cannot find module '([^']+)'/);
        if (moduleMatch) {
          console.error('Missing:', moduleMatch[1]);
          console.error('');
        }
        
        console.error('🔧 Quick Fix:');
        console.error('  1. Build the server:');
        console.error('     npm run build:server');
        console.error('');
        console.error('  2. Build everything:');
        console.error('     npm run build');
        console.error('');
        console.error('  3. Check for missing dependencies:');
        console.error('     npm install');
        console.error('');
      } else {
        console.error('Stack Trace:');
        console.error(error.stack);
        console.error('');
      }
      
      console.error('❌ ========================================');
      console.error('');
      process.exit(1);
    });
}

// Export for Vercel and other serverless platforms
export default handler;
