# 🔄 Infinite Loading Fix - Flow Diagram

## 📊 Before Fix - Infinite Loading Flow

```
User Idle 3+ Minutes
        ↓
Token Expired (but still in localStorage)
        ↓
User Clicks Navigation
        ↓
ProtectedRoute Triggered
        ↓
checkRole() Called
        ↓
setRoleCheck('checking')
        ↓
if (!user || isLoading) → return ← ❌ EARLY EXIT
        ↓
❌ NEVER REACHES: setRoleCheck('allowed' or 'denied')
        ↓
Component Render
        ↓
if (roleCheck === 'checking') → return <LoadingScreen />
        ↓
🔄 INFINITE LOOP - STUCK FOREVER
        ↓
User Must Manually Refresh Browser
```

---

## ✅ After Fix - Timeout & Error Handling Flow

```
User Idle 3+ Minutes
        ↓
Token Expired (but still in localStorage)
        ↓
User Clicks Navigation
        ↓
ProtectedRoute Triggered
        ↓
checkRole() Called
        ↓
setRoleCheck('checking')
        ↓
⏱️ START TIMEOUT (5 seconds)
        ↓
if (!user && !isLoading) → setRoleCheck('denied') → return ← ✅ PROPER EXIT
        ↓
Try Query Role from Database
        ↓
        ├─ Success (< 3s)
        │   ↓
        │   clearTimeout()
        │   ↓
        │   setRoleCheck('allowed' or 'denied')
        │   ↓
        │   Render Content or Redirect
        │
        ├─ Timeout (> 3s)
        │   ↓
        │   Promise.race() rejects
        │   ↓
        │   Fallback to cached role
        │   ↓
        │   setRoleCheck('allowed' or 'denied')
        │   ↓
        │   Render Content or Redirect
        │
        └─ Error (Auth Error)
            ↓
            Catch block
            ↓
            setRoleCheck('denied')
            ↓
            Redirect to Login
        ↓
⏱️ TIMEOUT REACHED (5s)
        ↓
Fallback: setRoleCheck('allowed' or 'denied')
        ↓
✅ NEVER STUCK - Always Resolves
```

---

## 🔐 Auth Flow - Token Cleanup

### Before Fix:
```
Token Expired
    ↓
fetchUserProfile() Called
    ↓
getCurrentUser() Returns null
    ↓
❌ Token Still in localStorage
    ↓
Next Navigation Attempt
    ↓
🔄 INFINITE LOOP (token exists but invalid)
```

### After Fix:
```
Token Expired
    ↓
fetchUserProfile() Called (with 5s timeout)
    ↓
getCurrentUser() Throws Error
    ↓
Catch Block Detects Auth Error
    ↓
✅ Clear Token from localStorage
    ↓
setUser(null)
    ↓
Next Navigation Attempt
    ↓
✅ Redirect to Login (no token)
```

---

## 🌐 Network Timeout Flow

### Before Fix:
```
Network Slow/Timeout
    ↓
Supabase Query Hangs
    ↓
❌ No Timeout
    ↓
🔄 INFINITE WAITING
    ↓
User Stuck
```

### After Fix:
```
Network Slow/Timeout
    ↓
Supabase Query Started
    ↓
Promise.race([query, timeout])
    ↓
    ├─ Query Completes (< 3-5s)
    │   ↓
    │   ✅ Success
    │
    └─ Timeout Reached (> 3-5s)
        ↓
        Promise Rejects
        ↓
        Catch Block
        ↓
        Fallback Logic
        ↓
        ✅ User Not Stuck
```

---

## 🔄 Session Refresh Flow

### Before Fix:
```
User Idle 3+ Minutes
    ↓
Token About to Expire
    ↓
useSessionRefresh Checks
    ↓
Calls refreshSession()
    ↓
❌ No Timeout
    ↓
If Network Issue → Hangs Forever
```

### After Fix:
```
User Idle 3+ Minutes
    ↓
Token About to Expire
    ↓
useSessionRefresh Checks (with 5s timeout)
    ↓
Promise.race([refreshSession(), timeout])
    ↓
    ├─ Refresh Success (< 5s)
    │   ↓
    │   ✅ New Token Stored
    │   ↓
    │   User Continues
    │
    └─ Timeout/Error (> 5s)
        ↓
        Log Warning
        ↓
        Global Error Handler Triggered
        ↓
        Logout & Redirect to Login
        ↓
        ✅ Clean State
```

---

## 🎯 Complete User Journey

