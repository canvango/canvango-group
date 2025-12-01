import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Tripay configuration
const TRIPAY_MODE = process.env.TRIPAY_MODE || 'sandbox';
const IS_SANDBOX = TRIPAY_MODE === 'sandbox';
const TRIPAY_API_KEY = IS_SANDBOX 
  ? process.env.TRIPAY_API_KEY_SANDBOX 
  : process.env.TRIPAY_API_KEY_PRODUCTION;
const TRIPAY_MERCHANT_CODE = IS_SANDBOX
  ? process.env.TRIPAY_MERCHANT_CODE_SANDBOX
  : process.env.TRIPAY_MERCHANT_CODE_PRODUCTION;
const TRIPAY_PRIVATE_KEY = IS_SANDBOX
  ? process.env.TRIPAY_PRIVATE_KEY_SANDBOX
  : process.env.TRIPAY_PRIVATE_KEY_PRODUCTION;
const TRIPAY_BASE_URL = IS_SANDBOX
  ? 'https://tripay.co.id/api-sandbox'
  : 'https://tripay.co.id/api';

// GCP Proxy URL (optional)
const GCP_PROXY_URL = process.env.GCP_PROXY_URL;

/**
 * Generate signature for Open Payment
 * Format: merchant_code + channel + merchant_ref
 */
function generateOpenPaymentSignature(
  merchantCode: string,
  channel: string,
  merchantRef: string,
  privateKey: string
): string {
  const data = `${merchantCode}${channel}${merchantRef}`;
  return crypto.createHmac('sha256', privateKey).update(data).digest('hex');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle POST (create Open Payment)
  if (req.method === 'POST') {
    return handleCreateOpenPayment(req, res);
  }

  // Handle GET (get Open Payment detail or transactions)
  if (req.method === 'GET') {
    const { uuid } = req.query;
    
    if (!uuid || typeof uuid !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'UUID is required',
      });
    }

    // Check if requesting transactions
    if (req.url?.includes('/transactions')) {
      return handleGetOpenPaymentTransactions(req, res, uuid);
    }

    return handleGetOpenPaymentDetail(req, res, uuid);
  }

  return res.status(405).json({
    success: false,
    message: 'Method not allowed',
  });
}

/**
 * Create Open Payment
 */
async function handleCreateOpenPayment(req: VercelRequest, res: VercelResponse) {
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

    const { paymentMethod, customerName, expiredTime } = req.body;

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Payment method is required',
      });
    }

    // Generate unique merchant_ref
    const merchantRef = `OP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Generate signature
    const signature = generateOpenPaymentSignature(
      TRIPAY_MERCHANT_CODE!,
      paymentMethod,
      merchantRef,
      TRIPAY_PRIVATE_KEY!
    );

    console.log('📝 Creating Open Payment:', {
      merchantRef,
      paymentMethod,
      customerName,
    });

    // Prepare request data
    const requestData = {
      method: paymentMethod,
      merchant_ref: merchantRef,
      customer_name: customerName || user.email,
      signature,
    };

    if (expiredTime) {
      requestData['expired_time'] = expiredTime;
    }

    let response;

    if (GCP_PROXY_URL) {
      // Use GCP Proxy
      response = await axios.post(
        `${GCP_PROXY_URL}/open-payment/create`,
        { ...requestData, sandbox: IS_SANDBOX },
        { timeout: 15000 }
      );
    } else {
      // Direct to Tripay API
      response = await axios.post(
        `${TRIPAY_BASE_URL}/open-payment/create`,
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${TRIPAY_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );
    }

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to create Open Payment');
    }

    const openPaymentData = response.data.data;

    // Save to database
    const { error: insertError } = await supabase
      .from('open_payments')
      .insert({
        user_id: user.id,
        uuid: openPaymentData.uuid,
        merchant_ref: merchantRef,
        payment_method: openPaymentData.payment_method,
        payment_name: openPaymentData.payment_name,
        customer_name: customerName || user.email,
        pay_code: openPaymentData.pay_code,
        qr_string: openPaymentData.qr_string,
        qr_url: openPaymentData.qr_url,
        status: 'ACTIVE',
        expired_at: openPaymentData.expired_time 
          ? new Date(openPaymentData.expired_time * 1000).toISOString()
          : null,
      });

    if (insertError) {
      console.error('❌ Failed to save Open Payment to database:', insertError);
      throw insertError;
    }

    console.log('✅ Open Payment created:', openPaymentData.uuid);

    return res.status(200).json({
      success: true,
      data: openPaymentData,
    });
  } catch (error: any) {
    console.error('❌ Error creating Open Payment:', error.message);

    if (axios.isAxiosError(error)) {
      return res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
}

/**
 * Get Open Payment detail
 */
async function handleGetOpenPaymentDetail(req: VercelRequest, res: VercelResponse, uuid: string) {
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

    console.log('📡 Fetching Open Payment detail:', uuid);

    let response;

    if (GCP_PROXY_URL) {
      // Use GCP Proxy
      response = await axios.get(
        `${GCP_PROXY_URL}/open-payment/${uuid}/detail`,
        {
          params: { sandbox: IS_SANDBOX },
          timeout: 10000,
        }
      );
    } else {
      // Direct to Tripay API
      response = await axios.get(
        `${TRIPAY_BASE_URL}/open-payment/${uuid}/detail`,
        {
          headers: {
            'Authorization': `Bearer ${TRIPAY_API_KEY}`,
          },
          timeout: 10000,
        }
      );
    }

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to get Open Payment detail');
    }

    // Update database with latest data
    await supabase
      .from('open_payments')
      .update({
        pay_code: response.data.data.pay_code,
        qr_string: response.data.data.qr_string,
        qr_url: response.data.data.qr_url,
        updated_at: new Date().toISOString(),
      })
      .eq('uuid', uuid)
      .eq('user_id', user.id);

    console.log('✅ Open Payment detail fetched');

    return res.status(200).json({
      success: true,
      data: response.data.data,
    });
  } catch (error: any) {
    console.error('❌ Error getting Open Payment detail:', error.message);

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

/**
 * Get Open Payment transactions
 */
async function handleGetOpenPaymentTransactions(
  req: VercelRequest,
  res: VercelResponse,
  uuid: string
) {
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

    // Get Open Payment from database
    const { data: openPayment, error: opError } = await supabase
      .from('open_payments')
      .select('id')
      .eq('uuid', uuid)
      .eq('user_id', user.id)
      .single();

    if (opError || !openPayment) {
      return res.status(404).json({
        success: false,
        message: 'Open Payment not found',
      });
    }

    // Get transactions
    const { data: transactions, error: txError } = await supabase
      .from('open_payment_transactions')
      .select('*')
      .eq('open_payment_id', openPayment.id)
      .order('paid_at', { ascending: false });

    if (txError) {
      throw txError;
    }

    console.log('✅ Open Payment transactions fetched:', transactions?.length || 0);

    return res.status(200).json({
      success: true,
      data: {
        transactions: transactions || [],
        total: transactions?.length || 0,
      },
    });
  } catch (error: any) {
    console.error('❌ Error getting Open Payment transactions:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}
