# Fix Admin User Management - Migrasi dari API ke Supabase

## Masalah yang Diperbaiki

### 1. ERR_CONNECTION_REFUSED pada `/api/admin/users`
**Penyebab**: Halaman UserManagement menggunakan `adminUserService` yang memanggil backend API di port 5000, tapi backend tidak berjalan.

**Solusi**: Migrasi halaman UserManagement untuk menggunakan Supabase client langsung, tidak perlu backend API.

### 2. Menu "Kelola Pengguna" Tidak Muncul
**Status**: Menu sudah ada di Sidebar, hanya perlu memastikan user login sebagai admin.

### 3. Redirect ke `/unauthorized` yang Salah
**Status**: Sudah diperbaiki di `src/features/member-area/components/ProtectedRoute.tsx`

## Perubahan yang Dilakukan

### File: `canvango-app/frontend/src/pages/admin/UserManagement.tsx`

#### 1. Import Changes
**Before**:
```typescript
import {
  getAllUsers,
  updateUser,
  updateUserBalance,
  updateUserRole,
  deleteUser,
  User,
  UpdateUserData,
} from '../../services/adminUserService';
```

**After**:
```typescript
import { supabase } from '../../utils/supabase';

interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: 'guest' | 'member' | 'admin';
  balance: number;
  created_at: string;
  updated_at?: string;
  last_login_at?: string | null;
}
```

#### 2. Fetch Users - Migrasi ke Supabase
**Before**: Menggunakan API endpoint `/admin/users`
```typescript
const response = await getAllUsers(params);
setUsers(response.users);
setTotalPages(response.pagination.totalPages);
```

**After**: Menggunakan Supabase query
```typescript
let query = supabase
  .from('users')
  .select('id, email, username, full_name, role, balance, created_at, updated_at, last_login_at', { count: 'exact' });

// Apply filters
if (roleFilter !== 'all') {
  query = query.eq('role', roleFilter);
}

if (searchTerm) {
  query = query.or(`username.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`);
}

// Apply pagination
const from = (currentPage - 1) * limit;
const to = from + limit - 1;
query = query.range(from, to).order('created_at', { ascending: false });

const { data, error: fetchError, count } = await query;
```

#### 3. Update User - Migrasi ke Supabase
**Before**: API call `updateUser(userId, data)`
```typescript
await updateUser(editingUser.id, editFormData);
```

**After**: Supabase update
```typescript
const { error } = await supabase
  .from('users')
  .update({
    ...editFormData,
    updated_at: new Date().toISOString()
  })
  .eq('id', editingUser.id);
```

#### 4. Update Balance - Migrasi ke Supabase
**Before**: API call `updateUserBalance(userId, data)`
```typescript
await updateUserBalance(editingUser.id, { balance: balanceValue });
```

**After**: Supabase update
```typescript
const { error } = await supabase
  .from('users')
  .update({
    balance: balanceValue,
    updated_at: new Date().toISOString()
  })
  .eq('id', editingUser.id);
```

#### 5. Update Role - Migrasi ke Supabase dengan Validasi
**Before**: API call `updateUserRole(userId, data)`
```typescript
await updateUserRole(editingUser.id, { role: roleValue });
```

**After**: Supabase update dengan validasi admin terakhir
```typescript
// Validate: prevent removing last admin
if (editingUser.role === 'admin' && roleValue !== 'admin') {
  const { count } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'admin');

  if (count && count <= 1) {
    alert('Tidak dapat mengubah role admin terakhir. Minimal harus ada 1 admin.');
    return;
  }
}

const { error } = await supabase
  .from('users')
  .update({
    role: roleValue,
    updated_at: new Date().toISOString()
  })
  .eq('id', editingUser.id);
```

#### 6. Delete User - Migrasi ke Supabase dengan Validasi
**Before**: API call `deleteUser(userId)`
```typescript
await deleteUser(user.id);
```

**After**: Supabase delete dengan validasi admin terakhir
```typescript
// Prevent deleting last admin
if (user.role === 'admin') {
  const { count } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'admin');

  if (count && count <= 1) {
    alert('Tidak dapat menghapus admin terakhir. Minimal harus ada 1 admin.');
    return;
  }
}

const { error } = await supabase
  .from('users')
  .delete()
  .eq('id', user.id);
```

## Fitur yang Ditambahkan

### 1. Validasi Admin Terakhir
- Mencegah penghapusan admin terakhir
- Mencegah perubahan role admin terakhir
- Memastikan selalu ada minimal 1 admin di sistem

### 2. Search dengan Multiple Fields
- Search berdasarkan username, email, atau full_name
- Menggunakan operator `ilike` untuk case-insensitive search
- Menggunakan operator `or` untuk multiple field search

