# 🚀 Oracle Cloud Free Tier Setup Guide - Tripay Proxy

## 📋 Overview

Guide ini akan membantu kamu setup Oracle Cloud Free Tier untuk Tripay proxy secara **bertahap dan sistematis**.

**Estimasi Waktu:** 45-60 menit  
**Biaya:** Rp 0 (Gratis selamanya)  
**Skill Required:** Basic (copy-paste commands)

---

## ✅ Prerequisites Checklist

Sebelum mulai, pastikan kamu punya:

- [ ] Email aktif
- [ ] Kartu kredit/debit (untuk verifikasi, tidak akan dicharge)
- [ ] Nomor telepon aktif
- [ ] Koneksi internet stabil
- [ ] SSH client (Windows: PuTTY atau Git Bash, Mac/Linux: Terminal)

---

## 📚 Table of Contents

1. [Phase 1: Daftar Oracle Cloud Account](#phase-1)
2. [Phase 2: Create VM Instance](#phase-2)
3. [Phase 3: Configure Firewall & Network](#phase-3)
4. [Phase 4: Deploy Proxy Server](#phase-4)
5. [Phase 5: Update Frontend & Database](#phase-5)
6. [Phase 6: Whitelist IP di Tripay](#phase-6)
7. [Phase 7: Testing & Verification](#phase-7)
8. [Phase 8: Monitoring & Maintenance](#phase-8)

---

## Phase 1: Daftar Oracle Cloud Account

### Step 1.1: Buka Oracle Cloud
1. Buka browser
2. Go to: https://oracle.com/cloud/free
3. Klik **"Start for free"**

### Step 1.2: Isi Form Registrasi
**Account Information:**
- Country/Territory: Indonesia
- First Name: [Nama depan kamu]
- Last Name: [Nama belakang kamu]
- Email: [Email aktif kamu]
- Password: [Buat password kuat]

**Klik "Verify my email"**

### Step 1.3: Verifikasi Email
1. Buka email kamu
2. Cari email dari Oracle Cloud
3. Klik link verifikasi
4. Kembali ke form registrasi

### Step 1.4: Isi Cloud Account Details
- Cloud Account Name: [Pilih nama unik, contoh: canvango-cloud]
- Home Region: **Asia Pacific (Singapore)** atau **Asia Pacific (Mumbai)**
  - ⚠️ **Penting:** Pilih region terdekat untuk latency rendah
  - ⚠️ **Tidak bisa diubah** setelah dibuat!

### Step 1.5: Verifikasi Identitas
**Address Information:**
- Address Line 1: [Alamat lengkap]
- City: [Kota]
- State/Province: [Provinsi]
- Postal Code: [Kode pos]
- Phone Number: [Nomor HP aktif]

**Klik "Continue"**

### Step 1.6: Verifikasi Kartu Kredit/Debit
1. Masukkan detail kartu kredit/debit
2. Oracle akan charge $1 untuk verifikasi (akan di-refund)
3. Masukkan OTP dari bank
4. Tunggu verifikasi selesai

### Step 1.7: Selesai!
- Kamu akan dapat email konfirmasi
- Login ke Oracle Cloud Console: https://cloud.oracle.com
- Tunggu 5-10 menit untuk account provisioning

**✅ Phase 1 Complete!**

---

## Phase 2: Create VM Instance

### Step 2.1: Login ke Oracle Cloud Console
1. Go to: https://cloud.oracle.com
2. Login dengan email & password
3. Pilih Cloud Account Name yang kamu buat

### Step 2.2: Navigate to Compute Instances
1. Klik menu hamburger (☰) di kiri atas
2. Pilih **"Compute"** → **"Instances"**
3. Klik **"Create Instance"**

### Step 2.3: Configure Instance
**Name:**
```
tripay-proxy
```

**Placement:**
- Availability Domain: (Pilih yang available)
- Fault Domain: (Biarkan default)

**Image and Shape:**
1. Klik **"Edit"** di bagian Image and Shape

**Image:**
- Klik **"Change Image"**
- Pilih: **"Canonical Ubuntu"**
- Version: **22.04** (LTS)
- Klik **"Select Image"**

**Shape:**
- Klik **"Change Shape"**
- Pilih: **"Ampere"** (ARM-based, Always Free)
  - Shape: **VM.Standard.A1.Flex**
  - OCPUs: **1** (atau 2 jika available)
  - Memory: **6 GB** (atau 12 GB jika available)
- Atau pilih: **"AMD"** (x86-based, Always Free)
  - Shape: **VM.Standard.E2.1.Micro**
  - OCPUs: **1**
  - Memory: **1 GB**
- Klik **"Select Shape"**

⚠️ **Rekomendasi:** Pilih Ampere (lebih powerful dan tetap gratis)

### Step 2.4: Configure Networking
**Primary VNIC Information:**
- Virtual Cloud Network: (Biarkan default atau create new)
- Subnet: (Biarkan default - Public Subnet)
- ✅ **Assign a public IPv4 address** (HARUS dicentang!)

### Step 2.5: Add SSH Keys
**Pilih salah satu:**

**Opsi A: Generate SSH Key Pair (Recommended)**
1. Pilih **"Generate a key pair for me"**
2. Klik **"Save Private Key"** → Simpan file `.key`
3. Klik **"Save Public Key"** → Simpan file `.pub`
4. ⚠️ **Simpan baik-baik!** Tidak bisa di-download lagi

**Opsi B: Upload SSH Key (Jika sudah punya)**
1. Pilih **"Upload public key files"**
2. Upload file `.pub` kamu

**Opsi C: Paste SSH Key**
1. Pilih **"Paste public keys"**
2. Paste isi file `.pub` kamu

### Step 2.6: Boot Volume
- Biarkan default (50 GB)
- ✅ **Use in-transit encryption** (Recommended)

### Step 2.7: Create Instance
1. Review semua konfigurasi
2. Klik **"Create"**
3. Tunggu 2-3 menit (status: Provisioning → Running)

### Step 2.8: Catat Public IP
Setelah status **"Running"**:
1. Lihat **"Public IP Address"**
2. Catat IP ini (contoh: 123.45.67.89)
3. **Ini IP yang akan di-whitelist di Tripay!**

**✅ Phase 2 Complete!**

---

## Phase 3: Configure Firewall & Network

### Step 3.1: Configure Security List (Oracle Cloud)
1. Dari halaman Instance, klik **"Subnet"** link
2. Klik **"Default Security List"**
3. Klik **"Add Ingress Rules"**

**Rule 1: HTTP (Port 80)**
- Source CIDR: `0.0.0.0/0`
- IP Protocol: TCP
- Destination Port Range: `80`
- Description: `HTTP`
- Klik **"Add Ingress Rules"**

**Rule 2: HTTPS (Port 443)**
- Source CIDR: `0.0.0.0/0`
- IP Protocol: TCP
- Destination Port Range: `443`
- Description: `HTTPS`
- Klik **"Add Ingress Rules"**

**Rule 3: Custom (Port 3000)**
- Source CIDR: `0.0.0.0/0`
- IP Protocol: TCP
- Destination Port Range: `3000`
- Description: `Tripay Proxy`
- Klik **"Add Ingress Rules"**

### Step 3.2: Configure Ubuntu Firewall (Nanti via SSH)
Akan dikonfigurasi di Phase 4

**✅ Phase 3 Complete!**

---

## Phase 4: Deploy Proxy Server

### Step 4.1: Connect via SSH

**Windows (Git Bash atau PowerShell):**
```bash
ssh -i path/to/your-private-key.key ubuntu@123.45.67.89
```

**Mac/Linux (Terminal):**
```bash
chmod 400 path/to/your-private-key.key
ssh -i path/to/your-private-key.key ubuntu@123.45.67.89
```

⚠️ Ganti `123.45.67.89` dengan IP kamu!

**First time login:**
- Ketik `yes` untuk accept fingerprint

### Step 4.2: Update System
```bash
sudo apt update && sudo apt upgrade -y
```

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
TRIPAY_API_KEY=DEV-your-api-key
TRIPAY_PRIVATE_KEY=your-private-key
TRIPAY_MERCHANT_CODE=T0000
IS_PRODUCTION=false
```

**Save:** Ctrl+O, Enter, Ctrl+X

### Step 4.10: Configure Ubuntu Firewall
```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS
sudo ufw allow 443/tcp

# Allow Proxy Port
sudo ufw allow 3000/tcp

# Enable firewall
sudo ufw --force enable

# Check status
sudo ufw status
```

### Step 4.11: Start Server with PM2
```bash
# Start server
pm2 start server.js --name tripay-proxy

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Copy-paste command yang muncul, lalu jalankan

# Check status
pm2 status
pm2 logs tripay-proxy
```

### Step 4.12: Test Server
```bash
# Test from VM
curl http://localhost:3000/

# Test from your computer
curl http://123.45.67.89:3000/
```

**Expected response:**
```json
{
  "status": "ok",
  "message": "Tripay Proxy Server is running",
  "mode": "sandbox"
}
```

**✅ Phase 4 Complete!**

---

## Phase 5: Update Frontend & Database

### Step 5.1: Update Database
```sql
-- Run di Supabase SQL Editor
UPDATE tripay_settings 
SET proxy_url = 'http://123.45.67.89:3000',
    updated_at = NOW()
WHERE id = 'e3b84c2a-3a90-4aea-9814-11eb87582645';

-- Verify
SELECT proxy_url FROM tripay_settings;
```

### Step 5.2: Update Frontend Code
**File: `src/services/tripay.service.ts`**

Cari line ini:
```typescript
const PROXY_URL = 'https://tripay-proxy.canvango.workers.dev';
```

Ganti dengan:
```typescript
const PROXY_URL = 'http://123.45.67.89:3000';
```

### Step 5.3: Deploy ke Vercel
```bash
git add .
git commit -m "feat: Switch to Oracle Cloud proxy for Tripay"
git push origin main
```

Vercel akan auto-deploy (tunggu 2-3 menit)

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
1. Masukkan IP Oracle Cloud: `123.45.67.89`
2. Klik **"Tambah"** atau **"Add"**
3. Save

### Step 6.4: Verify
- IP kamu akan muncul di list
- Status: Active

**✅ Phase 6 Complete!**

---

## Phase 7: Testing & Verification

### Step 7.1: Test Payment Channels
```bash
curl http://123.45.67.89:3000/payment-channels
```

**Expected:** List payment channels dari Tripay

### Step 7.2: Test dari Frontend
1. Buka: https://canvango-group.vercel.app
2. Login sebagai user
3. Go to: Top Up page
4. Payment channels harus muncul

### Step 7.3: Test Create Payment
1. Pilih payment channel
2. Input amount: 10000
3. Klik "Bayar Sekarang"
4. Harus redirect ke Tripay payment page

### Step 7.4: Check Logs
```bash
# SSH ke Oracle VM
ssh -i your-key.key ubuntu@123.45.67.89

# Check PM2 logs
pm2 logs tripay-proxy

# Check last 50 lines
pm2 logs tripay-proxy --lines 50
```

**✅ Phase 7 Complete!**

---

## Phase 8: Monitoring & Maintenance

### Step 8.1: Setup Monitoring
```bash
# Install PM2 monitoring (optional)
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Step 8.2: Useful Commands
```bash
# Check server status
pm2 status

# View logs
pm2 logs tripay-proxy

# Restart server
pm2 restart tripay-proxy

# Stop server
pm2 stop tripay-proxy

# Start server
pm2 start tripay-proxy

# Check system resources
htop  # or: top
```

### Step 8.3: Update Server
```bash
# SSH to VM
ssh -i your-key.key ubuntu@123.45.67.89

# Navigate to project
cd ~/tripay-proxy

# Pull latest code (if using git)
git pull

# Or edit server.js
nano server.js

# Restart PM2
pm2 restart tripay-proxy
```

**✅ Phase 8 Complete!**

---

## 🎉 Setup Complete!

Selamat! Kamu sudah berhasil setup Oracle Cloud Free Tier untuk Tripay proxy.

### ✅ Checklist Final
- [ ] Oracle Cloud account created
- [ ] VM instance running
- [ ] Firewall configured
- [ ] Proxy server deployed
- [ ] Frontend updated
- [ ] Database updated
- [ ] IP whitelisted di Tripay
- [ ] Testing passed

### 📊 Summary
- **Biaya:** Rp 0/bulan (Gratis selamanya)
- **IP Address:** 123.45.67.89 (static)
- **Proxy URL:** http://123.45.67.89:3000
- **Status:** ✅ Production Ready

---

## 📞 Support

**Jika ada masalah:**
1. Check logs: `pm2 logs tripay-proxy`
2. Check firewall: `sudo ufw status`
3. Check server: `curl http://localhost:3000/`
4. Restart: `pm2 restart tripay-proxy`

**Dokumentasi:**
- Oracle Cloud: https://docs.oracle.com/en-us/iaas/
- PM2: https://pm2.keymetrics.io/docs/
- Tripay: https://tripay.co.id/developer

---

**Last Updated:** November 29, 2025  
**Version:** 1.0.0
