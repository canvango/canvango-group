# Supabase Integration Guide

## Overview

Backend Canvango Group telah diintegrasikan dengan Supabase untuk authentication dan database operations. Dokumen ini menjelaskan setup dan penggunaan Supabase di backend.

## Setup Completed

### ✅ 1. Supabase Client Configuration
- File: `src/config/supabase.ts`
- Singleton pattern untuk Supabase client
- Menggunakan service role key untuk server-side operations
- Auto-validation environment variables

### ✅ 2. Authentication Middleware
- File: `src/middleware/auth.middleware.ts`
- Validasi Supabase JWT tokens dari Authorization header
- Fetch user role dari database
- Support untuk optional authentication

### ✅ 3. Environment Variables
- `SUPABASE_URL`: Project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key (bypass RLS)
- Validasi otomatis saat server startup

### ✅ 4. Removed Duplicate Auth
- Deleted: `src/controllers/auth.controller.ts`
- Deleted: `src/routes/auth.routes.ts`
- Authentication sekarang 100% handled by Supabase Auth di frontend

## Environment Setup

### Required Variables

```env
# Supabase Configuration
SUPABASE_URL=https://gpittnsfzgkdbqnccncn.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database Configuration (for migrations)
DB_HOST=2406:da18:243:740c:b58d:adf1:799:b08a
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=RbMKmlAbQbe8zgHq
```

## Usage

### Using Supabase Client in Models

```typescript
import { getSupabaseClient } from '../config/supabase.js';

export class UserModel {
  private static supabase = getSupabaseClient();

  static async findById(id: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error:', error);
      return null;
    }

    return data;
  }
}
```

### Protected Routes

```typescript
import { authenticate, requireAdmin } from './middleware/auth.middleware.js';

// Require authentication
router.get('/profile', authenticate, getProfile);

// Require admin role
router.get('/admin/users', authenticate, requireAdmin, getAllUsers);
```

### Frontend Authentication Flow

1. User registers/logs in via Supabase Auth (frontend)
2. Frontend receives JWT token from Supabase
3. Frontend sends token in Authorization header: `Bearer <token>`
4. Backend validates token with Supabase
5. Backend fetches user role from database
6. Request proceeds with user info attached

## Next Steps

### 🔄 Pending Tasks

1. **Generate TypeScript Types**
   ```bash
   npx supabase gen types typescript --project-id gpittnsfzgkdbqnccncn > src/types/database.types.ts
   ```

2. **Refactor Models to Use Supabase Client**
   - User.model.ts
   - Transaction.model.ts
   - Claim.model.ts
   - Tutorial.model.ts
   - TopUp.model.ts
   - SystemSettings.model.ts
   - AdminAuditLog.model.ts

3. **Create Database Functions (RPC)**
   - `update_user_balance` - Atomic balance updates
   - `increment_tutorial_views` - Atomic view count

4. **Update Tests**
   - Mock Supabase client in unit tests
   - Update integration tests

5. **Update Documentation**
   - README.md
   - DATABASE.md
   - API_DOCUMENTATION.md

## Security Notes

### Service Role Key

⚠️ **CRITICAL**: Service role key bypasses ALL Row Level Security (RLS) policies!

- ❌ Never commit to Git
- ❌ Never expose to frontend
- ❌ Never share publicly
- ✅ Only use in backend server
- ✅ Store in `.env` (already in `.gitignore`)

### Row Level Security (RLS)

While service role key bypasses RLS, you should still implement RLS policies for:
- Direct Supabase client usage from frontend (future)
- Additional security layer
- Audit compliance

Example RLS policy:
```sql
-- Users can only read their own data
CREATE POLICY "Users can view own data"
ON users FOR SELECT
USING (auth.uid() = id);
```

## Troubleshooting

### "Missing SUPABASE_URL" Error
- Check `.env` file exists in `canvango-app/backend/`
- Verify variable name is exactly `SUPABASE_URL`
- Restart server after updating `.env`

### "Invalid or expired token" Error
- Token might be expired (check frontend session)
- Token format must be: `Bearer <token>`
- Verify token is from Supabase Auth

### Database Connection Issues
- Verify Supabase project is active
- Check service role key is correct
- Ensure database tables exist (run migrations)

## Resources

- [Supabase Dashboard](https://app.supabase.com/project/gpittnsfzgkdbqnccncn)
- [Supabase Docs](https://supabase.com/docs)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## Migration Status

| Component | Status | Notes |
|-----------|--------|-------|
| Supabase Client Config | ✅ Complete | Singleton pattern |
| Auth Middleware | ✅ Complete | Validates Supabase JWT |
| Role Middleware | ✅ Complete | Compatible with new auth |
| Duplicate Auth Removed | ✅ Complete | Old endpoints deleted |
| Environment Variables | ✅ Complete | Validated on startup |
| User Model | ⏳ Pending | Needs Supabase client |
| Transaction Model | ⏳ Pending | Needs Supabase client |
| Other Models | ⏳ Pending | 5 more models |
| Database Functions | ⏳ Pending | RPC functions |
| Tests | ⏳ Pending | Mock Supabase client |
| Documentation | ⏳ Pending | Update guides |

---

**Last Updated**: 2024
**Status**: Partial Integration - Auth Complete, Models Pending
