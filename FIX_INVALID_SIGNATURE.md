# Fix: Invalid Signature Error

## 🚨 Problem

Tripay test callback returns:
```json
{"success": false, "message": "Invalid signature"}
```

**Status Callback: GAGAL ❌**

## 🔍 Root Cause

Environment variable `TRIPAY_PRIVATE_KEY` is either:
1. Not set in Vercel
2. Has wrong value
3. Still using old variable name (`VITE_TRIPAY_PRIVATE_KEY`)

## ✅ Solution

### Step 1: Check Tripay Private Key

1. Login to **Tripay Merchant Dashboard**
2. Go to: **Pengaturan → API Key**
3. Copy your **Private Key**

Example: `BqOm1-ItF0o-LNlRZ-YhPK8-PZjNz`

### Step 2: Update Vercel Environment Variable

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to: **Settings → Environment Variables**

**Find and update:**

```
Name: TRIPAY_PRIVATE_KEY
Value: (paste your private key from Tripay)
Environment: Production, Preview, Development
```

**Important:**
- Variable name MUST be `TRIPAY_PRIVATE_KEY` (not `VITE_TRIPAY_PRIVATE_KEY`)
- No extra spaces before or after the value
- No quotes around the value

### Step 3: Redeploy

**Option A: Automatic**
- Vercel will redeploy automatically after env var change
- Wait 1-2 minutes

**Option B: Manual**
- Go to: Deployments
- Click "Redeploy" on latest deployment

### Step 4: Test Again

1. Wait for deployment to complete (status: Ready)
2. Go to Tripay Dashboard
3. Pengaturan → Callback
4. Click "Test Callback"

**Expected Result:**
```
✅ Kode HTTP: 200
✅ Status Koneksi: BERHASIL
✅ Status Callback: BERHASIL

Response:
{"success": true, "message": "Test callback acknowledged"}
```

## 🔍 Debugging

### Check Vercel Logs

```bash
vercel logs --follow
```

Look for:
```
[Tripay Callback] ✅ Signature verified
```

If you see:
```
[Tripay Callback] Invalid signature
```

Then the private key is still wrong.

### Verify Environment Variable

In Vercel Dashboard:
1. Settings → Environment Variables
2. Check `TRIPAY_PRIVATE_KEY` exists
3. Click "Edit" to verify the value
4. Compare with Tripay Dashboard

### Common Mistakes

❌ **Wrong variable name:**
```
VITE_TRIPAY_PRIVATE_KEY  // ❌ Wrong (old name)
TRIPAY_PRIVATE_KEY       // ✅ Correct (new name)
```

❌ **Extra spaces:**
```
" BqOm1-ItF0o-LNlRZ-YhPK8-PZjNz "  // ❌ Has spaces
"BqOm1-ItF0o-LNlRZ-YhPK8-PZjNz"    // ✅ No spaces
```

❌ **Wrong environment:**
```
Environment: Production only  // ❌ Missing Preview/Development
Environment: All              // ✅ Correct
```

## 🧪 Test Signature Locally

You can test signature calculation locally:

```javascript
const crypto = require('crypto');

const privateKey = 'BqOm1-ItF0o-LNlRZ-YhPK8-PZjNz'; // Your key
const rawBody = '{"reference":"6565","merchant_ref":"346","payment_method":"QRIS","payment_method_code":"QRIS2","total_amount":10000}';

const signature = crypto
  .createHmac('sha256', privateKey)
  .update(rawBody)
  .digest('hex');

console.log('Calculated signature:', signature);
console.log('Expected from Tripay:', '0c96a83fedc0b04ff6db6e1b67f57d8c858ba66d06198cb93a1b49f8ee101eab');
```

If signatures match, your private key is correct.

## 📊 Verification Checklist

- [ ] Private key copied from Tripay Dashboard
- [ ] Environment variable name is `TRIPAY_PRIVATE_KEY`
- [ ] No extra spaces in value
- [ ] Applied to all environments (Production, Preview, Development)
- [ ] Deployment completed (status: Ready)
- [ ] Test callback returns BERHASIL

## 🎯 Quick Fix Commands

```bash
# Check current deployment
vercel ls

# Check environment variables
vercel env ls

# Redeploy
vercel --prod
```

## 📞 Still Not Working?

If signature is still invalid after following all steps:

1. **Double-check private key** in Tripay Dashboard
2. **Copy-paste carefully** - no extra characters
3. **Remove old variables** - delete `VITE_TRIPAY_PRIVATE_KEY` if exists
4. **Wait for deployment** - give it 2-3 minutes
5. **Check Vercel logs** - look for actual error messages

## ✅ Success Indicators

When fixed, you'll see:

**Tripay Dashboard:**
```
✅ Status Callback: BERHASIL
Response: {"success": true, "message": "Test callback acknowledged"}
```

**Vercel Logs:**
```
[Tripay Callback] ✅ Signature verified
[Tripay Callback] Test callback - no merchant_ref or reference
```

---

**Most Common Fix:** Update `TRIPAY_PRIVATE_KEY` in Vercel with correct value from Tripay Dashboard
