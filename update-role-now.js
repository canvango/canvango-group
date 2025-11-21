/**
 * Quick script to update user role to admin
 * Run: node update-role-now.js
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gpittnsfzgkdbqnccncn.supabase.co';
const USER_ID = 'b5a92c06-c176-4a04-b2c1-f389ab07548e';

// Service Role Key from Supabase Dashboard
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwaXR0bnNmemdrZGJxbmNjbmNuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzEwMTczMiwiZXhwIjoyMDc4Njc3NzMyfQ.9HFJDAoSEB8o82Q23mKyG9XgEmsjKDIfkpVpJUDuO0U';

async function updateRole() {
  console.log('🚀 Connecting to Supabase...\n');

  if (SERVICE_ROLE_KEY === 'PASTE_YOUR_SERVICE_ROLE_KEY_HERE') {
    console.error('❌ Error: Please paste your Service Role Key in this file first!');
    console.error('\nHow to get Service Role Key:');
    console.error('1. Go to https://supabase.com/dashboard/project/gpittnsfzgkdbqnccncn/settings/api');
    console.error('2. Scroll to "Project API keys"');
    console.error('3. Copy the "service_role" key');
    console.error('4. Paste it in this file (line 11)\n');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log('📝 Updating user role to admin...');
  console.log(`User ID: ${USER_ID}\n`);

  try {
    // Update role
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ role: 'admin' })
      .eq('user_id', USER_ID)
      .select();

    if (error) {
      console.error('❌ Error updating role:', error.message);
      console.error('Details:', error);
      process.exit(1);
    }

    console.log('✅ SUCCESS! Role updated to admin\n');
    console.log('Updated profile:');
    console.log(JSON.stringify(data, null, 2));

    // Verify
    console.log('\n🔍 Verifying...');
    const { data: verify, error: verifyError } = await supabase
      .from('user_profiles')
      .select('user_id, role, updated_at')
      .eq('user_id', USER_ID)
      .single();

    if (verifyError) {
      console.error('❌ Error verifying:', verifyError.message);
    } else {
      console.log('✅ Verified:');
      console.log(`   Role: ${verify.role}`);
      console.log(`   Updated: ${verify.updated_at}`);
    }

    console.log('\n🎉 Done! User is now an admin.');

  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
    process.exit(1);
  }
}

updateRole();
