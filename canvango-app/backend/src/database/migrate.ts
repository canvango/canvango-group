import { readFileSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pool from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Detect database type based on connection string
 */
function detectDatabaseType(): 'supabase' | 'local' {
  const dbHost = process.env.DB_HOST || '';
  
  if (dbHost.includes('supabase') || dbHost.includes('pooler')) {
    return 'supabase';
  }
  
  return 'local';
}

/**
 * Run database migrations
 * Compatible with both local PostgreSQL and Supabase
 */
async function runMigrations() {
  const client = await pool.connect();
  const dbType = detectDatabaseType();
  
  try {
    console.log('🔄 Running database migrations...');
    console.log(`📊 Database type: ${dbType}`);
    
    if (dbType === 'supabase') {
      console.log('🔗 Connected to Supabase PostgreSQL');
    } else {
      console.log('🔗 Connected to local PostgreSQL');
    }
    
    // Create migrations tracking table
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Get list of migration files
    const migrationsDir = join(__dirname, 'migrations');
    const migrationFiles = readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    console.log(`Found ${migrationFiles.length} migration files`);
    
    // Execute each migration
    for (const file of migrationFiles) {
      const version = file.replace('.sql', '');
      
      // Check if migration already executed
      const result = await client.query(
        'SELECT version FROM schema_migrations WHERE version = $1',
        [version]
      );
      
      if (result.rows.length > 0) {
        console.log(`⏭️  Skipping ${file} (already executed)`);
        continue;
      }
      
      console.log(`▶️  Executing ${file}...`);
      
      const migrationSQL = readFileSync(join(migrationsDir, file), 'utf-8');
      
      await client.query('BEGIN');
      try {
        await client.query(migrationSQL);
        await client.query(
          'INSERT INTO schema_migrations (version) VALUES ($1)',
          [version]
        );
        await client.query('COMMIT');
        console.log(`✅ ${file} executed successfully`);
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`❌ Error executing ${file}:`, error);
        throw error;
      }
    }
    
    console.log('\n✅ All database migrations completed successfully');
    
    if (dbType === 'supabase') {
      console.log('\n💡 Supabase Migration Notes:');
      console.log('   - Migrations executed via direct PostgreSQL connection');
      console.log('   - Database functions are now available for RPC calls');
      console.log('   - You can verify migrations in Supabase Dashboard > Database > Migrations');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    
    if (dbType === 'supabase') {
      console.error('\n🔍 Supabase Troubleshooting:');
      console.error('   - Verify DB_HOST, DB_NAME, DB_USER, DB_PASSWORD are correct');
      console.error('   - Check if connection pooler is enabled (use pooler URL)');
      console.error('   - Ensure your IP is allowed in Supabase project settings');
      console.error('   - For SSL issues, verify SSL is enabled in database.ts config');
    }
    
    process.exit(1);
  } finally {
    client.release();
  }
}

runMigrations();
