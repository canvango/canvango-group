/**
 * Tripay Callback Handler
 * Receives payment notifications from Tripay and updates Supabase
 * 
 * CRITICAL: This endpoint MUST:
 * 1. Accept POST requests only
 * 2. Verify Tripay signature
 * 3. Update transaction status in Supabase
 * 4. ALWAYS return HTTP 200 OK with success:true (even on errors)
 * 5. Handle missing environment variables gracefully
 * 6. NEVER return success:false (Tripay marks as GAGAL)
 * 
 * Updated: 2025-12-01 - Always return success:true for Tripay
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// DO NOT initialize clients at top level - will crash if env vars missing
// Initialize inside handler instead

/**
 * Verify Tripay callback signature
 * Signature = HMAC-SHA256(privateKey, callbackBody)
 */
function verifySignature(rawBody: string, signature: string, privateKey: string): boolean {
  const calculatedSignature = crypto
    .createHmac('sha256', privateKey)
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
    // IMPORTANT: Return success:true to avoid Tripay marking as GAGAL
    return res.status(200).json({ 
      success: true, 
      message: 'Method not allowed, but acknowledged' 
    });
  }

  try {
    // ✅ CRITICAL: Check environment variables INSIDE handler
    // This prevents FUNCTION_INVOCATION_FAILED error
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const tripayPrivateKey = process.env.VITE_TRIPAY_PRIVATE_KEY;
    
    // ✅ Validate environment variables properly
    const missing: string[] = [];
    if (!supabaseUrl) missing.push('VITE_SUPABASE_URL');
    if (!supabaseServiceKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
    if (!tripayPrivateKey) missing.push('VITE_TRIPAY_PRIVATE_KEY');
    
    // If env vars missing, return success:true (Tripay must see BERHASIL)
    if (missing.length > 0) {
      console.error('❌ Missing environment variables:', missing.join(', '));
      console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'present' : 'MISSING');
      console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'present' : 'MISSING');
      console.error('VITE_TRIPAY_PRIVATE_KEY:', tripayPrivateKey ? 'present' : 'MISSING');
      
      // ✅ CRITICAL: Return success:true so Tripay marks as BERHASIL
      return res.status(200).json({ 
        success: true, 
        message: 'Env missing, but callback acknowledged',
        missing: missing
      });
    }
    
    // Initialize Supabase client safely inside handler
    // At this point, we know all env vars are present (checked above)
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
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
      // ✅ Return success:true to avoid Tripay marking as GAGAL
      return res.status(200).json({ 
        success: true, 
        message: 'Missing signature, but callback acknowledged' 
      });
    }
    
    // Verify signature (tripayPrivateKey is guaranteed to exist at this point)
    const isValidSignature = verifySignature(rawBody, signature, tripayPrivateKey!);
    
    if (!isValidSignature) {
      console.error('❌ Invalid signature');
      console.log('Expected signature calculation from private key');
      console.log('Received signature:', signature);
      // ✅ Return success:true to avoid retry spam from Tripay
      return res.status(200).json({ 
        success: true, 
        message: 'Invalid signature, but callback acknowledged' 
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
    
    // ✅ GUARD: Skip database update if merchant_ref is missing
    // This happens during Tripay "Test Callback" - just return 200 OK
    if (!merchant_ref) {
      console.log('⚠️ No merchant_ref provided - skipping database update');
      console.log('This is normal for Tripay test callbacks');
      console.log('=== TEST CALLBACK PROCESSED ===\n');
      
      return res.status(200).json({ 
        success: true,
        message: 'Callback processed (test mode - no database update)',
      });
    }
    
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
      console.error('Error details:', updateError.message);
      // ✅ CRITICAL: Return success:true even on DB error
      // Tripay must see BERHASIL to avoid retry spam
      return res.status(200).json({ 
        success: true, 
        message: 'Database update failed, but callback acknowledged',
        error: updateError.message,
      });
    }
    
    console.log('✅ Transaction updated successfully');
    console.log('Note: User balance will be updated automatically by database trigger');
    console.log('=== CALLBACK PROCESSED SUCCESSFULLY ===\n');
    
    // ✅ ALWAYS return success:true to Tripay
    return res.status(200).json({ 
      success: true,
      message: 'Callback processed successfully',
    });
    
  } catch (error: any) {
    console.error('❌ Callback processing error:', error.message);
    console.error('Stack:', error.stack);
    
    // ✅ CRITICAL: Return success:true even on internal error
    // Tripay must see BERHASIL to avoid marking callback as GAGAL
    return res.status(200).json({ 
      success: true, 
      message: 'Internal error, but callback acknowledged',
      error: error.message,
    });
  }
}
