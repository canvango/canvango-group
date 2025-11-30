/**
 * Test Tripay Callback Locally
 * 
 * Usage:
 * node test-tripay-callback-local.js
 */

const crypto = require('crypto');

// Configuration
const CALLBACK_URL = 'http://localhost:5173/api/tripay-callback';
const PRIVATE_KEY = 'Fz27s-v8gGt-jDE8e-04Tbw-de1vi'; // Production key

// Sample callback data from Tripay
const callbackData = {
  reference: 'DEV-T47159123456789',
  merchant_ref: 'TXN-1732950000000-abc123',
  payment_method: 'QRIS',
  payment_method_code: 'QRISOP',
  total_amount: 50000,
  fee_merchant: 500,
  fee_customer: 0,
  total_fee: 500,
  amount_received: 49500,
  status: 'PAID',
  paid_at: Math.floor(Date.now() / 1000),
};

// Convert to JSON string
const rawBody = JSON.stringify(callbackData);

// Calculate signature
const signature = crypto
  .createHmac('sha256', PRIVATE_KEY)
  .update(rawBody)
  .digest('hex');

console.log('=== Testing Tripay Callback ===');
console.log('URL:', CALLBACK_URL);
console.log('Merchant Ref:', callbackData.merchant_ref);
console.log('Status:', callbackData.status);
console.log('Signature:', signature);
console.log('');

// Send POST request
fetch(CALLBACK_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Callback-Signature': signature,
  },
  body: rawBody,
})
  .then(async (response) => {
    console.log('Response Status:', response.status);
    const data = await response.json();
    console.log('Response Body:', JSON.stringify(data, null, 2));
    
    if (response.status === 200 && data.success) {
      console.log('\n✅ Callback test PASSED');
    } else {
      console.log('\n❌ Callback test FAILED');
    }
  })
  .catch((error) => {
    console.error('❌ Request failed:', error.message);
  });
