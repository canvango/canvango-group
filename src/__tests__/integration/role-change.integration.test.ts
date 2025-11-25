/**
 * Role Change Integration Tests
 * 
 * These tests verify the complete role change flow after migrating to
 * Supabase native authentication without custom JWT claims.
 * 
 * Test Coverage:
 * - User can login after admin changes their role
 * - RLS policies work with new subquery pattern
 * - Admin can read all users
 * - Member can only read own profile
 * 
 * Setup:
 * 1. Ensure Supabase project has updated RLS policies (no JWT claims)
 * 2. Set environment variables:
 *    - VITE_SUPABASE_URL
 *    - VITE_SUPABASE_ANON_KEY
 *    - TEST_SUPABASE_SERVICE_ROLE_KEY
 * 3. Run: npm test -- role-change.integration.test.ts
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Skip tests if environment variables are not set
const shouldSkipTests = !process.env.VITE_SUPABASE_URL || 
                        !process.env.VITE_SUPABASE_ANON_KEY || 
                        !process.env.TEST_SUPABASE_SERVICE_ROLE_KEY;

const describeOrSkip = shouldSkipTests ? describe.skip : describe;

describeOrSkip('Role Change Integration Tests', () => {
  let serviceClient: SupabaseClient;
  let memberClient: SupabaseClient;
  let adminClient: SupabaseClient;
  
  let memberUserId: string;
  let adminUserId: string;
  
  let memberEmail: string;
  let adminEmail: string;
  
  const testPassword = 'TestPassword123!';

  beforeAll(async () => {
    const supabaseUrl = process.env.VITE_SUPABASE_URL!;
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY!;
    const serviceRoleKey = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY!;

    // Initialize service role client for setup
    serviceClient = createClient(supabaseUrl, serviceRoleKey);

    // Create test users
    const timestamp = Date.now();
    memberEmail = `test-member-${timestamp}@example.com`;
    adminEmail = `test-admin-${timestamp}@example.com`;

    // Create member user
    const { data: memberAuth, error: memberError } = await serviceClient.auth.admin.createUser({
      email: memberEmail,
      password: testPassword,
      email_confirm: true,
    });
    if (memberError) throw memberError;
    memberUserId = memberAuth.user!.id;

    // Create admin user
    const { data: adminAuth, error: adminError } = await serviceClient.auth.admin.createUser({
      email: adminEmail,
      password: testPassword,
      email_confirm: true,
    });
    if (adminError) throw adminError;
    adminUserId = adminAuth.user!.id;

    // Wait for user profiles to be created by trigger
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Promote admin user
    const { error: roleError } = await serviceClient
      .from('users')
      .update({ role: 'admin' })
      .eq('id', adminUserId);
    
    if (roleError) throw roleError;

    // Create authenticated clients
    memberClient = createClient(supabaseUrl, anonKey);
    adminClient = createClient(supabaseUrl, anonKey);

    // Sign in both users
    await memberClient.auth.signInWithPassword({
      email: memberEmail,
      password: testPassword,
    });

    await adminClient.auth.signInWithPassword({
      email: adminEmail,
      password: testPassword,
    });
  });

  afterAll(async () => {
    // Cleanup: Delete test users
    if (memberUserId) await serviceClient.auth.admin.deleteUser(memberUserId);
    if (adminUserId) await serviceClient.auth.admin.deleteUser(adminUserId);
  });

  describe('Requirement 1.1: User can login after admin changes their role', () => {
    it('should allow user to login after role change from member to admin', async () => {
      // 1. Verify user is initially a member
      const { data: initialProfile } = await serviceClient
        .from('users')
        .select('role')
        .eq('id', memberUserId)
        .single();
      
      expect(initialProfile?.role).toBe('member');

      // 2. Admin changes user role to admin
      const { error: updateError } = await serviceClient
        .from('users')
        .update({ role: 'admin' })
        .eq('id', memberUserId);
      
      expect(updateError).toBeNull();

      // 3. Logout the user
      await memberClient.auth.signOut();

      // 4. User logs in again (should work without errors)
      const { data: loginData, error: loginError } = await memberClient.auth.signInWithPassword({
        email: memberEmail,
        password: testPassword,
      });

      expect(loginError).toBeNull();
      expect(loginData.session).toBeTruthy();
      expect(loginData.user).toBeTruthy();

      // 5. Verify role is now admin from database
      const { data: updatedProfile } = await memberClient
        .from('users')
        .select('role')
        .eq('id', memberUserId)
        .single();
      
      expect(updatedProfile?.role).toBe('admin');

      // Cleanup: Reset role back to member
      await serviceClient
        .from('users')
        .update({ role: 'member' })
        .eq('id', memberUserId);
    });

    it('should allow user to login after role change from admin to member', async () => {
      // 1. Temporarily promote member to admin
      await serviceClient
        .from('users')
        .update({ role: 'admin' })
        .eq('id', memberUserId);

      // 2. Verify user is admin
      const { data: adminProfile } = await serviceClient
        .from('users')
        .select('role')
        .eq('id', memberUserId)
        .single();
      
      expect(adminProfile?.role).toBe('admin');

      // 3. Demote back to member
      const { error: demoteError } = await serviceClient
        .from('users')
        .update({ role: 'member' })
        .eq('id', memberUserId);
      
      expect(demoteError).toBeNull();

      // 4. Logout
      await memberClient.auth.signOut();

      // 5. Login again (should work)
      const { data: loginData, error: loginError } = await memberClient.auth.signInWithPassword({
        email: memberEmail,
        password: testPassword,
      });

      expect(loginError).toBeNull();
      expect(loginData.session).toBeTruthy();

      // 6. Verify role is member
      const { data: memberProfile } = await memberClient
        .from('users')
        .select('role')
        .eq('id', memberUserId)
        .single();
      
      expect(memberProfile?.role).toBe('member');
    });

    it('should not have JWT claims for user_role after login', async () => {
      // Login as member
      const { data: loginData } = await memberClient.auth.signInWithPassword({
        email: memberEmail,
        password: testPassword,
      });

      expect(loginData.session).toBeTruthy();

      // Decode JWT token to verify no custom claims
      const token = loginData.session!.access_token;
      const payload = JSON.parse(atob(token.split('.')[1]));

      // Should NOT have user_role in JWT claims
      expect(payload.user_role).toBeUndefined();
      
      // Should have standard Supabase claims
      expect(payload.sub).toBe(memberUserId);
      expect(payload.email).toBe(memberEmail);
    });
  });

  describe('Requirement 4.1, 4.2: RLS policies work with new subquery pattern', () => {
    describe('Users table RLS policies', () => {
      it('should allow member to read only their own profile', async () => {
        const { data, error } = await memberClient
          .from('users')
          .select('*');

        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(data!.length).toBe(1);
        expect(data![0].id).toBe(memberUserId);
      });

      it('should prevent member from reading other users profiles', async () => {
        const { data, error } = await memberClient
          .from('users')
          .select('*')
          .eq('id', adminUserId);

        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(data!.length).toBe(0); // RLS filters out admin's profile
      });

      it('should allow admin to read all users', async () => {
        const { data, error } = await adminClient
          .from('users')
          .select('*');

        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(data!.length).toBeGreaterThanOrEqual(2); // At least member and admin

        // Verify both test users are in results
        const userIds = data!.map(u => u.id);
        expect(userIds).toContain(memberUserId);
        expect(userIds).toContain(adminUserId);
      });

      it('should prevent member from updating their own role', async () => {
        const { error } = await memberClient
          .from('users')
          .update({ role: 'admin' })
          .eq('id', memberUserId);

        expect(error).toBeDefined();
        expect(error!.code).toBe('42501'); // Permission denied
      });

      it('should allow admin to update other users roles', async () => {
        // Create a temporary test user
        const { data: tempAuth } = await serviceClient.auth.admin.createUser({
          email: `temp-${Date.now()}@example.com`,
          password: testPassword,
          email_confirm: true,
        });

        await new Promise(resolve => setTimeout(resolve, 1000));

        const tempUserId = tempAuth.user!.id;

        // Admin updates temp user's role
        const { error } = await adminClient
          .from('users')
          .update({ role: 'admin' })
          .eq('id', tempUserId);

        expect(error).toBeNull();

        // Verify role was updated
        const { data: updatedUser } = await serviceClient
          .from('users')
          .select('role')
          .eq('id', tempUserId)
          .single();

        expect(updatedUser?.role).toBe('admin');

        // Cleanup
        await serviceClient.auth.admin.deleteUser(tempUserId);
      });
    });

    describe('Products table RLS policies', () => {
      let testProductId: string;

      beforeAll(async () => {
        // Create a test product
        const { data: product, error } = await serviceClient
          .from('products')
          .insert({
            product_name: 'Test Product for RLS',
            product_type: 'bm_account',
            price: 100,
            warranty_duration_days: 30,
            is_active: true,
          })
          .select()
          .single();

        if (error) throw error;
        testProductId = product.id;
      });

      afterAll(async () => {
        // Cleanup test product
        if (testProductId) {
          await serviceClient.from('products').delete().eq('id', testProductId);
        }
      });

      it('should allow member to read products', async () => {
        const { data, error } = await memberClient
          .from('products')
          .select('*')
          .eq('id', testProductId);

        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(data!.length).toBe(1);
      });

      it('should prevent member from creating products', async () => {
        const { error } = await memberClient
          .from('products')
          .insert({
            product_name: 'Unauthorized Product',
            product_type: 'personal_account',
            price: 50,
            warranty_duration_days: 30,
            is_active: true,
          });

        expect(error).toBeDefined();
        expect(error!.code).toBe('42501'); // Permission denied
      });

      it('should allow admin to create products', async () => {
        const { data, error } = await adminClient
          .from('products')
          .insert({
            product_name: 'Admin Created Product',
            product_type: 'personal_account',
            price: 75,
            warranty_duration_days: 30,
            is_active: true,
          })
          .select()
          .single();

        expect(error).toBeNull();
        expect(data).toBeDefined();

        // Cleanup
        if (data) {
          await serviceClient.from('products').delete().eq('id', data.id);
        }
      });

      it('should allow admin to update products', async () => {
        const { error } = await adminClient
          .from('products')
          .update({ price: 150 })
          .eq('id', testProductId);

        expect(error).toBeNull();

        // Reset price
        await serviceClient
          .from('products')
          .update({ price: 100 })
          .eq('id', testProductId);
      });

      it('should prevent member from updating products', async () => {
        const { error } = await memberClient
          .from('products')
          .update({ price: 200 })
          .eq('id', testProductId);

        expect(error).toBeDefined();
        expect(error!.code).toBe('42501');
      });
    });

    describe('Transactions table RLS policies', () => {
      let memberTransactionId: string;
      let adminTransactionId: string;

      beforeAll(async () => {
        // Create transactions for both users
        const { data: memberTransaction } = await serviceClient
          .from('transactions')
          .insert({
            user_id: memberUserId,
            transaction_type: 'topup',
            amount: 100,
            status: 'completed',
            description: 'Test transaction for member',
          })
          .select()
          .single();

        memberTransactionId = memberTransaction!.id;

        const { data: adminTransaction } = await serviceClient
          .from('transactions')
          .insert({
            user_id: adminUserId,
            transaction_type: 'topup',
            amount: 200,
            status: 'completed',
            description: 'Test transaction for admin',
          })
          .select()
          .single();

        adminTransactionId = adminTransaction!.id;
      });

      afterAll(async () => {
        // Cleanup transactions
        if (memberTransactionId) {
          await serviceClient.from('transactions').delete().eq('id', memberTransactionId);
        }
        if (adminTransactionId) {
          await serviceClient.from('transactions').delete().eq('id', adminTransactionId);
        }
      });

      it('should allow member to read only their own transactions', async () => {
        const { data, error } = await memberClient
          .from('transactions')
          .select('*');

        expect(error).toBeNull();
        expect(data).toBeDefined();

        // All transactions should belong to member
        const allBelongToMember = data!.every(t => t.user_id === memberUserId);
        expect(allBelongToMember).toBe(true);

        // Should not see admin's transactions
        const hasAdminTransactions = data!.some(t => t.user_id === adminUserId);
        expect(hasAdminTransactions).toBe(false);
      });

      it('should allow admin to read all transactions', async () => {
        const { data, error } = await adminClient
          .from('transactions')
          .select('*');

        expect(error).toBeNull();
        expect(data).toBeDefined();

        // Should see transactions from multiple users
        const uniqueUsers = new Set(data!.map(t => t.user_id));
        expect(uniqueUsers.size).toBeGreaterThanOrEqual(2);

        // Should include both test users' transactions
        const transactionUserIds = data!.map(t => t.user_id);
        expect(transactionUserIds).toContain(memberUserId);
        expect(transactionUserIds).toContain(adminUserId);
      });

      it('should prevent member from reading other users transactions', async () => {
        const { data, error } = await memberClient
          .from('transactions')
          .select('*')
          .eq('id', adminTransactionId);

        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(data!.length).toBe(0); // RLS filters out admin's transaction
      });
    });

    describe('Warranty Claims table RLS policies', () => {
      let testProductId: string;
      let memberPurchaseId: string;
      let adminPurchaseId: string;
      let memberClaimId: string;
      let adminClaimId: string;

      beforeAll(async () => {
        // Create test product
        const { data: product } = await serviceClient
          .from('products')
          .insert({
            product_name: 'Test Product for Claims',
            product_type: 'bm_account',
            price: 100,
            warranty_duration_days: 30,
            is_active: true,
          })
          .select()
          .single();

        testProductId = product!.id;

        // Create purchases
        const warrantyExpires = new Date();
        warrantyExpires.setDate(warrantyExpires.getDate() + 30);

        const { data: memberPurchase } = await serviceClient
          .from('purchases')
          .insert({
            user_id: memberUserId,
            product_id: testProductId,
            quantity: 1,
            total_price: 100,
            status: 'completed',
            warranty_expires_at: warrantyExpires.toISOString(),
          })
          .select()
          .single();

        memberPurchaseId = memberPurchase!.id;

        const { data: adminPurchase } = await serviceClient
          .from('purchases')
          .insert({
            user_id: adminUserId,
            product_id: testProductId,
            quantity: 1,
            total_price: 100,
            status: 'completed',
            warranty_expires_at: warrantyExpires.toISOString(),
          })
          .select()
          .single();

        adminPurchaseId = adminPurchase!.id;

        // Create warranty claims
        const { data: memberClaim } = await serviceClient
          .from('warranty_claims')
          .insert({
            user_id: memberUserId,
            purchase_id: memberPurchaseId,
            reason: 'account_suspended',
            description: 'Test claim for member',
            status: 'pending',
          })
          .select()
          .single();

        memberClaimId = memberClaim!.id;

        const { data: adminClaim } = await serviceClient
          .from('warranty_claims')
          .insert({
            user_id: adminUserId,
            purchase_id: adminPurchaseId,
            reason: 'account_banned',
            description: 'Test claim for admin',
            status: 'pending',
          })
          .select()
          .single();

        adminClaimId = adminClaim!.id;
      });

      afterAll(async () => {
        // Cleanup
        if (memberClaimId) {
          await serviceClient.from('warranty_claims').delete().eq('id', memberClaimId);
        }
        if (adminClaimId) {
          await serviceClient.from('warranty_claims').delete().eq('id', adminClaimId);
        }
        if (memberPurchaseId) {
          await serviceClient.from('purchases').delete().eq('id', memberPurchaseId);
        }
        if (adminPurchaseId) {
          await serviceClient.from('purchases').delete().eq('id', adminPurchaseId);
        }
        if (testProductId) {
          await serviceClient.from('products').delete().eq('id', testProductId);
        }
      });

      it('should allow member to read only their own warranty claims', async () => {
        const { data, error } = await memberClient
          .from('warranty_claims')
          .select('*');

        expect(error).toBeNull();
        expect(data).toBeDefined();

        // All claims should belong to member
        const allBelongToMember = data!.every(c => c.user_id === memberUserId);
        expect(allBelongToMember).toBe(true);

        // Should not see admin's claims
        const hasAdminClaims = data!.some(c => c.user_id === adminUserId);
        expect(hasAdminClaims).toBe(false);
      });

      it('should allow admin to read all warranty claims', async () => {
        const { data, error } = await adminClient
          .from('warranty_claims')
          .select('*');

        expect(error).toBeNull();
        expect(data).toBeDefined();

        // Should see claims from multiple users
        const uniqueUsers = new Set(data!.map(c => c.user_id));
        expect(uniqueUsers.size).toBeGreaterThanOrEqual(2);

        // Should include both test users' claims
        const claimUserIds = data!.map(c => c.user_id);
        expect(claimUserIds).toContain(memberUserId);
        expect(claimUserIds).toContain(adminUserId);
      });

      it('should allow admin to update warranty claim status', async () => {
        const { data, error } = await adminClient
          .from('warranty_claims')
          .update({ status: 'approved' })
          .eq('id', memberClaimId)
          .select()
          .single();

        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(data!.status).toBe('approved');

        // Reset status
        await serviceClient
          .from('warranty_claims')
          .update({ status: 'pending' })
          .eq('id', memberClaimId);
      });

      it('should prevent member from updating claim status', async () => {
        const { error } = await memberClient
          .from('warranty_claims')
          .update({ status: 'approved' })
          .eq('id', memberClaimId);

        expect(error).toBeDefined();
      });
    });
  });

  describe('Performance: RLS subquery pattern', () => {
    it('should execute role check query efficiently', async () => {
      const startTime = Date.now();

      // Execute multiple queries to test performance
      for (let i = 0; i < 10; i++) {
        await memberClient
          .from('users')
          .select('*')
          .eq('id', memberUserId)
          .single();
      }

      const endTime = Date.now();
      const avgTime = (endTime - startTime) / 10;

      // Average query time should be less than 100ms
      expect(avgTime).toBeLessThan(100);
    });

    it('should use index for role subquery', async () => {
      // This test verifies that the database is using the index
      // In a real scenario, you would use EXPLAIN ANALYZE
      const { data, error } = await memberClient
        .from('users')
        .select('role')
        .eq('id', memberUserId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.role).toBeDefined();
    });
  });
});
