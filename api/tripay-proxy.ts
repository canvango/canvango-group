import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'authorization, content-type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Get authorization token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: 'Missing authorization' });
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Get Tripay config from database
    const { data: settings, error: settingsError } = await supabase
      .from('system_settings')
      .select('tripay_config')
      .limit(1)
      .single();

    if (settingsError || !settings?.tripay_config) {
      return res.status(500).json({ success: false, message: 'Tripay configuration not found' });
    }

    const config = settings.tripay_config;
    const { api_key, private_key, merchant_code, mode } = config;

    if (!api_key || !private_key || !merchant_code) {
      return res.status(500).json({ success: false, message: 'Tripay credentials incomplete' });
    }

    // Parse request body
    const {
      amount,
      paymentMethod,
      customerName,
      customerEmail,
      customerPhone,
      orderItems,
      returnUrl,
      expiredTime = 24,
    } = req.body;

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
      return res.status(500).json({ success: false, message: 'Failed to create transaction' });
    }

    // Generate signature
    const merchantRef = transaction.id;
    const signatureString = `${merchant_code}${merchantRef}${amount}`;
    const signature = crypto
      .createHmac('sha256', private_key)
      .update(signatureString)
      .digest('hex');

    // Prepare Tripay API request
    const tripayBaseUrl = mode === 'production'
      ? 'https://tripay.co.id/api'
      : 'https://tripay.co.id/api-sandbox';

    const callbackUrl = 'https://canvango.com/api/tripay-callback';
    const currentTime = Math.floor(Date.now() / 1000);
    const durationInSeconds = expiredTime * 3600;
    const expiredTimeUnix = currentTime + durationInSeconds;

    const tripayRequest = {
      method: paymentMethod,
      merchant_ref: merchantRef,
      amount: amount,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone || '',
      order_items: orderItems,
      callback_url: callbackUrl,
      return_url: returnUrl || 'https://canvango.com/riwayat-transaksi',
      expired_time: expiredTimeUnix,
      signature: signature,
    };

    console.log('🚀 Calling Tripay API from Vercel:', tripayBaseUrl);

    // Call Tripay API
    const tripayResponse = await fetch(`${tripayBaseUrl}/transaction/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tripayRequest),
    });

    const tripayData = await tripayResponse.json();

    if (!tripayData.success) {
      // Delete transaction if failed
      await supabase.from('transactions').delete().eq('id', transaction.id);
      return res.status(400).json({
        success: false,
        message: tripayData.message || 'Failed to create payment',
      });
    }

    // Update transaction with Tripay data
    await supabase
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

    return res.status(200).json(tripayData);
  } catch (error) {
    console.error('❌ Error in Vercel proxy:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}
