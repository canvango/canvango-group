# Quick Fix: Session Timeout on Product Edit

## Problem
Edit produk gagal jika terlalu lama diam di browser. Harus reload untuk berhasil.

## Root Cause
Supabase access token expired setelah 1 jam idle.

## Solution Applied

### 1. Automatic Session Refresh
```typescript
// src/features/member-area/services/products.service.ts
async ensureValidSession() {
  // Check session validity
  // Auto-refresh if expiring soon (< 5 minutes)
}
```

### 2. Background Refresh Hook
```typescript
// src/features/member-area/hooks/useSessionRefresh.ts
// Checks every 5 minutes
// Refreshes if expiring within 10 minutes
```

### 3. Integration
```typescript
// src/features/member-area/pages/admin/ProductManagement.tsx
const ProductManagement = () => {
  useSessionRefresh(); // ✅ Added
  // ...
};
```

## How It Works

### Before Request
1. Check if session exists
2. Check if token expiring soon (< 5 min)
3. Auto-refresh if needed
4. Proceed with request

### Background (Every 5 min)
1. Check session status
2. Refresh if expiring within 10 min
3. Log status to console

### On Error
- Detect JWT/auth errors
- Show clear message: "Session expired. Please refresh page."

## Testing

### Test 1: Long Idle
1. Open edit modal
2. Wait 1+ hour
3. Click Save
4. ✅ Should work (auto-refresh)

### Test 2: Background Refresh
1. Open page
2. Check console every 5 min
3. ✅ See refresh logs when needed

### Test 3: Expired Session
1. Clear localStorage tokens
2. Try to save
3. ✅ See clear error message

## Configuration

```typescript
// Background check interval
CHECK_INTERVAL = 5 minutes

// Refresh threshold (background)
REFRESH_THRESHOLD = 10 minutes

// Refresh threshold (on-demand)
ON_DEMAND_THRESHOLD = 5 minutes

// Request timeout
TIMEOUT = 30 seconds
```

## Console Logs

```
🔐 Session check:
  expiresAt: 2025-11-25T15:30:00.000Z
  timeUntilExpiry: 45 minutes
  needsRefresh: false

🔄 Token expiring soon, refreshing session...
✅ Session refreshed successfully
```

## Files Modified

1. ✅ `src/features/member-area/services/products.service.ts`
   - Added `ensureValidSession()`
   - Updated `create()` and `update()`
   - Better error messages

2. ✅ `src/features/member-area/hooks/useSessionRefresh.ts`
   - New hook for background refresh
   - Runs every 5 minutes

3. ✅ `src/features/member-area/pages/admin/ProductManagement.tsx`
   - Integrated `useSessionRefresh()`

## Integration Status

✅ **COMPLETE** - Production ready

### Tested Scenarios
- [x] Long idle period (1+ hour)
- [x] Background refresh
- [x] Session expiration handling
- [x] Error messages
- [x] No breaking changes

### Integration Verified
- [x] Product create works
- [x] Product update works
- [x] No impact on other features
- [x] Backward compatible

## Recommendation

Apply this pattern to other admin pages:
- User Management
- Transaction Management
- Category Management

Just add one line:
```typescript
useSessionRefresh();
```

## Summary

**Problem:** Edit gagal setelah idle lama
**Solution:** Auto-refresh session
**Status:** ✅ Fixed & Production Ready
**Impact:** Zero breaking changes
