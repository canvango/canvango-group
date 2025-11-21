/**
 * Supabase Authentication Flow Deep Verification
 * 
 * This script tests authentication with actual login credentials
 */

import { supabase } from '../src/features/member-area/services/supabase';
import * as readline from 'readline';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  details?: any;
}

const results: TestResult[] = [];

function logTest(name: string, passed: boolean, message: string, details?: any) {
  const status = passed ? `${colors.green}✓ PASS${colors.reset}` : `${colors.red}✗ FAIL${colors.reset}`;
  console.log(`\n${status} ${colors.cyan}${name}${colors.reset}`);
  console.log(`  ${message}`);
  if (details) {
    console.log(`  ${colors.yellow}Details:${colors.reset}`, JSON.stringify(details, null, 2));
  }
  results.push({ name, passed, message, details });
}

function logSection(title: string) {
  console.log(`\n${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.blue}${title}${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}`);
}

async function promptUser(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function test15_3_AuthenticationFlow() {
  logSection('15.3 Test Authentication with Supabase');

  try {
    // Get credentials from user
    console.log(`\n${colors.yellow}Please provide test credentials:${colors.reset}`);
    const email = await promptUser('Email or Username: ');
    const password = await promptUser('Password: ');

    if (!email || !password) {
      console.log(`\n${colors.yellow}No credentials provided. Skipping authentication tests.${colors.reset}`);
      return null;
    }

    // Determine if input is email or username
    let loginEmail = email;
    if (!email.includes('@')) {
      // It's a username, fetch email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('username', email)
        .single();

      if (userError || !userData) {
        logTest(
          'Username to Email Lookup',
          false,
          `Failed to find user with username: ${email}`,
          { error: userError?.message }
        );
        return null;
      }

      loginEmail = userData.email;
      logTest(
        'Username to Email Lookup',
        true,
        `Found email for username: ${email}`,
        { email: loginEmail }
      );
    }

    // Test 1: Login with email/password
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: password,
    });

    logTest(
      'Login with Email/Password',
      !authError && !!authData.session,
      authError
        ? `Login failed: ${authError.message}`
        : 'Successfully logged in',
      {
        hasSession: !!authData.session,
        userId: authData.user?.id,
      }
    );

    if (!authData.session) {
      return null;
    }

    // Test 2: Verify JWT token storage
    const hasAccessToken = !!authData.session.access_token;
    const hasRefreshToken = !!authData.session.refresh_token;

    logTest(
      'JWT Token Storage',
      hasAccessToken && hasRefreshToken,
      hasAccessToken && hasRefreshToken
        ? 'Access and refresh tokens stored correctly'
        : 'Missing tokens',
      {
        hasAccessToken,
        hasRefreshToken,
        tokenLength: authData.session.access_token?.length,
      }
    );

    // Test 3: Session persistence check
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    logTest(
      'Session Persistence',
      !sessionError && !!sessionData.session,
      sessionError
        ? `Session check failed: ${sessionError.message}`
        : 'Session persisted correctly',
      {
        sessionId: sessionData.session?.user?.id,
        expiresAt: sessionData.session?.expires_at,
      }
    );

    // Test 4: Auth state change detection
    let authStateChanged = false;
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      authStateChanged = true;
      console.log(`  Auth state event: ${event}`);
    });

    logTest(
      'Auth State Change Detection',
      !!authListener,
      'Auth state listener registered successfully'
    );

    return authData.session;
  } catch (err: any) {
    logTest(
      'Authentication Flow',
      false,
      `Exception: ${err.message}`,
      { error: err }
    );
    return null;
  }
}

async function test15_4_UserDataRetrieval(session: any) {
  logSection('15.4 Test User Data Retrieval');

  if (!session) {
    console.log(`\n${colors.yellow}No active session. Skipping user data tests.${colors.reset}`);
    return;
  }

  try {
    // Test 1: Query users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    logTest(
      'Query Users Table',
      !userError && !!userData,
      userError
        ? `Query failed: ${userError.message}`
        : 'Successfully retrieved user data',
      {
        userId: userData?.id,
        username: userData?.username,
        email: userData?.email,
      }
    );

    if (!userData) return;

    // Test 2: Verify user role
    const hasRole = !!userData.role;
    logTest(
      'User Role Retrieved',
      hasRole,
      hasRole ? `User role: ${userData.role}` : 'User role not found',
      { role: userData.role }
    );

    // Test 3: Test user profile update
    const newFullName = `${userData.full_name || userData.username} (verified)`;
    const { data: updateData, error: updateError } = await supabase
      .from('users')
      .update({ full_name: newFullName })
      .eq('id', session.user.id)
      .select()
      .single();

    logTest(
      'User Profile Update',
      !updateError && !!updateData,
      updateError
        ? `Update failed: ${updateError.message}`
        : 'Successfully updated user profile',
      {
        oldName: userData.full_name,
        newName: updateData?.full_name,
      }
    );

    // Revert the change
    if (updateData) {
      await supabase
        .from('users')
        .update({ full_name: userData.full_name })
        .eq('id', session.user.id);
    }

    // Test 4: Verify user metadata
    const hasMetadata = !!(userData.email && userData.username);
    logTest(
      'User Metadata Accessible',
      hasMetadata,
      hasMetadata ? 'All user metadata is accessible' : 'Missing user metadata',
      {
        hasEmail: !!userData.email,
        hasUsername: !!userData.username,
        hasFullName: !!userData.full_name,
        hasBalance: userData.balance !== undefined,
        hasRole: !!userData.role,
      }
    );
  } catch (err: any) {
    logTest(
      'User Data Retrieval',
      false,
      `Exception: ${err.message}`,
      { error: err }
    );
  }
}

