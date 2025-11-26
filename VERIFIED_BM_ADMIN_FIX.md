# Verified BM Admin Panel Fix

## Masalah
Halaman admin Verified BM Management tidak menampilkan data. Error di console:
```
Could not find a relationship between 'verified_bm_requests' and 'users' in the schema cache
```

## Root Cause

### 1. Foreign Key Mismatch
```sql
-- Foreign key mengarah ke auth.users, bukan public.users
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
```

**Masalah:**
- Tabel `verified_bm_requests` memiliki foreign key ke `auth.users(id)`
- Query Supabase mencoba join dengan `public.users` table
- Supabase tidak bisa menemukan relationship karena schema berbeda

### 2. Query Join Syntax
```typescript
// ❌ SEBELUM - Menggunakan foreign key relationship
.select(`
  *,
  users!inner(email, full_name)
`)
```

**Masalah:**
- Syntax `users!inner()` mengharapkan foreign key relationship
- Foreign key ada tapi ke schema berbeda (`auth.users` vs `public.users`)
- Query gagal dengan error PGRST200

## Solusi

### 1. Manual Join Instead of Foreign Key Relationship

```typescript
// ✅ SETELAH - Manual join dengan 2 query terpisah
export const fetchAllVerifiedBMRequests = async (
  filters?: {
    status?: string;
    search?: string;
  }
): Promise<VerifiedBMRequestWithUser[]> => {
  try {
    // 1. Fetch requests
    let query = supabase
      .from('verified_bm_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    const { data: requests, error: requestsError } = await query;
    if (requestsError) throw requestsError;
    if (!requests || requests.length === 0) return [];

    // 2. Get unique user IDs
    const userIds = [...new Set(requests.map(r => r.user_id))];

    // 3. Fetch user data from public.users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, full_name')
      .in('id', userIds);

    if (usersError) throw usersError;

    // 4. Create user map for quick lookup
    const userMap = new Map(users?.map(u => [u.id, u]) || []);

    // 5. Combine data
    let combinedRequests: VerifiedBMRequestWithUser[] = requests.map((r: any) => {
      const user = userMap.get(r.user_id);
      return {
        ...r,
        user_email: user?.email || 'Unknown',
        user_full_name: user?.full_name || 'Unknown User',
      };
    });

    // 6. Apply search filter after combining
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      combinedRequests = combinedRequests.filter(r =>
        r.id.toLowerCase().includes(searchLower) ||
        r.user_email?.toLowerCase().includes(searchLower) ||
        r.user_full_name?.toLowerCase().includes(searchLower)
      );
    }

    return combinedRequests;
  } catch (error: any) {
    console.error('fetchAllVerifiedBMRequests error:', error);
    throw new Error(error.message || 'Gagal mengambil daftar request');
  }
};
```

**Keuntungan:**
- Tidak bergantung pada foreign key relationship
- Bekerja dengan schema yang berbeda
- Lebih fleksibel untuk filtering dan searching
- Error handling yang lebih baik

### 2. Update Semua Service Functions

Semua fungsi di `admin-verified-bm.service.ts` diupdate:

1. **fetchAllVerifiedBMRequests** - Manual join dengan 2 query
2. **fetchAdminVerifiedBMStats** - Direct error handling
3. **updateRequestStatus** - Direct error handling
4. **refundRequest** - Direct error handling
5. **getRequestDetails** - Manual join dengan 2 query

### 3. Update React Query Configuration

```typescript
// ✅ Hook configuration yang lebih baik
export const useAdminVerifiedBMRequests = (filters?: {
  status?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['admin-verified-bm-requests', filters],
    queryFn: () => fetchAllVerifiedBMRequests(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnMount: 'always', // ✅ Always refetch on mount
    refetchOnWindowFocus: false,
  });
};
```

## Alur Data Setelah Perbaikan

