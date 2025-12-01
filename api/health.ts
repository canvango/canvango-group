import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Health check endpoint to verify environment variables
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const config = {
    gcpProxyUrl: process.env.GCP_PROXY_URL || 'NOT SET (using fallback)',
    hasGcpProxyUrl: !!process.env.GCP_PROXY_URL,
    supabaseUrl: process.env.VITE_SUPABASE_URL ? 'SET' : 'NOT SET',
    supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
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
