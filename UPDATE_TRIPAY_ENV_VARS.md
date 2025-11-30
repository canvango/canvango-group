# Update Tripay Environment Variables - Correct Values

## ✅ Correct Tripay Credentials

```
Merchant Code: T47159
API Key: QfvISlE5WUUu4Eyxqcj6pJ3BMsdIZgKHZyWG17ZP
Private Key: Fz27s-v8gGt-jDE8e-04Tbw-de1vi
```

## 🔧 Update in Vercel (3 minutes)

### Step 1: Go to Vercel Dashboard

1. Open: https://vercel.com/dashboard
2. Select your project: **canvango-group**
3. Go to: **Settings → Environment Variables**

### Step 2: Remove Old Variables (if exist)

Delete these if they exist:
- ❌ `VITE_TRIPAY_PRIVATE_KEY`
- ❌ `VITE_TRIPAY_API_KEY`
- ❌ `VITE_TRIPAY_MERCHANT_CODE`

### Step 3: Add/Update New Variables

**Variable 1: TRIPAY_PRIVATE_KEY**
```
Name: TRIPAY_PRIVATE_KEY
Value: Fz27s-v8gGt-jDE8e-04Tbw-de1vi
Environment: ✅ Production ✅ Preview ✅ Development
```

**Variable 2: TRIPAY_API_KEY** (optional, for API calls)
```
Name: TRIPAY_API_KEY
Value: QfvISlE5WUUu4Eyxqcj6pJ3BMsdIZgKHZyWG17ZP
Environment: ✅ Production ✅ Preview ✅ Development
```

**Variable 3: TRIPAY_MERCHANT_CODE** (optional, for reference)
```
Name: TRIPAY_MERCHANT_CODE
Value: T47159
Environment: ✅ Production ✅ Preview ✅ Development
```

**Variable 4: SUPABASE_URL** (keep existing)
```
Name: SUPABASE_URL
Value: https://gpittnsfzgkdbqnccncn.supabase.co
Environment: ✅ Production ✅ Preview ✅ Development
```

**Variable 5: SUPABASE_SERVICE_ROLE_KEY** (keep existing)
```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: (your existing service role key)
Environment: ✅ Production ✅ Preview ✅ Development
```

### Step 4: Save and Redeploy

1. Click **"Save"** after adding each variable
2. Vercel will automatically trigger a redeploy
3. Wait 1-2 minutes for deployment to complete

### Step 5: Verify Deployment

1. Go to: **Deployments** tab
2. Wait until latest deployment shows: **"Ready"**
3. Check deployment logs for any errors

## 🧪 Test Callback

### Test in Tripay Dashboard

1. Login to **Tripay Merchant Dashboard**
2. Go to: **Pengaturan → Callback**
3. URL: `https://canvango.com/api/tripay-callback`
4. Click **"Test Callback"**

**Expected Result:**
```
✅ Kode HTTP: 200
✅ Status Koneksi: BERHASIL
✅ Status Callback: BERHASIL

Response:
{"success": true, "message": "Test callback acknowledged"}
```

## 🔍 Verify in Vercel Logs

After test callback, check Vercel logs:

```
=== TRIPAY CALLBACK RECEIVED ===
[Tripay Callback] Merchant Ref: 346
[Tripay Callback] Reference: 6565
[Tripay Callback] Status: PAID
[Tripay Callback] ✅ Signature verified
[Tripay Callback] Test callback - no merchant_ref or reference
```

If you see **"✅ Signature verified"**, it's working!

## ⚠️ Important Notes

### Private Key Format

**Correct:**
```
Fz27s-v8gGt-jDE8e-04Tbw-de1vi
```

**Wrong (with spaces):**
```
 Fz27s-v8gGt-jDE8e-04Tbw-de1vi 
```

**Wrong (with quotes):**
```
"Fz27s-v8gGt-jDE8e-04Tbw-de1vi"
```

### Variable Names

**Correct (for server-side):**
```
TRIPAY_PRIVATE_KEY
TRIPAY_API_KEY
TRIPAY_MERCHANT_CODE
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

**Wrong (old frontend names):**
```
VITE_TRIPAY_PRIVATE_KEY
VITE_TRIPAY_API_KEY
VITE_SUPABASE_URL
```

## ✅ Verification Checklist

After updating:

- [ ] `TRIPAY_PRIVATE_KEY` = `Fz27s-v8gGt-jDE8e-04Tbw-de1vi`
- [ ] `TRIPAY_API_KEY` = `QfvISlE5WUUu4Eyxqcj6pJ3BMsdIZgKHZyWG17ZP`
- [ ] `TRIPAY_MERCHANT_CODE` = `T47159`
- [ ] `SUPABASE_URL` = `https://gpittnsfzgkdbqnccncn.supabase.co`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = (existing value)
- [ ] All variables applied to: Production, Preview, Development
- [ ] Deployment completed (status: Ready)
- [ ] Test callback returns: BERHASIL ✅

## 🎯 Success Criteria

When everything is correct:

**Tripay Test Callback:**
```
✅ Status Callback: BERHASIL
Response: {"success": true, "message": "Test callback acknowledged"}
```

**Vercel Logs:**
```
[Tripay Callback] ✅ Signature verified
```

**Real Payment:**
- Transaction status updates to 'completed'
- User balance increases
- No errors in logs

## 🚨 Troubleshooting

### Still Getting "Invalid signature"?

1. **Double-check private key** - must be exactly: `Fz27s-v8gGt-jDE8e-04Tbw-de1vi`
2. **No extra spaces** - copy-paste carefully
3. **Correct variable name** - must be `TRIPAY_PRIVATE_KEY`
4. **Wait for deployment** - give it 2-3 minutes
5. **Check Vercel logs** - look for actual signature calculation

### Deployment Not Triggering?

1. Go to Vercel Dashboard → Deployments
2. Click "Redeploy" manually
3. Wait for "Ready" status

### Still Not Working?

1. Check all 5 environment variables are present
2. Verify no typos in variable names
3. Ensure all applied to Production environment
4. Check Vercel logs for detailed error messages

---

**Summary:**
- Private Key: `Fz27s-v8gGt-jDE8e-04Tbw-de1vi`
- Variable Name: `TRIPAY_PRIVATE_KEY`
- No spaces, no quotes, exact match
