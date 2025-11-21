# Design Document: Supabase Full Integration

## Overview

This design document outlines the complete integration of Supabase into the Canvango Group application. The goal is to replace direct PostgreSQL connection pool usage with Supabase client throughout the backend, remove duplicate authentication logic, and ensure all features leverage Supabase capabilities including Row Level Security, real-time subscriptions, and type-safe database operations.

### Current State
- Frontend: Uses Supabase Auth for authentication (register, login, forgot password, reset password)
- Backend: Uses raw PostgreSQL connection pool (`pg` library) for database operations
- Backend: Has duplicate auth controller that conflicts with Supabase Auth
- Models: Use raw SQL queries with connection pool

### Target State
- Frontend: Continue using Supabase Auth (no changes needed)
- Backend: Use Supabase client for all database operations
- Backend: Remove duplicate auth logic, validate Supabase JWT tokens
- Models: Use Supabase client methods with type safety
- Unified authentication flow through Supabase

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│  - Supabase Auth (register, login, forgot/reset password)  │
│  - Supabase Client (anon key)                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTP Requests with Supabase JWT
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   Backend (Express.js)                       │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Authentication Middleware                     │  │
│  │  - Validate Supabase JWT token                       │  │
│  │  - Extract user info from token                      │  │
│  │  - Attach user to request object                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Controllers                              │  │
│  │  - Handle business logic                             │  │
│  │  - Call model methods                                │  │
│  │  - Return responses                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Data Models                              │  │
│  │  - Use Supabase client methods                       │  │
│  │  - Type-safe database operations                     │  │
│  │  - Business logic validation                         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Supabase Client (Service Role)               │  │
│  │  - Server-side operations                            │  │
│  │  - Bypass RLS for admin operations                   │  │
│  │  - Full database access                              │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Supabase API
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    Supabase Platform                         │
│  - PostgreSQL Database                                       │
│  - Authentication Service                                    │
│  - Row Level Security                                        │
│  - Real-time Subscriptions                                   │
└──────────────────────────────────────────────────────────────┘
```

### Authentication Flow

```
┌─────────┐                                    ┌──────────┐
│ Frontend│                                    │ Supabase │
└────┬────┘                                    └────┬─────┘
     │                                              │
     │ 1. Register/Login                            │
     ├─────────────────────────────────────────────>│
     │                                              │
     │ 2. JWT Token + User Data                     │
     │<─────────────────────────────────────────────┤
     │                                              │
     │                                              │
┌────▼────┐                                    ┌────┴─────┐
│ Frontend│                                    │  Backend │
└────┬────┘                                    └────┬─────┘
     │                                              │
     │ 3. API Request with JWT in Authorization    │
     ├─────────────────────────────────────────────>│
     │                                              │
     │                                         4. Validate JWT
     │                                         with Supabase
     │                                              │
     │                                         5. Extract user
     │                                         info from token
     │                                              │
     │                                         6. Process request
     │                                         with Supabase client
     │                                              │
     │ 7. Response                                  │
     │<─────────────────────────────────────────────┤
     │                                              │
```

## Components and Interfaces

### 1. Supabase Client Configuration

**File**: `canvango-app/backend/src/config/supabase.ts`

```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

// Singleton Supabase client instance
let supabaseClient: SupabaseClient<Database> | null = null;

/**
 * Initialize and return Supabase client
 * Uses service role key for server-side operations
 */
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

**Environment Variables Required**:
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for server-side operations (bypasses RLS)

### 2. Updated Authentication Middleware

**File**: `canvango-app/backend/src/middleware/auth.middleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { getSupabaseClient } from '../config/supabase';
import { errorResponse } from '../utils/response';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

/**
 * Middleware to authenticate requests using Supabase JWT
 */
export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json(errorResponse('AUTH_003', 'No token provided'));
      return;
    }

    const token = authHeader.substring(7);
    const supabase = getSupabaseClient();

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(401).json(errorResponse('AUTH_002', 'Invalid or expired token'));
      return;
    }

    // Fetch user role from database
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (dbError) {
      // User not in database yet, default to member role
      req.user = {
        userId: user.id,
        email: user.email!,
        role: 'member'
      };
    } else {
      req.user = {
        userId: user.id,
        email: user.email!,
        role: userData.role
      };
    }

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json(errorResponse('INTERNAL_ERROR', 'Authentication failed'));
  }
}
```

