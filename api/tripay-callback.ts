/**
 * Tripay Callback Handler
 * Receives payment notifications from Tripay and updates Supabase
 * 
 * CRITICAL: This endpoint MUST:
 * 1. Accept POST requests only
 * 2. Verify Tripay signature
 * 3. Update transaction status in Supabase
 * 4. ALWAYS return HTTP 200 OK (even on errors)
 * 
 * Updated: 2025-12-01 - Fixed 307 redirect issue
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Initialize Supabase client with service role key for admin access
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const tripayPrivateKey = process.env.VITE_TRIPAY_PRIVATE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Verify Tripay callback signature
 * Signature = HMAC-SHA256(privateKey, callbackBody)
 */
function verifySignature(rawBody: string, signature: string): boolean {
  const calculatedSignature = crypto
    .createHmac('sha256', tripayPrivateKey)
    .update(rawBody)
    .digest('hex');
  
  return calculatedSignature === signature;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Set headers immediately to prevent redirects
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Callback-Signature, X-Callback-Event');
  
  // Log incoming request (safe info only)
  console.log('=== TRIPAY CALLBACK RECEIVED ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Time:', new Date().toISOString());
  console.log('IP:', req.headers['x-forwarded-for'] || req.socket.remoteAddress);
  console.log('Headers:', JSON.stringify({
    'content-type': req.headers['content-type'],
    'x-callback-signature': req.headers['x-callback-signature'] ? 'present' : 'missing',
    'x-callback-event': req.headers['x-callback-event'],
  }));
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method);
    // IMPORTANT: Still return 200 to avoid Tripay marking as failed
    return res.status(200).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    // Get raw body - Vercel automatically parses body, but we need raw for signature
    let rawBody: string;
    let callbackData: any;
    
    // Check if body is already parsed
    if (typeof req.body === 'string') {
      rawBody = req.body;
      callbackData = JSON.parse(rawBody);
    } else if (req.body && typeof req.body === 'object') {
      // Body already parsed by Vercel
      callbackData = req.body;
      rawBody = JSON.stringify(req.body);
    } else {
      // Read from stream as fallback
      rawBody = '';
      await new Promise<void>((resolve, reject) => {
        req.on('data', (chunk) => {
          rawBody += chunk.toString('utf8');
        });
        req.on('end', () => resolve());
        req.on('error', (err) => reject(err));
      });
      callbackData = JSON.parse(rawBody);
    }
    
    console.log('Body length:', rawBody.length);
    console.log('Merchant Ref:', callbackData.merchant_ref);
    console.log('Status:', callbackData.status);
    console.log('Payment Method:', callbackData.payment_method);
    
    // Get signature from header
    const signature = req.headers['x-callback-signature'] as string;
    
    if (!signature) {
      console.error('❌ Missing X-Callback-Signature header');
      // Still return 200 to avoid retry spam
      return res.status(200).json({ 
        success: false, 
        message: 'Missing signature' 
      });
    }
    
    // Verify signature
    const isValidSignature = verifySignature(rawBody, signature);
    
    if (!isValidSignature) {
      console.error('❌ Invalid signature');
      console.log('Expected signature calculation from private key');
      // Still return 200 to avoid retry spam
      return res.status(200).json({ 
        success: false, 
        message: 'Invalid signature' 
      });
    }
    
    console.log('✅ Signature verified');
    
    // Extract callback data
    const {
      reference,
      merchant_ref,
      payment_method,
      payment_method_code,
      total_amount,
      fee_merchant,
      fee_customer,
      total_fee,
      amount_received,
      status,
      paid_at,
    } = callbackData;
    
    // Map Tripay status to our status
    let transactionStatus: string;
    switch (status) {
      case 'PAID':
        transactionStatus = 'completed';
        break;
      case 'EXPIRED':
        transactionStatus = 'expired';
        break;
      case 'FAILED':
        transactionStatus = 'failed';
        break;
      case 'REFUND':
        transactionStatus = 'refunded';
        break;
      default:
        transactionStatus = 'pending';
    }
    
    console.log('Updating transaction:', merchant_ref, '→', transactionStatus);
    
    // Update transaction in Supabase
    const { error: updateError } = await supabase
      .from('transactions')
      .update({
        status: transactionStatus,
        payment_reference: reference,
        payment_method: payment_method,
        payment_method_code: payment_method_code,
        total_amount: total_amount,
        fee_merchant: fee_merchant,
        fee_customer: fee_customer,
        total_fee: total_fee,
        amount_received: amount_received,
        paid_at: paid_at ? new Date(paid_at * 1000).toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('merchant_ref', merchant_ref);
    
    if (updateError) {
      console.error('❌ Supabase update error:', updateError);
      // Still return 200 to avoid retry spam
      return res.status(200).json({ 
        success: false, 
        message: 'Database update failed',
        error: updateError.message,
      });
    }
    
    console.log('✅ Transaction updated successfully');
    console.log('Note: User balance will be updated automatically by database trigger');
    console.log('=== CALLBACK PROCESSED SUCCESSFULLY ===\n');
    
    // ALWAYS return 200 OK to Tripay
    return res.status(200).json({ 
      success: true,
      message: 'Callback processed successfully',
    });
    
  } catch (error: any) {
    console.error('❌ Callback processing error:', error.message);
    console.error('Stack:', error.stack);
    
    // STILL return 200 to avoid Tripay retry spam
    return res.status(200).json({ 
      success: false, 
      message: 'Internal error',
      error: error.message,
    });
  }
}
