# Supabase Native Authentication

## Overview

This project uses **Supabase native authentication** without custom JWT claims. User roles are always queried fresh from the database, ensuring immediate role changes without requiring logout/login.

## Key Features

✅ **No Custom JWT Claims** - Standard Supabase Auth only  
✅ **Fresh Role Data** - Role always queried from database  
✅ **Instant Role Changes** - Users see changes within 5 seconds  
✅ **Auto-Redirect** - Automatic navigation to appropriate dashboard  
✅ **Graceful Error Handling** - Fallback mechanisms for reliability  
✅ **Configurable** - Polling interval and method can be customized  

## Architecture

```
┌─────────────┐
│   User      │
│  (Browser)  │
└──────┬──────┘
       │
       │ 1. Login (username/password)
       ▼
┌─────────────────────┐
│  Supabase Auth      │
│  (No custom claims) │
└──────┬──────────────┘
       │
       │ 2. Returns: access_token, refresh_token
       ▼
┌─────────────────────┐
│  Frontend           │
│  - Stores tokens    │
│  - Queries role     │
│  - Polls for changes│
└──────┬──────────────┘
       │
       │ 3. Every request: Fresh role from DB
       ▼
┌─────────────────────┐
│  Database (users)   │
│  - id               │
│  - role (source of  │
│    truth)           │
└─────────────────────┘
```

## How It Works

### Authentication Flow

1. **Login:**
   - User enters username/password
   - System converts username to email (if needed)
   - Calls `supabase.auth.signInWithPassword()`
   - Fetches user profile (including role) from database
   - Stores tokens in localStorage
   - Stores user data in React state (NOT localStorage)

2. **Role Detection:**
   - Polls database every 5 seconds for role changes
   - Compares with current role in state
   - If changed: shows notification + auto-redirects
   - Handles errors gracefully with retry logic

3. **Authorization:**
   - RLS policies query role from database
   - Pattern: `(SELECT role FROM users WHERE id = auth.uid())`
   - Protected routes verify role on access
   - No caching of role data

### Role Change Flow

```
Admin changes role in DB
         ↓
Polling detects change (≤5s)
         ↓
Frontend updates user state
         ↓
Notification shown to user
         ↓
Auto-redirect to new dashboard
         ↓
User continues with new role
```

## Configuration

### Environment Variables

Create `.env.local` with:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key

# Role Polling Configuration
VITE_ROLE_POLLING_INTERVAL=5000        # Polling interval in ms (default: 5000)
VITE_ROLE_POLLING_ENABLED=true         # Enable/disable polling (default: true)
VITE_USE_REALTIME_ROLE_UPDATES=false   # Use Realtime instead of polling (default: false)
```

### Polling vs Realtime

**Polling (Default):**
- ✅ Simple and reliable
- ✅ Works everywhere
- ✅ No additional setup
- ⚠️ 5-second delay
- ⚠️ Extra database queries

**Realtime (Optional):**
- ✅ Instant updates
- ✅ No polling overhead
- ⚠️ Requires Realtime enabled
- ⚠️ WebSocket connection needed

To enable Realtime:
```bash
VITE_USE_REALTIME_ROLE_UPDATES=true
```

## Usage

### Login

```typescript
import { useAuth } from '@/features/member-area/contexts/AuthContext';

