/**
 * Test script untuk Tripay Callback Handler
 * 
 * Usage:
 * node test-tripay-callback-vercel.js
 */

const crypto = require('crypto');

// Configuration
const CALLBACK_URL = 'https://canvango.com/api/tripay-callback';
const PRIVATE_KEY = process.env.VITE_TRIPAY_PRIVATE_KEY || 'your-private-key-here';

// Sample callback data (sesuai format Tripay)
const callbackData = {
  reference: 'TEST-' + Date.now(),
  merchant_ref: 'TRX-' + Date.now(),
  payment_method: 'QRIS (Customizable)',
  payment_method_code: 'QRISC',
  total_amount: 15000,
  fee_merchant: 500,
  fee_customer: 0,
  total_fee: 500,
  amount_received: 14500,
  status: 'PAID',
  paid_at: Math.floor(Date.now() / 1000),
};

// Generate signature
const rawBody = JSON.stringify(callbackData);
const signature = crypto
  .createHmac('sha256', PRIVATE_KEY)
  .update(rawBody)
  .digest('hex');

console.log('=== TESTING TRIPAY CALLBACK ===');
console.log('URL:', CALLBACK_URL);
console.log('Merchant Ref:', callbackData.merchant_ref);
console.log('Signature:', signature);
console.log('\nSending request...\n');

// Send POST request
fetch(CALLBACK_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Callback-Signature': signature,
    'X-Callback-Event': 'payment_status',
    'User-Agent': 'TriPay Payment/1.0 (+https://tripay.co.id/developer?tab=callback)',
  },
  body: rawBody,
})
  .then(async (response) => {
    console.log('=== RESPONSE ===');
    console.log('Status:', response.status, response.statusText);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log('\nBody:', text);
    
    try {
      const json = JSON.parse(text);
      console.log('\nParsed JSON:', JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('\nBody is not JSON');
    }
    
    // Check result
    if (response.status === 200) {
      console.log('\n✅ SUCCESS - HTTP 200 received');
    } else if (response.status === 307) {
      console.log('\n❌ FAILED - HTTP 307 redirect detected');
      console.log('Location:', response.headers.get('location'));
    } else {
      console.log('\n⚠️  WARNING - Unexpected status code');
    }
  })
  .catch((error) => {
    console.error('\n❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
  });
