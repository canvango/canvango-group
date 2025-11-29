# 🧪 Test Cloudflare Worker - Tripay Proxy

Quick testing guide untuk verify worker berfungsi dengan baik.

---

## 🎯 Test Scenarios

### ✅ Scenario 1: Payment Channels (GET)

**Test:** Fetch available payment methods

**Command:**
```bash
curl "http://localhost:8787/payment-channels?sandbox=true"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "code": "BRIVA",
      "name": "BRI Virtual Account",
      "group": "Virtual Account",
      "fee_merchant": {
        "flat": 0,
        "percent": 0
      },
      "fee_customer": {
        "flat": 4000,
        "percent": 0
      },
      "total_fee": {
        "flat": 4000,
        "percent": 0
      },
      "minimum_fee": 0,
      "maximum_fee": 0,
      "icon_url": "https://tripay.co.id/images/payment_icon/BRIVA.png",
      "active": true
    }
  ]
}
```

**Status Codes:**
- ✅ `200` - Success
- ❌ `403` - Origin not allowed (check ALLOWED_ORIGINS)
- ❌ `500` - Server error (check API credentials)

---

### ✅ Scenario 2: Create Transaction (POST)

**Test:** Create payment transaction

**Command:**
```bash
curl -X POST "http://localhost:8787/create-transaction" \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:5173" \
  -d '{
    "method": "BRIVA",
    "merchant_ref": "TEST-'$(date +%s)'",
    "amount": 50000,
    "customer_name": "Test User",
    "customer_email": "test@example.com",
    "customer_phone": "081234567890",
    "order_items": [
      {
        "name": "Top Up Balance",
        "price": 50000,
        "quantity": 1
      }
    ],
    "return_url": "http://localhost:5173/payment/success",
    "sandbox": true
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Transaction created",
  "data": {
    "reference": "T0000XXXXX",
    "merchant_ref": "TEST-1234567890",
    "payment_method": "BRIVA",
    "payment_name": "BRI Virtual Account",
    "customer_name": "Test User",
    "customer_email": "test@example.com",
    "amount": 50000,
    "fee_merchant": 0,
    "fee_customer": 4000,
    "total_fee": 4000,
    "amount_received": 50000,
    "pay_code": "88808123456789012",
    "pay_url": null,
    "checkout_url": "https://tripay.co.id/checkout/T0000XXXXX",
    "qr_url": null,
    "status": "UNPAID",
    "expired_time": 1234567890,
    "instructions": [...]
  }
}
```

**Status Codes:**
- ✅ `200` - Success
- ❌ `400` - Invalid request (check payload)
- ❌ `403` - Origin not allowed
- ❌ `422` - Validation error (check Tripay requirements)

---

### ✅ Scenario 3: Transaction Detail (GET)

**Test:** Get transaction status

**Command:**
```bash
curl "http://localhost:8787/transaction/T0000XXXXX?sandbox=true"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "reference": "T0000XXXXX",
    "merchant_ref": "TEST-1234567890",
    "payment_method": "BRIVA",
    "status": "UNPAID",
    "amount": 50000,
    "fee_merchant": 0,
    "fee_customer": 4000,
    "total_fee": 4000,
    "amount_received": 50000,
    "pay_code": "88808123456789012",
    "checkout_url": "https://tripay.co.id/checkout/T0000XXXXX",
    "expired_time": 1234567890
  }
}
```

---

### ✅ Scenario 4: CORS Preflight (OPTIONS)

**Test:** Verify CORS headers

**Command:**
```bash
curl -X OPTIONS "http://localhost:8787/payment-channels" \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: GET" \
  -v
```

**Expected Headers:**
```
< HTTP/1.1 200 OK
< Access-Control-Allow-Origin: http://localhost:5173
< Access-Control-Allow-Methods: GET, POST, OPTIONS
< Access-Control-Allow-Headers: Content-Type, Authorization
< Access-Control-Max-Age: 86400
```

---

### ✅ Scenario 5: Origin Validation

**Test:** Reject unauthorized origin

**Command:**
```bash
curl "http://localhost:8787/payment-channels?sandbox=true" \
  -H "Origin: https://evil-site.com"
```

**Expected Response:**
```json
{
  "error": "Origin not allowed"
}
```

**Status Code:** `403 Forbidden`

---

## 🖥️ Visual Testing (Browser)

### Method 1: Test UI

1. Start worker:
   ```bash
   cd cloudflare-worker
   npm run dev
   ```

2. Open `cloudflare-worker/test-worker.html` di browser

3. Set Worker URL: `http://localhost:8787`

4. Select test type:
   - Get Payment Channels
   - Create Transaction

5. Check "Use Sandbox Mode"

