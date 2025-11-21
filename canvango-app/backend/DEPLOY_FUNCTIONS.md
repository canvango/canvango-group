# Database Functions Deployment Guide

This guide explains how to deploy the PostgreSQL functions to your Supabase database.

## Prerequisites

- Access to Supabase project dashboard
- Database connection credentials (if using CLI)
- Functions created in `src/database/functions/`

## Deployment Methods

### Method 1: Supabase SQL Editor (Recommended)

This is the easiest method for deploying functions to Supabase.

#### Steps:

1. **Navigate to SQL Editor**
   - Go to your Supabase project dashboard
   - Click on **SQL Editor** in the left sidebar

2. **Create New Query**
   - Click **New Query** button
   - Name it "Deploy Database Functions"

3. **Copy Function SQL**
   - Open `src/database/migrations/008_create_database_functions.sql`
   - Copy the entire contents
   - Paste into the SQL Editor

4. **Execute**
   - Click **Run** or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)
   - Wait for confirmation message

5. **Verify**
   - Check for success message
   - No errors should appear

#### Verification Query:

```sql
-- Check if functions exist
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('update_user_balance', 'increment_tutorial_views');
```

Expected output: 2 rows showing both functions

---

### Method 2: Using Migration Script

If you have a migration system set up:

#### Steps:

1. **Ensure Migration File Exists**
   ```bash
   ls src/database/migrations/008_create_database_functions.sql
   ```

2. **Run Migration**
   ```bash
   npm run migrate
   ```

3. **Verify**
   - Check migration logs for success
   - Verify functions exist in database

---

### Method 3: Direct SQL Execution (Advanced)

If you have direct database access:

#### Using psql:

```bash
# Set your database URL
export DATABASE_URL="postgresql://postgres:[password]@[host]:[port]/postgres"

# Execute the migration
psql $DATABASE_URL -f src/database/migrations/008_create_database_functions.sql
```

#### Using Supabase CLI:

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Push the functions
supabase db push
```

---

## Testing After Deployment

### Test update_user_balance

```sql
-- Get a test user ID
SELECT id, username, balance FROM users LIMIT 1;

-- Test adding funds (replace with actual user ID)
SELECT update_user_balance('your-user-id-here', 100.00);

-- Verify balance increased
SELECT id, username, balance FROM users WHERE id = 'your-user-id-here';

-- Test deducting funds
SELECT update_user_balance('your-user-id-here', -50.00);

-- Verify balance decreased
SELECT id, username, balance FROM users WHERE id = 'your-user-id-here';
```

### Test increment_tutorial_views

```sql
-- Get a test tutorial ID
SELECT id, title, view_count FROM tutorials LIMIT 1;

-- Test incrementing views (replace with actual tutorial ID)
SELECT increment_tutorial_views('your-tutorial-id-here');

-- Verify view count increased
SELECT id, title, view_count FROM tutorials WHERE id = 'your-tutorial-id-here';
```

---

## Troubleshooting

### Error: Function already exists

If you see: `ERROR: function "update_user_balance" already exists`

**Solution**: The migration uses `CREATE OR REPLACE FUNCTION`, so this shouldn't happen. If it does:

```sql
-- Drop and recreate
DROP FUNCTION IF EXISTS update_user_balance(UUID, DECIMAL);
DROP FUNCTION IF EXISTS increment_tutorial_views(UUID);

-- Then run the migration again
```

### Error: Permission denied

If you see: `ERROR: permission denied for schema public`

**Solution**: Ensure you're using the service role key or have proper permissions:

```sql
-- Grant permissions (run as admin)
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO authenticated;
```

### Error: Table does not exist

If you see: `ERROR: relation "users" does not exist`

**Solution**: Ensure all migrations have been run before deploying functions:

```bash
# Run all migrations
npm run migrate
```

### Functions not appearing in Supabase Dashboard

**Solution**: 
1. Refresh the page
2. Check the **Database** > **Functions** section
3. Verify using SQL query:

```sql
\df update_user_balance
\df increment_tutorial_views
```

---

## Rollback

If you need to remove the functions:

```sql
-- Remove functions
DROP FUNCTION IF EXISTS update_user_balance(UUID, DECIMAL);
DROP FUNCTION IF EXISTS increment_tutorial_views(UUID);
```

---

## Next Steps

After deploying the functions:

1. ✅ Verify functions exist in database
2. ✅ Test functions with sample data
3. ✅ Update application code to use RPC calls
4. ✅ Test application endpoints
5. ✅ Monitor function performance
6. ✅ Review logs for any errors

---

## Monitoring

### Check Function Usage

```sql
-- View function execution statistics
SELECT 
  funcname,
  calls,
  total_time,
  self_time,
  avg_time
FROM pg_stat_user_functions
WHERE funcname IN ('update_user_balance', 'increment_tutorial_views')
ORDER BY calls DESC;
```

### Check for Errors

```sql
-- Check PostgreSQL logs for function errors
-- (Available in Supabase Dashboard > Logs)
```

---

## Additional Resources

- [DATABASE_FUNCTIONS.md](./DATABASE_FUNCTIONS.md) - Detailed function documentation
- [Supabase Database Functions](https://supabase.com/docs/guides/database/functions)
- [PostgreSQL PL/pgSQL](https://www.postgresql.org/docs/current/plpgsql.html)
