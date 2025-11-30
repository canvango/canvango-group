# Root Cause Analysis: 307 Redirect (FINAL)

## ✅ Yang Sudah Benar

Dari Vercel Dashboard screenshot:
- ✅ Auto-deploy dari GitHub **WORKING**
- ✅ Latest deployment (FinaTnpJB2) adalah **Production**
- ✅ File `api/tripay-callback.ts` **EXISTS**
- ✅ vercel.json configuration **CORRECT**

## 🔴 Masalah Sebenarnya

Jika deployment sudah production dan file ada, tapi masih 307, kemungkinan:

### 1. **Trailing Slash Issue**

Vercel secara default handle trailing slash dengan redirect:

```
Request: POST /api/tripay-callback/  (dengan trailing slash)
Vercel: 307 Redirect ke /api/tripay-callback (tanpa trailing slash)
```

**TriPay mungkin mengirim request dengan trailing slash!**

### 2. **HTTP Method Mismatch**

```typescript
// api/tripay-callback.ts
if (req.method !== 'POST') {
  return res.status(405).json({ ... });
}
```

Jika TriPay mengirim OPTIONS (CORS preflight) atau GET, akan ditolak.

### 3. **Vercel Serverless Function Cold Start**

Kemungkinan kecil, tapi bisa terjadi:
```
First request → Cold start → Timeout → 307 Redirect
```

### 4. **URL Encoding Issue**

TriPay mungkin encode URL dengan cara yang tidak expected:
```
Expected: /api/tripay-callback
Actual: /api/tripay-callback%20 (dengan space)
Result: 307 Redirect
```

---

## 🔍 Debugging Steps

### Step 1: Check Vercel Function Logs

**Vercel Dashboard → Logs**

Filter:
```
Path: /api/tripay-callback
Time: Last 1 hour
```

Look for:
- ❌ Tidak ada log sama sekali → Request tidak sampai ke function
- ✅ Ada log error → Function executed tapi error
- ✅ Ada log 307 → Vercel routing issue

### Step 2: Test dengan Exact URL

Test dengan berbagai variasi:

```bash
# Test 1: Tanpa trailing slash
curl -X POST https://canvango.com/api/tripay-callback

# Test 2: Dengan trailing slash
curl -X POST https://canvango.com/api/tripay-callback/

# Test 3: Dengan query string
curl -X POST https://canvango.com/api/tripay-callback?test=1

# Test 4: OPTIONS request (CORS preflight)
curl -X OPTIONS https://canvango.com/api/tripay-callback
```

Lihat mana yang return 307.

### Step 3: Check TriPay Callback URL Configuration

**TriPay Dashboard → Settings → Callback URL**

Pastikan:
```
✅ https://canvango.com/api/tripay-callback (exact, no trailing slash)
❌ https://canvango.com/api/tripay-callback/ (dengan trailing slash)
❌ https://canvango.com/api/tripay-callback?param=value
```

---

## 🎯 Kemungkinan Solusi

### Solusi 1: Handle Trailing Slash di vercel.json

Tambahkan konfigurasi untuk handle trailing slash:

