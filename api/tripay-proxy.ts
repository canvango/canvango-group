import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

// GCP Proxy URL
const GCP_PROXY_URL = process.env.GCP_PROXY_URL || 'http://34.182.126.200:3000';

// Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
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
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
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

    // Generate merchant reference
    const merchantRef = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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

    console.log('Forwarding to GCP proxy:', gcpRequest);

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

    console.log('GCP proxy response:', response.data);

    if (!response.data.success) {
      return res.status(400).json(response.data);
    }

    // Save transaction to database
    const tripayData = response.data.data;
    const transactionData = {
      user_id: user.id,
      transaction_type: 'topup',
      amount: amount,
      status: 'pending',
      payment_method: paymentMethod,
      tripay_reference: tripayData.reference,
      tripay_merchant_ref: merchantRef,
      tripay_payment_method: tripayData.payment_method,
      tripay_payment_name: tripayData.payment_name,
      tripay_checkout_url: tripayData.checkout_url,
      tripay_amount: tripayData.amount,
      tripay_fee: tripayData.total_fee,
      tripay_total_amount: tripayData.amount_received,
      tripay_status: tripayData.status,
    };

    console.log('Saving transaction to database:', transactionData);

    const { error: dbError } = await supabase
      .from('transactions')
      .insert(transactionData);

    if (dbError) {
      console.error('Failed to save transaction:', dbError);
      // Don't fail the request, just log the error
      // Transaction will be created by callback if payment succeeds
    }

    // Return response from GCP proxy
    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error('Error forwarding to GCP proxy:', error.message);
    
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data;
      console.error('GCP proxy error:', errorData);
      
      return res.status(error.response?.status || 500).json({
        success: false,
        message: errorData?.message || error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}
