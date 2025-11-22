# Quick Test Guide: Network Monitoring (Task 12.2)

## Quick Start

### 1. Setup (One-time)
```bash
# Install Playwright browsers
npx playwright install chromium

# Start dev server in separate terminal
npm run dev
```

### 2. Run Tests
```bash
# Run Task 12.2 tests only
npx playwright test cors-fix-verification --grep "Task 12.2"
```

## What These Tests Verify

✅ **Zero requests to `/api` endpoint** - No backend Express calls
✅ **All requests go to Supabase** - Direct Supabase access only
✅ **No CORS errors** - Problem eliminated

## Test Coverage

| Page | Test |
|------|------|
| Dashboard | ✅ No /api requests |
| BM Accounts | ✅ No /api requests |
| Personal Accounts | ✅ No /api requests |
| Claim Garansi | ✅ No /api requests (was problematic) |
| Transactions | ✅ No /api requests |
| Top-up | ✅ No /api requests |
| **All Pages** | ✅ Aggregate verification |

## Expected Output

```
Running 7 tests using 1 worker

✓ Task 12.2: Test No Requests to /api Endpoint › dashboard makes no /api requests
✓ Task 12.2: Test No Requests to /api Endpoint › bm-accounts makes no /api requests
✓ Task 12.2: Test No Requests to /api Endpoint › claim-garansi makes no /api requests
✓ Task 12.2: Test No Requests to /api Endpoint › transactions makes no /api requests
✓ Task 12.2: Test No Requests to /api Endpoint › top-up makes no /api requests
✓ Task 12.2: Test No Requests to /api Endpoint › all requests go to Supabase, none to /api
✓ Task 12.2: Test No Requests to /api Endpoint › verify all data requests use Supabase REST API

Total requests: 150
Supabase requests: 45
API requests: 0 (should be 0) ✅

7 passed (30s)
```

## Useful Commands

```bash
# Run with browser visible
npx playwright test cors-fix-verification --grep "Task 12.2" --headed

# Run with UI mode (interactive)
npx playwright test cors-fix-verification --grep "Task 12.2" --ui

# Debug mode (step through)
npx playwright test cors-fix-verification --grep "Task 12.2" --debug

# Generate HTML report
npx playwright test cors-fix-verification --grep "Task 12.2" --reporter=html
npx playwright show-report
```

## Troubleshooting

### Tests fail: "Cannot find package '@playwright/test'"
```bash
npm install
npx playwright install chromium
```

### Tests fail: "page.goto: net::ERR_CONNECTION_REFUSED"
```bash
# Start dev server first
npm run dev
```

### Tests fail: "Timeout waiting for page"
- Check if dev server is running on port 5173
- Verify `.env.test` has correct `TEST_APP_URL`
- Increase timeout if needed

### Tests pass but want to verify manually
1. Open browser DevTools (F12)
2. Go to Network tab
3. Navigate to http://localhost:5173/claim-garansi
4. Filter by "api" - should see ZERO results
5. Filter by "supabase" - should see multiple requests

## Configuration

Edit `.env.test` if needed:
```bash
TEST_APP_URL=http://localhost:5173
TEST_USER_EMAIL=member1@canvango.com
TEST_USER_PASSWORD=your-password
VITE_SUPABASE_URL=https://gpittnsfzgkdbqnccncn.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Success Criteria

✅ All 7 tests pass
✅ Console shows "API requests: 0"
✅ Console shows "Supabase requests: > 0"
✅ No CORS errors in output

## Next Steps

After Task 12.2 passes:
- ✅ Task 12.3: Test warranty claim submission flow
- ✅ Task 14: Deploy and verify in production
