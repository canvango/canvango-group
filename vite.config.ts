import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Use automatic JSX runtime
      jsxRuntime: 'automatic',
      // Babel plugins for better compatibility
      babel: {
        plugins: [],
      },
    }),
    // Bundle analyzer - generates stats.html after build
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  // Ensure proper module resolution
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/features': path.resolve(__dirname, './src/features'),
      '@/shared': path.resolve(__dirname, './src/shared'),
      '@/member-area': path.resolve(__dirname, './src/features/member-area'),
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      '@tanstack/react-query',
      'lucide-react',
      'react-hot-toast',
      'sonner',
    ],
    exclude: [],
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
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Optimize dependencies
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        // Simplified chunk splitting to avoid circular dependencies
        manualChunks: {
          // Keep all React-related libraries together
          'react-vendor': [
            'react',
            'react-dom',
            'react-router-dom',
            'react/jsx-runtime',
          ],
          // Supabase
          'supabase-vendor': ['@supabase/supabase-js'],
          // UI libraries
          'ui-vendor': ['lucide-react', 'react-hot-toast', 'sonner'],
        },
        // Ensure proper module format
        format: 'es',
        // Add entry file names for better debugging
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
  // Vite automatically exposes env variables that start with VITE_
  // from .env files, no need to manually define them
});
