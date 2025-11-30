/**
 * Test TriPay Callback Signature Verification
 * 
 * This script tests if the Edge Function correctly verifies TriPay callback signatures
 * 
 * Usage:
 *   node test-tripay-callback.js
 */

const crypto = require('crypto');

// Configuration
const EDGE_FUNCTION_URL = 'https://gpittnsfzgkdbqnccncn.supabase.co/functions/v1/tripay-callback';
const TRIPAY_PRIVATE_KEY = 'BqOm1-ItF0o-LNlRZ-YhPK8-PZjNz'; // Sandbox key

// Sample callback data (from TriPay documentation)
const callbackData = {
  reference: 'DEV-T47159287512345ABCDE',
  merchant_ref: 'TXN-1234567890-test',
  payment_method: 'QRIS',
  payment_method_code: 'QRISOP',
  payment_name: 'QRIS (Open Payment)',
  customer_name: 'Test User',
  customer_email: 'test@example.com',
  customer_phone: '081234567890',
  callback_virtual_account_id: '',
  owner_name: 'Test User',
  amount: 10000,
  fee_merchant: 300,
  fee_customer: 0,
  total_fee: 300,
  amount_received: 9700,
  pay_code: '',
  pay_url: '',
  checkout_url: '',
  order_items: [],
  status: 'PAID',
  paid_at: Math.floor(Date.now() / 1000),
  note: 'Test callback'
};

// Generate signature (same as TriPay)
function generateSignature(data, privateKey) {
  const jsonString = JSON.stringify(data);
  const hmac = crypto.createHmac('sha256', privateKey);
  hmac.update(jsonString);
  return hmac.digest('hex');
}

// Test callback
async function testCallback() {
  console.log('🧪 Testing TriPay Callback Signature Verification\n');
  
  // Generate signature
  const signature = generateSignature(callbackData, TRIPAY_PRIVATE_KEY);
  console.log('📝 Test Data:');
  console.log('  Reference:', callbackData.reference);
  console.log('  Merchant Ref:', callbackData.merchant_ref);
  console.log('  Amount:', callbackData.amount);
  console.log('  Status:', callbackData.status);
  console.log('\n🔐 Generated Signature:', signature);
  
  // Send request
  console.log('\n📤 Sending callback to Edge Function...');
  console.log('  URL:', EDGE_FUNCTION_URL);
  
  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Callback-Signature': signature
      },
      body: JSON.stringify(callbackData)
    });
    
    const result = await response.json();
    
    console.log('\n📥 Response:');
    console.log('  Status:', response.status, response.statusText);
    console.log('  Body:', JSON.stringify(result, null, 2));
    
    if (response.status === 200 && result.success === true) {
      console.log('\n✅ TEST PASSED: Signature verification working correctly!');
    } else if (response.status === 404) {
      console.log('\n⚠️  TEST PARTIAL: Signature verified, but transaction not found in database');
      console.log('    This is expected if transaction doesn\'t exist yet');
    } else if (response.status === 401) {
      console.log('\n❌ TEST FAILED: Signature verification failed');
      console.log('    Check TRIPAY_PRIVATE_KEY in Edge Function secrets');
    } else {
      console.log('\n⚠️  TEST WARNING: Unexpected response');
    }
    
  } catch (error) {
    console.error('\n❌ TEST ERROR:', error.message);
  }
}

// Run test
console.log('═══════════════════════════════════════════════════════════');
console.log('  TriPay Callback Signature Verification Test');
console.log('═══════════════════════════════════════════════════════════\n');

testCallback().then(() => {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  Test Complete');
  console.log('═══════════════════════════════════════════════════════════\n');
});
