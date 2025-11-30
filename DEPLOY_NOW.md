# 🚀 DEPLOY NOW - Step by Step

## 📋 Summary

**Callback URL di Tripay:** `https://canvango.com/api/tripay-callback` (TETAP INI!)

**Flow:**
```
Tripay → canvango.com (Vercel) → GCP VM (IP whitelisted) → Supabase
```

---

## Step 1: Deploy GCP VM (15 menit)

### 1.1 SSH ke GCP VM

**Buka:** https://console.cloud.google.com/compute/instances

**Klik SSH** pada VM `tripay-proxy2`

---

### 1.2 Copy-Paste Command Ini

```bash
cd ~/tripay-proxy && \
if [ -f server.js ]; then cp server.js server.js.backup.$(date +%Y%m%d_%H%M%S); fi && \
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

echo "✅ server.js created" && \
pm2 stop tripay-proxy 2>/dev/null || true && \
pm2 delete tripay-proxy 2>/dev/null || true && \
pm2 start server.js --name tripay-proxy && \
pm2 save && \
echo "" && \
echo "=================================" && \
echo "✅ GCP VM DEPLOYED!" && \
echo "=================================" && \
pm2 status && \
echo "" && \
echo "🧪 Testing callback endpoint..." && \
curl -X POST http://localhost:3000/tripay-callback -H "Content-Type: application/json" -H "X-Callback-Signature: test" -d '{"test":"data"}' && \
echo "" && \
echo ""
```

**Tunggu sampai selesai!**

---

### 1.3 Verify GCP VM

**Anda harus melihat:**
```
✅ server.js created
✅ GCP VM DEPLOYED!

┌─────┬──────────────┬─────────┐
│ id  │ name         │ status  │
├─────┼──────────────┼─────────┤
│ 0   │ tripay-proxy │ online  │
└─────┴──────────────┴─────────┘

{"success":false,"message":"Invalid signature"}
```

**Jika melihat output di atas:** ✅ GCP VM BERHASIL!

---

## Step 2: Deploy Vercel (5 menit)

### 2.1 Commit & Push

**Di terminal lokal Anda (bukan GCP VM):**

```bash
# Add changes
git add api/tripay-callback.ts

# Commit
git commit -m "fix: forward callback to GCP VM with whitelisted IP"

# Push
git push origin main
```

---

### 2.2 Wait for Vercel Deployment

**Buka:** https://vercel.com/dashboard

**Check:** Latest deployment status

**Tunggu sampai:** Status = "Ready" (2-3 menit)

---

## Step 3: Test End-to-End (5 menit)

### 3.1 Test Vercel Endpoint

```bash
curl -X POST https://canvango.com/api/tripay-callback \
  -H "Content-Type: application/json" \
  -H "X-Callback-Signature: test" \
  -d '{"test":"data"}'
```

**Expected:**
```json
{"success":false,"message":"Invalid signature"}
```

**Ini BENAR!** Artinya flow working, signature invalid karena test.

---

### 3.2 Check GCP VM Logs

**Di GCP VM terminal:**
```bash
pm2 logs tripay-proxy --lines 20
```

**Harus melihat:**
```
=== TRIPAY CALLBACK RECEIVED ===
Timestamp: 2025-11-30...
IP: ...
📤 Forwarding to Supabase...
📥 Response: 401 {"success":false,"message":"Invalid signature"}
=================================
```

**Jika melihat log di atas:** ✅ FLOW WORKING!

---

### 3.3 Test dengan Tripay Callback Tester

1. **Login:** https://tripay.co.id/member
2. **Go to:** Developer → Callback Tester
3. **Select** a transaction
4. **Click** "Send Callback"

**Expected:**
```
✅ Kode HTTP: 200 (OK)
✅ Status Koneksi: BERHASIL
✅ Status Callback: BERHASIL
```

**NOT:**
```
❌ Kode HTTP: 307
```

---

## ✅ Success Indicators

**Deployment berhasil jika:**

1. ✅ GCP VM status: online
2. ✅ Vercel deployment: Ready
3. ✅ Test curl returns: 401 (signature invalid, but flow OK)
4. ✅ GCP VM logs show: callback received
5. ✅ Tripay Callback Tester: 200 OK

---

## 🎯 Callback URL di Tripay Dashboard

**TETAP PAKAI INI:**
```
https://canvango.com/api/tripay-callback
```

**JANGAN DIUBAH!** Sudah benar.

---

## 📊 Architecture Summary

```
Tripay Server
    ↓
POST https://canvango.com/api/tripay-callback
    ↓
Vercel (api/tripay-callback.ts)
    ↓ Forward to
POST http://34.182.126.200:3000/tripay-callback
    ↓
GCP VM (IP: 34.182.126.200 - whitelisted)
    ↓ Forward to
POST https://gpittnsfzgkdbqnccncn.supabase.co/functions/v1/tripay-callback
    ↓
Supabase Edge Function
    ↓
Process callback
```

**Benefits:**
- ✅ Tripay requirement met (domain-based callback URL)
- ✅ IP whitelist working (GCP VM IP whitelisted)
- ✅ No 307 redirect
- ✅ Proper signature verification

---

## 🚨 Troubleshooting

### If GCP VM deployment fails:
```bash
pm2 logs tripay-proxy --lines 50
```

### If Vercel deployment fails:
- Check Vercel dashboard for errors
- Verify git push successful

### If callback still returns 307:
- Wait 5 minutes for cache
- Check Vercel logs
- Check GCP VM logs

---

## 🎉 After Success

**Monitor for 24 hours:**
```bash
# GCP VM logs
pm2 logs tripay-proxy

# Check real payment
# Create topup → Pay → Check callback received
```

---

**Ready? Start with Step 1!** 🚀

**Callback URL di Tripay:** `https://canvango.com/api/tripay-callback` (TETAP!)
