# ✅ Auto Session Revoke on Role Change - IMPLEMENTED

## Problem Solved
Ketika admin mengubah role user di database, user tidak bisa login karena JWT token masih memiliki role lama.

## Solution Implemented

### Automatic Trigger
Sekarang ketika role user berubah, **semua sessions otomatis di-revoke** dan user harus login lagi.

### How It Works

**Before (Manual):**
```sql
-- Admin changes role
UPDATE users SET role = 'admin' WHERE username = 'member1';

-- User tries to login → FAILS (JWT has old role)
-- Admin must manually revoke sessions
DELETE FROM auth.sessions WHERE user_id = ...;
```

**After (Automatic):**
```sql
-- Admin changes role
UPDATE users SET role = 'admin' WHERE username = 'member1';

-- ✅ Trigger automatically:
-- 1. Deletes all sessions for this user
-- 2. Revokes all refresh tokens
-- 3. Logs the change

-- User tries to login → SUCCESS (gets new JWT with new role)
```

## What Was Added

### 1. Trigger Function: `handle_role_change()`
```sql
CREATE FUNCTION handle_role_change()
RETURNS TRIGGER
```

**What it does:**
- Detects when user role changes
- Automatically deletes all sessions
- Revokes all refresh tokens
- Logs the change with NOTICE

### 2. Trigger: `on_role_change`
```sql
CREATE TRIGGER on_role_change
  AFTER UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION handle_role_change();
```

**When it runs:**
- After any UPDATE on users table
- Only if role actually changed (not on other field updates)
- For each affected row

### 3. Helper Function: `revoke_user_sessions()`
```sql
CREATE FUNCTION revoke_user_sessions(target_user_id uuid)
RETURNS void
```

**Manual usage (if needed):**
```sql
-- Revoke sessions for specific user
SELECT revoke_user_sessions(
  (SELECT id FROM users WHERE username = 'member1')
);
```

## Testing

### Test Scenario 1: Change Role via SQL

1. **User logs in as member:**
   ```
   Username: member1
   Password: [password]
   Current role: member
   ```

2. **Admin changes role:**
   ```sql
   UPDATE users SET role = 'admin' WHERE username = 'member1';
   ```

3. **Trigger automatically:**
   - ✅ Deletes sessions
   - ✅ Revokes refresh tokens
   - ✅ Logs: "Role changed for user member1: member -> admin"

4. **User tries to use old session:**
   - ❌ Session invalid (deleted)
   - ❌ Refresh token revoked
   - → User redirected to login

5. **User logs in again:**
   - ✅ New JWT with `user_role: "admin"`
   - ✅ Can access admin pages
   - ✅ Everything works

### Test Scenario 2: Change Role via Supabase Dashboard

1. Go to Supabase Dashboard → Authentication → Users
2. Click on user → Edit
3. Change role field
4. Save
5. **Trigger runs automatically** ✅
6. User must login again

### Test Scenario 3: Bulk Role Change

```sql
-- Change multiple users at once
UPDATE users 
SET role = 'admin' 
WHERE username IN ('member1', 'member2', 'member3');

-- Trigger runs for EACH user
-- All 3 users' sessions revoked
```

## Verification

### Check Trigger Status
```sql
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_role_change';
```

Should return 1 row showing trigger is active.

### Check Function Exists
```sql
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname IN ('handle_role_change', 'revoke_user_sessions');
```

Should return 2 rows.

### Test Manually
```sql
-- 1. Check current sessions for a user
SELECT COUNT(*) FROM auth.sessions 
WHERE user_id = (SELECT id FROM users WHERE username = 'member1');

-- 2. Change role
UPDATE users SET role = 'admin' WHERE username = 'member1';

-- 3. Check sessions again (should be 0)
SELECT COUNT(*) FROM auth.sessions 
WHERE user_id = (SELECT id FROM users WHERE username = 'member1');
```

## Benefits

### For Admins
- ✅ No manual session management
- ✅ No need to remember to revoke sessions
- ✅ Safer role changes
- ✅ Automatic logging

### For Users
- ✅ Always have correct permissions
- ✅ No confusion about access
- ✅ Clear error message (must login again)

### For Security
- ✅ No stale JWT tokens with wrong roles
- ✅ Immediate permission updates
- ✅ Audit trail via logs

## Edge Cases Handled

### 1. Role Unchanged
```sql
UPDATE users SET email = 'new@email.com' WHERE username = 'member1';
-- Trigger checks: role unchanged → does nothing ✅
```

### 2. Multiple Field Updates
```sql
UPDATE users 
SET role = 'admin', balance = 1000 
WHERE username = 'member1';
-- Trigger only cares about role change ✅
```

### 3. Null Role
```sql
UPDATE users SET role = NULL WHERE username = 'member1';
-- Trigger detects change (admin -> NULL) → revokes sessions ✅
```

### 4. Same Role
```sql
UPDATE users SET role = 'member' WHERE username = 'member1';
-- Current role already 'member' → trigger does nothing ✅
```

## Monitoring

### Check Trigger Logs
In Supabase Dashboard → Database → Logs, you'll see:
```
NOTICE: Role changed for user member1: member -> admin
NOTICE: Sessions revoked for user member1. User must login again.
```

### Check Session Count
```sql
-- See how many active sessions per user
SELECT 
  u.username,
  u.role,
  COUNT(s.id) as active_sessions
FROM users u
LEFT JOIN auth.sessions s ON u.id = s.user_id
GROUP BY u.username, u.role
ORDER BY active_sessions DESC;
```

## Troubleshooting

### Trigger Not Working?

**Check 1: Verify trigger exists**
```sql
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'on_role_change';
```

**Check 2: Check function exists**
```sql
SELECT * FROM pg_proc 
WHERE proname = 'handle_role_change';
```

**Check 3: Test manually**
```sql
-- This should trigger the function
UPDATE users SET role = 'admin' 
WHERE username = 'member1' AND role != 'admin';
```

**Check 4: Check logs**
Look for NOTICE messages in Postgres logs.

## Disabling (If Needed)

If you need to disable auto-revoke temporarily:

```sql
-- Disable trigger
ALTER TABLE users DISABLE TRIGGER on_role_change;

-- Re-enable trigger
ALTER TABLE users ENABLE TRIGGER on_role_change;

-- Drop trigger completely (not recommended)
DROP TRIGGER on_role_change ON users;
```

## Summary

✅ **Automatic session revocation on role change**
✅ **No manual intervention needed**
✅ **Safer and more secure**
✅ **Better user experience**

**Status:** ACTIVE and WORKING
**Migrations Applied:**
1. `add_revoke_user_sessions_function` - Helper function
2. `auto_revoke_sessions_on_role_change` - Trigger

---
**Last Updated:** November 25, 2025
**Status:** Production Ready ✅
