# E2E Tests Guide - CORS Fix Verification

## Overview

This guide explains the E2E tests created to verify that the CORS fix is working correctly. The tests ensure:

1. ✅ All pages load without errors
2. ✅ No requests go to `/api` endpoint
3. ✅ All data requests go directly to Supabase
4. ✅ Warranty claim submission works end-to-end

## Test Files

### Main Test File
- **Location**: `src/__tests__/e2e/cors-fix-verification.e2e.test.ts`
- **Framework**: Playwright
- **Requirements**: 8.1, 8.2, 8.3

### Configuration Files
- **Playwright Config**: `playwright.config.ts`
- **Test Environment**: `.env.test`

## Setup Instructions

### 1. Install Playwright

```bash
npm install -D @playwright/test
npx playwright install
```

### 2. Configure Test Environment

Copy `.env.test` and update with your test credentials:

```bash
# .env.test
TEST_APP_URL=http://localhost:5173
TEST_USER_EMAIL=member1@canvango.com
TEST_USER_PASSWORD=your-test-password
VITE_SUPABASE_URL=https://gpittnsfzgkdbqnccncn.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Create Test User

Ensure you have a test user in Supabase:

```sql
-- Create test user (if not exists)
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES ('member1@canvango.com', crypt('your-test-password', gen_salt('bf')), NOW());

-- Create user profile
INSERT INTO user_profiles (id, email, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'member1@canvango.com'),
  'member1@canvango.com',
  'member'
);
```

## Running Tests

### Run All E2E Tests

```bash
npx playwright test
```

### Run Specific Test File

```bash
npx playwright test cors-fix-verification
```

### Run Specific Test Suite

```bash
# Test all pages load
npx playwright test -g "Test All Pages Load Without Errors"

# Test no /api requests
npx playwright test -g "Test No Requests to /api Endpoint"

# Test warranty claim flow
npx playwright test -g "Test Warranty Claim Submission Flow"
```

### Run in UI Mode (Interactive)

```bash
npx playwright test --ui
```

### Run in Debug Mode

```bash
npx playwright test --debug
```

### Run in Headed Mode (See Browser)

```bash
npx playwright test --headed
```

### Run on Specific Browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Test Structure

### Task 12.1: Test All Pages Load Without Errors

Tests that verify each page loads successfully without CORS errors:

```typescript
test('dashboard page loads without errors', async ({ page }) => {
  const monitor = setupNetworkMonitor(page);
  await loginAsMember(page);
  await page.goto(`${BASE_URL}/dashboard`);
  await page.waitForLoadState('networkidle');
  
  // Verify no CORS errors
  expect(monitor.corsErrors).toHaveLength(0);
  
  // Verify page loaded successfully
  await expect(page.locator('h1, h2')).toBeVisible();
});
```

**Pages Tested:**
- ✅ `/dashboard`
- ✅ `/bm-accounts`
- ✅ `/personal-accounts`
- ✅ `/claim-garansi` (main CORS issue page)
- ✅ `/transactions`
- ✅ `/top-up`

### Task 12.2: Test No Requests to /api Endpoint

Tests that verify NO requests go to backend Express API:

```typescript
test('claim-garansi makes no /api requests', async ({ page }) => {
  const monitor = setupNetworkMonitor(page);
  await loginAsMember(page);
  await page.goto(`${BASE_URL}/claim-garansi`);
  await page.waitForLoadState('networkidle');
  
  // CRITICAL: Verify NO requests to /api endpoint
  expect(monitor.apiRequests).toHaveLength(0);
  
  // Verify requests go to Supabase instead
  expect(monitor.supabaseRequests.length).toBeGreaterThan(0);
});
```

**Verification:**
- ✅ Zero requests to `/api/*`
- ✅ All data requests go to `supabase.co`
- ✅ Uses Supabase REST API (`/rest/v1/`)

### Task 12.3: Test Warranty Claim Submission Flow

Tests the complete warranty claim submission flow:

```typescript
test('submits warranty claim successfully', async ({ page }) => {
  const monitor = setupNetworkMonitor(page);
  await loginAsMember(page);
  await page.goto(`${BASE_URL}/claim-garansi`);
  
  // Fill form
  await page.selectOption('select[name="accountId"]', { index: 1 });
  await page.selectOption('select[name="reason"]', 'account_suspended');
  await page.fill('textarea[name="description"]', 'E2E test claim');
  
  // Submit
  await page.click('button[type="submit"]');
  
  // Verify NO /api requests
  expect(monitor.apiRequests).toHaveLength(0);
  
  // Verify Supabase insert request
  const supabaseInserts = monitor.supabaseRequests.filter(url => 
    url.includes('warranty_claims')
  );
  expect(supabaseInserts.length).toBeGreaterThan(0);
  
  // Verify success
  await expect(page.locator('text=/success|berhasil/i')).toBeVisible();
});
```

**Flow Tested:**
1. ✅ View warranty claim form
2. ✅ Fill form with valid data
3. ✅ Submit claim
4. ✅ Verify success message
5. ✅ Verify claim appears in list
6. ✅ Verify all requests go to Supabase (not backend)

## Network Monitoring

The tests use a custom network monitor to track all requests:

```typescript
interface NetworkMonitor {
  apiRequests: string[];        // Requests to /api/* (should be 0)
  supabaseRequests: string[];   // Requests to Supabase (should be > 0)
  corsErrors: string[];         // CORS errors (should be 0)
  allRequests: string[];        // All requests for debugging
}
```

### How It Works

```typescript
function setupNetworkMonitor(page: Page): NetworkMonitor {
  const monitor = { /* ... */ };
  
  // Monitor all requests
  page.on('request', (request) => {
    const url = request.url();
    
    // Track /api requests (should be ZERO)
    if (url.includes('/api/')) {
      monitor.apiRequests.push(url);
    }
    
    // Track Supabase requests (should be ALL data requests)
    if (url.includes('supabase.co')) {
      monitor.supabaseRequests.push(url);
    }
  });
  
  // Monitor console for CORS errors
  page.on('console', (msg) => {
    if (msg.text().includes('cors')) {
      monitor.corsErrors.push(msg.text());
    }
  });
  
  return monitor;
}
```

## Expected Results

### ✅ Success Criteria

All tests should pass with:

```
=== CORS Fix Verification Summary ===
Pages loaded successfully: 6/6
CORS errors: 0 (should be 0)
/api requests: 0 (should be 0)
Supabase requests: 15+ (should be > 0)
Page load errors: 0 (should be 0)
=====================================
```

### ❌ Failure Scenarios

If tests fail, check:

1. **CORS errors > 0**
   - Some service still using backend Express
   - Check `monitor.corsErrors` for details
   - Review service files for `apiClient` usage

2. **/api requests > 0**
   - Backend Express not fully removed
   - Check `monitor.apiRequests` for URLs
   - Review service files for API calls

3. **Supabase requests = 0**
   - Supabase client not configured
   - Check `.env` for `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
   - Check `src/config/supabase.ts`

