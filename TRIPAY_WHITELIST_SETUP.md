# 🔐 Tripay IP Whitelist Setup Guide

**Important:** Tripay requires IP whitelist for API security

---

## 🎯 What You Need to Whitelist

Depending on your setup, you need to whitelist different IPs:

### Option 1: Using Vercel API Route (Current)

**Need to whitelist:** Vercel's outgoing IPs

**Problem:** Vercel uses dynamic IPs (changes frequently)

**Solutions:**
1. ✅ **Use Cloudflare Worker** (has static IPs)
2. ✅ **Use Supabase Edge Functions** (has static IPs)
3. ❌ **Vercel** (not recommended for Tripay)

---

### Option 2: Using Cloudflare Worker (Recommended)

**Need to whitelist:** Cloudflare Worker IPs

**Good news:** Cloudflare provides IP ranges that rarely change

**Cloudflare IP Ranges:**
```
173.245.48.0/20
103.21.244.0/22
103.22.200.0/22
103.31.4.0/22
141.101.64.0/18
108.162.192.0/18
190.93.240.0/20
188.114.96.0/20
197.234.240.0/22
198.41.128.0/17
162.158.0.0/15
104.16.0.0/13
104.24.0.0/14
172.64.0.0/13
131.0.72.0/22
```

**How to add:** Copy all ranges to Tripay dashboard

---

### Option 3: Using Supabase Edge Functions

**Need to whitelist:** Supabase Edge Function IPs

**Supabase provides:** Static IP ranges per region

**Get IPs from:** Supabase Dashboard → Settings → API → Edge Functions

---

## 📋 Step-by-Step: Add IP Whitelist to Tripay

### Step 1: Get Your Server IP

**For Cloudflare Worker:**
```bash
# Worker IPs are from Cloudflare ranges (see above)
# You need to add ALL Cloudflare IP ranges
```

**For Supabase Edge Functions:**
```bash
# Check Supabase Dashboard
# Settings → API → Edge Functions → IP Addresses
```

**For Vercel (Not Recommended):**
```bash
# Vercel doesn't provide static IPs
# Use Cloudflare Worker or Supabase instead
```

---

### Step 2: Login to Tripay Dashboard

1. Go to: https://tripay.co.id/member/login
2. Login with your credentials
3. Go to: **Merchant** → **API Settings**

---

### Step 3: Add IP Whitelist

1. Find **IP Whitelist** section
2. Click **Add IP Address**
3. Enter IP address or range
4. Click **Save**

**For Cloudflare Worker:**
- Add ALL Cloudflare IP ranges (see list above)
- Or add specific ranges if Tripay allows CIDR notation

**For Supabase:**
- Add Supabase Edge Function IPs
- Usually 2-3 IPs per region

---

### Step 4: Verify Whitelist

After adding IPs:

1. Wait 5-10 minutes for changes to propagate
2. Test API call
3. Check if it works

