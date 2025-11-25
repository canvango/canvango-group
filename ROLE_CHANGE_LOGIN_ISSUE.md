# Role Change Login Issue - Solution

## Problem
User bisa login sebagai **member**, tapi setelah role diubah menjadi **admin** di database, tidak bisa login lagi.

Error: "Invalid username or password" (padahal username dan password benar)

## Root Cause

### JWT Token Contains Old Role
Ketika user login, Supabase Auth membuat JWT token yang berisi:
```json
{
  "user_id": "...",
  "email": "...",
  "user_role": "member"  // ← Role saat login
}
```

Ketika Anda mengubah role di database:
```sql
UPDATE users SET role = 'admin' WHERE username = 'user1';
```

**JWT token yang sudah di-issue TIDAK otomatis update!**

Token masih memiliki `user_role: "member"` sampai user logout dan login lagi.

### Why Login Fails After Role Change

Ada 2 kemungkinan:

**1. Browser Masih Menyimpan Session Lama**
- Browser cache JWT token lama dengan role "member"
- Saat coba login, browser pikir sudah login
- Tapi role di token tidak match dengan role di database
- RLS policies mungkin reject request

**2. RLS Policy Check Mismatch**
- JWT token: `user_role = "member"`
- Database: `role = "admin"`
- Policy check: `auth.jwt() ->> 'user_role'` returns "member"
- Tapi database expects "admin"
- Mismatch causes authentication failure

## Solution

### Option 1: Force Logout (Recommended)

**User harus logout dan login lagi:**

1. **Logout** dari aplikasi
2. **Clear browser cache** (optional tapi recommended):
   - Chrome: Ctrl+Shift+Delete → Clear browsing data
   - Or just clear localStorage: F12 → Application → Local Storage → Clear
3. **Login** lagi dengan username dan password yang sama
4. **JWT token baru** akan di-issue dengan role "admin"
5. **Should work** ✅

### Option 2: Revoke All Sessions (Database)

Jika user tidak bisa logout (misalnya lupa password), revoke semua session:

```sql
-- Revoke all sessions for a specific user
DELETE FROM auth.sessions 
WHERE user_id = (SELECT id FROM users WHERE username = 'user1');

-- Or revoke all refresh tokens
UPDATE auth.refresh_tokens 
SET revoked = true 
WHERE user_id = (SELECT id FROM users WHERE username = 'user1');
```

Setelah ini, user **harus** login lagi.

### Option 3: Reset Password (Force Re-login)

Cara paling aman untuk force user re-login:

```sql
-- This will invalidate all sessions
UPDATE auth.users 
SET encrypted_password = crypt('newpassword123', gen_salt('bf'))
WHERE email = 'user1@gmail.com';
```

User harus login dengan password baru.

## Prevention: Proper Role Change Flow

### Best Practice

Ketika mengubah role user, **juga revoke sessions mereka:**

```sql
-- Step 1: Change role
UPDATE users 
SET role = 'admin' 
WHERE username = 'user1';

-- Step 2: Revoke all sessions (force re-login)
DELETE FROM auth.sessions 
WHERE user_id = (SELECT id FROM users WHERE username = 'user1');

-- Step 3: Notify user (optional)
-- Send email: "Your role has been changed to admin. Please login again."
```

### Alternative: Build Admin UI

Create admin interface untuk change roles yang otomatis:
1. Update role di database
2. Revoke user sessions
3. Send notification
4. Log the change

## Testing Steps

### Test Role Change Flow

1. **Login as member:**
   ```
   Username: member1
   Password: [password]
   Role: member
   ```

2. **Verify member access:**
   - Can access member pages ✅
   - Cannot access admin pages ❌

3. **Change role to admin (in Supabase):**
   ```sql
   UPDATE users SET role = 'admin' WHERE username = 'member1';
   ```

4. **Logout and clear cache:**
   - Click logout
   - Clear browser localStorage
   - Close all tabs

5. **Login again:**
   ```
   Username: member1
   Password: [same password]
   ```

6. **Verify admin access:**
   - Can access admin pages ✅
   - Can access member pages ✅
   - JWT token has `user_role: "admin"` ✅

## Debugging

### Check Current JWT Token

In browser console:
```javascript
// Get current token
const token = localStorage.getItem('sb-gpittnsfzgkdbqnccncn-auth-token');
console.log(token);

// Decode JWT (use jwt.io)
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Current role in JWT:', payload.user_role);
```

### Check Database Role

```sql
SELECT username, role FROM users WHERE username = 'member1';
```

### Check Active Sessions

```sql
SELECT 
  s.id,
  s.user_id,
  u.username,
  u.role as db_role,
  s.created_at,
  s.updated_at
FROM auth.sessions s
JOIN users u ON s.user_id = u.id
WHERE u.username = 'member1';
```

## Common Mistakes

### ❌ Wrong: Just Update Database
```sql
-- This alone won't work!
UPDATE users SET role = 'admin' WHERE username = 'user1';
-- User still has old JWT token
```

### ✅ Correct: Update + Force Re-login
```sql
-- Update role
UPDATE users SET role = 'admin' WHERE username = 'user1';

-- Force re-login by revoking sessions
DELETE FROM auth.sessions 
WHERE user_id = (SELECT id FROM users WHERE username = 'user1');
```

## Summary

**Problem:** JWT token caches old role
**Solution:** Logout + Login lagi untuk get new JWT token
**Prevention:** Revoke sessions when changing roles

---
**Status:** User action required (logout + login)
**Last Updated:** November 25, 2025
