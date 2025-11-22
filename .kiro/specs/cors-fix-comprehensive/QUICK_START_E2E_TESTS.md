# Quick Start: E2E Tests

## 🚀 Quick Setup (5 minutes)

### 1. Install Playwright
```bash
npm install -D @playwright/test
npx playwright install
```

### 2. Configure Test Environment
```bash
# Copy template
cp .env.test .env.test.local

# Edit with your credentials
# TEST_USER_EMAIL=member1@canvango.com
# TEST_USER_PASSWORD=your-password
```

### 3. Run Tests
```bash
npm run test:e2e
```

## 📋 Common Commands

### Run All Tests
```bash
npm run test:e2e
```

### Run in UI Mode (Recommended for Development)
```bash
npm run test:e2e:ui
```

### Run with Visible Browser
```bash
npm run test:e2e:headed
```

### Run Specific Test
```bash
npx playwright test -g "claim-garansi"
```

### View Test Report
```bash
npm run test:e2e:report
```

## ✅ What Gets Tested

### 1. All Pages Load (6 pages)
- Dashboard
- BM Accounts
- Personal Accounts
- Claim Garansi
- Transactions
- Top-up

### 2. No Backend API Calls
- Zero requests to `/api`
- All requests go to Supabase

### 3. Warranty Claim Flow
- Form filling
- Validation
- Submission
- Success verification

## 🎯 Expected Results

```
✓ All pages load without errors (7 tests)
✓ No requests to /api endpoint (7 tests)
✓ Warranty claim submission flow (6 tests)
✓ CORS fix verification summary (1 test)

21 passed (45s)
```

## 🔧 Troubleshooting

### Tests Fail with "Login Failed"
→ Check credentials in `.env.test.local`

### Tests Timeout
→ Increase timeout in `playwright.config.ts`

### No Eligible Accounts
→ Create test data in Supabase (see E2E_TESTS_GUIDE.md)

## 📚 Full Documentation

See `E2E_TESTS_GUIDE.md` for:
- Detailed setup instructions
- Test structure explanation
- Debugging tips
- CI/CD integration
- Troubleshooting guide

## 🎉 Success Criteria

All tests pass = CORS fix is working correctly!

- ✅ No CORS errors
- ✅ No backend API calls
- ✅ All functionality works
- ✅ Direct Supabase access
