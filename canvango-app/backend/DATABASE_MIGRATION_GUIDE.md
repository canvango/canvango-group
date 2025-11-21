# Database Migration Guide

## Overview

This guide explains how to run database migrations and seed data for the Canvango backend, supporting both local PostgreSQL and Supabase environments.

## Prerequisites

### For Local PostgreSQL
- PostgreSQL installed and running
- Environment variables configured in `.env`:
  ```env
  DB_HOST=localhost
  DB_PORT=5432
  DB_NAME=canvango_db
  DB_USER=postgres
  DB_PASSWORD=your_password
  ```

### For Supabase
- Supabase project created
- Environment variables configured in `.env`:
  ```env
  # Supabase Configuration
  SUPABASE_URL=https://your-project.supabase.co
  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
  
  # Database Connection (for migrations)
  DB_HOST=db.your-project.supabase.co
  DB_PORT=5432
  DB_NAME=postgres
  DB_USER=postgres
  DB_PASSWORD=your_database_password
  ```

## Running Migrations

### Automatic Detection

The migration script automatically detects whether you're using Supabase or local PostgreSQL based on the `DB_HOST` environment variable.

### Execute Migrations

```bash
cd canvango-app/backend
npm run migrate
```

### What Happens During Migration

1. **Connection**: Connects to the database (local or Supabase)
2. **Tracking Table**: Creates `schema_migrations` table if it doesn't exist
3. **Migration Files**: Reads all `.sql` files from `src/database/migrations/`
4. **Execution**: Runs each migration in order, skipping already-executed ones
5. **Recording**: Records each successful migration in `schema_migrations` table

### Migration Files

Migrations are located in `src/database/migrations/` and are executed in alphabetical order:

- `001_create_users_table.sql` - Users table with roles and balance
- `002_create_transactions_table.sql` - Transaction history
- `003_create_topups_table.sql` - Top-up records
- `004_create_claims_table.sql` - Warranty claims
- `005_create_tutorials_table.sql` - Tutorial content
- `006_create_admin_audit_logs_table.sql` - Admin action logs
- `007_create_system_settings_table.sql` - System configuration
- `008_create_database_functions.sql` - PostgreSQL functions for RPC

### Troubleshooting Migrations

#### Supabase Connection Issues

If you encounter connection errors with Supabase:

1. **Verify Credentials**: Check that `DB_HOST`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD` are correct
2. **Connection Pooler**: Use the connection pooler URL (ends with `.pooler.supabase.com`)
3. **IP Allowlist**: Ensure your IP is allowed in Supabase project settings
4. **SSL**: The migration script automatically enables SSL for Supabase connections

#### Migration Fails Midway

If a migration fails:

1. The transaction is rolled back automatically
2. Fix the issue in the migration file
3. Re-run `npm run migrate`
4. Only failed migrations will be re-executed

## Seeding Data

### Automatic Detection

The seed script automatically detects whether to use Supabase client or PostgreSQL pool based on environment variables.

### Execute Seeding

```bash
cd canvango-app/backend
npm run seed
```

### Seeding Methods

#### With Supabase Client (Recommended for Supabase)

When `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are present:
- Uses Supabase client for data insertion
- Leverages Supabase's type safety
- Each operation is atomic
- Better integration with Supabase features

#### With PostgreSQL Pool (Legacy)

When Supabase credentials are not present:
- Uses direct PostgreSQL connection
- Wraps all operations in a single transaction
- Compatible with local PostgreSQL

### Seed Data Includes

1. **Admin User**
   - Email: `admin@canvango.com`
   - Password: `admin123`
   - Role: `admin`
   - Balance: Rp 10,000

2. **Sample Members** (5 users)
   - Password for all: `password123`
   - Various balances

3. **Sample Transactions** (9 transactions)
   - Different product types
   - Various statuses (BERHASIL, PENDING, GAGAL)

4. **Sample Top-ups** (5 top-ups)
   - Different payment methods
   - Various statuses

5. **Sample Claims** (2 claims)
   - Linked to transactions
   - Different statuses

6. **Sample Tutorials** (6 tutorials)
   - Facebook Ads guides
   - Technical documentation
   - Troubleshooting guides

### Seed Script Behavior

