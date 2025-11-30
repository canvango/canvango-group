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
    
    console.log('📥 Proxy received callback');
    console.log('  Signature:', req.headers['x-callback-signature']);
    console.log('  Body length:', rawBody.length);
    console.log('  Raw body:', rawBody);
    
    // Get callback signature from header
    const signature = req.headers['x-callback-signature'];
    
    if (!signature) {
      console.error('❌ Missing X-Callback-Signature header');
      return res.status(401).json({ 
        success: false, 
        message: 'Missing signature' 
      });
    }
    
    // Forward to Supabase Edge Function with RAW body
    const supabaseUrl = 'https://gpittnsfzgkdbqnccncn.supabase.co/functions/v1/tripay-callback';
    
    console.log('📤 Forwarding to Edge Function...');
    
    const response = await fetch(supabaseUrl, {
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