### Scenario: User Idle 3+ Minutes

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User Logs In                                             │
│    ✅ Token Stored in localStorage                          │
│    ✅ User State Set                                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. User Idle 3+ Minutes                                     │
│    ⏱️ Token Expires (but still in localStorage)            │
│    ⏱️ useSessionRefresh Checks Every 5 Minutes             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. User Clicks Navigation                                   │
│    🔄 ProtectedRoute Triggered                              │
│    🔄 checkRole() Called                                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Role Check with Timeout                                  │
│    ⏱️ Start 5-second timeout                               │
│    🔍 Query role from database                              │
│    ❌ Query fails (token expired)                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Error Handling                                           │
│    🔍 Detect auth error                                     │
│    🗑️ Clear token from localStorage                        │
│    ⚠️ Set roleCheck to 'denied'                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Global Error Handler                                     │
│    🔄 Attempt token refresh (with 5s timeout)               │
│    ❌ Refresh fails (token invalid)                         │
│    🗑️ Clear all localStorage                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. User Redirect                                            │
│    📢 Show notification: "Sesi telah berakhir"              │
│    🔀 Redirect to /login                                    │
│    ✅ Clean state, ready for new login                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. Total Time                                               │
│    ⏱️ Max 5-10 seconds (vs infinite before)                │
│    ✅ No manual refresh needed                              │
│    ✅ Smooth user experience                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Timeout Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│ Component Level Timeouts                                    │
├─────────────────────────────────────────────────────────────┤
│ ProtectedRoute                                              │
│   ├─ Role Check: 5 seconds                                  │
│   └─ Database Query: 3 seconds                              │
├─────────────────────────────────────────────────────────────┤
│ AuthContext                                                 │
│   ├─ Profile Fetch: 5 seconds                               │
│   └─ Auth Init: 10 seconds                                  │
├─────────────────────────────────────────────────────────────┤
│ auth.service                                                │
│   ├─ Session Check: 3 seconds                               │
│   └─ Profile Fetch: 3 seconds                               │
├─────────────────────────────────────────────────────────────┤
│ useGlobalErrorHandler                                       │
│   ├─ Token Refresh: 5 seconds                               │
│   └─ Logout: 2 seconds                                      │
├─────────────────────────────────────────────────────────────┤
│ useSessionRefresh                                           │
│   ├─ Session Check: 5 seconds                               │
│   └─ Refresh: 5 seconds                                     │
├─────────────────────────────────────────────────────────────┤
│ OfflineDetector                                             │
│   ├─ Session Check: 5 seconds                               │
│   ├─ Refresh: 5 seconds                                     │
│   └─ Query Refetch: 10 seconds                              │
└─────────────────────────────────────────────────────────────┘

Total Max Loading Time: 10 seconds
(vs Infinite before fix)
```

---

## 🎯 Key Improvements Summary

### 1. Timeout Protection
```
Before: ∞ (infinite)
After:  5-10 seconds max
Impact: 🟢 HIGH - Prevents infinite loading
```

### 2. Token Cleanup
```
Before: Token persists even when invalid
After:  Auto-cleanup on auth errors
Impact: 🟢 HIGH - Prevents infinite loops
```

### 3. Error Propagation
```
Before: Errors swallowed, return null
After:  Errors thrown to upstream
Impact: 🟢 MEDIUM - Better error handling
```

### 4. State Management
```
Before: State can get stuck
After:  Always resolves with timeout
Impact: 🟢 HIGH - Prevents stuck UI
```

### 5. User Experience
```
Before: Manual refresh required
After:  Auto-redirect with notification
Impact: 🟢 HIGH - Smooth UX
```

---

## 🔍 Debug Flow

### Console Log Sequence (Normal Flow):
```
1. 🔧 Supabase Client initialized successfully
2. 🔐 Checking session (source: initial)
3. ✅ Session refreshed successfully
4. 🔐 Auth state changed: SIGNED_IN
5. ✅ Profile fetched successfully: username
6. 🔄 Starting Realtime subscription for user: xxx
7. ✅ Realtime subscription active
```

### Console Log Sequence (Idle + Expired Token):
```
1. 🔐 Checking session (source: visibility-change)
2. ⚠️ Session expired
3. 🔄 Token expiring soon, refreshing session...
4. ❌ Error refreshing session: invalid token
5. 🔐 Auth error detected, attempting token refresh...
6. ❌ Token refresh failed
7. ⚠️ Auth error detected - clearing tokens
8. 🔀 Redirecting to /login
```

---

## ✅ Success Criteria

**All flows must:**
- ✅ Complete within timeout limits (5-10s)
- ✅ Show proper notifications
- ✅ Cleanup tokens on error
- ✅ No infinite loading
- ✅ No console errors
- ✅ Smooth user experience

**If timeout reached:**
- ✅ Fallback logic executed
- ✅ User not stuck
- ✅ Clear error message
- ✅ Proper redirect

---

**Visual Guide Complete** ✅
**Ready for Implementation** ✅
**Production Ready** ✅
