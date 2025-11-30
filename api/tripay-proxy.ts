import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

// GCP Proxy URL
const GCP_PROXY_URL = process.env.GCP_PROXY_URL || 'http://34.182.126.200:3000';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
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
