#!/bin/bash
# ========================================
# TRIPAY CALLBACK FIX - DEPLOYMENT COMMANDS
# Copy-paste semua commands ini ke GCP VM terminal
# ========================================

echo "🚀 Starting Tripay Callback Deployment..."
echo ""

# Navigate to project directory
cd ~/tripay-proxy || { echo "❌ Directory not found"; exit 1; }

# Backup existing server.js
if [ -f server.js ]; then
  BACKUP_FILE="server.js.backup.$(date +%Y%m%d_%H%M%S)"
  cp server.js "$BACKUP_FILE"
  echo "✅ Backup created: $BACKUP_FILE"
fi

# Create new server.js with callback support
echo "📝 Creating new server.js..."
cat > server.js << 'ENDOFFILE'
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = ['https://canvango.com', 'https://www.canvango.com', 'https://canvango-group.vercel.app', 'http://localhost:5173', 'http://localhost:3000'];

app.use(cors({ origin: function(origin, callback) { if (!origin) return callback(null, true); if (allowedOrigins.includes(origin)) { callback(null, true); } else { callback(new Error('Not allowed by CORS')); } }, credentials: true }));
app.use(express.json());

const TRIPAY_API_KEY = process.env.TRIPAY_API_KEY;
const TRIPAY_PRIVATE_KEY = process.env.TRIPAY_PRIVATE_KEY;
const TRIPAY_MERCHANT_CODE = process.env.TRIPAY_MERCHANT_CODE;
const IS_PRODUCTION = process.env.IS_PRODUCTION === 'true';
const TRIPAY_BASE_URL = IS_PRODUCTION ? 'https://tripay.co.id/api' : 'https://tripay.co.id/api-sandbox';
const SUPABASE_EDGE_FUNCTION_URL = 'https://gpittnsfzgkdbqnccncn.supabase.co/functions/v1/tripay-callback';

function generateSignature(merchantRef, amount) { const crypto = require('crypto'); const data = TRIPAY_MERCHANT_CODE + merchantRef + amount; return crypto.createHmac('sha256', TRIPAY_PRIVATE_KEY).update(data).digest('hex'); }

app.get('/', (req, res) => { res.json({ status: 'ok', message: 'Tripay Proxy Server', mode: IS_PRODUCTION ? 'production' : 'sandbox', timestamp: new Date().toISOString(), endpoints: { health: 'GET /', paymentChannels: 'GET /payment-channels', createTransaction: 'POST /create-transaction', transactionDetail: 'GET /transaction-detail/:reference', callback: 'POST /tripay-callback' } }); });

app.get('/payment-channels', async (req, res) => { try { console.log('📥 Payment channels request'); const response = await axios.get(`${TRIPAY_BASE_URL}/merchant/payment-channel`, { headers: { 'Authorization': `Bearer ${TRIPAY_API_KEY}` } }); console.log('✅ Payment channels fetched:', response.data.data?.length || 0, 'channels'); res.json(response.data); } catch (error) { console.error('❌ Error:', error.response?.data || error.message); res.status(error.response?.status || 500).json({ success: false, message: error.response?.data?.message || 'Failed to fetch payment channels' }); } });

app.post('/create-transaction', async (req, res) => { try { const { method, merchant_ref, amount, customer_name, customer_email, customer_phone, order_items, return_url, expired_time } = req.body; console.log('📥 Create transaction:', { method, merchant_ref, amount }); const signature = generateSignature(merchant_ref, amount); const payload = { method, merchant_ref, amount, customer_name, customer_email, customer_phone, order_items, return_url, expired_time, signature }; const response = await axios.post(`${TRIPAY_BASE_URL}/transaction/create`, payload, { headers: { 'Authorization': `Bearer ${TRIPAY_API_KEY}`, 'Content-Type': 'application/json' } }); console.log('✅ Transaction created:', response.data.data?.reference); res.json(response.data); } catch (error) { console.error('❌ Error:', error.response?.data || error.message); res.status(error.response?.status || 500).json({ success: false, message: error.response?.data?.message || 'Failed to create transaction' }); } });

