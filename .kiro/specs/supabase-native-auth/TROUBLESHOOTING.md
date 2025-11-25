# Troubleshooting Guide - Supabase Native Auth

## Quick Diagnostics

Run these checks first to identify the issue:

```javascript
// 1. Check auth state
const { user, isAuthenticated } = useAuth();
console.log('User:', user);
console.log('Authenticated:', isAuthenticated);

// 2. Check polling configuration
import { getRolePollingInterval, isRolePollingEnabled } from './config/rolePolling.config';
console.log('Polling enabled:', isRolePollingEnabled());
console.log('Polling interval:', getRolePollingInterval());

// 3. Check retry state
import { getRetryStateInfo } from './utils/rolePollingUtils';
console.log('Retry state:', getRetryStateInfo());

// 4. Check tokens
console.log('Auth token:', localStorage.getItem('authToken'));
console.log('Refresh token:', localStorage.getItem('refreshToken'));
```

## Common Issues

### 1. Login Fails After Role Change

**Symptoms:**
- User gets "Invalid credentials" error
- Error message: "Username atau password salah"
- Login worked before admin changed role

**Root Cause:**
Custom JWT hook still exists and is adding stale role to JWT claims.

**Solution:**

1. Verify JWT hook is removed:
```sql
SELECT * FROM pg_proc WHERE proname = 'custom_access_token_hook';
-- Should return 0 rows
```

2. If hook exists, remove it:
```sql
DROP FUNCTION IF EXISTS custom_access_token_hook(jsonb);
```

3. Remove hook from Supabase Dashboard:
   - Go to Authentication > Hooks
   - Remove "Custom Access Token Hook"

4. Clear user's browser cache:
```javascript
localStorage.clear();
sessionStorage.clear();
```

5. Test login again

---

### 2. Role Changes Not Detected

**Symptoms:**
- Admin changes role in database
- User doesn't see notification
- No auto-redirect happens
- Role stays old in UI

**Root Cause:**
Role polling is disabled or not working.

**Solution:**

1. Check if polling is enabled:
```javascript
import { isRolePollingEnabled } from './config/rolePolling.config';
console.log('Polling enabled:', isRolePollingEnabled());
```

2. If disabled, enable it:
```bash
# In .env or .env.local
VITE_ROLE_POLLING_ENABLED=true
```

3. Check browser console for polling logs:
```
🔄 Starting role polling for user: xxx (interval: 5000ms)
```

4. If no logs, check if user is logged in:
```javascript
const { user } = useAuth();
console.log('User logged in:', !!user);
```

5. Check for JavaScript errors in console

6. Verify network requests are being made:
   - Open DevTools > Network tab
   - Filter by "users"
   - Should see requests every 5 seconds

---

### 3. Performance Issues

**Symptoms:**
- Slow page loads
- High database CPU usage
- Slow query warnings in Supabase logs

**Root Cause:**
RLS policies doing full table scans without index.

**Solution:**

1. Verify index exists:
```sql
SELECT * FROM pg_indexes WHERE indexname = 'idx_users_id_role';
```

2. If missing, create it:
```sql
CREATE INDEX IF NOT EXISTS idx_users_id_role ON users(id, role);
```

3. Verify index is being used:
```sql
EXPLAIN ANALYZE
SELECT role FROM users WHERE id = auth.uid();
```

Expected output should show "Index Scan" not "Seq Scan".

4. Check query performance:
```sql
-- Should be < 1ms
EXPLAIN (ANALYZE, BUFFERS)
SELECT role FROM users WHERE id = '00000000-0000-0000-0000-000000000000';
```

5. If still slow, check for:
   - Large number of users (> 100k)
   - Database resource constraints
   - Network latency

---

### 4. Realtime Subscription Fails

**Symptoms:**
- Console shows "CHANNEL_ERROR" or "TIMED_OUT"
- Role changes not detected instantly
- Fallback to polling not working

**Root Cause:**
Realtime not enabled or configured incorrectly.

**Solution:**

1. Check if Realtime is enabled in Supabase:
   - Dashboard > Database > Replication
   - Ensure "Realtime" is enabled for `users` table

2. Verify Realtime availability:
```javascript
import { checkRealtimeAvailability } from './utils/roleRealtimeUtils';
const available = await checkRealtimeAvailability();
console.log('Realtime available:', available);
```

