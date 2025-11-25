# Role Polling Quick Reference

## Configuration Options

### Environment Variables

```bash
# Polling interval (milliseconds, min: 1000, default: 5000)
VITE_ROLE_POLLING_INTERVAL=5000

# Enable/disable polling (default: true)
VITE_ROLE_POLLING_ENABLED=true

# Use Realtime instead of polling (default: false)
VITE_USE_REALTIME_ROLE_UPDATES=false
```

## Common Use Cases

### 1. Faster Role Detection (Polling)

```bash
# .env.local
VITE_ROLE_POLLING_INTERVAL=2000  # Check every 2 seconds
```

### 2. Instant Role Updates (Realtime)

**Prerequisites:**
- Enable Realtime in Supabase project
- Enable replication for users table

```sql
-- In Supabase SQL Editor
ALTER PUBLICATION supabase_realtime ADD TABLE users;
```

```bash
# .env.local
VITE_USE_REALTIME_ROLE_UPDATES=true
```

### 3. Disable Role Detection

```bash
# .env.local
VITE_ROLE_POLLING_ENABLED=false
```

**Note:** Users will need to refresh page to see role changes.

### 4. Development vs Production

```bash
# .env.development.local (faster polling for testing)
VITE_ROLE_POLLING_INTERVAL=2000

# .env.production.local (Realtime for production)
VITE_USE_REALTIME_ROLE_UPDATES=true
```

## Debugging

### Check Current Configuration

```typescript
import { 
  getRolePollingInterval, 
  isRolePollingEnabled, 
  useRealtimeRoleUpdates 
} from '@/features/member-area/config/rolePolling.config';

console.log('Polling interval:', getRolePollingInterval());
console.log('Polling enabled:', isRolePollingEnabled());
console.log('Using Realtime:', useRealtimeRoleUpdates());
```

### Monitor Retry State

```typescript
import { getRetryStateInfo } from '@/features/member-area/utils/rolePollingUtils';

console.log('Retry state:', getRetryStateInfo());
// Output: { failureCount: 0, timeSinceLastSuccess: 1234, isMaxRetriesExceeded: false }
```

### Check Realtime Status

```typescript
import { 
  checkRealtimeAvailability, 
  getRealtimeStatus 
} from '@/features/member-area/utils/roleRealtimeUtils';

// Test if Realtime is available
const isAvailable = await checkRealtimeAvailability();
console.log('Realtime available:', isAvailable);

// Get status info
console.log('Realtime status:', getRealtimeStatus());
```

### View Console Logs

The system logs all role detection activity:

```
🔄 Starting role polling for user: abc-123 (interval: 5000ms)
🔔 Role changed (polling): member -> admin
🛑 Stopping role polling
```

```
🔄 Starting Realtime subscription for user: abc-123
[Role Realtime] Successfully subscribed to role changes
🔔 Role changed (Realtime): member -> admin
🛑 Stopping Realtime subscription
```

## Error Handling

### Automatic Retry

Errors are automatically retried with exponential backoff:

```
[Role Polling] Query failed (attempt 1/3): { errorType: 'network', nextRetryIn: '1000ms' }
[Role Polling] Query failed (attempt 2/3): { errorType: 'network', nextRetryIn: '2000ms' }
[Role Polling] Query failed (attempt 3/3): { errorType: 'network', nextRetryIn: '4000ms' }
[Role Polling] Max retries exceeded. Falling back to cached role: member
```

### Manual Recovery

```typescript
import { resetRetryState } from '@/features/member-area/utils/rolePollingUtils';

// Reset retry state after fixing network issues
resetRetryState();
```

## Performance Comparison

| Method | Update Delay | Network Requests | Best For |
|--------|--------------|------------------|----------|
| Polling (5s) | 0-5 seconds | 1 per 5s per user | Most cases |
| Polling (2s) | 0-2 seconds | 1 per 2s per user | Development |
| Realtime | Instant | 0 (event-driven) | Production |

## Troubleshooting

### Role not updating

1. Check if polling is enabled:
   ```typescript
   console.log(isRolePollingEnabled()); // Should be true
   ```

2. Check console for errors:
   ```
   [Role Polling] Query failed...
   ```

3. Verify user is logged in:
   ```typescript
   const { user } = useAuth();
   console.log('User:', user); // Should not be null
   ```

### Realtime not working

1. Verify Realtime is enabled in Supabase project
2. Check replication is enabled:
   ```sql
   SELECT * FROM pg_publication_tables 
   WHERE pubname = 'supabase_realtime' 
   AND tablename = 'users';
   ```

3. Check console for subscription status:
   ```
   [Role Realtime] Subscription status: SUBSCRIBED
   ```

### Too many requests

Increase polling interval:
```bash
VITE_ROLE_POLLING_INTERVAL=10000  # 10 seconds
```

Or switch to Realtime:
```bash
VITE_USE_REALTIME_ROLE_UPDATES=true
```

## Best Practices

### Development
- Use faster polling (2-3 seconds) for quick testing
- Enable verbose logging
- Test error scenarios

### Staging
- Use production-like settings
- Test Realtime if planning to use in production
- Monitor performance

### Production
- Use Realtime for instant updates and lower load
- Or use default polling (5 seconds) for simplicity
- Monitor error rates and retry patterns
- Set up alerts for high failure rates

## API Reference

### Configuration Functions

```typescript
// Get polling interval in milliseconds
getRolePollingInterval(): number

// Check if polling is enabled
isRolePollingEnabled(): boolean

// Check if Realtime should be used
useRealtimeRoleUpdates(): boolean
```

### Polling Utilities

```typescript
// Query role with error handling
queryUserRole(userId: string, cachedRole: string): Promise<{
  role: string;
  fromCache: boolean;
}>

// Get retry state info
getRetryStateInfo(): {
  failureCount: number;
  timeSinceLastSuccess: number;
  isMaxRetriesExceeded: boolean;
}

// Reset retry state
resetRetryState(): void
```

### Realtime Utilities

```typescript
// Subscribe to role changes
subscribeToRoleChanges(
  userId: string,
  options: {
    onRoleChange: (newRole: string, oldRole: string) => void;
    onError?: (error: Error) => void;
    currentRole: string;
  }
): () => void  // Returns unsubscribe function

// Check if Realtime is available
checkRealtimeAvailability(): Promise<boolean>

// Get Realtime status
getRealtimeStatus(): {
  isSupported: boolean;
  timestamp: string;
}
```
