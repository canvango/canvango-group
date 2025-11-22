/**
 * Supabase Client Instance
 * Simple export for use in services
 */

import { createClient } from '@supabase/supabase-js';

// Fallback to hardcoded values if env variables are not loaded
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || 'https://gpittnsfzgkdbqnccncn.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwaXR0bnNmemdrZGJxbmNjbmNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMDE3MzIsImV4cCI6MjA3ODY3NzczMn0.4jrpZ_7Wd_ELFjCH105iBqyFPmZmKxI06U0EyqTT5xo';

// Debug logging
console.log('🔧 Supabase Client (src/clients) Configuration:');
console.log('  URL:', supabaseUrl);
console.log('  Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'MISSING');

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey) {
  const error = 'Missing Supabase environment variables. Please check your installation.';
  console.error('❌', error);
  throw new Error(error);
}

// Validate URL format
if (!supabaseUrl.startsWith('http')) {
  const error = `Invalid Supabase URL format: ${supabaseUrl}`;
  console.error('❌', error);
  throw new Error(error);
}

console.log('✅ Supabase client (src/clients) initialized successfully');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
