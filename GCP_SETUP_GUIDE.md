# 🚀 Google Cloud Platform Setup Guide - Tripay Proxy

## 📋 Overview

Guide setup GCP Free Tier untuk Tripay proxy - **lebih mudah dari Oracle Cloud**.

**Estimasi Waktu:** 30-40 menit  
**Biaya:** Rp 0 (Gratis selamanya)  
**Skill Required:** Basic (copy-paste commands)

---

## ✅ Prerequisites Checklist

- [ ] Email aktif (Gmail recommended)
- [ ] Kartu kredit/debit (untuk verifikasi, tidak akan dicharge)
- [ ] Koneksi internet stabil
- [ ] SSH client (Windows: Git Bash/PowerShell, Mac/Linux: Terminal)

---

## 📚 Table of Contents

1. [Phase 1: Daftar GCP Account](#phase-1-daftar-gcp-account)
2. [Phase 2: Create VM Instance](#phase-2-create-vm-instance)
3. [Phase 3: Configure Firewall](#phase-3-configure-firewall)
4. [Phase 4: Deploy Proxy Server](#phase-4-deploy-proxy-server)
5. [Phase 5: Update Frontend & Database](#phase-5-update-frontend--database)
6. [Phase 6: Whitelist IP di Tripay](#phase-6-whitelist-ip-di-tripay)
7. [Phase 7: Testing & Verification](#phase-7-testing--verification)
8. [Phase 8: Monitoring & Maintenance](#phase-8-monitoring--maintenance)

---

## Phase 1: Daftar GCP Account

### Step 1.1: Buka Google Cloud
1. Buka browser
2. Go to: https://cloud.google.com/free
3. Klik **"Get started for free"** atau **"Start free"**

### Step 1.2: Login dengan Google Account
- Gunakan Gmail kamu
- Atau create new Google account

### Step 1.3: Pilih Country & Accept Terms
- Country: **Indonesia**
- ✅ Accept Terms of Service
- ✅ Accept email updates (optional)
- Klik **"Continue"**

### Step 1.4: Isi Account Information
**Step 1 of 2: Account Information**
- Account type: **Individual** (bukan Business)
- Name: [Nama lengkap kamu]
- Address: [Alamat lengkap]
- Postal code: [Kode pos]
- Klik **"Continue"**

### Step 1.5: Payment Method
**Step 2 of 2: Payment Method**
- Payment method: **Credit/Debit Card**
- Card number: [Nomor kartu]
- Expiry date: [MM/YY]
- CVV: [3 digit]
- Cardholder name: [Nama di kartu]

⚠️ **Important:**
- GCP akan verifikasi dengan charge kecil (akan di-refund)
- Kamu dapat **$300 credit** untuk 90 hari pertama
- Setelah itu, **Always Free tier** tetap gratis selamanya
- **Tidak akan auto-charge** setelah trial habis

Klik **"Start my free trial"**

### Step 1.6: Verify Payment
- Masukkan OTP dari bank (jika diminta)
- Tunggu verifikasi selesai

### Step 1.7: Welcome to GCP!
- Kamu akan masuk ke **Google Cloud Console**
- Dashboard akan muncul
- Kamu punya **$300 credit** untuk 90 hari

**✅ Phase 1 Complete!**

---

## Phase 2: Create VM Instance

### Step 2.1: Navigate to Compute Engine
1. Di Google Cloud Console
2. Klik menu hamburger (☰) di kiri atas
3. Pilih **"Compute Engine"** → **"VM instances"**
4. Tunggu Compute Engine API enable (1-2 menit, otomatis)

### Step 2.2: Create Instance
Klik **"CREATE INSTANCE"**

### Step 2.3: Configure Instance

**Name:**
```
tripay-proxy
```

**Region & Zone:**
- Region: **asia-southeast1 (Singapore)** ⭐ Recommended
  - Atau: **asia-east1 (Taiwan)**
  - Atau: **asia-northeast1 (Tokyo)**
- Zone: Pilih salah satu (contoh: asia-southeast1-a)

**Machine configuration:**
- Series: **E2**
- Machine type: **e2-micro** (0.25-2 vCPU, 1 GB memory)
  - ⚠️ **Ini yang Always Free!**
  - Jangan pilih yang lain

**Boot disk:**
Klik **"CHANGE"**
- Operating system: **Ubuntu**
- Version: **Ubuntu 22.04 LTS** (x86/64)
- Boot disk type: **Standard persistent disk**
- Size: **30 GB** (default, Always Free)
- Klik **"SELECT"**

**Firewall:**
- ✅ **Allow HTTP traffic**
- ✅ **Allow HTTPS traffic**

⚠️ **Jangan ubah yang lain!** Biarkan default untuk Always Free.

### Step 2.4: Create
Klik **"CREATE"** di bawah

Tunggu 1-2 menit (status: Creating → Running)

### Step 2.5: Catat External IP
Setelah status **"Running"**:
1. Lihat kolom **"External IP"**
2. Catat IP ini (contoh: 34.87.123.45)
3. **Ini IP yang akan di-whitelist di Tripay!**

⚠️ **Important:** IP ini bersifat **ephemeral** (bisa berubah jika VM di-stop). Kita akan reserve static IP nanti.

### Step 2.6: Reserve Static IP (Important!)
1. Klik menu hamburger (☰)
2. Pilih **"VPC network"** → **"IP addresses"**
3. Cari External IP kamu di list
4. Klik **"RESERVE"** di kolom "Type"
5. Name: `tripay-proxy-ip`
6. Klik **"RESERVE"**

✅ Sekarang IP kamu **static** (tidak akan berubah)

**✅ Phase 2 Complete!**

---

## Phase 3: Configure Firewall

### Step 3.1: Create Firewall Rule for Port 3000
1. Klik menu hamburger (☰)
2. Pilih **"VPC network"** → **"Firewall"**
3. Klik **"CREATE FIREWALL RULE"**

**Configuration:**
- Name: `allow-tripay-proxy`
- Description: `Allow port 3000 for Tripay proxy`
- Logs: Off
- Network: **default**
- Priority: **1000**
- Direction of traffic: **Ingress**
- Action on match: **Allow**
- Targets: **All instances in the network**
- Source filter: **IPv4 ranges**
- Source IPv4 ranges: `0.0.0.0/0`
- Protocols and ports:
  - ✅ **Specified protocols and ports**
  - ✅ **tcp:** `3000`

Klik **"CREATE"**

### Step 3.2: Verify Firewall Rules
Kamu sekarang punya firewall rules:
- ✅ HTTP (port 80)
- ✅ HTTPS (port 443)
- ✅ Custom (port 3000)
- ✅ SSH (port 22) - default

**✅ Phase 3 Complete!**

---

## Phase 4: Deploy Proxy Server

### Step 4.1: Connect via SSH

**Option A: Browser SSH (Easiest)**
1. Go to **Compute Engine** → **VM instances**
2. Cari instance `tripay-proxy`
3. Klik **"SSH"** button
4. Browser SSH window akan terbuka
5. ✅ Done! Kamu sudah connect

**Option B: Local Terminal (Advanced)**
```bash
# Install gcloud CLI first: https://cloud.google.com/sdk/docs/install
gcloud compute ssh tripay-proxy --zone=asia-southeast1-a
```

⚠️ **Recommended:** Gunakan Browser SSH (Option A) - lebih mudah!

### Step 4.2: Update System
```bash
sudo apt update && sudo apt upgrade -y
```

Tunggu 2-3 menit.

### Step 4.3: Install Node.js
```bash
# Install Node.js 20.x LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

### Step 4.4: Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

### Step 4.5: Create Project Directory
```bash
mkdir -p ~/tripay-proxy
cd ~/tripay-proxy
```

### Step 4.6: Create Package.json
```bash
cat > package.json << 'EOF'
{
  "name": "tripay-proxy",
  "version": "1.0.0",
  "description": "Tripay API Proxy for Canvango Group",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "axios": "^1.6.0",
    "dotenv": "^16.3.1"
  }
}
EOF
```

### Step 4.7: Install Dependencies
```bash
npm install
```

Tunggu 1-2 menit.

### Step 4.8: Create Server.js
```bash
cat > server.js << 'EOF'
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
const allowedOrigins = [
  'https://canvango-group.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
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
    message: 'Tripay Proxy Server is running',
    mode: IS_PRODUCTION ? 'production' : 'sandbox',
    timestamp: new Date().toISOString()
  });
});

// Get payment channels
app.get('/payment-channels', async (req, res) => {
  try {
    const response = await axios.get(`${TRIPAY_BASE_URL}/merchant/payment-channel`, {
      headers: {
        'Authorization': `Bearer ${TRIPAY_API_KEY}`
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching payment channels:', error.response?.data || error.message);
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
      method,
      merchant_ref,
      amount,
      customer_name,
      customer_email,
      customer_phone,
      order_items,
      return_url,
      expired_time
    } = req.body;

    const signature = generateSignature(merchant_ref, amount);

    const payload = {
      method,
      merchant_ref,
      amount,
      customer_name,
      customer_email,
      customer_phone,
      order_items,
      return_url,
      expired_time,
      signature
    };

    const response = await axios.post(
      `${TRIPAY_BASE_URL}/transaction/create`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${TRIPAY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error creating transaction:', error.response?.data || error.message);
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
    const response = await axios.get(
      `${TRIPAY_BASE_URL}/transaction/detail?reference=${reference}`,
      {
        headers: {
          'Authorization': `Bearer ${TRIPAY_API_KEY}`
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching transaction detail:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || 'Failed to fetch transaction detail'
    });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Tripay Proxy Server running on port ${PORT}`);
  console.log(`Mode: ${IS_PRODUCTION ? 'PRODUCTION' : 'SANDBOX'}`);
  console.log(`Base URL: ${TRIPAY_BASE_URL}`);
});
EOF
```

### Step 4.9: Create .env File
```bash
nano .env
```

**Paste ini (ganti dengan credentials kamu):**
```env
PORT=3000
TRIPAY_API_KEY=DEV-your-api-key-here
TRIPAY_PRIVATE_KEY=your-private-key-here
TRIPAY_MERCHANT_CODE=T0000
IS_PRODUCTION=false
```

⚠️ **Ganti dengan credentials Tripay kamu!**

**Save:** Ctrl+O, Enter, Ctrl+X

### Step 4.10: Start Server with PM2
```bash
# Start server
pm2 start server.js --name tripay-proxy

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

⚠️ **Copy-paste command yang muncul**, lalu jalankan. Contoh:
```bash
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u your-username --hp /home/your-username
```

```bash
# Check status
pm2 status
pm2 logs tripay-proxy --lines 20
```

### Step 4.11: Test Server
```bash
# Test from VM
curl http://localhost:3000/

# Test from your computer (ganti dengan IP kamu)
curl http://34.87.123.45:3000/
```

**Expected response:**
```json
{
  "status": "ok",
  "message": "Tripay Proxy Server is running",
  "mode": "sandbox",
  "timestamp": "2025-11-29T..."
}
```

✅ Jika muncul response di atas, server berhasil running!

**✅ Phase 4 Complete!**

---

## Phase 5: Update Frontend & Database

### Step 5.1: Get Your Static IP
Catat External IP kamu dari GCP Console:
- Example: `34.87.123.45`

### Step 5.2: Update Database
Buka Supabase SQL Editor dan run:

```sql
-- Update proxy URL
UPDATE tripay_settings 
SET proxy_url = 'http://34.87.123.45:3000',
    updated_at = NOW()
WHERE id = 'e3b84c2a-3a90-4aea-9814-11eb87582645';

-- Verify
SELECT proxy_url FROM tripay_settings;
```

⚠️ **Ganti `34.87.123.45` dengan IP kamu!**

### Step 5.3: Update Frontend Code
**File: `src/services/tripay.service.ts`**

Cari line ini:
```typescript
const PROXY_URL = 'https://tripay-proxy.canvango.workers.dev';
```

Ganti dengan:
```typescript
const PROXY_URL = 'http://34.87.123.45:3000';
```

⚠️ **Ganti `34.87.123.45` dengan IP kamu!**

### Step 5.4: Commit & Deploy
```bash
git add .
git commit -m "feat: Switch to GCP proxy for Tripay"
git push origin main
```

Vercel akan auto-deploy (tunggu 2-3 menit).

**✅ Phase 5 Complete!**

---

## Phase 6: Whitelist IP di Tripay

### Step 6.1: Login Tripay Dashboard
1. Go to: https://tripay.co.id/member
2. Login dengan akun kamu

### Step 6.2: Navigate to IP Whitelist
1. Menu: **"Pengaturan"** atau **"Settings"**
2. Cari: **"IP Whitelist"** atau **"Whitelist IP"**

### Step 6.3: Add IP
1. Masukkan IP GCP: `34.87.123.45`
2. Klik **"Tambah"** atau **"Add"**
3. Save

⚠️ **Ganti dengan IP kamu!**

### Step 6.4: Verify
- IP kamu akan muncul di list
- Status: Active

**✅ Phase 6 Complete!**

---

## Phase 7: Testing & Verification

### Step 7.1: Test Health Check
```bash
curl http://34.87.123.45:3000/
```

**Expected:** Status OK response

### Step 7.2: Test Payment Channels
```bash
curl http://34.87.123.45:3000/payment-channels
```

**Expected:** List payment channels dari Tripay

### Step 7.3: Test dari Frontend
1. Buka: https://canvango-group.vercel.app
2. Login sebagai user
3. Go to: Top Up page
4. Payment channels harus muncul

### Step 7.4: Test Create Payment
1. Pilih payment channel
2. Input amount: 10000
3. Klik "Bayar Sekarang"
4. Harus redirect ke Tripay payment page

### Step 7.5: Check Logs
```bash
# SSH ke GCP VM (via browser SSH)
# Then:
pm2 logs tripay-proxy --lines 50
```

**✅ Phase 7 Complete!**

---

## Phase 8: Monitoring & Maintenance

### Step 8.1: Setup Log Rotation
```bash
# Install PM2 log rotation
pm2 install pm2-logrotate

# Configure
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

### Step 8.2: Useful Commands
```bash
# Check server status
pm2 status

# View logs (real-time)
pm2 logs tripay-proxy

# View last 50 lines
pm2 logs tripay-proxy --lines 50

# Restart server
pm2 restart tripay-proxy

# Stop server
pm2 stop tripay-proxy

# Start server
pm2 start tripay-proxy

# Check system resources
htop  # or: top
df -h  # disk usage
free -h  # memory usage
```

### Step 8.3: GCP Monitoring
1. Go to GCP Console
2. Menu: **"Monitoring"** → **"Dashboards"**
3. View CPU, Memory, Network usage

### Step 8.4: Update Server Code
```bash
# SSH to VM
# Navigate to project
cd ~/tripay-proxy

# Edit server.js
nano server.js

# Restart PM2
pm2 restart tripay-proxy

# Check logs
pm2 logs tripay-proxy
```

**✅ Phase 8 Complete!**

---

## 🎉 Setup Complete!

Selamat! Kamu sudah berhasil setup Google Cloud Platform untuk Tripay proxy.

### ✅ Final Checklist
- [ ] GCP account created
- [ ] VM instance running (e2-micro)
- [ ] Static IP reserved
- [ ] Firewall configured
- [ ] Proxy server deployed
- [ ] Frontend updated
- [ ] Database updated
- [ ] IP whitelisted di Tripay
- [ ] Testing passed
- [ ] Monitoring setup

### 📊 Summary
- **Provider:** Google Cloud Platform
- **Instance:** e2-micro (1 GB RAM, 0.25-2 vCPU)
- **Region:** Singapore (asia-southeast1)
- **IP Address:** 34.87.123.45 (static)
- **Proxy URL:** http://34.87.123.45:3000
- **Biaya:** Rp 0/bulan (Always Free)
- **Status:** ✅ Production Ready

---

## 💰 Cost Breakdown

| Item | Biaya |
|------|-------|
| e2-micro instance | **Rp 0/bulan** (Always Free) |
| 30 GB Standard disk | **Rp 0/bulan** (Always Free) |
| Static IP (in use) | **Rp 0/bulan** (Always Free) |
| Network egress (1 GB/month) | **Rp 0/bulan** (Always Free) |
| **TOTAL** | **Rp 0/bulan** |

⚠️ **Important:**
- Always Free selama VM tetap **e2-micro**
- Jangan upgrade ke machine type lain
- Static IP gratis selama **attached** ke running VM
- Network egress gratis sampai 1 GB/bulan

---

## 🔄 Rollback Plan

Jika ada masalah, rollback mudah:

### Step 1: Revert Frontend
```typescript
// src/services/tripay.service.ts
const PROXY_URL = 'https://tripay-proxy.canvango.workers.dev';
```

### Step 2: Revert Database
```sql
UPDATE tripay_settings 
SET proxy_url = 'https://tripay-proxy.canvango.workers.dev';
```

### Step 3: Deploy
```bash
git add .
git commit -m "rollback: Revert to Cloudflare Worker"
git push origin main
```

**Downtime:** 0 detik (Cloudflare Worker masih jalan)

---

## 📞 Support & Troubleshooting

### Common Issues

**1. Cannot connect to VM via SSH**
- Solution: Check firewall rules, ensure SSH (port 22) is allowed

**2. Server not responding on port 3000**
- Check: `pm2 status`
- Check: `pm2 logs tripay-proxy`
- Check: Firewall rule for port 3000

**3. Payment channels not loading**
- Check: IP whitelisted di Tripay
- Check: `.env` credentials correct
- Check: `pm2 logs tripay-proxy` for errors

**4. VM stopped unexpectedly**
- GCP free tier VMs can be preempted
- Solution: Restart VM from console
- PM2 will auto-start server on boot

### Useful Links
- GCP Console: https://console.cloud.google.com
- GCP Docs: https://cloud.google.com/docs
- PM2 Docs: https://pm2.keymetrics.io/docs/
- Tripay Docs: https://tripay.co.id/developer

---

## 🎓 Tips & Best Practices

1. **Monitor usage** - Check GCP billing dashboard regularly
2. **Backup .env** - Save credentials securely
3. **Check logs** - `pm2 logs` untuk monitor errors
4. **Keep updated** - `sudo apt update && sudo apt upgrade` monthly
5. **Don't upgrade** - Tetap di e2-micro untuk Always Free
6. **Reserve IP** - Jangan lupa reserve static IP (sudah done)
7. **Test regularly** - Test payment flow setiap minggu

---

**Last Updated:** November 29, 2025  
**Version:** 1.0.0  
**Author:** Kiro AI Assistant
