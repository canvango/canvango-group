/**
 * RLS Policies Integration Tests
 * 
 * These tests verify Row Level Security (RLS) policies for warranty_claims,
 * transactions, and purchases tables.
 * 
 * Setup:
 * 1. Ensure Supabase project has all RLS policies applied
 * 2. Set environment variables:
 *    - VITE_SUPABASE_URL
 *    - VITE_SUPABASE_ANON_KEY
 *    - TEST_SUPABASE_SERVICE_ROLE_KEY (for admin operations)
 * 3. Run: npm test -- rls-policies.integration.test.ts
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

describe('RLS Policies Integration Tests', () => {
  let serviceClient: SupabaseClient;
  let user1Client: SupabaseClient;
  let user2Client: SupabaseClient;
  let adminClient: SupabaseClient;
  
  let user1Id: string;
  let user2Id: string;
  let adminId: string;
  
  let user1Email: string;
  let user2Email: string;
  let adminEmail: string;
  
  const testPassword = 'TestPassword123!';

  beforeAll(async () => {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !anonKey) {
      throw new Error('VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set');
    }

    if (!serviceRoleKey) {
      throw new Error('TEST_SUPABASE_SERVICE_ROLE_KEY must be set for admin operations');
    }

    // Initialize service role client for setup
    serviceClient = createClient(supabaseUrl, serviceRoleKey);

    // Create test users
    const timestamp = Date.now();
    user1Email = `test-user1-${timestamp}@example.com`;
    user2Email = `test-user2-${timestamp}@example.com`;
    adminEmail = `test-admin-${timestamp}@example.com`;

    // Create user1
    const { data: user1Auth, error: user1Error } = await serviceClient.auth.admin.createUser({
      email: user1Email,
      password: testPassword,
      email_confirm: true,
    });
    if (user1Error) throw user1Error;
    user1Id = user1Auth.user!.id;

    // Create user2
    const { data: user2Auth, error: user2Error } = await serviceClient.auth.admin.createUser({
      email: user2Email,
      password: testPassword,
      email_confirm: true,
    });
    if (user2Error) throw user2Error;
    user2Id = user2Auth.user!.id;

    // Create admin
    const { data: adminAuth, error: adminError } = await serviceClient.auth.admin.createUser({
      email: adminEmail,
      password: testPassword,
      email_confirm: true,
    });
    if (adminError) throw adminError;
    adminId = adminAuth.user!.id;

    // Wait for user profiles to be created by trigger
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Promote admin user
    const { error: roleError } = await serviceClient
      .from('users')
      .update({ role: 'admin' })
      .eq('id', adminId);
    
    if (roleError) throw roleError;

    // Create authenticated clients
    user1Client = createClient(supabaseUrl, anonKey);
    user2Client = createClient(supabaseUrl, anonKey);
    adminClient = createClient(supabaseUrl, anonKey);

    // Sign in all users
    await user1Client.auth.signInWithPassword({
      email: user1Email,
      password: testPassword,
    });

    await user2Client.auth.signInWithPassword({
      email: user2Email,
      password: testPassword,
    });

    await adminClient.auth.signInWithPassword({
      email: adminEmail,
      password: testPassword,
    });
  });

  afterAll(async () => {
    // Cleanup: Delete test users
    if (user1Id) await serviceClient.auth.admin.deleteUser(user1Id);
    if (user2Id) await serviceClient.auth.admin.deleteUser(user2Id);
    if (adminId) await serviceClient.auth.admin.deleteUser(adminId);
  });

  describe('Warranty Claims RLS Policies', () => {
    let user1ProductId: string;
    let user1PurchaseId: string;
    let user2PurchaseId: string;
    let user1ClaimId: string;
    let user2ClaimId: string;

    beforeAll(async () => {
      // Create test product
      const { data: product, error: productError } = await serviceClient
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
      
      if (productError) throw productError;
      user1ProductId = product.id;

      // Create purchases for both users
      const warrantyExpires = new Date();
      warrantyExpires.setDate(warrantyExpires.getDate() + 30);

      const { data: purchase1, error: purchase1Error } = await serviceClient
        .from('purchases')
        .insert({
          user_id: user1Id,
          product_id: user1ProductId,
          quantity: 1,
          total_price: 100,
          status: 'completed',
          warranty_expires_at: warrantyExpires.toISOString(),
        })
        .select()
        .single();
      
      if (purchase1Error) throw purchase1Error;
      user1PurchaseId = purchase1.id;

      const { data: purchase2, error: purchase2Error } = await serviceClient
        .from('purchases')
        .insert({
          user_id: user2Id,
          product_id: user1ProductId,
          quantity: 1,
          total_price: 100,
          status: 'completed',
          warranty_expires_at: warrantyExpires.toISOString(),
        })
        .select()
        .single();
      
      if (purchase2Error) throw purchase2Error;
      user2PurchaseId = purchase2.id;

      // Create warranty claims for both users
      const { data: claim1, error: claim1Error } = await serviceClient
        .from('warranty_claims')
        .insert({
          user_id: user1Id,
          purchase_id: user1PurchaseId,
          reason: 'account_suspended',
          description: 'Test claim for user1',
          status: 'pending',
        })
        .select()
        .single();
      
      if (claim1Error) throw claim1Error;
      user1ClaimId = claim1.id;

      const { data: claim2, error: claim2Error } = await serviceClient
        .from('warranty_claims')
        .insert({
          user_id: user2Id,
          purchase_id: user2PurchaseId,
          reason: 'account_banned',
          description: 'Test claim for user2',
          status: 'pending',
        })
        .select()
        .single();
      
      if (claim2Error) throw claim2Error;
      user2ClaimId = claim2.id;
    });

    afterAll(async () => {
      // Cleanup test data
      if (user1ClaimId) {
        await serviceClient.from('warranty_claims').delete().eq('id', user1ClaimId);
      }
      if (user2ClaimId) {
        await serviceClient.from('warranty_claims').delete().eq('id', user2ClaimId);
      }
      if (user1PurchaseId) {
        await serviceClient.from('purchases').delete().eq('id', user1PurchaseId);
      }
      if (user2PurchaseId) {
        await serviceClient.from('purchases').delete().eq('id', user2PurchaseId);
      }
      if (user1ProductId) {
        await serviceClient.from('products').delete().eq('id', user1ProductId);
      }
    });

    it('should allow users to see only their own warranty claims', async () => {
      const { data, error } = await user1Client
        .from('warranty_claims')
        .select('*');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.length).toBeGreaterThan(0);
      
      // All claims should belong to user1
      const allBelongToUser1 = data!.every(claim => claim.user_id === user1Id);
      expect(allBelongToUser1).toBe(true);
      
      // Should not see user2's claims
      const hasUser2Claims = data!.some(claim => claim.user_id === user2Id);
      expect(hasUser2Claims).toBe(false);
    });

    it('should prevent users from creating claims for other users purchases', async () => {
      // User1 tries to create claim for user2's purchase
      const { error } = await user1Client
        .from('warranty_claims')
        .insert({
          user_id: user1Id,
          purchase_id: user2PurchaseId, // User2's purchase
          reason: 'account_suspended',
          description: 'Unauthorized claim attempt',
          status: 'pending',
        });

      expect(error).toBeDefined();
      expect(error!.code).toBe('42501'); // Permission denied
    });

    it('should allow users to create claims for their own purchases', async () => {
      const { data, error } = await user1Client
        .from('warranty_claims')
        .insert({
          user_id: user1Id,
          purchase_id: user1PurchaseId,
          reason: 'account_error',
          description: 'Valid claim for own purchase',
          status: 'pending',
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.user_id).toBe(user1Id);
      expect(data!.purchase_id).toBe(user1PurchaseId);

      // Cleanup
      if (data) {
        await serviceClient.from('warranty_claims').delete().eq('id', data.id);
      }
    });

    it('should allow admins to see all warranty claims', async () => {
      const { data, error } = await adminClient
        .from('warranty_claims')
        .select('*');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      
      // Should see claims from multiple users
      const uniqueUsers = new Set(data!.map(claim => claim.user_id));
      expect(uniqueUsers.size).toBeGreaterThanOrEqual(2);
      
      // Should include both test users' claims
      const hasUser1Claims = data!.some(claim => claim.user_id === user1Id);
      const hasUser2Claims = data!.some(claim => claim.user_id === user2Id);
      expect(hasUser1Claims).toBe(true);
      expect(hasUser2Claims).toBe(true);
    });

    it('should allow admins to update warranty claim status', async () => {
      const { data, error } = await adminClient
        .from('warranty_claims')
        .update({ status: 'approved' })
        .eq('id', user1ClaimId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.status).toBe('approved');

      // Reset status
      await serviceClient
        .from('warranty_claims')
        .update({ status: 'pending' })
        .eq('id', user1ClaimId);
    });

    it('should prevent regular users from updating claim status', async () => {
      const { error } = await user1Client
        .from('warranty_claims')
        .update({ status: 'approved' })
        .eq('id', user1ClaimId);

      expect(error).toBeDefined();
    });
  });

  describe('Transactions RLS Policies', () => {
    let user1TransactionId: string;
    let user2TransactionId: string;

    beforeAll(async () => {
      // Create transactions for both users
      const { data: transaction1, error: transaction1Error } = await serviceClient
        .from('transactions')
        .insert({
          user_id: user1Id,
          transaction_type: 'topup',
          amount: 100,
          status: 'completed',
          description: 'Test transaction for user1',
        })
        .select()
        .single();
      
      if (transaction1Error) throw transaction1Error;
      user1TransactionId = transaction1.id;

      const { data: transaction2, error: transaction2Error } = await serviceClient
        .from('transactions')
        .insert({
          user_id: user2Id,
          transaction_type: 'topup',
          amount: 200,
          status: 'completed',
          description: 'Test transaction for user2',
        })
        .select()
        .single();
      
      if (transaction2Error) throw transaction2Error;
      user2TransactionId = transaction2.id;
    });

    afterAll(async () => {
      // Cleanup test data
      if (user1TransactionId) {
        await serviceClient.from('transactions').delete().eq('id', user1TransactionId);
      }
      if (user2TransactionId) {
        await serviceClient.from('transactions').delete().eq('id', user2TransactionId);
      }
    });

    it('should allow users to see only their own transactions', async () => {
      const { data, error } = await user1Client
        .from('transactions')
        .select('*');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.length).toBeGreaterThan(0);
      
      // All transactions should belong to user1
      const allBelongToUser1 = data!.every(transaction => transaction.user_id === user1Id);
      expect(allBelongToUser1).toBe(true);
      
      // Should not see user2's transactions
      const hasUser2Transactions = data!.some(transaction => transaction.user_id === user2Id);
      expect(hasUser2Transactions).toBe(false);
    });

    it('should prevent users from seeing other users transactions', async () => {
      const { data, error } = await user1Client
        .from('transactions')
        .select('*')
        .eq('id', user2TransactionId);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.length).toBe(0); // Should return empty array, not user2's transaction
    });

    it('should allow admins to see all transactions', async () => {
      const { data, error } = await adminClient
        .from('transactions')
        .select('*');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      
      // Should see transactions from multiple users
      const uniqueUsers = new Set(data!.map(transaction => transaction.user_id));
      expect(uniqueUsers.size).toBeGreaterThanOrEqual(2);
      
      // Should include both test users' transactions
      const hasUser1Transactions = data!.some(transaction => transaction.user_id === user1Id);
      const hasUser2Transactions = data!.some(transaction => transaction.user_id === user2Id);
      expect(hasUser1Transactions).toBe(true);
      expect(hasUser2Transactions).toBe(true);
    });

    it('should allow admins to update transaction status', async () => {
      const { data, error } = await adminClient
        .from('transactions')
        .update({ status: 'pending' })
        .eq('id', user1TransactionId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.status).toBe('pending');

      // Reset status
      await serviceClient
        .from('transactions')
        .update({ status: 'completed' })
        .eq('id', user1TransactionId);
    });

    it('should allow users to create their own transactions', async () => {
      const { data, error } = await user1Client
        .from('transactions')
        .insert({
          user_id: user1Id,
          transaction_type: 'purchase',
          amount: 50,
          status: 'completed',
          description: 'User created transaction',
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.user_id).toBe(user1Id);

      // Cleanup
      if (data) {
        await serviceClient.from('transactions').delete().eq('id', data.id);
      }
    });
  });

  describe('Purchases RLS Policies', () => {
    let testProductId: string;
    let user1PurchaseId: string;
    let user2PurchaseId: string;

    beforeAll(async () => {
      // Create test product
      const { data: product, error: productError } = await serviceClient
        .from('products')
        .insert({
          product_name: 'Test Product for Purchase RLS',
          product_type: 'personal_account',
          price: 50,
          warranty_duration_days: 30,
          is_active: true,
        })
        .select()
        .single();
      
      if (productError) throw productError;
      testProductId = product.id;

      // Create purchases for both users
      const warrantyExpires = new Date();
      warrantyExpires.setDate(warrantyExpires.getDate() + 30);

      const { data: purchase1, error: purchase1Error } = await serviceClient
        .from('purchases')
        .insert({
          user_id: user1Id,
          product_id: testProductId,
          quantity: 1,
          total_price: 50,
          status: 'completed',
          warranty_expires_at: warrantyExpires.toISOString(),
        })
        .select()
        .single();
      
      if (purchase1Error) throw purchase1Error;
      user1PurchaseId = purchase1.id;

      const { data: purchase2, error: purchase2Error } = await serviceClient
        .from('purchases')
        .insert({
          user_id: user2Id,
          product_id: testProductId,
          quantity: 1,
          total_price: 50,
          status: 'completed',
          warranty_expires_at: warrantyExpires.toISOString(),
        })
        .select()
        .single();
      
      if (purchase2Error) throw purchase2Error;
      user2PurchaseId = purchase2.id;
    });

    afterAll(async () => {
      // Cleanup test data
      if (user1PurchaseId) {
        await serviceClient.from('purchases').delete().eq('id', user1PurchaseId);
      }
      if (user2PurchaseId) {
        await serviceClient.from('purchases').delete().eq('id', user2PurchaseId);
      }
      if (testProductId) {
        await serviceClient.from('products').delete().eq('id', testProductId);
      }
    });

    it('should allow users to see only their own purchases', async () => {
      const { data, error } = await user1Client
        .from('purchases')
        .select('*');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.length).toBeGreaterThan(0);
      
      // All purchases should belong to user1
      const allBelongToUser1 = data!.every(purchase => purchase.user_id === user1Id);
      expect(allBelongToUser1).toBe(true);
      
      // Should not see user2's purchases
      const hasUser2Purchases = data!.some(purchase => purchase.user_id === user2Id);
      expect(hasUser2Purchases).toBe(false);
    });

    it('should prevent users from seeing other users purchases', async () => {
      const { data, error } = await user1Client
        .from('purchases')
        .select('*')
        .eq('id', user2PurchaseId);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.length).toBe(0); // Should return empty array
    });

    it('should allow admins to see all purchases', async () => {
      const { data, error } = await adminClient
        .from('purchases')
        .select('*');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      
      // Should see purchases from multiple users
      const uniqueUsers = new Set(data!.map(purchase => purchase.user_id));
      expect(uniqueUsers.size).toBeGreaterThanOrEqual(2);
      
      // Should include both test users' purchases
      const hasUser1Purchases = data!.some(purchase => purchase.user_id === user1Id);
      const hasUser2Purchases = data!.some(purchase => purchase.user_id === user2Id);
      expect(hasUser1Purchases).toBe(true);
      expect(hasUser2Purchases).toBe(true);
    });

    it('should allow users to update their own purchase status', async () => {
      const { data, error } = await user1Client
        .from('purchases')
        .update({ status: 'pending' })
        .eq('id', user1PurchaseId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.status).toBe('pending');

      // Reset status
      await serviceClient
        .from('purchases')
        .update({ status: 'completed' })
        .eq('id', user1PurchaseId);
    });

    it('should prevent users from updating other users purchases', async () => {
      const { error } = await user1Client
        .from('purchases')
        .update({ status: 'cancelled' })
        .eq('id', user2PurchaseId);

      expect(error).toBeDefined();
    });

    it('should allow admins to update any purchase', async () => {
      const { data, error } = await adminClient
        .from('purchases')
        .update({ status: 'pending' })
        .eq('id', user2PurchaseId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.status).toBe('pending');

      // Reset status
      await serviceClient
        .from('purchases')
        .update({ status: 'completed' })
        .eq('id', user2PurchaseId);
    });

    it('should allow users to create their own purchases', async () => {
      const warrantyExpires = new Date();
      warrantyExpires.setDate(warrantyExpires.getDate() + 30);

      const { data, error } = await user1Client
        .from('purchases')
        .insert({
          user_id: user1Id,
          product_id: testProductId,
          quantity: 1,
          total_price: 50,
          status: 'completed',
          warranty_expires_at: warrantyExpires.toISOString(),
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.user_id).toBe(user1Id);

      // Cleanup
      if (data) {
        await serviceClient.from('purchases').delete().eq('id', data.id);
      }
    });
  });
});
