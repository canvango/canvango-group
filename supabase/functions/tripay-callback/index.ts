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
      total_amount,
      status,
      paid_at,
    } = body;

    console.log('📝 Processing payment:', {
      reference,
      merchant_ref,
      status,
      amount: total_amount,
    });

    // Find transaction by merchant_ref (our transaction ID)
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

    console.log('✅ Transaction found:', transaction.id);

    // Update transaction with Tripay data
    const updateData: any = {
      tripay_reference: reference,
      tripay_merchant_ref: merchant_ref,
      tripay_payment_method: payment_method_code || payment_method,
      tripay_payment_name: payment_name,
      tripay_amount: amount,
      tripay_fee: fee_merchant,
      tripay_total_amount: total_amount,
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

      // If this is a topup transaction, update user balance
      if (transaction.transaction_type === 'topup') {
        console.log('💵 Processing topup for user:', transaction.user_id);
        
        const { error: balanceError } = await supabase.rpc('process_topup_transaction', {
          p_transaction_id: transaction.id,
        });

        if (balanceError) {
          console.error('❌ Failed to update balance:', balanceError);
          // Don't fail the callback, just log the error
        } else {
          console.log('✅ Balance updated successfully');
        }
      }
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

    console.log('✅ Transaction updated successfully');

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
