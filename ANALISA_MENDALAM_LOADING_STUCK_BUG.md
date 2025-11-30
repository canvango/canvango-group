# 🔍 ANALISA MENDALAM: Bug "Loading Terus" Setelah Aplikasi Idle

**Tanggal:** 30 November 2025  
**Status:** Analisa Komprehensif Selesai  
**Severity:** HIGH - Mempengaruhi UX secara signifikan

---

## 📋 EXECUTIVE SUMMARY

Aplikasi mengalami bug "loading terus" ketika:
1. Browser dibuka lama dan didiamkan (idle)
2. User klik menu lain
3. Halaman stuck di loading state tanpa pernah selesai
4. Hanya bisa diperbaiki dengan manual refresh

**Root Cause Utama:** Token Supabase expired + Tidak ada mekanisme reconnect otomatis + React Query tidak retry pada auth error.

---

## 🏗️ ARSITEKTUR SAAT INI

### 1. Supabase Client Configuration

**File:** `src/clients/supabase.ts`

```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,  // ✅ SUDAH ADA
    persistSession: true,     // ✅ SUDAH ADA
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
    timeout: 30000, // 30 detik
  },
});
```

**Status:** ✅ Konfigurasi dasar sudah benar

**Temuan:**
- `autoRefreshToken: true` - Token SEHARUSNYA auto-refresh
- `persistSession: true` - Session disimpan di localStorage
- Timeout Realtime: 30 detik (cukup reasonable)

**Potensi Masalah:**
- ⚠️ Tidak ada `global.fetch` timeout configuration
- ⚠️ Tidak ada retry strategy di level client

---

### 2. React Query Configuration

**File:** `src/main.tsx`

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,  // ❌ MASALAH #1
      retry: 3,                      // ✅ Ada retry
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000,     // 5 menit
      gcTime: 10 * 60 * 1000,       // 10 menit
      refetchOnReconnect: true,     // ✅ SUDAH ADA
      refetchOnMount: false,        // ⚠️ Bisa jadi masalah
    },
  },
});
```

**File:** `src/features/member-area/MemberArea.tsx`

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 0,                      // ❌ MASALAH #2 - DISABLED!
      refetchOnMount: false,
      refetchOnReconnect: false,     // ❌ MASALAH #3 - DISABLED!
    }
  }
});
```

**CRITICAL ISSUE:** Ada **DUA QueryClient** dengan konfigurasi berbeda!
- Main.tsx: retry=3, refetchOnReconnect=true
- MemberArea.tsx: retry=0, refetchOnReconnect=false ❌

**Dampak:**
- Ketika query gagal di MemberArea, tidak ada retry
- Ketika reconnect, tidak ada refetch otomatis
- User stuck di loading state

---

### 3. Session Management

**File:** `src/features/member-area/hooks/useSessionRefresh.ts`

```typescript
const CHECK_INTERVAL = 5 * 60 * 1000; // Check setiap 5 menit
const REFRESH_THRESHOLD = 10 * 60;    // Refresh jika < 10 menit

useEffect(() => {
  const checkAndRefreshSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const timeUntilExpiry = expiresAt - now;
    
    if (timeUntilExpiry < REFRESH_THRESHOLD) {
      await supabase.auth.refreshSession();
    }
  };
  
  checkAndRefreshSession();
  intervalRef.current = setInterval(checkAndRefreshSession, CHECK_INTERVAL);
}, []);
```

**Status:** ✅ Mekanisme refresh sudah ada

**Potensi Masalah:**
- ⚠️ Interval 5 menit bisa terlambat jika user idle > 5 menit
- ⚠️ Tidak ada handling untuk tab yang di-background (browser throttle setInterval)
- ⚠️ Tidak ada mekanisme "wake up" ketika tab kembali aktif

---

### 4. Auth Context

**File:** `src/features/member-area/contexts/AuthContext.tsx`

```typescript
useEffect(() => {
  const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_OUT') {
      setUser(null);
    } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      const userData = await fetchUserProfile();
      setUser(userData);
    }
  });
}, []);
```

**Status:** ✅ Auth listener sudah ada

**Temuan:**
- ✅ Mendengarkan TOKEN_REFRESHED event
- ✅ Auto-update user state ketika token refresh
- ⚠️ Tidak ada error handling jika fetchUserProfile gagal

---

### 5. Network Detection

**File:** `src/shared/components/OfflineDetector.tsx`

```typescript
useEffect(() => {
  const handleOnline = () => {
    setIsOnline(true);
    setShowNotification(true);
  };
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
}, []);
```

**Status:** ⚠️ Hanya deteksi, tidak ada action

