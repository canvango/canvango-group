/**
 * Script to set user role in Supabase
 * Usage: node scripts/set-user-role.js <email> <role>
 * Example: node scripts/set-user-role.js admin1@gmail.com admin
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setUserRole(email, role) {
  try {
    console.log(`\n🔄 Setting role for ${email} to ${role}...`);

    // Validate role
    const validRoles = ['guest', 'member', 'admin'];
    if (!validRoles.includes(role)) {
      throw new Error(`Invalid role: ${role}. Must be one of: ${validRoles.join(', ')}`);
    }

    // Update user role
    const { data, error } = await supabase
      .from('users')
      .update({ role: role })
      .eq('email', email)
      .select();

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error(`User not found: ${email}`);
    }

    console.log('✅ Success! User role updated:');
    console.log(JSON.stringify(data[0], null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

async function listUsers() {
  try {
    console.log('\n📋 Listing all users...\n');

    const { data, error } = await supabase
      .from('users')
      .select('id, email, username, full_name, role, balance, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('No users found.');
      return;
    }

    console.table(data.map(user => ({
      Email: user.email,
      Username: user.username,
      'Full Name': user.full_name,
      Role: user.role,
      Balance: user.balance,
      'Created At': new Date(user.created_at).toLocaleString()
    })));

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0 || args[0] === 'list') {
  listUsers();
} else if (args.length === 2) {
  const [email, role] = args;
  setUserRole(email, role);
} else {
  console.log(`
Usage:
  node scripts/set-user-role.js list                    - List all users
  node scripts/set-user-role.js <email> <role>          - Set user role

Examples:
  node scripts/set-user-role.js list
  node scripts/set-user-role.js admin1@gmail.com admin
  node scripts/set-user-role.js user@example.com member

Valid roles: guest, member, admin
  `);
  process.exit(1);
}
