# 🔧 DNS Configuration Fix - canvango.com → Vercel

## 🚨 Current Problem

```
Domain: canvango.com
Current IP: 216.198.79.1 (Parking Server) ❌
Nameservers: ns1.idwebhost.id, ns2.idwebhost.id
Status: NOT pointing to Vercel
Result: HTTP 307 redirect, webhook GAGAL
```

## ✅ Solution Options

You have **2 options** to point domain to Vercel:

### Option A: Using Cloudflare (RECOMMENDED) ⭐

**Pros:**
- Free SSL/TLS
- DDoS protection
- Better performance (CDN)
- Analytics
- Caching

**Cons:**
- Need to change nameservers (propagation 24-48 hours)

### Option B: Direct to Vercel (Simple)

**Pros:**
- Quick setup (no nameserver change)
- Direct connection

**Cons:**
- No CDN
- No extra protection
- Less features

---

## 📋 Option A: Setup with Cloudflare (RECOMMENDED)

### Step 1: Add Domain to Cloudflare

1. Login to: https://dash.cloudflare.com
2. Click: **Add a Site**
3. Enter: `canvango.com`
4. Select: **Free Plan**
5. Click: **Continue**

### Step 2: Get Cloudflare Nameservers

Cloudflare will show you 2 nameservers, example:
```
ns1.cloudflare.com
ns2.cloudflare.com
```

**IMPORTANT:** Copy these nameservers, you'll need them in Step 3.

### Step 3: Change Nameservers at IDWebHost

1. Login to: https://my.idwebhost.com
2. Go to: **Domain Management** → **canvango.com**
3. Find: **Nameservers** section
4. Change from:
   ```
   ns1.idwebhost.id
   ns2.idwebhost.id
   ```
   To (your Cloudflare nameservers):
   ```
   ns1.cloudflare.com
   ns2.cloudflare.com
   ```
5. Click: **Save** or **Update**

**Note:** DNS propagation takes 24-48 hours, but usually works in 1-2 hours.

### Step 4: Configure DNS in Cloudflare

While waiting for nameserver propagation, configure DNS:

1. Go to: Cloudflare Dashboard → **DNS** → **Records**
2. **Delete all existing records** (especially A record pointing to 216.198.79.1)
3. **Add new records:**

#### Record 1: Root Domain
```
Type: CNAME
Name: @
Target: cname.vercel-dns.com
Proxy status: Proxied (orange cloud) ☁️
TTL: Auto
```

#### Record 2: WWW Subdomain
```
Type: CNAME
Name: www
Target: cname.vercel-dns.com
Proxy status: Proxied (orange cloud) ☁️
TTL: Auto
```

**IMPORTANT:** Make sure proxy is ON (orange cloud), not DNS only (gray cloud).

### Step 5: Configure SSL/TLS in Cloudflare

1. Go to: **SSL/TLS** → **Overview**
2. Set mode to: **Full (strict)**
3. Go to: **Edge Certificates**
4. Enable:
   - ✅ Always Use HTTPS
   - ✅ Automatic HTTPS Rewrites
   - ✅ Minimum TLS Version: 1.2

### Step 6: Add Domain to Vercel

1. Login to: https://vercel.com
2. Go to your project: **Canvango Group**
3. Go to: **Settings** → **Domains**
4. Click: **Add Domain**
5. Enter: `canvango.com`
6. Click: **Add**
7. Repeat for: `www.canvango.com`

Vercel will automatically verify the domain (may take a few minutes).

### Step 7: Verify DNS Propagation

Wait 1-2 hours, then check:

```bash
nslookup canvango.com
```

**Expected result:**
```
Name:    canvango.com
Address:  104.xxx.xxx.xxx  (Cloudflare IP)
```

Or:
```
Name:    canvango.com
Address:  172.xxx.xxx.xxx  (Cloudflare IP)
```

**Cloudflare IP ranges:**
- 104.16.0.0 - 104.31.255.255
- 172.64.0.0 - 172.71.255.255

### Step 8: Test Endpoint

```bash
curl -v -X POST https://canvango.com/api/tripay-callback ^
  -H "Content-Type: application/json" ^
  -d "{\"test\":true}"
```

**Expected:**
```
< HTTP/2 200
< content-type: application/json
...
{"success":false,"message":"Missing signature"}
```

---

## 📋 Option B: Direct to Vercel (Without Cloudflare)

### Step 1: Get Vercel Project Name

1. Login to: https://vercel.com
2. Go to your project
3. Copy project name from URL: `vercel.com/your-username/PROJECT-NAME`

### Step 2: Configure DNS at IDWebHost

1. Login to: https://my.idwebhost.com
2. Go to: **Domain Management** → **canvango.com** → **DNS Management**
3. **Delete** existing A record pointing to 216.198.79.1
4. **Add new records:**

#### Record 1: Root Domain
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600
```

#### Record 2: WWW Subdomain
```
Type: CNAME
Name: www
Value: PROJECT-NAME.vercel.app
TTL: 3600
```

Replace `PROJECT-NAME` with your actual Vercel project name.

### Step 3: Add Domain to Vercel

1. Login to: https://vercel.com
2. Go to your project
3. Go to: **Settings** → **Domains**
4. Click: **Add Domain**
5. Enter: `canvango.com`
6. Click: **Add**
7. Repeat for: `www.canvango.com`

### Step 4: Verify DNS

Wait 10-30 minutes, then check:

```bash
nslookup canvango.com
```

**Expected:**
```
Name:    canvango.com
Address:  76.76.21.21  (Vercel IP)
```

### Step 5: Test Endpoint

```bash
curl -v -X POST https://canvango.com/api/tripay-callback ^
  -H "Content-Type: application/json" ^
  -d "{\"test\":true}"