**Key Changes**:
- Remove custom JWT verification
- Use Supabase `getUser()` method to validate token
- Extract user info from Supabase auth user
- Fetch role from database if needed

### 3. Updated Data Models

All models will be refactored to use Supabase client instead of raw SQL queries.

**Example: User Model**

**File**: `canvango-app/backend/src/models/User.model.ts`

```typescript
import { getSupabaseClient } from '../config/supabase';
import bcrypt from 'bcrypt';

export type UserRole = 'guest' | 'member' | 'admin';

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
  balance: number;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

export class UserModel {
  private static supabase = getSupabaseClient();

  /**
   * Find user by ID
   */
  static async findById(id: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error finding user by ID:', error);
      return null;
    }

    return data;
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('Error finding user by email:', error);
      return null;
    }

    return data;
  }

  /**
   * Create a new user
   */
  static async create(userData: {
    id: string; // Supabase auth user ID
    username: string;
    email: string;
    full_name: string;
    role?: UserRole;
  }): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .insert({
        id: userData.id,
        username: userData.username,
        email: userData.email,
        full_name: userData.full_name,
        role: userData.role || 'member',
        balance: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return null;
    }

    return data;
  }

  /**
   * Update user
   */
  static async update(id: string, updates: Partial<User>): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return null;
    }

    return data;
  }

  /**
   * Update user balance
   */
  static async updateBalance(id: string, amount: number): Promise<User | null> {
    // Use RPC function for atomic balance update
    const { data, error } = await this.supabase
      .rpc('update_user_balance', {
        user_id: id,
        amount_change: amount
      });

    if (error) {
      console.error('Error updating balance:', error);
      return null;
    }

    return this.findById(id);
  }

  /**
   * Get all users with filtering
   */
  static async findAll(filters?: {
    role?: UserRole;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<User[]> {
    let query = this.supabase.from('users').select('*');

    if (filters?.role) {
      query = query.eq('role', filters.role);
    }

    if (filters?.search) {
      query = query.or(`username.ilike.%${filters.search}%,email.ilike.%${filters.search}%,full_name.ilike.%${filters.search}%`);
    }

    query = query.order('created_at', { ascending: false });

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error finding users:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Count users
   */
  static async count(filters?: { role?: UserRole; search?: string }): Promise<number> {
    let query = this.supabase.from('users').select('*', { count: 'exact', head: true });

    if (filters?.role) {
      query = query.eq('role', filters.role);
    }

    if (filters?.search) {
      query = query.or(`username.ilike.%${filters.search}%,email.ilike.%${filters.search}%,full_name.ilike.%${filters.search}%`);
    }

    const { count, error } = await query;

    if (error) {
      console.error('Error counting users:', error);
      return 0;
    }

    return count || 0;
  }

  /**
   * Delete user
   */
  static async delete(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting user:', error);
      return false;
    }

    return true;
  }
}
```

**Key Changes**:
- Replace `pool.query()` with Supabase client methods
- Use `.from()`, `.select()`, `.insert()`, `.update()`, `.delete()`
- Use `.eq()`, `.or()`, `.ilike()` for filtering
- Use `.order()`, `.limit()`, `.range()` for pagination
- Remove password hashing (handled by Supabase Auth)
- Use RPC functions for complex operations

**Similar refactoring will be applied to**:
- Transaction.model.ts
- Claim.model.ts
- Tutorial.model.ts
- TopUp.model.ts
- SystemSettings.model.ts
- AdminAuditLog.model.ts

### 4. Database Functions (RPC)

Some operations require atomic updates or complex logic. We'll create PostgreSQL functions that can be called via Supabase RPC.

