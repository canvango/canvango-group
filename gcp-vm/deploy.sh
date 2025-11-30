#!/bin/bash

# Tripay Proxy - Quick Deployment Script
# Run this on GCP VM to deploy/update the server

set -e  # Exit on error

echo "================================="
echo "🚀 Tripay Proxy Deployment"
echo "================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running on GCP VM
if [ ! -d ~/tripay-proxy ]; then
  echo -e "${YELLOW}Creating project directory...${NC}"
  mkdir -p ~/tripay-proxy
fi

cd ~/tripay-proxy

# Backup existing files
if [ -f server.js ]; then
  BACKUP_FILE="server.js.backup.$(date +%Y%m%d_%H%M%S)"
  echo -e "${YELLOW}Backing up existing server.js to $BACKUP_FILE${NC}"
  cp server.js "$BACKUP_FILE"
fi

# Create server.js
echo -e "${YELLOW}Creating server.js...${NC}"
cat > server.js << 'ENDOFFILE'
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

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

const TRIPAY_API_KEY = process.env.TRIPAY_API_KEY;
const TRIPAY_PRIVATE_KEY = process.env.TRIPAY_PRIVATE_KEY;
const TRIPAY_MERCHANT_CODE = process.env.TRIPAY_MERCHANT_CODE;
const IS_PRODUCTION = process.env.IS_PRODUCTION === 'true';

const TRIPAY_BASE_URL = IS_PRODUCTION
  ? 'https://tripay.co.id/api'
  : 'https://tripay.co.id/api-sandbox';

const SUPABASE_EDGE_FUNCTION_URL = 'https://gpittnsfzgkdbqnccncn.supabase.co/functions/v1/tripay-callback';

function generateSignature(merchantRef, amount) {
  const crypto = require('crypto');
  const data = TRIPAY_MERCHANT_CODE + merchantRef + amount;
  return crypto.createHmac('sha256', TRIPAY_PRIVATE_KEY).update(data).digest('hex');
}

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

app.get('/payment-channels', async (req, res) => {
  try {
    console.log('📥 Payment channels request');
    const response = await axios.get(`${TRIPAY_BASE_URL}/merchant/payment-channel`, {
      headers: { 'Authorization': `Bearer ${TRIPAY_API_KEY}` }
    });
    console.log('✅ Payment channels fetched:', response.data.data?.length || 0, 'channels');
    res.json(response.data);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || 'Failed to fetch payment channels'
    });
  }
});

app.post('/create-transaction', async (req, res) => {
  try {
    const { method, merchant_ref, amount, customer_name, customer_email, customer_phone, order_items, return_url, expired_time } = req.body;
    console.log('📥 Create transaction:', { method, merchant_ref, amount });
    const signature = generateSignature(merchant_ref, amount);
    const payload = { method, merchant_ref, amount, customer_name, customer_email, customer_phone, order_items, return_url, expired_time, signature };
    const response = await axios.post(`${TRIPAY_BASE_URL}/transaction/create`, payload, {
      headers: { 'Authorization': `Bearer ${TRIPAY_API_KEY}`, 'Content-Type': 'application/json' }
    });
    console.log('✅ Transaction created:', response.data.data?.reference);
    res.json(response.data);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || 'Failed to create transaction'
    });
  }
});

app.get('/transaction-detail/:reference', async (req, res) => {
  try {
    const { reference } = req.params;
    console.log('📥 Transaction detail:', reference);
    const response = await axios.get(`${TRIPAY_BASE_URL}/transaction/detail?reference=${reference}`, {
      headers: { 'Authorization': `Bearer ${TRIPAY_API_KEY}` }
    });
    console.log('✅ Transaction detail fetched');
    res.json(response.data);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || 'Failed to fetch transaction detail'
    });
  }
});

app.post('/tripay-callback', async (req, res) => {
  try {
    console.log('=== TRIPAY CALLBACK RECEIVED ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('IP:', req.ip || req.connection.remoteAddress);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));
    
    const signature = req.headers['x-callback-signature'] || req.headers['X-Callback-Signature'];
    if (!signature) {
      console.error('❌ Missing signature');
      return res.status(401).json({ success: false, message: 'Missing signature' });
    }
    
    console.log('Signature:', signature);
    const rawBody = JSON.stringify(req.body);
    console.log('📤 Forwarding to Supabase...');
    
    const response = await axios.post(SUPABASE_EDGE_FUNCTION_URL, rawBody, {
      headers: { 'Content-Type': 'application/json', 'X-Callback-Signature': signature },
      validateStatus: () => true
    });
    
    console.log('📥 Response:', response.status, JSON.stringify(response.data, null, 2));
    console.log('=================================');
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('=================================');
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('=================================');
  console.log('🚀 Tripay Proxy Server Started');
  console.log('=================================');
  console.log('Port:', PORT);
  console.log('Mode:', IS_PRODUCTION ? 'PRODUCTION' : 'SANDBOX');
  console.log('Tripay API:', TRIPAY_BASE_URL);
  console.log('=================================');
});
ENDOFFILE

echo -e "${GREEN}✅ server.js created${NC}"

# Check .env file
if [ ! -f .env ]; then
  echo -e "${RED}❌ .env file not found!${NC}"
  echo -e "${YELLOW}Please create .env file with your Tripay credentials${NC}"
  echo ""
  echo "Example:"
  echo "PORT=3000"
  echo "TRIPAY_API_KEY=DEV-your-api-key"
  echo "TRIPAY_PRIVATE_KEY=your-private-key"
  echo "TRIPAY_MERCHANT_CODE=T0000"
  echo "IS_PRODUCTION=false"
  echo ""
  exit 1
fi

echo -e "${GREEN}✅ .env file found${NC}"

# Install dependencies
if [ ! -d node_modules ]; then
  echo -e "${YELLOW}Installing dependencies...${NC}"
  npm install express cors axios dotenv
else
  echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi

# Stop PM2 if running
if pm2 list | grep -q "tripay-proxy"; then
  echo -e "${YELLOW}Stopping existing PM2 process...${NC}"
  pm2 stop tripay-proxy
  pm2 delete tripay-proxy
fi

# Start with PM2
echo -e "${YELLOW}Starting server with PM2...${NC}"
pm2 start server.js --name tripay-proxy

# Save PM2 configuration
pm2 save

echo ""
echo "================================="
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo "================================="
echo ""
echo "Server Status:"
pm2 status

echo ""
echo "View logs:"
echo "  pm2 logs tripay-proxy"
echo ""
echo "Test endpoints:"
echo "  curl http://localhost:3000/"
echo "  curl http://34.182.126.200:3000/"
echo ""
echo "Callback URL for Tripay:"
echo "  http://34.182.126.200:3000/tripay-callback"
echo ""
echo "================================="
