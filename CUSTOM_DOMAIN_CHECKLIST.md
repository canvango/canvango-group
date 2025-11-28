# ✅ Custom Domain Setup - Quick Checklist

## 🎯 Goal
Setup `api.canvango.com` untuk Tripay callback

---

## 📋 Checklist

### Phase 1: Supabase Setup (5 min)
- [ ] Login ke Supabase Dashboard
- [ ] Go to Settings → General → Custom Domains
- [ ] Click "Add custom domain"
- [ ] Enter: `api.canvango.com`
- [ ] Copy DNS records yang diberikan

**DNS Record yang akan diberikan:**
```
Type: CNAME
Name: api
Value: gpittnsfzgkdbqnccncn.supabase.co
```

---

### Phase 2: DNS Setup (5 min)
- [ ] Login ke DNS provider (Cloudflare/Namecheap/GoDaddy)
- [ ] Add CNAME record:
  - Type: CNAME
  - Name: `api`
  - Value: `gpittnsfzgkdbqnccncn.supabase.co`
  - TTL: Auto
- [ ] **If Cloudflare:** Set proxy to "DNS only" (grey cloud)
- [ ] Save DNS record

---

### Phase 3: Verification (10-30 min)
- [ ] Wait for DNS propagation (~5-30 min)
- [ ] Check DNS: `nslookup api.canvango.com`
- [ ] Return to Supabase Dashboard
- [ ] Click "Verify" button
- [ ] Wait for SSL provisioning (~5-10 min)
- [ ] Status changes to "Active" ✅

---

### Phase 4: Testing (5 min)
- [ ] Test DNS resolution:
  ```bash
  nslookup api.canvango.com
  ```
- [ ] Test Edge Function:
  ```bash
  curl https://api.canvango.com/functions/v1/tripay-callback -X POST -H "Content-Type: application/json" -d '{"test": true}'
  ```
- [ ] Expected response: `{"success":false,"message":"Missing signature"}`

---

### Phase 5: Update Tripay (2 min)
- [ ] Login to Tripay Dashboard
- [ ] Go to Merchant Settings
- [ ] Update URL Website: `https://canvango.com`
- [ ] Update URL Callback: `https://api.canvango.com/functions/v1/tripay-callback`
- [ ] Whitelist IP: Kosongkan
- [ ] Inkonsistensi: Tidak
- [ ] Save

---

### Phase 6: Update Frontend (1 min)
- [ ] Update `.env`:
  ```
  VITE_TRIPAY_CALLBACK_URL=https://api.canvango.com/functions/v1/tripay-callback
  ```
- [ ] Restart dev server: `npm run dev`

---

### Phase 7: Final Test (5 min)
- [ ] Login as member
- [ ] Go to Top-Up page
- [ ] Create test payment
- [ ] Complete payment
- [ ] Check balance updated
- [ ] Check Edge Function logs

---

## ⏱️ Total Time

| Phase | Time | Type |
|-------|------|------|
| Supabase Setup | 5 min | Active |
| DNS Setup | 5 min | Active |
| Verification | 10-30 min | **Waiting** |
| Testing | 5 min | Active |
| Update Tripay | 2 min | Active |
| Update Frontend | 1 min | Active |
| Final Test | 5 min | Active |
| **Total** | **~30-50 min** | |

**Active work:** ~23 minutes
**Waiting:** ~10-30 minutes (DNS + SSL)

---

## 🚨 Common Issues

### ❌ DNS not resolving
**Solution:** Wait longer (up to 24 hours for some providers)

### ❌ SSL certificate error
**Solution:** 
- Check Cloudflare proxy is "DNS only"
- Wait 5-10 minutes for SSL provisioning

### ❌ Tripay still reject
**Solution:**
- Check URL format: `https://api.canvango.com/...`
- Check domain match with URL Website

---

## 📞 Need Help?

**Full Guide:** `CUSTOM_DOMAIN_SETUP.md`

**Quick Links:**
- Supabase Dashboard: https://supabase.com/dashboard/project/gpittnsfzgkdbqnccncn/settings/general
- Tripay Dashboard: https://tripay.co.id/member/merchant
- DNS Checker: https://dnschecker.org

---

**Ready?** Start with Phase 1! 🚀
