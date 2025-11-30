# 🔑 Update Production Keys - Tripay

## 📋 Production Credentials

**From Tripay Dashboard:**
```
Kode Merchant: T47159
API Key: QfvISlE5WUUu4Eyxqcj6pJ3BMsdIZgKHZyWG17ZP
Private Key: Fz27s-v8gGt-jDE8e-04Tbw-de1vi
```

---

## ✅ Implementation Verification

### Our Implementation vs Tripay Documentation:

**✅ Signature Calculation (CORRECT):**
```typescript
// Tripay Documentation (Node.js):
const signature = crypto.createHmac("sha256", privateKey)
  .update(JSON.stringify(json))
  .digest('hex');

// Our Implementation (Deno):
const hmac = createHmac('sha256', tripayPrivateKey);
hmac.update(rawBody);  // rawBody is already string
const calculatedSignature = hmac.digest('hex');
```

**Status:** ✅ SAMA - Menggunakan HMAC-SHA256 dengan raw body

---

**✅ Signature Verification (CORRECT):**
```typescript
// Tripay Documentation:
if ($signature !== (string) $callbackSignature) {
  return Response::json(['success' => false, 'message' => 'Invalid signature']);
}

// Our Implementation:
if (calculatedSignature !== callbackSignature) {
  return new Response(
    JSON.stringify({ success: false, message: 'Invalid signature' }),
    { status: 401 }
  );
}
```

**Status:** ✅ SAMA - Compare signature sebelum process

---

**✅ Success Response (CORRECT):**
```typescript
// Tripay Documentation:
return Response::json(['success' => true]);

// Our Implementation:
return new Response(
  JSON.stringify({ success: true }),
  { status: 200 }
);
```

**Status:** ✅ SAMA - Return `{"success": true}` untuk success

---

## 🚀 Update Supabase Secrets

### Step 1: Check Current Secrets

```bash
npx supabase secrets list
```

**Expected output:**
```
TRIPAY_PRIVATE_KEY (set)
SUPABASE_URL (set)
SUPABASE_SERVICE_ROLE_KEY (set)
```

---

### Step 2: Update Production Private Key

**⚠️ IMPORTANT:** Pastikan menggunakan **Production Private Key**, bukan Sandbox!

```bash
# Update to PRODUCTION key
npx supabase secrets set TRIPAY_PRIVATE_KEY=Fz27s-v8gGt-jDE8e-04Tbw-de1vi
```

**Expected output:**
```
Setting secret TRIPAY_PRIVATE_KEY...
Secret TRIPAY_PRIVATE_KEY updated successfully
```

---

### Step 3: Verify Secret Updated

```bash
npx supabase secrets list
```

**Should show:**
```
TRIPAY_PRIVATE_KEY (updated just now)
```

---

### Step 4: Restart Edge Function (Optional)

Edge Function will automatically use new secret on next invocation.

But to force restart:
```bash
# Redeploy edge function
npx supabase functions deploy tripay-callback
```

---

## 🧪 Test After Update

### Test 1: With Invalid Signature (Should Fail)
```bash
curl -X POST https://canvango.com/api/tripay-callback \
  -H "Content-Type: application/json" \
  -H "X-Callback-Signature: invalid_signature" \
  -d '{"reference":"TEST","merchant_ref":"123","status":"PAID"}'
```

**Expected:**
```json
{"success":false,"message":"Invalid signature"}
```

---

### Test 2: With Tripay Callback Tester (Should Work)

1. Go to: https://tripay.co.id/simulator/console/callback
2. Select a transaction
3. Click "Send Callback"

**Expected:**
```
✅ Kode HTTP: 200 (OK)
✅ Status Koneksi: BERHASIL
✅ Status Callback: BERHASIL
✅ Response: {"success": true}
```

---

### Test 3: Real Payment (Final Test)

