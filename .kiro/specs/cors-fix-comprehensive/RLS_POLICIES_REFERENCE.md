# Supabase RLS Policies - Quick Reference

## Overview

This document provides a quick reference for all Row Level Security (RLS) policies implemented in the Canvango application.

## Policy Summary by Table

### 1. Warranty Claims (5 policies)

| Policy Name | Operation | Who | Description |
|------------|-----------|-----|-------------|
| Users can view own warranty claims | SELECT | Users | Users only see their own claims |
| Users can create warranty claims for own purchases | INSERT | Users | Create claims with purchase validation |
| Admins can view all warranty claims | SELECT | Admins | Full visibility of all claims |
| Admins can update warranty claim status | UPDATE | Admins | Process and manage claims |
| Admins can delete warranty claims | DELETE | Admins | Cleanup capability |

**Key Features:**
- Automatic purchase ownership validation
- Warranty expiration check at database level
- Complete isolation between users

### 2. Transactions (5 policies)

| Policy Name | Operation | Who | Description |
|------------|-----------|-----|-------------|
| Users can view own transactions | SELECT | Users | Transaction history isolation |
| Users can create own transactions | INSERT | Users | Self-service transaction creation |
| Admins can view all transactions | SELECT | Admins | Full transaction visibility |
| Admins can update all transactions | UPDATE | Admins | Transaction management |
| Admins can delete transactions | DELETE | Admins | Cleanup capability |

**Key Features:**
- Complete transaction isolation per user
- Admin oversight for support
- Secure transaction creation

### 3. Purchases (6 policies)

| Policy Name | Operation | Who | Description |
|------------|-----------|-----|-------------|
| Users can view own purchases | SELECT | Users | Purchase history isolation |
| Users can create own purchases | INSERT | Users | Self-service purchasing |
| Users can update own purchases | UPDATE | Users | Status management |
| Admins can view all purchases | SELECT | Admins | Full purchase visibility |
| Admins can update all purchases | UPDATE | Admins | Purchase management |
| Admins can delete purchases | DELETE | Admins | Cleanup capability |

**Key Features:**
- Strict purchase isolation per user
- User can manage own purchase status
- Admin full control for support

### 4. Products (5 policies)

| Policy Name | Operation | Who | Description |
|------------|-----------|-----|-------------|
| Everyone can view active products | SELECT | Public | Public product catalog |
| Authenticated users can view all products | SELECT | Authenticated | Including inactive products |
| Only admins can create products | INSERT | Admins | Product creation restricted |
| Only admins can update products | UPDATE | Admins | Product management restricted |
| Only admins can delete products | DELETE | Admins | Product deletion restricted |

**Key Features:**
- Public access to active products (no auth required)
- Authenticated users see full catalog
- Complete admin control

### 5. Users (8 policies)

| Policy Name | Operation | Who | Description |
|------------|-----------|-----|-------------|
| Users can view own profile | SELECT | Users | Profile privacy |
| Users can update own profile | UPDATE | Users | Self-service (with restrictions) |
| Admins can view all users | SELECT | Admins | User management visibility |
| Admins can update user roles | UPDATE | Admins | Role management |
| Admins can delete users | DELETE | Admins | User cleanup |
| Service role has full access | ALL | Service | System operations |
| Allow user registration | INSERT | Public | Registration capability |
| Allow anonymous username lookup | SELECT | Anonymous | Login support |

**Key Features:**
- Users cannot change own role or balance
- Profile privacy between users
- Admin user management
- Service role for system operations

## Access Matrix

### User Access (Authenticated, Non-Admin)

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| warranty_claims | Own only | Own only | ❌ | ❌ |
| transactions | Own only | Own only | ❌ | ❌ |
| purchases | Own only | Own only | Own only | ❌ |
| products | All | ❌ | ❌ | ❌ |
| users | Own only | ❌ | Own only* | ❌ |

*Cannot change role or balance

### Admin Access

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| warranty_claims | All | ✅ | All | All |
| transactions | All | ✅ | All | All |
| purchases | All | ✅ | All | All |
| products | All | All | All | All |
| users | All | ✅ | All | All |

