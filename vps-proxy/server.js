// Simple Node.js proxy server for Tripay API
// Deploy this to VPS with static IP (DigitalOcean, Vultr, etc.)

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', ip: req.ip });
});

// Tripay proxy endpoint
app.post('/tripay/create-payment', async (req, res) => {
  try {
    const {
      api_key,
      private_key,
      merchant_code,
      mode,
      amount,
      paymentMethod,
      merchantRef,
      customerName,
      customerEmail,
      customerPhone,
      orderItems,
      callbackUrl,
      returnUrl,
      expiredTime,
    } = req.body;

    // Validate required fields
    if (!api_key || !private_key || !merchant_code) {
      return res.status(400).json({
        success: false,
        message: 'Missing Tripay credentials',
      });
    }

    // Generate signature
    const signatureString = `${merchant_code}${merchantRef}${amount}`;
    const signature = crypto
      .createHmac('sha256', private_key)
      .update(signatureString)
      .digest('hex');

    // Prepare Tripay request
    const tripayBaseUrl = mode === 'production'
      ? 'https://tripay.co.id/api'
      : 'https://tripay.co.id/api-sandbox';

    const tripayRequest = {
      method: paymentMethod,
      merchant_ref: merchantRef,
      amount: amount,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone || '',
      order_items: orderItems,
      callback_url: callbackUrl,
      return_url: returnUrl,
      expired_time: expiredTime,
      signature: signature,
    };

    console.log('🚀 Proxying request to Tripay:', tripayBaseUrl);

    // Call Tripay API
    const tripayResponse = await axios.post(
      `${tripayBaseUrl}/transaction/create`,
      tripayRequest,
      {
        headers: {
          'Authorization': `Bearer ${api_key}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Tripay response:', tripayResponse.data.success);

    return res.json(tripayResponse.data);
  } catch (error) {
    console.error('❌ Proxy error:', error.message);
    
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Tripay Proxy Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});