4. **Page load errors > 0**
   - JavaScript errors on page
   - Check browser console
   - Review component code

## Debugging

### View Test Report

```bash
npx playwright show-report
```

### View Traces

```bash
npx playwright show-trace test-results/trace.zip
```

### Enable Verbose Logging

```bash
DEBUG=pw:api npx playwright test
```

### Take Screenshots

Screenshots are automatically taken on failure and saved to:
```
test-results/
  cors-fix-verification-e2e-test-ts-<test-name>/
    test-failed-1.png
```

### View Videos

Videos are recorded on failure and saved to:
```
test-results/
  cors-fix-verification-e2e-test-ts-<test-name>/
    video.webm
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npx playwright test
        env:
          TEST_APP_URL: ${{ secrets.TEST_APP_URL }}
          TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
          TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

## Best Practices

### 1. Use Network Monitor

Always use the network monitor to verify:
- No `/api` requests
- All requests go to Supabase
- No CORS errors

### 2. Wait for Network Idle

```typescript
await page.waitForLoadState('networkidle');
```

This ensures all async requests complete before assertions.

### 3. Handle Dynamic Content

```typescript
// Wait for data to load
await page.waitForTimeout(2000);

// Or wait for specific element
await page.waitForSelector('table tbody tr');
```

### 4. Test Both Success and Error Cases

```typescript
// Success case
test('submits claim successfully', async ({ page }) => {
  // ... fill and submit form
  await expect(page.locator('text=/success/i')).toBeVisible();
});

// Error case
test('shows validation errors', async ({ page }) => {
  // ... submit empty form
  await expect(page.locator('text=/required/i')).toBeVisible();
});
```

### 5. Clean Up Test Data

```typescript
test.afterEach(async () => {
  // Clean up test claims
  await supabase
    .from('warranty_claims')
    .delete()
    .eq('description', 'E2E test claim');
});
```

## Troubleshooting

### Issue: Tests timeout

**Solution**: Increase timeout in `playwright.config.ts`:

```typescript
use: {
  actionTimeout: 30000,
  navigationTimeout: 60000,
}
```

### Issue: Login fails

**Solution**: Check test credentials in `.env.test`:

```bash
TEST_USER_EMAIL=member1@canvango.com
TEST_USER_PASSWORD=correct-password
```

### Issue: No eligible accounts for claim test

**Solution**: Create test data in Supabase:

```sql
-- Create test purchase with warranty
INSERT INTO purchases (user_id, product_id, status, warranty_expires_at)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'member1@canvango.com'),
  (SELECT id FROM products LIMIT 1),
  'completed',
  NOW() + INTERVAL '30 days'
);
```

### Issue: Supabase requests = 0

**Solution**: Check Supabase configuration:

```typescript
// src/config/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

## Summary

These E2E tests provide comprehensive verification that:

1. ✅ **CORS issue is fixed** - No CORS errors on any page
2. ✅ **Backend Express removed** - Zero requests to `/api`
3. ✅ **Direct Supabase access** - All data requests go to Supabase
4. ✅ **Functionality works** - Warranty claims can be submitted successfully

The tests cover all critical user flows and ensure the application works correctly without the backend Express server.

## Next Steps

After all tests pass:

1. ✅ Mark Task 12 as complete
2. ✅ Proceed to Task 13: Update Documentation
3. ✅ Proceed to Task 14: Deploy and Verify

## References

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Supabase Documentation](https://supabase.com/docs)
- [CORS Fix Design Document](./design.md)
- [CORS Fix Requirements](./requirements.md)
