#!/bin/bash

# Tripay Callback Testing Script
# Usage: bash test-callback-curl.sh [local|production]

MODE=${1:-production}

if [ "$MODE" = "local" ]; then
  URL="http://localhost:5173/api/tripay-callback"
  echo "🧪 Testing LOCAL callback endpoint"
else
  URL="https://canvango.com/api/tripay-callback"
  echo "🚀 Testing PRODUCTION callback endpoint"
fi

echo "URL: $URL"
echo ""

# Test 1: GET request (should return 200 with error)
echo "=== Test 1: GET Request (Should fail gracefully) ==="
curl -i -X GET "$URL"
echo ""
echo ""

# Test 2: POST without signature (should return 200 with error)
echo "=== Test 2: POST without signature ==="
curl -i -X POST "$URL" \
  -H "Content-Type: application/json" \
  -d '{"test":"data"}'
echo ""
echo ""

# Test 3: POST with invalid signature (should return 200 with error)
echo "=== Test 3: POST with invalid signature ==="
curl -i -X POST "$URL" \
  -H "Content-Type: application/json" \
  -H "X-Callback-Signature: invalid_signature_123" \
  -d '{"merchant_ref":"TEST-123","status":"PAID"}'
echo ""
echo ""

# Test 4: OPTIONS request (CORS preflight)
echo "=== Test 4: OPTIONS Request (CORS) ==="
curl -i -X OPTIONS "$URL" \
  -H "Origin: https://tripay.co.id" \
  -H "Access-Control-Request-Method: POST"
echo ""
echo ""

echo "✅ All tests completed!"
echo ""
echo "Expected results:"
echo "  Test 1: HTTP 200 + Method not allowed"
echo "  Test 2: HTTP 200 + Missing signature"
echo "  Test 3: HTTP 200 + Invalid signature"
echo "  Test 4: HTTP 200 + CORS headers"