```json
{
  "trailingSlash": false,
  "functions": {
    "api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

### Solusi 2: Add Rewrite Rule

Jika TriPay mengirim dengan trailing slash, rewrite:

```json
{
  "rewrites": [
    {
      "source": "/api/tripay-callback/",
      "destination": "/api/tripay-callback"
    }
  ],
  "functions": {
    "api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

### Solusi 3: Handle OPTIONS Method (CORS)

Update `api/tripay-callback.ts`:

```typescript
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Callback-Signature');
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  // ... rest of code
}
```

### Solusi 4: Add Logging untuk Debug

Tambahkan logging di awal function:

```typescript
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Log semua request details
  console.log('=== CALLBACK REQUEST ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', JSON.stringify(req.headers));
  console.log('========================');

  // ... rest of code
}
```

Deploy dan check logs untuk lihat apa yang sebenarnya diterima.

---

## 🧪 Test Scenario

### Scenario 1: Trailing Slash

**Hypothesis:** TriPay mengirim dengan trailing slash

**Test:**
```bash
curl -X POST https://canvango.com/api/tripay-callback/ \
  -H "Content-Type: application/json" \
  -H "X-Callback-Signature: test" \
  -d '{"test":"data"}' \
  -v
```

**Expected if hypothesis correct:**
```
< HTTP/1.1 307 Temporary Redirect
< Location: /api/tripay-callback
```

**Fix:** Add `"trailingSlash": false` to vercel.json

### Scenario 2: CORS Preflight

**Hypothesis:** Browser/TriPay mengirim OPTIONS dulu

**Test:**
```bash
curl -X OPTIONS https://canvango.com/api/tripay-callback -v
```

**Expected if hypothesis correct:**
```
< HTTP/1.1 405 Method Not Allowed
atau
< HTTP/1.1 307 Temporary Redirect
```

**Fix:** Handle OPTIONS method in function

### Scenario 3: Wrong Content-Type

**Hypothesis:** TriPay mengirim dengan Content-Type yang berbeda

**Test:**
```bash
# Test dengan form-urlencoded
curl -X POST https://canvango.com/api/tripay-callback \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "test=data" \
  -v
```

**Fix:** Accept multiple content types

---

## 📊 Diagnostic Checklist

Run these checks:

### 1. Vercel Function Logs
```
Vercel Dashboard → Logs → Filter by /api/tripay-callback
```
- [ ] Ada log request masuk?
- [ ] Ada error message?
- [ ] Status code berapa?

### 2. Network Tab (Browser)
```
Open TriPay Callback Tester
Open Browser DevTools → Network
Send test callback
```
- [ ] Request method apa? (POST/OPTIONS/GET)
- [ ] Request URL exact apa?
- [ ] Response headers apa?
- [ ] Ada Location header?

### 3. Curl Test
```bash
curl -X POST https://canvango.com/api/tripay-callback \
  -H "Content-Type: application/json" \
  -H "X-Callback-Signature: test" \
  -d '{"test":"data"}' \
  -v 2>&1 | grep -E "HTTP|Location"
```
- [ ] Status code berapa?
- [ ] Ada Location header?
- [ ] Redirect ke mana?

### 4. TriPay Callback URL
```
TriPay Dashboard → Settings
```
- [ ] URL exact: `https://canvango.com/api/tripay-callback`
- [ ] Tidak ada trailing slash?
- [ ] Tidak ada query parameters?

---

## 🎯 Most Likely Cause

Berdasarkan evidence:

**Ranking kemungkinan:**

1. **Trailing Slash (80%)** - Paling sering terjadi
   - TriPay mengirim ke `/api/tripay-callback/`
   - Vercel redirect ke `/api/tripay-callback`
   - Fix: Add `"trailingSlash": false` to vercel.json

2. **CORS Preflight (15%)** - Jika TriPay test dari browser
   - Browser send OPTIONS dulu
   - Function tidak handle OPTIONS
   - Fix: Handle OPTIONS method

3. **URL Encoding (5%)** - Jarang tapi mungkin
   - TriPay encode URL dengan cara aneh
   - Vercel tidak recognize route
   - Fix: Add rewrite rules

---

## 🚀 Immediate Action

**Quick Fix (Test semua kemungkinan):**

1. **Update vercel.json:**
```json
{
  "trailingSlash": false,
  "rewrites": [
    {
      "source": "/api/tripay-callback/:path*",
      "destination": "/api/tripay-callback"
    }
  ],
  "functions": {
    "api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

2. **Update api/tripay-callback.ts (handle OPTIONS):**
```typescript
// Add at the beginning of handler
if (req.method === 'OPTIONS') {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Callback-Signature');
  return res.status(200).end();
}
```

3. **Deploy:**
```bash
git add .
git commit -m "fix: handle trailing slash and CORS for callback"
git push
```

4. **Wait 2 minutes for deployment**

5. **Test again from TriPay**

---

## 📝 Next Steps

1. **Check Vercel Logs** - Lihat apa yang sebenarnya terjadi
2. **Test dengan curl** - Reproduce issue locally
3. **Apply fix** - Based on findings
4. **Verify** - Test dari TriPay lagi

**Status:** 🔍 NEED MORE DATA
**Action:** Check Vercel logs first
