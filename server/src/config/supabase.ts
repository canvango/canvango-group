import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types.js';
import dotenv from 'dotenv';

dotenv.config();

// Singleton Supabase client instance
let supabaseClient: SupabaseClient<Database> | null = null;

/**
 * Initialize and return Supabase client
 * Uses service role key for server-side operations
 * This bypasses Row Level Security (RLS) for admin operations
 */
export function getSupabaseClient(): SupabaseClient<Database> {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL environment variable is required');
  }

  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  }

  supabaseClient = createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log('✅ Supabase client initialized successfully');

  return supabaseClient;
}

/**
 * Reset the Supabase client instance (useful for testing)
 */
export function resetSupabaseClient(): void {
  supabaseClient = null;
}

export default getSupabaseClient;
