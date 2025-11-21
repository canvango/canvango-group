# Supabase Migration Guide

This guide provides step-by-step instructions for migrating the Canvango Group application from direct PostgreSQL connection to Supabase integration.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Migration Steps](#migration-steps)
- [Verification](#verification)
- [Rollback Instructions](#rollback-instructions)
- [Troubleshooting](#troubleshooting)
- [Post-Migration Tasks](#post-migration-tasks)

## Overview

This migration involves:
1. Setting up Supabase project and configuration
2. Updating backend to use Supabase client instead of direct PostgreSQL connection
3. Removing duplicate authentication logic
4. Refactoring all data models to use Supabase client
5. Creating database functions for atomic operations
6. Updating tests and documentation

**Estimated Time:** 2-4 hours

**Downtime Required:** Minimal (can be done with rolling deployment)

## Prerequisites

Before starting the migration:

- [ ] Supabase account created
- [ ] Supabase project created and ready
- [ ] Backup of current database
- [ ] All tests passing on current codebase
- [ ] Development environment ready
- [ ] Team notified of migration

### Create Database Backup

```bash
# Backup current database
pg_dump -U postgres canvango_db > backup_before_supabase_$(date +%Y%m%d_%H%M%S).sql

# Verify backup
ls -lh backup_before_supabase_*.sql
```

## Migration Steps

### Step 1: Setup Supabase Project

#### 1.1 Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Fill in project details:
   - **Name:** canvango-app
   - **Database Password:** Choose a strong password (save it securely!)
   - **Region:** Select closest to your users
4. Click "Create new project"
5. Wait 2-3 minutes for setup to complete

#### 1.2 Get Supabase Credentials

1. Go to **Project Settings** (gear icon)
2. Navigate to **API** section
3. Copy these credentials:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon public key:** For frontend
   - **service_role key:** For backend

#### 1.3 Get Database Connection Details

1. Go to **Project Settings** > **Database**
2. Copy connection details:
   - **Host:** `db.xxxxx.supabase.co`
   - **Database name:** `postgres`
   - **Port:** `5432`
   - **User:** `postgres`
   - **Password:** Your database password

### Step 2: Update Environment Variables

#### 2.1 Backend Environment Variables

Update `backend/.env`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Supabase Configuration (NEW)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database Configuration (for migrations only)
DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_database_password

# JWT Configuration (legacy - can be removed later)
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=5
```

#### 2.2 Frontend Environment Variables

Update `frontend/.env`:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# Supabase Configuration (NEW)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App Configuration
VITE_APP_NAME=Canvango Group
VITE_APP_VERSION=1.0.0
```

### Step 3: Install Dependencies

```bash
cd backend
npm install @supabase/supabase-js

cd ../frontend
npm install @supabase/supabase-js
```

### Step 4: Run Database Migrations

Run migrations against Supabase database:

```bash
cd backend
npm run migrate
```

This will create all tables and database functions in Supabase.

**Verify migrations:**
1. Go to Supabase Dashboard > **Database** > **Tables**
2. Confirm all tables exist:
   - users
   - transactions
   - topups
   - claims
   - tutorials
   - admin_audit_logs
   - system_settings
   - schema_migrations

### Step 5: Generate TypeScript Types

Generate type-safe database types:

```bash
cd backend
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.types.ts
```

Replace `YOUR_PROJECT_ID` with your Supabase project ID.

### Step 6: Create Supabase Client Configuration

This file should already exist if you've completed the implementation tasks. Verify it exists:

```bash
ls -l backend/src/config/supabase.ts
```

If not, create it:

```typescript
// backend/src/config/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

let supabaseClient: SupabaseClient<Database> | null = null;

export function getSupabaseClient(): SupabaseClient<Database> {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase credentials');
  }

  supabaseClient = createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  return supabaseClient;
}

export default getSupabaseClient;
```

### Step 7: Update Authentication Middleware

The authentication middleware should already be updated. Verify:

```bash
cat backend/src/middleware/auth.middleware.ts | grep "supabase.auth.getUser"
```

Key changes:
- Uses `supabase.auth.getUser(token)` instead of custom JWT verification
- Extracts user info from Supabase auth user
- Fetches role from database

### Step 8: Remove Duplicate Auth Routes

Verify these files have been removed:

```bash
# These should not exist
ls backend/src/controllers/auth.controller.ts 2>/dev/null && echo "ERROR: auth.controller.ts still exists"
ls backend/src/routes/auth.routes.ts 2>/dev/null && echo "ERROR: auth.routes.ts still exists"
```

Verify auth routes removed from `backend/src/index.ts`:

```bash
cat backend/src/index.ts | grep "auth.routes" && echo "ERROR: auth routes still imported"
```

### Step 9: Verify Model Updates

All models should now use Supabase client. Verify:

```bash
cd backend/src/models
grep -l "getSupabaseClient" *.ts
```

Should list all model files:
- User.model.ts
- Transaction.model.ts
- Claim.model.ts
- Tutorial.model.ts
- TopUp.model.ts
- SystemSettings.model.ts
- AdminAuditLog.model.ts

### Step 10: Seed Database

Populate Supabase database with initial data:

```bash
cd backend
npm run seed
```

This creates:
- Admin user
- Sample member users
- Sample transactions, top-ups, claims, tutorials

### Step 11: Run Tests

Run all tests to verify migration:

```bash
cd backend
npm test

cd ../frontend
npm test
```

All tests should pass.

### Step 12: Start Application

Start both backend and frontend:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Verification

### Verify Backend Connection

1. Check backend logs for successful Supabase connection
2. No errors about missing environment variables
3. Server starts successfully on port 5000

### Verify Authentication

1. Go to `http://localhost:5173`
2. Register a new user
3. Verify user created in Supabase Dashboard > **Authentication** > **Users**
4. Login with the new user
5. Verify JWT token in browser DevTools > Application > Local Storage

### Verify Database Operations

Test each feature:

- [ ] User registration and login
- [ ] View dashboard
- [ ] Create transaction
- [ ] View transaction history
- [ ] Submit top-up request
- [ ] Submit claim
- [ ] View tutorials
- [ ] Admin: User management
- [ ] Admin: Transaction management
- [ ] Admin: Claim management
- [ ] Admin: Tutorial management
- [ ] Admin: System settings

### Verify Database Functions

Test RPC functions:

```bash
# Connect to Supabase database
psql "postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres"

# Test update_user_balance
SELECT update_user_balance('user-id-here', 100.00);

# Test increment_tutorial_views
SELECT increment_tutorial_views('tutorial-id-here');

# Exit
\q
```

## Rollback Instructions

If you need to rollback the migration:

### Option 1: Rollback Code Only

If Supabase setup is fine but code has issues:

```bash
# Revert to previous commit
git log --oneline  # Find commit before migration
git revert <commit-hash>

# Or reset to previous commit (WARNING: loses changes)
git reset --hard <commit-hash>

# Restore environment variables
cp .env.backup .env
```

### Option 2: Full Rollback

If you need to go back to direct PostgreSQL:

1. **Restore Database Backup:**
   ```bash
   # Drop current database
   psql -U postgres -c "DROP DATABASE IF EXISTS canvango_db;"
   psql -U postgres -c "CREATE DATABASE canvango_db;"
   
   # Restore backup
   psql -U postgres canvango_db < backup_before_supabase_*.sql
   ```

2. **Revert Code:**
   ```bash
   git revert <migration-commit-hash>
   ```

3. **Restore Environment Variables:**
   ```bash
   # Backend .env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=canvango_db
   DB_USER=postgres
   DB_PASSWORD=your_password
   
   # Remove Supabase variables
   # SUPABASE_URL=...
   # SUPABASE_SERVICE_ROLE_KEY=...
   ```

4. **Restart Application:**
   ```bash
   cd backend && npm run dev
   cd frontend && npm run dev
   ```

### Option 3: Partial Rollback

Keep Supabase but revert specific changes:

```bash
# Revert specific file
git checkout <previous-commit> -- path/to/file

# Or manually edit files to restore previous logic
```

## Troubleshooting

### Issue: Backend Can't Connect to Supabase

**Symptoms:**
- Error: "Missing Supabase credentials"
- Error: "Invalid API key"

**Solutions:**
1. Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env`
2. Ensure using service_role key (not anon key) in backend
3. Check Supabase project is active (not paused)
4. Restart backend server after changing `.env`

### Issue: Authentication Not Working

**Symptoms:**
- Users can't login
- Error: "Invalid or expired token"

**Solutions:**
1. Verify frontend uses correct Supabase credentials
2. Check Email provider is enabled in Supabase Dashboard
3. Clear browser cache and local storage
4. Verify auth middleware is using `supabase.auth.getUser()`

### Issue: Database Operations Failing

**Symptoms:**
- Error: "relation does not exist"
- Error: "permission denied"

**Solutions:**
1. Verify migrations ran successfully
2. Check tables exist in Supabase Dashboard
3. Verify service_role key has proper permissions
4. Check Supabase client is properly initialized

### Issue: RPC Functions Not Found

**Symptoms:**
- Error: "function does not exist"

**Solutions:**
1. Verify migration `008_create_database_functions.sql` ran
2. Check functions exist in Supabase Dashboard > Database > Functions
3. Manually create functions via SQL Editor if needed
4. Verify function names match in code

### Issue: Type Errors

**Symptoms:**
- TypeScript errors about database types
- Error: "Property does not exist on type"

**Solutions:**
1. Regenerate types: `npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.types.ts`
2. Restart TypeScript server in IDE
3. Check types file exists and is not empty
4. Verify import paths are correct

### Issue: Tests Failing

**Symptoms:**
- Tests fail after migration
- Mock errors

**Solutions:**
1. Update test mocks to use Supabase client
2. Verify test environment variables are set
3. Check test database is properly configured
4. Review test files for hardcoded PostgreSQL references

## Post-Migration Tasks

### Immediate Tasks

- [ ] Monitor application logs for errors
- [ ] Test all critical user flows
- [ ] Verify data integrity
- [ ] Check performance metrics
- [ ] Update team documentation

### Short-term Tasks (1-7 days)

- [ ] Monitor Supabase usage in Dashboard
- [ ] Review and optimize slow queries
- [ ] Set up Supabase alerts
- [ ] Enable automatic backups
- [ ] Review security settings

### Long-term Tasks (1-4 weeks)

- [ ] Implement Row Level Security policies
- [ ] Add caching layer if needed
- [ ] Optimize database indexes
- [ ] Review and update documentation
- [ ] Train team on Supabase features

### Cleanup Tasks

Once migration is stable (after 1-2 weeks):

- [ ] Remove old PostgreSQL connection code
- [ ] Remove JWT utility files (if not used)
- [ ] Remove old auth controller tests
- [ ] Update CI/CD pipelines
- [ ] Archive old database backups

### Optional Enhancements

Consider these Supabase features:

- **Real-time Subscriptions:** Listen to database changes
- **Storage:** File uploads and management
- **Edge Functions:** Serverless functions
- **Row Level Security:** Fine-grained access control
- **Database Webhooks:** Trigger external services

## Best Practices

### Security

1. **Never commit credentials** to version control
2. **Rotate keys regularly** (every 3-6 months)
3. **Use different keys** for staging and production
4. **Enable 2FA** on Supabase account
5. **Monitor audit logs** regularly

### Performance

1. **Use specific column selection** instead of `SELECT *`
2. **Implement pagination** for large datasets
3. **Add indexes** for frequently queried columns
4. **Cache frequently accessed data**
5. **Monitor query performance** in Dashboard

### Monitoring

1. **Set up alerts** for high usage or errors
2. **Review logs daily** during first week
3. **Monitor API usage** to avoid rate limits
4. **Track database size** and plan for scaling
5. **Review slow queries** and optimize

### Development

1. **Use type-safe queries** with generated types
2. **Test locally** before deploying
3. **Use staging environment** for testing
4. **Keep types in sync** with schema changes
5. **Document custom RPC functions**

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Functions](https://supabase.com/docs/guides/database/functions)
- [Supabase CLI](https://supabase.com/docs/guides/cli)

## Support

If you encounter issues during migration:

1. Check this guide's troubleshooting section
2. Review Supabase documentation
3. Check Supabase Discord community
4. Contact team lead or senior developer
5. Create support ticket with Supabase (for paid plans)

## Conclusion

This migration guide provides a comprehensive path from direct PostgreSQL to Supabase integration. Follow the steps carefully, verify each stage, and don't hesitate to rollback if issues arise.

**Remember:** Always backup before making changes, test thoroughly, and monitor closely after deployment.

Good luck with your migration! 🚀
