# Testing Guide: Conditional Dashboard Route

## 🧪 Manual Testing Steps

### Test 1: Guest User Behavior

**Scenario:** Guest visits root path

1. **Open incognito/private browser window**
2. **Navigate to:** `https://www.canvango.com/`
3. **Expected Results:**
   - ✅ URL stays at `https://www.canvango.com/` (no redirect)
   - ✅ Dashboard content is displayed
   - ✅ Welcome banner shows "Member" as username
   - ✅ Navigation menu is visible
   - ✅ All guest-accessible pages work (BM Accounts, Personal Accounts, etc.)

4. **Try accessing protected routes:**
   - Navigate to `/riwayat-transaksi`
   - ✅ Should redirect to `/login`

5. **Try accessing dashboard directly:**
   - Navigate to `https://www.canvango.com/dashboard`
   - ✅ Should display dashboard content
   - ✅ URL should be `/dashboard`

---

### Test 2: Authenticated User Behavior

**Scenario:** Logged-in user visits root path

1. **Login to the application**
   - Go to `/login`
   - Enter credentials
   - Login successfully

2. **Navigate to root path:** `https://www.canvango.com/`
3. **Expected Results:**
   - ✅ Auto-redirect to `https://www.canvango.com/dashboard`
   - ✅ URL changes from `/` to `/dashboard`
   - ✅ Dashboard content is displayed
   - ✅ Welcome banner shows actual username
   - ✅ All protected routes are accessible

4. **Try accessing dashboard directly:**
   - Navigate to `https://www.canvango.com/dashboard`
   - ✅ Should display dashboard content
   - ✅ URL should stay at `/dashboard`

---

### Test 3: Login Flow

**Scenario:** User logs in from login page

1. **Start as guest** at `https://www.canvango.com/`
2. **Click login** or navigate to `/login`
3. **Enter credentials and submit**
4. **Expected Results:**
   - ✅ After successful login, redirect to `/dashboard`
   - ✅ URL should be `https://www.canvango.com/dashboard`
   - ✅ Dashboard shows user's actual name

---

### Test 4: Logout Flow

**Scenario:** User logs out

1. **Start as authenticated user** at `/dashboard`
2. **Click logout**
3. **Expected Results:**
   - ✅ Redirect to `/login`
   - ✅ Session cleared
   - ✅ If user navigates to `/`, should stay at `/` (guest behavior)

---

### Test 5: Direct URL Access

**Test 5a: Guest Direct Access**
- Visit: `https://www.canvango.com/dashboard`
- ✅ Should display dashboard
- ✅ URL stays at `/dashboard`

**Test 5b: Authenticated Direct Access**
- Visit: `https://www.canvango.com/`
- ✅ Should redirect to `/dashboard`
- ✅ URL changes to `/dashboard`

---

### Test 6: Navigation Menu

**Test 6a: Guest Navigation**
1. Start at `/` (root)
2. Click various menu items
3. ✅ Navigation should work
4. ✅ Protected routes redirect to login
5. ✅ Public routes accessible

**Test 6b: Authenticated Navigation**
1. Start at `/dashboard`
2. Click various menu items
3. ✅ All routes accessible
4. ✅ Navigation works smoothly

---

## 🔍 Edge Cases to Test

### Edge Case 1: Slow Network
- Test with throttled network (Chrome DevTools)
- ✅ Loading spinner should show during auth check
- ✅ No flash of wrong content

### Edge Case 2: Token Expiration
- Let session expire
- Navigate to `/`
- ✅ Should show guest behavior (stay at `/`)

### Edge Case 3: Browser Back Button
1. Login → redirected to `/dashboard`
2. Press browser back button
3. ✅ Should stay at `/dashboard` (not go back to `/`)

### Edge Case 4: Refresh Page
**As Guest:**
- At `/` → refresh → ✅ stays at `/`

**As Authenticated:**
- At `/dashboard` → refresh → ✅ stays at `/dashboard`
- At `/` → refresh → ✅ redirects to `/dashboard`

---

## 🐛 Common Issues to Watch For

### Issue 1: Infinite Redirect Loop
**Symptom:** Browser shows "too many redirects" error
**Check:** 
- ConditionalDashboardRoute logic
- GuestRoute redirect path
- AuthContext loading state

### Issue 2: Flash of Wrong Content
**Symptom:** Brief flash of dashboard before redirect
**Check:**
- Loading state handling in ConditionalDashboardRoute
- AuthContext initialization

### Issue 3: 404 on Refresh
**Symptom:** Page not found when refreshing at `/dashboard`
**Check:**
- Vercel rewrites configuration
- Route configuration in routes.tsx

---

## ✅ Success Criteria

All tests pass if:
- ✅ Guest sees dashboard at `/` without redirect
- ✅ Authenticated user auto-redirects from `/` to `/dashboard`
- ✅ No infinite redirect loops
- ✅ No flash of wrong content
- ✅ Navigation works correctly for both user types
- ✅ Protected routes still protected
- ✅ Public routes still accessible
- ✅ Login/logout flows work correctly

---

## 📊 Test Results Template

```
Date: ___________
Tester: ___________
Environment: Production / Staging / Local

[ ] Test 1: Guest User Behavior - PASS / FAIL
[ ] Test 2: Authenticated User Behavior - PASS / FAIL
[ ] Test 3: Login Flow - PASS / FAIL
[ ] Test 4: Logout Flow - PASS / FAIL
[ ] Test 5: Direct URL Access - PASS / FAIL
[ ] Test 6: Navigation Menu - PASS / FAIL
[ ] Edge Case 1: Slow Network - PASS / FAIL
[ ] Edge Case 2: Token Expiration - PASS / FAIL
[ ] Edge Case 3: Browser Back Button - PASS / FAIL
[ ] Edge Case 4: Refresh Page - PASS / FAIL

Notes:
_________________________________
_________________________________
_________________________________
```
