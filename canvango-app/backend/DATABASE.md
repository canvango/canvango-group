# Database Setup Guide

This document explains how to set up and manage the database for the Canvango Group application using Supabase.

## Prerequisites

- Node.js 18 or higher
- Supabase account ([Sign up](https://supabase.com))
- Supabase project created
- Database credentials configured in `.env` file

## Environment Variables

Make sure your `.env` file contains the following Supabase and database configuration:

```env
# Supabase Configuration (for runtime operations)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database Configuration (for migrations only)
DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_database_password
```

**Important Notes:**
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are used for all runtime database operations
- Database credentials (`DB_*`) are only used for running migrations
- Never expose the service role key in frontend code or public repositories

## Database Setup

### 1. Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Fill in project details and wait for setup to complete
4. Get your credentials from **Project Settings** > **API**

### 2. Configure Connection String

Get your database connection details from **Project Settings** > **Database**:
- Host: `db.xxxxx.supabase.co`
- Database name: `postgres`
- Port: `5432`
- User: `postgres`
- Password: Your database password (set during project creation)

### 3. Run Migrations

Migrations will create all necessary tables and indexes:

```bash
npm run migrate
```

This will execute all migration files in order against your Supabase database:
- `001_create_users_table.sql` - Users table with authentication
- `002_create_transactions_table.sql` - Transactions tracking
- `003_create_topups_table.sql` - Top-up requests
- `004_create_claims_table.sql` - Warranty claims
- `005_create_tutorials_table.sql` - Tutorial content
- `006_create_admin_audit_logs_table.sql` - Admin action logging
- `007_create_system_settings_table.sql` - System configuration
- `008_create_database_functions.sql` - RPC functions for atomic operations

The migration system tracks which migrations have been executed, so running it multiple times is safe.

**Note:** Migrations connect directly to PostgreSQL using the connection string. All other operations use the Supabase client.

### 4. Generate TypeScript Types

Generate type-safe database types from your Supabase schema:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.types.ts
```

Replace `YOUR_PROJECT_ID` with your Supabase project ID (found in Project Settings).

**Important:** Run this command whenever you make schema changes to keep types in sync.

### 5. Seed Database

Populate the database with sample data:

```bash
npm run seed
```

This will create:
- **1 Admin user**: admin@canvango.com / Admin123!
- **5 Member users**: All with password `Member123!`
  - john.doe@example.com
  - jane.smith@example.com
  - bob.wilson@example.com
  - alice.johnson@example.com
  - charlie.brown@example.com
- **9 Sample transactions** with various statuses
- **5 Sample top-ups** with different payment methods
- **2 Sample claims** (pending and approved)
- **6 Sample tutorials** covering various topics

**Note:** The seed script uses Supabase client for data insertion.

## Migration System

### How It Works

1. Migrations are stored in `src/database/migrations/`
2. Each migration file is named with a version prefix (e.g., `001_`, `002_`)
3. The system tracks executed migrations in the `schema_migrations` table
4. Migrations are executed in alphabetical order
5. Each migration runs in a transaction (all-or-nothing)

### Creating New Migrations

To create a new migration:

1. Create a new SQL file in `src/database/migrations/`
2. Name it with the next version number: `00X_description.sql`
3. Write your SQL statements
4. Run `npm run migrate`

Example:

```sql
-- Migration: Add email verification
-- Version: 008
-- Description: Add email verification fields to users table

ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN verification_token VARCHAR(255);
CREATE INDEX idx_users_verification_token ON users(verification_token);
```

## Database Schema

### Users Table
- Stores user accounts (Guest, Member, Admin)
- Uses Supabase Auth user IDs as primary keys
- Includes balance information
- Tracks login history

### Transactions Table
- Records all product purchases
- Links to users via foreign key
- Tracks status (BERHASIL, PENDING, GAGAL)
- Accessed via Supabase client

### TopUps Table
- Stores balance top-up requests
- Multiple payment methods supported
- Status tracking
- Accessed via Supabase client

### Claims Table
- Warranty/guarantee claims
- Links to transactions
- Admin response tracking
- Accessed via Supabase client

### Tutorials Table
- Educational content for members
- Categorized and tagged
- View count tracking with RPC function
- Accessed via Supabase client

### Admin Audit Logs Table
- Tracks all admin actions
- Stores changes as JSONB
- IP and user agent logging
- Accessed via Supabase client

### System Settings Table
- Application configuration
- JSONB values for flexibility
- Default settings included
- Accessed via Supabase client

## Database Functions (RPC)

The application uses PostgreSQL functions for atomic operations. These can be called via Supabase RPC.

### update_user_balance

Atomically updates user balance with validation:

```sql
-- Function signature
update_user_balance(user_id UUID, amount_change DECIMAL)

-- Usage via Supabase client
const { data, error } = await supabase.rpc('update_user_balance', {
  user_id: '123e4567-e89b-12d3-a456-426614174000',
  amount_change: 100.00
});
```

**Features:**
- Atomic balance update
- Prevents negative balance
- Throws error if user not found
- Updates `updated_at` timestamp

### increment_tutorial_views

Atomically increments tutorial view count:

```sql
-- Function signature
increment_tutorial_views(tutorial_id UUID)

-- Usage via Supabase client
const { data, error } = await supabase.rpc('increment_tutorial_views', {
  tutorial_id: '123e4567-e89b-12d3-a456-426614174000'
});
```

**Features:**
- Atomic view count increment
- Throws error if tutorial not found
- Updates `updated_at` timestamp

For more details, see [DATABASE_FUNCTIONS.md](./DATABASE_FUNCTIONS.md)

## Useful Commands

### Reset Database

To completely reset your Supabase database:

**Option 1: Via Supabase Dashboard**
1. Go to **Database** > **Tables**
2. Delete all tables manually
3. Run migrations: `npm run migrate`
4. Run seed: `npm run seed`

**Option 2: Via SQL Editor**
1. Go to **SQL Editor** in Supabase Dashboard
2. Run:
   ```sql
   DROP SCHEMA public CASCADE;
   CREATE SCHEMA public;
   GRANT ALL ON SCHEMA public TO postgres;
   GRANT ALL ON SCHEMA public TO public;
   ```
3. Run migrations: `npm run migrate`
4. Run seed: `npm run seed`

### Check Migration Status

Connect to your Supabase database:

```bash
psql "postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres"

# List executed migrations
SELECT * FROM schema_migrations ORDER BY executed_at;

# Exit
\q
```

Or use the SQL Editor in Supabase Dashboard.

### Backup Database

**Via Supabase Dashboard:**
1. Go to **Database** > **Backups**
2. Click "Create backup"
3. Download when ready

**Via Command Line:**
```bash
pg_dump "postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres" > backup.sql
```

### Restore Database

**Via Command Line:**
```bash
psql "postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres" < backup.sql
```

### Query Database via Supabase Client

In your application code:

```typescript
import { getSupabaseClient } from './config/supabase';

const supabase = getSupabaseClient();

// Select data
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('role', 'admin');

// Insert data
const { data, error } = await supabase
  .from('users')
  .insert({ username: 'newuser', email: 'user@example.com' });

// Update data
const { data, error } = await supabase
  .from('users')
  .update({ balance: 100 })
  .eq('id', userId);

// Delete data
const { data, error } = await supabase
  .from('users')
  .delete()
  .eq('id', userId);

// Call RPC function
const { data, error } = await supabase.rpc('update_user_balance', {
  user_id: userId,
  amount_change: 50
});
```

## Troubleshooting

### Supabase Connection Issues

**Backend can't connect to Supabase:**
1. Verify `SUPABASE_URL` is correct (should be `https://xxxxx.supabase.co`)
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is correct (not anon key)
3. Check if Supabase project is active (not paused)
4. Check network connectivity
5. Review Supabase project logs in Dashboard

**Common errors:**
- `Invalid API key`: Using wrong key (anon instead of service_role)
- `Project not found`: Wrong project URL
- `Connection timeout`: Network or firewall issues

### Migration Failures

If a migration fails:
1. Check the error message in console
2. Review the SQL in the migration file
3. Test SQL in Supabase SQL Editor first
4. Manually rollback if needed:
   ```sql
   DELETE FROM schema_migrations WHERE version = '00X_migration_name';
   ```
5. Fix the migration file
6. Run migrations again: `npm run migrate`

**Common issues:**
- Table already exists: Drop table or skip migration
- Foreign key constraint: Ensure referenced tables exist
- Syntax error: Test SQL in SQL Editor

### Seed Failures

If seeding fails:
1. Ensure migrations have been run first
2. Check Supabase client is properly configured
3. Verify service role key has proper permissions
4. Check for duplicate data
5. Clear existing data if needed via SQL Editor:
   ```sql
   TRUNCATE users, transactions, topups, claims, tutorials, admin_audit_logs, system_settings CASCADE;
   ```

### Type Generation Issues

If type generation fails:
1. Install Supabase CLI: `npm install -g supabase`
2. Login to Supabase: `supabase login`
3. Verify project ID is correct
4. Check network connectivity
5. Try with full command:
   ```bash
   npx supabase gen types typescript --project-id YOUR_PROJECT_ID --schema public > src/types/database.types.ts
   ```

### RPC Function Errors

If RPC functions fail:
1. Verify function exists in database (check SQL Editor)
2. Check function parameters match
3. Review function logs in Supabase Dashboard
4. Test function directly in SQL Editor:
   ```sql
   SELECT update_user_balance('user-id-here', 100.00);
   ```

### Performance Issues

If queries are slow:
1. Check indexes exist (review migration files)
2. Use `.select()` with specific columns instead of `*`
3. Add pagination with `.range()` or `.limit()`
4. Review query in Supabase Dashboard > Database > Query Performance
5. Consider adding indexes for frequently queried columns

## Production Considerations

### Before Deploying

1. **Backup**: Always backup production database before migrations
2. **Test**: Test migrations on staging/development branch first
3. **Downtime**: Plan for potential downtime during migrations
4. **Rollback Plan**: Have a rollback strategy ready
5. **Environment Variables**: Ensure production credentials are set correctly

### Security

1. **Never expose service role key** in frontend or public repositories
2. Use strong database passwords
3. Enable Row Level Security (RLS) policies where appropriate
4. Regularly rotate API keys
5. Monitor audit logs for suspicious activity
6. Use environment variables for all credentials
7. Enable 2FA on Supabase account

### Supabase-Specific Security

**Row Level Security (RLS):**
While the backend uses service role key (bypasses RLS), consider implementing RLS for:
- Direct client access (if needed in future)
- Additional security layer
- Compliance requirements

Example RLS policy:
```sql
-- Users can only view their own data
CREATE POLICY "Users can view own data"
ON users FOR SELECT
USING (auth.uid() = id);
```

**API Key Management:**
- Rotate service role key periodically
- Use different keys for staging and production
- Monitor API usage in Supabase Dashboard

### Performance

1. **Indexes**: Ensure proper indexes exist (check migration files)
2. **Query Optimization**: Use specific column selection, not `SELECT *`
3. **Pagination**: Always use `.limit()` and `.range()` for large datasets
4. **Caching**: Implement caching for frequently accessed data
5. **Connection Pooling**: Supabase handles this automatically
6. **Monitor**: Use Supabase Dashboard to monitor query performance

### Monitoring

1. **Supabase Dashboard**: Monitor database usage, API calls, and errors
2. **Logs**: Review logs regularly in Dashboard > Logs
3. **Alerts**: Set up alerts for high usage or errors
4. **Backups**: Enable automatic backups in Supabase
5. **Audit Logs**: Review admin_audit_logs table regularly

### Scaling

Supabase automatically handles:
- Connection pooling
- Load balancing
- Automatic backups
- SSL/TLS encryption

For high-traffic applications:
1. Consider upgrading Supabase plan
2. Implement caching layer (Redis)
3. Use read replicas if available
4. Optimize queries and indexes

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Best Practices](https://supabase.com/docs/guides/database/overview)