### Public Access (Unauthenticated)

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| warranty_claims | ❌ | ❌ | ❌ | ❌ |
| transactions | ❌ | ❌ | ❌ | ❌ |
| purchases | ❌ | ❌ | ❌ | ❌ |
| products | Active only | ❌ | ❌ | ❌ |
| users | Username lookup | Registration | ❌ | ❌ |

## Testing RLS Policies

### Test User Isolation

```typescript
// Login as user1
await supabase.auth.signInWithPassword({
  email: 'user1@test.com',
  password: 'test'
});

// Should only see own data
const { data: claims } = await supabase
  .from('warranty_claims')
  .select('*');

console.assert(
  claims.every(c => c.user_id === user1Id),
  'User should only see own claims'
);
```

### Test Admin Access

```typescript
// Login as admin
await supabase.auth.signInWithPassword({
  email: 'admin@test.com',
  password: 'test'
});

// Should see all data
const { data: claims } = await supabase
  .from('warranty_claims')
  .select('*');

const uniqueUsers = new Set(claims.map(c => c.user_id));
console.assert(
  uniqueUsers.size > 1,
  'Admin should see claims from multiple users'
);
```

### Test Unauthorized Access Prevention

```typescript
// Try to create claim for another user
const { error } = await supabase
  .from('warranty_claims')
  .insert({
    user_id: otherUserId, // Different user
    purchase_id: 'test-id',
    reason: 'test'
  });

console.assert(
  error && error.code === '42501',
  'Should prevent creating claims for other users'
);
```

## Common RLS Patterns

### 1. User Isolation Pattern

```sql
-- Users can only access their own data
CREATE POLICY "policy_name"
  ON table_name
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
```

### 2. Admin Override Pattern

```sql
-- Admins can access all data
CREATE POLICY "policy_name"
  ON table_name
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
```

### 3. Public Read Pattern

```sql
-- Everyone can read active records
CREATE POLICY "policy_name"
  ON table_name
  FOR SELECT
  TO public
  USING (is_active = true);
```

### 4. Ownership Validation Pattern

```sql
-- Validate ownership through foreign key
CREATE POLICY "policy_name"
  ON table_name
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM related_table
      WHERE related_table.id = table_name.related_id
      AND related_table.user_id = auth.uid()
    )
  );
```

## Troubleshooting

### Issue: "new row violates row-level security policy"

**Cause**: Trying to insert/update data that doesn't pass RLS checks

**Solution**: 
1. Check that `user_id` matches `auth.uid()`
2. Verify related records exist and belong to user
3. Ensure user has correct role for operation

### Issue: "permission denied for table"

**Cause**: RLS is enabled but no policies allow the operation

**Solution**:
1. Check if appropriate policy exists
2. Verify user is authenticated
3. Check user role if admin access required

### Issue: Empty result set when data exists

**Cause**: RLS policies filtering out data

**Solution**:
1. Verify you're logged in as correct user
2. Check if data belongs to current user
3. Verify admin role if trying to access all data

## Security Best Practices

1. ✅ **Always enable RLS** on tables with user data
2. ✅ **Use auth.uid()** for user identification
3. ✅ **Validate ownership** through foreign keys
4. ✅ **Separate user and admin policies** for clarity
5. ✅ **Test policies** with different user roles
6. ✅ **Document policies** with clear names and comments
7. ✅ **Use WITH CHECK** on INSERT/UPDATE for validation
8. ✅ **Avoid SECURITY DEFINER** functions when possible

## Maintenance

### Adding New Policies

```sql
-- Template for new policy
CREATE POLICY "descriptive_policy_name"
  ON table_name
  FOR operation  -- SELECT, INSERT, UPDATE, DELETE, ALL
  TO role        -- authenticated, public, anon, service_role
  USING (condition)      -- For SELECT, UPDATE, DELETE
  WITH CHECK (condition); -- For INSERT, UPDATE
```

### Modifying Existing Policies

```sql
-- Drop old policy
DROP POLICY IF EXISTS "old_policy_name" ON table_name;

-- Create new policy
CREATE POLICY "new_policy_name"
  ON table_name
  FOR operation
  TO role
  USING (condition)
  WITH CHECK (condition);
```

