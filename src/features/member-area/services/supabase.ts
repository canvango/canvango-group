import { createClient } from '@supabase/supabase-js';

// Fallback to hardcoded values if env variables are not loaded
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gpittnsfzgkdbqnccncn.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwaXR0bnNmemdrZGJxbmNjbmNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMDE3MzIsImV4cCI6MjA3ODY3NzczMn0.4jrpZ_7Wd_ELFjCH105iBqyFPmZmKxI06U0EyqTT5xo';

// Validate configuration in development only
if (import.meta.env.DEV && (!supabaseUrl || !supabaseAnonKey)) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
