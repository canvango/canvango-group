import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getSourceIP, isValidTripayIP, verifySignature, validateCallbackPayload, sanitizeInput } from '../_shared/security.ts';
import { logSecurityEvent, logCallbackAttempt, logTransactionMismatch, logRateLimitViolation, SecuritySeverity, SecurityEventType } from '../_shared/audit.ts';
import { FEATURE_FLAGS, RATE_LIMITS } from '../_shared/constants.ts';
import { enforceRateLimit, getRateLimitHeaders } from '../_shared/rateLimit.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-callback-signature',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  let sourceIP = 'unknown';
  let reference = '';
  let merchant_ref = '';

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const tripayPrivateKey = Deno.env.get('TRIPAY_PRIVATE_KEY')!;

    if (!tripayPrivateKey) {
      throw new Error('TRIPAY_PRIVATE_KEY not configured');
    }

    // Initialize Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // =====================================================
    // SECURITY LAYER 0: Rate Limiting
    // =====================================================
    sourceIP = getSourceIP(req);
    
    const rateLimitResult = await enforceRateLimit(
      '/tripay-callback',
      sourceIP,
      FEATURE_FLAGS.ENABLE_RATE_LIMITING
    );

    if (!rateLimitResult.allowed) {
      console.warn('⚠️ Rate limit exceeded for IP:', sourceIP);
      
      await logRateLimitViolation(supabase, {
        endpoint: '/tripay-callback',
        source_ip: sourceIP,
        limit: RATE_LIMITS.CALLBACK.limit,
        window: RATE_LIMITS.CALLBACK.window,
      });

      const headers = {
        ...corsHeaders,
        'Content-Type': 'application/json',
        ...getRateLimitHeaders(rateLimitResult),
      };

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Too many requests. Please try again later.' 
        }),
        { status: 429, headers }
      );
    }

    console.log('✅ Rate limit check passed:', {
      remaining: rateLimitResult.remaining,
      total: rateLimitResult.total,
    });

    // =====================================================
    // SECURITY LAYER 1: IP Whitelist Validation
    // =====================================================
    console.log('📍 Source IP:', sourceIP);

    const ipValid = isValidTripayIP(sourceIP);
    
    if (!ipValid) {
      // Log IP validation failure
      await logSecurityEvent(supabase, {
        event_type: FEATURE_FLAGS.ENABLE_IP_VALIDATION 
          ? SecurityEventType.CALLBACK_IP_FAIL 
          : SecurityEventType.CALLBACK_IP_WARNING,
        severity: FEATURE_FLAGS.ENABLE_IP_VALIDATION 
          ? SecuritySeverity.HIGH 
          : SecuritySeverity.MEDIUM,
        source_ip: sourceIP,
        endpoint: '/tripay-callback',
        details: {
          message: FEATURE_FLAGS.ENABLE_IP_VALIDATION
            ? 'Callback from non-whitelisted IP (rejected)'
            : 'Callback from non-whitelisted IP (warning only)',
        },
      });

      // If IP validation is enabled, reject the request
      if (FEATURE_FLAGS.ENABLE_IP_VALIDATION) {
        console.error('❌ IP not whitelisted:', sourceIP);
        return new Response(
          JSON.stringify({ success: false, message: 'Forbidden' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        console.warn('⚠️ IP not whitelisted (warning mode):', sourceIP);
      }
    } else {
      console.log('✅ IP validated:', sourceIP);
    }

    // =====================================================
    // SECURITY LAYER 2: Signature Verification
    // =====================================================
    // Get raw body text for signature verification (IMPORTANT!)
    const rawBody = await req.text();
    console.log('📥 Tripay callback received');

    // Verify signature BEFORE parsing JSON
    const callbackSignature = req.headers.get('X-Callback-Signature');
    if (!callbackSignature) {
      console.error('❌ Missing X-Callback-Signature header');
      
      await logSecurityEvent(supabase, {
        event_type: SecurityEventType.CALLBACK_SIGNATURE_FAIL,
        severity: SecuritySeverity.HIGH,
        source_ip: sourceIP,
        endpoint: '/tripay-callback',
        details: {
          error: 'Missing signature header',
        },
      });

      return new Response(
        JSON.stringify({ success: false, message: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify signature using constant-time comparison
    const signatureValid = verifySignature(rawBody, callbackSignature, tripayPrivateKey);

    console.log('🔐 Signature verification:', signatureValid ? 'VALID' : 'INVALID');

    if (!signatureValid) {
      console.error('❌ Invalid signature');
      
      await logSecurityEvent(supabase, {
        event_type: SecurityEventType.CALLBACK_SIGNATURE_FAIL,
        severity: SecuritySeverity.CRITICAL,
        source_ip: sourceIP,
        endpoint: '/tripay-callback',
        details: {
          received_signature: callbackSignature.substring(0, 20) + '...',
          error: 'Signature mismatch',
        },
      });

      return new Response(
        JSON.stringify({ success: false, message: 'Forbidden' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Signature verified');

    // Now parse the JSON body
    const body = JSON.parse(rawBody);

    // =====================================================
    // SECURITY LAYER 3: Input Validation
    // =====================================================
    const validation = validateCallbackPayload(body);
    if (!validation.valid) {
      console.error('❌ Invalid callback payload:', validation.errors);
      
      await logSecurityEvent(supabase, {
        event_type: SecurityEventType.CALLBACK_RECEIVED,
        severity: SecuritySeverity.HIGH,
        source_ip: sourceIP,
        endpoint: '/tripay-callback',
        details: {
          error: 'Invalid payload structure',
          validation_errors: validation.errors,
        },
      });

      return new Response(
        JSON.stringify({ success: false, message: 'Invalid request' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract and sanitize Tripay data
    reference = sanitizeInput(body.reference);
    merchant_ref = sanitizeInput(body.merchant_ref);
    const payment_method = sanitizeInput(body.payment_method);
    const payment_method_code = sanitizeInput(body.payment_method_code);
    const payment_name = sanitizeInput(body.payment_name);
    const status = body.status;
    const paid_at = body.paid_at;
    const is_closed_payment = body.is_closed_payment;
    
    // Merchant reporting data (NOT used for balance calculation)
    const amount_received = body.amount_received;
    const fee_merchant = body.fee_merchant || 0;
    const fee_customer = body.fee_customer || 0;
    const total_fee = body.total_fee || 0;
    const total_amount = body.total_amount || body.amount;

    console.log('📝 Processing payment:', {
      reference,
      merchant_ref,
      status,
      is_closed_payment,
    });

    // =====================================================
    // SECURITY LAYER 4: Idempotency Check
    // =====================================================
    const { data: existingEvent } = await supabase
      .from('security_events')
      .select('id, created_at')
      .eq('event_type', SecurityEventType.CALLBACK_RECEIVED)
      .eq('details->>reference', reference)
      .eq('details->>success', 'true')
      .single();

    if (existingEvent) {
      console.log('⚠️ Callback already processed for reference:', reference);
      
      await logSecurityEvent(supabase, {
        event_type: SecurityEventType.IDEMPOTENCY_CHECK,
        severity: SecuritySeverity.LOW,
        source_ip: sourceIP,
        endpoint: '/tripay-callback',
        details: {
          reference,
          merchant_ref,
          original_processing_time: existingEvent.created_at,
          message: 'Duplicate callback ignored',
        },
      });

      return new Response(
        JSON.stringify({ success: true, message: 'Already processed' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine if this is Closed Payment (1) or Open Payment (0)
    const isClosedPayment = is_closed_payment === 1;

    // =====================================================
    // SECURITY LAYER 5: Transaction Matching & Verification
    // =====================================================
    if (isClosedPayment) {
      // Handle Closed Payment - find transaction by merchant_ref (our transaction ID)
      const { data: transaction, error: findError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', merchant_ref)
        .single();

      if (findError || !transaction) {
        console.error('❌ Transaction not found:', merchant_ref);
        
        await logSecurityEvent(supabase, {
          event_type: SecurityEventType.TRANSACTION_MISMATCH,
          severity: SecuritySeverity.CRITICAL,
          source_ip: sourceIP,
          endpoint: '/tripay-callback',
          details: {
            reference,
            merchant_ref,
            error: 'Transaction not found',
          },
        });

        return new Response(
          JSON.stringify({ success: false, message: 'Not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('✅ Closed Payment transaction found:', transaction.id);

      // Verify payment method matches
      if (transaction.payment_method && transaction.payment_method !== 'tripay') {
        console.error('❌ Payment method mismatch');
        
        await logTransactionMismatch(supabase, {
          reference,
          merchant_ref,
          mismatch_type: 'payment_method',
          expected: transaction.payment_method,
          received: 'tripay',
          source_ip: sourceIP,
        });

        return new Response(
          JSON.stringify({ success: false, message: 'Invalid request' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update transaction with Tripay data
      // CRITICAL: Use amount from DATABASE, not from callback
      const updateData: any = {
        tripay_reference: reference,
        tripay_merchant_ref: merchant_ref,
        tripay_payment_method: payment_method_code || payment_method,
        tripay_payment_name: payment_name,
        tripay_amount: total_amount, // For display/verification only
        tripay_fee: fee_merchant, // For merchant reporting only
        tripay_total_amount: total_amount, // For display only
        tripay_status: status,
        tripay_callback_data: body,
        updated_at: new Date().toISOString(),
      };

      // Handle payment status
      if (status === 'PAID') {
        updateData.status = 'completed';
        updateData.completed_at = paid_at || new Date().toISOString();
        updateData.tripay_paid_at = paid_at;
        console.log('💰 Payment PAID - marking as completed');
        console.log('💵 Balance will be updated using amount from database:', transaction.amount);
        
        // NOTE: Balance update uses transaction.amount from database
        // NOT total_amount from callback (security measure)
      } else if (status === 'EXPIRED') {
        updateData.status = 'failed';
        console.log('⏰ Payment EXPIRED - marking as failed');
      } else if (status === 'FAILED') {
        updateData.status = 'failed';
        console.log('❌ Payment FAILED');
      } else if (status === 'UNPAID') {
        updateData.status = 'pending';
        console.log('⏳ Payment still UNPAID');
      }

      // Update transaction
      const { error: updateError } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('id', transaction.id);

      if (updateError) {
        console.error('❌ Failed to update transaction:', updateError);
        
        await logSecurityEvent(supabase, {
          event_type: SecurityEventType.CALLBACK_RECEIVED,
          severity: SecuritySeverity.HIGH,
          source_ip: sourceIP,
          endpoint: '/tripay-callback',
          details: {
            reference,
            merchant_ref,
            error: 'Database update failed',
            db_error: updateError.message,
          },
        });

        return new Response(
          JSON.stringify({ success: false, message: 'Internal server error' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('✅ Closed Payment transaction updated successfully');
    } else {
      // Handle Open Payment
      const { data: openPayment, error: findError } = await supabase
        .from('open_payments')
        .select('*')
        .eq('merchant_ref', merchant_ref)
        .single();

      if (findError || !openPayment) {
        console.error('❌ Open Payment not found:', merchant_ref);
        
        await logSecurityEvent(supabase, {
          event_type: SecurityEventType.TRANSACTION_MISMATCH,
          severity: SecuritySeverity.CRITICAL,
          source_ip: sourceIP,
          endpoint: '/tripay-callback',
          details: {
            reference,
            merchant_ref,
            error: 'Open Payment not found',
          },
        });

        return new Response(
          JSON.stringify({ success: false, message: 'Not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('✅ Open Payment found:', openPayment.id);

      if (status === 'PAID') {
        console.log('💰 Open Payment received - creating transaction record');

        // Create transaction record for this Open Payment
        // CRITICAL: Use total_amount for balance (since no pre-existing transaction)
        const { data: newTransaction, error: createTxError } = await supabase
          .from('transactions')
          .insert({
            user_id: openPayment.user_id,
            transaction_type: 'topup',
            amount: total_amount, // This becomes the source of truth
            status: 'completed',
            payment_method: 'tripay',
            tripay_reference: reference,
            tripay_merchant_ref: merchant_ref,
            tripay_payment_method: payment_method_code || payment_method,
            tripay_payment_name: payment_name,
            tripay_amount: total_amount,
            tripay_fee: fee_merchant,
            tripay_total_amount: total_amount,
            tripay_status: status,
            tripay_paid_at: paid_at,
            tripay_callback_data: body,
            completed_at: paid_at || new Date().toISOString(),
          })
          .select()
          .single();

        if (createTxError) {
          console.error('❌ Failed to create transaction:', createTxError);
          
          await logSecurityEvent(supabase, {
            event_type: SecurityEventType.CALLBACK_RECEIVED,
            severity: SecuritySeverity.HIGH,
            source_ip: sourceIP,
            endpoint: '/tripay-callback',
            details: {
              reference,
              merchant_ref,
              error: 'Transaction creation failed',
              db_error: createTxError.message,
            },
          });

          return new Response(
            JSON.stringify({ success: false, message: 'Internal server error' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('✅ Transaction created:', newTransaction.id);
        console.log('💵 Balance updated automatically by database trigger');

        // Create open_payment_transaction record
        await supabase
          .from('open_payment_transactions')
          .insert({
            open_payment_id: openPayment.id,
            transaction_id: newTransaction.id,
            reference: reference,
            amount: total_amount,
            fee_merchant: fee_merchant,
            fee_customer: fee_customer,
            total_fee: total_fee,
            amount_received: amount_received,
            status: 'PAID',
            paid_at: paid_at || new Date().toISOString(),
          });
      }

      console.log('✅ Open Payment processed successfully');
    }

    // =====================================================
    // SECURITY LAYER 6: Comprehensive Audit Logging
    // =====================================================
    await logCallbackAttempt(supabase, {
      reference,
      merchant_ref,
      status,
      success: true,
      source_ip: sourceIP,
      signature_valid: true,
      ip_valid: ipValid,
    });

    console.log('✅ Callback processed and logged successfully');

    // Return success response
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error processing callback:', error);
    
    // Log error to security events if we have supabase client
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      await logSecurityEvent(supabase, {
        event_type: SecurityEventType.CALLBACK_RECEIVED,
        severity: SecuritySeverity.HIGH,
        source_ip: sourceIP,
        endpoint: '/tripay-callback',
        details: {
          reference,
          merchant_ref,
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        },
      });
    } catch (logError) {
      console.error('❌ Failed to log error:', logError);
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Internal server error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