### Checking Policy Coverage

```sql
-- List all tables without RLS
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
AND tablename NOT IN (
  SELECT tablename
  FROM pg_tables
  WHERE schemaname = 'public'
  AND rowsecurity = true
);
```

## Practical Examples

### Example 1: Fetching User's Warranty Claims

```typescript
// Frontend code - RLS automatically filters by user
const { data: claims, error } = await supabase
  .from('warranty_claims')
  .select(`
    *,
    purchase:purchases(
      id,
      product:products(id, product_name)
    )
  `)
  .order('created_at', { ascending: false });

// RLS ensures:
// - Only claims where user_id = auth.uid() are returned
// - No need to add .eq('user_id', userId) filter
// - Impossible to see other users' claims
```

### Example 2: Creating a Warranty Claim

```typescript
// Frontend code - RLS validates ownership
const { data, error } = await supabase
  .from('warranty_claims')
  .insert({
    user_id: user.id,           // Must match auth.uid()
    purchase_id: purchaseId,    // Must belong to user
    reason: 'account_suspended',
    description: 'Account not working'
  })
  .select()
  .single();

// RLS checks:
// 1. user_id matches auth.uid()
// 2. purchase_id exists in purchases table
// 3. purchase belongs to current user
// 4. Warranty hasn't expired
// If any check fails, insert is rejected
```

### Example 3: Admin Viewing All Claims

```typescript
// Admin user - sees all claims
const { data: allClaims, error } = await supabase
  .from('warranty_claims')
  .select('*, user:users(email, full_name)')
  .order('created_at', { ascending: false });

// RLS checks user role:
// - If role = 'admin', returns all claims
// - If role = 'user', returns only own claims
// Same query, different results based on role
```

### Example 4: Public Product Catalog

```typescript
// No authentication required
const { data: products, error } = await supabase
  .from('products')
  .select('*')
  .eq('is_active', true);

// RLS allows:
// - Anonymous users see active products
// - Authenticated users see all products
// - Only admins can create/update/delete
```

## Performance Considerations

### Index Recommendations

RLS policies use these columns frequently - ensure they're indexed:

```sql
-- User ID indexes (most important)
CREATE INDEX IF NOT EXISTS idx_warranty_claims_user_id 
  ON warranty_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id 
  ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_user_id 
  ON purchases(user_id);

-- Foreign key indexes
CREATE INDEX IF NOT EXISTS idx_warranty_claims_purchase_id 
  ON warranty_claims(purchase_id);
CREATE INDEX IF NOT EXISTS idx_purchases_product_id 
  ON purchases(product_id);

-- Role lookup index
CREATE INDEX IF NOT EXISTS idx_users_role 
  ON users(role);

-- Status filters
CREATE INDEX IF NOT EXISTS idx_products_is_active 
  ON products(is_active);
```

### Query Performance Tips

1. **Use specific columns in SELECT:**
   ```typescript
   // ✅ Good - only fetch needed columns
   .select('id, status, created_at')
   
   // ❌ Avoid - fetches all columns
   .select('*')
   ```

2. **Add filters to reduce RLS overhead:**
   ```typescript
   // ✅ Good - reduces rows checked by RLS
   .select('*')
   .eq('status', 'pending')
   .gte('created_at', lastWeek)
   
   // ❌ Avoid - RLS checks all rows
   .select('*')
   ```

3. **Use pagination for large datasets:**
   ```typescript
   // ✅ Good - limits rows processed
   .select('*')
   .range(0, 9)  // First 10 rows
   
   // ❌ Avoid - processes all rows
   .select('*')
   ```

## Debugging RLS Issues

### Enable RLS Logging

```sql
-- Enable detailed logging (development only)
ALTER DATABASE postgres SET log_statement = 'all';
ALTER DATABASE postgres SET log_min_duration_statement = 0;

-- Check logs in Supabase Dashboard → Logs → Database
```

### Test Policy Logic Directly

