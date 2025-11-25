# RLS Policies Backup - Supabase Native Auth Migration

**Created:** 2025-11-25
**Purpose:** Backup of all RLS policies before migration from JWT claims to database queries

---

## Summary

**Total Policies Found:** 49
**Policies Using JWT Claims:** 3 (users table only)
**Policies Using Database Subqueries:** 46 (already migrated pattern)

---

## ⚠️ CRITICAL: Policies Using JWT Claims (MUST UPDATE)

These 3 policies on the `users` table use `auth.jwt() ->> 'user_role'` and MUST be updated:

### 1. users - "Admins can delete users"
- **Command:** DELETE
- **Current Definition:** `((auth.jwt() ->> 'user_role'::text) = 'admin'::text)`
- **Status:** ❌ Uses JWT claims - NEEDS UPDATE

### 2. users - "Admins can update user roles"
- **Command:** UPDATE
- **Current Definition:** `((auth.jwt() ->> 'user_role'::text) = 'admin'::text)`
- **Status:** ❌ Uses JWT claims - NEEDS UPDATE

### 3. users - "Admins can view all users"
- **Command:** SELECT
- **Current Definition:** `((auth.jwt() ->> 'user_role'::text) = 'admin'::text)`
- **Status:** ❌ Uses JWT claims - NEEDS UPDATE

---

## ✅ Policies Already Using Database Queries (NO UPDATE NEEDED)

These policies already use the correct pattern `(EXISTS (SELECT 1 FROM users WHERE ...))`:

### api_endpoints (2 policies)
1. **"Anyone can read active API endpoints"** (SELECT)
   - Definition: `(is_active = true)`
   - Status: ✅ No role check needed

2. **"Only admins can manage API endpoints"** (ALL)
   - Definition: `(EXISTS ( SELECT 1 FROM users WHERE ((users.id = auth.uid()) AND ((users.role)::text = 'admin'::text))))`
   - Status: ✅ Already uses database query

### api_keys (3 policies)
1. **"Users can create their own API keys"** (INSERT)
   - Definition: `null`
   - Status: ✅ No role check needed

2. **"Users can update their own API keys"** (UPDATE)
   - Definition: `(user_id = auth.uid())`
   - Status: ✅ No role check needed

3. **"Users can view their own API keys"** (SELECT)
   - Definition: `(user_id = auth.uid())`
   - Status: ✅ No role check needed

### categories (2 policies)
1. **"Allow admin full access to categories"** (ALL)
   - Definition: `(EXISTS ( SELECT 1 FROM users WHERE ((users.auth_id = auth.uid()) AND ((users.role)::text = 'admin'::text))))`
   - Status: ✅ Already uses database query

2. **"Allow public read access to active categories"** (SELECT)
   - Definition: `(is_active = true)`
   - Status: ✅ No role check needed

### phone_otp_verifications (4 policies)
1. **"Admin can view all OTP records"** (ALL)
   - Definition: `(EXISTS ( SELECT 1 FROM users WHERE ((users.id = auth.uid()) AND ((users.role)::text = 'admin'::text))))`
   - Status: ✅ Already uses database query

2. **"Anyone can create OTP records"** (INSERT)
   - Definition: `null`
   - Status: ✅ No role check needed

3. **"Users can update own OTP records"** (UPDATE)
   - Definition: `((auth.uid() = user_id) OR (user_id IS NULL))`
   - Status: ✅ No role check needed

4. **"Users can view own OTP records"** (SELECT)
   - Definition: `((auth.uid() = user_id) OR (user_id IS NULL))`
   - Status: ✅ No role check needed

### product_account_fields (1 policy)
1. **"Admin full access to product_account_fields"** (ALL)
   - Definition: `(EXISTS ( SELECT 1 FROM users WHERE ((users.id = auth.uid()) AND ((users.role)::text = 'admin'::text))))`
   - Status: ✅ Already uses database query

### product_accounts (3 policies)
1. **"Admin full access to product_accounts"** (ALL)
   - Definition: `(EXISTS ( SELECT 1 FROM users WHERE ((users.id = auth.uid()) AND ((users.role)::text = 'admin'::text))))`
   - Status: ✅ Already uses database query

