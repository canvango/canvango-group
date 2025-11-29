# 🎯 Tripay Admin Settings - Implementation Guide

## ✅ What's Been Implemented

### 1. Database Schema ✅
- Added `tripay_config` column to `system_settings` table
- Stores: merchant_code, api_key, private_key, mode, callback_url
- Default values set to your production credentials (T47159)

### 2. Admin Settings UI ✅
- Location: `/admin/settings` (System Settings page)
- New section: "Tripay Payment Gateway"
- Fields:
  - Merchant Code (T47159)
  - API Key (LYIV2DddSP0DnEaxiMyAYleC3EKAFdaIYalrB2Wd)
  - Private Key (BqOm1-ItF0o-LNlRZ-YhPK8-PZjNz)
  - Callback URL (read-only)
  - Mode badge: "Production Mode"

### 3. Edge Function Update ✅
- `tripay-create-payment` now reads from database first
- Fallback to environment variables if database empty
- Automatic credential selection

### 4. Service Layer ✅
- `adminSettingsService.ts` updated with `tripay_config` interface
- Save/load Tripay credentials via API

---

## 🚀 How to Use

### Step 1: Access Admin Settings

1. Login as admin
2. Navigate to: `/admin/settings`
3. Scroll to "Tripay Payment Gateway" section

### Step 2: Update Credentials

Your current credentials are already pre-filled:
- **Merchant Code:** T47159
- **API Key:** LYIV2DddSP0DnEaxiMyAYleC3EKAFdaIYalrB2Wd
- **Private Key:** BqOm1-ItF0o-LNlRZ-YhPK8-PZjNz
- **Mode:** Production
- **Callback URL:** https://gpittnsfzgkdbqnccncn.supabase.co/functions/v1/tripay-callback

### Step 3: Save Settings

Click "Save Settings" button at the bottom of the page.

### Step 4: Verify

After saving:
1. Credentials are stored in database
2. Edge Function will use these credentials automatically
3. No need to redeploy!

---

## 🔄 How It Works

### Payment Flow with Database Credentials

```
User creates payment
    ↓
Frontend calls Edge Function
    ↓
Edge Function reads credentials from database
    ↓ (if not found)
Edge Function uses environment variables (fallback)
    ↓
Calls Tripay API with credentials
    ↓
Payment created
```

### Credential Priority

1. **Database** (system_settings.tripay_config) - Primary
2. **Environment Variables** (Supabase Secrets) - Fallback

---

## 🧪 Testing

### Test 1: Verify Credentials Saved

```sql
-- Run in Supabase SQL Editor
SELECT tripay_config FROM system_settings LIMIT 1;
```

Expected result:
```json
{
  "merchant_code": "T47159",
  "api_key": "LYIV2DddSP0DnEaxiMyAYleC3EKAFdaIYalrB2Wd",
  "private_key": "BqOm1-ItF0o-LNlRZ-YhPK8-PZjNz",
  "mode": "production",
  "callback_url": "https://gpittnsfzgkdbqnccncn.supabase.co/functions/v1/tripay-callback"
}
```

### Test 2: Create Test Payment

1. Login as member
2. Go to Top-Up page
3. Enter amount: Rp 10,000
4. Select payment method: QRIS
5. Click "Bayar Sekarang"
6. Should redirect to Tripay checkout page

### Test 3: Check Edge Function Logs

```bash
# View logs
npx supabase functions logs tripay-create-payment --tail

# Look for:
# ✅ Using Tripay credentials from database
```

---

## 🔐 Security Notes

### Database Storage
- Credentials stored in `system_settings` table
- Only admins can access/modify
- RLS policies protect the data

### Private Key Protection
- Input field type: `password` (masked)
- Never exposed in frontend logs
- Only sent to Edge Function via secure connection

### Environment Variables (Fallback)
- Still configured in Supabase Secrets
- Used if database config is empty
- Provides redundancy

---

## 📝 Update Credentials

### When Merchant Changes

If you get new credentials from Tripay:

1. Go to `/admin/settings`
2. Update the fields:
   - Merchant Code
   - API Key
   - Private Key
3. Click "Save Settings"
4. Done! No deployment needed

### Callback URL Configuration

Make sure this URL is configured in Tripay Dashboard:
```
https://gpittnsfzgkdbqnccncn.supabase.co/functions/v1/tripay-callback
```

Steps:
1. Login to https://tripay.co.id/member
2. Go to Merchant Settings
3. Set Callback URL
4. Enable callback for all payment methods

---

## 🐛 Troubleshooting

### Credentials Not Working

**Check 1: Verify in Database**
```sql
SELECT tripay_config FROM system_settings;
```

**Check 2: Test Merchant Status**
- Login to Tripay dashboard
- Check if merchant T47159 is approved
- Verify API key is active

**Check 3: Edge Function Logs**
```bash
npx supabase functions logs tripay-create-payment
```

Look for errors like:
- "Invalid API key"
- "Merchant not found"
- "Tripay credentials not configured"

### Payment Creation Fails

**Error: "Tripay credentials not configured"**
- Credentials not saved in database
- Environment variables not set
- Check both sources

**Error: "Invalid API key"**
- API key incorrect
- Merchant not approved
- Using wrong mode (sandbox vs production)

**Error: "Signature verification failed"**
- Private key incorrect
- Check for extra spaces in credentials

---

## 📊 Monitoring

### Check Payment Success Rate

```sql
-- View recent payments
SELECT 
  created_at,
  tripay_status,
  tripay_payment_method,
  amount
FROM transactions
WHERE transaction_type = 'topup'
  AND created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

### Check Failed Payments

```sql
-- View failed payments
SELECT 
  created_at,
  tripay_status,
  metadata
FROM transactions
WHERE transaction_type = 'topup'
  AND status = 'failed'
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🎉 Summary

**What You Can Do Now:**
- ✅ Edit Tripay credentials via Admin UI
- ✅ No need to redeploy for credential changes
- ✅ Automatic fallback to environment variables
- ✅ Secure storage in database
- ✅ Production mode enabled

**Current Configuration:**
- Merchant: T47159 (Production)
- Mode: Production
- Callback: Configured
- Status: Ready for live payments

**Next Steps:**
1. Verify merchant T47159 is approved by Tripay
2. Test payment creation
3. Monitor Edge Function logs
4. Check callback receives payment confirmations

---

## 📞 Support

**If Issues Persist:**

1. **Check Tripay Dashboard:**
   - https://tripay.co.id/member
   - Verify merchant status
   - Check API key active

2. **Check Edge Function Logs:**
   ```bash
   npx supabase functions logs tripay-create-payment
   ```

3. **Contact Tripay Support:**
   - Email: support@tripay.co.id
   - Mention merchant code: T47159

---

**Status:** ✅ Ready to Use
**Last Updated:** 2025-11-29
**Version:** 1.0.0
