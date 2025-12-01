import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createHmac } from 'https://deno.land/std@0.168.0/node/crypto.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-callback-signature',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const tripayPrivateKey = Deno.env.get('TRIPAY_PRIVATE_KEY')!;

    if (!tripayPrivateKey) {
      throw new Error('TRIPAY_PRIVATE_KEY not configured');
    }

    // Get raw body text for signature verification (IMPORTANT!)
    const rawBody = await req.text();
    console.log('📥 Tripay callback received (raw):', rawBody);

    // Verify signature BEFORE parsing JSON
    const callbackSignature = req.headers.get('X-Callback-Signature');
    if (!callbackSignature) {
      console.error('❌ Missing X-Callback-Signature header');
      return new Response(
        JSON.stringify({ success: false, message: 'Missing signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate signature for verification using RAW body
    const hmac = createHmac('sha256', tripayPrivateKey);
    hmac.update(rawBody);
    const calculatedSignature = hmac.digest('hex');

    console.log('🔐 Signature verification:');
    console.log('  Expected:', calculatedSignature);
    console.log('  Received:', callbackSignature);

    if (calculatedSignature !== callbackSignature) {
      console.error('❌ Invalid signature');
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Signature verified');

    // Now parse the JSON body
    const body = JSON.parse(rawBody);
    console.log('📝 Parsed callback data:', JSON.stringify(body, null, 2));

    // Initialize Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extract Tripay data
    const {
      reference,
      merchant_ref,
      payment_method,
      payment_method_code,
      payment_name,
      amount,
      fee_merchant,
      fee_customer,
      total_fee,
      amount_received,
      total_amount,
      status,
      paid_at,
      is_closed_payment,
      callback_virtual_account_id,
      external_id,
      account_number,
      customer_name,
      customer_email,
      customer_phone,
    } = body;

    console.log('📝 Processing payment:', {
      reference,
      merchant_ref,
      status,
      amount: total_amount,
      is_closed_payment,
    });

    // Check idempotency - has this callback been processed before?
    const { data: existingCallback } = await supabase
      .from('audit_logs')
      .select('id')
      .eq('action', 'tripay_callback')
      .eq('details->>reference', reference)
      .single();

    if (existingCallback) {
      console.log('⚠️ Callback already processed for reference:', reference);
      return new Response(
        JSON.stringify({ success: true, message: 'Already processed' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine if this is Closed Payment (1) or Open Payment (0)
    const isClosedPayment = is_closed_payment === 1;

    if (isClosedPayment) {
      // Handle Closed Payment - find transaction by merchant_ref (our transaction ID)
      const { data: transaction, error: findError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', merchant_ref)
        .single();

      if (findError || !transaction) {
        console.error('❌ Transaction not found:', merchant_ref);
        return new Response(
          JSON.stringify({ success: false, message: 'Transaction not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('✅ Closed Payment transaction found:', transaction.id);
    } else {
      // Handle Open Payment - find open_payment by merchant_ref
      const { data: openPayment, error: findError } = await supabase
        .from('open_payments')
        .select('*')
        .eq('merchant_ref', merchant_ref)
        .single();

      if (findError || !openPayment) {
        console.error('❌ Open Payment not found:', merchant_ref);
        return new Response(
          JSON.stringify({ success: false, message: 'Open Payment not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('✅ Open Payment found:', openPayment.id);
    }

    if (isClosedPayment) {
      // Process Closed Payment
      const { data: transaction } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', merchant_ref)
        .single();

      // Update transaction with Tripay data
      const updateData: any = {
        tripay_reference: reference,
        tripay_merchant_ref: merchant_ref,
        tripay_payment_method: payment_method_code || payment_method,
        tripay_payment_name: payment_name,
        tripay_amount: total_amount, // Total amount paid by customer (including fee)
        tripay_fee: fee_merchant || 0, // Fee charged by Tripay (for display only)
        tripay_total_amount: total_amount, // Same as tripay_amount
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
        console.log('💵 Balance will be updated automatically by database trigger');
        
        // NOTE: Balance update is handled automatically by trigger_auto_update_balance
        // No need to manually call process_topup_transaction to avoid double topup
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
        return new Response(
          JSON.stringify({ success: false, message: 'Failed to update transaction' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('✅ Closed Payment transaction updated successfully');
    } else {
      // Process Open Payment
      const { data: openPayment } = await supabase
        .from('open_payments')
        .select('*')
        .eq('merchant_ref', merchant_ref)
        .single();

      if (status === 'PAID') {
        console.log('💰 Open Payment received - creating transaction record');

        // Create transaction record for this Open Payment
        const { data: newTransaction, error: createTxError } = await supabase
          .from('transactions')
          .insert({
            user_id: openPayment.user_id,
            transaction_type: 'topup',
            amount: total_amount, // Use total_amount (what customer paid) for balance update
            status: 'completed',
            payment_method: 'tripay',
            tripay_reference: reference,
            tripay_merchant_ref: merchant_ref,
            tripay_payment_method: payment_method_code || payment_method,
            tripay_payment_name: payment_name,
            tripay_amount: total_amount, // Total amount paid by customer
            tripay_fee: fee_merchant || 0, // Fee for display only
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
          return new Response(
            JSON.stringify({ success: false, message: 'Failed to create transaction' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('✅ Transaction created:', newTransaction.id);
        console.log('💵 Balance updated automatically by database trigger');

        // Create open_payment_transaction record
        const { error: createOPTError } = await supabase
          .from('open_payment_transactions')
          .insert({
            open_payment_id: openPayment.id,
            transaction_id: newTransaction.id,
            reference: reference,
            amount: total_amount, // Total amount paid by customer
            fee_merchant: fee_merchant || 0,
            fee_customer: fee_customer || 0,
            total_fee: total_fee || 0,
            amount_received: amount_received || amount, // Amount received after fee
            status: 'PAID',
            paid_at: paid_at || new Date().toISOString(),
          });

        if (createOPTError) {
          console.error('❌ Failed to create open_payment_transaction:', createOPTError);
        } else {
          console.log('✅ Open Payment transaction record created');
        }

        // NOTE: Balance update is handled automatically by trigger_auto_update_balance
        // when transaction is inserted with status='completed'
        // No need to manually call process_topup_transaction to avoid double topup
      }

      console.log('✅ Open Payment processed successfully');
    }

    // Log callback event to audit_logs
    await supabase
      .from('audit_logs')
      .insert({
        user_id: null, // System action
        action: 'tripay_callback',
        table_name: isClosedPayment ? 'transactions' : 'open_payments',
        record_id: merchant_ref,
        details: {
          reference,
          merchant_ref,
          status,
          amount: total_amount,
          is_closed_payment: isClosedPayment,
          callback_virtual_account_id,
          external_id,
          account_number,
        },
      });

    console.log('✅ Callback logged to audit_logs');

    // Return success response
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error processing callback:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Internal server error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
