# 🚀 Tripay Integration - Quick Reference Card

## 📋 Copy-Paste Ready

### Cloudflare IP Ranges (untuk Whitelist)
```
173.245.48.0/20
103.21.244.0/22
103.22.200.0/22
103.31.4.0/22
141.101.64.0/18
108.162.192.0/18
190.93.240.0/20
188.114.96.0/20
197.234.240.0/22
198.41.128.0/17
162.158.0.0/15
104.16.0.0/13
104.24.0.0/14
172.64.0.0/13
131.0.72.0/22
```

### Worker URL
```
https://tripay-proxy.canvango.workers.dev
```

### Callback URL
```
https://canvango.com/api/tripay-callback
```

---

## 🔗 Important Links

| Service | URL |
|---------|-----|
| **Frontend** | https://canvango-group.vercel.app |
| **Admin Panel** | https://canvango-group.vercel.app/member/admin |
| **Worker** | https://tripay-proxy.canvango.workers.dev |
| **Cloudflare Dashboard** | https://dash.cloudflare.com |
| **Tripay Dashboard** | https://tripay.co.id/member |
| **Tripay Docs** | https://tripay.co.id/developer |

---

## 📧 Contact Support

| Service | Contact |
|---------|---------|
| **Tripay Support** | support@tripay.co.id |
| **Cloudflare Support** | https://dash.cloudflare.com |
| **Vercel Support** | https://vercel.com/support |

---

## 🧪 Quick Test Commands

### Test Worker Health
```bash
curl https://tripay-proxy.canvango.workers.dev/
```

### Test Payment Channels
```bash
curl https://tripay-proxy.canvango.workers.dev/payment-channels
```

### View Worker Logs
```bash
cd cloudflare-worker
npx wrangler tail
```

### Deploy Worker
```bash
cd cloudflare-worker
npx wrangler deploy
```

---

## 🗄️ Database Quick Queries

### Check Tripay Settings
```sql
SELECT * FROM tripay_settings;
```

### Recent Transactions
```sql
SELECT * FROM recent_transactions LIMIT 10;
```

### Payment Method Stats
```sql
SELECT * FROM payment_method_stats;
```

### Failed Transactions
```sql
SELECT * FROM failed_transactions;
```

---

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| `cloudflare-worker/wrangler.toml` | Worker config |
| `cloudflare-worker/.dev.vars` | Local secrets |
| `src/services/tripay.service.ts` | Payment service |
| `src/services/tripayChannels.service.ts` | Channels service |

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `README_TRIPAY.md` | Main documentation |
| `TRIPAY_PRODUCTION_READY.md` | Deployment guide |
| `TRIPAY_IP_WHITELIST_GUIDE.md` | IP whitelist guide |
| `TEST_TRIPAY.md` | Testing procedures |
| `DEPLOYMENT_SUCCESS.md` | Quick reference |

---

## 🎯 Testing Tools

| File | Purpose |
|------|---------|
| `test-production-worker.html` | Full worker testing |
| `check-worker-ip.html` | IP verification |
| `cloudflare-worker/test-worker.html` | Local testing |

---

## 🚦 Status Indicators

### Sandbox Mode (Current)
- ✅ Worker deployed
- ✅ Database configured
- ✅ Frontend integrated
- ⏳ Testing in progress

### Production Mode (Next)
- ⏳ Get production credentials
- ⏳ Request IP whitelist
- ⏳ Update worker secrets
- ⏳ Test and go live

---

## 🔐 Environment Variables

### Cloudflare Worker (.dev.vars)
```env
TRIPAY_API_KEY=DEV-xxxxx
TRIPAY_PRIVATE_KEY=xxxxx-xxxxx-xxxxx
TRIPAY_MERCHANT_CODE=T0000
ALLOWED_ORIGINS=https://canvango-group.vercel.app
```

### Production Secrets (Cloudflare Dashboard)
```bash
npx wrangler secret put TRIPAY_API_KEY
npx wrangler secret put TRIPAY_PRIVATE_KEY
npx wrangler secret put TRIPAY_MERCHANT_CODE
npx wrangler secret put ALLOWED_ORIGINS
```

---

## 📊 Monitoring Checklist

**Daily:**
- [ ] Check failed transactions
- [ ] Monitor payment success rate
- [ ] Review worker logs

**Weekly:**
- [ ] Analyze payment method stats
- [ ] Check transaction trends
- [ ] Review error patterns

**Monthly:**
- [ ] Performance optimization
- [ ] Update documentation
- [ ] Review security

---

## 🐛 Quick Troubleshooting

### Payment Channels Not Loading
1. Check worker URL in database
2. Test: `curl https://tripay-proxy.canvango.workers.dev/payment-channels`
3. Check browser console
4. View worker logs: `npx wrangler tail`

### Payment Creation Failed
1. Check signature generation
2. Verify API credentials
3. Check transaction logs
4. Test with different amount

### Callback Not Working
1. Verify callback URL
2. Check Edge Function logs
3. Test signature validation
4. Check transaction status

---

## ✅ Pre-Production Checklist

**Configuration:**
- [ ] Worker deployed to production
- [ ] Database configured
- [ ] Frontend services updated
- [ ] Edge Functions deployed

**Testing:**
- [ ] Payment channels loading
- [ ] Payment creation working
- [ ] Full payment flow tested
- [ ] Callback handling verified

**Production:**
- [ ] Production credentials obtained
- [ ] IP whitelist approved by Tripay
- [ ] Worker secrets updated
- [ ] Monitoring setup

---

## 🎓 Common Commands

```bash
# Navigate to worker directory
cd cloudflare-worker

# Install dependencies
npm install

# Run locally
npm run dev

# Deploy to production
npx wrangler deploy

# View logs
npx wrangler tail

# List deployments
npx wrangler deployments list

# Update secrets
npx wrangler secret put TRIPAY_API_KEY
```

---

## 📱 Quick Access

**Open Testing Tool:**
```bash
start test-production-worker.html
```

**Open IP Check Tool:**
```bash
start check-worker-ip.html
```

**Open Admin Panel:**
```
https://canvango-group.vercel.app/member/admin/system-settings
```

---

**Print this card and keep it handy! 📄**

Last Updated: November 29, 2025
