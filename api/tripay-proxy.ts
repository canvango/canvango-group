import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

// GCP Proxy URL - with explicit fallback
const GCP_PROXY_URL = process.env.GCP_PROXY_URL || 'http://34.182.126.200:3000';

// Log configuration on startup
console.log('Tripay Proxy Configuration:', {
  gcpProxyUrl: GCP_PROXY_URL,
  hasEnvVar: !!process.env.GCP_PROXY_URL,
});

// Supabase client for auth verification (anon key)
const supabaseAuth = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY!
);

// Supabase client for database operations (service role key)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Get user from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    // Transform frontend request to GCP proxy format
    const {
      amount,
      paymentMethod,
      customerName,
      customerEmail,
      customerPhone,
      orderItems,
      returnUrl,
      expiredTime,
    } = req.body;

    // 🔧 FIX: Create transaction in database FIRST to get transaction ID
    const transactionData = {
      user_id: user.id,
      transaction_type: 'topup',
      amount: amount,
      status: 'pending',
      payment_method: paymentMethod,
      metadata: {
        order_items: orderItems,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
      },
    };

    console.log('Creating transaction in database first...');

    const { data: insertedData, error: dbError } = await supabaseAdmin
      .from('transactions')
      .insert(transactionData)
      .select()
      .single();

    if (dbError) {
      console.error('Failed to create transaction:', {
        error: dbError,
        code: dbError.code,
        message: dbError.message,
        details: dbError.details,
      });
      return res.status(500).json({
        success: false,
        message: 'Failed to create transaction',
        error: dbError.message,
      });
    }

    console.log('Transaction created:', {
      id: insertedData.id,
      user_id: user.id,
      amount: amount,
    });

    // Use transaction ID as merchant_ref
    const merchantRef = insertedData.id;
    const expiredTimeUnix = Math.floor(Date.now() / 1000) + ((expiredTime || 24) * 60 * 60);

    // Format request for GCP proxy (Tripay format)
    const gcpRequest = {
      method: paymentMethod, // Frontend sends 'paymentMethod', GCP expects 'method'
      merchant_ref: merchantRef,
      amount: amount,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone || '',
      order_items: orderItems,
      return_url: returnUrl || 'https://www.canvango.com/riwayat-transaksi',
      expired_time: expiredTimeUnix,
    };

    console.log('Forwarding to GCP proxy:', {
      url: `${GCP_PROXY_URL}/create-transaction`,
      merchant_ref: merchantRef,
      amount: amount,
    });

    // Forward request to GCP proxy
    const response = await axios.post(
      `${GCP_PROXY_URL}/create-transaction`,
      gcpRequest,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 seconds
      }
    );

    console.log('GCP proxy response:', {
      status: response.status,
      success: response.data.success,
      hasData: !!response.data.data,
    });

    if (!response.data.success) {
      // Update transaction status to failed
      await supabaseAdmin
        .from('transactions')
        .update({ 
          status: 'failed',
          notes: response.data.message || 'Failed to create payment',
        })
        .eq('id', merchantRef);

      return res.status(400).json(response.data);
    }

    // Update transaction with Tripay data
    const tripayData = response.data.data;
    const updateData = {
      tripay_reference: tripayData.reference,
      tripay_merchant_ref: merchantRef,
      tripay_payment_method: tripayData.payment_method,
      tripay_payment_name: tripayData.payment_name,
      tripay_checkout_url: tripayData.checkout_url,
      tripay_qr_url: tripayData.qr_url,
      tripay_payment_url: tripayData.pay_url,
      tripay_amount: tripayData.amount,
      tripay_fee: tripayData.total_fee,
      tripay_total_amount: tripayData.amount_received,
      tripay_status: tripayData.status,
      tripay_expired_at: tripayData.expired_time ? new Date(tripayData.expired_time * 1000).toISOString() : null,
      tripay_callback_data: {
        ...tripayData,
        instructions: tripayData.instructions || [],
      },
      updated_at: new Date().toISOString(),
    };

    console.log('Updating transaction with Tripay data:', {
      id: merchantRef,
      tripay_reference: tripayData.reference,
    });

    const { error: updateError } = await supabaseAdmin
      .from('transactions')
      .update(updateData)
      .eq('id', merchantRef);

    if (updateError) {
      console.error('Failed to update transaction:', {
        error: updateError,
        code: updateError.code,
        message: updateError.message,
      });
      // Don't fail the request, payment was created successfully
    } else {
      console.log('Transaction updated successfully:', {
        id: merchantRef,
        reference: tripayData.reference,
      });
    }

    // Return response from GCP proxy
    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error('Error forwarding to GCP proxy:', {
      message: error.message,
      code: error.code,
      isAxiosError: axios.isAxiosError(error),
    });
    
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data;
      console.error('GCP proxy error response:', {
        status: error.response?.status,
        data: errorData,
        headers: error.response?.headers,
      });
      
      // More specific error messages
      let errorMessage = errorData?.message || error.message;
      
      if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Cannot connect to payment gateway. Please try again later.';
      } else if (error.code === 'ETIMEDOUT') {
        errorMessage = 'Payment gateway timeout. Please try again.';
      }
      
      return res.status(error.response?.status || 500).json({
        success: false,
        message: errorMessage,
        error: {
          code: error.code,
          details: errorData,
        },
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        message: error.message,
      },
    });
  }
}
