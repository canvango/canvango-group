/**
 * Tripay Callback Proxy
 * Forwards Tripay callbacks to Supabase Edge Function
 * This allows using custom domain (canvango.com) for callback URL
 * 
 * IMPORTANT: Must preserve raw body for signature verification!
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Disable body parsing to get raw body
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Callback-Signature');
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Get raw body as string (IMPORTANT for signature verification!)
    let rawBody = '';
    
    // Read body from stream
    await new Promise<void>((resolve, reject) => {
      req.on('data', (chunk) => {
        rawBody += chunk.toString('utf8');
      });
      req.on('end', () => resolve());
      req.on('error', (err) => reject(err));
    });
    
    console.log('=== CALLBACK REQUEST ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Signature:', req.headers['x-callback-signature']);
    console.log('Body length:', rawBody.length);
    console.log('Raw body:', rawBody);
    console.log('========================');
    
    // Get callback signature from header
    const signature = req.headers['x-callback-signature'];
    
    if (!signature) {
      console.error('❌ Missing X-Callback-Signature header');
      return res.status(401).json({ 
        success: false, 
        message: 'Missing signature' 
      });
    }
    
    // Forward to GCP VM (which has whitelisted IP)
    // GCP VM will then forward to Supabase Edge Function
    const gcpProxyUrl = 'http://34.182.126.200:3000/tripay-callback';
    
    console.log('📤 Forwarding to GCP VM...');
    
    const response = await fetch(gcpProxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Callback-Signature': signature as string,
      },
      body: rawBody, // Send raw body string, not re-stringified JSON!
    });

    const data = await response.json();
    
    console.log('📥 Edge Function response:', response.status, data);
    
    // Return response from Edge Function
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('❌ Proxy error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}
