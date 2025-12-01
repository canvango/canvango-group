/**
 * Tripay Callback Handler - Official Implementation
 * Based on: https://tripay.co.id/developer?tab=callback
 * 
 * CRITICAL REQUIREMENTS:
 * 1. Read raw body for signature verification
 * 2. Verify HMAC-SHA256 signature
 * 3. Validate X-Callback-Event = "payment_status"
 * 4. Update transaction status in Supabase
 * 5. Update user balance on PAID status
 * 6. ALWAYS return HTTP 200 with {"success": true/false}
 * 
 * @author Canvango Development Team
 * @date 2025-12-01
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

/**
 * Verify Tripay callback signature
 * Signature = HMAC-SHA256(privateKey, rawJsonBody)
 */
function verifyTripaySignature(
  rawBody: string,
  receivedSignature: string,
  privateKey: string
): boolean {
  const calculatedSignature = crypto
    .createHmac('sha256', privateKey)
    .update(rawBody)
    .digest('hex');
  
  return calculatedSignature === receivedSignature;
}

/**
 * Main callback handler
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Callback-Signature, X-Callback-Event');
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('[Tripay Callback] Method not allowed:', req.method);
    return res.status(200).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  console.log('=== TRIPAY CALLBACK RECEIVED ===');
  console.log('Time:', new Date().toISOString());
  console.log('IP:', req.headers['x-forwarded-for'] || req.socket.remoteAddress);

  try {
    // ✅ Step 1: Get environment variables
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const tripayPrivateKey = process.env.TRIPAY_PRIVATE_KEY;

    // Validate environment variables
    if (!supabaseUrl || !supabaseServiceKey || !tripayPrivateKey) {
      console.error('[Tripay Callback] Missing environment variables');
      console.error('SUPABASE_URL:', supabaseUrl ? 'present' : 'MISSING');
      console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'present' : 'MISSING');
      console.error('TRIPAY_PRIVATE_KEY:', tripayPrivateKey ? 'present' : 'MISSING');
      
      return res.status(200).json({
        success: false,
        message: 'Configuration error - environment variables missing'
      });
    }

    // Initialize Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ✅ Step 2: Read raw body for signature verification
    let rawBody: string;
    let callbackData: any;

    if (typeof req.body === 'string') {
      // Body is already a string
      rawBody = req.body;
      callbackData = JSON.parse(rawBody);
    } else if (req.body && typeof req.body === 'object') {
      // Body already parsed by Vercel
      callbackData = req.body;
      rawBody = JSON.stringify(req.body);
    } else {
      // Read from stream
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

    console.log('[Tripay Callback] Merchant Ref:', callbackData.merchant_ref);
    console.log('[Tripay Callback] Reference:', callbackData.reference);
    console.log('[Tripay Callback] Status:', callbackData.status);
    console.log('[Tripay Callback] Payment Method:', callbackData.payment_method);

    // ✅ Step 3: Get and verify headers
    const callbackSignature = req.headers['x-callback-signature'] as string;
    const callbackEvent = req.headers['x-callback-event'] as string;

    if (!callbackSignature) {
      console.error('[Tripay Callback] Missing X-Callback-Signature header');
      return res.status(200).json({
        success: false,
        message: 'Missing signature'
      });
    }

    // ✅ Step 4: Validate callback event
    if (callbackEvent !== 'payment_status') {
      console.error('[Tripay Callback] Unrecognized callback event:', callbackEvent);
      return res.status(200).json({
        success: false,
        message: `Unrecognized callback event: ${callbackEvent || 'none'}`
      });
    }

    // ✅ Step 5: Verify signature
    const isValidSignature = verifyTripaySignature(
      rawBody,
      callbackSignature,
      tripayPrivateKey
    );

    if (!isValidSignature) {
      console.error('[Tripay Callback] Invalid signature');
      console.error('[Tripay Callback] Received:', callbackSignature);
      return res.status(200).json({
        success: false,
        message: 'Invalid signature'
      });
    }

    console.log('[Tripay Callback] ✅ Signature verified');

    // ✅ Step 6: Extract callback data
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
      is_closed_payment,
      status,
      paid_at,
      note
    } = callbackData;

    // Skip if merchant_ref is missing (test callback)
    if (!merchant_ref || !reference) {
      console.log('[Tripay Callback] Test callback - no merchant_ref or reference');
      return res.status(200).json({
        success: true,
        message: 'Test callback acknowledged'
      });
    }

    // ✅ Step 7: Find transaction in database
    const { data: transaction, error: findError } = await supabase
      .from('transactions')
      .select('*')
      .eq('tripay_merchant_ref', merchant_ref)
      .eq('tripay_reference', reference)
      .single();

    if (findError || !transaction) {
      console.log('[Tripay Callback] Transaction not found:', merchant_ref, reference);
      console.log('[Tripay Callback] This is normal for Tripay test callbacks');
      // Return success:true for test callbacks (Tripay requirement)
      return res.status(200).json({
        success: true,
        message: 'Callback acknowledged'
      });
    }

    // Only process if transaction is still pending
    if (transaction.status !== 'pending') {
      console.log('[Tripay Callback] Transaction already processed:', transaction.status);
      return res.status(200).json({
        success: true,
        message: 'Transaction already processed'
      });
    }

    console.log('[Tripay Callback] Found transaction:', transaction.id);
    console.log('[Tripay Callback] Current status:', transaction.status);
    console.log('[Tripay Callback] New status:', status);

    // ✅ Step 8: Map Tripay status to our status
    let newStatus: string;
    let shouldUpdateBalance = false;

    switch (status) {
      case 'PAID':
        newStatus = 'completed';
        shouldUpdateBalance = true;
        break;
      case 'EXPIRED':
        newStatus = 'expired';
        break;
      case 'FAILED':
        newStatus = 'failed';
        break;
      case 'REFUND':
        newStatus = 'refunded';
        break;
      default:
        console.error('[Tripay Callback] Unrecognized payment status:', status);
        return res.status(200).json({
          success: false,
          message: 'Unrecognized payment status'
        });
    }

    // ✅ Step 9: Update transaction
    const { error: updateError } = await supabase
      .from('transactions')
      .update({
        status: newStatus,
        tripay_status: status,
        tripay_paid_at: paid_at ? new Date(paid_at * 1000).toISOString() : null,
        tripay_callback_data: callbackData,
        payment_method: payment_method,
        tripay_payment_method: payment_method_code,
        tripay_payment_name: payment_method,
        tripay_amount: total_amount - total_fee,
        tripay_fee: total_fee,
        tripay_total_amount: total_amount,
        completed_at: status === 'PAID' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', transaction.id);

    if (updateError) {
      console.error('[Tripay Callback] Failed to update transaction:', updateError.message);
      return res.status(200).json({
        success: false,
        message: 'Internal error'
      });
    }

    console.log('[Tripay Callback] ✅ Transaction updated:', newStatus);

    // ✅ Balance will be updated automatically by database trigger
    // NOTE: trigger_auto_update_balance fires when transaction.status changes to 'completed'
    // and adds transaction.amount to user.balance
    // This prevents double balance calculation (trigger + manual update)
    console.log('[Tripay Callback] 💵 Balance will be updated automatically by database trigger');

    console.log('=== TRIPAY CALLBACK PROCESSED SUCCESSFULLY ===\n');

    // ✅ Step 11: Return success response
    return res.status(200).json({
      success: true
    });

  } catch (error: any) {
    console.error('[Tripay Callback] Error:', error.message);
    console.error('[Tripay Callback] Stack:', error.stack);
    
    return res.status(200).json({
      success: false,
      message: 'Internal error'
    });
  }
}
