# 🧪 Test Tripay Integration

## Quick Test Commands

### 1. Test Payment Channels API
```bash
curl https://tripay-proxy.canvango.workers.dev/payment-channels
```

**Expected Response:**
```json
{
  "success": true,
  "message": "OK",
  "data": [
    {
      "group": "Virtual Account",
      "code": "BRIVA",
      "name": "BRI Virtual Account",
      "type": "virtual_account",
      "fee_merchant": {...},
      "fee_customer": {...},
      "total_fee": {...},
      "minimum_fee": 0,
      "maximum_fee": 0,
      "icon_url": "...",
      "active": true
    }
  ]
}
```

### 2. Test Worker Health
```bash
curl https://tripay-proxy.canvango.workers.dev/
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "Tripay Proxy Worker is running"
}
```

---

## Frontend Testing

### Admin Panel Test

1. **Login sebagai Admin**
   - Email: admin@example.com
   - Password: [your admin password]

2. **Buka System Settings**
   - Navigate to: `/member/admin/system-settings`
   - Scroll to "Tripay Configuration"

3. **Verify Configuration**
   - Proxy URL: `https://tripay-proxy.canvango.workers.dev`
   - Mode: Sandbox
   - API Key: DEV-xxxxx (masked)

4. **Test Connection**
   - Klik button "Test Connection"
   - Should show success message
   - Payment channels should load

### User Payment Flow Test

1. **Login sebagai User**
   - Create test user or use existing

2. **Navigate to Top Up**
   - Go to: `/member/topup`

3. **Select Payment Method**
   - Choose any payment channel (e.g., QRIS, Virtual Account)
   - Verify channel details displayed

4. **Enter Amount**
   - Input: 10000 (minimum)
   - Verify fee calculation

5. **Create Payment**
   - Click "Bayar Sekarang"
   - Should redirect to Tripay payment page
   - Verify transaction created in database

---

## Database Verification

### Check Transaction Created
```sql
SELECT 
  id,
  user_id,
  amount,
  payment_method,
  tripay_reference,
  status,
  created_at
FROM transactions
ORDER BY created_at DESC
LIMIT 5;
```

### Check Payment Channels Cache
```sql
SELECT 
  code,
  name,
  type,
  active,
  updated_at
FROM payment_channels
WHERE active = true
ORDER BY "group", name;
```

### Monitor Recent Transactions
```sql
SELECT * FROM recent_transactions LIMIT 10;
```

---

## Cloudflare Worker Logs

### View Real-time Logs
```bash
cd cloudflare-worker
npx wrangler tail
```

### Check Deployment Status
```bash
cd cloudflare-worker
npx wrangler deployments list
```

---

## Common Issues & Solutions

### Issue: Payment Channels Not Loading

**Check:**
1. Worker URL in database correct?
   ```sql
   SELECT proxy_url FROM tripay_settings;
   ```

2. Worker responding?
   ```bash
   curl https://tripay-proxy.canvango.workers.dev/payment-channels
   ```

3. CORS headers present?
   - Check browser console for CORS errors

**Fix:**
- Verify proxy_url in database
- Check worker logs: `npx wrangler tail`
- Redeploy worker if needed: `npx wrangler deploy`

### Issue: Payment Creation Failed

**Check:**
1. Signature generation correct?
2. API credentials valid?
3. Transaction data complete?

**Debug:**
```bash
# Check worker logs
cd cloudflare-worker
npx wrangler tail

# Check database transaction
SELECT * FROM transactions WHERE status = 'failed' ORDER BY created_at DESC LIMIT 5;
```

### Issue: Callback Not Received

**Check:**
1. Callback URL configured in Tripay dashboard
2. Edge Function deployed
3. Signature validation working

**Verify:**
```sql
-- Check if callback updated transaction
SELECT 
  tripay_reference,
  status,
  paid_at,
  updated_at
FROM transactions
WHERE tripay_reference = 'T0000XXXXX';
```

---

## Test Checklist

**API Tests:**
- [ ] Payment channels endpoint responds
- [ ] Worker health check passes
- [ ] CORS headers present

**Admin Tests:**
- [ ] Can view Tripay configuration
- [ ] Test connection succeeds
- [ ] Payment channels load in admin

**User Tests:**
- [ ] Can access top up page
- [ ] Can select payment channel
- [ ] Can enter amount
- [ ] Payment creation succeeds
- [ ] Redirect to Tripay works

**Database Tests:**
- [ ] Transaction created in database
- [ ] Payment channels cached
- [ ] Transaction status updates

**Integration Tests:**
- [ ] End-to-end payment flow works
- [ ] Callback updates transaction
- [ ] User sees updated balance

---

## Performance Benchmarks

**Expected Response Times:**
- Payment Channels API: < 500ms
- Payment Creation: < 1000ms
- Callback Processing: < 200ms

**Monitor:**
```sql
-- Average transaction creation time
SELECT 
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) as avg_seconds
FROM transactions
WHERE status = 'paid'
AND created_at > NOW() - INTERVAL '24 hours';
```

---

## Next Steps After Testing

1. **If All Tests Pass:**
   - Document any issues found
   - Prepare for production switch
   - Request IP whitelist from Tripay

2. **If Tests Fail:**
   - Check worker logs
   - Verify database configuration
   - Review error messages
   - Contact support if needed

3. **Production Preparation:**
   - Get production API credentials
   - Update worker secrets
   - Test with small amount first
   - Monitor closely

---

**Quick Links:**
- Production Guide: `TRIPAY_PRODUCTION_READY.md`
- Integration Guide: `TRIPAY_INTEGRATION_GUIDE.md`
- Worker README: `cloudflare-worker/README.md`
