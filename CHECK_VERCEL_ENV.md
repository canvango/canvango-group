# ✅ Check Vercel Environment Variables

**Critical:** Vercel API route needs `SUPABASE_SERVICE_ROLE_KEY`

---

## 🔍 Required Environment Variables

### For Vercel API Route (`api/tripay-proxy.ts`)

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📋 How to Check

### Option 1: Vercel Dashboard

1. Go to https://vercel.com/
2. Select your project
3. **Settings** → **Environment Variables**
4. Check if `SUPABASE_SERVICE_ROLE_KEY` exists

### Option 2: Vercel CLI

```bash
vercel env ls
```

---

## ➕ How to Add (If Missing)

### Via Vercel Dashboard

1. https://vercel.com/your-project/settings/environment-variables
2. Click **Add New**
3. Name: `SUPABASE_SERVICE_ROLE_KEY`
4. Value: (get from Supabase)
5. Environment: **Production**, **Preview**, **Development**
6. Click **Save**

### Via Vercel CLI

```bash
# Add environment variable
vercel env add SUPABASE_SERVICE_ROLE_KEY

# Select environments: Production, Preview, Development
# Paste your service role key
```

---

## 🔑 Get Service Role Key from Supabase

1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT
2. **Settings** → **API**
3. Copy **service_role** key (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`)

⚠️ **IMPORTANT:** This is a secret key, never commit to git!

---

## 🔄 After Adding Variables

Redeploy to apply changes:

```bash
vercel --prod
```

Or trigger redeploy from Vercel Dashboard:
1. **Deployments** tab
2. Click **...** on latest deployment
3. Click **Redeploy**

---

## ✅ Verify It's Working

Test the API route:

```bash
curl https://your-site.vercel.app/api/tripay-proxy \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -d '{
    "amount": 50000,
    "paymentMethod": "BRIVA",
    "customerName": "Test",
    "customerEmail": "test@example.com",
    "orderItems": [{"name": "Test", "price": 50000, "quantity": 1}]
  }'
```

**Expected:** JSON response with Tripay payment data

---

**Status:** Check this first before testing!
