# Phone Number Registration Fix

## Problem
Nomor HP yang diinput saat registrasi tidak tersimpan di database. Di halaman `/admin/users`, kolom PHONE menampilkan kosong meskipun user sudah memasukkan nomor HP saat register.

## Root Cause Analysis

### Flow Registrasi (Before Fix)
```
1. User fills registration form with phone number
   ↓
2. Frontend calls register() with phone data
   ↓
3. auth.service.ts calls supabase.auth.signUp()
   WITHOUT phone in metadata
   ↓
4. Supabase creates user in auth.users
   ↓
5. Trigger on_auth_user_created fires
   → handle_new_user() inserts into public.users
   → WITHOUT phone field
   → Uses ON CONFLICT DO NOTHING
   ↓
6. Application tries to insert user with phone
   → ON CONFLICT detected (user already exists)
   → DO NOTHING (phone not inserted!)
   ↓
7. Result: User created WITHOUT phone ❌
```

### The Problem
1. **Trigger creates user first** - `handle_new_user()` trigger fires immediately when auth user is created
2. **Trigger doesn't include phone** - Original trigger only extracts username and full_name from metadata
3. **ON CONFLICT DO NOTHING** - When app tries to insert with phone, conflict is detected and phone is ignored

## Solution

### 1. Pass Phone to Supabase Auth Metadata
Update `auth.service.ts` to include phone in user metadata:

```typescript
// ✅ AFTER (Fixed)
const { data: authData, error: authError } = await supabase.auth.signUp({
  email: data.email,
  password: data.password,
  options: {
    data: {
      username: data.username,
      full_name: data.fullName || data.username,
      phone: data.phone, // ← Added
    }
  }
});
```

### 2. Update Trigger to Extract Phone
Update `handle_new_user()` function to extract phone from metadata:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.users (
    id,
    auth_id,
    email,
    username,
    full_name,
    phone, -- ← Added
    phone_verified_at, -- ← Added
    role,
    balance,
    email_verified_at,
    created_at,
    updated_at,
    password
  )
  VALUES (
    NEW.id,
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'phone', -- ← Extract from metadata
    CASE 
      WHEN NEW.raw_user_meta_data->>'phone' IS NOT NULL 
      THEN NOW() 
      ELSE NULL 
    END, -- ← Auto-verify if phone exists
    'member',
    0,
    NEW.email_confirmed_at,
    NOW(),
    NOW(),
    ''
  )
  ON CONFLICT (id) DO UPDATE SET
    phone = COALESCE(EXCLUDED.phone, users.phone), -- ← Update on conflict
    phone_verified_at = COALESCE(EXCLUDED.phone_verified_at, users.phone_verified_at),
    updated_at = NOW();
  
  RETURN NEW;
END;
$function$;
```

### 3. Simplify Application Code
Since trigger now handles user creation, simplify app code:

```typescript
// ✅ AFTER (Simplified)
// Fetch user profile created by trigger
const { data: profileData, error: profileError } = await supabase
  .from('users')
  .select('*')
  .eq('id', authData.user.id)
  .single();
```

## Flow Registrasi (After Fix)

```
1. User fills registration form with phone number
   ↓
2. Frontend calls register() with phone data
   ↓
3. auth.service.ts calls supabase.auth.signUp()
   WITH phone in metadata ✅
   ↓
4. Supabase creates user in auth.users
   with raw_user_meta_data = { phone: "+628xxx" }
   ↓
5. Trigger on_auth_user_created fires
   → handle_new_user() extracts phone from metadata
   → Inserts into public.users WITH phone ✅
   ↓
6. Application fetches created user profile
   → User has phone number ✅
   ↓
7. Result: User created WITH phone ✅
```

## Files Modified

### 1. Migration
- **File:** `supabase/migrations/*_fix_handle_new_user_include_phone.sql`
- **Changes:** Updated `handle_new_user()` function to extract and insert phone

### 2. Auth Service
- **File:** `src/features/member-area/services/auth.service.ts`
- **Changes:** 
  - Pass phone in signUp metadata
  - Simplified user creation (let trigger handle it)

## Testing

### Test Case 1: New User Registration
1. Go to `/register`
2. Fill form:
   - Username: `testuser`
   - Email: `test@example.com`
   - Full Name: `Test User`
   - Phone: `081234567890`
   - Password: `password123`
3. Click "Daftar"
4. ✅ Registration should succeed

### Test Case 2: Verify Phone in Database
```sql
SELECT id, username, email, phone, phone_verified_at
FROM public.users
WHERE username = 'testuser';
```
**Expected:**
- phone: `+6281234567890` ✅
- phone_verified_at: `2025-11-25 ...` ✅

### Test Case 3: Verify Phone in Admin Panel
1. Login as admin
2. Go to `/admin/users`
3. Find the new user
4. ✅ PHONE column should show the phone number

### Test Case 4: Phone Normalization
Test different phone formats:
- `081234567890` → `+6281234567890` ✅
- `+6281234567890` → `+6281234567890` ✅
- `6281234567890` → `+6281234567890` ✅

## Benefits

### Before Fix
- ❌ Phone number not saved
- ❌ Duplicate insert attempts
- ❌ Confusing code flow
- ❌ Admin can't see user phone

### After Fix
- ✅ Phone number saved correctly
- ✅ Single source of truth (trigger)
- ✅ Cleaner code
- ✅ Admin can see user phone
- ✅ Phone auto-verified on registration

## Migration Details

**Migration Name:** `fix_handle_new_user_include_phone`
**Applied:** 2025-11-25
**Status:** ✅ Success

## Related Issues
- Phone number not appearing in admin panel
- User metadata not being used
- Duplicate user creation logic

## Notes

### Why Use Metadata?
- Supabase Auth stores custom data in `raw_user_meta_data`
- Trigger can access this data when user is created
- Single source of truth for user creation

### Why Auto-Verify Phone?
- User provides phone during registration
- No OTP verification implemented yet
- Auto-verify for now, can add OTP later

### Why ON CONFLICT DO UPDATE?
- Handles edge cases where user might already exist
- Updates phone if new data is provided
- Prevents data loss

## Future Improvements
- [ ] Add phone OTP verification
- [ ] Allow users to update phone number
- [ ] Add phone number validation on backend
- [ ] Add phone number uniqueness constraint (optional)
