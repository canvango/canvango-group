/**
 * Tripay Proxy Server for GCP VM
 * 
 * This server handles:
 * 1. Payment channel requests (frontend → GCP → Tripay)
 * 2. Transaction creation (frontend → GCP → Tripay)
 * 3. Callback handling (Tripay → GCP → Supabase)
 * 
 * IP: 34.182.126.200 (whitelisted in Tripay)
 * Port: 3000
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
const allowedOrigins = [
  'https://canvango.com',
  'https://www.canvango.com',
  'https://canvango-group.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Parse JSON body (but we'll handle raw body for callback)
app.use(express.json());

// Tripay configuration
const TRIPAY_API_KEY = process.env.TRIPAY_API_KEY;
const TRIPAY_PRIVATE_KEY = process.env.TRIPAY_PRIVATE_KEY;
const TRIPAY_MERCHANT_CODE = process.env.TRIPAY_MERCHANT_CODE;
const IS_PRODUCTION = process.env.IS_PRODUCTION === 'true';

const TRIPAY_BASE_URL = IS_PRODUCTION
  ? 'https://tripay.co.id/api'
  : 'https://tripay.co.id/api-sandbox';

const SUPABASE_EDGE_FUNCTION_URL = 'https://gpittnsfzgkdbqnccncn.supabase.co/functions/v1/tripay-callback';

// Helper: Generate signature for transaction creation
function generateSignature(merchantRef, amount) {
  const crypto = require('crypto');
  const data = TRIPAY_MERCHANT_CODE + merchantRef + amount;
  return crypto
    .createHmac('sha256', TRIPAY_PRIVATE_KEY)
    .update(data)
    .digest('hex');
}

// ============================================
// HEALTH CHECK
// ============================================
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Tripay Proxy Server',
    mode: IS_PRODUCTION ? 'production' : 'sandbox',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: 'GET /',
      paymentChannels: 'GET /payment-channels',
      createTransaction: 'POST /create-transaction',
      transactionDetail: 'GET /transaction-detail/:reference',
      callback: 'POST /tripay-callback'
    }
  });
});

// ============================================
// PAYMENT CHANNELS
// ============================================
app.get('/payment-channels', async (req, res) => {
  try {
    console.log('📥 Payment channels request');
    
    const response = await axios.get(`${TRIPAY_BASE_URL}/merchant/payment-channel`, {
      headers: {
        'Authorization': `Bearer ${TRIPAY_API_KEY}`
      }
    });
    
    console.log('✅ Payment channels fetched:', response.data.data?.length || 0, 'channels');
    res.json(response.data);
    
  } catch (error) {
    console.error('❌ Error fetching payment channels:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || 'Failed to fetch payment channels'
    });
  }
});

// ============================================
// CREATE TRANSACTION
// ============================================
app.post('/create-transaction', async (req, res) => {
  try {
    const {
      method,
      merchant_ref,
      amount,
      customer_name,
      customer_email,
      customer_phone,
      order_items,
      return_url,
      expired_time
    } = req.body;

    console.log('📥 Create transaction request:', {
      method,
      merchant_ref,
      amount
    });

    const signature = generateSignature(merchant_ref, amount);

    const payload = {
      method,
      merchant_ref,
      amount,
      customer_name,
      customer_email,
      customer_phone,
      order_items,
      return_url,
      expired_time,
      signature
    };

    const response = await axios.post(
      `${TRIPAY_BASE_URL}/transaction/create`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${TRIPAY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Transaction created:', response.data.data?.reference);
    res.json(response.data);
    
  } catch (error) {
    console.error('❌ Error creating transaction:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || 'Failed to create transaction'
    });
  }
});

// ============================================
// TRANSACTION DETAIL
// ============================================
app.get('/transaction-detail/:reference', async (req, res) => {
  try {
    const { reference } = req.params;
    
    console.log('📥 Transaction detail request:', reference);
    
    const response = await axios.get(
      `${TRIPAY_BASE_URL}/transaction/detail?reference=${reference}`,
      {
        headers: {
          'Authorization': `Bearer ${TRIPAY_API_KEY}`
        }
      }
    );
    
    console.log('✅ Transaction detail fetched:', reference);
    res.json(response.data);
    
  } catch (error) {
    console.error('❌ Error fetching transaction detail:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || 'Failed to fetch transaction detail'
    });
  }
});

// ============================================
// TRIPAY CALLBACK HANDLER
// ============================================
app.post('/tripay-callback', async (req, res) => {
  try {
    console.log('=== TRIPAY CALLBACK RECEIVED ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('IP:', req.ip || req.connection.remoteAddress);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));
    
    // Get signature from header
    const signature = req.headers['x-callback-signature'] || req.headers['X-Callback-Signature'];
    
    if (!signature) {
      console.error('❌ Missing X-Callback-Signature header');
      return res.status(401).json({ 
        success: false, 
        message: 'Missing signature' 
      });
    }
    
    console.log('Signature:', signature);
    
    // Get raw body as string for forwarding
    const rawBody = JSON.stringify(req.body);
    console.log('Raw body length:', rawBody.length);
    
    // Forward to Supabase Edge Function
    console.log('📤 Forwarding to Supabase Edge Function...');
    console.log('URL:', SUPABASE_EDGE_FUNCTION_URL);
    
    const response = await axios.post(SUPABASE_EDGE_FUNCTION_URL, rawBody, {
      headers: {
        'Content-Type': 'application/json',
        'X-Callback-Signature': signature,
      },
      validateStatus: () => true // Accept any status code
    });

    console.log('📥 Edge Function response:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    console.log('=================================');
    
    // Return response from Edge Function
    return res.status(response.status).json(response.data);
    
  } catch (error) {
    console.error('❌ Callback proxy error:', error.message);
    console.error('Stack:', error.stack);
    console.error('=================================');
    
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message
    });
  }
});

// ============================================
// ERROR HANDLER
// ============================================
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, '0.0.0.0', () => {
  console.log('=================================');
  console.log('🚀 Tripay Proxy Server Started');
  console.log('=================================');
  console.log('Port:', PORT);
  console.log('Mode:', IS_PRODUCTION ? 'PRODUCTION' : 'SANDBOX');
  console.log('Tripay API:', TRIPAY_BASE_URL);
  console.log('Supabase Edge Function:', SUPABASE_EDGE_FUNCTION_URL);
  console.log('=================================');
  console.log('Endpoints:');
  console.log('  GET  / - Health check');
  console.log('  GET  /payment-channels - Get payment methods');
  console.log('  POST /create-transaction - Create payment');
  console.log('  GET  /transaction-detail/:ref - Get transaction');
  console.log('  POST /tripay-callback - Callback handler');
  console.log('=================================');
});