2. **"Users can view available stock"** (SELECT)
   - Definition: `((status)::text = 'available'::text)`
   - Status: ✅ No role check needed

3. **"Users can view their purchased accounts"** (SELECT)
   - Definition: `(assigned_to_transaction_id IN ( SELECT transactions.id FROM transactions WHERE (transactions.user_id = auth.uid())))`
   - Status: ✅ No role check needed

### products (5 policies)
1. **"Authenticated users can view all products"** (SELECT)
   - Definition: `true`
   - Status: ✅ No role check needed

2. **"Everyone can view active products"** (SELECT)
   - Definition: `(is_active = true)`
   - Status: ✅ No role check needed

3. **"Only admins can create products"** (INSERT)
   - Definition: `null`
   - Status: ⚠️ No restriction - may need admin check

4. **"Only admins can delete products"** (DELETE)
   - Definition: `(EXISTS ( SELECT 1 FROM users WHERE ((users.id = auth.uid()) AND ((users.role)::text = 'admin'::text))))`
   - Status: ✅ Already uses database query

5. **"Only admins can update products"** (UPDATE)
   - Definition: `(EXISTS ( SELECT 1 FROM users WHERE ((users.id = auth.uid()) AND ((users.role)::text = 'admin'::text))))`
   - Status: ✅ Already uses database query

### purchases (6 policies)
1. **"Admins can delete purchases"** (DELETE)
   - Definition: `(EXISTS ( SELECT 1 FROM users WHERE ((users.id = auth.uid()) AND ((users.role)::text = 'admin'::text))))`
   - Status: ✅ Already uses database query

2. **"Admins can update all purchases"** (UPDATE)
   - Definition: `(EXISTS ( SELECT 1 FROM users WHERE ((users.id = auth.uid()) AND ((users.role)::text = 'admin'::text))))`
   - Status: ✅ Already uses database query

3. **"Admins can view all purchases"** (SELECT)
   - Definition: `(EXISTS ( SELECT 1 FROM users WHERE ((users.id = auth.uid()) AND ((users.role)::text = 'admin'::text))))`
   - Status: ✅ Already uses database query

4. **"Users can create own purchases"** (INSERT)
   - Definition: `null`
   - Status: ✅ No role check needed

5. **"Users can update own purchases"** (UPDATE)
   - Definition: `(user_id = auth.uid())`
   - Status: ✅ No role check needed

6. **"Users can view own purchases"** (SELECT)
   - Definition: `(user_id = auth.uid())`
   - Status: ✅ No role check needed

### role_audit_logs (2 policies)
1. **"Allow admins to read audit logs"** (SELECT)
   - Definition: `(EXISTS ( SELECT 1 FROM users WHERE ((users.id = auth.uid()) AND ((users.role)::text = 'admin'::text))))`
   - Status: ✅ Already uses database query

2. **"Allow system to insert audit logs"** (INSERT)
   - Definition: `null`
   - Status: ✅ No role check needed

### transactions (5 policies)
1. **"Admins can delete transactions"** (DELETE)
   - Definition: `(EXISTS ( SELECT 1 FROM users WHERE ((users.id = auth.uid()) AND ((users.role)::text = 'admin'::text))))`
   - Status: ✅ Already uses database query

2. **"Admins can update all transactions"** (UPDATE)
   - Definition: `(EXISTS ( SELECT 1 FROM users WHERE ((users.id = auth.uid()) AND ((users.role)::text = 'admin'::text))))`
   - Status: ✅ Already uses database query

3. **"Admins can view all transactions"** (SELECT)
   - Definition: `(EXISTS ( SELECT 1 FROM users WHERE ((users.id = auth.uid()) AND ((users.role)::text = 'admin'::text))))`
   - Status: ✅ Already uses database query

4. **"Users can create own transactions"** (INSERT)
   - Definition: `null`
   - Status: ✅ No role check needed