function LoginForm() {
  const { login } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Login with username or email
      await login({
        identifier: 'username', // or 'user@example.com'
        password: 'password123'
      });
      
      // User is now logged in with fresh role from database
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Get Current User

```typescript
import { useAuth } from '@/features/member-area/contexts/AuthContext';

function UserProfile() {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please login</div>;
  }
  
  return (
    <div>
      <h1>Welcome, {user.username}</h1>
      <p>Role: {user.role}</p> {/* Always fresh from database */}
    </div>
  );
}
```

### Protected Routes

```typescript
import { ProtectedRoute } from '@/features/member-area/components/ProtectedRoute';

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      
      {/* Member routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute requiredRole="member">
          <Dashboard />
        </ProtectedRoute>
      } />
      
      {/* Admin routes */}
      <Route path="/admin/*" element={
        <ProtectedRoute requiredRole="admin">
          <AdminLayout />
        </ProtectedRoute>
      } />
    </Routes>
  );
}
```

### Manual Role Query

```typescript
import { supabase } from '@/config/supabase';

async function checkUserRole(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Failed to fetch role:', error);
    return 'member'; // Fallback
  }
  
  return data.role;
}
```

## Database Setup

### Required Index

For optimal performance, ensure this index exists:

```sql
CREATE INDEX IF NOT EXISTS idx_users_id_role ON users(id, role);
```

### RLS Policy Pattern

All role-based policies should use this pattern:

```sql
-- Example: Admin-only access
CREATE POLICY "Admins can manage products"
ON products FOR ALL
USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

-- Example: User can access own data or admin can access all
CREATE POLICY "Users can read own transactions"
ON transactions FOR SELECT
USING (
  user_id = auth.uid()
  OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);
```

### Verify Setup

```sql
-- 1. Check JWT hook is removed
SELECT * FROM pg_proc WHERE proname = 'custom_access_token_hook';
-- Should return 0 rows

-- 2. Check index exists
SELECT * FROM pg_indexes WHERE indexname = 'idx_users_id_role';
-- Should return 1 row

-- 3. Check policies don't use JWT claims
SELECT * FROM pg_policies
WHERE pg_get_expr(qual, (schemaname || '.' || tablename)::regclass) LIKE '%auth.jwt()%';
-- Should return 0 rows
```

## Testing

### Run Tests

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# All tests
npm run test:all
```

### Manual Testing

1. **Test Login:**
   - Login with username
   - Login with email
   - Verify role is correct

2. **Test Role Change:**
   - Login as user
   - Admin changes role in database
   - Wait ≤5 seconds
   - Verify notification appears
   - Verify auto-redirect happens

3. **Test Logout/Login:**
   - Login as member
   - Admin changes role to admin
   - Logout
   - Login again
   - Verify login succeeds with new role

## Troubleshooting

### Common Issues

**Login fails after role change:**
- Check if JWT hook is removed
- Verify RLS policies are updated
- Clear browser cache

**Role changes not detected:**
- Check if polling is enabled
- Verify user is logged in
- Check browser console for errors

**Performance issues:**
- Verify index exists
- Check polling interval
- Consider using Realtime

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed solutions.

## Migration

If migrating from custom JWT claims:

1. Read [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
2. Follow the step-by-step process
3. Test thoroughly before deploying
4. Keep rollback scripts ready

## Performance

### Metrics

- **Login time:** ~600ms (includes role query)
- **Role query:** <1ms (with index)
- **RLS policy check:** <1ms (with index)
- **Polling overhead:** 1 query per user per 5 seconds

### Optimization Tips

1. **Use the index:**
   ```sql
   CREATE INDEX idx_users_id_role ON users(id, role);
   ```

2. **Adjust polling interval:**
   ```bash
   # Slower polling for less overhead
   VITE_ROLE_POLLING_INTERVAL=10000
   ```

3. **Use Realtime for instant updates:**
   ```bash
   VITE_USE_REALTIME_ROLE_UPDATES=true
   ```

4. **Monitor query performance:**
   ```sql
   EXPLAIN ANALYZE
   SELECT role FROM users WHERE id = auth.uid();
   ```

## Security

### Best Practices

✅ **Never cache role** - Always query from database  
✅ **Use RLS policies** - Enforce permissions at database level  
✅ **Validate on backend** - Don't trust client-side role  
✅ **Use HTTPS** - Protect tokens in transit  
✅ **Rotate tokens** - Implement token refresh  
✅ **Audit role changes** - Log all role modifications  

### RLS Policy Security

```sql
-- ✅ GOOD: Query from database
(SELECT role FROM users WHERE id = auth.uid()) = 'admin'

-- ❌ BAD: Trust JWT claims
(auth.jwt() ->> 'user_role') = 'admin'

-- ❌ BAD: Trust client-side data
current_setting('request.jwt.claim.user_role') = 'admin'
```

## API Reference

### Auth Service

```typescript
// Login
await login({ identifier: 'username', password: 'pass' });

// Logout
await logout();

// Get current user (fresh role from DB)
const user = await getCurrentUser();

// Register
await register({
  email: 'user@example.com',
  username: 'username',
  password: 'pass123',
  fullName: 'Full Name',
  phone: '+1234567890'
});

// Refresh token
const tokens = await refreshToken();
```

### Auth Context

```typescript
const {
  user,              // Current user with fresh role
  isAuthenticated,   // Boolean: is user logged in
  isGuest,          // Boolean: is user a guest
  isLoading,        // Boolean: is auth state loading
  login,            // Function: login user
  register,         // Function: register new user
  logout,           // Function: logout user
  updateProfile,    // Function: update user profile
  refreshUser       // Function: refresh user data
} = useAuth();
```

### Role Polling Utils

```typescript
// Query role with error handling
const { role, fromCache } = await queryUserRole(userId, cachedRole);

// Get retry state info
const info = getRetryStateInfo();

// Reset retry state
resetRetryState();
```

### Role Realtime Utils

```typescript
// Subscribe to role changes
const unsubscribe = subscribeToRoleChanges(userId, {
  currentRole: 'member',
  onRoleChange: (newRole, oldRole) => {
    console.log('Role changed:', oldRole, '->', newRole);
  },
  onError: (error) => {
    console.error('Subscription error:', error);
  }
});

// Unsubscribe when done
unsubscribe();

// Check Realtime availability
const available = await checkRealtimeAvailability();
```

## Documentation

- [Design Document](./design.md) - Architecture and technical design
- [Requirements](./requirements.md) - Feature requirements and acceptance criteria
- [Migration Guide](./MIGRATION_GUIDE.md) - Step-by-step migration process
- [Troubleshooting](./TROUBLESHOOTING.md) - Common issues and solutions
- [Tasks](./tasks.md) - Implementation task list

## Support

For issues or questions:

1. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. Review test files for examples
3. Check Supabase Dashboard logs
4. Consult design document

## License

[Your License Here]
