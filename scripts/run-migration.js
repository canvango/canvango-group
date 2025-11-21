/**
 * Script untuk run migration ke Supabase
 * 
 * Usage:
 * node scripts/run-migration.js
 * 
 * Requirements:
 * - Set environment variables di .env:
 *   SUPABASE_URL=https://xxxxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  console.log('🚀 Starting migration...\n');

  // Check environment variables
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Error: Missing environment variables');
    console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env file\n');
    console.error('Example:');
    console.error('SUPABASE_URL=https://xxxxx.supabase.co');
    console.error('SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
    process.exit(1);
  }

  // Initialize Supabase client with service role key
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Read migration file
  const migrationPath = join(__dirname, '../supabase/migrations/001_role_management_setup.sql');
  let migrationSQL;
  
  try {
    migrationSQL = readFileSync(migrationPath, 'utf8');
    console.log('✅ Migration file loaded');
  } catch (error) {
    console.error('❌ Error reading migration file:', error.message);
    process.exit(1);
  }

  // Run migration
  console.log('📝 Running migration...\n');
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      // Try alternative method - split and execute statements
      console.log('⚠️  RPC method failed, trying direct execution...\n');
      
      // Split SQL into individual statements
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i] + ';';
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        
        const { error: stmtError } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (stmtError) {
          console.error(`❌ Error in statement ${i + 1}:`, stmtError.message);
          throw stmtError;
        }
      }
    }

    console.log('\n✅ Migration completed successfully!\n');
    
    // Verify tables created
    console.log('🔍 Verifying tables...');
    const { data: tables, error: tablesError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(0);

    if (!tablesError) {
      console.log('✅ user_profiles table exists');
    }

    const { data: auditTables, error: auditError } = await supabase
      .from('role_audit_logs')
      .select('*')
      .limit(0);

    if (!auditError) {
      console.log('✅ role_audit_logs table exists');
    }

    console.log('\n🎉 Migration setup complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Set initial admin user:');
    console.log('   UPDATE user_profiles SET role = \'admin\' WHERE user_id = \'<USER_ID>\';');
    console.log('2. Test the role management system');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nPlease run the migration manually via Supabase Dashboard:');
    console.error('1. Go to https://app.supabase.com');
    console.error('2. Select your project');
    console.error('3. Go to SQL Editor');
    console.error('4. Copy content from: supabase/migrations/001_role_management_setup.sql');
    console.error('5. Paste and run');
    process.exit(1);
  }
}

runMigration();