- **Idempotent**: Can be run multiple times
- **Conflict Handling**: Uses `ON CONFLICT` to avoid duplicates
- **Error Handling**: Continues on individual errors, reports at the end

## Database Configuration

### database.ts

The `src/config/database.ts` file provides PostgreSQL connection pooling:

```typescript
import { pool } from './config/database.js';

// Use for migrations and direct SQL queries
const result = await pool.query('SELECT * FROM users');
```

**Features:**
- Automatic SSL detection for Supabase
- Connection pooling (max 20 connections)
- Error handling and logging
- Compatible with both local and Supabase PostgreSQL

### supabase.ts

The `src/config/supabase.ts` file provides Supabase client:

```typescript
import { getSupabaseClient } from './config/supabase.js';

// Use for application queries
const supabase = getSupabaseClient();
const { data, error } = await supabase.from('users').select('*');
```

**Features:**
- Singleton pattern
- Service role key for admin operations
- Type-safe with generated types
- Bypasses Row Level Security (RLS)

## Best Practices

### When to Use Each Method

**Use PostgreSQL Pool (`database.ts`):**
- Running migrations
- Direct SQL queries
- Batch operations
- When you need transaction control

**Use Supabase Client (`supabase.ts`):**
- Application queries (CRUD operations)
- When you need type safety
- When using Supabase features (RLS, real-time)
- RPC function calls

### Migration Strategy

1. **Development**: Run migrations locally first
2. **Testing**: Test migrations on a Supabase branch
3. **Production**: Run migrations on production Supabase project
4. **Backup**: Always backup before running migrations in production

### Seeding Strategy

1. **Development**: Seed with sample data for testing
2. **Staging**: Seed with realistic test data
3. **Production**: Only seed essential data (admin user, system settings)

## Common Commands

```bash
# Run migrations
npm run migrate

# Seed database
npm run seed

# Generate TypeScript types from Supabase
npm run generate-types

# Run migrations and seed (fresh setup)
npm run migrate && npm run seed
```

## Environment Variables Reference

### Required for All Environments

```env
# Database Connection (for migrations)
DB_HOST=localhost or db.your-project.supabase.co
DB_PORT=5432
DB_NAME=canvango_db or postgres
DB_USER=postgres
DB_PASSWORD=your_password
```

### Required for Supabase Integration

```env
# Supabase Client (for application)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Optional

```env
# JWT Configuration (if using custom auth)
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

## Verification

### After Migration

1. Check `schema_migrations` table:
   ```sql
   SELECT * FROM schema_migrations ORDER BY executed_at;
   ```

2. Verify all tables exist:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

3. Check database functions:
   ```sql
   SELECT routine_name FROM information_schema.routines 
   WHERE routine_schema = 'public';
   ```

### After Seeding

1. Check user count:
   ```sql
   SELECT COUNT(*) FROM users;
   ```

2. Verify admin user:
   ```sql
   SELECT * FROM users WHERE role = 'admin';
   ```

3. Check data integrity:
   ```sql
   SELECT 
     (SELECT COUNT(*) FROM users) as users,
     (SELECT COUNT(*) FROM transactions) as transactions,
     (SELECT COUNT(*) FROM topups) as topups,
     (SELECT COUNT(*) FROM claims) as claims,
     (SELECT COUNT(*) FROM tutorials) as tutorials;
   ```

## Rollback

### Rolling Back Migrations

Currently, there's no automated rollback. To rollback:

1. **Manual Rollback**: Write reverse SQL statements
2. **Database Restore**: Restore from backup
3. **Fresh Start**: Drop all tables and re-run migrations

### Example Manual Rollback

```sql
-- Rollback last migration
DELETE FROM schema_migrations WHERE version = '008_create_database_functions';
DROP FUNCTION IF EXISTS update_user_balance;
DROP FUNCTION IF EXISTS increment_tutorial_views;
```

## Support

For issues or questions:
1. Check Supabase Dashboard logs
2. Review migration error messages
3. Verify environment variables
4. Check database connection settings
5. Consult Supabase documentation: https://supabase.com/docs

## Notes

- Migration script uses transactions for safety
- Seed script handles conflicts gracefully
- Both scripts support Supabase and local PostgreSQL
- Database functions are created via migrations
- TypeScript types should be regenerated after schema changes
