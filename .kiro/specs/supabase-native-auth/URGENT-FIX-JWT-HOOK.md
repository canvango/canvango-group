# URGENT: Remove JWT Hook from Supabase Dashboard

## Problem

Registration and login are failing with error:
```
Error running hook URI: pg-functions://postgres/public/custom_access_token_hook
```

The custom JWT hook is still configured in Supabase Dashboard even though the function was deleted from the database.

## Solution

You must manually remove the hook from Supabase Dashboard:

### Step 1: Open Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to **Authentication** (left sidebar)

### Step 2: Remove Custom Access Token Hook

1. Click on **Hooks** in the Authentication section
2. Find **"Custom Access Token Hook"**
3. Click on it to open settings
4. Click **"Disable"** or **"Remove"** button
5. Confirm the removal

### Step 3: Verify Hook is Removed

After removing the hook:

1. Try to register a new user
2. Try to login with existing user
3. Both should work now

### Alternative: Use Supabase CLI

If you have Supabase CLI installed:

```bash
# List all hooks
supabase functions list

# Remove the hook (if shown)
supabase functions delete custom_access_token_hook
```

## Verification

After removing the hook, test:

```bash
# Test registration
curl -X POST 'https://your-project.supabase.co/auth/v1/signup' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Should return success without hook error.

## Why This Happened

The JWT hook was deleted from the database in Phase 1, but the hook configuration in Supabase Dashboard was not removed. The Dashboard still tries to call the non-existent function, causing the error.

## After Fix

Once the hook is removed:
- ✅ Registration will work
- ✅ Login will work
- ✅ Users will be redirected to dashboard
- ✅ Role changes will work automatically

## Need Help?

If you can't access Supabase Dashboard:
1. Check your Supabase account credentials
2. Verify you have admin access to the project
3. Contact Supabase support if needed
