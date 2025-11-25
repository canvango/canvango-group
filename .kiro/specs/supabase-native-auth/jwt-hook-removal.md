# JWT Hook Removal - Supabase Native Auth Migration

**Created:** 2025-11-25
**Status:** ✅ Database function removed | ⚠️ Dashboard configuration pending

---

## Database Function Removal

### ✅ COMPLETED: Drop Function

The `custom_access_token_hook` function has been successfully removed from the database.

**Migration Applied:**
```sql
DROP FUNCTION IF EXISTS custom_access_token_hook(jsonb);
```

**Verification Query:**
```sql
SELECT proname FROM pg_proc WHERE proname LIKE '%custom_access_token%';
-- Result: 0 rows (function successfully removed)
```

---

## ⚠️ MANUAL STEP REQUIRED: Remove Dashboard Configuration

The database function has been removed, but you must also remove the hook configuration from the Supabase Dashboard.

### Steps to Remove Hook Configuration:

1. **Open Supabase Dashboard**
   - Go to your project dashboard at https://supabase.com/dashboard

2. **Navigate to Auth Hooks**
   - Click on "Authentication" in the left sidebar
   - Click on "Hooks" tab

3. **Remove Custom Access Token Hook**
   - Look for "Custom Access Token Hook" section
   - If configured, you'll see the function name: `custom_access_token_hook`
   - Click "Remove" or "Disable" button
   - Confirm the removal

4. **Verify Removal**
   - The hook section should show "No hook configured" or similar message
   - Save changes if required

### Alternative: Check via Supabase CLI

If you have Supabase CLI installed, you can check the hook configuration:

```bash
# List all auth hooks
supabase functions list

# Or check project settings
supabase projects api-keys --project-ref YOUR_PROJECT_REF
```

---

## Testing: Verify JWT Claims

After removing both the function and dashboard configuration, test that new logins don't include `user_role` in JWT claims.

### Test Steps:

1. **Login with a test user**
   ```typescript
   const { data, error } = await supabase.auth.signInWithPassword({
     email: 'test@example.com',
     password: 'password123'
   });
   ```

2. **Inspect JWT token**
   ```typescript
   const token = data.session.access_token;
   
   // Decode JWT (use jwt.io or a library)
   const decoded = JSON.parse(atob(token.split('.')[1]));
   console.log('JWT Claims:', decoded);
   ```

3. **Verify user_role is NOT present**
   ```typescript
   // ✅ EXPECTED: user_role should NOT exist in claims
   console.log('Has user_role?', 'user_role' in decoded); // Should be false
   
   // ✅ EXPECTED: Only standard Supabase claims
   // {
   //   sub: "user-uuid",
   //   email: "test@example.com",
   //   aud: "authenticated",
   //   role: "authenticated",  // This is Supabase's auth role, not our custom user_role
   //   iat: 1234567890,
   //   exp: 1234567890
   // }
   ```

### Expected JWT Structure (After Removal)

**Before (with custom hook):**
```json
{
  "sub": "user-uuid",
  "email": "test@example.com",
  "aud": "authenticated",
  "role": "authenticated",
  "user_role": "admin",  // ❌ Custom claim (should be removed)
  "iat": 1234567890,
  "exp": 1234567890
}
```

**After (without custom hook):**
```json
{
  "sub": "user-uuid",
  "email": "test@example.com",
  "aud": "authenticated",
  "role": "authenticated",  // ✅ Standard Supabase auth role
  "iat": 1234567890,
  "exp": 1234567890
}
```

---

## Impact Analysis

### ✅ What Still Works

After removing the JWT hook:

1. **Authentication** - Users can still login/logout normally
2. **Session Management** - Sessions are managed by Supabase Auth
3. **User Identification** - `auth.uid()` still works in RLS policies
4. **Standard Claims** - All standard JWT claims remain (sub, email, aud, role)

### ⚠️ What Changes

1. **No user_role in JWT** - The custom `user_role` claim is no longer added
2. **RLS Policies** - Must query role from database (already updated in task 1.4)
3. **Frontend Code** - Must query role from database (will be updated in Phase 2)

### ❌ What Breaks (If Not Updated)

If RLS policies or frontend code still rely on `auth.jwt() ->> 'user_role'`:

1. **RLS Policies** - Will fail to authorize admin actions
2. **Frontend Role Checks** - Will not find role in JWT token
3. **Admin Dashboard** - May show access denied errors

**Solution:** Complete tasks 1.4 (Update RLS policies) and Phase 2 (Update frontend) to fix these issues.

---

## Rollback Plan

If you need to restore the JWT hook:

### 1. Recreate the Function

```sql
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  claims jsonb;
  user_role text;
BEGIN
  -- Fetch the user role from the users table
  SELECT role::text INTO user_role
  FROM public.users
  WHERE id = (event->>'user_id')::uuid;

  -- Get existing claims
  claims := event->'claims';
  
  -- Add user_role to the claims with explicit text type
  IF user_role IS NOT NULL THEN
    claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role::text));
  ELSE
    -- Default to 'user' if no role found
    claims := jsonb_set(claims, '{user_role}', to_jsonb('user'::text));
  END IF;

  -- Update the event object with new claims
  event := jsonb_set(event, '{claims}', claims);

  RETURN event;
END;
$function$;
```

### 2. Reconfigure in Dashboard

- Go to Authentication > Hooks
- Select "Custom Access Token Hook"
- Enter function name: `custom_access_token_hook`
- Save configuration

### 3. Test

- Login with a test user
- Verify `user_role` appears in JWT claims

---

## Next Steps

After completing this task:

1. ✅ **Task 1.3 Complete** - JWT hook function removed from database
2. ⚠️ **Manual Action Required** - Remove hook configuration from Supabase Dashboard
3. ➡️ **Next Task: 1.4** - Update RLS policies to use database queries
4. ➡️ **Phase 2** - Update frontend to query role from database

**Important:** Do not proceed to production until all tasks in Phase 1 and Phase 2 are complete!

