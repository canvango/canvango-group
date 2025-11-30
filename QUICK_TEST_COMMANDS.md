# 🚀 Quick Test Commands - Copy & Paste

## Test 1: GET Request (Should return 200 with error)

```bash
curl -i -X GET https://canvango.com/api/tripay-callback
```

**Expected:**
```
HTTP/2 200
content-type: application/json

{"success":false,"message":"Method not allowed"}
```

---

## Test 2: POST without Signature

```bash
curl -i -X POST https://canvango.com/api/tripay-callback \
  -H "Content-Type: application/json" \
  -d '{"test":"data"}'
```

**Expected:**
```
HTTP/2 200
content-type: application/json

{"success":false,"message":"Missing signature"}
```

---

## Test 3: POST with Invalid Signature

```bash
curl -i -X POST https://canvango.com/api/tripay-callback \
  -H "Content-Type: application/json" \
  -H "X-Callback-Signature: invalid_signature_123" \
  -d '{"merchant_ref":"TEST-123","status":"PAID"}'
```

**Expected:**
```
HTTP/2 200
content-type: application/json

{"success":false,"message":"Invalid signature"}
```

---

## Test 4: OPTIONS Request (CORS)

```bash
curl -i -X OPTIONS https://canvango.com/api/tripay-callback \
  -H "Origin: https://tripay.co.id" \
  -H "Access-Control-Request-Method: POST"
```

**Expected:**
```
HTTP/2 200
access-control-allow-origin: *
access-control-allow-methods: POST, OPTIONS
access-control-allow-headers: Content-Type, X-Callback-Signature
```

---

## Test 5: Automated Test Script

**Node.js:**
```bash
node test-tripay-callback-production.js
```

**Windows:**
```bash
test-callback-curl.bat production
```

**Linux/Mac:**
```bash
bash test-callback-curl.sh production
```

---

## ✅ Success Criteria

All tests should return:
- ✅ HTTP Status: **200 OK** (NOT 307, 404, or 500)
- ✅ Content-Type: **application/json** (NOT text/html)
- ✅ Response body: Valid JSON with `success` field

---

## 🔍 Check Vercel Logs

After running tests, check logs:

1. Open: https://vercel.com/dashboard
2. Select: **canvango** project
3. Click: **Logs** tab
4. Filter: `api/tripay-callback`

**Expected log entries:**
```
=== TRIPAY CALLBACK RECEIVED ===
Method: POST
Time: 2025-11-30T...
IP: xxx.xxx.xxx.xxx
Body length: ...
Merchant Ref: ...
Status: ...
```

---

## 🎯 Tripay Dashboard Test

**URL:** https://tripay.co.id/member

**Steps:**
1. Login to Tripay dashboard
2. Navigate: **Settings → Callback URL**
3. Verify URL: `https://canvango.com/api/tripay-callback`
4. Click: **Test Callback** button

**Expected Result:**
```
✅ Status Koneksi: BERHASIL
✅ Status Callback: BERHASIL
✅ Kode HTTP: 200
```

---

## 📊 Database Verification

**Check recent transactions:**
```sql
SELECT 
  merchant_ref,
  status,
  payment_method,
  total_amount,
  paid_at,
  updated_at
FROM transactions
ORDER BY updated_at DESC
LIMIT 5;
```

**Check user balance:**
```sql
SELECT 
  u.email,
  u.balance,
  t.merchant_ref,
  t.status,
  t.amount
FROM users u
JOIN transactions t ON t.user_id = u.id
WHERE t.updated_at > NOW() - INTERVAL '1 hour'
ORDER BY t.updated_at DESC;
```

---

## 🐛 Troubleshooting

### If you get 307 Redirect:
```bash
# Clear Vercel cache and redeploy
# Vercel Dashboard → Deployments → ... → Redeploy
```

### If you get 500 Error:
```bash
# Check environment variables in Vercel
# Verify SUPABASE_SERVICE_ROLE_KEY is set
```

### If signature is invalid:
```bash
# Verify VITE_TRIPAY_PRIVATE_KEY in Vercel
# Production: Fz27s-v8gGt-jDE8e-04Tbw-de1vi
# Sandbox: BAo71-gUqRM-IahAp-Gt8AM-IS7Iq
```

---

**Quick Start:** Copy Test 1 command and run it now! 🚀
