# Quick Test Guide - Production Fixes

## 🎯 Test Objectives

Verify all console errors are resolved and features work correctly in production.

---

## 1️⃣ Welcome Popup Test

**URL:** https://www.canvango.com

**Steps:**
1. Open homepage (not logged in)
2. Open browser console (F12)
3. Look for welcome popup

**Expected:**
- ✅ No 406 error for `welcome_popups`
- ✅ Welcome popup displays (if active in database)
- ✅ Console shows: `✅ Supabase client initialized successfully`

**If Error:**
- Check RLS policy: `SELECT * FROM pg_policies WHERE tablename = 'welcome_popups';`
- Verify policy allows public SELECT

---

## 2️⃣ Tripay Payment Test

**URL:** https://www.canvango.com/top-up

**Steps:**
1. Login as member
2. Navigate to Top Up page
3. Select payment method (e.g., QRIS)
4. Enter amount: 50000
5. Click "Bayar Sekarang"
6. Open console (F12)

**Expected:**
- ✅ No 405 error
- ✅ Console shows: `Creating Tripay payment: {...}`
- ✅ Console shows: `📦 Edge Function response: {...}`
- ✅ Payment modal opens with QR code or payment instructions

**If Error 405:**
- Check environment variable: `VITE_SUPABASE_URL` in Vercel
- Verify Edge Function is deployed: `supabase functions list`

**If Error 401:**
- User session expired - refresh page and login again

---

## 3️⃣ Input Addon Test

**URL:** https://www.canvango.com/top-up

**Steps:**
1. Scroll to "Nominal Lainnya" input
2. Check if "Rp" prefix displays
3. Open console (F12)

**Expected:**
- ✅ "Rp" prefix visible before input field
- ✅ No React prop warning for `leftAddon`
- ✅ Input styling correct (connected to prefix)

**Visual Check:**
```
[Rp][Input Field Here]
```

---

## 4️⃣ WebSocket Stability Test

**URL:** https://www.canvango.com/dashboard

**Steps:**
1. Login as member
2. Stay on dashboard for 2 minutes
3. Open console (F12)
4. Monitor WebSocket messages

**Expected:**
- ✅ Console shows: `✅ Realtime subscription active`
- ✅ No repeated connection/disconnection messages
- ✅ No WebSocket errors

**If Multiple Reconnects:**
- Check AuthContext dependencies
- Verify only `user?.id` triggers re-subscription

---

## 5️⃣ Balance Update Realtime Test

**URL:** https://www.canvango.com/dashboard

**Steps:**
1. Login as member (e.g., member1)
2. Note current balance
3. In another tab, open Supabase SQL Editor
4. Run: `UPDATE users SET balance = balance + 10000 WHERE username = 'member1';`
5. Watch dashboard

**Expected:**
- ✅ Balance updates automatically (no page refresh)
- ✅ Console shows: `💰 Balance changed: X -> Y`
- ✅ No page reload

---

## 🔍 Console Error Checklist

Open any page and check console for these errors:

| Error Pattern | Status | Fix |
|---------------|--------|-----|
| `405 Method Not Allowed` | Should be ✅ | Tripay URL fixed |
| `406 Not Acceptable` | Should be ✅ | RLS policy fixed |
| `leftAddon prop` warning | Should be ✅ | Props destructured |
| `WebSocket closed before connection` | Should be ✅ | Subscription optimized |
| `undefined/functions/v1/` | Should be ✅ | URL validation added |

---

## 🚨 Known Non-Critical Warnings

These are safe to ignore:

```
Download the React DevTools for a better development experience
```
- This is normal in production

```
'TRIPAY_PRIVATE_KEY' is declared but its value is never read
```
- Reserved for future direct API calls

---

## 📊 Success Criteria

**All Tests Pass:**
- [ ] Welcome popup loads without 406 error
- [ ] Tripay payment creates without 405 error
- [ ] Input addons render without React warnings
- [ ] WebSocket stays connected (no rapid reconnects)
- [ ] Balance updates in realtime

**Console Clean:**
- [ ] No 4xx/5xx HTTP errors
- [ ] No React prop warnings
- [ ] No WebSocket connection errors
- [ ] Only info/success logs visible

---

## 🔧 Troubleshooting

### If Tripay Still Shows 405:

1. Check Vercel environment variables:
   ```bash
   vercel env ls
   ```

2. Verify `VITE_SUPABASE_URL` is set:
   ```
   VITE_SUPABASE_URL=https://gpittnsfzgkdbqnccncn.supabase.co
   ```

3. Redeploy:
   ```bash
   vercel --prod
   ```

### If Welcome Popup Shows 406:

1. Check RLS policy in Supabase SQL Editor:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'welcome_popups';
   ```

2. Should see policy: `allow_public_read_active_popups`

3. If missing, run migration again:
   ```sql
   CREATE POLICY "allow_public_read_active_popups"
   ON welcome_popups FOR SELECT TO public
   USING (is_active = true);
   ```

### If WebSocket Keeps Reconnecting:

1. Check AuthContext.tsx line ~130
2. Verify useEffect dependencies: `[user?.id, notification]`
3. Should NOT include `user?.role` or `user?.balance`

---

## 📝 Test Results Template

```
Date: ___________
Tester: ___________

✅ Welcome Popup: PASS / FAIL
✅ Tripay Payment: PASS / FAIL
✅ Input Addons: PASS / FAIL
✅ WebSocket Stability: PASS / FAIL
✅ Realtime Updates: PASS / FAIL

Console Errors: YES / NO
If YES, list: ___________

Notes: ___________
```

---

**Quick Test Duration:** ~10 minutes
**Last Updated:** 2025-11-28
