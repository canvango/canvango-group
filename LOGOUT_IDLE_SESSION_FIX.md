# Logout Idle Session Fix

## Problem
Ketika user idle di member area selama beberapa menit, logout menjadi sangat lambat dan tidak responsif. User harus reload browser terlebih dahulu baru bisa logout dengan cepat.

## Root Cause
1. **Expired Supabase Session** - Setelah idle, session token sudah expired/stale
2. **Network Timeout** - `supabase.auth.signOut()` mencoba menghubungi server dengan session yang invalid, menyebabkan request hang/timeout
3. **Blocking UI** - User state tidak di-clear sampai Supabase logout selesai

## Solution

### 1. Immediate UI Feedback (UX)
```typescript
// Clear user state IMMEDIATELY untuk instant feedback
setUser(null);
```
**Benefit:** User tidak perlu menunggu, UI langsung update

### 2. Server-Side Logout dengan Timeout (Security)
```typescript
// TETAP mencoba logout ke Supabase untuk keamanan
const logoutPromise = authService.logout();
const timeoutPromise = new Promise((_, reject) => 
  setTimeout(() => reject(new Error('Logout timeout')), 3000)
);

await Promise.race([logoutPromise, timeoutPromise]);
```
**Security:** 
- ✅ Session di-revoke di server (jika masih valid)
- ✅ Mencegah session hijacking
- ✅ Audit trail di Supabase Auth logs
- ⏱️ Timeout 3 detik mencegah hanging

### 3. Graceful Error Handling (Reliability)
```typescript
// Handle expired session tanpa error
if (
  error.message?.includes('session_not_found') ||
  error.message?.includes('invalid_token') ||
  error.message?.includes('expired') ||
  error.status === 401
) {
  console.log('Session already expired, proceeding with local cleanup');
  return;
}
```
**Reliability:** Expired session bukan error, tapi kondisi normal setelah idle

### 4. Visual Loading State (UX)
```typescript
// Show "Logging out..." dengan spinning icon
<button disabled={isLoggingOut}>
  <LogOut className={isLoggingOut ? 'animate-spin' : ''} />
  <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
</button>
```
**Benefit:** User tahu proses sedang berjalan

## Files Modified

1. **src/features/member-area/contexts/AuthContext.tsx**
   - Clear user state immediately
   - Add 3-second timeout for logout
   - Continue cleanup even if Supabase logout fails

2. **src/features/member-area/services/auth.service.ts**
   - Handle expired session errors gracefully
   - Ignore network errors during logout
   - Don't throw errors for expected failures

3. **src/features/member-area/components/layout/Header.tsx**
   - Add loading state during logout
   - Show visual feedback (spinning icon + text)
   - Disable button during logout

## Security Analysis

### Scenario 1: Active Session (Normal Case)
```
User clicks logout → Session valid
  ↓
1. UI clears instantly (setUser(null))
2. Supabase.auth.signOut() succeeds (~500ms)
3. Session revoked on server ✅
4. Tokens cleared from localStorage
5. Audit log created in Supabase
```
**Result:** Fully secure, session terminated on server