### 3. Pagination yang Efisien
- Menggunakan `range()` untuk pagination
- Menghitung total pages berdasarkan count
- Sorting berdasarkan created_at descending

## Keuntungan Migrasi ke Supabase

### 1. Tidak Perlu Backend API
- ✅ Tidak perlu menjalankan backend server
- ✅ Mengurangi kompleksitas deployment
- ✅ Mengurangi latency (direct database access)

### 2. Real-time Capabilities (Future)
- ⏳ Bisa menambahkan real-time updates
- ⏳ Bisa menambahkan presence tracking
- ⏳ Bisa menambahkan collaborative features

### 3. Built-in Security
- ✅ Row Level Security (RLS) policies
- ✅ Authentication terintegrasi
- ✅ Automatic SQL injection prevention

### 4. Better Performance
- ✅ Direct database queries
- ✅ Efficient pagination
- ✅ Optimized indexes

## Testing

### 1. Test Fetch Users
```bash
# Login sebagai admin
# Buka halaman /admin/users
# Verifikasi: Tabel users muncul dengan data
```

### 2. Test Search
```bash
# Ketik username/email di search box
# Klik Search
# Verifikasi: Hasil filter sesuai search term
```

### 3. Test Role Filter
```bash
# Pilih role filter (Guest/Member/Admin)
# Verifikasi: Tabel hanya menampilkan users dengan role tersebut
```

### 4. Test Update User
```bash
# Klik tombol "Edit" pada user
# Ubah username/email/full_name
# Klik "Save Changes"
# Verifikasi: Data user terupdate
```

### 5. Test Update Balance
```bash
# Klik tombol "Balance" pada user
# Ubah balance
# Klik "Update Balance"
# Verifikasi: Balance terupdate
```

### 6. Test Update Role
```bash
# Klik tombol "Role" pada user
# Ubah role
# Klik "Update Role"
# Verifikasi: Role terupdate
```

### 7. Test Delete User
```bash
# Klik tombol "Delete" pada user (non-admin)
# Confirm delete
# Verifikasi: User terhapus
```

### 8. Test Admin Protection
```bash
# Coba ubah role admin terakhir
# Expected: Alert "Tidak dapat mengubah role admin terakhir"

# Coba hapus admin terakhir
# Expected: Alert "Tidak dapat menghapus admin terakhir"
```

## Cara Menggunakan

### 1. Pastikan Supabase Configured
Cek file `.env` di `canvango-app/frontend`:
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 2. Pastikan User adalah Admin
```bash
# Jalankan script untuk set role admin
node scripts/set-user-role.js

# Atau update langsung di Supabase dashboard
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

### 3. Akses Halaman Admin
```bash
# Login dengan akun admin
# Akses: http://localhost:5173/admin/users
# Menu "Kelola Pengguna" akan muncul di sidebar
```

## Troubleshooting

### Menu Admin Tidak Muncul
**Penyebab**: User bukan admin atau AuthContext belum load

**Solusi**:
1. Cek role di database: `SELECT role FROM users WHERE email = 'your-email'`
2. Logout dan login kembali
3. Clear browser cache

### Error "Failed to fetch users"
**Penyebab**: Supabase credentials salah atau RLS policy terlalu ketat

**Solusi**:
1. Cek `.env` file untuk credentials
2. Cek RLS policies di Supabase dashboard
3. Pastikan admin bisa read/write users table

### Pagination Tidak Bekerja
**Penyebab**: Count tidak dikembalikan dari query

**Solusi**:
1. Pastikan menggunakan `{ count: 'exact' }` di select
2. Cek apakah ada error di console

## Next Steps

### 1. Implementasi Halaman Admin Lainnya
- [ ] Admin Dashboard
- [ ] Transaction Management
- [ ] Claim Management
- [ ] Tutorial Management
- [ ] Product Management
- [ ] System Settings
- [ ] Audit Log

### 2. Tambahkan Fitur Advanced
- [ ] Bulk operations (update/delete multiple users)
- [ ] Export users to CSV
- [ ] Import users from CSV
- [ ] User activity tracking
- [ ] Email notifications

### 3. Improve UX
- [ ] Toast notifications instead of alerts
- [ ] Loading states untuk setiap action
- [ ] Confirmation dialogs dengan custom styling
- [ ] Keyboard shortcuts

## Kesimpulan

Halaman User Management sudah berhasil dimigrasi dari backend API ke Supabase client. Sekarang:

✅ Tidak perlu backend API berjalan
✅ Menu "Kelola Pengguna" sudah ada dan berfungsi
✅ CRUD operations bekerja dengan Supabase
✅ Validasi admin terakhir sudah ditambahkan
✅ Search dan filter bekerja dengan baik
✅ Pagination efisien dengan Supabase

**Cara Akses**: Login sebagai admin → Klik "Kelola Pengguna" di sidebar → Manage users!