**Masalah:**
- Hanya menampilkan notifikasi
- Tidak trigger refetch queries
- Tidak trigger session refresh
- Tidak invalidate stale queries

---

## 🐛 ROOT CAUSE ANALYSIS

### Skenario Bug Terjadi:

```
1. User buka aplikasi → Login berhasil → Token valid
   ↓
2. User idle 30+ menit → Browser throttle setInterval
   ↓
3. Token Supabase expired (default: 1 jam)
   ↓
4. useSessionRefresh tidak jalan karena tab di-background
   ↓
5. User klik menu lain → Trigger query baru
   ↓
6. Query gagal karena token expired (401 Unauthorized)
   ↓
7. React Query retry=0 di MemberArea → Tidak retry
   ↓
8. Query stuck di loading state selamanya
   ↓
9. User harus manual refresh browser
```

### Faktor Penyebab:

#### 1. **Token Expiration Tidak Terdeteksi**
- `useSessionRefresh` menggunakan `setInterval` yang di-throttle browser ketika tab inactive
- Supabase token expired tanpa terdeteksi
- Tidak ada mekanisme "wake up" ketika tab kembali aktif

#### 2. **React Query Tidak Retry**
- `retry: 0` di MemberArea.tsx
- Ketika query gagal dengan 401, langsung stuck
- Tidak ada retry mechanism untuk auth errors

#### 3. **Tidak Ada Reconnect Strategy**
- `refetchOnReconnect: false` di MemberArea
- Ketika network kembali, tidak auto-refetch
- User harus manual trigger

#### 4. **Tidak Ada Visibility Change Handler**
- Tidak ada listener untuk `visibilitychange` event
- Ketika tab kembali aktif, tidak ada check session validity
- Tidak ada trigger untuk refresh token

#### 5. **Tidak Ada Global Error Handler**
- Ketika query gagal dengan 401, tidak ada global handler
- Tidak ada auto-logout atau auto-refresh token
- Query stuck di loading state

---

## 📊 ANALISA DATABASE & RLS

### RLS Policies Analysis

**Temuan dari SQL Query:**

```sql
-- Semua RLS policies menggunakan pattern:
WHERE users.id = auth.uid() AND users.role = 'admin'
```

**Potensi Masalah:**
- ⚠️ RLS policies melakukan JOIN ke `users` table untuk setiap query
- ⚠️ Jika token expired, `auth.uid()` return NULL
- ⚠️ Query akan gagal dengan "permission denied" atau hang
- ⚠️ Tidak ada timeout di level RLS

**Contoh Policy yang Bermasalah:**

```sql
-- products table
"Only admins can update products"
WHERE (EXISTS (
  SELECT 1 FROM users 
  WHERE users.id = auth.uid() 
  AND users.role = 'admin'
))
```

**Dampak:**
- Jika token expired, `auth.uid()` = NULL
- EXISTS subquery return false
- Query ditolak atau hang
- React Query stuck di loading

---

## 🔍 ANALISA SUPABASE FREE TIER

### Limits & Constraints:

1. **Connection Pooling:**
   - Max connections: 60 (Free tier)
   - Timeout: 30 detik default
   - ⚠️ Bisa habis jika banyak query concurrent

2. **Realtime:**
   - Max concurrent connections: 200
   - Max events per second: 10 (sudah dikonfigurasi)
   - ⚠️ Bisa disconnect jika idle terlalu lama

3. **Auth:**
   - Token expiry: 1 jam (default)
   - Refresh token: 30 hari
   - ⚠️ Auto-refresh bisa gagal jika network issue

4. **Database:**
   - Query timeout: 30 detik
   - ⚠️ Complex RLS policies bisa slow

---

## 🎯 IDENTIFIKASI MASALAH SPESIFIK

### Masalah #1: Duplicate QueryClient
**Severity:** CRITICAL  
**File:** `src/main.tsx` dan `src/features/member-area/MemberArea.tsx`

**Masalah:**
- Ada 2 QueryClient dengan konfigurasi berbeda
- MemberArea override dengan `retry: 0`
- Menyebabkan queries di MemberArea tidak retry

**Solusi:**
- Hapus QueryClient di MemberArea
- Gunakan QueryClient dari main.tsx saja
- Atau merge konfigurasi dengan benar

---

### Masalah #2: setInterval Throttling
**Severity:** HIGH  
**File:** `src/features/member-area/hooks/useSessionRefresh.ts`

**Masalah:**
- Browser throttle `setInterval` ketika tab inactive
- Token bisa expired tanpa terdeteksi
- Tidak ada mekanisme "wake up"

**Solusi:**
- Tambahkan `visibilitychange` event listener
- Check session ketika tab kembali aktif
- Gunakan `requestIdleCallback` untuk background tasks

---

