# Verified BM Reload Fix - History Tidak Muncul Saat Reload

## Masalah
Saat browser di-reload, history jasa verified BM tidak muncul. User harus klik tombol Refresh untuk melihat data.

## Root Cause Analysis

### 1. React Query Configuration Issue
```typescript
// ❌ SEBELUM - Konfigurasi yang bermasalah
useQuery({
  queryKey: ['verified-bm-requests'],
  queryFn: fetchVerifiedBMRequests,
  staleTime: 30000,
  retry: false,  // ❌ Tidak retry jika gagal
  initialData: [], // ❌ Menggunakan initial data kosong
  refetchOnMount: true // ❌ Hanya refetch jika data stale
});
```

**Masalah:**
- `retry: false` - Jika query gagal saat pertama kali (misal: user belum authenticated), tidak ada retry
- `initialData: []` - Menampilkan data kosong meskipun query belum selesai
- `refetchOnMount: true` - Hanya refetch jika data sudah stale, tidak selalu refetch

### 2. Error Handling di Service
```typescript
// ❌ SEBELUM - handleSupabaseOperation throw error untuk data kosong
return handleSupabaseOperation(async () => {
  const { data, error } = await supabase
    .from('verified_bm_requests')
    .select('*');
  
  if (error) return { data: null, error };
  return { data: data || [], error: null };
}, 'fetchVerifiedBMRequests');

// handleSupabaseOperation akan throw error jika data === null
// Padahal empty array [] adalah valid untuk user tanpa request
```

**Masalah:**
- `handleSupabaseOperation` throw error jika `data === null`
- Empty array adalah kondisi valid (user belum punya request)
- Error ini menyebabkan query gagal dan tidak retry

## Solusi

### 1. Perbaiki React Query Configuration

```typescript
// ✅ SETELAH - Konfigurasi yang benar
export const useVerifiedBMStats = () => {
  return useQuery({
    queryKey: ['verified-bm-stats'],
    queryFn: fetchVerifiedBMStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2, // ✅ Retry 2 kali jika gagal
    refetchOnMount: 'always', // ✅ SELALU refetch saat mount
    refetchOnWindowFocus: false,
    refetchOnReconnect: true, // ✅ Refetch saat reconnect
  });
};

export const useVerifiedBMRequests = () => {
  return useQuery({
    queryKey: ['verified-bm-requests'],
    queryFn: fetchVerifiedBMRequests,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2, // ✅ Retry 2 kali jika gagal
    refetchOnMount: 'always', // ✅ SELALU refetch saat mount
    refetchOnWindowFocus: false,
    refetchOnReconnect: true, // ✅ Refetch saat reconnect
  });
};
```

**Keuntungan:**
- `retry: 2` - Retry otomatis jika gagal (misal: race condition dengan auth)
- `refetchOnMount: 'always'` - **SELALU** fetch data saat component mount, bahkan jika data masih fresh
- `refetchOnReconnect: true` - Refetch saat koneksi kembali
- Hapus `initialData` - Biarkan React Query handle loading state dengan benar

### 2. Perbaiki Error Handling di Service

```typescript
// ✅ SETELAH - Direct error handling tanpa wrapper
export const fetchVerifiedBMStats = async (): Promise<VerifiedBMRequestStats> => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) throw new Error('Not authenticated');

    const { data: requests, error } = await supabase
      .from('verified_bm_requests')
      .select('status')
      .eq('user_id', user.id);

    if (error) throw error;

    // ✅ Empty array adalah valid - user mungkin belum punya request
    const reqs = requests || [];
    const stats: VerifiedBMRequestStats = {
      totalRequests: reqs.length,
      pendingRequests: reqs.filter(r => r.status === 'pending').length,
      processingRequests: reqs.filter(r => r.status === 'processing').length,
      completedRequests: reqs.filter(r => r.status === 'completed').length,
      failedRequests: reqs.filter(r => r.status === 'failed').length,
    };

    return stats;
  } catch (error: any) {
    console.error('fetchVerifiedBMStats error:', error);
    throw new Error(error.message || 'Gagal mengambil statistik');
  }
};

export const fetchVerifiedBMRequests = async (): Promise<VerifiedBMRequest[]> => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('verified_bm_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // ✅ Empty array adalah valid - user mungkin belum punya request
    return data || [];
  } catch (error: any) {
    console.error('fetchVerifiedBMRequests error:', error);
    throw new Error(error.message || 'Gagal mengambil daftar request');
  }
};
```

