# Role Management - Quick Start Guide

## 🚀 5 Menit Setup

### Step 1: Run Migration (2 menit)

1. Buka [Supabase Dashboard](https://app.supabase.com)
2. Pilih project Anda
3. Klik **SQL Editor** → **New Query**
4. Copy paste isi file: `supabase/migrations/001_role_management_setup.sql`
5. Klik **Run** (Ctrl+Enter)

✅ Selesai! Tables, triggers, dan RLS policies sudah aktif.

### Step 2: Set Admin Pertama (1 menit)

1. Di SQL Editor, jalankan:
```sql
-- Lihat user yang ada
SELECT id, email FROM auth.users;

-- Set user pertama sebagai admin (ganti <USER_ID>)
UPDATE user_profiles 
SET role = 'admin' 
WHERE user_id = '<USER_ID>';
```

✅ Admin pertama sudah siap!

### Step 3: Test di Code (2 menit)

```typescript
import { createClient } from '@supabase/supabase-js';
import { RoleManagementClient } from './clients/RoleManagementClient';

// Initialize
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);
const roleClient = new RoleManagementClient(supabase);

// Test: Check if current user is admin
const isAdmin = await roleClient.isCurrentUserAdmin();
console.log('Is admin?', isAdmin);

// Test: Get all users (admin only)
const users = await roleClient.getAllUserProfiles();
console.log('Users:', users);

// Test: Update role (admin only)
const result = await roleClient.updateUserRole(userId, 'admin');
console.log('Result:', result);
```

✅ Done! Role management sudah berfungsi.

## 📱 Bonus: Add UI (Optional)

Jika Anda pakai React, copy components ke project Anda:

```bash
# Copy components
cp src/components/*.tsx your-react-app/src/components/

# Copy types
cp src/types/roleManagement.ts your-react-app/src/types/
```

Lalu gunakan:

```tsx
import { UserRoleManager } from './components/UserRoleManager';

function AdminPage() {
  return <UserRoleManager roleClient={roleClient} />;
}
```

## ✅ Verification

Test apakah setup berhasil:

```typescript
// 1. User baru dapat role 'member' otomatis
// Sign up user baru, lalu check:
const profile = await roleClient.getUserProfile(newUserId);
console.log(profile.role); // Should be 'member'

// 2. Admin bisa update role
const result = await roleClient.updateUserRole(userId, 'admin');
console.log(result.success); // Should be true

// 3. Tidak bisa remove admin terakhir
const result = await roleClient.updateUserRole(lastAdminId, 'member');
console.log(result.error); // Should be 'LAST_ADMIN'

// 4. Audit log mencatat perubahan
const logs = await roleClient.getRoleAuditLogs();
console.log(logs); // Should show role changes
```

## 🆘 Troubleshooting

### Error: "relation user_profiles does not exist"
➡️ Migration belum dijalankan. Kembali ke Step 1.

### Error: "Only admins can view all user profiles"
➡️ User belum di-set sebagai admin. Kembali ke Step 2.

### User baru tidak dapat role 'member'
➡️ Trigger tidak berjalan. Check:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

## 📚 Full Documentation

- **Complete Guide**: `ROLE_MANAGEMENT_README.md`
- **Setup Details**: `supabase/SETUP_INSTRUCTIONS.md`
- **API Reference**: `ROLE_MANAGEMENT_README.md` (API Reference section)
- **Examples**: `src/examples/RoleManagementExample.tsx`

## 🎯 What's Next?

1. ✅ Setup complete? → Deploy ke production
2. 🎨 Need UI? → Use React components
3. 🧪 Want tests? → Run `npm test`
4. 📊 Need audit? → Use `AuditLogViewer` component

---

**Total setup time: ~5 minutes** ⏱️

**Questions?** Check `ROLE_MANAGEMENT_README.md` atau `supabase/SETUP_INSTRUCTIONS.md`
