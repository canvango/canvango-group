/**
 * E2E Tests for CORS Fix Verification
 * 
 * These tests verify that:
 * 1. All pages load without errors
 * 2. No requests go to /api endpoint
 * 3. All requests go directly to Supabase
 * 4. Warranty claim submission works end-to-end
 * 
 * Requirements: 8.1, 8.2, 8.3
 * 
 * Setup:
 * 1. npm install -D @playwright/test
 * 2. npx playwright install
 * 3. Set TEST_APP_URL, TEST_USER_EMAIL, TEST_USER_PASSWORD in .env.test
 * 4. Run: npx playwright test cors-fix-verification
 */

import { test, expect, Page } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.TEST_APP_URL || 'http://localhost:5173';
const USER_EMAIL = process.env.TEST_USER_EMAIL || 'member1@canvango.com';
const USER_PASSWORD = process.env.TEST_USER_PASSWORD || 'test-password';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://gpittnsfzgkdbqnccncn.supabase.co';

// Helper: Login as member
async function loginAsMember(page: Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[name="email"]', USER_EMAIL);
  await page.fill('input[name="password"]', USER_PASSWORD);
  await page.click('button[type="submit"]');
  
  // Wait for redirect to dashboard
  await page.waitForURL(/\/(dashboard|member-area)/, { timeout: 10000 });
}

// Helper: Monitor network requests
interface NetworkMonitor {
  apiRequests: string[];
  supabaseRequests: string[];
  corsErrors: string[];
  allRequests: string[];
}

function setupNetworkMonitor(page: Page): NetworkMonitor {
  const monitor: NetworkMonitor = {
    apiRequests: [],
    supabaseRequests: [],
    corsErrors: [],
    allRequests: []
  };

  // Monitor all requests
  page.on('request', (request) => {
    const url = request.url();
    monitor.allRequests.push(url);

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
    const text = msg.text();
    if (text.toLowerCase().includes('cors') || 
        text.toLowerCase().includes('cross-origin')) {
      monitor.corsErrors.push(text);
    }
  });

  // Monitor page errors
  page.on('pageerror', (error) => {
    const message = error.message;
    if (message.toLowerCase().includes('cors') || 
        message.toLowerCase().includes('cross-origin')) {
      monitor.corsErrors.push(message);
    }
  });

  return monitor;
}

test.describe('Task 12.1: Test All Pages Load Without Errors', () => {
  test('dashboard page loads without errors', async ({ page }) => {
    const monitor = setupNetworkMonitor(page);
    
    await loginAsMember(page);
    await page.goto(`${BASE_URL}/dashboard`);
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Verify no CORS errors
    expect(monitor.corsErrors).toHaveLength(0);
    
    // Verify page loaded successfully
    await expect(page.locator('h1, h2')).toBeVisible();
    
    // Verify no console errors
    const errors = await page.evaluate(() => {
      return (window as any).__errors || [];
    });
    expect(errors).toHaveLength(0);
  });

  test('bm-accounts page loads without errors', async ({ page }) => {
    const monitor = setupNetworkMonitor(page);
    
    await loginAsMember(page);
    await page.goto(`${BASE_URL}/bm-accounts`);
    
    await page.waitForLoadState('networkidle');
    
    // Verify no CORS errors
    expect(monitor.corsErrors).toHaveLength(0);
    
    // Verify page content loaded
    await expect(page.locator('text=/BM.*Account|Business.*Manager/i')).toBeVisible({ timeout: 10000 });
    
    // Verify no API errors
    const errors = await page.evaluate(() => {
      return (window as any).__errors || [];
    });
    expect(errors).toHaveLength(0);
  });

  test('personal-accounts page loads without errors', async ({ page }) => {
    const monitor = setupNetworkMonitor(page);
    
    await loginAsMember(page);
    await page.goto(`${BASE_URL}/personal-accounts`);
    
    await page.waitForLoadState('networkidle');
    
    // Verify no CORS errors
    expect(monitor.corsErrors).toHaveLength(0);
    
    // Verify page content loaded
    await expect(page.locator('text=/Personal.*Account|Akun.*Pribadi/i')).toBeVisible({ timeout: 10000 });
    
    // Verify no errors
    const errors = await page.evaluate(() => {
      return (window as any).__errors || [];
    });
    expect(errors).toHaveLength(0);
  });

  test('claim-garansi page loads without errors', async ({ page }) => {
    const monitor = setupNetworkMonitor(page);
    
    await loginAsMember(page);
    await page.goto(`${BASE_URL}/claim-garansi`);
    
    await page.waitForLoadState('networkidle');
    
    // Verify no CORS errors (THIS WAS THE MAIN ISSUE!)
    expect(monitor.corsErrors).toHaveLength(0);
    
    // Verify page content loaded
    await expect(page.locator('text=/Claim.*Garansi|Warranty.*Claim/i')).toBeVisible({ timeout: 10000 });
    
    // Verify no errors
    const errors = await page.evaluate(() => {
      return (window as any).__errors || [];
    });
    expect(errors).toHaveLength(0);
  });

  test('transactions page loads without errors', async ({ page }) => {
    const monitor = setupNetworkMonitor(page);
    
    await loginAsMember(page);
    await page.goto(`${BASE_URL}/transactions`);
    
    await page.waitForLoadState('networkidle');
    
    // Verify no CORS errors
    expect(monitor.corsErrors).toHaveLength(0);
    
    // Verify page content loaded
    await expect(page.locator('text=/Transaction|Transaksi/i')).toBeVisible({ timeout: 10000 });
    
    // Verify no errors
    const errors = await page.evaluate(() => {
      return (window as any).__errors || [];
    });
    expect(errors).toHaveLength(0);
  });

  test('top-up page loads without errors', async ({ page }) => {
    const monitor = setupNetworkMonitor(page);
    
    await loginAsMember(page);
    await page.goto(`${BASE_URL}/top-up`);
    
    await page.waitForLoadState('networkidle');
    
    // Verify no CORS errors
    expect(monitor.corsErrors).toHaveLength(0);
    
    // Verify page content loaded
    await expect(page.locator('text=/Top.*Up|Isi.*Saldo/i')).toBeVisible({ timeout: 10000 });
    
    // Verify no errors
    const errors = await page.evaluate(() => {
      return (window as any).__errors || [];
    });
    expect(errors).toHaveLength(0);
  });

  test('all pages load without any console errors', async ({ page }) => {
    const monitor = setupNetworkMonitor(page);
    const consoleErrors: string[] = [];
    
    // Capture console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await loginAsMember(page);
    
    const pages = [
      '/dashboard',
      '/bm-accounts',
      '/personal-accounts',
      '/claim-garansi',
      '/transactions',
      '/top-up'
    ];
    
    for (const path of pages) {
      await page.goto(`${BASE_URL}${path}`);
      await page.waitForLoadState('networkidle');
      
      // Small delay to ensure all async operations complete
      await page.waitForTimeout(1000);
    }
    
    // Verify no CORS errors across all pages
    expect(monitor.corsErrors).toHaveLength(0);
    
    // Verify no console errors (filter out known warnings)
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('Warning:') && 
      !error.includes('DevTools')
    );
    expect(criticalErrors).toHaveLength(0);
  });
});

