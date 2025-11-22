import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Bundle analyzer - generates stats.html after build
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/features': path.resolve(__dirname, './src/features'),
      '@/shared': path.resolve(__dirname, './src/shared'),
      '@/member-area': path.resolve(__dirname, './src/features/member-area'),
    },
  },
  server: {
    host: true, // Listen on all network interfaces (0.0.0.0)
    port: 5173,
    open: true,
    strictPort: false,
    // Proxy only in development
    // In production, frontend and backend are served from same port
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Optimize bundle size
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Keep console.log for debugging
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            if (id.includes('@supabase')) {
              return 'supabase-vendor';
            }
            if (id.includes('@heroicons') || id.includes('react-hot-toast')) {
              return 'ui-vendor';
            }
            if (id.includes('axios')) {
              return 'axios-vendor';
            }
            // Other node_modules
            return 'vendor';
          }
          // Admin pages chunk
          if (id.includes('/pages/admin/')) {
            return 'admin';
          }
          // Services chunk
          if (id.includes('/services/')) {
            return 'services';
          }
        },
      },
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 500,
  },
  // Vite automatically exposes env variables that start with VITE_
  // from .env files, no need to manually define them
});
