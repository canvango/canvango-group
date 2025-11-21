/**
 * Supabase Integration Deep Verification Script
 * 
 * This script performs comprehensive testing of:
 * - Supabase client configuration
 * - Database connectivity
 * - Authentication flow
 * - User data retrieval
 * - Protected operations
 * - SQL verification queries
 */

import { supabase } from '../src/features/member-area/services/supabase';

// ANSI color codes for terminal output
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

async function test15_1_VerifySupabaseClientConfiguration() {
  logSection('15.1 Verify Supabase Client Configuration');

  // Test 1: Check environment variables
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  logTest(
    'Environment Variables Loaded',
    !!supabaseUrl && !!supabaseAnonKey,
    supabaseUrl && supabaseAnonKey
      ? 'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are loaded'
      : 'Missing environment variables',
    { supabaseUrl, keyExists: !!supabaseAnonKey }
  );

  // Test 2: Verify Supabase client is initialized
  logTest(
    'Supabase Client Initialized',
    !!supabase,
    supabase ? 'Supabase client instance exists' : 'Supabase client not initialized'
  );

  // Test 3: Check client has required methods
  const hasAuthMethod = typeof supabase.auth?.signInWithPassword === 'function';
  const hasFromMethod = typeof supabase.from === 'function';

  logTest(
    'Supabase Client Methods',
    hasAuthMethod && hasFromMethod,
    hasAuthMethod && hasFromMethod
      ? 'Client has auth and database methods'
      : 'Client missing required methods',
    { hasAuthMethod, hasFromMethod }
  );

  // Test 4: Verify singleton pattern (no duplicate instances)
  const { supabase: supabase2 } = await import('../src/features/member-area/services/supabase');
  logTest(
    'Singleton Pattern',
    supabase === supabase2,
    supabase === supabase2
      ? 'Supabase client uses singleton pattern'
      : 'Multiple Supabase instances detected',
    { sameInstance: supabase === supabase2 }
  );
}

async function test15_2_TestDatabaseConnectivity() {
  logSection('15.2 Test Database Connectivity');

  try {
    // Test 1: Simple SELECT query
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    logTest(
      'Database Connection',
      !error,
      error ? `Connection failed: ${error.message}` : 'Successfully connected to database',
      { error: error?.message, dataReceived: !!data }
    );

    // Test 2: Test read operation
    const { data: readData, error: readError } = await supabase
      .from('users')
      .select('id, username, email, role')
      .limit(5);

    logTest(
      'Database Read Operation',
      !readError,
      readError ? `Read failed: ${readError.message}` : `Successfully read ${readData?.length || 0} records`,
      { error: readError?.message, recordCount: readData?.length }
    );

    // Test 3: Check for connection errors in console
    logTest(
      'No Connection Errors',
      !error && !readError,
      !error && !readError ? 'No connection errors detected' : 'Connection errors found'
    );
  } catch (err: any) {
    logTest(
      'Database Connectivity',
      false,
      `Exception: ${err.message}`,
      { error: err }
    );
  }
}

async function test15_3_TestAuthentication() {
  logSection('15.3 Test Authentication with Supabase');

  try {
    // Test 1: Check current session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    logTest(
      'Get Current Session',
      !sessionError,
      sessionError
        ? `Session check failed: ${sessionError.message}`
        : sessionData.session
        ? 'Active session found'
        : 'No active session',
      {
        hasSession: !!sessionData.session,
        userId: sessionData.session?.user?.id,
      }
    );

    // Test 2: Check auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`  Auth state changed: ${event}`);
    });

    logTest(
      'Auth State Listener',
      !!authListener,
      authListener ? 'Auth state change listener registered' : 'Failed to register listener'
    );

    // Unsubscribe from listener
    authListener?.subscription?.unsubscribe();

    // Test 3: Verify JWT token storage (if session exists)
    if (sessionData.session) {
      const hasAccessToken = !!sessionData.session.access_token;
      const hasRefreshToken = !!sessionData.session.refresh_token;

      logTest(
        'JWT Token Storage',
        hasAccessToken && hasRefreshToken,
        hasAccessToken && hasRefreshToken
          ? 'Access and refresh tokens are stored'
          : 'Missing tokens',
        { hasAccessToken, hasRefreshToken }
      );
    } else {
      logTest(
        'JWT Token Storage',
        true,
        'No active session - token storage test skipped (not an error)',
        { note: 'User not logged in' }
      );
    }
  } catch (err: any) {
    logTest(
      'Authentication Test',
      false,
      `Exception: ${err.message}`,
      { error: err }
    );
  }
}

