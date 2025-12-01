import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

// Tripay configuration
const TRIPAY_MODE = process.env.TRIPAY_MODE || 'sandbox';
const IS_SANDBOX = TRIPAY_MODE === 'sandbox';
const TRIPAY_API_KEY = IS_SANDBOX 
  ? process.env.TRIPAY_API_KEY_SANDBOX 
  : process.env.TRIPAY_API_KEY_PRODUCTION;
const TRIPAY_BASE_URL = IS_SANDBOX
  ? 'https://tripay.co.id/api-sandbox'
  : 'https://tripay.co.id/api';

// GCP Proxy URL (optional)
const GCP_PROXY_URL = process.env.GCP_PROXY_URL;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }

  try {
    console.log('📡 Fetching payment channels from Tripay...');

    let response;

    if (GCP_PROXY_URL) {
      // Use GCP Proxy
      console.log('Using GCP Proxy:', GCP_PROXY_URL);
      response = await axios.get(`${GCP_PROXY_URL}/payment-channels`, {
        params: { sandbox: IS_SANDBOX },
        timeout: 10000,
      });
    } else {
      // Direct to Tripay API
      console.log('Direct to Tripay API');
      response = await axios.get(`${TRIPAY_BASE_URL}/merchant/payment-channel`, {
        headers: {
          'Authorization': `Bearer ${TRIPAY_API_KEY}`,
        },
        timeout: 10000,
      });
    }

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch payment channels');
    }

    console.log('✅ Payment channels fetched:', response.data.data.length);

    // Set cache headers (cache for 1 hour)
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

    return res.status(200).json({
      success: true,
      data: response.data.data,
    });
  } catch (error: any) {
    console.error('❌ Error fetching payment channels:', error.message);

    if (axios.isAxiosError(error)) {
      return res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}
