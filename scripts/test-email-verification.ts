/**
 * Email Verification Testing Script
 * 
 * Script untuk testing email verification banner functionality
 * Run di browser console setelah login
 */

import { supabase } from '@/clients/supabase';

export const testEmailVerification = {
  /**
   * Test 1: Check current user verification status
   */
  async checkStatus() {
    console.log('🔍 Checking email verification status...');
    
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    
    if (!user) {
      console.log('⚠️ No user logged in');
      return;
    }
    
    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      email_confirmed_at: user.email_confirmed_at,
      isVerified: !!user.email_confirmed_at,
    });
    
    return user;
  },

  /**
   * Test 2: Create test user (unverified)
   */
  async createTestUser(email: string, password: string) {
    console.log('📝 Creating test user...');
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    
    console.log('✅ Test user created:', {
      id: data.user?.id,
      email: data.user?.email,
      email_confirmed_at: data.user?.email_confirmed_at,
    });
    
    console.log('📧 Verification email sent to:', email);
    
    return data;
  },

  /**
   * Test 3: Login with test user
   */
  async loginTestUser(email: string, password: string) {
    console.log('🔐 Logging in test user...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    
    console.log('✅ Login successful:', {
      id: data.user?.id,
      email: data.user?.email,
      email_confirmed_at: data.user?.email_confirmed_at,
      isVerified: !!data.user?.email_confirmed_at,
    });
    
    console.log('💡 Banner should appear if email_confirmed_at is null');
    
    return data;
  },

  /**
   * Test 4: Resend verification email
   */
  async resendVerification() {
    console.log('📧 Resending verification email...');
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user?.email) {
      console.error('❌ No user email found');
      return;
    }
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: user.email,
    });
    
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    
    console.log('✅ Verification email resent to:', user.email);
    console.log('📬 Check your inbox or spam folder');
    
    return { success: true };
  },

  /**
   * Test 5: Simulate verification (for testing only)
   * Note: This requires admin privileges
   */
  async simulateVerification(userId: string) {
    console.log('⚠️ This requires admin privileges');
    console.log('🔧 Simulating verification for user:', userId);
    
    // This would need to be done via Supabase Dashboard or Admin API
    console.log('📝 Steps to manually verify:');
    console.log('1. Go to Supabase Dashboard');
    console.log('2. Navigate to Authentication > Users');
    console.log('3. Find user:', userId);
    console.log('4. Click "..." menu');
    console.log('5. Select "Confirm email"');
  },

  /**
   * Test 6: Full flow test
   */
  async runFullTest() {
    console.log('🚀 Running full email verification test...\n');
    
    // Step 1: Check current status
    console.log('--- Step 1: Check Current Status ---');
    await this.checkStatus();
    console.log('\n');
    
    // Step 2: Create test user
    console.log('--- Step 2: Create Test User ---');
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    console.log('Test credentials:', { email: testEmail, password: testPassword });
    
    const signUpResult = await this.createTestUser(testEmail, testPassword);
    console.log('\n');
    
    if (!signUpResult) {
      console.error('❌ Test failed: Could not create user');
      return;
    }
    
    // Step 3: Login with test user
    console.log('--- Step 3: Login Test User ---');
    const loginResult = await this.loginTestUser(testEmail, testPassword);
    console.log('\n');
    
    if (!loginResult) {
      console.error('❌ Test failed: Could not login');
      return;
    }
    
    // Step 4: Check banner should appear
    console.log('--- Step 4: Verify Banner Appearance ---');
    console.log('✅ Navigate to dashboard');
    console.log('✅ Banner should be visible at the top');
    console.log('✅ Email should display:', testEmail);
    console.log('\n');
    
    // Step 5: Test resend
    console.log('--- Step 5: Test Resend Functionality ---');
    console.log('💡 Click "Kirim Ulang Email" button in the banner');
    console.log('💡 Or run: testEmailVerification.resendVerification()');
    console.log('\n');
    
    // Step 6: Test verification
    console.log('--- Step 6: Test Email Verification ---');
    console.log('📧 Check email inbox for verification link');
    console.log('🔗 Click the verification link');
    console.log('⏱️ Wait up to 30 seconds for auto-refresh');
    console.log('✅ Banner should disappear automatically');
    console.log('\n');
    
    console.log('🎉 Test setup complete!');
    console.log('📝 Test credentials saved for manual testing:');
    console.log('   Email:', testEmail);
    console.log('   Password:', testPassword);
  },

  /**
   * Cleanup: Logout
   */
  async cleanup() {
    console.log('🧹 Cleaning up...');
    await supabase.auth.signOut();
    console.log('✅ Logged out');
  },
};

// Export for browser console
if (typeof window !== 'undefined') {
  (window as any).testEmailVerification = testEmailVerification;
  console.log('✅ Email verification test utilities loaded');
  console.log('💡 Usage: testEmailVerification.runFullTest()');
}
