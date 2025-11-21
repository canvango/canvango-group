/**
 * E2E Tests for Admin Interface
 * 
 * These tests verify the complete user flow for admin interface.
 * Requires Playwright or Cypress setup.
 * 
 * Setup with Playwright:
 * 1. npm install -D @playwright/test
 * 2. npx playwright install
 * 3. Set environment variables in .env.test
 * 4. Run: npx playwright test
 * 
 * Note: This is a template. Adjust based on your testing framework.
 */

import { test, expect, Page } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.TEST_APP_URL || 'http://localhost:3000';
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'admin-password';
const MEMBER_EMAIL = process.env.TEST_MEMBER_EMAIL || 'member@example.com';
const MEMBER_PASSWORD = process.env.TEST_MEMBER_PASSWORD || 'member-password';

// Helper functions
async function loginAsAdmin(page: Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[name="email"]', ADMIN_EMAIL);
  await page.fill('input[name="password"]', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE_URL}/admin`);
}

async function loginAsMember(page: Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[name="email"]', MEMBER_EMAIL);
  await page.fill('input[name="password"]', MEMBER_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE_URL}/dashboard`);
}

test.describe('Admin Interface E2E Tests', () => {
  test.describe('Admin Access', () => {
    test('admin can view all users', async ({ page }) => {
      await loginAsAdmin(page);
      
      // Navigate to user management
      await page.goto(`${BASE_URL}/admin/users`);
      
      // Wait for user list to load
      await page.waitForSelector('table');
      
      // Verify table has users
      const rows = await page.locator('tbody tr').count();
      expect(rows).toBeGreaterThan(0);
      
      // Verify columns exist
      await expect(page.locator('th:has-text("Email")')).toBeVisible();
      await expect(page.locator('th:has-text("Current Role")')).toBeVisible();
      await expect(page.locator('th:has-text("Actions")')).toBeVisible();
    });

    test('admin can filter users by role', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/admin/users`);
      
      // Get initial count
      const initialCount = await page.locator('tbody tr').count();
      
      // Filter by admins only
      await page.selectOption('select', 'admin');
      await page.waitForTimeout(500);
      
      // Verify filtered results
      const adminCount = await page.locator('tbody tr').count();
      expect(adminCount).toBeLessThanOrEqual(initialCount);
      
      // Verify all visible users are admins
      const roleBadges = await page.locator('tbody tr .role-badge').allTextContents();
      roleBadges.forEach(badge => {
        expect(badge.toLowerCase()).toContain('admin');
      });
    });

    test('admin can search users by email', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/admin/users`);
      
      // Search for specific email
      await page.fill('input[placeholder*="Search"]', MEMBER_EMAIL);
      await page.waitForTimeout(500);
      
      // Verify search results
      const rows = await page.locator('tbody tr').count();
      expect(rows).toBeGreaterThanOrEqual(1);
      
      // Verify email is in results
      await expect(page.locator(`tbody tr:has-text("${MEMBER_EMAIL}")`)).toBeVisible();
    });
  });

  test.describe('Role Change Flow', () => {
    test('admin can change user role with confirmation', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/admin/users`);
      
      // Find member user and click promote button
      const memberRow = page.locator(`tbody tr:has-text("${MEMBER_EMAIL}")`);
      await memberRow.locator('button:has-text("Promote")').click();
      
      // Verify confirmation dialog appears
      await expect(page.locator('text=Confirm Role Change')).toBeVisible();
      await expect(page.locator('text=member')).toBeVisible();
      await expect(page.locator('text=admin')).toBeVisible();
      
      // Confirm change
      await page.click('button:has-text("Confirm")');
      
      // Wait for success notification
      await expect(page.locator('text=Successfully')).toBeVisible();
      
      // Verify role changed in table
      await page.waitForTimeout(1000);
      const updatedBadge = await memberRow.locator('.role-badge').textContent();
      expect(updatedBadge?.toLowerCase()).toContain('admin');
    });

    test('confirmation dialog shows warning for admin demotion', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/admin/users`);
      
      // Find admin user and click demote button
      const adminRow = page.locator(`tbody tr:has-text("admin")`).first();
      await adminRow.locator('button:has-text("Demote")').click();
      
      // Verify warning appears
      await expect(page.locator('text=Demoting Admin')).toBeVisible();
      await expect(page.locator('text=lose all administrative privileges')).toBeVisible();
    });

    test('user can cancel role change', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/admin/users`);
      
      // Start role change
      const memberRow = page.locator(`tbody tr:has-text("${MEMBER_EMAIL}")`).first();
      const originalBadge = await memberRow.locator('.role-badge').textContent();
      await memberRow.locator('button').first().click();
      
      // Cancel
      await page.click('button:has-text("Cancel")');
      
      // Verify dialog closed
      await expect(page.locator('text=Confirm Role Change')).not.toBeVisible();
      
      // Verify role unchanged
      const currentBadge = await memberRow.locator('.role-badge').textContent();
      expect(currentBadge).toBe(originalBadge);
    });
  });

  test.describe('Error Handling', () => {
    test('shows error when role change fails', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/admin/users`);
      
      // Mock API to return error
      await page.route('**/rest/v1/user_profiles*', route => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Database error' })
        });
      });
      
      // Try to change role
      const memberRow = page.locator(`tbody tr:has-text("${MEMBER_EMAIL}")`).first();
      await memberRow.locator('button').first().click();
      await page.click('button:has-text("Confirm")');
      
      // Verify error notification
      await expect(page.locator('text=Failed')).toBeVisible();
    });

    test('prevents removing last admin', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/admin/users`);
      
      // Ensure only one admin exists (test setup dependent)
      // Try to demote the only admin
      const adminRow = page.locator(`tbody tr:has-text("admin")`).first();
      await adminRow.locator('button:has-text("Demote")').click();
      await page.click('button:has-text("Confirm")');
      
      // Verify error message
      await expect(page.locator('text=Cannot remove the last admin')).toBeVisible();
    });
  });

  test.describe('Audit Log', () => {
    test('audit log updates after role change', async ({ page }) => {
      await loginAsAdmin(page);
      
      // Change a role
      await page.goto(`${BASE_URL}/admin/users`);
      const memberRow = page.locator(`tbody tr:has-text("${MEMBER_EMAIL}")`).first();
      await memberRow.locator('button').first().click();
      await page.click('button:has-text("Confirm")');
      await page.waitForTimeout(1000);
      
      // Navigate to audit log
      await page.goto(`${BASE_URL}/admin/audit`);
      
      // Verify log entry exists
      await expect(page.locator(`text=${MEMBER_EMAIL}`)).toBeVisible();
      await expect(page.locator('text=Role changed')).toBeVisible();
    });

    test('admin can filter audit logs by date', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/admin/audit`);
      
      // Get initial count
      const initialCount = await page.locator('.audit-log-entry').count();
      
      // Filter by last 7 days
      await page.selectOption('select[name="dateFilter"]', '7days');
      await page.waitForTimeout(500);
      
      // Verify filtered results
      const filteredCount = await page.locator('.audit-log-entry').count();
      expect(filteredCount).toBeLessThanOrEqual(initialCount);
    });

    test('admin can export audit logs to CSV', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/admin/audit`);
      
      // Setup download listener
      const downloadPromise = page.waitForEvent('download');
      
      // Click export button
      await page.click('button:has-text("Export CSV")');
      
      // Verify download started
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('role-audit-log');
      expect(download.suggestedFilename()).toContain('.csv');
    });

    test('audit log shows pagination for large datasets', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/admin/audit`);
      
      // Check if pagination exists (if more than 10 entries)
      const entryCount = await page.locator('.audit-log-entry').count();
      
      if (entryCount >= 10) {
        // Verify pagination controls
        await expect(page.locator('button:has-text("Next")')).toBeVisible();
        await expect(page.locator('button:has-text("Previous")')).toBeVisible();
        
        // Test pagination
        await page.click('button:has-text("Next")');
        await page.waitForTimeout(500);
        
        // Verify page changed
        await expect(page.locator('text=Page 2')).toBeVisible();
      }
    });
  });

  test.describe('Member Access Restrictions', () => {
    test('member cannot access admin interface', async ({ page }) => {
      await loginAsMember(page);
      
      // Try to access admin page
      await page.goto(`${BASE_URL}/admin/users`);
      
      // Verify access denied
      await expect(page.locator('text=Access Denied')).toBeVisible();
      await expect(page.locator('text=admin privileges')).toBeVisible();
    });

    test('member cannot see admin navigation', async ({ page }) => {
      await loginAsMember(page);
      await page.goto(`${BASE_URL}/dashboard`);
      
      // Verify admin links not visible
      await expect(page.locator('a:has-text("User Management")')).not.toBeVisible();
      await expect(page.locator('a:has-text("Audit Log")')).not.toBeVisible();
    });
  });

  test.describe('UI/UX', () => {
    test('shows loading state while fetching users', async ({ page }) => {
      await loginAsAdmin(page);
      
      // Slow down network to see loading state
      await page.route('**/rest/v1/user_profiles*', async route => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        await route.continue();
      });
      
      await page.goto(`${BASE_URL}/admin/users`);
      
      // Verify loading indicator
      await expect(page.locator('text=Loading')).toBeVisible();
    });

    test('stats update after role change', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/admin/users`);
      
      // Get initial admin count
      const initialAdminCount = await page.locator('.stat-admins').textContent();
      
      // Promote a member
      const memberRow = page.locator(`tbody tr:has-text("member")`).first();
      await memberRow.locator('button:has-text("Promote")').click();
      await page.click('button:has-text("Confirm")');
      await page.waitForTimeout(1000);
      
      // Verify admin count increased
      const newAdminCount = await page.locator('.stat-admins').textContent();
      expect(parseInt(newAdminCount!)).toBeGreaterThan(parseInt(initialAdminCount!));
    });

    test('notification auto-hides after 5 seconds', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/admin/users`);
      
      // Trigger a role change
      const memberRow = page.locator(`tbody tr:has-text("${MEMBER_EMAIL}")`).first();
      await memberRow.locator('button').first().click();
      await page.click('button:has-text("Confirm")');
      
      // Verify notification appears
      await expect(page.locator('.notification')).toBeVisible();
      
      // Wait 5 seconds
      await page.waitForTimeout(5500);
      
      // Verify notification disappeared
      await expect(page.locator('.notification')).not.toBeVisible();
    });
  });
});
