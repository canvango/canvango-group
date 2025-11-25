# Integration Tests Guide - Role Change Flow

## Overview

This guide explains how to run the integration tests for the Supabase native authentication migration, specifically testing the role change flow and RLS policies.

## Test File

**Location:** `src/__tests__/integration/role-change.integration.test.ts`

## Test Coverage

The integration tests verify:

### 1. Requirement 1.1: User can login after admin changes their role
- ✅ User can login after role change from member to admin
- ✅ User can login after role change from admin to member  
- ✅ JWT tokens do not contain custom `user_role` claims

### 2. Requirement 4.1, 4.2: RLS policies work with new subquery pattern

#### Users Table
- ✅ Member can read only their own profile
- ✅ Member cannot read other users' profiles
- ✅ Admin can read all users
- ✅ Member cannot update their own role
- ✅ Admin can update other users' roles

#### Products Table
- ✅ Member can read products
- ✅ Member cannot create products
- ✅ Admin can create products
- ✅ Admin can update products
- ✅ Member cannot update products

#### Transactions Table
- ✅ Member can read only their own transactions
- ✅ Admin can read all transactions
- ✅ Member cannot read other users' transactions

#### Warranty Claims Table
- ✅ Member can read only their own warranty claims
- ✅ Admin can read all warranty claims
- ✅ Admin can update warranty claim status
- ✅ Member cannot update claim status

### 3. Performance Tests
- ✅ Role check queries execute efficiently (< 100ms average)
- ✅ Database uses index for role subqueries

## Prerequisites

### 1. Supabase Project Setup

You need a test Supabase project with:
- All migrations applied (especially RLS policy updates)
- No custom JWT hooks (removed as part of Phase 1)
- Updated RLS policies using subquery pattern

### 2. Environment Variables

Create a `.env.test` file or set these environment variables:

```bash
# Supabase Project URL
VITE_SUPABASE_URL=https://your-project.supabase.co

# Supabase Anonymous Key (public key)
VITE_SUPABASE_ANON_KEY=your-anon-key

# Supabase Service Role Key (for admin operations in tests)
TEST_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**⚠️ Security Warning:** 
- Never commit the service role key to version control
- Use a separate test project, not production
- Add `.env.test` to `.gitignore`

### 3. Database State

The tests will:
- Create temporary test users
- Create test data (products, transactions, claims)
- Clean up all test data after completion

**Note:** Tests use unique timestamps in email addresses to avoid conflicts.

## Running the Tests

### Run All Integration Tests

```bash
npm test -- role-change.integration.test.ts
```

### Run Specific Test Suite

```bash
# Test only role change login flow
npm test -- role-change.integration.test.ts -t "User can login after admin changes their role"

# Test only RLS policies
npm test -- role-change.integration.test.ts -t "RLS policies work with new subquery pattern"

# Test only performance
npm test -- role-change.integration.test.ts -t "Performance: RLS subquery pattern"
```

### Run with Verbose Output

```bash
npm test -- role-change.integration.test.ts --verbose
```

## Test Behavior

### Automatic Skipping

If environment variables are not set, tests will be automatically skipped with a message:

```
SKIP Role Change Integration Tests
  ○ skipped 22 tests
```

This prevents test failures in CI/CD environments where Supabase credentials are not available.

### Test Isolation

Each test:
1. Creates its own test data
2. Performs assertions
3. Cleans up test data
4. Does not affect other tests

### Cleanup

The `afterAll` hook ensures:
- All test users are deleted
- All test data is removed
- No orphaned records remain

## Expected Results

### Successful Run

```
PASS  src/__tests__/integration/role-change.integration.test.ts
  Role Change Integration Tests
    Requirement 1.1: User can login after admin changes their role
      ✓ should allow user to login after role change from member to admin (1234ms)
      ✓ should allow user to login after role change from admin to member (987ms)
      ✓ should not have JWT claims for user_role after login (456ms)
    Requirement 4.1, 4.2: RLS policies work with new subquery pattern
      Users table RLS policies
        ✓ should allow member to read only their own profile (123ms)
        ✓ should prevent member from reading other users profiles (98ms)
        ✓ should allow admin to read all users (145ms)
        ... (more tests)

Test Suites: 1 passed, 1 total
Tests:       22 passed, 22 total
Time:        15.234 s
```

### Common Failures

#### 1. Environment Variables Not Set

```
SKIP Role Change Integration Tests
```

**Solution:** Set required environment variables in `.env.test`

#### 2. RLS Policy Errors

```
Error: permission denied for table users
```

**Solution:** Verify RLS policies are updated with subquery pattern

#### 3. JWT Claims Still Present

```
Expected: undefined
Received: "member"
```

**Solution:** Ensure custom JWT hook is removed from Supabase project

#### 4. Timeout Errors

```
Timeout - Async callback was not invoked within the 5000 ms timeout
```

**Solution:** 
- Check network connection to Supabase
- Increase Jest timeout in test file
- Verify Supabase project is not paused

## Troubleshooting

### Check Supabase Connection

```bash
# Test connection with curl
curl https://your-project.supabase.co/rest/v1/ \
  -H "apikey: your-anon-key"
```

### Verify RLS Policies

```sql
-- Check if policies use subquery pattern
SELECT 
  schemaname,
  tablename,
  policyname,
  pg_get_expr(qual, (schemaname || '.' || tablename)::regclass) as policy_definition
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('users', 'products', 'transactions', 'warranty_claims');
```

### Check for JWT Hook

```sql
-- Verify custom JWT hook is removed
SELECT * FROM pg_proc 
WHERE proname = 'custom_access_token_hook';
-- Should return 0 rows
```

### Manual Test User Creation

```sql
-- Create a test user manually
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'manual-test@example.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now()
);
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Integration Tests

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
      
      - name: Run integration tests
        env:
          VITE_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.TEST_SUPABASE_ANON_KEY }}
          TEST_SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.TEST_SERVICE_ROLE_KEY }}
        run: npm test -- role-change.integration.test.ts
```

### Skip in CI (Alternative)

If you don't want to run integration tests in CI:

```yaml
- name: Run unit tests only
  run: npm test -- --testPathIgnorePatterns=integration
```

## Performance Benchmarks

Expected performance metrics:

| Operation | Expected Time | Acceptable Range |
|-----------|--------------|------------------|
| User login | < 500ms | 200ms - 1000ms |
| Role query | < 50ms | 10ms - 100ms |
| RLS check | < 10ms | 1ms - 50ms |
| Full test suite | < 30s | 15s - 60s |

## Next Steps

After successful integration tests:

1. ✅ Verify all 22 tests pass
2. ✅ Check performance metrics are within acceptable range
3. ✅ Review any warnings or deprecation notices
4. ✅ Document any test failures or issues
5. ✅ Proceed to E2E tests (Task 6.4)

## Related Documentation

- [Design Document](./design.md) - Architecture and implementation details
- [Requirements](./requirements.md) - Feature requirements and acceptance criteria
- [Phase 1 Completion](./phase1-completion-summary.md) - Database migration results
- [RLS Policies Verification](./rls-policies-verification.md) - Policy update details

## Support

If you encounter issues:

1. Check this guide's troubleshooting section
2. Review test output for specific error messages
3. Verify environment variables are correctly set
4. Check Supabase project logs
5. Consult the design document for expected behavior
