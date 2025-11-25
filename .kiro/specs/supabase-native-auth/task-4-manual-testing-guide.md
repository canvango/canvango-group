# Task 4 Manual Testing Guide

## Overview

This guide provides step-by-step instructions to manually test the ProtectedRoute role verification and admin route guards.

## Prerequisites

1. Application running locally (`npm run dev`)
2. Access to Supabase dashboard or SQL editor
3. Two test users:
   - Admin user (role='admin')
   - Member user (role='member')

## Test Scenarios

### Scenario 1: Admin Can Access Admin Routes ✅

**Objective**: Verify that users with admin role can access all admin pages

**Steps**:
1. Open browser and navigate to `http://localhost:5173`
2. Login with admin credentials
3. Navigate to each admin route:
   - `/admin/dashboard`
   - `/admin/users`
   - `/admin/transactions`
   - `/admin/claims`
   - `/admin/tutorials`
   - `/admin/products`
   - `/admin/categories`
   - `/admin/settings`
   - `/admin/audit-logs`

**Expected Results**:
- ✅ All admin pages load successfully
- ✅ No redirect to unauthorized page
- ✅ Admin content is visible
- ✅ Brief loading state appears (< 1 second)

**Verification**:
- Open browser DevTools → Network tab
- Look for request to `users` table with `select=role`
- Verify role is queried from database on each route access

---

### Scenario 2: Member Cannot Access Admin Routes ✅

**Objective**: Verify that users with member role are blocked from admin pages

**Steps**:
1. Logout if logged in
2. Login with member credentials
3. Try to navigate to `/admin/dashboard` directly in URL bar

**Expected Results**:
- ✅ Redirected to `/unauthorized` page
- ✅ See message: "You do not have permission to access this page"
- ✅ Shows required role: admin
- ✅ Shows user role: member

**Verification**:
- Check URL changed to `/unauthorized`
- Verify role was queried from database (Network tab)
- Confirm no admin content was rendered

---

### Scenario 3: Fresh Role Query on Route Access ✅

**Objective**: Verify that role is queried fresh from database, not cached

**Steps**:
1. Login as member user
2. Open browser DevTools → Network tab
3. Navigate to `/dashboard` (member page)
4. Clear network log
5. Navigate to `/admin/dashboard`
6. Observe network requests

**Expected Results**:
- ✅ See POST request to Supabase with query for `users` table
- ✅ Request includes `select=role` and `id=eq.{user_id}`
- ✅ Role is fetched from database, not localStorage
- ✅ Redirected to `/unauthorized` after role verification

**Verification**:
```
Request URL: https://{project}.supabase.co/rest/v1/users
Method: POST
Body: {"select":"role","id":{"eq":"user-id"}}
```

---

### Scenario 4: Role Change Detection ✅

**Objective**: Verify that role changes in database are immediately enforced

**Steps**:
1. Login as member user
2. Navigate to `/dashboard` (should work)
3. Try to access `/admin/dashboard` (should be blocked)
4. **In Supabase Dashboard**: Update user role to 'admin'
   ```sql
   UPDATE users 
   SET role = 'admin' 
   WHERE id = '{user_id}';
   ```
5. Navigate to `/admin/dashboard` again

**Expected Results**:
- ✅ Before role change: Redirected to `/unauthorized`
- ✅ After role change: Admin dashboard loads successfully
- ✅ No logout/login required
- ✅ Role polling detects change within 5 seconds

**Verification**:
- Check browser console for role change log
- Verify notification appears: "Your role has been updated to admin"
- Confirm admin dashboard is accessible

---

### Scenario 5: Unauthenticated Access ✅

**Objective**: Verify that unauthenticated users are redirected to login

**Steps**:
1. Logout or clear localStorage
2. Navigate to `/admin/dashboard` directly

**Expected Results**:
- ✅ Redirected to `/login` page
- ✅ After login, redirected back to `/admin/dashboard`
- ✅ Intended destination preserved

