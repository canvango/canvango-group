# 🚀 Deploy Tripay Callback to GCP VM

## 📋 Prerequisites

- ✅ GCP VM running (IP: 34.182.126.200)
- ✅ SSH access to VM
- ✅ Node.js installed on VM
- ✅ PM2 installed on VM
- ✅ Tripay credentials ready

---

## 🔧 Deployment Steps

### Step 1: Connect to GCP VM

**Option A: Browser SSH (Easiest)**
1. Go to GCP Console: https://console.cloud.google.com
2. Navigate to: Compute Engine → VM instances
3. Find: `tripay-proxy2`
4. Click: **SSH** button

**Option B: Local Terminal**
```bash
gcloud compute ssh tripay-proxy2 --zone=us-west1-a
```

---

### Step 2: Navigate to Project Directory

```bash
cd ~/tripay-proxy
```

If directory doesn't exist:
```bash
mkdir -p ~/tripay-proxy
cd ~/tripay-proxy
```

---

### Step 3: Backup Current Files (if exists)

```bash
# Backup current server.js
if [ -f server.js ]; then
  cp server.js server.js.backup.$(date +%Y%m%d_%H%M%S)
  echo "✅ Backup created"
fi
```

---

### Step 4: Create New server.js

```bash
cat > server.js << 'ENDOFFILE'
/**
 * Tripay Proxy Server for GCP VM
 * IP: 34.182.126.200 (whitelisted in Tripay)
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
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

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

// Helper: Generate signature
function generateSignature(merchantRef, amount) {
  const crypto = require('crypto');
  const data = TRIPAY_MERCHANT_CODE + merchantRef + amount;
  return crypto
    .createHmac('sha256', TRIPAY_PRIVATE_KEY)
    .update(data)
    .digest('hex');
}

// Health check
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

// Get payment channels
app.get('/payment-channels', async (req, res) => {
  try {
    console.log('📥 Payment channels request');
    const response = await axios.get(`${TRIPAY_BASE_URL}/merchant/payment-channel`, {
      headers: { 'Authorization': `Bearer ${TRIPAY_API_KEY}` }
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

// Create transaction
app.post('/create-transaction', async (req, res) => {
  try {
    const {
      method, merchant_ref, amount, customer_name, customer_email,
      customer_phone, order_items, return_url, expired_time
    } = req.body;

    console.log('📥 Create transaction:', { method, merchant_ref, amount });
    const signature = generateSignature(merchant_ref, amount);

    const payload = {
      method, merchant_ref, amount, customer_name, customer_email,
      customer_phone, order_items, return_url, expired_time, signature
    };

    const response = await axios.post(`${TRIPAY_BASE_URL}/transaction/create`, payload, {
      headers: {
        'Authorization': `Bearer ${TRIPAY_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

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

// Get transaction detail
app.get('/transaction-detail/:reference', async (req, res) => {
  try {
    const { reference } = req.params;
    console.log('📥 Transaction detail request:', reference);
    
    const response = await axios.get(
      `${TRIPAY_BASE_URL}/transaction/detail?reference=${reference}`,
      { headers: { 'Authorization': `Bearer ${TRIPAY_API_KEY}` } }
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

// TRIPAY CALLBACK HANDLER
app.post('/tripay-callback', async (req, res) => {
  try {
    console.log('=== TRIPAY CALLBACK RECEIVED ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('IP:', req.ip || req.connection.remoteAddress);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));
    
    const signature = req.headers['x-callback-signature'] || req.headers['X-Callback-Signature'];
    
    if (!signature) {
      console.error('❌ Missing X-Callback-Signature header');
      return res.status(401).json({ success: false, message: 'Missing signature' });
    }
    
    console.log('Signature:', signature);
    const rawBody = JSON.stringify(req.body);
    console.log('Raw body length:', rawBody.length);
    
    console.log('📤 Forwarding to Supabase Edge Function...');
    console.log('URL:', SUPABASE_EDGE_FUNCTION_URL);
    
    const response = await axios.post(SUPABASE_EDGE_FUNCTION_URL, rawBody, {
      headers: {
        'Content-Type': 'application/json',
        'X-Callback-Signature': signature,
      },
      validateStatus: () => true
    });

    console.log('📥 Edge Function response:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    console.log('=================================');
    
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

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// Start server
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
ENDOFFILE

echo "✅ server.js created"
```

---

### Step 5: Verify .env File

```bash
cat .env
```

**Should contain:**
```env
PORT=3000
TRIPAY_API_KEY=DEV-V745CsasrrsQ4BslYS5dzwbJZ6wLudy5joxBGq1G
TRIPAY_PRIVATE_KEY=BAo71-gUqRM-IahAp-Gt8AM-IS7Iq
TRIPAY_MERCHANT_CODE=T47116
IS_PRODUCTION=false
```

If not exists or incorrect, create/update:
```bash
nano .env
```

Paste the correct values, then save (Ctrl+O, Enter, Ctrl+X).

---

### Step 6: Install/Update Dependencies

```bash
# Check if package.json exists
if [ ! -f package.json ]; then
  echo "Creating package.json..."
  npm init -y
  npm install express cors axios dotenv
else
  echo "Updating dependencies..."
  npm install
fi
```

---

### Step 7: Test Server Locally

```bash
# Test run (Ctrl+C to stop)
node server.js
```

**Expected output:**
```
=================================
🚀 Tripay Proxy Server Started
=================================
Port: 3000
Mode: SANDBOX
...
=================================
```

**Test in another terminal:**
```bash
curl http://localhost:3000/
```

**Expected response:**
```json
{
  "status": "ok",
  "message": "Tripay Proxy Server",
  ...
}
```

If working, press **Ctrl+C** to stop.

---

### Step 8: Restart with PM2

```bash
# Stop current PM2 process (if running)
pm2 stop tripay-proxy

# Delete old process
pm2 delete tripay-proxy

# Start new process
pm2 start server.js --name tripay-proxy

# Save PM2 configuration
pm2 save

# Check status
pm2 status
```

**Expected output:**
```
┌─────┬──────────────┬─────────┬─────────┬──────────┐
│ id  │ name         │ status  │ restart │ uptime   │
├─────┼──────────────┼─────────┼─────────┼──────────┤
│ 0   │ tripay-proxy │ online  │ 0       │ 0s       │
└─────┴──────────────┴─────────┴─────────┴──────────┘
```

---

### Step 9: View Logs

```bash
# Real-time logs
pm2 logs tripay-proxy

# Last 50 lines
pm2 logs tripay-proxy --lines 50

# Clear logs
pm2 flush
```

---

### Step 10: Test Callback Endpoint

**From your local machine:**

```bash
curl -X POST http://34.182.126.200:3000/tripay-callback \
  -H "Content-Type: application/json" \
  -H "X-Callback-Signature: test" \
  -d '{"test":"data"}'
```

**Expected response:**
```json
{
  "success": false,
  "message": "Invalid signature"
}
```

This is correct! It means:
- ✅ Endpoint is accessible
- ✅ Forwarding to Supabase Edge Function
- ✅ Signature verification working
- ❌ Signature invalid (expected for test)

---

## ✅ Verification Checklist

- [ ] SSH to GCP VM successful
- [ ] server.js updated with callback endpoint
- [ ] .env file configured correctly
- [ ] Dependencies installed
- [ ] Server starts without errors
- [ ] PM2 process running (status: online)
- [ ] Health check returns 200 OK
- [ ] Callback endpoint returns 401 (signature invalid)
- [ ] Logs showing callback received

---

## 🧪 Testing

### Test 1: Health Check
```bash
curl http://34.182.126.200:3000/
```
**Expected:** Status OK with endpoints list

### Test 2: Payment Channels
```bash
curl http://34.182.126.200:3000/payment-channels
```
**Expected:** List of payment methods

### Test 3: Callback Endpoint
```bash
curl -X POST http://34.182.126.200:3000/tripay-callback \
  -H "Content-Type: application/json" \
  -H "X-Callback-Signature: test" \
  -d '{"test":"data"}'
```
**Expected:** 401 Unauthorized (signature invalid)

### Test 4: Check PM2 Logs
```bash
pm2 logs tripay-proxy --lines 20
```
**Expected:** See callback received logs

---

## 🔄 Next Steps

After deployment successful:

1. **Update Callback URL in Tripay Dashboard**
   - Login: https://tripay.co.id/member
   - Go to: Settings → Callback URL
   - Change to: `http://34.182.126.200:3000/tripay-callback`
   - Save

2. **Verify IP Whitelist**
   - Go to: Settings → IP Whitelist
   - Verify: `34.182.126.200` is listed
   - Status: Active

3. **Test with Tripay Callback Tester**
   - Go to: https://tripay.co.id/simulator/console/callback
   - Select a transaction
   - Click "Send Callback"
   - Expected: 200 OK (not 307!)

4. **Test Real Payment Flow**
   - Create topup transaction
   - Pay via QRIS
   - Wait for callback
   - Check transaction status updated
   - Check balance increased

---

## 🚨 Troubleshooting

### Issue: PM2 not found
```bash
sudo npm install -g pm2
```

### Issue: Port 3000 already in use
```bash
# Find process using port 3000
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>

# Or change port in .env
echo "PORT=3001" >> .env
```

### Issue: Cannot connect from outside
```bash
# Check firewall
sudo ufw status

# Allow port 3000
sudo ufw allow 3000

# Or check GCP firewall rules
```

### Issue: Callback not working
```bash
# Check logs
pm2 logs tripay-proxy --lines 100

# Check if signature header is received
# Look for: "X-Callback-Signature"

# Test directly
curl -X POST http://localhost:3000/tripay-callback \
  -H "Content-Type: application/json" \
  -H "X-Callback-Signature: test" \
  -d '{"test":"data"}' \
  -v
```

---

## 📊 Monitoring

### Check Server Status
```bash
pm2 status
```

### View Real-time Logs
```bash
pm2 logs tripay-proxy
```

### Check System Resources
```bash
# CPU and Memory
htop

# Disk usage
df -h

# Memory usage
free -h
```

### Restart Server
```bash
pm2 restart tripay-proxy
```

---

## 🎉 Deployment Complete!

Your GCP VM is now ready to receive Tripay callbacks!

**Callback URL:** `http://34.182.126.200:3000/tripay-callback`  
**IP:** 34.182.126.200 (whitelisted in Tripay)  
**Status:** ✅ Ready for production

---

**Last Updated:** 2025-11-30  
**Version:** 2.0.0 (with callback support)
