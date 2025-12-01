import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Health check endpoint to verify environment variables
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const config = {
    gcpProxyUrl: process.env.GCP_PROXY_URL || 'NOT SET (using fallback)',
    hasGcpProxyUrl: !!process.env.GCP_PROXY_URL,
    supabaseUrl: process.env.SUPABASE_URL ? 'SET (SUPABASE_URL)' : process.env.VITE_SUPABASE_URL ? 'SET (VITE_SUPABASE_URL)' : 'NOT SET',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY ? 'SET (SUPABASE_ANON_KEY)' : process.env.VITE_SUPABASE_ANON_KEY ? 'SET (VITE_SUPABASE_ANON_KEY)' : 'NOT SET',
    turnstileSecretKey: process.env.TURNSTILE_SECRET_KEY ? 'SET' : 'NOT SET',
    nodeEnv: process.env.NODE_ENV || 'NOT SET',
    vercelEnv: process.env.VERCEL_ENV || 'NOT SET',
  };

  return res.status(200).json({
    status: 'ok',
    message: 'API Health Check',
    timestamp: new Date().toISOString(),
    config,
  });
}