### Scenario 2: Expired Session (Idle Case)
```
User idle 10+ minutes → Session expired
  ↓
1. UI clears instantly (setUser(null))
2. Supabase.auth.signOut() fails (session_not_found)
3. Error ignored, proceed with cleanup
4. Tokens cleared from localStorage
```
**Result:** Still secure because:
- Session already expired on server (can't be used)
- Tokens removed from client
- No security risk

### Scenario 3: Network Error
```
User offline → No connection
  ↓
1. UI clears instantly (setUser(null))
2. Supabase.auth.signOut() times out (3s)
3. Timeout caught, proceed with cleanup
4. Tokens cleared from localStorage
```
**Result:** Acceptable security:
- User can't make authenticated requests (offline)
- Tokens cleared from client
- Session will expire naturally on server
- Next online action will fail (no valid token)

### Why This Is Secure

**Token-based security:**
- Removing tokens from localStorage prevents reuse
- Server validates tokens on every request
- Expired/invalid tokens are rejected by server
- No token = No access

**Session expiration:**
- Supabase sessions expire automatically (default: 1 hour)
- Expired sessions can't be used even if token exists
- Server-side validation is the ultimate security

**Defense in depth:**
1. **Client-side:** Tokens removed from localStorage
2. **Server-side:** Session revoked (if possible)
3. **Time-based:** Sessions expire automatically
4. **Request-based:** Every request validates token

## Testing

### Test Case 1: Normal Logout (Security Check)
1. Login ke aplikasi
2. Open browser DevTools → Network tab
3. Klik logout
4. ✅ Should see Supabase signOut request (< 1 detik)
5. ✅ UI updates instantly
6. ✅ Check Supabase Auth logs → Logout event recorded

**Security Verification:**
- Session revoked on server ✅
- Tokens cleared from localStorage ✅
- Audit trail exists ✅

### Test Case 2: Idle Session Logout (Expired Token)
1. Login ke aplikasi
2. Idle selama 5-10 menit (biarkan session expire)
3. Open browser DevTools → Console
4. Klik logout
5. ✅ Should see "Session already expired" message
6. ✅ UI updates instantly (< 3 detik max)
7. ✅ No need to reload browser

**Security Verification:**
- Session already expired (can't be used) ✅
- Tokens cleared from localStorage ✅
- No security risk ✅

### Test Case 3: Network Error (Offline)
1. Login ke aplikasi
2. Disconnect internet
3. Klik logout
4. ✅ Should logout instantly after 3s timeout
5. ✅ UI updates immediately

**Security Verification:**
- Tokens cleared from localStorage ✅
- Can't make authenticated requests (offline) ✅
- Session will expire on server ✅

### Test Case 4: Session Hijacking Prevention
1. Login ke aplikasi
2. Copy access token from localStorage
3. Logout normally
4. Try to use copied token in API request
5. ✅ Should fail with 401 Unauthorized

**Security Verification:**
- Token revoked on server ✅
- Old tokens can't be reused ✅

## Benefits

### User Experience (UX)
✅ **Instant logout** - User state cleared immediately, no waiting
✅ **No reload needed** - Works even with expired sessions
✅ **Better feedback** - Visual loading state during logout
✅ **No hanging** - 3-second timeout prevents indefinite waiting

### Security
✅ **Server-side revocation** - Session di-revoke di Supabase (jika valid)
✅ **Audit trail** - Logout tercatat di Supabase Auth logs
✅ **Prevents hijacking** - Active sessions di-terminate di server
✅ **Graceful degradation** - Tetap aman meski network error

### Reliability
✅ **Works offline** - Local cleanup tetap berjalan
✅ **Handles expired sessions** - Tidak error saat session sudah expired
✅ **Network resilient** - Tidak bergantung pada koneksi sempurna

## Technical Details

### Timeout Strategy
- **3 seconds** is enough for normal logout
- Prevents hanging on expired sessions
- Falls back to local cleanup if timeout
- **Security:** Tetap mencoba revoke session di server

### Error Handling Priority
1. **Expired session** → Proceed with cleanup (expected behavior)
2. **Network error** → Proceed with cleanup (offline support)
3. **Other errors** → Log but still cleanup (reliability)

### State Management Flow
```
1. User clicks logout
   ↓
2. setUser(null) → UI instantly updates
   ↓
3. authService.logout() → Revoke session di Supabase (with timeout)
   ↓
4. Clear localStorage → Remove tokens
   ↓
5. Clear CSRF & filters → Complete cleanup
```

### Security Considerations

**Why we still call Supabase logout:**
- ✅ Revokes active sessions on server
- ✅ Prevents session reuse/hijacking
- ✅ Creates audit trail in Supabase logs
- ✅ Invalidates refresh tokens

**Why we use timeout:**
- ⏱️ Expired sessions can't be revoked (already invalid)
- ⏱️ Network issues shouldn't block logout
- ⏱️ User experience > waiting for server response
- ⏱️ Local cleanup is sufficient for security

**Best of both worlds:**
- Active sessions → Properly revoked on server
- Expired sessions → Quick local cleanup
- Network errors → Graceful degradation