**Test command:**
```bash
curl -X GET "https://tripay.co.id/api/merchant/payment-channel" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Expected:** Should return payment channels (not 403 Forbidden)

---

## 🚀 Recommended Approach

### Use Cloudflare Worker (Best Solution)

**Why:**
- ✅ Static IP ranges
- ✅ Global CDN
- ✅ Fast performance
- ✅ Free tier
- ✅ Easy to whitelist

**Steps:**
1. Deploy Cloudflare Worker (follow `QUICK_START_CLOUDFLARE_WORKER.md`)
2. Add Cloudflare IP ranges to Tripay whitelist
3. Update frontend to use Worker URL
4. Test

**Time:** 30-45 minutes

---

### Alternative: Use Supabase Edge Functions

**Why:**
- ✅ Static IPs
- ✅ Already integrated
- ✅ Easy to whitelist

**Steps:**
1. Get Supabase Edge Function IPs from dashboard
2. Add IPs to Tripay whitelist
3. Use existing Edge Functions
4. Test

**Time:** 15 minutes

---

## ⚠️ Important Notes

### About Vercel

**Problem:** Vercel uses dynamic IPs that change frequently

**Impact:**
- ❌ Can't whitelist (IPs change)
- ❌ API calls will fail randomly
- ❌ Not suitable for Tripay

**Solution:** Use Cloudflare Worker or Supabase Edge Functions

---

### About Sandbox Mode

**Good news:** Sandbox mode might not require IP whitelist

**Test first:**
1. Try API call without whitelist
2. If it works → Sandbox doesn't need whitelist
3. If it fails → Add whitelist

**Production:** Always requires IP whitelist

---

## 🔍 Troubleshooting

### Issue: 403 Forbidden

**Cause:** IP not whitelisted

**Solution:**
1. Check IP whitelist in Tripay dashboard
2. Verify correct IPs added
3. Wait 5-10 minutes
4. Test again

---

### Issue: API works sometimes, fails sometimes

**Cause:** Using dynamic IPs (Vercel)

**Solution:** Switch to Cloudflare Worker or Supabase

---

### Issue: Don't know which IPs to whitelist

**For Cloudflare Worker:**
- Use all Cloudflare IP ranges (see list above)
- Or contact Cloudflare support for specific IPs

**For Supabase:**
- Check Supabase Dashboard → Settings → API
- Or contact Supabase support

**For Vercel:**
- Don't use Vercel for Tripay API calls
- Use Cloudflare Worker instead

---

## 📊 Comparison

| Solution | Static IP | Easy Setup | Performance | Cost |
|----------|-----------|------------|-------------|------|
| Cloudflare Worker | ✅ Yes | ⭐⭐⭐ | ⚡ Excellent | 💰 Free |
| Supabase Edge | ✅ Yes | ⭐⭐⭐⭐ | ⚡ Good | 💰 Free |
| Vercel API | ❌ No | ⭐⭐⭐⭐⭐ | ⚡ Good | 💰 Free |

**Recommendation:** Use Cloudflare Worker

---

## 🎯 Quick Action Plan

### If You Haven't Deployed Anything Yet

**Do this:**
1. Deploy Cloudflare Worker first
2. Add Cloudflare IPs to Tripay whitelist
3. Test
4. Update frontend

**Time:** 45 minutes

---

### If You're Using Vercel API Route

**Do this:**
1. Test if it works without whitelist (sandbox mode)
2. If it works → Great! Use for testing
3. For production → Deploy Cloudflare Worker
4. Add Cloudflare IPs to whitelist

**Time:** 15 min (test) + 45 min (deploy worker)

---

### If You're Using Supabase Edge Functions

**Do this:**
1. Get Supabase Edge Function IPs
2. Add to Tripay whitelist
3. Test
4. Done!

**Time:** 15 minutes

---

## 📝 Cloudflare IP Ranges (Copy-Paste Ready)

Add these to Tripay whitelist:

```
173.245.48.0/20
103.21.244.0/22
103.22.200.0/22
103.31.4.0/22
141.101.64.0/18
108.162.192.0/18
190.93.240.0/20
188.114.96.0/20
197.234.240.0/22
198.41.128.0/17
162.158.0.0/15
104.16.0.0/13
104.24.0.0/14
172.64.0.0/13
131.0.72.0/22
```

**Note:** If Tripay doesn't support CIDR notation, you may need to contact Tripay support

---

## ✅ Verification Checklist

After adding whitelist:

- [ ] IPs added to Tripay dashboard
- [ ] Waited 5-10 minutes
- [ ] Tested API call
- [ ] No 403 Forbidden error
- [ ] Payment channels load
- [ ] Can create transaction

---

## 🆘 Need Help?

**Tripay Support:**
- Email: support@tripay.co.id
- WhatsApp: Check Tripay dashboard
- Docs: https://tripay.co.id/developer

**Ask about:**
- IP whitelist format (CIDR vs individual IPs)
- How many IPs can be whitelisted
- How long for changes to take effect

---

## 🚀 Recommended Next Steps

1. **Test sandbox first** (might not need whitelist)
2. **If sandbox works** → Continue testing
3. **For production** → Deploy Cloudflare Worker
4. **Add Cloudflare IPs** to Tripay whitelist
5. **Test production** → Should work!

---

**Status:** Action required  
**Priority:** 🔴 High (needed for production)  
**Time:** 15-45 minutes  
**Difficulty:** Medium 🟡

🔐 **START:** Choose your approach and add IPs to whitelist