5. **"Users can view own transactions"** (SELECT)
   - Definition: `(user_id = auth.uid())`
   - Status: ✅ No role check needed

### tutorials (3 policies)
1. **"Admins can manage tutorials"** (ALL)
   - Definition: `(EXISTS ( SELECT 1 FROM users WHERE ((users.id = auth.uid()) AND ((users.role)::text = 'admin'::text))))`
   - Status: ✅ Already uses database query

2. **"Anyone can view published tutorials"** (SELECT)
   - Definition: `(is_published = true)`
   - Status: ✅ No role check needed

3. **"Authenticated users can view all tutorials"** (SELECT)
   - Definition: `true`
   - Status: ✅ No role check needed

### users (9 policies)
1. **"Admins can delete users"** (DELETE)
   - Definition: `((auth.jwt() ->> 'user_role'::text) = 'admin'::text)`
   - Status: ❌ Uses JWT claims - NEEDS UPDATE

2. **"Admins can update user roles"** (UPDATE)
   - Definition: `((auth.jwt() ->> 'user_role'::text) = 'admin'::text)`
   - Status: ❌ Uses JWT claims - NEEDS UPDATE

3. **"Admins can view all users"** (SELECT)
   - Definition: `((auth.jwt() ->> 'user_role'::text) = 'admin'::text)`
   - Status: ❌ Uses JWT claims - NEEDS UPDATE

4. **"Allow anonymous username lookup"** (SELECT)
   - Definition: `true`
   - Status: ✅ No role check needed

5. **"Allow user registration"** (INSERT)
   - Definition: `null`
   - Status: ✅ No role check needed

6. **"Authenticated users can insert own profile"** (INSERT)
   - Definition: `null`
   - Status: ✅ No role check needed

7. **"Service role has full access"** (ALL)
   - Definition: `true`
   - Status: ✅ No role check needed

8. **"Users can update own profile"** (UPDATE)
   - Definition: `(id = auth.uid())`
   - Status: ✅ No role check needed

9. **"Users can view own profile"** (SELECT)
   - Definition: `(id = auth.uid())`
   - Status: ✅ No role check needed

### warranty_claims (5 policies)
1. **"Admins can delete warranty claims"** (DELETE)
   - Definition: `(EXISTS ( SELECT 1 FROM users WHERE ((users.id = auth.uid()) AND ((users.role)::text = 'admin'::text))))`
   - Status: ✅ Already uses database query

2. **"Admins can update warranty claim status"** (UPDATE)
   - Definition: `(EXISTS ( SELECT 1 FROM users WHERE ((users.id = auth.uid()) AND ((users.role)::text = 'admin'::text))))`
   - Status: ✅ Already uses database query

3. **"Admins can view all warranty claims"** (SELECT)
   - Definition: `(EXISTS ( SELECT 1 FROM users WHERE ((users.id = auth.uid()) AND ((users.role)::text = 'admin'::text))))`
   - Status: ✅ Already uses database query

4. **"Users can create warranty claims for own purchases"** (INSERT)
   - Definition: `null`
   - Status: ✅ No role check needed

5. **"Users can view own warranty claims"** (SELECT)
   - Definition: `(user_id = auth.uid())`
   - Status: ✅ No role check needed

---

## Custom JWT Hook Function

**Function Name:** `custom_access_token_hook`
**Status:** ❌ EXISTS - MUST BE REMOVED

**Function Definition:**
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
$function$
```

---

## Migration Action Items

### Immediate Actions Required:

1. ✅ **Update 3 policies on users table** (from JWT claims to database query)
2. ✅ **Drop custom_access_token_hook function**
3. ✅ **Remove hook configuration from Supabase Dashboard** (Auth > Hooks)
4. ⚠️ **Consider adding admin check to products INSERT policy** (currently has no restriction)

### No Action Needed:

- 46 policies already use the correct database query pattern
- These policies will continue to work correctly after migration

---

## Rollback Information

If rollback is needed, restore the 3 users table policies and recreate the JWT hook function using the definitions above.

**Rollback Script Location:** `.kiro/specs/supabase-native-auth/rollback-migration.sql`