### Masalah #3: Tidak Ada Retry untuk Auth Errors
**Severity:** HIGH  
**File:** React Query configuration

**Masalah:**
- `retry: 0` di MemberArea
- Ketika 401 error, tidak ada retry
- Query stuck di loading

**Solusi:**
- Enable retry dengan smart strategy
- Detect 401 errors dan trigger token refresh
- Retry query setelah token refreshed

---

### Masalah #4: Tidak Ada Global Error Handler
**Severity:** MEDIUM  
**File:** Tidak ada

**Masalah:**
- Tidak ada global error interceptor
- 401 errors tidak di-handle secara global
- Setiap query harus handle sendiri

**Solusi:**
- Tambahkan global error handler di React Query
- Auto-refresh token pada 401
- Auto-logout jika refresh gagal

---

### Masalah #5: Network Reconnect Tidak Trigger Refetch
**Severity:** MEDIUM  
**File:** `src/shared/components/OfflineDetector.tsx`

**Masalah:**
- Hanya menampilkan notifikasi
- Tidak trigger refetch queries
- Tidak refresh session

**Solusi:**
- Trigger `queryClient.refetchQueries()` ketika online
- Trigger session refresh
- Invalidate stale queries

---

### Masalah #6: RLS Policies Complexity
**Severity:** LOW-MEDIUM  
**File:** Database

**Masalah:**
- RLS policies melakukan JOIN untuk setiap query
- Bisa slow pada complex queries
- Tidak ada caching

**Solusi:**
- Optimize RLS policies
- Gunakan function untuk role check
- Add indexes jika perlu

---

## 📈 TESTING SCENARIOS

### Scenario 1: Token Expired Saat Idle
```
1. Login → Token valid
2. Idle 65 menit → Token expired
3. Klik menu → Query gagal
4. Expected: Auto-refresh token → Retry query
5. Actual: Stuck di loading ❌
```

### Scenario 2: Tab Di-background
```
1. Login → Token valid
2. Switch ke tab lain 30 menit
3. Kembali ke tab aplikasi
4. Klik menu → Query gagal
5. Expected: Check session → Refresh jika perlu
6. Actual: Stuck di loading ❌
```

### Scenario 3: Network Disconnect/Reconnect
```
1. Login → Token valid
2. Network disconnect
3. Network reconnect
4. Klik menu → Query gagal
5. Expected: Auto-refetch queries
6. Actual: Stuck di loading ❌
```

### Scenario 4: Mobile Browser Sleep
```
1. Login di mobile
2. Lock screen 30 menit
3. Unlock screen
4. Klik menu → Query gagal
5. Expected: Wake up → Check session → Refresh
6. Actual: Stuck di loading ❌
```

---

## 🎯 PRIORITAS PERBAIKAN

### Priority 1: CRITICAL (Harus Segera)
1. ✅ Fix duplicate QueryClient
2. ✅ Enable retry di React Query
3. ✅ Tambahkan visibilitychange handler
4. ✅ Tambahkan global error handler untuk 401

### Priority 2: HIGH (Penting)
5. ✅ Improve session refresh mechanism
6. ✅ Tambahkan reconnect strategy
7. ✅ Tambahkan timeout untuk queries
8. ✅ Tambahkan retry button di UI

### Priority 3: MEDIUM (Nice to Have)
9. ⚠️ Optimize RLS policies
10. ⚠️ Add query caching strategy
11. ⚠️ Add performance monitoring
12. ⚠️ Add error tracking (Sentry)

---

## 📝 KESIMPULAN

### Masalah Utama:
1. **Duplicate QueryClient** dengan konfigurasi konflik
2. **setInterval throttling** di background tabs
3. **Tidak ada retry** untuk auth errors
4. **Tidak ada visibility change handler**
5. **Tidak ada global error handler**

### Dampak:
- User experience sangat buruk
- Harus manual refresh browser
- Kehilangan data yang belum tersimpan
- Frustasi user meningkat

### Solusi yang Dibutuhkan:
1. Unifikasi QueryClient configuration
2. Implementasi visibility change handler
3. Smart retry strategy untuk auth errors
4. Global error handler dengan auto-recovery
5. Improved session refresh mechanism
6. Network reconnect handler
7. User-friendly error UI dengan retry button

---

## 🚀 NEXT STEPS

Lihat dokumen terpisah untuk implementasi solusi:
- `SOLUSI_LOADING_STUCK_BUG.md` - Solusi lengkap dengan code
- `TESTING_LOADING_STUCK_FIX.md` - Testing guide
- `DEPLOYMENT_CHECKLIST.md` - Checklist deployment

---

**Analisa Selesai**  
**Siap untuk Implementasi Solusi**