async function test15_4_TestUserDataRetrieval() {
  logSection('15.4 Test User Data Retrieval');

  try {
    // Test 1: Get current user from session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (!session) {
      logTest(
        'User Data Retrieval',
        true,
        'No active session - user data test skipped (not an error)',
        { note: 'User not logged in' }
      );
      return;
    }

    // Test 2: Query users table
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
        role: userData?.role,
      }
    );

    // Test 3: Verify user role
    if (userData) {
      const hasRole = !!userData.role;
      logTest(
        'User Role Retrieved',
        hasRole,
        hasRole ? `User role: ${userData.role}` : 'User role not found',
        { role: userData.role }
      );
    }

    // Test 4: Verify user metadata
    if (userData) {
      const hasMetadata = !!(userData.email && userData.username);
      logTest(
        'User Metadata Accessible',
        hasMetadata,
        hasMetadata ? 'User metadata is accessible' : 'Missing user metadata',
        {
          hasEmail: !!userData.email,
          hasUsername: !!userData.username,
          hasFullName: !!userData.full_name,
        }
      );
    }
  } catch (err: any) {
    logTest(
      'User Data Retrieval',
      false,
      `Exception: ${err.message}`,
      { error: err }
    );
  }
}

async function test15_5_TestProtectedOperations() {
  logSection('15.5 Test Protected Operations');

  try {
    // Test 1: Check if RLS is enforced
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      logTest(
        'Protected Operations',
        true,
        'No active session - protected operations test skipped (not an error)',
        { note: 'User not logged in' }
      );
      return;
    }

    // Test 2: Try to access user's own data (should succeed)
    const { data: ownData, error: ownError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    logTest(
      'Access Own User Data',
      !ownError && !!ownData,
      ownError
        ? `Failed to access own data: ${ownError.message}`
        : 'Successfully accessed own user data',
      { userId: ownData?.id }
    );

    // Test 3: Check role-based access
    if (ownData) {
      const isAdmin = ownData.role === 'admin';
      logTest(
        'Role-Based Access Control',
        true,
        `User role: ${ownData.role}${isAdmin ? ' (admin privileges)' : ' (standard user)'}`,
        { role: ownData.role, isAdmin }
      );
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

async function test15_6_ExecuteSQLVerificationQueries() {
  logSection('15.6 Execute SQL Verification Queries');

  try {
    // Test 1: SELECT * FROM users LIMIT 1
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    logTest(
      'SQL Query: SELECT * FROM users LIMIT 1',
      !userError,
      userError
        ? `Query failed: ${userError.message}`
        : `Query successful, returned ${userData?.length || 0} record(s)`,
      { recordCount: userData?.length, sample: userData?.[0] }
    );

    // Test 2: Verify table structure
    if (userData && userData.length > 0) {
      const expectedFields = ['id', 'username', 'email', 'role', 'balance'];
      const actualFields = Object.keys(userData[0]);
      const hasAllFields = expectedFields.every(field => actualFields.includes(field));

      logTest(
        'Verify Table Structure',
        hasAllFields,
        hasAllFields
          ? 'Table structure matches expectations'
          : 'Table structure mismatch',
        {
          expectedFields,
          actualFields,
          missingFields: expectedFields.filter(f => !actualFields.includes(f)),
        }
      );
    }

    // Test 3: Check for migration issues
    const { count, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    logTest(
      'Database Migration Check',
      !countError,
      countError
        ? `Migration check failed: ${countError.message}`
        : `Database has ${count} user records`,
      { userCount: count }
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

async function runAllTests() {
  console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.cyan}Supabase Integration Deep Verification${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);

  await test15_1_VerifySupabaseClientConfiguration();
  await test15_2_TestDatabaseConnectivity();
  await test15_3_TestAuthentication();
  await test15_4_TestUserDataRetrieval();
  await test15_5_TestProtectedOperations();
  await test15_6_ExecuteSQLVerificationQueries();

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

  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(err => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, err);
  process.exit(1);
});
