/**
 * Test Tripay Callback - Safe Version
 * Tests the fixed callback endpoint that handles missing env vars gracefully
 */

const crypto = require('crypto');

// Test data (Tripay test callback format)
const testPayload = {
  "amount_received": 190000,
  "is_closed_payment": 1,
  "status": "PAID",
  "paid_at": 1764523858,
  "note": "Test Callback"
};

const privateKey = 'DEV-your-private-key-here';

// Calculate signature
const rawBody = JSON.stringify(testPayload);
const signature = crypto
  .createHmac('sha256', privateKey)
  .update(rawBody)
  .digest('hex');

console.log('Testing Tripay Callback (Safe Version)');
console.log('Endpoint: https://canvango.com/api/tripay-callback');
console.log('Signature:', signature);
console.log('Payload:', testPayload);
console.log('\nSending request...\n');

fetch('https://canvango.com/api/tripay-callback', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Callback-Signature': signature,
    'X-Callback-Event': 'payment_status'
  },
  body: rawBody
})
.then(res => {
  console.log('Status:', res.status);
  return res.json();
})
.then(data => {
  console.log('Response:', JSON.stringify(data, null, 2));
  
  if (data.success) {
    console.log('\n✅ SUCCESS - Callback processed');
  } else {
    console.log('\n⚠️ Response received but success=false');
    console.log('This is OK if env vars are missing');
  }
})
.catch(err => {
  console.error('❌ ERROR:', err.message);
});