1. Create topup Rp 10,000
2. Pay via QRIS
3. Wait for callback (automatic)
4. Verify:
   - Transaction status: completed
   - Balance: increased by Rp 10,000
   - No errors in logs

---

## 📊 Comparison: Sandbox vs Production

### Sandbox (Current - OLD):
```
Kode Merchant: T47116
API Key: DEV-V745CsasrrsQ4BslYS5dzwbJZ6wLudy5joxBGq1G
Private Key: BAo71-gUqRM-IahAp-Gt8AM-IS7Iq
Mode: Sandbox
```

### Production (NEW):
```
Kode Merchant: T47159
API Key: QfvISlE5WUUu4Eyxqcj6pJ3BMsdIZgKHZyWG17ZP
Private Key: Fz27s-v8gGt-jDE8e-04Tbw-de1vi
Mode: Production
```

---

## 🔄 Update GCP VM (Optional)

If you want to update GCP VM to use production keys:

```bash
# SSH to GCP VM
cd ~/tripay-proxy

# Edit .env
nano .env
```

**Update these values:**
```env
TRIPAY_API_KEY=QfvISlE5WUUu4Eyxqcj6pJ3BMsdIZgKHZyWG17ZP
TRIPAY_PRIVATE_KEY=Fz27s-v8gGt-jDE8e-04Tbw-de1vi
TRIPAY_MERCHANT_CODE=T47159
IS_PRODUCTION=true
```

**Save and restart:**
```bash
pm2 restart tripay-proxy
pm2 logs tripay-proxy
```

---

## 📝 Update Database Settings

```sql
-- Update to production mode
UPDATE tripay_settings 
SET is_production = true,
    updated_at = NOW()
WHERE id = 'e3b84c2a-3a90-4aea-9814-11eb87582645';

-- Verify
SELECT is_production FROM tripay_settings;
```

---

## ✅ Checklist

**Before going live:**

- [ ] Update TRIPAY_PRIVATE_KEY in Supabase secrets
- [ ] Update GCP VM .env (optional)
- [ ] Update database is_production flag
- [ ] Test with Tripay Callback Tester
- [ ] Test with real payment (small amount)
- [ ] Verify transaction updated
- [ ] Verify balance increased
- [ ] Monitor logs for 24 hours

---

## 🎯 Expected Behavior After Update

### Test Callback (Invalid Signature):
```
Request: Test signature
Response: {"success": false, "message": "Invalid signature"}
Status: ❌ GAGAL (expected)
```

### Real Callback (Valid Signature):
```
Request: Real Tripay callback with valid signature
Response: {"success": true}
Status: ✅ BERHASIL
```

---

## 🚨 Important Notes

1. **Private Key is SECRET** - Never commit to git
2. **Production vs Sandbox** - Make sure using correct key
3. **Test first** - Always test with small amount first
4. **Monitor logs** - Check Supabase Edge Function logs
5. **Backup** - Keep old sandbox key for testing

---

## 📞 If Issues After Update

### Issue: Still getting "Invalid signature"

**Check:**
1. Private key updated correctly in Supabase
2. Using production key, not sandbox
3. Edge Function restarted (automatic on next call)

**Solution:**
```bash
# Verify secret
npx supabase secrets list

# Redeploy if needed
npx supabase functions deploy tripay-callback
```

---

### Issue: Transaction not found

**Check:**
1. Transaction created in database first
2. merchant_ref matches transaction ID
3. Transaction not expired

**Solution:**
- Create transaction from app before payment
- Use correct merchant_ref format

---

## 🎉 Ready for Production!

After updating keys and testing:

1. ✅ Signature verification with production key
2. ✅ Callback returns `{"success": true}`
3. ✅ Transaction status updated
4. ✅ Balance increased
5. ✅ No errors in logs

**Status:** READY FOR PRODUCTION! 🚀

---

**Created:** 2025-11-30  
**Production Keys:** Updated  
**Next:** Test with real payment
