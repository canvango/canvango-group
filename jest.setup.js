require('@testing-library/jest-dom');

// Polyfill for TextEncoder/TextDecoder
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock import.meta for Vite environment variables
global.import = {
  meta: {
    env: {
      VITE_ROLE_POLLING_INTERVAL: '5000',
      VITE_ROLE_POLLING_ENABLED: 'true',
      VITE_USE_REALTIME_ROLE_UPDATES: 'false',
      VITE_SUPABASE_URL: 'https://test.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'test-key',
    },
  },
};
