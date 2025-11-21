import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

/**
 * Database connection pool for migrations only
 * 
 * NOTE: This pool is ONLY used for running database migrations.
 * All application code should use the Supabase client from '../config/supabase.ts'
 * 
 * @deprecated Use getSupabaseClient() from '../config/supabase.ts' for all database operations
 */
export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'canvango_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ssl: process.env.DB_HOST?.includes('supabase') || process.env.DB_HOST?.includes('pooler') ? {
    rejectUnauthorized: false
  } : false,
});

pool.on('connect', () => {
  console.log('✅ Database connected successfully (migration pool)');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
  process.exit(-1);
});

/**
 * @deprecated Use Supabase client for queries
 */
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('Executed query', { text, duration, rows: res.rowCount });
  return res;
};

export default pool;