```
1. Admin buka halaman Verified BM Management
   ↓
2. useAdminVerifiedBMRequests hook dipanggil
   ↓
3. fetchAllVerifiedBMRequests service:
   a. Query verified_bm_requests table
   b. Extract unique user_ids
   c. Query users table dengan IN clause
   d. Combine data dengan Map lookup
   e. Apply search filter
   ↓
4. Data ditampilkan di table
```

## Performance Considerations

### Optimasi dengan Map Lookup
```typescript
// ✅ O(n) lookup dengan Map
const userMap = new Map(users?.map(u => [u.id, u]) || []);
const user = userMap.get(r.user_id);

// ❌ O(n²) lookup dengan find
const user = users?.find(u => u.id === r.user_id);
```

### Batch Query untuk Users
```typescript
// ✅ Single query untuk semua users
const userIds = [...new Set(requests.map(r => r.user_id))];
const { data: users } = await supabase
  .from('users')
  .select('id, email, full_name')
  .in('id', userIds);

// ❌ Multiple queries (N+1 problem)
for (const request of requests) {
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', request.user_id)
    .single();
}
```

## Testing Checklist

### Test 1: Load Admin Page
- [x] Login sebagai admin
- [x] Buka halaman /admin/verified-bm
- [x] **EXPECTED:** Data requests muncul dengan user info
- [x] **ACTUAL:** ✅ Data muncul dengan benar

### Test 2: Filter by Status
- [x] Pilih filter status (Pending, Processing, dll)
- [x] **EXPECTED:** Table menampilkan requests sesuai status
- [x] **ACTUAL:** ✅ Filter berfungsi

### Test 3: Search
- [x] Ketik di search box (email atau request ID)
- [x] **EXPECTED:** Table menampilkan hasil search
- [x] **ACTUAL:** ✅ Search berfungsi

### Test 4: Update Status
- [x] Klik tombol "Process" atau "Complete"
- [x] **EXPECTED:** Status terupdate, data refresh
- [x] **ACTUAL:** ✅ Update berfungsi

### Test 5: Refund
- [x] Klik tombol "Refund"
- [x] Isi admin notes
- [x] **EXPECTED:** Request di-refund, saldo dikembalikan
- [x] **ACTUAL:** ✅ Refund berfungsi

## File yang Diubah

1. **src/features/member-area/services/admin-verified-bm.service.ts**
   - Ubah semua fungsi dari foreign key join ke manual join
   - Hapus `handleSupabaseOperation` wrapper
   - Implementasi direct error handling
   - Optimasi dengan Map lookup

2. **src/hooks/useAdminVerifiedBM.ts**
   - Update React Query configuration
   - `refetchOnMount: 'always'`
   - Tingkatkan `staleTime` dan `gcTime`
   - Tambah `retry: 2`

## Alternative Solution (Not Implemented)

### Option 1: Add Foreign Key to public.users
```sql
-- Tambah foreign key ke public.users
ALTER TABLE verified_bm_requests
DROP CONSTRAINT verified_bm_requests_user_id_fkey;

ALTER TABLE verified_bm_requests
ADD CONSTRAINT verified_bm_requests_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.users(id)
ON DELETE CASCADE;
```

**Pros:**
- Query lebih simple dengan foreign key relationship
- Supabase auto-join

**Cons:**
- Perlu migration
- Bisa break existing data jika ada orphaned records
- Tidak dipilih karena lebih risky

### Option 2: Create Database View
```sql
-- Create view dengan join
CREATE VIEW verified_bm_requests_with_users AS
SELECT 
  vbr.*,
  u.email as user_email,
  u.full_name as user_full_name
FROM verified_bm_requests vbr
LEFT JOIN users u ON vbr.user_id = u.id;
```

**Pros:**
- Query lebih simple
- Performance bisa lebih baik dengan indexed view

**Cons:**
- Perlu manage view
- Update/Insert lebih kompleks
- Tidak dipilih karena manual join sudah cukup

## Status
✅ **SELESAI** - Admin panel berfungsi dengan manual join, tidak ada error foreign key
