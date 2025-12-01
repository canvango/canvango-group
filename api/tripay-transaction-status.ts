import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

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
    // Verify authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const token = authHeader.substring(7);
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Verify user session
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session',
      });
    }

    const { reference } = req.query;

    if (!reference || typeof reference !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Reference is required',
      });
    }

    console.log('📡 Quick status check:', reference);

    let response;

    if (GCP_PROXY_URL) {
      // Use GCP Proxy
      response = await axios.get(
        `${GCP_PROXY_URL}/transaction/${reference}/status`,
        {
          params: { sandbox: IS_SANDBOX },
          timeout: 5000,
        }
      );
    } else {
      // Direct to Tripay API
      response = await axios.get(
        `${TRIPAY_BASE_URL}/transaction/check-status`,
        {
          params: { reference },
          headers: {
            'Authorization': `Bearer ${TRIPAY_API_KEY}`,
          },
          timeout: 5000,
        }
      );
    }

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to check status');
    }

    // Extract status from message (e.g., "Status transaksi saat ini PAID")
    const message = response.data.message || '';
    const statusMatch = message.match(/(PAID|UNPAID|EXPIRED|FAILED|REFUND)/);
    const status = statusMatch ? statusMatch[1] : 'UNKNOWN';

    // Update database if status changed
    if (status !== 'UNKNOWN') {
      await supabase
        .from('transactions')
        .update({
          tripay_status: status,
          status: status === 'PAID' ? 'completed' : 
                  status === 'EXPIRED' || status === 'FAILED' ? 'failed' : 
                  'pending',
          updated_at: new Date().toISOString(),
        })
        .eq('tripay_reference', reference);
    }

    console.log('✅ Status checked:', status);

    return res.status(200).json({
      success: true,
      data: { status },
    });
  } catch (error: any) {
    console.error('❌ Error checking status:', error.message);

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
