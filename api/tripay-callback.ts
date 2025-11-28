/**
 * Tripay Callback Proxy
 * Forwards Tripay callbacks to Supabase Edge Function
 * This allows using custom domain (canvango.com) for callback URL
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get callback signature from header
    const signature = req.headers['x-callback-signature'];
    
    // Forward to Supabase Edge Function
    const supabaseUrl = 'https://gpittnsfzgkdbqnccncn.supabase.co/functions/v1/tripay-callback';
    
    const response = await fetch(supabaseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Callback-Signature': signature as string,
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    
    // Return response from Edge Function
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}