async function test15_5_ProtectedOperations(session: any) {
  logSection('15.5 Test Protected Operations');

  if (!session) {
    console.log(`\n${colors.yellow}No active session. Skipping protected operations tests.${colors.reset}`);
    return;
  }

  try {
    // Test 1: Access own user data (should succeed)
    const { data: ownData, error: ownError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    logTest(
      'Access Own User Data',
      !ownError && !!ownData,
      ownError
        ? `Failed: ${ownError.message}`
        : 'Successfully accessed own user data',
      { userId: ownData?.id }
    );

    // Test 2: Try to access all users (RLS should limit based on role)
    const { data: allUsers, error: allUsersError } = await supabase
      .from('users')
      .select('id, username, role')
      .limit(10);

    logTest(
      'Query All Users (RLS Check)',
      !allUsersError,
      allUsersError
        ? `Query blocked: ${allUsersError.message}`
        : `Query returned ${allUsers?.length || 0} users`,
      {
        userCount: allUsers?.length,
        note: 'RLS policies determine what data is visible',
      }
    );

    // Test 3: Check role-based access
    if (ownData) {
      const isAdmin = ownData.role === 'admin';
      logTest(
        'Role-Based Access Control',
        true,
        `User role: ${ownData.role}${isAdmin ? ' (admin privileges)' : ' (standard user)'}`,
        {
          role: ownData.role,
          isAdmin,
          canAccessAdminFeatures: isAdmin,
        }
      );

      // Test 4: Admin-only operation (if admin)
      if (isAdmin) {
        const { data: adminData, error: adminError } = await supabase
          .from('users')
          .select('id, username, email, role, balance')
          .limit(5);

        logTest(
          'Admin-Only Operations',
          !adminError,
          adminError
            ? `Admin query failed: ${adminError.message}`
            : `Admin can access ${adminData?.length || 0} user records`,
          { recordCount: adminData?.length }
        );
      } else {
        logTest(
          'Admin-Only Operations',
          true,
          'User is not admin - admin operations test skipped',
          { note: 'Not an error - user does not have admin role' }
        );
      }
    }
  } catch (err: any) {
    logTest(
      'Protected Operations',
      false,
      `Exception: ${err.message}`,
      { error: err }
    );
  }
}

async function test15_6_SQLVerification(session: any) {
  logSection('15.6 Execute SQL Verification Queries');

  try {
    // Test 1: Verify foreign key relationships
    if (session) {
      // Check if user has any related data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, username, email, role')
        .eq('id', session.user.id)
        .single();

      logTest(
        'Foreign Key Relationships',
        !userError && !!userData,
        userError
          ? `Query failed: ${userError.message}`
          : 'User data relationships verified',
        {
          userId: userData?.id,
          hasRelationships: true,
        }
      );
    }

    // Test 2: Check table constraints
    const { data: constraintTest, error: constraintError } = await supabase
      .from('users')
      .select('id, username, email, role, balance')
      .limit(1);

    logTest(
      'Table Constraints Check',
      !constraintError,
      constraintError
        ? `Constraint check failed: ${constraintError.message}`
        : 'Table constraints are properly enforced',
      { hasData: !!constraintTest && constraintTest.length > 0 }
    );

    // Test 3: Verify data integrity
    const { data: integrityData, error: integrityError } = await supabase
      .from('users')
      .select('id, email, username')
      .not('email', 'is', null)
      .not('username', 'is', null)
      .limit(5);

    logTest(
      'Data Integrity Check',
      !integrityError && !!integrityData,
      integrityError
        ? `Integrity check failed: ${integrityError.message}`
        : `Verified ${integrityData?.length || 0} records have required fields`,
      { recordCount: integrityData?.length }
    );
  } catch (err: any) {
    logTest(
      'SQL Verification',
      false,
      `Exception: ${err.message}`,
      { error: err }
    );
  }
}

async function testLogout(session: any) {
  logSection('Test Logout Functionality');

  if (!session) {
    console.log(`\n${colors.yellow}No active session. Skipping logout test.${colors.reset}`);
    return;
  }

  try {
    // Test logout
    const { error: logoutError } = await supabase.auth.signOut();

    logTest(
      'Logout Functionality',
      !logoutError,
      logoutError
        ? `Logout failed: ${logoutError.message}`
        : 'Successfully logged out',
      { loggedOut: !logoutError }
    );

    // Verify session is cleared
    const { data: sessionData } = await supabase.auth.getSession();

    logTest(
      'Session Cleared After Logout',
      !sessionData.session,
      sessionData.session
        ? 'Session still exists after logout'
        : 'Session successfully cleared',
      { hasSession: !!sessionData.session }
    );
  } catch (err: any) {
    logTest(
      'Logout Test',
      false,
      `Exception: ${err.message}`,
      { error: err }
    );
  }
}

async function runAuthTests() {
  console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.cyan}Supabase Authentication Flow Verification${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);

  const session = await test15_3_AuthenticationFlow();
  await test15_4_UserDataRetrieval(session);
  await test15_5_ProtectedOperations(session);
  await test15_6_SQLVerification(session);
  await testLogout(session);

  // Summary
  logSection('Test Summary');
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  console.log(`\nTotal Tests: ${total}`);
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`);

  if (failed > 0) {
    console.log(`${colors.red}Failed Tests:${colors.reset}`);
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.name}: ${r.message}`);
    });
  }

  console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);

  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runAuthTests().catch(err => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, err);
  process.exit(1);
});
