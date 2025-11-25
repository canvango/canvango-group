/**
 * Supabase Test Client for E2E Tests
 * 
 * This client is specifically for E2E tests running in Node.js environment
 * where import.meta.env is not available.
 */

import { createClient } from '@supabase/supabase-js';

// Use process.env for Node.js environment
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://gpittnsfzgkdbqnccncn.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwaXR0bnNmemdrZGJxbmNjbmNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMDE3MzIsImV4cCI6MjA3ODY3NzczMn0.4jrpZ_7Wd_ELFjCH105iBqyFPmZmKxI06U0EyqTT5xo';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials for E2E tests');
}

export const supabaseTestClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Don't persist session in tests
    autoRefreshToken: false,
  },
});
