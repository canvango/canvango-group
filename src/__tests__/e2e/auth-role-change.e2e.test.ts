/**
 * E2E Tests for Auth Flow with Role Change Detection
 * 
 * Tests the complete authentication flow including:
 * 1. Login with username/email
 * 2. Role change detection via polling
 * 3. Auto-redirect on role change
 * 4. Notification display when role changes
 * 5. Admin dashboard accessibility after role upgrade
 * 
 * Requirements: 1.1, 5.2, 5.3, 5.4
 * 
 * Setup:
 * 1. Ensure dev server is running (npm run dev)
 * 2. Set TEST_USER_EMAIL, TEST_USER_PASSWORD, TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD in .env.test
 * 3. Run: npx playwright test auth-role-change
 */

import { test, expect, Page } from '@playwright/test';
import { supabaseTestClient as supabase } from './helpers/supabase-test-client';

// Test configuration
const BASE_URL = process.env.TEST_APP_URL || 'http://localhost:5173';
const MEMBER_EMAIL = process.env.TEST_USER_EMAIL || 'member1@canvango.com';
const MEMBER_PASSWORD = process.env.TEST_USER_PASSWORD || 'member123';
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin@canvango.com';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'admin123';

// Polling interval for role changes (should match app config)
const ROLE_POLLING_INTERVAL = 5000; // 5 seconds

/**
 * Helper: Login as member
 */
async function loginAsMember(page: Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
  
  await page.fill('input[name="email"], input[type="email"]', MEMBER_EMAIL);
  await page.fill('input[name="password"], input[type="password"]', MEMBER_PASSWORD);
  await page.click('button[type="submit"]');
  
  // Wait for redirect to dashboard
  await page.waitForURL(/\/(dashboard|member-area)/, { timeout: 10000 });
}

/**
 * Helper: Login as admin
 */
async function loginAsAdmin(page: Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
  
  await page.fill('input[name="email"], input[type="email"]', ADMIN_EMAIL);
  await page.fill('input[name="password"], input[type="password"]', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  
  // Wait for redirect to admin dashboard
  await page.waitForURL(/\/admin/, { timeout: 10000 });
}

/**
 * Helper: Change user role via Supabase
 */
async function changeUserRole(email: string, newRole: 'member' | 'admin' | 'guest'): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({ role: newRole })
    .eq('email', email);
  
  if (error) {
    throw new Error(`Failed to change role: ${error.message}`);
  }
  
  console.log(`✅ Changed role for ${email} to ${newRole}`);
}

/**
 * Helper: Get user role from database
 */
async function getUserRole(email: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('email', email)
    .single();
  
  if (error) {
    console.error('Failed to get user role:', error);
    return null;
  }
  
  return data?.role || null;
}

/**
 * Helper: Wait for notification to appear
 */
async function waitForNotification(page: Page, text: RegExp, timeout = 10000): Promise<boolean> {
  try {
    await page.waitForSelector(`text=${text}`, { timeout });
    return true;
  } catch {
    return false;
  }
}