3. Check Realtime status:
```javascript
import { getRealtimeStatus } from './utils/roleRealtimeUtils';
console.log('Realtime status:', getRealtimeStatus());
```

4. If unavailable, fall back to polling:
```bash
# In .env or .env.local
VITE_USE_REALTIME_ROLE_UPDATES=false
```

5. Check Supabase project settings:
   - Ensure project is not paused
   - Check if Realtime quota exceeded
   - Verify network connectivity

---

### 5. Multiple Tabs Behavior

**Symptoms:**
- Role changes in one tab but not others
- Inconsistent state across tabs
- Multiple notifications shown

**Root Cause:**
Each tab runs independent polling/subscription.

**Expected Behavior:**
- Each tab detects role change independently
- Each tab shows notification
- Each tab redirects independently

**Solution:**

This is normal behavior. If you want synchronized tabs:

1. Use BroadcastChannel API:
```javascript
const channel = new BroadcastChannel('auth-channel');

// In one tab
channel.postMessage({ type: 'ROLE_CHANGED', role: 'admin' });

// In other tabs
channel.onmessage = (event) => {
  if (event.data.type === 'ROLE_CHANGED') {
    setUser({ ...user, role: event.data.role });
  }
};
```

2. Or use localStorage events:
```javascript
window.addEventListener('storage', (e) => {
  if (e.key === 'roleChanged') {
    // Update role in this tab
  }
});
```

---

### 6. RLS Policy Errors

**Symptoms:**
- "Permission denied" errors
- "Row level security policy violation"
- Users can't access their own data

**Root Cause:**
RLS policies not updated correctly.

**Solution:**

1. Check if policies use old JWT pattern:
```sql
SELECT 
  tablename,
  policyname,
  pg_get_expr(qual, tablename::regclass) as policy_definition
FROM pg_policies
WHERE pg_get_expr(qual, tablename::regclass) LIKE '%auth.jwt()%';
```

2. Update policies to use database query:
```sql
-- Example for users table
DROP POLICY IF EXISTS "Users can read own profile" ON users;

CREATE POLICY "Users can read own profile"
ON users FOR SELECT
USING (
  id = auth.uid()
  OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);
```

3. Test policy:
```sql
-- Login as test user
SET request.jwt.claims = '{"sub": "user-uuid"}';

-- Try to query
SELECT * FROM users WHERE id = 'user-uuid';
```

4. Check Supabase logs for policy violations:
   - Dashboard > Logs > Postgres Logs
   - Filter by "policy"

---

### 7. Token Refresh Issues

**Symptoms:**
- User logged out unexpectedly
- "Session expired" errors
- Frequent re-login required

**Root Cause:**
Token refresh not working correctly.

**Solution:**

1. Check token expiry:
```javascript
const { data: { session } } = await supabase.auth.getSession();
console.log('Token expires at:', new Date(session.expires_at * 1000));
```

2. Verify refresh token exists:
```javascript
console.log('Refresh token:', localStorage.getItem('refreshToken'));
```

3. Test token refresh:
```javascript
const { data, error } = await supabase.auth.refreshSession();
console.log('Refresh result:', { data, error });
```

4. Check auth state listener:
```javascript
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event);
  if (event === 'TOKEN_REFRESHED') {
    console.log('Token refreshed successfully');
  }
});
```

5. If refresh fails, clear tokens and re-login:
```javascript
localStorage.removeItem('authToken');
localStorage.removeItem('refreshToken');
await supabase.auth.signOut();
```

---

### 8. Notification Not Showing

**Symptoms:**
- Role changes but no toast notification
- Console shows role change log
- Auto-redirect works but no notification

**Root Cause:**
Notification system not initialized or error in notification call.

**Solution:**

1. Check if notification hook is available:
```javascript
const notification = useNotification();
console.log('Notification available:', !!notification);
```

2. Test notification manually:
```javascript
notification.info('Test notification');
```

3. Check for notification errors in console

4. Verify notification component is rendered:
```jsx
// In App.tsx or root component
<NotificationProvider>
  {/* Your app */}
</NotificationProvider>
```

5. Check notification styling (might be hidden):
```css
/* Ensure notifications are visible */
.notification {
  z-index: 9999;
  position: fixed;
}
```

