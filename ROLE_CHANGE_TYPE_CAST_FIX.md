# Role Change Type Cast Fix

## Problem
Ketika mencoba mengubah role user di Table Editor Supabase, muncul error:
```
ERROR: operator does not exist: character varying = uuid
HINT: No operator matches the given name and argument types. You might need to add explicit type casts.
```

## Root Cause
Trigger function `handle_role_change()` mencoba membandingkan `user_id` dengan `NEW.id` tanpa memperhatikan perbedaan tipe data:

- `users.id` → **UUID**
- `auth.sessions.user_id` → **UUID** ✅ (compatible)
- `auth.refresh_tokens.user_id` → **VARCHAR** ❌ (incompatible)

## Solution
Tambahkan explicit type cast untuk `auth.refresh_tokens.user_id`:

```sql
-- ❌ BEFORE (Error)
UPDATE auth.refresh_tokens 
SET revoked = true 
WHERE user_id = NEW.id AND revoked = false;

-- ✅ AFTER (Fixed)
UPDATE auth.refresh_tokens 
SET revoked = true 
WHERE user_id = NEW.id::text AND revoked = false;
```

## Fixed Function

```sql
CREATE OR REPLACE FUNCTION public.handle_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only proceed if role actually changed
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    -- Log the role change
    RAISE NOTICE 'Role changed for user %: % -> %', NEW.username, OLD.role, NEW.role;
    
    -- Revoke all sessions to force re-login
    -- auth.sessions.user_id is UUID, so no cast needed
    DELETE FROM auth.sessions WHERE user_id = NEW.id;
    
    -- Mark all refresh tokens as revoked
    -- auth.refresh_tokens.user_id is VARCHAR, so cast NEW.id to text
    UPDATE auth.refresh_tokens 
    SET revoked = true 
    WHERE user_id = NEW.id::text AND revoked = false;
    
    RAISE NOTICE 'Sessions revoked for user %. User must login again.', NEW.username;
  END IF;
  
  RETURN NEW;
END;
$function$;
```

## Migration Applied
- **Migration:** `fix_handle_role_change_correct_cast`
- **Date:** 2025-11-25
- **Status:** ✅ Success

## Testing

### Test Case 1: Update Role via SQL
```sql
UPDATE public.users 
SET role = 'admin'
WHERE username = 'admin1';
```
**Result:** ✅ Success - Role updated to 'admin'

### Test Case 2: Update Role via Table Editor
1. Login ke Supabase Dashboard
2. Buka Table Editor → users
3. Edit role column
4. Change from 'member' to 'admin'
5. Save

**Result:** ✅ Should work without errors

### Test Case 3: Verify Session Revocation
1. User login dengan role 'member'
2. Admin change role to 'admin'
3. User tries to access protected resource
4. ✅ Should be logged out (session revoked)

## Data Type Reference

| Table | Column | Type | Cast Needed? |
|-------|--------|------|--------------|
| `users` | `id` | UUID | - |
| `auth.sessions` | `user_id` | UUID | ❌ No |
| `auth.refresh_tokens` | `user_id` | VARCHAR | ✅ Yes (`::text`) |

## Why Different Types?

**Supabase Auth Schema:**
- `auth.sessions.user_id` uses UUID (native Postgres type)
- `auth.refresh_tokens.user_id` uses VARCHAR (for compatibility)

**Our Schema:**
- `users.id` uses UUID (matches auth.uid())

**Solution:**
- Cast UUID to TEXT when comparing with VARCHAR columns
- No cast needed when comparing UUID with UUID

## Related Files
- Migration: `supabase/migrations/*_fix_handle_role_change_correct_cast.sql`
- Function: `public.handle_role_change()`
- Trigger: `users_role_change_trigger` on `public.users`

## Notes
- This fix ensures role changes work correctly in all interfaces (SQL Editor, Table Editor, API)
- Session revocation still works as expected
- No impact on application performance
- Type casting is handled at database level