```

**Expected:**
```
< HTTP/2 200
< content-type: application/json
...
{"success":false,"message":"Missing signature"}
```

---

## 🔍 Verification Checklist

After DNS configuration:

- [ ] `nslookup canvango.com` returns Cloudflare or Vercel IP (not 216.198.79.1)
- [ ] `curl https://canvango.com` returns your React app (not parking page)
- [ ] `curl https://canvango.com/api/tripay-callback` returns HTTP 200 JSON
- [ ] Vercel dashboard shows domain as "Active"
- [ ] SSL certificate is valid (https works)

---

## 🧪 Test Scripts

### Test 1: Check DNS Resolution

```bash
# Windows
nslookup canvango.com

# Expected: Cloudflare (104/172) or Vercel (76.76.21.21)
# NOT: 216.198.79.1
```

### Test 2: Check HTTP Response

```bash
curl -v https://canvango.com
```

**Expected:** Your React app HTML
**NOT:** Parking page or "Domain for sale"

### Test 3: Check API Endpoint

```bash
curl -v -X POST https://canvango.com/api/tripay-callback ^
  -H "Content-Type: application/json" ^
  -d "{\"test\":true}"
```

**Expected:**
```
HTTP/2 200
{"success":false,"message":"Missing signature"}
```

**NOT:**
```
HTTP/1.1 307 Temporary Redirect
Redirecting...
```

### Test 4: Check from Tripay Dashboard

1. Login: https://tripay.co.id/member/merchant
2. Go to: **Developer** → **Callback**
3. URL: `https://canvango.com/api/tripay-callback`
4. Click: **Test Callback**

**Expected:**
```
Kode HTTP: 200 ✅
Status Koneksi: BERHASIL ✅
Status Callback: BERHASIL ✅
```

---

## ⚠️ Common Issues

### Issue 1: DNS Not Propagating

**Symptom:** Still getting 216.198.79.1 after hours

**Solution:**
1. Clear DNS cache:
   ```bash
   ipconfig /flushdns
   ```
2. Check with different DNS:
   ```bash
   nslookup canvango.com 8.8.8.8
   ```
3. Wait longer (up to 48 hours for full propagation)

### Issue 2: SSL Certificate Error

**Symptom:** "Your connection is not private" or SSL error

**Solution:**
1. Wait 10-15 minutes for Vercel to provision SSL
2. Check Vercel dashboard → Domains → Certificate status
3. If using Cloudflare, ensure SSL mode is "Full (strict)"

### Issue 3: Still Getting 307 Redirect

**Symptom:** Endpoint returns 307 even after DNS is correct

**Solution:**
1. Check `vercel.json` rewrites (see below)
2. Clear Cloudflare cache (if using Cloudflare)
3. Redeploy Vercel project

### Issue 4: 404 Not Found on API Endpoint

**Symptom:** `/api/tripay-callback` returns 404

**Solution:**
1. Verify file exists: `api/tripay-callback.ts`
2. Check Vercel deployment logs
3. Ensure `vercel.json` doesn't block API routes

---

## 📝 Verify vercel.json Configuration

Your current `vercel.json` should look like this:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "functions": {
    "api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 10
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache, no-store, must-revalidate"
        },
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "POST, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, X-Callback-Signature, X-Callback-Event"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/((?!api).*)",
      "destination": "/index.html"
    }
  ]
}
```

**Key points:**
- ✅ Rewrites exclude `/api/*` routes
- ✅ API routes go to serverless functions
- ✅ Other routes go to SPA (index.html)

---

## 🎯 Timeline

### Option A (Cloudflare):
- **0-5 min:** Add domain to Cloudflare, configure DNS
- **5-10 min:** Change nameservers at IDWebHost
- **1-2 hours:** DNS propagation (usually)
- **Up to 48 hours:** Full global propagation

### Option B (Direct):
- **0-5 min:** Configure DNS at IDWebHost
- **10-30 min:** DNS propagation
- **Up to 24 hours:** Full global propagation

---

## 📞 Support Resources

### IDWebHost Support
- Website: https://idwebhost.com
- Support: https://my.idwebhost.com/submitticket.php
- Phone: Check their website

### Cloudflare Support
- Docs: https://developers.cloudflare.com
- Community: https://community.cloudflare.com

### Vercel Support
- Docs: https://vercel.com/docs
- Support: https://vercel.com/support

---

## ✅ Success Criteria

Your DNS is correctly configured when:

1. ✅ `nslookup canvango.com` returns Cloudflare or Vercel IP
2. ✅ `https://canvango.com` shows your React app
3. ✅ `https://canvango.com/api/tripay-callback` returns HTTP 200
4. ✅ Tripay test callback shows "BERHASIL"
5. ✅ No 307 redirects
6. ✅ SSL certificate is valid

---

## 🚀 Recommended: Option A (Cloudflare)

I strongly recommend **Option A (Cloudflare)** because:

1. **Free SSL/TLS** - Automatic HTTPS
2. **DDoS Protection** - Security layer
3. **CDN** - Faster global access
4. **Analytics** - Traffic insights
5. **Caching** - Better performance
6. **Firewall** - Block malicious requests

The only downside is nameserver propagation time (1-48 hours), but it's worth it for the benefits.

---

## 📋 Quick Action Plan

**Right now:**
1. Choose Option A or B
2. Follow the steps above
3. Wait for DNS propagation
4. Test with curl
5. Test with Tripay dashboard

**After DNS is live:**
1. Monitor Vercel logs
2. Test real transaction (small amount)
3. Verify balance updates in Supabase
4. Celebrate! 🎉
