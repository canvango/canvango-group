# Supabase Integration Rule - WAJIB DIIKUTI

## ⚠️ PENTING: Setiap Perubahan Harus Terkoneksi dengan Supabase

Untuk setiap prompt dan perubahan yang diminta user, **WAJIB** mengikuti alur ini:

### 1. Database First Approach

**SELALU mulai dengan verifikasi database:**

```bash
# Cek struktur tabel yang relevan
mcp_supabase_execute_sql: SELECT * FROM information_schema.columns WHERE table_name = 'nama_tabel'

# Cek data existing
mcp_supabase_execute_sql: SELECT * FROM nama_tabel LIMIT 5

# Cek relasi dan foreign keys
mcp_supabase_execute_sql: SELECT * FROM information_schema.table_constraints WHERE table_name = 'nama_tabel'
```

### 2. Backend Integration Check

**Verifikasi controller dan service layer:**

- ✅ Cek apakah endpoint sudah ada di `server/src/controllers/`
- ✅ Verifikasi service layer di `server/src/services/`
- ✅ Pastikan Supabase client digunakan dengan benar
- ✅ Test endpoint dengan data real dari database

**Contoh verifikasi:**

```typescript
// ✅ CORRECT - Direct Supabase connection
import { supabase } from '../config/supabase';

const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('id', id);
```

### 3. Frontend Integration Check

**Verifikasi React Query hooks dan API calls:**

- ✅ Cek hooks di `src/hooks/` menggunakan React Query
- ✅ Verifikasi API service di `src/services/api/`
- ✅ Pastikan data fetching menggunakan `useQuery` atau `useMutation`
- ✅ Test dengan data real dari backend

**Contoh verifikasi:**

```typescript
// ✅ CORRECT - React Query with API service
export const useWarranties = () => {
  return useQuery({
    queryKey: ['warranties'],
    queryFn: () => api.get('/api/warranties')
  });
};
```

### 4. End-to-End Verification

**SEBELUM menyelesaikan task, WAJIB verifikasi:**

```bash
# 1. Database check
mcp_supabase_execute_sql: SELECT COUNT(*) FROM table_name

# 2. Backend check
# Test endpoint dengan curl atau HTTP file

# 3. Frontend check
# Verifikasi component menggunakan hook yang benar

# 4. Integration check
# Pastikan data flow: Database → Backend → Frontend
```

## Checklist Wajib untuk Setiap Perubahan

### ✅ Database Layer
- [ ] Tabel sudah ada atau migration dibuat
- [ ] Kolom sesuai dengan requirement
- [ ] RLS policies sudah dikonfigurasi
- [ ] Foreign keys dan constraints sudah benar
- [ ] Data test sudah ada (jika perlu)

### ✅ Backend Layer
- [ ] Controller endpoint sudah dibuat/diupdate
- [ ] Service layer menggunakan Supabase client
- [ ] Error handling sudah proper
- [ ] Response format konsisten
- [ ] Endpoint tested dengan data real

### ✅ Frontend Layer
- [ ] React Query hook sudah dibuat/diupdate
- [ ] API service method sudah ada
- [ ] Component menggunakan hook dengan benar
- [ ] Loading dan error states handled
- [ ] UI menampilkan data real dari backend

### ✅ Integration Test
- [ ] Data flow dari database ke UI berjalan
- [ ] CRUD operations berfungsi semua
- [ ] Error handling end-to-end works
- [ ] No mock data in production code

## Alur Kerja Standar

```
1. User Request
   ↓
2. Execute SQL - Cek database structure & data
   ↓
3. Backend Check - Verifikasi/buat endpoint
   ↓
4. Frontend Check - Verifikasi/buat hooks & components
   ↓
5. Integration Test - Test full flow
   ↓
6. Report to User - Dengan hasil SQL queries
```

## Contoh Implementasi Lengkap

### User Request: "Tambah fitur filter warranty by status"

**Step 1: Database Check**
```sql
-- Cek kolom status
SELECT DISTINCT status FROM warranty_claims;

-- Cek struktur
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'warranty_claims';
```

**Step 2: Backend Implementation**
```typescript
// server/src/controllers/warranty.controller.ts
export const getWarrantiesByStatus = async (req, res) => {
  const { status } = req.query;
  
  const { data, error } = await supabase
    .from('warranty_claims')
    .select('*')
    .eq('status', status);
    
  if (error) return res.status(500).json({ error });
  res.json(data);
};
```

**Step 3: Frontend Implementation**
```typescript
// src/hooks/useWarranties.ts
export const useWarrantiesByStatus = (status: string) => {
  return useQuery({
    queryKey: ['warranties', status],
    queryFn: () => api.get(`/api/warranties?status=${status}`)
  });
};
```

**Step 4: Integration Test**
```sql
-- Verify data exists
SELECT status, COUNT(*) FROM warranty_claims GROUP BY status;
```

## ⚠️ Red Flags - STOP and Fix

Jika menemukan ini, HARUS diperbaiki:

- ❌ Mock data di production code
- ❌ Hardcoded data tanpa database connection
- ❌ API calls tanpa React Query
- ❌ Direct fetch() calls (harus pakai API service)
- ❌ No error handling
- ❌ No loading states
- ❌ Backend tidak pakai Supabase client

## Tools yang Harus Digunakan

### Database Operations
```bash
mcp_supabase_execute_sql        # Query data
mcp_supabase_apply_migration    # Schema changes
mcp_supabase_list_tables        # Check tables
mcp_supabase_get_advisors       # Security check
```

### Testing
```bash
getDiagnostics                  # Check TypeScript errors
executePwsh                     # Run tests
```

## Reporting Format

Setiap selesai task, report dengan format:

```markdown
## ✅ Integration Complete

### Database
- Table: `table_name`
- Columns: col1, col2, col3
- Data count: X rows
- SQL Query: [show query used]

### Backend
- Endpoint: GET /api/endpoint
- Controller: path/to/controller.ts
- Tested: ✅ Returns real data

### Frontend
- Hook: useHookName
- Component: ComponentName
- Integration: ✅ Displays real data from backend

### Verification
[Show SQL query results proving data flows correctly]
```

## Priority

**Urutan prioritas:**
1. Database structure & data ← START HERE
2. Backend endpoint & logic
3. Frontend hooks & components
4. End-to-end integration test
5. User-facing features

---

**INGAT:** Tidak ada perubahan yang complete tanpa verifikasi database connection dan end-to-end integration test!
