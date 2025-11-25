# Integration Tests Quick Reference

## 🚀 Quick Start

```bash
# Set environment variables
export VITE_SUPABASE_URL=https://your-project.supabase.co
export VITE_SUPABASE_ANON_KEY=your-anon-key
export TEST_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Run tests
npm test -- role-change.integration.test.ts
```

## 📊 Test Coverage

| Category | Tests | Status |
|----------|-------|--------|
| Login after role change | 3 | ✅ |
| Users table RLS | 6 | ✅ |
| Products table RLS | 5 | ✅ |
| Transactions table RLS | 3 | ✅ |
| Warranty claims table RLS | 4 | ✅ |
| Performance | 2 | ✅ |
| **Total** | **22** | **✅** |

## 🎯 Key Test Scenarios

### 1. Role Change Login
```typescript
// User can login after role change
member → admin → login ✅
admin → member → login ✅
JWT has no user_role claim ✅
```

### 2. RLS Policies
```typescript
// Member access
member.read(own_profile) ✅
member.read(other_profile) ❌
member.update(own_role) ❌

// Admin access
admin.read(all_users) ✅
admin.update(any_role) ✅
```

### 3. Performance
```typescript
// Query efficiency
10 role queries < 100ms avg ✅
Index used for subqueries ✅
```

## 🔧 Common Commands

```bash
# Run all integration tests
npm test -- role-change.integration.test.ts

# Run specific test
npm test -- role-change.integration.test.ts -t "login after role change"

# Run with verbose output
npm test -- role-change.integration.test.ts --verbose

# Run all integration tests (including others)
npm test -- integration/
```

## 📝 Environment Setup

### Option 1: .env.test file
```bash
# Create .env.test
cat > .env.test << EOF
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
TEST_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
EOF

# Load and run
source .env.test && npm test -- role-change.integration.test.ts
```

### Option 2: Inline
```bash
VITE_SUPABASE_URL=https://... \
VITE_SUPABASE_ANON_KEY=... \
TEST_SUPABASE_SERVICE_ROLE_KEY=... \
npm test -- role-change.integration.test.ts
```

## ⚠️ Troubleshooting

### Tests Skipped
```
Tests: 22 skipped
```
**Fix:** Set environment variables

### Permission Denied
```
Error: permission denied for table users
```
**Fix:** Verify RLS policies updated with subquery pattern

### JWT Claims Present
```
Expected: undefined, Received: "member"
```
**Fix:** Remove custom JWT hook from Supabase

### Timeout
```
Timeout - Async callback was not invoked
```
**Fix:** Check Supabase connection, increase timeout

## 📚 Documentation

- **Full Guide:** `.kiro/specs/supabase-native-auth/integration-tests-guide.md`
- **Test File:** `src/__tests__/integration/role-change.integration.test.ts`
- **Completion Summary:** `.kiro/specs/supabase-native-auth/task-6.3-completion-summary.md`

## ✅ Verification Checklist

- [ ] Environment variables set
- [ ] Supabase project accessible
- [ ] RLS policies updated (no JWT claims)
- [ ] Custom JWT hook removed
- [ ] Tests run successfully
- [ ] All 22 tests pass
- [ ] Performance within limits

## 🎓 Test Structure

```
Role Change Integration Tests
├── Requirement 1.1: Login after role change
│   ├── member → admin
│   ├── admin → member
│   └── No JWT claims
├── Requirement 4.1, 4.2: RLS policies
│   ├── Users table (6 tests)
│   ├── Products table (5 tests)
│   ├── Transactions table (3 tests)
│   └── Warranty claims table (4 tests)
└── Performance
    ├── Query efficiency
    └── Index usage
```

## 🔗 Related Tasks

- ✅ Task 6.1: Unit tests for auth service
- ✅ Task 6.2: Unit tests for Auth Context
- ✅ **Task 6.3: Integration tests** (CURRENT)
- ⏭️ Task 6.4: E2E tests

## 💡 Tips

1. **Use test project:** Don't run against production
2. **Check logs:** Review Supabase logs for errors
3. **Run selectively:** Use `-t` flag for specific tests
4. **Monitor performance:** Check if queries are slow
5. **Clean data:** Tests cleanup automatically

## 🚨 Important Notes

- Tests require real Supabase connection
- Service role key needed for admin operations
- Tests create and delete temporary users
- Full suite takes 15-30 seconds
- Tests skip gracefully if credentials missing