**File**: `canvango-app/backend/src/database/functions/update_user_balance.sql`

```sql
-- Function to atomically update user balance
CREATE OR REPLACE FUNCTION update_user_balance(
  user_id UUID,
  amount_change DECIMAL
)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET balance = balance + amount_change,
      updated_at = NOW()
  WHERE id = user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Ensure balance doesn't go negative
  IF (SELECT balance FROM users WHERE id = user_id) < 0 THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;
END;
$$ LANGUAGE plpgsql;
```

### 5. Remove Duplicate Auth Routes

**Files to Remove**:
- `canvango-app/backend/src/controllers/auth.controller.ts` (register, login endpoints)
- `canvango-app/backend/src/routes/auth.routes.ts`

**Files to Keep**:
- `canvango-app/backend/src/middleware/auth.middleware.ts` (updated to validate Supabase tokens)
- `canvango-app/backend/src/middleware/role.middleware.ts` (for authorization)

**Update**: `canvango-app/backend/src/index.ts`
- Remove `import authRoutes from './routes/auth.routes.js';`
- Remove `app.use('/api/auth', authRoutes);`

### 6. Type Generation

Generate TypeScript types from Supabase schema for type safety.

**Command**:
```bash
npx supabase gen types typescript --project-id gpittnsfzgkdbqnccncn > src/types/database.types.ts
```

**File**: `canvango-app/backend/src/types/database.types.ts`

This file will contain auto-generated types for all database tables, views, and functions.

## Data Models

### Database Schema (Unchanged)

The existing database schema remains the same:
- users
- transactions
- topups
- claims
- tutorials
- admin_audit_logs
- system_settings

### Model Interface Changes

All models will follow this pattern:

```typescript
export class ModelName {
  private static supabase = getSupabaseClient();

  static async findById(id: string): Promise<Type | null> { }
  static async findAll(filters?: Filters): Promise<Type[]> { }
  static async create(data: CreateInput): Promise<Type | null> { }
  static async update(id: string, data: UpdateInput): Promise<Type | null> { }
  static async delete(id: string): Promise<boolean> { }
  static async count(filters?: Filters): Promise<number> { }
}
```

## Error Handling

### Supabase Error Handling

```typescript
const { data, error } = await supabase.from('table').select();

if (error) {
  // Handle specific error codes
  switch (error.code) {
    case 'PGRST116': // No rows returned
      return null;
    case '23505': // Unique violation
      throw new Error('Duplicate entry');
    case '23503': // Foreign key violation
      throw new Error('Referenced record not found');
    default:
      console.error('Database error:', error);
      throw new Error('Database operation failed');
  }
}
```

### Controller Error Handling

Controllers will continue to use existing error response format:

```typescript
try {
  const result = await Model.method();
  res.json(successResponse(result));
} catch (error) {
  console.error('Error:', error);
  res.status(500).json(errorResponse('INTERNAL_ERROR', 'Operation failed'));
}
```

## Testing Strategy

### Unit Tests

Update existing model tests to use Supabase client:

```typescript
import { UserModel } from '../models/User.model';
import { getSupabaseClient } from '../config/supabase';

// Mock Supabase client
jest.mock('../config/supabase');

describe('UserModel', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  it('should find user by ID', async () => {
    const mockUser = { id: '123', email: 'test@example.com' };
    
    (getSupabaseClient as jest.Mock).mockReturnValue({
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockUser, error: null })
          })
        })
      })
    });

    const user = await UserModel.findById('123');
    expect(user).toEqual(mockUser);
  });
});
```

### Integration Tests

Test with actual Supabase test project or local Supabase instance:

```typescript
describe('User API Integration', () => {
  let authToken: string;

  beforeAll(async () => {
    // Register test user and get token
    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'Test123!' });
    
    authToken = response.body.data.accessToken;
  });

  it('should get user profile', async () => {
    const response = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.email).toBe('test@example.com');
  });
});
```

### Test Environment

Use separate Supabase project for testing or local Supabase:

```env
# .env.test
SUPABASE_URL=https://test-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=test_service_role_key
```