app.get('/transaction-detail/:reference', async (req, res) => { try { const { reference } = req.params; console.log('📥 Transaction detail:', reference); const response = await axios.get(`${TRIPAY_BASE_URL}/transaction/detail?reference=${reference}`, { headers: { 'Authorization': `Bearer ${TRIPAY_API_KEY}` } }); console.log('✅ Transaction detail fetched'); res.json(response.data); } catch (error) { console.error('❌ Error:', error.response?.data || error.message); res.status(error.response?.status || 500).json({ success: false, message: error.response?.data?.message || 'Failed to fetch transaction detail' }); } });

app.post('/tripay-callback', async (req, res) => { try { console.log('=== TRIPAY CALLBACK RECEIVED ==='); console.log('Timestamp:', new Date().toISOString()); console.log('IP:', req.ip || req.connection.remoteAddress); console.log('Headers:', JSON.stringify(req.headers, null, 2)); console.log('Body:', JSON.stringify(req.body, null, 2)); const signature = req.headers['x-callback-signature'] || req.headers['X-Callback-Signature']; if (!signature) { console.error('❌ Missing signature'); return res.status(401).json({ success: false, message: 'Missing signature' }); } console.log('Signature:', signature); const rawBody = JSON.stringify(req.body); console.log('📤 Forwarding to Supabase...'); const response = await axios.post(SUPABASE_EDGE_FUNCTION_URL, rawBody, { headers: { 'Content-Type': 'application/json', 'X-Callback-Signature': signature }, validateStatus: () => true }); console.log('📥 Response:', response.status, JSON.stringify(response.data, null, 2)); console.log('================================='); return res.status(response.status).json(response.data); } catch (error) { console.error('❌ Error:', error.message); console.error('================================='); return res.status(500).json({ success: false, message: 'Internal server error', error: error.message }); } });

app.use((err, req, res, next) => { console.error('Unhandled error:', err); res.status(500).json({ success: false, message: 'Internal server error' }); });

app.listen(PORT, '0.0.0.0', () => { console.log('================================='); console.log('🚀 Tripay Proxy Server Started'); console.log('================================='); console.log('Port:', PORT); console.log('Mode:', IS_PRODUCTION ? 'PRODUCTION' : 'SANDBOX'); console.log('Tripay API:', TRIPAY_BASE_URL); console.log('Callback endpoint: POST /tripay-callback'); console.log('================================='); });
ENDOFFILE

echo "✅ server.js created with callback support"

# Verify .env file
if [ ! -f .env ]; then
  echo "❌ .env file not found!"
  echo "Please create .env file first"
  exit 1
fi

echo "✅ .env file found"

# Install dependencies if needed
if [ ! -d node_modules ]; then
  echo "📦 Installing dependencies..."
  npm install express cors axios dotenv
else
  echo "✅ Dependencies already installed"
fi

# Stop and delete old PM2 process
echo "🔄 Restarting PM2 process..."
pm2 stop tripay-proxy 2>/dev/null || true
pm2 delete tripay-proxy 2>/dev/null || true

# Start with PM2
pm2 start server.js --name tripay-proxy

# Save PM2 configuration
pm2 save

echo ""
echo "================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo "================================="
echo ""

# Show status
pm2 status

echo ""
echo "📊 Server Information:"
echo "  URL: http://34.182.126.200:3000"
echo "  Callback: http://34.182.126.200:3000/tripay-callback"
echo ""
echo "🧪 Test Commands:"
echo "  Health check:"
echo "    curl http://localhost:3000/"
echo ""
echo "  Test callback:"
echo "    curl -X POST http://localhost:3000/tripay-callback -H 'Content-Type: application/json' -H 'X-Callback-Signature: test' -d '{\"test\":\"data\"}'"
echo ""
echo "📝 View Logs:"
echo "  pm2 logs tripay-proxy"
echo ""
echo "================================="
echo "🎯 NEXT STEP:"
echo "Update callback URL in Tripay Dashboard to:"
echo "  http://34.182.126.200:3000/tripay-callback"
echo "================================="
