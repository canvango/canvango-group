/**
 * Cloudflare Worker - Tripay API Proxy
 * Handles CORS and securely proxies requests to Tripay API
 */

interface Env {
  TRIPAY_API_KEY: string;
  TRIPAY_PRIVATE_KEY: string;
  TRIPAY_MERCHANT_CODE: string;
  ALLOWED_ORIGINS: string;
}

const TRIPAY_BASE_URL = 'https://tripay.co.id/api';
const TRIPAY_SANDBOX_URL = 'https://tripay.co.id/api-sandbox';

// CORS headers
const corsHeaders = (origin: string) => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
});

// Verify origin is allowed
function isOriginAllowed(origin: string | null, allowedOrigins: string): boolean {
  if (!origin) return false;
  const allowed = allowedOrigins.split(',').map(o => o.trim());
  return allowed.includes(origin) || allowed.includes('*');
}

// Generate Tripay signature
function generateSignature(merchantCode: string, merchantRef: string, amount: number, privateKey: string): string {
  const data = `${merchantCode}${merchantRef}${amount}`;
  return createHmacSHA256(data, privateKey);
}

// Simple HMAC-SHA256 implementation for Cloudflare Workers
async function createHmacSHA256(data: string, key: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const dataBuffer = encoder.encode(data);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, dataBuffer);
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin');
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      if (!origin || !isOriginAllowed(origin, env.ALLOWED_ORIGINS)) {
        return new Response('Forbidden', { status: 403 });
      }
      return new Response(null, { headers: corsHeaders(origin) });
    }

    // Verify origin
    if (!origin || !isOriginAllowed(origin, env.ALLOWED_ORIGINS)) {
      return new Response(JSON.stringify({ error: 'Origin not allowed' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Route: GET /payment-channels
      if (path === '/payment-channels' && request.method === 'GET') {
        const isSandbox = url.searchParams.get('sandbox') === 'true';
        const baseUrl = isSandbox ? TRIPAY_SANDBOX_URL : TRIPAY_BASE_URL;
        
        const response = await fetch(`${baseUrl}/merchant/payment-channel`, {
          headers: {
            'Authorization': `Bearer ${env.TRIPAY_API_KEY}`,
            'Content-Type': 'application/json',
          }
        });

        const data = await response.json();
        
        return new Response(JSON.stringify(data), {
          status: response.status,
          headers: {
            ...corsHeaders(origin),
            'Content-Type': 'application/json',
          }
        });
      }

      // Route: POST /create-transaction
      if (path === '/create-transaction' && request.method === 'POST') {
        const body = await request.json() as any;
        const isSandbox = body.sandbox === true;
        const baseUrl = isSandbox ? TRIPAY_SANDBOX_URL : TRIPAY_BASE_URL;

        // Generate signature
        const signature = await createHmacSHA256(
          `${env.TRIPAY_MERCHANT_CODE}${body.merchant_ref}${body.amount}`,
          env.TRIPAY_PRIVATE_KEY
        );

        // Prepare request payload
        const payload = {
          method: body.method,
          merchant_ref: body.merchant_ref,
          amount: body.amount,
          customer_name: body.customer_name,
          customer_email: body.customer_email,
          customer_phone: body.customer_phone,
          order_items: body.order_items,
          return_url: body.return_url,
          expired_time: body.expired_time || Math.floor(Date.now() / 1000) + (24 * 60 * 60),
          signature: signature,
        };

        const response = await fetch(`${baseUrl}/transaction/create`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.TRIPAY_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();
        
        return new Response(JSON.stringify(data), {
          status: response.status,
          headers: {
            ...corsHeaders(origin),
            'Content-Type': 'application/json',
          }
        });
      }

      // Route: GET /transaction/:reference
      if (path.startsWith('/transaction/') && request.method === 'GET') {
        const reference = path.split('/')[2];
        const isSandbox = url.searchParams.get('sandbox') === 'true';
        const baseUrl = isSandbox ? TRIPAY_SANDBOX_URL : TRIPAY_BASE_URL;

        const response = await fetch(`${baseUrl}/transaction/detail?reference=${reference}`, {
          headers: {
            'Authorization': `Bearer ${env.TRIPAY_API_KEY}`,
            'Content-Type': 'application/json',
          }
        });

        const data = await response.json();
        
        return new Response(JSON.stringify(data), {
          status: response.status,
          headers: {
            ...corsHeaders(origin),
            'Content-Type': 'application/json',
          }
        });
      }

      // Route not found
      return new Response(JSON.stringify({ error: 'Route not found' }), {
        status: 404,
        headers: {
          ...corsHeaders(origin),
          'Content-Type': 'application/json',
        }
      });

    } catch (error: any) {
      return new Response(JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }), {
        status: 500,
        headers: {
          ...corsHeaders(origin),
          'Content-Type': 'application/json',
        }
      });
    }
  }
};