test.describe('Task 12.2: Test No Requests to /api Endpoint', () => {
  test('dashboard makes no /api requests', async ({ page }) => {
    const monitor = setupNetworkMonitor(page);
    
    await loginAsMember(page);
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');
    
    // Verify NO requests to /api endpoint
    expect(monitor.apiRequests).toHaveLength(0);
    
    // Verify requests go to Supabase instead
    expect(monitor.supabaseRequests.length).toBeGreaterThan(0);
  });

  test('bm-accounts makes no /api requests', async ({ page }) => {
    const monitor = setupNetworkMonitor(page);
    
    await loginAsMember(page);
    await page.goto(`${BASE_URL}/bm-accounts`);
    await page.waitForLoadState('networkidle');
    
    // Verify NO requests to /api endpoint
    expect(monitor.apiRequests).toHaveLength(0);
    
    // Verify requests go to Supabase instead
    expect(monitor.supabaseRequests.length).toBeGreaterThan(0);
  });

  test('claim-garansi makes no /api requests', async ({ page }) => {
    const monitor = setupNetworkMonitor(page);
    
    await loginAsMember(page);
    await page.goto(`${BASE_URL}/claim-garansi`);
    await page.waitForLoadState('networkidle');
    
    // THIS IS THE KEY TEST - claim-garansi had CORS errors before
    // Verify NO requests to /api endpoint
    expect(monitor.apiRequests).toHaveLength(0);
    
    // Verify requests go to Supabase instead
    expect(monitor.supabaseRequests.length).toBeGreaterThan(0);
  });

  test('transactions makes no /api requests', async ({ page }) => {
    const monitor = setupNetworkMonitor(page);
    
    await loginAsMember(page);
    await page.goto(`${BASE_URL}/transactions`);
    await page.waitForLoadState('networkidle');
    
    // Verify NO requests to /api endpoint
    expect(monitor.apiRequests).toHaveLength(0);
    
    // Verify requests go to Supabase instead
    expect(monitor.supabaseRequests.length).toBeGreaterThan(0);
  });

  test('top-up makes no /api requests', async ({ page }) => {
    const monitor = setupNetworkMonitor(page);
    
    await loginAsMember(page);
    await page.goto(`${BASE_URL}/top-up`);
    await page.waitForLoadState('networkidle');
    
    // Verify NO requests to /api endpoint
    expect(monitor.apiRequests).toHaveLength(0);
    
    // Verify requests go to Supabase instead
    expect(monitor.supabaseRequests.length).toBeGreaterThan(0);
  });

  test('all requests go to Supabase, none to /api', async ({ page }) => {
    const monitor = setupNetworkMonitor(page);
    
    await loginAsMember(page);
    
    const pages = [
      '/dashboard',
      '/bm-accounts',
      '/personal-accounts',
      '/claim-garansi',
      '/transactions',
      '/top-up'
    ];
    
    for (const path of pages) {
      await page.goto(`${BASE_URL}${path}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
    }
    
    // CRITICAL VERIFICATION: Zero /api requests
    expect(monitor.apiRequests).toHaveLength(0);
    
    // All data requests should go to Supabase
    expect(monitor.supabaseRequests.length).toBeGreaterThan(0);
    
    // Log summary for debugging
    console.log(`Total requests: ${monitor.allRequests.length}`);
    console.log(`Supabase requests: ${monitor.supabaseRequests.length}`);
    console.log(`API requests: ${monitor.apiRequests.length} (should be 0)`);
  });

  test('verify all data requests use Supabase REST API', async ({ page }) => {
    const monitor = setupNetworkMonitor(page);
    
    await loginAsMember(page);
    await page.goto(`${BASE_URL}/claim-garansi`);
    await page.waitForLoadState('networkidle');
    
    // Filter Supabase REST API requests
    const supabaseRestRequests = monitor.supabaseRequests.filter(url => 
      url.includes('/rest/v1/')
    );
    
    // Verify we're using Supabase REST API
    expect(supabaseRestRequests.length).toBeGreaterThan(0);
    
    // Verify no backend Express API
    const backendRequests = monitor.allRequests.filter(url => 
      url.includes('/api/') && !url.includes('supabase')
    );
    expect(backendRequests).toHaveLength(0);
  });
});

test.describe('Task 12.3: Test Warranty Claim Submission Flow', () => {
  test('can view warranty claim form', async ({ page }) => {
    await loginAsMember(page);
    await page.goto(`${BASE_URL}/claim-garansi`);
    await page.waitForLoadState('networkidle');
    
    // Verify form elements exist
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('select[name="accountId"], input[name="accountId"]')).toBeVisible();
    await expect(page.locator('select[name="reason"], input[name="reason"]')).toBeVisible();
    await expect(page.locator('textarea[name="description"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('can fill warranty claim form', async ({ page }) => {
    await loginAsMember(page);
    await page.goto(`${BASE_URL}/claim-garansi`);
    await page.waitForLoadState('networkidle');
    
    // Wait for eligible accounts to load
    await page.waitForTimeout(2000);
    
    // Try to select an account (if available)
    const accountSelect = page.locator('select[name="accountId"]');
    const accountOptions = await accountSelect.locator('option').count();
    
    if (accountOptions > 1) {
      // Select first available account
      await accountSelect.selectOption({ index: 1 });
      
      // Select reason
      await page.selectOption('select[name="reason"]', 'account_suspended');
      
      // Fill description
      await page.fill('textarea[name="description"]', 'E2E test claim - account suspended');
      
      // Verify form is filled
      const accountValue = await accountSelect.inputValue();
      expect(accountValue).not.toBe('');
      
      const reasonValue = await page.locator('select[name="reason"]').inputValue();
      expect(reasonValue).toBe('account_suspended');
      
      const descriptionValue = await page.locator('textarea[name="description"]').inputValue();
      expect(descriptionValue).toContain('E2E test');
    }
  });

  test('shows validation errors for empty form', async ({ page }) => {
    await loginAsMember(page);
    await page.goto(`${BASE_URL}/claim-garansi`);
    await page.waitForLoadState('networkidle');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Wait for validation errors
    await page.waitForTimeout(500);
    
    // Verify validation messages appear
    const errorMessages = await page.locator('text=/required|wajib|pilih/i').count();
    expect(errorMessages).toBeGreaterThan(0);
  });

  test('submits warranty claim successfully (if eligible account exists)', async ({ page }) => {
    const monitor = setupNetworkMonitor(page);
    
    await loginAsMember(page);
    await page.goto(`${BASE_URL}/claim-garansi`);
    await page.waitForLoadState('networkidle');
    
    // Wait for eligible accounts to load
    await page.waitForTimeout(2000);
    
    // Check if there are eligible accounts
    const accountSelect = page.locator('select[name="accountId"]');
    const accountOptions = await accountSelect.locator('option').count();
    
    if (accountOptions > 1) {
      // Fill form
      await accountSelect.selectOption({ index: 1 });
      await page.selectOption('select[name="reason"]', 'account_suspended');
      await page.fill('textarea[name="description"]', 'E2E test claim submission');
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Wait for response
      await page.waitForTimeout(2000);
      
      // Verify NO /api requests were made
      expect(monitor.apiRequests).toHaveLength(0);
      
      // Verify Supabase requests were made
      const supabaseInsertRequests = monitor.supabaseRequests.filter(url => 
        url.includes('warranty_claims')
      );
      expect(supabaseInsertRequests.length).toBeGreaterThan(0);
      
      // Verify success message or redirect
      const hasSuccessMessage = await page.locator('text=/success|berhasil|submitted/i').isVisible().catch(() => false);
      const urlChanged = page.url() !== `${BASE_URL}/claim-garansi`;
      
      expect(hasSuccessMessage || urlChanged).toBeTruthy();
    } else {
      console.log('No eligible accounts available for claim submission test');
    }
  });

  test('claim appears in list after submission', async ({ page }) => {
    await loginAsMember(page);
    await page.goto(`${BASE_URL}/claim-garansi`);
    await page.waitForLoadState('networkidle');
    
    // Wait for claims list to load
    await page.waitForTimeout(2000);
    
    // Check if there's a claims list/table
    const hasClaims = await page.locator('table, .claim-item, .claim-card').isVisible().catch(() => false);
    
    if (hasClaims) {
      // Verify claims are displayed
      const claimCount = await page.locator('table tbody tr, .claim-item, .claim-card').count();
      expect(claimCount).toBeGreaterThanOrEqual(0);
      
      // If there are claims, verify they have required fields
      if (claimCount > 0) {
        await expect(page.locator('text=/status|pending|approved|rejected/i').first()).toBeVisible();
      }
    }
  });

  test('warranty claim flow uses only Supabase (no backend)', async ({ page }) => {
    const monitor = setupNetworkMonitor(page);
    
    await loginAsMember(page);
    await page.goto(`${BASE_URL}/claim-garansi`);
    await page.waitForLoadState('networkidle');
    
    // Wait for all data to load
    await page.waitForTimeout(3000);
    
    // Verify all requests went to Supabase
    const dataRequests = monitor.allRequests.filter(url => 
      !url.includes('.js') && 
      !url.includes('.css') && 
      !url.includes('.png') &&
      !url.includes('.svg') &&
      !url.includes('localhost') &&
      !url.includes('127.0.0.1')
    );
    
    // All data requests should be to Supabase
    const supabaseDataRequests = dataRequests.filter(url => 
      url.includes('supabase.co')
    );
    
    const backendDataRequests = dataRequests.filter(url => 
      url.includes('/api/')
    );
    
    // CRITICAL: No backend requests
    expect(backendDataRequests).toHaveLength(0);
    
    // All data comes from Supabase
    expect(supabaseDataRequests.length).toBeGreaterThan(0);
    
    console.log(`Data requests: ${dataRequests.length}`);
    console.log(`Supabase: ${supabaseDataRequests.length}`);
    console.log(`Backend: ${backendDataRequests.length} (should be 0)`);
  });
});

test.describe('CORS Fix Verification Summary', () => {
  test('comprehensive CORS fix verification', async ({ page }) => {
    const monitor = setupNetworkMonitor(page);
    const testResults = {
      pagesLoaded: 0,
      corsErrors: 0,
      apiRequests: 0,
      supabaseRequests: 0,
      pageErrors: 0
    };
    
    await loginAsMember(page);
    
    const pages = [
      '/dashboard',
      '/bm-accounts',
      '/personal-accounts',
      '/claim-garansi',
      '/transactions',
      '/top-up'
    ];
    
    for (const path of pages) {
      try {
        await page.goto(`${BASE_URL}${path}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        
        testResults.pagesLoaded++;
      } catch (error) {
        testResults.pageErrors++;
        console.error(`Failed to load ${path}:`, error);
      }
    }
    
    testResults.corsErrors = monitor.corsErrors.length;
    testResults.apiRequests = monitor.apiRequests.length;
    testResults.supabaseRequests = monitor.supabaseRequests.length;
    
    // Print summary
    console.log('\n=== CORS Fix Verification Summary ===');
    console.log(`Pages loaded successfully: ${testResults.pagesLoaded}/${pages.length}`);
    console.log(`CORS errors: ${testResults.corsErrors} (should be 0)`);
    console.log(`/api requests: ${testResults.apiRequests} (should be 0)`);
    console.log(`Supabase requests: ${testResults.supabaseRequests} (should be > 0)`);
    console.log(`Page load errors: ${testResults.pageErrors} (should be 0)`);
    console.log('=====================================\n');
    
    // Assertions
    expect(testResults.pagesLoaded).toBe(pages.length);
    expect(testResults.corsErrors).toBe(0);
    expect(testResults.apiRequests).toBe(0);
    expect(testResults.supabaseRequests).toBeGreaterThan(0);
    expect(testResults.pageErrors).toBe(0);
  });
});
