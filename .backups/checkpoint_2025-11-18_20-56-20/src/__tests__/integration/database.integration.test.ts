/**
 * Database Integration Tests
 * 
 * These tests verify database triggers and RLS policies.
 * Requires a test Supabase project with the role management migration applied.
 * 
 * Setup:
 * 1. Create a test Supabase project
 * 2. Run migration: supabase/migrations/001_role_management_setup.sql
 * 3. Set environment variables:
 *    - TEST_SUPABASE_URL
 *    - TEST_SUPABASE_SERVICE_ROLE_KEY
 * 4. Run: npm test -- database.integration.test.ts
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserRole } from '../../types/roleManagement';

describe('Database Integration Tests', () => {
  let supabase: SupabaseClient;
  let testUserId: string;
  let adminUserId: string;

  beforeAll(async () => {
    // Initialize Supabase client with service role key for testing
    const supabaseUrl = process.env.TEST_SUPABASE_URL;
    const serviceRoleKey = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('TEST_SUPABASE_URL and TEST_SUPABASE_SERVICE_ROLE_KEY must be set');
    }

    supabase = createClient(supabaseUrl, serviceRoleKey);
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await supabase.from('role_audit_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('user_profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  });

  describe('Trigger: handle_new_user', () => {
    it('should create profile with member role when user signs up', async () => {
      // Create a test user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: `test-${Date.now()}@example.com`,
        password: 'test-password-123',
        email_confirm: true
      });

      expect(authError).toBeNull();
      expect(authData.user).toBeDefined();

      testUserId = authData.user!.id;

      // Wait a bit for trigger to execute
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify profile was created with member role
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', testUserId)
        .single();

      expect(profileError).toBeNull();
      expect(profile).toBeDefined();
      expect(profile!.role).toBe(UserRole.MEMBER);
      expect(profile!.user_id).toBe(testUserId);
    });
  });

  describe('Trigger: prevent_last_admin_removal', () => {
    beforeEach(async () => {
      // Create admin user
      const { data: adminAuth } = await supabase.auth.admin.createUser({
        email: `admin-${Date.now()}@example.com`,
        password: 'admin-password-123',
        email_confirm: true
      });

      adminUserId = adminAuth.user!.id;

      // Wait for profile creation
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Promote to admin
      await supabase
        .from('user_profiles')
        .update({ role: UserRole.ADMIN })
        .eq('user_id', adminUserId);
    });

    it('should prevent removing the last admin', async () => {
      // Try to demote the only admin
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: UserRole.MEMBER })
        .eq('user_id', adminUserId);

      expect(error).toBeDefined();
      expect(error!.message).toContain('Cannot remove the last admin');
    });

    it('should allow demoting admin when multiple admins exist', async () => {
      // Create second admin
      const { data: admin2Auth } = await supabase.auth.admin.createUser({
        email: `admin2-${Date.now()}@example.com`,
        password: 'admin-password-123',
        email_confirm: true
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      await supabase
        .from('user_profiles')
        .update({ role: UserRole.ADMIN })
        .eq('user_id', admin2Auth.user!.id);

      // Now demoting first admin should work
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: UserRole.MEMBER })
        .eq('user_id', adminUserId);

      expect(error).toBeNull();
    });
  });

  describe('Trigger: log_role_change', () => {
    beforeEach(async () => {
      // Create test user
      const { data: authData } = await supabase.auth.admin.createUser({
        email: `test-${Date.now()}@example.com`,
        password: 'test-password-123',
        email_confirm: true
      });

      testUserId = authData.user!.id;
      await new Promise(resolve => setTimeout(resolve, 1000));
    });

    it('should log role changes to audit table', async () => {
      // Change role from member to admin
      await supabase
        .from('user_profiles')
        .update({ role: UserRole.ADMIN })
        .eq('user_id', testUserId);

      // Wait for trigger
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check audit log
      const { data: logs, error } = await supabase
        .from('role_audit_logs')
        .select('*')
        .eq('user_id', testUserId);

      expect(error).toBeNull();
      expect(logs).toHaveLength(1);
      expect(logs![0].old_role).toBe(UserRole.MEMBER);
      expect(logs![0].new_role).toBe(UserRole.ADMIN);
    });

    it('should not log when role does not change', async () => {
      // Update profile without changing role
      await supabase
        .from('user_profiles')
        .update({ updated_at: new Date().toISOString() })
        .eq('user_id', testUserId);

      await new Promise(resolve => setTimeout(resolve, 500));

      // Check audit log - should be empty
      const { data: logs } = await supabase
        .from('role_audit_logs')
        .select('*')
        .eq('user_id', testUserId);

      expect(logs).toHaveLength(0);
    });
  });

  describe('RLS Policies', () => {
    let memberClient: SupabaseClient;
    let adminClient: SupabaseClient;
    let memberUserId: string;
    let adminUserId: string;

    beforeEach(async () => {
      // Create member user
      const { data: memberAuth } = await supabase.auth.admin.createUser({
        email: `member-${Date.now()}@example.com`,
        password: 'member-password-123',
        email_confirm: true
      });
      memberUserId = memberAuth.user!.id;

      // Create admin user
      const { data: adminAuth } = await supabase.auth.admin.createUser({
        email: `admin-${Date.now()}@example.com`,
        password: 'admin-password-123',
        email_confirm: true
      });
      adminUserId = adminAuth.user!.id;

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Promote admin
      await supabase
        .from('user_profiles')
        .update({ role: UserRole.ADMIN })
        .eq('user_id', adminUserId);

      // Create authenticated clients
      const supabaseUrl = process.env.TEST_SUPABASE_URL!;
      const anonKey = process.env.TEST_SUPABASE_ANON_KEY!;

      memberClient = createClient(supabaseUrl, anonKey);
      adminClient = createClient(supabaseUrl, anonKey);

      // Sign in
      await memberClient.auth.signInWithPassword({
        email: memberAuth.user!.email!,
        password: 'member-password-123'
      });

      await adminClient.auth.signInWithPassword({
        email: adminAuth.user!.email!,
        password: 'admin-password-123'
      });
    });

    it('should allow users to read their own profile', async () => {
      const { data, error } = await memberClient
        .from('user_profiles')
        .select('*')
        .eq('user_id', memberUserId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.user_id).toBe(memberUserId);
    });

    it('should prevent members from reading all profiles', async () => {
      const { data, error } = await memberClient
        .from('user_profiles')
        .select('*');

      // Should only return own profile due to RLS
      expect(error).toBeNull();
      expect(data).toHaveLength(1);
      expect(data![0].user_id).toBe(memberUserId);
    });

    it('should allow admins to read all profiles', async () => {
      const { data, error } = await adminClient
        .from('user_profiles')
        .select('*');

      expect(error).toBeNull();
      expect(data!.length).toBeGreaterThanOrEqual(2); // At least member and admin
    });

    it('should prevent members from updating roles', async () => {
      const { error } = await memberClient
        .from('user_profiles')
        .update({ role: UserRole.ADMIN })
        .eq('user_id', memberUserId);

      expect(error).toBeDefined();
    });

    it('should allow admins to update roles', async () => {
      const { error } = await adminClient
        .from('user_profiles')
        .update({ role: UserRole.ADMIN })
        .eq('user_id', memberUserId);

      expect(error).toBeNull();
    });

    it('should prevent users from updating their own role', async () => {
      const { error } = await memberClient
        .from('user_profiles')
        .update({ role: UserRole.ADMIN })
        .eq('user_id', memberUserId);

      expect(error).toBeDefined();
    });

    it('should allow admins to read audit logs', async () => {
      const { data, error } = await adminClient
        .from('role_audit_logs')
        .select('*');

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it('should prevent members from reading audit logs', async () => {
      const { data, error } = await memberClient
        .from('role_audit_logs')
        .select('*');

      expect(error).toBeDefined();
      expect(data).toBeNull();
    });
  });

  afterAll(async () => {
    // Cleanup: Delete test users
    if (testUserId) {
      await supabase.auth.admin.deleteUser(testUserId);
    }
    if (adminUserId) {
      await supabase.auth.admin.deleteUser(adminUserId);
    }
  });
});
