# Verified BM Guest Access Fix

## 🐛 Problem

After implementing `tripay-security-hardening` spec, guest users were redirected to `/login` when visiting `/jasa-verified-bm` page.

### Root Cause

1. **Global Error Handler** added in tripay-security-hardening tries to refresh token for ALL auth-related errors
2. Guest users have no session, triggering "No active session to refresh" error
3. Global error handler attempts token refresh for guest (fails)
4. Failed refresh triggers logout and redirect to `/login`

### Error Flow (Before Fix)

```
Guest visits /jasa-verified-bm
    ↓
useVerifiedBMStats() called
    ↓
fetchVerifiedBMStats() returns empty data ✅
    ↓
BUT: Global error handler detects "No active session"
    ↓
Tries to refresh token (guest has no token)
    ↓
Token refresh fails
    ↓
Logout + Redirect to /login ❌
```

## ✅ Solution

**Two-part fix:**

1. Modified service functions to return empty data for guest users (no error thrown)
2. Modified global error handler to skip token refresh for guest users (no session)

### Changes Made

#### Part 1: Service Layer

**File:** `src/features/member-area/services/verified-bm.service.ts`

#### 1. `fetchVerifiedBMStats()`

**Before:**
```typescript
const { data: { user }, error: authError } = await supabase.auth.getUser();
if (authError) throw authError;
if (!user) throw new Error('Not authenticated'); // ❌ Throws error
```

**After:**
```typescript
const { data: { user }, error: authError } = await supabase.auth.getUser();

// Return empty stats for guest users (don't throw error)
if (authError || !user) {
  return {
    totalRequests: 0,
    pendingRequests: 0,
    processingRequests: 0,
    completedRequests: 0,
    failedRequests: 0,
  }; // ✅ Returns empty data
}
```

#### 2. `fetchVerifiedBMRequests()`

**Before:**
```typescript
const { data: { user }, error: authError } = await supabase.auth.getUser();
if (authError) throw authError;
if (!user) throw new Error('Not authenticated'); // ❌ Throws error
```

**After:**
```typescript
const { data: { user }, error: authError } = await supabase.auth.getUser();

// Return empty array for guest users (don't throw error)
if (authError || !user) {
  return []; // ✅ Returns empty array
}
```

## 🎯 Behavior After Fix

### Guest User
- ✅ Can visit `/jasa-verified-bm` page
- ✅ Stats cards show 0 (no requests)
- ✅ Requests table is empty
- ✅ Form shows "Login Untuk Melanjutkan" button
- ✅ No redirect to login page

### Authenticated User
- ✅ Can visit `/jasa-verified-bm` page
- ✅ Stats cards show real data
- ✅ Requests table shows user's requests
- ✅ Form shows "Submit Request" button
- ✅ Can create new requests

#### Part 2: Global Error Handler

**File:** `src/shared/hooks/useGlobalErrorHandler.ts`

**Before:**
```typescript
const handleQueryError = async (error: any) => {
  const isAuthError = /* check for auth errors */;
  
  if (!isAuthError) return;
  
  // ❌ Immediately tries to refresh token
  if (isRefreshingRef.current) return;
  // ... refresh logic
}
```

**After:**
```typescript
const handleQueryError = async (error: any) => {
  const isAuthError = /* check for auth errors */;
  
  if (!isAuthError) return;
  
  // ✅ Check if user has session before refresh
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    console.log('👤 No active session found (guest user), skipping token refresh');
    return; // Guest user, no need to refresh or logout
  }
  
  if (isRefreshingRef.current) return;
  // ... refresh logic
}
```

## 📁 Files Modified

1. ✅ `src/features/member-area/services/verified-bm.service.ts`
2. ✅ `src/shared/hooks/useGlobalErrorHandler.ts`

## ✅ Testing

### Manual Testing

**Guest User:**
```bash
1. Open incognito browser
2. Visit http://localhost:5173/jasa-verified-bm
3. ✅ Page loads without redirect
4. ✅ Stats show 0
5. ✅ Table is empty
6. ✅ Form shows "Login" button
```

**Authenticated User:**
```bash
1. Login to application
2. Visit /jasa-verified-bm
3. ✅ Page loads
4. ✅ Stats show real data
5. ✅ Table shows requests
6. ✅ Form shows "Submit" button
```

## 🚀 Build Status

```bash
npm run build
✓ built in 24.37s
```

No errors. Ready to deploy.

## 📝 Notes

- **Security maintained:** Guests cannot create requests (form shows login button)
- **No RLS changes needed:** Database policies remain secure
- **Minimal changes:** Only 2 files modified (service + error handler)
- **Backward compatible:** Authenticated users work as before
- **Performance improved:** No unnecessary token refresh attempts for guests

## 🔍 Why This Fix Works

### Problem Analysis

The global error handler was designed to catch auth errors and refresh tokens. However, it didn't distinguish between:
- **Authenticated users with expired tokens** (need refresh)
- **Guest users with no session** (don't need refresh)

### Solution Logic

1. **Service layer:** Return empty data for guests (no error = no trigger)
2. **Error handler:** Check session before refresh (guest = skip refresh)

This two-layer approach ensures:
- Guest users can browse freely
- Authenticated users get automatic token refresh
- No false-positive logouts for guests
