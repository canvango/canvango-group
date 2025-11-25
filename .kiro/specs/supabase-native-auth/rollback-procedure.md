# Rollback Procedure - Supabase Native Auth Migration

**Created:** 2025-11-25
**Purpose:** Step-by-step guide to rollback the migration if issues occur

---

## ⚠️ When to Use This Rollback

Use this rollback procedure if you encounter:

1. **Authentication Issues**
   - Users cannot login after role changes
   - Admin access denied errors
   - RLS policy violations

2. **Performance Problems**
   - Slow query performance (> 10ms per request)
   - Database connection issues
   - High CPU usage from role queries

3. **Data Integrity Issues**
   - Incorrect role assignments
   - Authorization bypasses
   - Unexpected access patterns

4. **Critical Production Issues**
   - System downtime
   - User-facing errors
   - Data security concerns

---

## Rollback Steps

### Phase 1: Database Rollback (5-10 minutes)

#### Step 1: Run Rollback SQL Script

**File:** `.kiro/specs/supabase-native-auth/rollback-migration.sql`

**Execution:**

1. **Via Supabase Dashboard:**
   - Go to SQL Editor
   - Copy entire contents of `rollback-migration.sql`
   - Paste and execute
   - Verify "Success" message

2. **Via Supabase CLI:**
   ```bash
   supabase db execute -f .kiro/specs/supabase-native-auth/rollback-migration.sql
   ```

3. **Via psql:**
   ```bash
   psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" -f rollback-migration.sql
   ```

**What This Does:**
- ✅ Restores `custom_access_token_hook` function
- ✅ Restores JWT-based RLS policies on users table
- ✅ Adds rollback audit log

**Expected Output:**
```
BEGIN
CREATE FUNCTION
COMMENT
DROP POLICY
DROP POLICY
DROP POLICY
CREATE POLICY
COMMENT
CREATE POLICY
COMMENT
CREATE POLICY
COMMENT
COMMENT
COMMIT
```

---

#### Step 2: Verify Database Rollback

Run verification queries:

```sql
-- 1. Verify JWT hook function exists
SELECT proname FROM pg_proc WHERE proname = 'custom_access_token_hook';
-- Expected: 1 row

-- 2. Verify policies use JWT claims
SELECT policyname, qual 
FROM pg_policies 
WHERE tablename = 'users' 
  AND qual LIKE '%auth.jwt()%';
-- Expected: 3 rows (Admins can view/update/delete)

-- 3. Verify no policies use database queries on users table
SELECT policyname 
FROM pg_policies 
WHERE tablename = 'users' 
  AND qual LIKE '%SELECT%role%FROM users%';
-- Expected: 0 rows
```

**Status Check:**
- ✅ All 3 queries return expected results → Proceed to Step 3
- ❌ Any query fails → Review SQL script output for errors

---

#### Step 3: Restore Hook in Supabase Dashboard

**Manual Step Required:**

1. **Open Supabase Dashboard**
   - Navigate to https://supabase.com/dashboard
   - Select your project

2. **Go to Auth Hooks**
   - Click "Authentication" in left sidebar
   - Click "Hooks" tab

3. **Configure Custom Access Token Hook**
   - Find "Custom Access Token Hook" section
   - Click "Enable" or "Configure"
   - Enter function name: `custom_access_token_hook`
   - Click "Save" or "Apply"

4. **Verify Configuration**
   - Hook status should show "Enabled"
   - Function name should be `custom_access_token_hook`

**Screenshot Reference:**
```
┌─────────────────────────────────────────┐
│ Custom Access Token Hook                │
├─────────────────────────────────────────┤
│ Status: ● Enabled                       │
│ Function: custom_access_token_hook      │
│ [Disable] [Edit]                        │
└─────────────────────────────────────────┘
```

---

#### Step 4: Test JWT Claims

**Test Login:**

```typescript
// Login with test user
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'admin@example.com',
  password: 'password123'
});

// Decode JWT token
const token = data.session.access_token;
const payload = JSON.parse(atob(token.split('.')[1]));

console.log('JWT Claims:', payload);
```

**Expected JWT Structure:**
```json
{
  "sub": "user-uuid",
  "email": "admin@example.com",
  "aud": "authenticated",
  "role": "authenticated",
  "user_role": "admin",  // ✅ This should be present
  "iat": 1234567890,
  "exp": 1234567890
}
```

**Verification:**
- ✅ `user_role` claim is present → Rollback successful
- ❌ `user_role` claim is missing → Check dashboard hook configuration

---

### Phase 2: Frontend Rollback (10-15 minutes)

**Only required if you already deployed Phase 2 frontend changes**

#### Step 1: Restore Role Caching

**File:** `src/features/member-area/contexts/AuthContext.tsx`

**Changes to Revert:**

```typescript
// ✅ RESTORE: Cache user data in localStorage
const login = async (credentials) => {
  const result = await authService.login(credentials);
  
  // Restore caching
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(result.user));
  localStorage.setItem(TOKEN_KEY, result.token);
  localStorage.setItem(REFRESH_TOKEN_KEY, result.refreshToken);
  
  setUser(result.user);
};

// ✅ RESTORE: Load cached user data
useEffect(() => {
  const cachedData = localStorage.getItem(USER_DATA_KEY);
  if (cachedData) {
    setUser(JSON.parse(cachedData));
  }
}, []);
```

---

#### Step 2: Remove Role Polling

**File:** `src/features/member-area/contexts/AuthContext.tsx`

**Changes to Revert:**

```typescript
// ❌ REMOVE: Role polling logic
useEffect(() => {
  if (!user) return;
  
  const interval = setInterval(async () => {
    // Remove this entire polling logic
  }, 5000);
  
  return () => clearInterval(interval);
}, [user]);
```

