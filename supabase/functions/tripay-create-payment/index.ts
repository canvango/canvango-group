import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createHmac } from 'https://deno.land/std@0.168.0/node/crypto.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Get Tripay credentials from database first, fallback to environment
    let tripayApiKey = '';
    let tripayPrivateKey = '';
    let tripayMerchantCode = '';
    let tripayMode = 'production';

    try {
      const { data: settings, error: settingsError } = await supabase
        .from('system_settings')
        .select('tripay_config')
        .limit(1)
        .single();

      if (!settingsError && settings?.tripay_config) {
        const config = settings.tripay_config;
        tripayApiKey = config.api_key || '';
        tripayPrivateKey = config.private_key || '';
        tripayMerchantCode = config.merchant_code || '';
        tripayMode = config.mode || 'production';
        console.log('✅ Using Tripay credentials from database');
      } else {
        throw new Error('No database config');
      }
    } catch (dbError) {
      console.log('⚠️ Database config not found, using environment variables');
      tripayApiKey = Deno.env.get('TRIPAY_API_KEY') || '';
      tripayPrivateKey = Deno.env.get('TRIPAY_PRIVATE_KEY') || '';
      tripayMerchantCode = Deno.env.get('TRIPAY_MERCHANT_CODE') || '';
      tripayMode = Deno.env.get('TRIPAY_MODE') || 'production';
    }

    if (!tripayApiKey || !tripayPrivateKey || !tripayMerchantCode) {
      throw new Error('Tripay credentials not configured');
    }

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, message: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body = await req.json();
    const {
      amount,
      paymentMethod,
      customerName,
      customerEmail,
      customerPhone,
      orderItems,
      returnUrl,
      expiredTime = 24,
    } = body;

    console.log('📝 Creating payment for user:', user.id);

    // Create transaction in database
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        transaction_type: 'topup',
        amount: amount,
        status: 'pending',
        payment_method: paymentMethod,
        metadata: {
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          order_items: orderItems,
        },
      })
      .select()
      .single();

    if (transactionError || !transaction) {
      console.error('❌ Failed to create transaction:', transactionError);
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to create transaction' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Transaction created:', transaction.id);

    // Generate signature
    const merchantRef = transaction.id;
    const signatureString = `${tripayMerchantCode}${merchantRef}${amount}`;
    const hmac = createHmac('sha256', tripayPrivateKey);
    hmac.update(signatureString);
    const signature = hmac.digest('hex');

    // Prepare Tripay API request
    const tripayBaseUrl = tripayMode === 'production' 
      ? 'https://tripay.co.id/api'
      : 'https://tripay.co.id/api-sandbox';

    // Use custom domain callback URL (proxies to Supabase Edge Function)
    const callbackUrl = 'https://canvango.com/api/tripay-callback';
    
    // Convert expired time from hours to seconds
    const expiredTimeInSeconds = expiredTime * 3600;
    console.log('⏰ Expired time:', { hours: expiredTime, seconds: expiredTimeInSeconds });
    
    const tripayRequest = {
      method: paymentMethod,
      merchant_ref: merchantRef,
      amount: amount,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone || '',
      order_items: orderItems,
      callback_url: callbackUrl,
      return_url: returnUrl || `${req.headers.get('origin')}/riwayat-transaksi`,
      expired_time: expiredTimeInSeconds,
      signature: signature,
    };

    console.log('🚀 Calling Tripay API:', tripayBaseUrl);
    console.log('📝 Request data:', JSON.stringify(tripayRequest, null, 2));
    console.log('🔑 Using API Key:', tripayApiKey?.substring(0, 10) + '...');

    // Call Tripay API
    const tripayResponse = await fetch(`${tripayBaseUrl}/transaction/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tripayApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tripayRequest),
    });

    console.log('📊 Tripay response status:', tripayResponse.status);
    
    const tripayData = await tripayResponse.json();
    console.log('📦 Tripay response data:', JSON.stringify(tripayData, null, 2));

    if (!tripayData.success) {
      console.error('❌ Tripay API error:', tripayData);
      
      // Delete transaction if Tripay creation failed
      await supabase.from('transactions').delete().eq('id', transaction.id);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: tripayData.message || 'Failed to create payment' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Tripay payment created:', tripayData.data.reference);

    // Update transaction with Tripay data
    const { error: updateError } = await supabase
      .from('transactions')
      .update({
        tripay_reference: tripayData.data.reference,
        tripay_merchant_ref: tripayData.data.merchant_ref,
        tripay_payment_method: tripayData.data.payment_method,
        tripay_payment_name: tripayData.data.payment_name,
        tripay_payment_url: tripayData.data.pay_url,
        tripay_qr_url: tripayData.data.qr_url,
        tripay_checkout_url: tripayData.data.checkout_url,
        tripay_amount: tripayData.data.amount,
        tripay_fee: tripayData.data.fee_merchant,
        tripay_total_amount: tripayData.data.amount_received,
        tripay_status: tripayData.data.status,
      })
      .eq('id', transaction.id);

    if (updateError) {
      console.error('❌ Failed to update transaction:', updateError);
    }

    console.log('✅ Payment created successfully');

    // Return success response
    return new Response(
      JSON.stringify(tripayData),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error creating payment:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Internal server error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
