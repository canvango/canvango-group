# RLS Integration Tests - Setup and Running Guide

## Overview

This guide explains how to set up and run the RLS (Row Level Security) integration tests for the Canvango application.

## Test File Location

```
src/__tests__/integration/rls-policies.integration.test.ts
```

## Prerequisites

### 1. Environment Variables

Create a `.env.test` file in the project root with the following variables:

```bash
# Standard Supabase configuration (from .env)
VITE_SUPABASE_URL=https://gpittnsfzgkdbqnccncn.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Service role key for test setup (REQUIRED for integration tests)
# ⚠️ NEVER commit this key or expose it in frontend code!
# Get this from: Supabase Dashboard → Settings → API → service_role key
TEST_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 2. Database Setup

Ensure your Supabase database has:
- ✅ All RLS policies applied (from Task 5)
- ✅ Tables: warranty_claims, transactions, purchases, products, users
- ✅ RLS enabled on all tables
- ✅ Proper foreign key relationships

### 3. Verify RLS Policies

Run this SQL in Supabase SQL Editor to verify policies exist:

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('warranty_claims', 'transactions', 'purchases', 'products', 'users');

-- List all RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

Expected output: All tables should have `rowsecurity = true` and multiple policies.

## Running the Tests

### Run All RLS Integration Tests

```bash
npm test -- rls-policies.integration.test.ts
```

### Run Specific Test Suite

```bash
# Test only warranty claims RLS
npm test -- rls-policies.integration.test.ts -t "Warranty Claims RLS"

# Test only transactions RLS
npm test -- rls-policies.integration.test.ts -t "Transactions RLS"

# Test only purchases RLS
npm test -- rls-policies.integration.test.ts -t "Purchases RLS"
```

### Run with Coverage

```bash
npm test -- --coverage rls-policies.integration.test.ts
```

### Run in Watch Mode (Development)

```bash
npm test -- --watch rls-policies.integration.test.ts
```

### Run with Verbose Output

```bash
npm test -- --verbose rls-policies.integration.test.ts
```

## Test Structure

### Test Suites

1. **Warranty Claims RLS Policies** (6 tests)
   - User isolation
   - Unauthorized access prevention
   - Admin access
   - Status update permissions

2. **Transactions RLS Policies** (5 tests)
   - User isolation
   - Transaction visibility
   - Admin access
   - Transaction creation

3. **Purchases RLS Policies** (6 tests)
   - User isolation
   - Purchase visibility
   - Admin access
   - Purchase updates

**Total: 17 integration tests**

### Test Flow

```
1. beforeAll: Setup
   ├─ Create service role client
   ├─ Create 3 test users (user1, user2, admin)
   ├─ Promote admin user
   └─ Create authenticated clients

2. Test Suite: Setup test data
   ├─ Create test products
   ├─ Create test purchases
   ├─ Create test claims/transactions
   └─ Run tests

3. Test Suite: Cleanup
   └─ Delete test data

4. afterAll: Cleanup
   └─ Delete test users
```

## Expected Test Results

### Success Output

```
PASS  src/__tests__/integration/rls-policies.integration.test.ts
  RLS Policies Integration Tests
    Warranty Claims RLS Policies
      ✓ should allow users to see only their own warranty claims (XXms)
      ✓ should prevent users from creating claims for other users purchases (XXms)
      ✓ should allow users to create claims for their own purchases (XXms)
      ✓ should allow admins to see all warranty claims (XXms)
      ✓ should allow admins to update warranty claim status (XXms)
      ✓ should prevent regular users from updating claim status (XXms)
    Transactions RLS Policies
      ✓ should allow users to see only their own transactions (XXms)
      ✓ should prevent users from seeing other users transactions (XXms)
      ✓ should allow admins to see all transactions (XXms)
      ✓ should allow admins to update transaction status (XXms)
      ✓ should allow users to create their own transactions (XXms)
    Purchases RLS Policies
      ✓ should allow users to see only their own purchases (XXms)
      ✓ should prevent users from seeing other users purchases (XXms)
      ✓ should allow admins to see all purchases (XXms)
      ✓ should allow users to update their own purchase status (XXms)
      ✓ should prevent users from updating other users purchases (XXms)
      ✓ should allow admins to update any purchase (XXms)