```sql
-- Test as specific user
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "user-uuid-here"}';

-- Run query to see what RLS allows
SELECT * FROM warranty_claims;

-- Reset
RESET role;
```

### Check Current User Context

```typescript
// In frontend code
const { data: { user } } = await supabase.auth.getUser();
console.log('Current user:', user?.id);
console.log('User role:', user?.user_metadata?.role);

// Verify this matches expected user
```

### Verify Policy Exists

```sql
-- List all policies for a table
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'warranty_claims';
```

## Security Audit Checklist

Use this checklist to verify RLS security:

- [ ] **RLS Enabled**: All tables with user data have RLS enabled
- [ ] **User Isolation**: Users cannot access other users' data
- [ ] **Admin Access**: Admins can access all data when needed
- [ ] **Public Access**: Only intended data is publicly accessible
- [ ] **Insert Validation**: WITH CHECK prevents invalid inserts
- [ ] **Update Validation**: WITH CHECK prevents invalid updates
- [ ] **Foreign Key Validation**: Ownership validated through relations
- [ ] **Role Checks**: Admin policies check user role correctly
- [ ] **No Bypass**: Service role key not exposed to frontend
- [ ] **Indexes**: Performance indexes on RLS filter columns
- [ ] **Testing**: All policies tested with different user roles
- [ ] **Documentation**: All policies documented with purpose

## Common Mistakes to Avoid

### ❌ Mistake 1: Forgetting to Enable RLS

```sql
-- Wrong - table has no RLS
CREATE TABLE sensitive_data (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  secret TEXT
);

-- Right - RLS enabled
CREATE TABLE sensitive_data (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  secret TEXT
);
ALTER TABLE sensitive_data ENABLE ROW LEVEL SECURITY;
```

### ❌ Mistake 2: Using Wrong User ID

```typescript
// Wrong - using user object from state
const { data } = await supabase
  .from('warranty_claims')
  .select('*')
  .eq('user_id', currentUser.id);  // Redundant and wrong

// Right - RLS handles filtering automatically
const { data } = await supabase
  .from('warranty_claims')
  .select('*');
// RLS automatically filters by auth.uid()
```

### ❌ Mistake 3: Exposing Service Role Key

```typescript
// ❌ NEVER DO THIS - exposes full database access
const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY  // WRONG!
);

// ✅ Always use anon key in frontend
const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY  // Correct
);
```

### ❌ Mistake 4: Not Testing with Different Roles

```typescript
// Wrong - only testing as admin
// Admin sees everything, doesn't catch user isolation bugs

// Right - test with multiple roles
describe('RLS Policies', () => {
  it('user sees only own data', async () => {
    await loginAsUser('user1@test.com');
    // Test user isolation
  });
  
  it('admin sees all data', async () => {
    await loginAsAdmin('admin@test.com');
    // Test admin access
  });
  
  it('anonymous sees public data only', async () => {
    await supabase.auth.signOut();
    // Test public access
  });
});
```

## Related Documentation

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Task 5 Implementation Summary](./TASK_5_RLS_POLICIES_COMPLETE.md)
- [Migration Guide](./MIGRATION_GUIDE.md)
- [Integration Tests Guide](./RLS_INTEGRATION_TESTS_GUIDE.md)

## Migration History

1. `enhance_warranty_claims_rls_policies` - Warranty claims security
2. `enhance_transactions_rls_policies` - Transaction security
3. `enhance_purchases_rls_policies` - Purchase security
4. `enhance_products_rls_policies` - Product security
5. `enhance_users_rls_policies` - User profile security

## Quick Reference Commands

```sql
-- Enable RLS on a table
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Disable RLS (not recommended)
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;

-- List all tables with RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- List all policies
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- Drop a policy
DROP POLICY IF EXISTS "policy_name" ON table_name;

-- Test as specific user (in SQL console)
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "user-uuid"}';
SELECT * FROM table_name;
RESET role;
```

---

**Last Updated**: Task 13 completion
**Total Policies**: 29 policies across 5 tables
**Status**: ✅ All policies active, tested, and documented
**Architecture**: Frontend-only with 100% Supabase RLS security
