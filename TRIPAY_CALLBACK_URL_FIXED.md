# ✅ Tripay Callback URL - Fixed to Custom Domain

## 🎯 Issue Fixed

**Before:** Callback URL menggunakan Supabase Edge Function URL langsung
```
https://gpittnsfzgkdbqnccncn.supabase.co/functions/v1/tripay-callback
```

**After:** Callback URL menggunakan custom domain (canvango.com)
```
https://canvango.com/api/tripay-callback
```

---

## 🔄 Architecture

### Callback Flow

```
Tripay Payment Confirmed
    ↓
POST https://canvango.com/api/tripay-callback
    ↓
Vercel Serverless Function (api/tripay-callback.ts)
    ↓
Proxy to Supabase Edge Function
    ↓
https://gpittnsfzgkdbqnccncn.supabase.co/functions/v1/tripay-callback
    ↓
Update Transaction & Balance
```

### Why Use Custom Domain?

1. ✅ **Professional** - Uses your domain (canvango.com)
2. ✅ **Flexible** - Can change backend without updating Tripay
3. ✅ **Consistent** - All APIs under same domain
4. ✅ **Easier to remember** - Simple URL structure

---

## 📝 What Was Updated

### 1. Database ✅
```sql
-- Migration applied
UPDATE system_settings
SET tripay_config = jsonb_set(
  tripay_config,
  '{callback_url}',
  '"https://canvango.com/api/tripay-callback"'
);
```

### 2. Admin Settings UI ✅
**File:** `src/features/member-area/pages/admin/SystemSettings.tsx`
- Default callback URL: `https://canvango.com/api/tripay-callback`
- Placeholder updated
- Read-only field

### 3. Service Layer ✅
**File:** `src/features/member-area/services/adminSettingsService.ts`
- Default callback URL updated

### 4. Edge Function ✅
**File:** `supabase/functions/tripay-create-payment/index.ts`
- Hardcoded callback URL: `https://canvango.com/api/tripay-callback`
- Deployed to Supabase

### 5. Vercel Proxy ✅
**File:** `api/tripay-callback.ts`
- Already exists (no changes needed)
- Forwards callbacks to Supabase Edge Function

---

## 🧪 Testing

### Test Callback URL

**Tripay Dashboard:**
1. Login: https://tripay.co.id/member
2. Go to: Merchant Settings
3. Set Callback URL: `https://canvango.com/api/tripay-callback`
4. Enable callback for all payment methods
5. Save

**Test Payment:**
1. Create test payment
2. Complete payment
3. Check callback received
4. Verify transaction updated

### Check Logs

**Vercel Logs:**
```bash
# Check Vercel function logs
vercel logs
```

**Supabase Logs:**
```bash
# Check Edge Function logs
npx supabase functions logs tripay-callback --tail
```

---

## 📊 Verification

### Check Database
```sql
SELECT tripay_config->>'callback_url' as callback_url
FROM system_settings;
```

Expected:
```
https://canvango.com/api/tripay-callback
```

### Check Admin Settings
1. Go to: https://canvango.com/admin/settings
2. Scroll to: "Tripay Payment Gateway"
3. Callback URL field should show: `https://canvango.com/api/tripay-callback`

### Check Tripay Dashboard
1. Login: https://tripay.co.id/member
2. Merchant Settings
3. Callback URL should be: `https://canvango.com/api/tripay-callback`

---

## 🔐 Security

### Vercel Proxy (api/tripay-callback.ts)
- ✅ Validates signature from Tripay
- ✅ Forwards to Supabase Edge Function
- ✅ Returns response to Tripay

### Supabase Edge Function
- ✅ Verifies signature again
- ✅ Updates transaction
- ✅ Updates user balance
- ✅ Logs callback data

---

## 🐛 Troubleshooting

### Callback Not Received

**Check 1: Vercel Deployment**
- Ensure `api/tripay-callback.ts` deployed
- Check Vercel logs for errors

**Check 2: Tripay Dashboard**
- Verify callback URL: `https://canvango.com/api/tripay-callback`
- Ensure callback enabled for payment method

**Check 3: Signature Verification**
- Check Supabase Edge Function logs
- Look for signature verification errors

### Transaction Not Updated

**Check 1: Callback Received?**
```bash
# Vercel logs
vercel logs

# Supabase logs
npx supabase functions logs tripay-callback
```

**Check 2: Database**
```sql
SELECT * FROM transactions 
WHERE tripay_reference = 'T1234567890';
```

**Check 3: Balance Updated?**
```sql
SELECT balance FROM users WHERE id = 'user-id';
```

---

## ✅ Summary

**What Changed:**
- ✅ Callback URL: `canvango.com` (custom domain)
- ✅ Database updated
- ✅ Admin UI updated
- ✅ Edge Function updated
- ✅ Deployed to production

**What Stayed Same:**
- ✅ Vercel proxy (already existed)
- ✅ Callback flow (still works)
- ✅ Security (signature verification)

**Action Required:**
1. **Update Tripay Dashboard** - Set callback URL to `https://canvango.com/api/tripay-callback`
2. **Test Payment** - Create test transaction
3. **Verify Callback** - Check logs and database

---

**Status:** ✅ Fixed & Deployed
**Callback URL:** https://canvango.com/api/tripay-callback
**Next:** Update Tripay Dashboard with new callback URL