---

#### Step 3: Restore JWT-Based Role Checks

**File:** `src/features/member-area/services/auth.service.ts`

**Changes to Revert:**

```typescript
// ✅ RESTORE: Get role from JWT token (if you had this)
export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  
  // Restore JWT-based role extraction
  const token = session.access_token;
  const payload = JSON.parse(atob(token.split('.')[1]));
  const role = payload.user_role || 'member';
  
  return {
    id: session.user.id,
    email: session.user.email,
    role: role,
    // ... other fields
  };
};
```

---

#### Step 4: Deploy Frontend Rollback

```bash
# Build and deploy
npm run build
vercel --prod

# Or your deployment method
```

---

### Phase 3: Verification (5 minutes)

#### Test 1: Admin Login

```typescript
// Login as admin
const { data } = await supabase.auth.signInWithPassword({
  email: 'admin@example.com',
  password: 'password123'
});

// Verify role in JWT
const token = data.session.access_token;
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Role:', payload.user_role); // Should be 'admin'

// Test admin access
const { data: users } = await supabase.from('users').select('*');
console.log('Can view all users:', users.length > 1); // Should be true
```

**Expected:** ✅ Admin can view all users

---

#### Test 2: Member Login

```typescript
// Login as member
const { data } = await supabase.auth.signInWithPassword({
  email: 'member@example.com',
  password: 'password123'
});

// Verify role in JWT
const token = data.session.access_token;
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Role:', payload.user_role); // Should be 'member'

// Test member access
const { data: users } = await supabase.from('users').select('*');
console.log('Can only view own profile:', users.length === 1); // Should be true
```

**Expected:** ✅ Member can only view own profile

---

#### Test 3: Role Change Requires Logout

```typescript
// 1. Login as member
await supabase.auth.signInWithPassword({
  email: 'member@example.com',
  password: 'password123'
});

// 2. Admin changes role to admin (via admin dashboard)
// ... (manual step)

// 3. Try to access admin page WITHOUT logout
const { data: users } = await supabase.from('users').select('*');
console.log('Still sees only own profile:', users.length === 1); // Should be true

// 4. Logout and login again
await supabase.auth.signOut();
await supabase.auth.signInWithPassword({
  email: 'member@example.com',
  password: 'password123'
});

// 5. Now can access admin features
const { data: allUsers } = await supabase.from('users').select('*');
console.log('Now sees all users:', allUsers.length > 1); // Should be true
```

**Expected:** ✅ Role change requires logout/login

---

## Post-Rollback Monitoring

### Monitor for 24 Hours

1. **Authentication Metrics**
   - Login success rate
   - Session creation rate
   - Token refresh rate

2. **RLS Policy Performance**
   - Query execution time
   - Policy violation rate
   - Access denied errors

3. **User Experience**
   - User complaints about role changes
   - Admin dashboard access issues
   - Authorization errors

### Alert Thresholds

- ⚠️ Login failure rate > 5%
- ⚠️ RLS query time > 10ms
- ⚠️ Access denied errors > 10/hour
- 🚨 System downtime > 1 minute

---

## Rollback Checklist

Use this checklist to ensure complete rollback:

### Database
- [ ] Rollback SQL script executed successfully
- [ ] JWT hook function exists in database
- [ ] RLS policies use `auth.jwt()` pattern
- [ ] No policies use database query pattern on users table
- [ ] Verification queries all pass

### Supabase Dashboard
- [ ] Custom Access Token Hook enabled
- [ ] Function name is `custom_access_token_hook`
- [ ] Hook status shows "Enabled"

### Testing
- [ ] Test user login shows `user_role` in JWT
- [ ] Admin can view all users
- [ ] Member can only view own profile
- [ ] Role change requires logout/login

### Frontend (if deployed)
- [ ] Role caching restored in localStorage
- [ ] Role polling logic removed
- [ ] JWT-based role checks restored
- [ ] Frontend deployed to production

### Monitoring
- [ ] Authentication metrics normal
- [ ] RLS policy performance acceptable
- [ ] No user-facing errors
- [ ] System stable for 24 hours

---

## If Rollback Fails

If the rollback procedure fails or causes additional issues:

### Emergency Contacts

1. **Database Issues**
   - Contact Supabase support
   - Provide project ref and error logs
   - Request manual intervention

2. **Frontend Issues**
   - Revert to previous deployment
   - Use version control to restore code
   - Deploy last known good version

3. **Critical Production Issues**
   - Enable maintenance mode
   - Notify users of temporary downtime
   - Escalate to senior engineers

### Emergency Rollback

If standard rollback fails, use emergency procedure:

```sql
-- Emergency: Disable RLS entirely (TEMPORARY ONLY)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Re-enable after fixing issues
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

**WARNING:** Only use this as last resort. System will be insecure with RLS disabled!

---

## Documentation Updates

After successful rollback:

1. **Update README**
   - Document that rollback was performed
   - Explain why rollback was necessary
   - Note current authentication approach

2. **Create Incident Report**
   - What went wrong
   - Why rollback was needed
   - Lessons learned
   - Prevention measures

3. **Update Migration Plan**
   - Identify issues that caused rollback
   - Plan fixes before retry
   - Add additional testing steps

---

## Re-attempting Migration

If you want to retry the migration after rollback:

1. **Analyze Rollback Reason**
   - Identify root cause of issues
   - Fix underlying problems
   - Add additional safeguards

2. **Enhanced Testing**
   - Test on staging environment first
   - Run load tests
   - Verify all edge cases

3. **Gradual Rollout**
   - Deploy to small user group first
   - Monitor for 48 hours
   - Gradually increase rollout percentage

4. **Improved Monitoring**
   - Add more detailed logging
   - Set up real-time alerts
   - Monitor key metrics closely

