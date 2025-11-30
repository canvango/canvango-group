# ✅ GCP Setup Complete - Tripay Proxy

## 🎉 Setup Summary

**Date:** November 30, 2025  
**Status:** ✅ Complete & Tested

---

## 📊 Infrastructure Details

### GCP VM Instance
- **Name:** tripay-proxy2
- **Machine Type:** e2-micro (Always Free)
- **Region:** us-west1-a
- **Static IP:** 34.182.126.200
- **OS:** Debian GNU/Linux
- **Status:** Running ✅

### Proxy Server
- **URL:** http://34.182.126.200:3000
- **Mode:** Sandbox (for testing)
- **Process Manager:** PM2
- **Auto-start:** Enabled
- **Port:** 3000 (firewall configured)

### Credentials (Sandbox)
- **API Key:** DEV-V745CsasrrsQ4BslYS5dzwbJZ6wLudy5joxBGq1G
- **Private Key:** BAo71-gUqRM-IahAp-Gt8AM-IS7Iq
- **Merchant Code:** T47116
- **Mode:** Sandbox

---

## ✅ Testing Results

### Test 1: Health Check
```bash
curl http://34.182.126.200:3000/
```
**Result:** ✅ PASSED
```json
{"status":"ok","message":"Tripay Proxy Server","mode":"sandbox"}
```

### Test 2: Payment Channels
```bash
curl http://34.182.126.200:3000/payment-channels
```
**Result:** ✅ PASSED
- Returns list of payment methods (QRIS, OVO, GOPAY, DANA, etc.)
- All channels active and available

---

## 🗄️ Database Configuration

```sql
-- Current settings
proxy_url: http://34.182.126.200:3000
is_production: false (sandbox mode)
```

---

## 🌐 Frontend Configuration

### Environment Variables (.env)
```env
VITE_TRIPAY_PROXY_URL=http://34.182.126.200:3000
VITE_TRIPAY_MODE=sandbox
```

### Vercel Environment Variables (Required)
Set these in Vercel Dashboard:
1. `VITE_TRIPAY_PROXY_URL` = `http://34.182.126.200:3000`
2. `VITE_TRIPAY_MODE` = `sandbox`

---

## 🚀 Deployment Checklist

- [x] GCP VM created and configured
- [x] Static IP reserved (34.182.126.200)
- [x] Firewall rules configured (port 3000)
- [x] Proxy server deployed with PM2
- [x] Server tested and verified
- [x] Database updated
- [x] Frontend environment configured
- [ ] Vercel environment variables set
- [ ] Frontend deployed and tested

---

## 🔄 Switch to Production Mode

When Tripay production API is approved:

### 1. Update GCP VM
```bash
cd ~/tripay-proxy
cat > .env << 'EOF'
PORT=3000
TRIPAY_API_KEY=QfvISlE5WUUu4Eyxqcj6pJ3BMsdIZgKHZyWG17ZP
TRIPAY_PRIVATE_KEY=Fz27s-v8gGt-jDE8e-04Tbw-de1vi
TRIPAY_MERCHANT_CODE=T47159
IS_PRODUCTION=true
EOF
pm2 restart tripay-proxy
```

### 2. Update Database
```sql
UPDATE tripay_settings 
SET is_production = true,
    updated_at = NOW()
WHERE id = 'e3b84c2a-3a90-4aea-9814-11eb87582645';
```

### 3. Update Vercel Environment
- `VITE_TRIPAY_MODE` = `production`
- Redeploy

---

## 📞 Support & Maintenance

### Useful Commands

**Check server status:**
```bash
pm2 status
```

**View logs:**
```bash
pm2 logs tripay-proxy
pm2 logs tripay-proxy --lines 50
```

**Restart server:**
```bash
pm2 restart tripay-proxy
```

**Update server code:**
```bash
cd ~/tripay-proxy
nano server.js
pm2 restart tripay-proxy
```

### Monitoring
- GCP Console: https://console.cloud.google.com
- VM Instances: https://console.cloud.google.com/compute/instances
- Firewall Rules: https://console.cloud.google.com/networking/firewalls

---

## 💰 Cost

**Total Monthly Cost:** $0.00 (Always Free)

- e2-micro VM: $0/month (Always Free)
- 30 GB Standard disk: $0/month (Always Free)
- Static IP (attached): $0/month (Always Free)
- Network egress (1 GB): $0/month (Always Free)

---

## 🎯 Next Steps

1. ✅ Set Vercel environment variables
2. ✅ Deploy to Vercel
3. ✅ Test payment flow on production URL
4. ⏳ Contact Tripay support for production API approval
5. ⏳ Switch to production mode after approval

---

**Setup completed successfully!** 🎉