**Verification**:
- Check URL changes to `/login`
- After login, verify redirect to original destination
- Confirm location state includes `from: '/admin/dashboard'`

---

### Scenario 6: Loading State During Role Verification ✅

**Objective**: Verify loading state appears while verifying role

**Steps**:
1. Login as admin user
2. Open browser DevTools → Network tab
3. Throttle network to "Slow 3G"
4. Navigate to `/admin/dashboard`
5. Observe loading state

**Expected Results**:
- ✅ Loading spinner appears
- ✅ Message: "Loading..."
- ✅ No flash of unauthorized content
- ✅ Smooth transition to admin dashboard

**Verification**:
- Loading state visible for duration of database query
- No content rendered before role verification completes

---

### Scenario 7: Error Handling ✅

**Objective**: Verify graceful handling of database errors

**Steps**:
1. Login as admin user
2. **Simulate database error** (disconnect internet or block Supabase domain)
3. Navigate to `/admin/dashboard`

**Expected Results**:
- ✅ Falls back to user state role
- ✅ Admin dashboard loads (if user state role is admin)
- ✅ Error logged to console
- ✅ No app crash or blank screen

**Verification**:
- Check console for error message
- Verify app remains functional
- Confirm fallback behavior works

---

## SQL Queries for Testing

### Create Test Users

```sql
-- Create admin user
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at)
VALUES (
  gen_random_uuid(),
  'admin@test.com',
  crypt('password123', gen_salt('bf')),
  now()
);

INSERT INTO public.users (id, username, email, full_name, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@test.com'),
  'admin',
  'admin@test.com',
  'Admin User',
  'admin'
);

-- Create member user
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at)
VALUES (
  gen_random_uuid(),
  'member@test.com',
  crypt('password123', gen_salt('bf')),
  now()
);

INSERT INTO public.users (id, username, email, full_name, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'member@test.com'),
  'member',
  'member@test.com',
  'Member User',
  'member'
);
```

### Change User Role

```sql
-- Upgrade member to admin
UPDATE users 
SET role = 'admin' 
WHERE email = 'member@test.com';

-- Downgrade admin to member
UPDATE users 
SET role = 'member' 
WHERE email = 'admin@test.com';
```

### Verify Role

```sql
-- Check user role
SELECT id, username, email, role 
FROM users 
WHERE email = 'admin@test.com';
```

---

## Troubleshooting

### Issue: Role not updating after database change

**Solution**:
- Wait 5 seconds for role polling to detect change
- Or navigate to a different route to trigger fresh role query
- Check browser console for role change logs

### Issue: Redirected to unauthorized even with correct role

**Solution**:
- Check database: `SELECT role FROM users WHERE id = '{user_id}'`
- Verify RLS policies allow role query
- Check browser console for errors
- Clear localStorage and login again

### Issue: Loading state stuck

**Solution**:
- Check network tab for failed requests
- Verify Supabase connection
- Check browser console for errors
- Refresh page

### Issue: No loading state appears

**Solution**:
- Role query might be very fast (< 100ms)
- Throttle network to see loading state
- Check that role verification is happening (Network tab)

---

## Success Criteria

All scenarios should pass with expected results:

- ✅ Admins can access all admin routes
- ✅ Members are blocked from admin routes
- ✅ Role is queried fresh from database
- ✅ Role changes are detected and enforced
- ✅ Unauthenticated users redirected to login
- ✅ Loading states appear during verification
- ✅ Errors handled gracefully

---

## Performance Benchmarks

Expected performance metrics:

- **Role Query Time**: < 1ms (with index)
- **Loading State Duration**: < 500ms (normal network)
- **Route Access Time**: < 1 second (total)
- **Memory Usage**: No memory leaks from role polling

---

**Last Updated**: 2025-11-25
**Task**: Phase 2 - Task 4 - Update Protected Routes
