# Solusi Konflik Table users dan user_profiles

## Masalah yang Ditemukan

### 1. Duplikasi Table dengan Data Berbeda
Ada 2 table yang menyimpan informasi user:
- **`users`**: Table baru yang digunakan oleh backend untuk semua operasi
- **`user_profiles`**: Table lama dari migration awal

**Konflik yang Terjadi:**
- User `angunk` memiliki role berbeda di kedua table:
  - Di `users`: role = **member** ❌
  - Di `user_profiles`: role = **admin** ✓
- Backend membaca dari `users`, jadi meskipun di `user_profiles` role = admin, aplikasi tetap menganggap user sebagai member

### 2. Frontend Tidak Mengambil Data dari Database
- `AuthContext.loadUserData()` hanya membuat object hardcoded dengan role = 'member'
- Tidak ada query ke database untuk mengambil role sebenarnya
- Ini menyebabkan semua user dianggap sebagai member di frontend

### 3. Beberapa User Hanya Ada di Satu Table
- User `coba@gmail.com` dan `angunk3@gmail.com` hanya ada di `user_profiles`
- Mereka tidak bisa login karena backend memerlukan data di table `users`

## Solusi yang Diimplementasikan

### 1. Sinkronisasi Data Awal
```sql
-- Update role di users untuk match dengan user_profiles
UPDATE users 
SET role = 'admin' 
WHERE id = 'cc99f354-8008-4ec3-9dea-3a1da09837e8';

-- Insert user yang hanya ada di user_profiles ke table users
INSERT INTO users (id, username, email, full_name, role, balance)
SELECT 
    up.user_id,
    SPLIT_PART(au.email, '@', 1) as username,
    au.email,
    SPLIT_PART(au.email, '@', 1) as full_name,
    up.role::text as role,
    0 as balance
FROM user_profiles up
JOIN auth.users au ON au.id = up.user_id
WHERE up.user_id NOT IN (SELECT id FROM users);
```

### 2. Auto-Sync Trigger (users → user_profiles)
Trigger yang otomatis sync role dari `users` ke `user_profiles`:

```sql
CREATE OR REPLACE FUNCTION sync_role_to_user_profiles()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND OLD.role IS DISTINCT FROM NEW.role THEN
        UPDATE user_profiles
        SET role = NEW.role::user_role
        WHERE user_id = NEW.id;
    END IF;
    
    IF TG_OP = 'INSERT' THEN
        INSERT INTO user_profiles (user_id, role)
        VALUES (NEW.id, NEW.role::user_role)
        ON CONFLICT (user_id) DO UPDATE
        SET role = NEW.role::user_role;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER sync_users_to_user_profiles
    AFTER INSERT OR UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION sync_role_to_user_profiles();
```

### 3. Auto-Sync Trigger (user_profiles → users)
Trigger yang otomatis sync role dari `user_profiles` ke `users`:

```sql
CREATE OR REPLACE FUNCTION sync_role_to_users()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND OLD.role IS DISTINCT FROM NEW.role THEN
        UPDATE users
        SET role = NEW.role::text
        WHERE id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER sync_user_profiles_to_users
    AFTER UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION sync_role_to_users();
```

### 4. Update Frontend AuthContext
Frontend sekarang mengambil data user dari database:

```typescript
const loadUserData = async (userId: string, email: string) => {
  try {
    // Fetch user data from database
    const { data: userData, error } = await supabase
      .from('users')
      .select('id, username, email, full_name, role, balance, created_at, updated_at, last_login_at')
      .eq('id', userId)
      .single();

    if (error || !userData) {
      // Fallback to basic user object
      setUser({ /* ... */ });
      return;
    }

    // Map database fields to frontend User type
    setUser({
      id: userData.id,
      username: userData.username,
      email: userData.email,
      fullName: userData.full_name,
      role: userData.role as 'guest' | 'member' | 'admin',
      balance: Number(userData.balance),
      createdAt: userData.created_at,
      updatedAt: userData.updated_at,
      lastLoginAt: userData.last_login_at,
    });
  } catch (error) {
    // Fallback
  }
};
```

## Hasil Setelah Implementasi

### ✅ Data Tersinkronisasi
Semua user sekarang ada di kedua table dengan role yang sama:

| Username | Email | users.role | user_profiles.role |
|----------|-------|------------|-------------------|
| admin | admin@canvango.com | admin | admin |
| admin1 | admin1@canvango.com | admin | admin |
| angunk | angunk2@gmail.com | **admin** | admin |
| angunk3 | angunk3@gmail.com | member | member |
| coba | coba@gmail.com | member | member |

### ✅ Auto-Sync Berfungsi
- Update role di `users` → otomatis update di `user_profiles`
- Update role di `user_profiles` → otomatis update di `users`
- Tidak akan ada konflik lagi di masa depan

### ✅ Frontend Mengambil Data Real
- AuthContext sekarang query database untuk mendapatkan role
- Menu admin akan muncul untuk user dengan role = 'admin'
- Balance dan data lainnya juga diambil dari database

## Cara Menggunakan

### Update Role User
Anda bisa update role di table mana saja, akan otomatis sync:

```sql
-- Update di users (akan sync ke user_profiles)
UPDATE users SET role = 'admin' WHERE username = 'angunk';

-- ATAU update di user_profiles (akan sync ke users)
UPDATE user_profiles SET role = 'admin'::user_role 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'angunk2@gmail.com');
```

### Verifikasi Sync
```sql
SELECT 
    u.username,
    u.email,
    u.role as users_role,
    up.role::text as user_profiles_role
FROM users u
JOIN user_profiles up ON up.user_id = u.id
ORDER BY u.email;
```

## Testing

1. **Login dengan user angunk**
   - Username: `angunk` (atau `ANGUNK`, `Angunk`, dll - case insensitive)
   - Password: password yang diset di Supabase Auth
   
2. **Verifikasi Menu Admin Muncul**
   - Setelah login, menu admin seharusnya muncul di sidebar
   - Cek di console browser: `console.log(user.role)` harusnya 'admin'

3. **Test Update Role**
   ```sql
   -- Update role di Supabase Dashboard
   UPDATE users SET role = 'member' WHERE username = 'angunk';
   
   -- Logout dan login lagi
   -- Menu admin seharusnya hilang
   ```

## Rekomendasi

### Untuk Development
- Gunakan table `users` sebagai source of truth
- `user_profiles` hanya untuk backward compatibility
- Semua operasi CRUD sebaiknya dilakukan di table `users`

### Untuk Production
Pertimbangkan untuk:
1. Migrate semua data ke `users`
2. Hapus `user_profiles` jika tidak digunakan lagi
3. Atau tetap gunakan kedua table dengan trigger sync

## Troubleshooting

### Menu Admin Tidak Muncul
1. Cek role di database:
   ```sql
   SELECT username, role FROM users WHERE username = 'angunk';
   ```
2. Logout dan login lagi
3. Cek console browser untuk error
4. Pastikan backend sudah restart

### Role Tidak Sync
1. Cek apakah trigger ada:
   ```sql
   SELECT trigger_name FROM information_schema.triggers 
   WHERE event_object_table IN ('users', 'user_profiles');
   ```
2. Cek log error di Supabase Dashboard

### User Tidak Bisa Login
1. Pastikan user ada di table `users`
2. Pastikan user ada di `auth.users`
3. Cek password di Supabase Auth Dashboard