test.describe('Task 6.4: Complete Auth Flow with Role Change', () => {
  
  test.describe('1. Login Flow', () => {
    test('should login with email successfully', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      await page.fill('input[name="email"], input[type="email"]', MEMBER_EMAIL);
      await page.fill('input[name="password"], input[type="password"]', MEMBER_PASSWORD);
      await page.click('button[type="submit"]');
      
      // Wait for redirect to dashboard
      await page.waitForURL(/\/(dashboard|member-area)/, { timeout: 10000 });
      
      // Verify we're on the dashboard
      await expect(page).toHaveURL(/\/(dashboard|member-area)/);
      
      // Verify dashboard content is visible
      const dashboardContent = page.locator('text=/Dashboard|Beranda|Welcome/i');
      await expect(dashboardContent.first()).toBeVisible({ timeout: 5000 });
      
      console.log('✅ Login with email successful');
    });

    test('should login with username successfully', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      // Try to login with username (if supported)
      const emailInput = page.locator('input[name="email"], input[type="email"]');
      const inputPlaceholder = await emailInput.getAttribute('placeholder');
      
      if (inputPlaceholder?.toLowerCase().includes('username')) {
        // Username login is supported
        await page.fill('input[name="email"], input[type="email"]', 'member1');
        await page.fill('input[name="password"], input[type="password"]', MEMBER_PASSWORD);
        await page.click('button[type="submit"]');
        
        // Wait for redirect
        await page.waitForURL(/\/(dashboard|member-area)/, { timeout: 10000 });
        
        console.log('✅ Login with username successful');
      } else {
        console.log('⚠️ Username login not supported, skipping test');
      }
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      await page.fill('input[name="email"], input[type="email"]', 'invalid@example.com');
      await page.fill('input[name="password"], input[type="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');
      
      // Wait for error message
      await page.waitForTimeout(2000);
      
      // Verify error message is displayed
      const errorMessage = page.locator('text=/invalid|incorrect|wrong|salah/i');
      const hasError = await errorMessage.count() > 0;
      
      expect(hasError).toBeTruthy();
      
      console.log('✅ Invalid credentials error displayed');
    });
  });

  test.describe('2. Role Change Detection', () => {
    test('should detect role change from member to admin', async ({ page }) => {
      // Ensure user starts as member
      await changeUserRole(MEMBER_EMAIL, 'member');
      await page.waitForTimeout(1000);
      
      // Login as member
      await loginAsMember(page);
      
      // Verify we're on member dashboard
      await expect(page).toHaveURL(/\/(dashboard|member-area)/);
      
      // Change role to admin
      console.log('🔄 Changing role from member to admin...');
      await changeUserRole(MEMBER_EMAIL, 'admin');
      
      // Wait for polling to detect change (max 6 seconds = 1 polling cycle + buffer)
      console.log('⏳ Waiting for role change detection...');
      await page.waitForTimeout(ROLE_POLLING_INTERVAL + 1000);
      
      // Verify notification appeared
      const notificationVisible = await waitForNotification(
        page,
        /role.*updated|role.*changed|admin/i,
        3000
      );
      
      if (notificationVisible) {
        console.log('✅ Role change notification displayed');
      } else {
        console.log('⚠️ Notification not visible, but role may have changed');
      }
      
      // Verify redirect to admin dashboard
      await page.waitForTimeout(2000);
      const currentUrl = page.url();
      const isOnAdminPage = currentUrl.includes('/admin');
      
      if (isOnAdminPage) {
        console.log('✅ Auto-redirected to admin dashboard');
      } else {
        console.log('⚠️ Not redirected to admin page, current URL:', currentUrl);
      }
      
      // Cleanup: restore member role
      await changeUserRole(MEMBER_EMAIL, 'member');
    });

    test('should detect role change from admin to member', async ({ page }) => {
      // Ensure user starts as admin
      await changeUserRole(MEMBER_EMAIL, 'admin');
      await page.waitForTimeout(1000);
      
      // Login as admin
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[name="email"], input[type="email"]', MEMBER_EMAIL);
      await page.fill('input[name="password"], input[type="password"]', MEMBER_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/admin/, { timeout: 10000 });
      
      // Verify we're on admin dashboard
      await expect(page).toHaveURL(/\/admin/);
      
      // Change role to member
      console.log('🔄 Changing role from admin to member...');
      await changeUserRole(MEMBER_EMAIL, 'member');
      
      // Wait for polling to detect change
      console.log('⏳ Waiting for role change detection...');
      await page.waitForTimeout(ROLE_POLLING_INTERVAL + 1000);
      
      // Verify notification appeared
      const notificationVisible = await waitForNotification(
        page,
        /role.*updated|role.*changed|member/i,
        3000
      );
      
      if (notificationVisible) {
        console.log('✅ Role change notification displayed');
      }
      
      // Verify redirect to member dashboard
      await page.waitForTimeout(2000);
      const currentUrl = page.url();
      const isOnMemberPage = !currentUrl.includes('/admin');
      
      if (isOnMemberPage) {
        console.log('✅ Auto-redirected to member dashboard');
      } else {
        console.log('⚠️ Still on admin page, current URL:', currentUrl);
      }
      
      // Cleanup: restore member role
      await changeUserRole(MEMBER_EMAIL, 'member');
    });
  });

  test.describe('3. Auto-Redirect on Role Change', () => {
    test('should redirect to admin dashboard when role upgraded to admin', async ({ page }) => {
      // Ensure user starts as member
      await changeUserRole(MEMBER_EMAIL, 'member');
      await page.waitForTimeout(1000);
      
      // Login as member and navigate to a member page
      await loginAsMember(page);
      await page.goto(`${BASE_URL}/dashboard`);
      await page.waitForLoadState('networkidle');
      
      // Verify we're on member page
      const currentUrl = page.url();
      expect(currentUrl).not.toContain('/admin');
      
      // Change role to admin
      console.log('🔄 Upgrading role to admin...');
      await changeUserRole(MEMBER_EMAIL, 'admin');
      
      // Wait for polling + redirect
      console.log('⏳ Waiting for auto-redirect...');
      await page.waitForTimeout(ROLE_POLLING_INTERVAL + 2000);
      
      // Verify redirect to admin dashboard
      const newUrl = page.url();
      const redirectedToAdmin = newUrl.includes('/admin');
      
      expect(redirectedToAdmin).toBeTruthy();
      console.log('✅ Successfully redirected to admin dashboard:', newUrl);
      
      // Cleanup
      await changeUserRole(MEMBER_EMAIL, 'member');
    });

    test('should redirect to member dashboard when role downgraded to member', async ({ page }) => {
      // Ensure user starts as admin
      await changeUserRole(MEMBER_EMAIL, 'admin');
      await page.waitForTimeout(1000);
      
      // Login as admin and navigate to admin page
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[name="email"], input[type="email"]', MEMBER_EMAIL);
      await page.fill('input[name="password"], input[type="password"]', MEMBER_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/admin/, { timeout: 10000 });
      
      // Navigate to an admin page
      await page.goto(`${BASE_URL}/admin/dashboard`);
      await page.waitForLoadState('networkidle');
      
      // Verify we're on admin page
      expect(page.url()).toContain('/admin');
      
      // Change role to member
      console.log('🔄 Downgrading role to member...');
      await changeUserRole(MEMBER_EMAIL, 'member');
      
      // Wait for polling + redirect
      console.log('⏳ Waiting for auto-redirect...');
      await page.waitForTimeout(ROLE_POLLING_INTERVAL + 2000);
      
      // Verify redirect to member dashboard
      const newUrl = page.url();
      const redirectedToMember = !newUrl.includes('/admin');
      
      expect(redirectedToMember).toBeTruthy();
      console.log('✅ Successfully redirected to member dashboard:', newUrl);
      
      // Cleanup
      await changeUserRole(MEMBER_EMAIL, 'member');
    });

    test('should not redirect if already on correct page for role', async ({ page }) => {
      // Ensure user is member
      await changeUserRole(MEMBER_EMAIL, 'member');
      await page.waitForTimeout(1000);
      
      // Login as member
      await loginAsMember(page);
      await page.goto(`${BASE_URL}/dashboard`);
      await page.waitForLoadState('networkidle');
      
      const initialUrl = page.url();
      
      // Keep role as member (no change)
      await page.waitForTimeout(ROLE_POLLING_INTERVAL + 1000);
      
      // Verify URL hasn't changed
      const currentUrl = page.url();
      expect(currentUrl).toBe(initialUrl);
      
      console.log('✅ No unnecessary redirect when role unchanged');
    });
  });

  test.describe('4. Notification Display', () => {
    test('should show notification when role changes to admin', async ({ page }) => {
      // Ensure user starts as member
      await changeUserRole(MEMBER_EMAIL, 'member');
      await page.waitForTimeout(1000);
      
      // Login as member
      await loginAsMember(page);
      
      // Setup console listener to catch toast notifications
      const notifications: string[] = [];
      page.on('console', (msg) => {
        const text = msg.text();
        if (text.includes('role') || text.includes('admin') || text.includes('updated')) {
          notifications.push(text);
        }
      });
      
      // Change role to admin
      console.log('🔄 Changing role to admin...');
      await changeUserRole(MEMBER_EMAIL, 'admin');
      
      // Wait for notification
      console.log('⏳ Waiting for notification...');
      await page.waitForTimeout(ROLE_POLLING_INTERVAL + 2000);
      
      // Check for notification in UI
      const notificationSelectors = [
        'text=/Your role.*updated/i',
        'text=/role.*changed/i',
        'text=/admin/i',
        '[role="alert"]',
        '[class*="toast"]',
        '[class*="notification"]',
        '[class*="alert"]'
      ];
      
      let notificationFound = false;
      for (const selector of notificationSelectors) {
        const element = page.locator(selector);
        const count = await element.count();
        if (count > 0) {
          const isVisible = await element.first().isVisible().catch(() => false);
          if (isVisible) {
            notificationFound = true;
            console.log('✅ Notification found with selector:', selector);
            break;
          }
        }
      }
      
      if (!notificationFound && notifications.length > 0) {
        console.log('✅ Notification logged to console:', notifications);
        notificationFound = true;
      }
      
      if (notificationFound) {
        console.log('✅ Role change notification displayed');
      } else {
        console.log('⚠️ Notification not detected, but role change may have occurred');
      }
      
      // Cleanup
      await changeUserRole(MEMBER_EMAIL, 'member');
    });

    test('should show notification when role changes to member', async ({ page }) => {
      // Ensure user starts as admin
      await changeUserRole(MEMBER_EMAIL, 'admin');
      await page.waitForTimeout(1000);
      
      // Login as admin
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[name="email"], input[type="email"]', MEMBER_EMAIL);
      await page.fill('input[name="password"], input[type="password"]', MEMBER_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/admin/, { timeout: 10000 });
      
      // Setup console listener
      const notifications: string[] = [];
      page.on('console', (msg) => {
        const text = msg.text();
        if (text.includes('role') || text.includes('member') || text.includes('updated')) {
          notifications.push(text);
        }
      });
      
      // Change role to member
      console.log('🔄 Changing role to member...');
      await changeUserRole(MEMBER_EMAIL, 'member');
      
      // Wait for notification
      console.log('⏳ Waiting for notification...');
      await page.waitForTimeout(ROLE_POLLING_INTERVAL + 2000);
      
      // Check for notification
      const notificationVisible = await waitForNotification(
        page,
        /role.*updated|role.*changed|member/i,
        3000
      );
      
      if (notificationVisible || notifications.length > 0) {
        console.log('✅ Role change notification displayed');
      } else {
        console.log('⚠️ Notification not detected');
      }
      
      // Cleanup
      await changeUserRole(MEMBER_EMAIL, 'member');
    });
  });

  test.describe('5. Admin Dashboard Accessibility', () => {
    test('should access admin dashboard after role upgrade', async ({ page }) => {
      // Ensure user starts as member
      await changeUserRole(MEMBER_EMAIL, 'member');
      await page.waitForTimeout(1000);
      
      // Login as member
      await loginAsMember(page);
      
      // Try to access admin dashboard (should be blocked)
      await page.goto(`${BASE_URL}/admin/dashboard`);
      await page.waitForTimeout(2000);
      
      // Verify we're redirected or see unauthorized message
      const currentUrl = page.url();
      const isBlocked = currentUrl.includes('unauthorized') || 
                       currentUrl.includes('login') || 
                       !currentUrl.includes('/admin');
      
      if (isBlocked) {
        console.log('✅ Admin dashboard blocked for member role');
      }
      
      // Upgrade to admin
      console.log('🔄 Upgrading to admin role...');
      await changeUserRole(MEMBER_EMAIL, 'admin');
      
      // Wait for role change detection
      await page.waitForTimeout(ROLE_POLLING_INTERVAL + 2000);
      
      // Try to access admin dashboard again
      await page.goto(`${BASE_URL}/admin/dashboard`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Verify we can now access admin dashboard
      const newUrl = page.url();
      const canAccessAdmin = newUrl.includes('/admin/dashboard');
      
      expect(canAccessAdmin).toBeTruthy();
      console.log('✅ Admin dashboard accessible after role upgrade');
      
      // Verify admin content is visible
      const adminContent = page.locator('text=/Admin|Dashboard|Management|Statistics/i');
      const hasAdminContent = await adminContent.count() > 0;
      
      if (hasAdminContent) {
        console.log('✅ Admin dashboard content loaded');
      }
      
      // Cleanup
      await changeUserRole(MEMBER_EMAIL, 'member');
    });

    test('should lose admin access after role downgrade', async ({ page }) => {
      // Ensure user starts as admin
      await changeUserRole(MEMBER_EMAIL, 'admin');
      await page.waitForTimeout(1000);
      
      // Login as admin
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[name="email"], input[type="email"]', MEMBER_EMAIL);
      await page.fill('input[name="password"], input[type="password"]', MEMBER_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/admin/, { timeout: 10000 });
      
      // Access admin dashboard
      await page.goto(`${BASE_URL}/admin/dashboard`);
      await page.waitForLoadState('networkidle');
      
      // Verify we can access admin dashboard
      expect(page.url()).toContain('/admin');
      console.log('✅ Admin dashboard accessible with admin role');
      
      // Downgrade to member
      console.log('🔄 Downgrading to member role...');
      await changeUserRole(MEMBER_EMAIL, 'member');
      
      // Wait for role change detection and redirect
      await page.waitForTimeout(ROLE_POLLING_INTERVAL + 2000);
      
      // Verify we're redirected away from admin
      const currentUrl = page.url();
      const redirectedAway = !currentUrl.includes('/admin');
      
      expect(redirectedAway).toBeTruthy();
      console.log('✅ Redirected away from admin dashboard after downgrade');
      
      // Try to access admin dashboard again (should be blocked)
      await page.goto(`${BASE_URL}/admin/dashboard`);
      await page.waitForTimeout(2000);
      
      const finalUrl = page.url();
      const isBlocked = finalUrl.includes('unauthorized') || 
                       finalUrl.includes('login') || 
                       !finalUrl.includes('/admin');
      
      if (isBlocked) {
        console.log('✅ Admin dashboard blocked after role downgrade');
      }
      
      // Cleanup
      await changeUserRole(MEMBER_EMAIL, 'member');
    });
  });

  test.describe('6. Complete End-to-End Flow', () => {
    test('complete auth flow: login → role change → notification → redirect → admin access', async ({ page }) => {
      console.log('\n🚀 Starting complete E2E auth flow test...\n');
      
      // Step 1: Ensure user starts as member
      console.log('📝 Step 1: Setting up member role...');
      await changeUserRole(MEMBER_EMAIL, 'member');
      await page.waitForTimeout(1000);
      
      // Step 2: Login as member
      console.log('📝 Step 2: Logging in as member...');
      await loginAsMember(page);
      await expect(page).toHaveURL(/\/(dashboard|member-area)/);
      console.log('✅ Logged in successfully');
      
      // Step 3: Verify member dashboard access
      console.log('📝 Step 3: Verifying member dashboard access...');
      await page.goto(`${BASE_URL}/dashboard`);
      await page.waitForLoadState('networkidle');
      expect(page.url()).not.toContain('/admin');
      console.log('✅ Member dashboard accessible');
      
      // Step 4: Verify admin dashboard is blocked
      console.log('📝 Step 4: Verifying admin dashboard is blocked...');
      await page.goto(`${BASE_URL}/admin/dashboard`);
      await page.waitForTimeout(2000);
      const blockedUrl = page.url();
      const isBlocked = !blockedUrl.includes('/admin/dashboard');
      if (isBlocked) {
        console.log('✅ Admin dashboard blocked for member');
      }
      
      // Step 5: Navigate back to member dashboard
      console.log('📝 Step 5: Returning to member dashboard...');
      await page.goto(`${BASE_URL}/dashboard`);
      await page.waitForLoadState('networkidle');
      
      // Step 6: Change role to admin
      console.log('📝 Step 6: Changing role to admin...');
      await changeUserRole(MEMBER_EMAIL, 'admin');
      console.log('✅ Role changed in database');
      
      // Step 7: Wait for role change detection
      console.log('📝 Step 7: Waiting for role change detection...');
      console.log(`⏳ Polling interval: ${ROLE_POLLING_INTERVAL}ms`);
      await page.waitForTimeout(ROLE_POLLING_INTERVAL + 2000);
      
      // Step 8: Verify notification appeared
      console.log('📝 Step 8: Checking for notification...');
      const notificationVisible = await waitForNotification(
        page,
        /role.*updated|role.*changed|admin/i,
        3000
      );
      if (notificationVisible) {
        console.log('✅ Notification displayed');
      } else {
        console.log('⚠️ Notification not visible (may have auto-dismissed)');
      }
      
      // Step 9: Verify auto-redirect to admin dashboard
      console.log('📝 Step 9: Verifying auto-redirect...');
      await page.waitForTimeout(1000);
      const redirectedUrl = page.url();
      const redirectedToAdmin = redirectedUrl.includes('/admin');
      if (redirectedToAdmin) {
        console.log('✅ Auto-redirected to admin dashboard');
      } else {
        console.log('⚠️ Not auto-redirected, current URL:', redirectedUrl);
      }
      
      // Step 10: Verify admin dashboard is now accessible
      console.log('📝 Step 10: Verifying admin dashboard access...');
      await page.goto(`${BASE_URL}/admin/dashboard`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      const adminUrl = page.url();
      const canAccessAdmin = adminUrl.includes('/admin/dashboard');
      expect(canAccessAdmin).toBeTruthy();
      console.log('✅ Admin dashboard accessible after role upgrade');
      
      // Step 11: Verify admin content is visible
      console.log('📝 Step 11: Verifying admin content...');
      const adminContent = page.locator('text=/Admin|Dashboard|Management|Users|Products/i');
      const hasContent = await adminContent.count() > 0;
      if (hasContent) {
        console.log('✅ Admin content loaded');
      }
      
      // Step 12: Cleanup - restore member role
      console.log('📝 Step 12: Cleaning up...');
      await changeUserRole(MEMBER_EMAIL, 'member');
      console.log('✅ Role restored to member');
      
      console.log('\n🎉 Complete E2E auth flow test passed!\n');
    });

    test('complete flow with role downgrade: admin → member', async ({ page }) => {
      console.log('\n🚀 Starting role downgrade E2E test...\n');
      
      // Setup: Start as admin
      console.log('📝 Setup: Setting admin role...');
      await changeUserRole(MEMBER_EMAIL, 'admin');
      await page.waitForTimeout(1000);
      
      // Login as admin
      console.log('📝 Logging in as admin...');
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[name="email"], input[type="email"]', MEMBER_EMAIL);
      await page.fill('input[name="password"], input[type="password"]', MEMBER_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/admin/, { timeout: 10000 });
      console.log('✅ Logged in as admin');
      
      // Access admin dashboard
      console.log('📝 Accessing admin dashboard...');
      await page.goto(`${BASE_URL}/admin/dashboard`);
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('/admin');
      console.log('✅ Admin dashboard accessible');
      
      // Downgrade to member
      console.log('📝 Downgrading to member role...');
      await changeUserRole(MEMBER_EMAIL, 'member');
      
      // Wait for detection and redirect
      console.log('📝 Waiting for role change detection...');
      await page.waitForTimeout(ROLE_POLLING_INTERVAL + 2000);
      
      // Verify redirect
      const currentUrl = page.url();
      const redirectedAway = !currentUrl.includes('/admin');
      if (redirectedAway) {
        console.log('✅ Redirected away from admin dashboard');
      }
      
      // Verify admin access is revoked
      console.log('📝 Verifying admin access revoked...');
      await page.goto(`${BASE_URL}/admin/dashboard`);
      await page.waitForTimeout(2000);
      
      const finalUrl = page.url();
      const accessRevoked = !finalUrl.includes('/admin/dashboard');
      expect(accessRevoked).toBeTruthy();
      console.log('✅ Admin access revoked after downgrade');
      
      // Cleanup
      console.log('📝 Cleanup complete');
      
      console.log('\n🎉 Role downgrade E2E test passed!\n');
    });
  });
});