**Keuntungan:**
- Tidak menggunakan `handleSupabaseOperation` yang throw error untuk null data
- Empty array dianggap sebagai hasil valid
- Error handling lebih spesifik dan jelas
- Console log untuk debugging

## Alur Data Setelah Perbaikan

### Saat Browser Reload:
```
1. User reload browser
   ↓
2. AuthContext initialize
   ↓
3. VerifiedBMService mount
   ↓
4. useVerifiedBMStats & useVerifiedBMRequests dipanggil
   ↓
5. refetchOnMount: 'always' → SELALU fetch data
   ↓
6. Service fetch data dari Supabase
   ↓
7. Empty array [] adalah valid (bukan error)
   ↓
8. Data ditampilkan (atau empty state jika kosong)
```

### Jika Query Gagal:
```
1. Query gagal (misal: race condition)
   ↓
2. retry: 2 → Retry otomatis 2 kali
   ↓
3. Jika masih gagal → Error state
   ↓
4. User bisa klik Refresh untuk manual retry
```

## Testing Checklist

### Test 1: Reload Browser
- [x] Buka halaman Jasa Verified BM
- [x] Reload browser (F5 atau Ctrl+R)
- [x] **EXPECTED:** History langsung muncul tanpa perlu klik Refresh
- [x] **ACTUAL:** ✅ History muncul otomatis

### Test 2: User Baru (Tanpa History)
- [x] Login dengan user baru yang belum pernah request
- [x] Buka halaman Jasa Verified BM
- [x] **EXPECTED:** Status cards menampilkan 0, table menampilkan empty state
- [x] **ACTUAL:** ✅ Empty state ditampilkan dengan benar

### Test 3: Network Error
- [x] Buka halaman Jasa Verified BM
- [x] Matikan koneksi internet
- [x] Reload browser
- [x] **EXPECTED:** Error state dengan retry otomatis
- [x] Nyalakan koneksi internet
- [x] **EXPECTED:** Data otomatis refetch
- [x] **ACTUAL:** ✅ Refetch otomatis saat reconnect

### Test 4: Submit Request
- [x] Submit request baru
- [x] **EXPECTED:** Stats dan table otomatis update
- [x] **ACTUAL:** ✅ Update otomatis via invalidateQueries

## File yang Diubah

1. **src/features/member-area/hooks/useVerifiedBM.ts**
   - Ubah `retry: false` → `retry: 2`
   - Ubah `refetchOnMount: true` → `refetchOnMount: 'always'`
   - Tambah `refetchOnReconnect: true`
   - Hapus `initialData`
   - Tingkatkan `staleTime` ke 5 menit

2. **src/features/member-area/services/verified-bm.service.ts**
   - Hapus penggunaan `handleSupabaseOperation`
   - Implementasi direct error handling
   - Empty array dianggap valid (bukan error)
   - Tambah console.error untuk debugging

## Keuntungan Perbaikan

1. **Reliable Data Loading**
   - Data selalu di-fetch saat component mount
   - Tidak bergantung pada cache yang mungkin stale

2. **Better Error Handling**
   - Retry otomatis jika gagal
   - Empty data tidak dianggap error
   - Error message lebih spesifik

3. **Better UX**
   - User tidak perlu klik Refresh setelah reload
   - Data selalu up-to-date
   - Loading state yang jelas

4. **Network Resilience**
   - Refetch otomatis saat reconnect
   - Retry mechanism untuk transient errors

## Status
✅ **SELESAI** - History muncul otomatis saat reload, tidak perlu klik Refresh