Test Suites: 1 passed, 1 total
Tests:       17 passed, 17 total
```

## Troubleshooting

### Issue 1: "TEST_SUPABASE_SERVICE_ROLE_KEY must be set"

**Cause**: Service role key not configured

**Solution**:
```bash
# Add to .env.test
TEST_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Get key from: Supabase Dashboard → Settings → API → service_role
```

### Issue 2: Tests fail with "Permission denied for table"

**Cause**: RLS policies not applied or incorrect

**Solution**:
```bash
# Check if RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

# If rowsecurity = false, enable RLS
ALTER TABLE warranty_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

# Re-apply RLS policies from Task 5 migrations
```

### Issue 3: "User not found" or "Profile not found"

**Cause**: User profile creation trigger delay

**Solution**: Tests already include 2-second wait. If still failing:
```typescript
// Increase wait time in test file
await new Promise(resolve => setTimeout(resolve, 3000)); // 3 seconds
```

### Issue 4: Tests timeout

**Cause**: Slow network or Supabase project paused

**Solution**:
```bash
# Check Supabase project status
# Ensure project is not paused

# Increase Jest timeout in test file
jest.setTimeout(30000); // 30 seconds
```

### Issue 5: "Cannot read property 'id' of null"

**Cause**: Test user creation failed

**Solution**:
```bash
# Check Supabase auth settings
# Ensure email confirmation is not required for test users

# Or use service role to bypass confirmation
const { data } = await serviceClient.auth.admin.createUser({
  email: 'test@example.com',
  password: 'test123',
  email_confirm: true  // ← Important!
});
```

### Issue 6: Random test failures

**Cause**: Race conditions or insufficient cleanup

**Solution**:
```bash
# Run tests sequentially
npm test -- --runInBand rls-policies.integration.test.ts

# Or increase wait times between operations
await new Promise(resolve => setTimeout(resolve, 1000));
```

## Security Notes

### ⚠️ Service Role Key Security

**CRITICAL**: The service role key bypasses ALL RLS policies!

**DO**:
- ✅ Store in `.env.test` (gitignored)
- ✅ Use only in test environment
- ✅ Rotate regularly
- ✅ Restrict access to key

**DON'T**:
- ❌ Commit to version control
- ❌ Expose in frontend code
- ❌ Use in production
- ❌ Share publicly

### Test Data Isolation

- Tests create unique users with timestamps
- All test data is cleaned up after tests
- No interference with production data
- Separate test database recommended

## CI/CD Integration

### GitHub Actions Example

```yaml
name: RLS Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run RLS integration tests
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          TEST_SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.TEST_SUPABASE_SERVICE_ROLE_KEY }}
        run: npm test -- rls-policies.integration.test.ts
```

### Required GitHub Secrets

1. `VITE_SUPABASE_URL`
2. `VITE_SUPABASE_ANON_KEY`
3. `TEST_SUPABASE_SERVICE_ROLE_KEY`

## Test Coverage

### What's Tested

✅ User data isolation (warranty_claims, transactions, purchases)
✅ Unauthorized access prevention
✅ Admin access override
✅ CRUD operation permissions
✅ Foreign key relationship validation
✅ Status update permissions

### What's NOT Tested

❌ Products table RLS (public access, tested separately)
❌ Users table RLS (tested in database.integration.test.ts)
❌ Edge cases (expired warranties, etc. - covered in unit tests)
❌ Performance under load
❌ Concurrent access scenarios

## Next Steps

After RLS integration tests pass:

1. **Task 12**: Write E2E tests for complete user flows
2. **Task 13**: Update documentation
3. **Task 14**: Deploy and verify in production

## Related Documentation

- [RLS Policies Reference](./RLS_POLICIES_REFERENCE.md)
- [Task 5: RLS Implementation](./TASK_5_RLS_POLICIES_COMPLETE.md)
- [Task 11: Integration Tests](./TASK_11_RLS_INTEGRATION_TESTS_COMPLETE.md)
- [Supabase RLS Docs](https://supabase.com/docs/guides/auth/row-level-security)

## Support

If tests continue to fail after troubleshooting:

1. Check Supabase project status
2. Verify all migrations are applied
3. Review Supabase logs for errors
4. Check network connectivity
5. Ensure test environment variables are correct

---

**Last Updated**: Task 11 completion
**Test File**: `src/__tests__/integration/rls-policies.integration.test.ts`
**Total Tests**: 17 RLS integration tests
