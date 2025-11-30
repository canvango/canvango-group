/**
 * Comprehensive Test Suite for Tripay Callback
 * Tests multiple scenarios to ensure handler works correctly
 * 
 * Usage:
 * set VITE_TRIPAY_PRIVATE_KEY=your-key
 * node test-tripay-callback-comprehensive.js
 */

const crypto = require('crypto');

const CALLBACK_URL = 'https://canvango.com/api/tripay-callback';
const PRIVATE_KEY = process.env.VITE_TRIPAY_PRIVATE_KEY || 'your-private-key-here';

// Test scenarios
const scenarios = [
  {
    name: 'Valid PAID Transaction',
    data: {
      reference: 'T' + Date.now() + 'ABCDE',
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
    },
    useValidSignature: true,
    expectedStatus: 200,
    expectedSuccess: true,
  },
  {
    name: 'Invalid Signature',
    data: {
      reference: 'T' + Date.now() + 'ABCDE',
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
    },
    useValidSignature: false,
    expectedStatus: 200,
    expectedSuccess: false,
  },
  {
    name: 'EXPIRED Transaction',
    data: {
      reference: 'T' + Date.now() + 'ABCDE',
      merchant_ref: 'TRX-' + Date.now(),
      payment_method: 'QRIS (Customizable)',
      payment_method_code: 'QRISC',
      total_amount: 15000,
      fee_merchant: 500,
      fee_customer: 0,
      total_fee: 500,
      amount_received: 0,
      status: 'EXPIRED',
      paid_at: null,
    },
    useValidSignature: true,
    expectedStatus: 200,
    expectedSuccess: true,
  },
  {
    name: 'Missing Signature Header',
    data: {
      reference: 'T' + Date.now() + 'ABCDE',
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
    },
    useValidSignature: null, // Don't send header
    expectedStatus: 200,
    expectedSuccess: false,
  },
];

// Generate signature
function generateSignature(data) {
  const rawBody = JSON.stringify(data);
  return crypto
    .createHmac('sha256', PRIVATE_KEY)
    .update(rawBody)
    .digest('hex');
}

// Run test
async function runTest(scenario) {
  console.log('\n' + '='.repeat(60));
  console.log(`TEST: ${scenario.name}`);
  console.log('='.repeat(60));
  
  const rawBody = JSON.stringify(scenario.data);
  const headers = {
    'Content-Type': 'application/json',
    'X-Callback-Event': 'payment_status',
    'User-Agent': 'TriPay Payment/1.0 (+https://tripay.co.id/developer?tab=callback)',
  };
  
  // Add signature header based on scenario
  if (scenario.useValidSignature === true) {
    headers['X-Callback-Signature'] = generateSignature(scenario.data);
    console.log('Signature: Valid (HMAC-SHA256)');
  } else if (scenario.useValidSignature === false) {
    headers['X-Callback-Signature'] = 'invalid-signature-12345';
    console.log('Signature: Invalid (dummy)');
  } else {
    console.log('Signature: Not sent');
  }
  
  console.log('Merchant Ref:', scenario.data.merchant_ref);
  console.log('Status:', scenario.data.status);
  console.log('\nSending request...');
  
  try {
    const response = await fetch(CALLBACK_URL, {
      method: 'POST',
      headers,
      body: rawBody,
    });
    
    const text = await response.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch (e) {
      json = null;
    }
    
    console.log('\n--- RESPONSE ---');
    console.log('Status:', response.status, response.statusText);
    console.log('Body:', text);
    
    // Verify expectations
    const statusMatch = response.status === scenario.expectedStatus;
    const successMatch = json && json.success === scenario.expectedSuccess;
    
    console.log('\n--- VERIFICATION ---');
    console.log('Expected Status:', scenario.expectedStatus, statusMatch ? '✅' : '❌');
    console.log('Expected Success:', scenario.expectedSuccess, successMatch ? '✅' : '❌');
    
    if (statusMatch && successMatch) {
      console.log('\n✅ TEST PASSED');
      return true;
    } else {
      console.log('\n❌ TEST FAILED');
      return false;
    }
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     TRIPAY CALLBACK COMPREHENSIVE TEST SUITE              ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('\nURL:', CALLBACK_URL);
  console.log('Private Key:', PRIVATE_KEY.substring(0, 10) + '...');
  console.log('Total Tests:', scenarios.length);
  
  const results = [];
  
  for (const scenario of scenarios) {
    const passed = await runTest(scenario);
    results.push({ name: scenario.name, passed });
    
    // Wait 1 second between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));
  
  results.forEach((result, index) => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${index + 1}. ${status} - ${result.name}`);
  });
  
  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  
  console.log('\n' + '='.repeat(60));
  console.log(`RESULT: ${passedCount}/${totalCount} tests passed`);
  console.log('='.repeat(60));
  
  if (passedCount === totalCount) {
    console.log('\n🎉 ALL TESTS PASSED! Callback handler is working correctly.');
  } else {
    console.log('\n⚠️  SOME TESTS FAILED. Check the output above for details.');
  }
}

// Run
runAllTests().catch(console.error);
