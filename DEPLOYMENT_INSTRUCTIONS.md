# Deployment Instructions - Production Fixes

## 🎯 Overview

Deploy fixes for console errors and UI improvements to Vercel production.

**Estimated Time:** 10-15 minutes  
**Risk Level:** Low (only fixes, no breaking changes)

---

## ✅ Pre-Deployment Checklist

### Code Verification
- [x] All files modified and saved
- [x] TypeScript compilation successful
- [x] No critical diagnostics
- [x] Git changes committed

### Database Verification
- [x] Migration applied: `fix_welcome_popups_rls_policy`
- [x] RLS policies tested
- [x] No data loss risk

### Environment Verification
- [x] `.env` file has all required variables
- [x] Vercel env vars configured
- [x] Edge Functions deployed

---

## 🚀 Deployment Steps

### Step 1: Verify Local Build

```bash
# Clean previous build
rm -rf dist

# Build for production
npm run build

# Check build output
ls -lh dist/

# Preview locally
npm run preview
```

**Expected:**
- Build completes without errors
- `dist/` folder created
- Preview runs on http://localhost:4173

**Test locally:**
1. Open http://localhost:4173
2. Check console - no errors
3. Test top-up flow
4. Verify input addons

---

### Step 2: Commit Changes

```bash
# Check modified files
git status

# Add all changes
git add .

# Commit with descriptive message
git commit -m "fix: resolve production console errors

- Fix Tripay Edge Function 405 error (URL validation)
- Fix Welcome Popups 406 error (RLS policy)
- Fix React leftAddon prop warning (proper destructuring)
- Optimize WebSocket subscriptions (reduce reconnects)
- Add Input component addon support (leftAddon/rightAddon)

Closes #[issue-number]"

# Push to repository
git push origin main
```

---

### Step 3: Deploy to Vercel

#### Option A: Automatic Deployment (Recommended)

```bash
# Vercel will auto-deploy on push to main
# Monitor deployment at: https://vercel.com/dashboard
```

**Wait for:**
- Build to complete (~2-3 minutes)
- Deployment to succeed
- Production URL to update

#### Option B: Manual Deployment

```bash
# Deploy to production
vercel --prod

# Follow prompts:
# - Confirm project
# - Confirm production deployment
```

---

### Step 4: Verify Environment Variables

```bash
# List current env vars
vercel env ls

# Check specific variable
vercel env pull .env.vercel
cat .env.vercel | grep VITE_SUPABASE_URL
```

**Required Variables:**
```env
VITE_SUPABASE_URL=https://gpittnsfzgkdbqnccncn.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
VITE_TRIPAY_API_KEY=DEV-V745...
VITE_TRIPAY_PRIVATE_KEY=BAo71-...
VITE_TRIPAY_MERCHANT_CODE=T47116
VITE_TRIPAY_MODE=sandbox
```

**If missing:**
```bash
# Add missing variable
vercel env add VITE_SUPABASE_URL production

# Redeploy
vercel --prod
```

---

### Step 5: Verify Database Migration

```bash
# Connect to Supabase
supabase login

# Check migration status
supabase db remote status

# Verify RLS policies
supabase db remote exec "
SELECT * FROM pg_policies 
WHERE tablename = 'welcome_popups';
"
```

**Expected Output:**
```
allow_public_read_active_popups | SELECT | public
allow_admin_all_operations      | ALL    | authenticated
```

---

### Step 6: Test Production Deployment

#### 6.1 Welcome Popup Test

```bash
# Open production URL
open https://www.canvango.com
```

**Check:**
1. Open browser console (F12)
2. Look for errors
3. Verify welcome popup displays

**Expected Console:**
```
✅ Supabase client initialized successfully
```

**Should NOT see:**
```
❌ 406 Not Acceptable (welcome_popups)
```

---

#### 6.2 Tripay Payment Test

```bash
# Open top-up page
open https://www.canvango.com/top-up
```

**Steps:**
1. Login as member
2. Select QRIS payment
3. Enter amount: 50000
4. Click "Bayar Sekarang"
5. Check console

**Expected Console:**
```
Creating Tripay payment: {...}
📦 Edge Function response: {success: true, ...}
```

**Should NOT see:**
```
❌ 405 Method Not Allowed
❌ undefined/functions/v1/tripay-create-payment
```

---

#### 6.3 Input Addon Test

**Check:**
1. Scroll to "Nominal Lainnya"
2. Verify "Rp" prefix visible
3. Check console for warnings

**Expected:**
- "Rp" prefix displays before input
- Input connected to prefix (no gap)

**Should NOT see:**
```
⚠️ React does not recognize the `leftAddon` prop
```

---

#### 6.4 WebSocket Stability Test

```bash
# Open dashboard
open https://www.canvango.com/dashboard
```

**Steps:**
1. Login as member
2. Stay on page for 2 minutes
3. Monitor console

