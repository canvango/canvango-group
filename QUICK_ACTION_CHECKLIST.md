# Quick Action Checklist - Tripay Callback Deployment

## ⚡ Quick Steps (5 minutes)

### ✅ Step 1: Update Environment Variables (2 minutes)

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables

**Remove these (if exist):**
- [ ] `VITE_SUPABASE_URL`
- [ ] `VITE_TRIPAY_PRIVATE_KEY`

**Add/Update these:**
- [ ] `SUPABASE_URL` = `https://gpittnsfzgkdbqnccncn.supabase.co`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = `(your service role key)`
- [ ] `TRIPAY_PRIVATE_KEY` = `BqOm1-ItF0o-LNlRZ-YhPK8-PZjNz`

### ✅ Step 2: Trigger Redeploy (1 minute)

**Option A: Automatic**
- Vercel will auto-deploy from GitHub push
- Wait 1-2 minutes

**Option B: Manual**
- Vercel Dashboard → Deployments
- Click "Redeploy" on latest deployment

### ✅ Step 3: Test Callback (2 minutes)

1. Login to Tripay Merchant Dashboard
2. Go to: Pengaturan → Callback
3. Click "Test Callback"

**Expected Result:**
```
✅ Kode HTTP: 200
✅ Status Koneksi: BERHASIL
✅ Status Callback: BERHASIL
```

## 🎯 Success Criteria

- [ ] Environment variables updated
- [ ] Deployment completed (status: Ready)
- [ ] Test callback returns BERHASIL
- [ ] No errors in Vercel logs

## 📊 Verification

### Check Vercel Logs

```
=== TRIPAY CALLBACK RECEIVED ===
[Tripay Callback] ✅ Signature verified
[Tripay Callback] Test callback - no merchant_ref or reference
```

### Test Real Payment (Optional)

1. Create top-up transaction
2. Make payment
3. Verify:
   - [ ] Transaction status updated to 'completed'
   - [ ] User balance increased
   - [ ] Callback data stored in database

## 🚨 If Something Goes Wrong

### Issue: Environment Variables Not Working

**Quick Fix:**
1. Double-check variable names (no typos)
2. Remove any extra spaces
3. Redeploy manually

### Issue: Test Callback Fails

**Quick Fix:**
1. Check Vercel logs for errors
2. Verify all 3 environment variables exist
3. Wait 1 more minute for deployment

### Issue: Need to Rollback

**Quick Fix:**
```bash
git revert HEAD
git push origin main
```

Or in Vercel Dashboard:
- Deployments → Previous deployment → Promote to Production

## 📖 Full Documentation

If you need more details:
- **DEPLOY_NEW_CALLBACK.md** - Complete deployment guide
- **TRIPAY_CALLBACK_OFFICIAL_IMPLEMENTATION.md** - Technical details
- **CALLBACK_OLD_VS_NEW.md** - What changed

---

**Total Time:** ~5 minutes
**Risk:** Low (backward compatible after env vars updated)
**Rollback Time:** 2 minutes