6. Click "Run Test"

7. Verify response

### Method 2: Browser Console

1. Open browser console (F12)

2. Test payment channels:
   ```javascript
   fetch('http://localhost:8787/payment-channels?sandbox=true')
     .then(r => r.json())
     .then(console.log)
   ```

3. Test create transaction:
   ```javascript
   fetch('http://localhost:8787/create-transaction', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       method: 'BRIVA',
       merchant_ref: 'TEST-' + Date.now(),
       amount: 50000,
       customer_name: 'Test User',
       customer_email: 'test@example.com',
       customer_phone: '081234567890',
       order_items: [{ name: 'Test', price: 50000, quantity: 1 }],
       return_url: 'http://localhost:5173/success',
       sandbox: true
     })
   })
   .then(r => r.json())
   .then(console.log)
   ```

---

## 🔍 Debugging

### View Worker Logs

```bash
# Terminal 1: Start worker
npm run dev

# Terminal 2: Watch logs
wrangler tail --local
```

### Common Issues

#### 1. "Origin not allowed"

**Cause:** Domain tidak ada di `ALLOWED_ORIGINS`

**Fix:** Edit `.dev.vars`:
```env
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
```

#### 2. "Signature invalid"

**Cause:** Credentials salah

**Fix:** Verify `.dev.vars`:
```env
TRIPAY_API_KEY=DEV-xxxxxxxxxxxxx
TRIPAY_PRIVATE_KEY=xxxxx-xxxxx-xxxxx-xxxxx-xxxxx
TRIPAY_MERCHANT_CODE=T0000
```

#### 3. "Route not found"

**Cause:** Endpoint salah

**Fix:** Check available endpoints:
- `GET /payment-channels`
- `POST /create-transaction`
- `GET /transaction/:reference`

#### 4. CORS error di browser

**Cause:** Missing Origin header

**Fix:** Add Origin header:
```javascript
fetch('http://localhost:8787/payment-channels', {
  headers: { 'Origin': 'http://localhost:5173' }
})
```

---

## ✅ Test Checklist

Before deploying to production:

- [ ] Payment channels API returns data
- [ ] Create transaction returns valid response
- [ ] Transaction detail API works
- [ ] CORS headers present
- [ ] Origin validation working
- [ ] Signature generation correct
- [ ] Error handling works
- [ ] Sandbox mode working
- [ ] Production mode working (if credentials available)

---

## 📊 Performance Testing

### Load Test (Optional)

```bash
# Install Apache Bench
# Windows: Download from https://www.apachelounge.com/download/

# Test 100 requests, 10 concurrent
ab -n 100 -c 10 "http://localhost:8787/payment-channels?sandbox=true"
```

**Expected:**
- Requests per second: > 100
- Time per request: < 100ms
- Failed requests: 0

---

## 🎯 Production Testing

After deploying to Cloudflare:

```bash
# Replace with your worker URL
WORKER_URL="https://tripay-proxy-production.your-subdomain.workers.dev"

# Test payment channels
curl "$WORKER_URL/payment-channels?sandbox=false"

# Test with production credentials
curl -X POST "$WORKER_URL/create-transaction" \
  -H "Content-Type: application/json" \
  -H "Origin: https://yourdomain.com" \
  -d '{
    "method": "BRIVA",
    "merchant_ref": "PROD-TEST-'$(date +%s)'",
    "amount": 10000,
    "customer_name": "Production Test",
    "customer_email": "test@yourdomain.com",
    "customer_phone": "081234567890",
    "order_items": [{"name": "Test", "price": 10000, "quantity": 1}],
    "return_url": "https://yourdomain.com/success",
    "sandbox": false
  }'
```

---

## 📝 Test Report Template

```markdown
## Test Results

**Date:** 2025-11-29
**Environment:** Local / Production
**Worker URL:** http://localhost:8787

### Payment Channels API
- Status: ✅ Pass / ❌ Fail
- Response Time: XXms
- Notes: 

### Create Transaction API
- Status: ✅ Pass / ❌ Fail
- Response Time: XXms
- Transaction Reference: T0000XXXXX
- Notes:

### Transaction Detail API
- Status: ✅ Pass / ❌ Fail
- Response Time: XXms
- Notes:

### CORS
- Status: ✅ Pass / ❌ Fail
- Headers Present: Yes / No
- Notes:

### Origin Validation
- Status: ✅ Pass / ❌ Fail
- Unauthorized Blocked: Yes / No
- Notes:

### Overall
- All Tests Passed: ✅ Yes / ❌ No
- Ready for Production: ✅ Yes / ❌ No
```

---

**Status:** Ready for testing  
**Last Updated:** 2025-11-29