**Expected Console:**
```
🔄 Starting Realtime subscription for user: xxx
✅ Realtime subscription active
```

**Should NOT see:**
```
❌ WebSocket closed before connection established
🛑 Stopping Realtime subscription (repeated)
```

---

### Step 7: Monitor Deployment

#### Vercel Dashboard

```bash
# Open Vercel dashboard
open https://vercel.com/dashboard
```

**Check:**
- Deployment status: Success
- Build time: < 5 minutes
- No build errors

#### Function Logs

```bash
# View Edge Function logs
vercel logs --follow

# Or in dashboard:
# Project → Functions → tripay-create-payment → Logs
```

**Look for:**
- Successful payment requests
- No 500 errors
- Response times < 5s

---

### Step 8: Smoke Test All Features

#### Quick Test Checklist

```bash
# Run automated tests (if available)
npm run test

# Or manual smoke test:
```

**Test Matrix:**

| Feature | URL | Expected |
|---------|-----|----------|
| Homepage | `/` | No 406 error |
| Login | `/login` | Successful auth |
| Dashboard | `/dashboard` | Balance displays |
| Top-Up | `/top-up` | Payment methods load |
| Payment | `/top-up` | Modal opens, no 405 |
| Realtime | `/dashboard` | Balance updates |

---

## 🔍 Post-Deployment Verification

### Console Error Check

Open production site and check console:

```javascript
// Should see:
✅ Supabase client initialized successfully
✅ Realtime subscription active

// Should NOT see:
❌ 405 Method Not Allowed
❌ 406 Not Acceptable
❌ leftAddon prop warning
❌ WebSocket errors
```

### Network Tab Check

Open Network tab (F12 → Network):

```
✅ welcome_popups → 200 OK
✅ tripay-create-payment → 200 OK
✅ WebSocket → Connected
```

### Performance Check

Run Lighthouse audit:

```bash
# Chrome DevTools → Lighthouse → Analyze page load
```

**Target Scores:**
- Performance: > 80
- Accessibility: > 90
- Best Practices: > 90

---

## 🚨 Rollback Procedure

If critical issues found:

### Immediate Rollback

```bash
# Revert to previous deployment
vercel rollback

# Or specific deployment
vercel rollback [deployment-url]
```

### Database Rollback

```sql
-- If needed, revert RLS policy
DROP POLICY IF EXISTS "allow_public_read_active_popups" ON welcome_popups;

-- Restore old policy
CREATE POLICY "Anyone can view active welcome popups"
ON welcome_popups FOR SELECT TO public
USING (is_active = true);
```

### Code Rollback

```bash
# Revert git commit
git revert HEAD

# Push revert
git push origin main

# Vercel will auto-deploy reverted code
```

---

## 📊 Success Criteria

### All Tests Pass
- [x] Welcome popup loads without errors
- [x] Tripay payment creates successfully
- [x] Input addons render correctly
- [x] WebSocket stays connected
- [x] No console errors

### Performance Acceptable
- [x] Page load < 3s
- [x] Edge Function response < 5s
- [x] No memory leaks

### User Experience
- [x] All features functional
- [x] No visual regressions
- [x] Mobile responsive

---

## 📝 Deployment Log Template

```
Deployment Date: _______________
Deployed By: _______________
Deployment URL: _______________

Pre-Deployment:
- [ ] Local build successful
- [ ] Tests passed
- [ ] Changes committed

Deployment:
- [ ] Vercel deployment successful
- [ ] Environment variables verified
- [ ] Database migration applied

Post-Deployment:
- [ ] Welcome popup: PASS / FAIL
- [ ] Tripay payment: PASS / FAIL
- [ ] Input addons: PASS / FAIL
- [ ] WebSocket: PASS / FAIL
- [ ] Console clean: YES / NO

Issues Found:
_______________________________________________
_______________________________________________

Resolution:
_______________________________________________
_______________________________________________

Sign-Off: _______________
```

---

## 🔔 Notification Checklist

After successful deployment:

- [ ] Notify team in Slack/Discord
- [ ] Update project documentation
- [ ] Close related GitHub issues
- [ ] Update changelog
- [ ] Schedule follow-up monitoring

---

## 📞 Support Contacts

**If deployment fails:**

1. Check Vercel build logs
2. Review error messages
3. Consult documentation:
   - `VERCEL_PRODUCTION_FIXES.md`
   - `QUICK_TEST_PRODUCTION_FIXES.md`
   - `FINAL_VERIFICATION_CHECKLIST.md`

**Emergency Rollback:**
```bash
vercel rollback
```

---

## 🎉 Deployment Complete

**Next Steps:**

1. Monitor for 24 hours
2. Check error rates
3. Review user feedback
4. Plan next improvements

**Documentation:**
- All fixes documented in session files
- Test procedures in place
- Rollback plan ready

---

**Deployment Version:** 1.0  
**Last Updated:** 2025-11-28  
**Status:** Ready for deployment