## Migration Strategy

### Phase 1: Setup Supabase Client
1. Install dependencies (already done)
2. Create Supabase client configuration
3. Add environment variables
4. Generate TypeScript types

### Phase 2: Update Authentication
1. Update auth middleware to validate Supabase tokens
2. Remove duplicate auth controller and routes
3. Update index.ts to remove auth routes
4. Test authentication flow

### Phase 3: Refactor Models
1. Update User model
2. Update Transaction model
3. Update Claim model
4. Update Tutorial model
5. Update TopUp model
6. Update SystemSettings model
7. Update AdminAuditLog model

### Phase 4: Create Database Functions
1. Create RPC functions for complex operations
2. Deploy functions to Supabase
3. Update models to use RPC functions

### Phase 5: Update Tests
1. Update unit tests with Supabase mocks
2. Update integration tests
3. Run full test suite

### Phase 6: Documentation
1. Update README with Supabase setup
2. Update DATABASE.md
3. Update API documentation
4. Create migration guide

## Security Considerations

### Service Role Key

- **Never expose** service role key to frontend
- Store in environment variables only
- Use in backend only for admin operations
- Rotate keys periodically

### Row Level Security (RLS)

While using service role key bypasses RLS, we should still implement RLS policies for:
- Direct Supabase client usage from frontend (future)
- Additional security layer
- Audit compliance

**Example RLS Policy**:
```sql
-- Users can only read their own data
CREATE POLICY "Users can view own data"
ON users FOR SELECT
USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data"
ON users FOR UPDATE
USING (auth.uid() = id);
```

### Token Validation

- Always validate JWT tokens on backend
- Check token expiration
- Verify token signature with Supabase
- Extract user info from validated token

### Input Validation

- Continue using existing validation middleware
- Sanitize inputs before database operations
- Use parameterized queries (Supabase handles this)

## Performance Considerations

### Connection Pooling

Supabase client handles connection pooling automatically. No need for manual pool management.

### Query Optimization

- Use `.select()` to specify only needed columns
- Use indexes for frequently queried fields
- Use `.limit()` and `.range()` for pagination
- Use RPC functions for complex queries

### Caching

Consider implementing caching for:
- User profiles
- System settings
- Tutorial content

```typescript
// Example with simple in-memory cache
const cache = new Map();

static async findById(id: string): Promise<User | null> {
  const cached = cache.get(`user:${id}`);
  if (cached) return cached;

  const user = await this.supabase.from('users').select().eq('id', id).single();
  cache.set(`user:${id}`, user.data);
  
  return user.data;
}
```

## Rollback Plan

If issues arise during migration:

1. **Keep old code**: Don't delete old database.ts and models until fully tested
2. **Feature flags**: Use environment variable to switch between old and new implementation
3. **Gradual migration**: Migrate one model at a time
4. **Monitoring**: Monitor error rates and performance
5. **Quick rollback**: Revert to old code if critical issues found

```typescript
// Example feature flag
const USE_SUPABASE = process.env.USE_SUPABASE === 'true';

static async findById(id: string): Promise<User | null> {
  if (USE_SUPABASE) {
    return this.findByIdSupabase(id);
  } else {
    return this.findByIdPostgres(id);
  }
}
```

## Documentation Updates

### README.md Updates

Add Supabase setup section:
- How to get Supabase credentials
- Environment variables required
- Type generation command
- Testing with Supabase

### DATABASE.md Updates

- Update connection instructions
- Add Supabase-specific notes
- Document RPC functions
- Update migration process

### API Documentation

- Update authentication section
- Document token format
- Update error codes
- Add Supabase-specific errors

## Conclusion

This design provides a comprehensive plan for full Supabase integration. The migration will:
- Eliminate duplicate authentication logic
- Leverage Supabase's built-in features
- Improve type safety with generated types
- Simplify database operations
- Maintain backward compatibility during transition
- Provide clear rollback strategy

The implementation will be done incrementally to minimize risk and allow for testing at each stage.
