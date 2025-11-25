# Product Update Session Timeout Fix

## Problem Identified

When editing products in `/admin/products`, if the user stays idle on the page for too long (typically > 1 hour), clicking "Save" fails silently. The user must reload the browser and quickly edit the product for it to work.

### Root Cause

**Supabase Access Token Expiration**

- Supabase JWT tokens expire after 1 hour by default
- When token expires, API requests fail with authentication errors
- The error was not properly handled, causing silent failures
- No automatic token refresh mechanism was in place

## Solution Implemented

### 1. Automatic Session Validation & Refresh

**File:** `src/features/member-area/services/products.service.ts`

Added `ensureValidSession()` method that:
- Checks current session validity
- Detects if token is expiring soon (< 5 minutes)
- Automatically refreshes the session before making requests
- Provides clear error messages if refresh fails

```typescript
async ensureValidSession(): Promise<void> {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('No active session. Please login again.');
  }
  
  // Check if token is about to expire (within 5 minutes)
  const expiresAt = session.expires_at;
  const now = Math.floor(Date.now() / 1000);
  const timeUntilExpiry = expiresAt ? expiresAt - now : 0;
  
  // Refresh token if expiring soon (< 5 minutes)
  if (timeUntilExpiry < 300) {
    await supabase.auth.refreshSession();
  }
}
```

### 2. Integration with Product Operations

Both `create()` and `update()` methods now:
- Call `ensureValidSession()` before making requests
- Extended timeout from 10s to 30s for better reliability
- Provide user-friendly error messages for session issues
- Detect JWT/auth errors and guide users to refresh

```typescript
async update(id: string, productData: any): Promise<any> {
  // Ensure session is valid before making the request
  await this.ensureValidSession();
  
  // ... rest of update logic
}
```

### 3. Background Session Refresh

**File:** `src/features/member-area/hooks/useSessionRefresh.ts`

Created custom hook that:
- Runs in background while user is on the page
- Checks session every 5 minutes
- Refreshes token if expiring within 10 minutes
- Prevents token expiration during idle periods

```typescript
export const useSessionRefresh = () => {
  useEffect(() => {
    const checkAndRefreshSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session && timeUntilExpiry < 10 * 60) {
        await supabase.auth.refreshSession();
      }
    };
    
    // Check every 5 minutes
    const interval = setInterval(checkAndRefreshSession, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
};
```

### 4. Integration with ProductManagement

**File:** `src/features/member-area/pages/admin/ProductManagement.tsx`

Added hook to component:
```typescript
const ProductManagement = () => {
  // Auto-refresh session to prevent token expiration
  useSessionRefresh();
  
  // ... rest of component
};
```

## Benefits

### ✅ No More Silent Failures
- Clear error messages when session expires
- Users are guided to refresh the page if needed

### ✅ Automatic Token Refresh
- Background refresh prevents expiration during idle periods
- On-demand refresh before critical operations

### ✅ Better User Experience
- Users can stay on the page for extended periods
- No need to rush when editing products
- Seamless operation without interruptions

### ✅ Improved Reliability
- Extended timeout (30s) for slow connections
- Better error detection and handling
- Graceful degradation on failures

## Testing Scenarios

### Scenario 1: Long Idle Period
1. Open product edit modal
2. Wait 1+ hour without any action
3. Click "Save"
4. **Expected:** Session auto-refreshes, product updates successfully

### Scenario 2: Token About to Expire
1. Open page when token has < 10 minutes left
2. Background refresh kicks in automatically
3. Edit and save product
4. **Expected:** No interruption, seamless operation

### Scenario 3: Session Expired
1. Manually expire session (clear tokens)
2. Try to save product
3. **Expected:** Clear error message: "Your session has expired. Please refresh the page and try again."

## Configuration

### Session Refresh Intervals

**Background Check:** Every 5 minutes
```typescript
const CHECK_INTERVAL = 5 * 60 * 1000;
```

**Refresh Threshold:** 10 minutes before expiry
```typescript
const REFRESH_THRESHOLD = 10 * 60;
```

**On-Demand Refresh:** 5 minutes before expiry
```typescript
if (timeUntilExpiry < 300) {
  await supabase.auth.refreshSession();
}
```

### Timeout Settings

**Update Timeout:** 30 seconds
```typescript
setTimeout(() => reject(new Error('Update timeout after 30 seconds')), 30000)
```

## Integration Status

### ✅ Implemented
- [x] Session validation in products.service.ts
- [x] Automatic refresh before create/update
- [x] Background session refresh hook
- [x] Integration with ProductManagement
- [x] User-friendly error messages
- [x] Extended timeout for reliability

### 🔄 Recommended for Other Pages
This pattern should be applied to other admin pages:
- User Management
- Transaction Management
- Category Management
- Any page with long-form editing

## Usage Example

```typescript
// In any admin component that needs session protection
import { useSessionRefresh } from '../../hooks/useSessionRefresh';

const MyAdminComponent = () => {
  // Add this line to enable automatic session refresh
  useSessionRefresh();
  
  // ... rest of component
};
```

## Monitoring

Check browser console for session status:
```
🔐 Session status:
  expiresAt: 2025-11-25T15:30:00.000Z
  timeUntilExpiry: 45 minutes
  needsRefresh: false

🔄 Token expiring soon, refreshing session...
✅ Session refreshed successfully
🔐 New expiry: 2025-11-25T16:30:00.000Z
```

## Conclusion

The session timeout issue is now fully resolved. Users can:
- Edit products without time pressure
- Stay on the page for extended periods
- Experience seamless operation with automatic token refresh
- Get clear guidance if manual intervention is needed

The solution is **production-ready** and maintains full integration with existing functionality.
