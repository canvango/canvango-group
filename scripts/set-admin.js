/**
 * Script untuk set user sebagai admin
 * Usage: node scripts/set-admin.js <user_id>
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const userId = process.argv[2] || 'b5a92c06-c176-4a04-b2c1-f389ab07548e';

async function setAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  console.log(`🔄 Updating user ${userId} to admin...`);

  const { data, error } = await supabase
    .from('user_profiles')
    .update({ role: 'admin' })
    .eq('user_id', userId)
    .select();

  if (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }

  console.log('✅ Success! User is now admin:');
  console.log(data);
}

setAdmin();