---

### 9. Auto-Redirect Not Working

**Symptoms:**
- Role changes and notification shows
- User stays on same page
- No redirect happens

**Root Cause:**
Navigation logic not executing or route guard preventing redirect.

**Solution:**

1. Check redirect logic in AuthContext:
```javascript
// Should see this in console
console.log('🔔 Role changed:', oldRole, '->', newRole);
```

2. Verify navigation is available:
```javascript
const navigate = useNavigate();
console.log('Navigate available:', !!navigate);
```

3. Check for route guards blocking redirect:
```javascript
// In ProtectedRoute component
console.log('Route guard check:', { requiredRole, userRole });
```

4. Test manual navigation:
```javascript
navigate('/admin/dashboard');
```

5. Check browser console for navigation errors

---

### 10. Database Connection Errors

**Symptoms:**
- "Failed to fetch" errors
- Network errors in console
- Intermittent login failures

**Root Cause:**
Network issues or Supabase service problems.

**Solution:**

1. Check Supabase status:
   - Visit https://status.supabase.com

2. Verify Supabase URL and keys:
```javascript
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Anon key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
```

3. Test connection:
```javascript
const { data, error } = await supabase.from('users').select('count');
console.log('Connection test:', { data, error });
```

4. Check network tab in DevTools:
   - Look for failed requests
   - Check response status codes
   - Verify CORS headers

5. Check for rate limiting:
```javascript
// If you see 429 errors
console.log('Rate limited - wait before retrying');
```

6. Verify environment variables are loaded:
```bash
# Restart dev server after changing .env
npm run dev
```

---

## Advanced Debugging

### Enable Verbose Logging

Add to your code:

```javascript
// In AuthContext.tsx
const DEBUG = true;

if (DEBUG) {
  console.log('[Auth] User state:', user);
  console.log('[Auth] Polling config:', {
    enabled: isRolePollingEnabled(),
    interval: getRolePollingInterval(),
    useRealtime: useRealtimeRoleUpdates(),
  });
}
```

### Monitor Database Queries

```sql
-- Enable query logging
ALTER DATABASE postgres SET log_statement = 'all';

-- View recent queries
SELECT * FROM pg_stat_statements
WHERE query LIKE '%users%role%'
ORDER BY calls DESC;
```

### Test RLS Policies Manually

```sql
-- Impersonate a user
SET request.jwt.claims = '{"sub": "user-uuid", "role": "authenticated"}';

-- Test queries
SELECT * FROM users WHERE id = 'user-uuid';
SELECT * FROM products;

-- Reset
RESET request.jwt.claims;
```

### Measure Performance

```javascript
// Measure role query time
console.time('roleQuery');
const { data } = await supabase.from('users').select('role').eq('id', userId).single();
console.timeEnd('roleQuery');
// Should be < 50ms
```

## Getting Help

If issues persist:

1. **Check Documentation:**
   - `.kiro/specs/supabase-native-auth/design.md`
   - `.kiro/specs/supabase-native-auth/MIGRATION_GUIDE.md`

2. **Review Test Files:**
   - `src/features/member-area/services/__tests__/auth.service.test.ts`
   - `src/features/member-area/contexts/__tests__/AuthContext.test.tsx`

3. **Check Supabase Logs:**
   - Dashboard > Logs > Postgres Logs
   - Dashboard > Logs > API Logs

4. **Enable Debug Mode:**
   ```bash
   VITE_DEBUG=true npm run dev
   ```

5. **Collect Information:**
   - Browser console logs
   - Network tab requests
   - Supabase logs
   - Environment variables (redact sensitive data)
   - Steps to reproduce

## Prevention

To avoid issues:

1. **Always test after changes:**
   ```bash
   npm run test
   npm run test:e2e
   ```

2. **Monitor performance:**
   - Check Supabase Dashboard regularly
   - Set up alerts for slow queries
   - Monitor error rates

3. **Keep documentation updated:**
   - Document any custom changes
   - Update troubleshooting guide
   - Share knowledge with team

4. **Use version control:**
   - Commit working states
   - Tag releases
   - Document breaking changes

5. **Test role changes:**
   - Test member → admin upgrade
   - Test admin → member downgrade
   - Test with multiple tabs
   - Test with slow network
