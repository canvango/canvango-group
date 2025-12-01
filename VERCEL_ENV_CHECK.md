# ⚠️ VERCEL ENVIRONMENT VARIABLES CHECK

## 🔧 Required Environment Variables

Untuk API route `api/tripay-proxy.ts` berfungsi dengan baik, pastikan environment variables berikut sudah di-set di Vercel Dashboard:

### **1. Supabase Configuration**

```env
SUPABASE_URL=https://gpittnsfzgkdbqnccncn.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (CRITICAL!)
```

**⚠️ CRITICAL:** `SUPABASE_SERVICE_ROLE_KEY` diperlukan untuk:
- Insert transaction ke database
- Update transaction status
- Bypass RLS policies

### **2. GCP Proxy Configuration**

```env
GCP_PROXY_URL=http://34.182.126.200:3000
```

---

## 📋 How to Set Environment Variables in Vercel

### **Via Vercel Dashboard:**

1. Buka https://vercel.com/dashboard
2. Pilih project: `canvango-group`
3. Go to **Settings** → **Environment Variables**
4. Add/Update variables:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `SUPABASE_URL` | `https://gpittnsfzgkdbqnccncn.supabase.co` | Production, Preview, Development |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Production, Preview, Development |
| `GCP_PROXY_URL` | `http://34.182.126.200:3000` | Production, Preview, Development |

5. Click **Save**
6. **Redeploy** project untuk apply changes

### **Via Vercel CLI:**

```bash
# Set environment variable
vercel env add SUPABASE_SERVICE_ROLE_KEY

# Paste the service role key when prompted
# Select environments: Production, Preview, Development

# Redeploy
vercel --prod
```

---

## 🔍 How to Get SUPABASE_SERVICE_ROLE_KEY

### **Via Supabase Dashboard:**

1. Buka https://supabase.com/dashboard
2. Pilih project: `gpittnsfzgkdbqnccncn`
3. Go to **Settings** → **API**
4. Scroll ke **Project API keys**
5. Copy **service_role** key (bukan anon key!)

**⚠️ WARNING:** Service role key memiliki full access ke database. **JANGAN** expose ke client-side code!

---

## ✅ Verification Steps

### **1. Check if Variables are Set:**

```bash
# Via Vercel CLI
vercel env ls
```

Expected output:
```
SUPABASE_URL                 Production, Preview, Development
SUPABASE_ANON_KEY           Production, Preview, Development
SUPABASE_SERVICE_ROLE_KEY   Production, Preview, Development
GCP_PROXY_URL               Production, Preview, Development
```

### **2. Test API Endpoint:**

After setting variables and redeploying:

```bash
# Test from browser console or Postman
POST https://canvango.com/api/tripay-proxy
Headers:
  Authorization: Bearer <your-user-token>
  Content-Type: application/json
Body:
{
  "amount": 10000,
  "paymentMethod": "QRIS2",
  "customerName": "Test User",
  "customerEmail": "test@example.com",
  "orderItems": [
    {
      "name": "Top-Up Saldo",
      "price": 10000,
      "quantity": 1
    }
  ]
}
```

Expected response:
```json
{
  "success": true,
  "data": {
    "reference": "DEV-T...",
    "merchant_ref": "uuid-here",
    ...
  }
}
```

### **3. Check Vercel Logs:**

```bash
# Via Vercel CLI
vercel logs

# Or via Dashboard:
# https://vercel.com/dashboard → Project → Deployments → Latest → Logs
```

Look for:
```
✅ Transaction created: { id: 'uuid', user_id: 'uuid', amount: 10000 }
✅ Transaction updated successfully: { id: 'uuid', reference: 'DEV-T...' }
```

---

## 🐛 Troubleshooting

### **Error: "Failed to create transaction"**

**Cause:** `SUPABASE_SERVICE_ROLE_KEY` tidak di-set atau salah

**Solution:**
1. Verify key di Vercel Dashboard
2. Copy ulang dari Supabase Dashboard
3. Redeploy project

### **Error: "Cannot connect to payment gateway"**

**Cause:** `GCP_PROXY_URL` tidak di-set atau GCP Proxy down

**Solution:**
1. Verify `GCP_PROXY_URL` di Vercel Dashboard
2. Test GCP Proxy: `curl http://34.182.126.200:3000`
3. Check GCP Proxy logs

### **Error: "Invalid token"**

**Cause:** User token expired atau invalid

**Solution:**
1. Logout dan login ulang
2. Check token di browser localStorage
3. Verify `SUPABASE_ANON_KEY` di Vercel

---

## 📝 Deployment Checklist

Before testing `/top-up`:

- [ ] `SUPABASE_URL` set di Vercel
- [ ] `SUPABASE_ANON_KEY` set di Vercel
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set di Vercel ⚠️ **CRITICAL**
- [ ] `GCP_PROXY_URL` set di Vercel
- [ ] Project redeployed after setting variables
- [ ] Vercel deployment status: **Ready**
- [ ] Test API endpoint returns 200 OK

---

## 🔐 Security Notes

1. **NEVER** commit service role key to git
2. **NEVER** expose service role key to client-side
3. **ONLY** use service role key in server-side code (API routes, Edge Functions)
4. Rotate keys regularly (every 3-6 months)
5. Use different keys for production and development

---

**Last Updated:** 2025-11-30  
**Status:** Waiting for Vercel environment variables setup
