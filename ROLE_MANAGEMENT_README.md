# Role Management System

Sistem manajemen role pengguna (member dan admin) untuk aplikasi berbasis Supabase dengan TypeScript dan React.

## 📋 Fitur

- ✅ Auto-assign role 'member' untuk user baru
- ✅ Update role via Supabase Dashboard atau Admin Interface
- ✅ Row Level Security (RLS) untuk proteksi data
- ✅ Audit trail untuk semua perubahan role
- ✅ Proteksi agar tidak bisa remove admin terakhir
- ✅ TypeScript client dengan error handling lengkap
- ✅ React components siap pakai
- ✅ Unit tests lengkap

## 🚀 Quick Start

### 1. Setup Database

Jalankan migration script di Supabase Dashboard:

```bash
# Buka Supabase Dashboard → SQL Editor
# Copy dan run file: supabase/migrations/001_role_management_setup.sql
```

Lihat [Setup Instructions](./supabase/SETUP_INSTRUCTIONS.md) untuk detail lengkap.

### 2. Set Initial Admin

```sql
-- Ganti <USER_UUID> dengan ID user yang ingin dijadikan admin
UPDATE user_profiles 
SET role = 'admin' 
WHERE user_id = '<USER_UUID>';
```

### 3. Install Dependencies

```bash
npm install @supabase/supabase-js
```

### 4. Initialize Client

```typescript
import { createClient } from '@supabase/supabase-js';
import { RoleManagementClient } from './clients/RoleManagementClient';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const roleClient = new RoleManagementClient(supabase);
```

## 📖 Usage

### Check User Role

```typescript
// Check if current user is admin
const isAdmin = await roleClient.isCurrentUserAdmin();

// Get current user's role
const role = await roleClient.getCurrentUserRole();
// Returns: 'member' | 'admin' | null
```

### Get User Profile

```typescript
// Get specific user's profile
const profile = await roleClient.getUserProfile(userId);

// Get all user profiles (admin only)
const allUsers = await roleClient.getAllUserProfiles();
```

### Update User Role

```typescript
// Update user role (admin only)
const result = await roleClient.updateUserRole(userId, 'admin');

if (result.success) {
  console.log('Role updated successfully');
} else {
  console.error(result.message);
}
```

### View Audit Logs

```typescript
// Get all audit logs (admin only)
const logs = await roleClient.getRoleAuditLogs();

// Get audit logs for specific user
const userLogs = await roleClient.getRoleAuditLogs(userId);
```

## 🎨 React Components

### UserRoleManager

Component untuk menampilkan dan mengelola user roles.

```tsx
import { UserRoleManager } from './components';

function AdminPage() {
  return <UserRoleManager roleClient={roleClient} />;
}
```

**Features:**
- Display list semua users dengan roles
- Filter by role (all/member/admin)
- Search by email
- Change role dengan confirmation dialog
- Success/error notifications
- Real-time stats (total users, admins, members)

### AuditLogViewer

Component untuk menampilkan audit log perubahan role.

```tsx
import { AuditLogViewer } from './components';

function AuditPage() {
  return <AuditLogViewer roleClient={roleClient} />;
}

// Atau untuk specific user
function UserHistoryPage({ userId }) {
  return <AuditLogViewer roleClient={roleClient} userId={userId} />;
}
```

**Features:**
- Timeline view of role changes
- Filter by date range (7/30/90 days, all time)
- Pagination
- Export to CSV
- Show who made the change

### Protected Route

Protect admin routes dengan role check:

```tsx
import { ProtectedAdminRoute } from './examples/RoleManagementExample';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={
          <ProtectedAdminRoute>
            <AdminDashboard />
          </ProtectedAdminRoute>
        } />
      </Routes>
    </Router>
  );
}
```

## 🔒 Security

### Row Level Security (RLS)

Sistem menggunakan RLS policies untuk proteksi data:

- ✅ Users dapat read profile mereka sendiri
- ✅ Admins dapat read semua profiles
- ✅ Admins dapat update semua profiles
- ✅ Users tidak bisa update role mereka sendiri
- ✅ Admins dapat read audit logs

### Last Admin Protection

Sistem mencegah removal admin terakhir:

```typescript
// Ini akan gagal jika hanya ada 1 admin
const result = await roleClient.updateUserRole(lastAdminId, 'member');
// result.success = false
// result.error = 'LAST_ADMIN'
```

### Audit Trail

Semua perubahan role dicatat di `role_audit_logs`:

- User ID yang diubah
- Role lama dan baru
- Admin yang melakukan perubahan
- Timestamp perubahan

## 🧪 Testing

### Run Unit Tests

```bash
npm test
```

### Test Coverage

- ✅ getUserProfile (success, not found, error)
- ✅ getCurrentUserRole (admin, member, unauthenticated)
- ✅ isCurrentUserAdmin (true/false cases)
- ✅ getAllUserProfiles (admin access, member denied)
- ✅ updateUserRole (success, unauthorized, last admin, invalid role)
- ✅ getRoleAuditLogs (all logs, filtered by user)

## 📁 File Structure

```
.
├── supabase/
│   ├── migrations/
│   │   ├── 001_role_management_setup.sql      # Main migration
│   │   └── rollback_001_role_management.sql   # Rollback script
│   └── SETUP_INSTRUCTIONS.md                  # Setup guide
├── src/
│   ├── types/
│   │   └── roleManagement.ts                  # Type definitions
│   ├── clients/
│   │   ├── RoleManagementClient.ts            # Main client
│   │   └── SupabaseClient.ts                  # Updated with role client
│   ├── components/
│   │   ├── UserRoleManager.tsx                # User management UI
│   │   ├── RoleChangeConfirmation.tsx         # Confirmation dialog
│   │   ├── AuditLogViewer.tsx                 # Audit log UI
│   │   └── index.ts                           # Component exports
│   ├── examples/
│   │   └── RoleManagementExample.tsx          # Usage examples
│   └── __tests__/
│       └── RoleManagementClient.test.ts       # Unit tests
└── ROLE_MANAGEMENT_README.md                  # This file
```

## 🔧 Configuration

### Environment Variables

```env
REACT_APP_SUPABASE_URL=https://xxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJxxx...
```

### TypeScript Configuration

Pastikan `tsconfig.json` include:

```json
{
  "compilerOptions": {
    "jsx": "react",
    "esModuleInterop": true,
    "moduleResolution": "node"
  }
}
```

## 🐛 Troubleshooting

### User baru tidak mendapat role 'member'

**Cause:** Trigger `on_auth_user_created` tidak berjalan.

**Solution:**
```sql
-- Verify trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Manually create profiles for existing users
INSERT INTO user_profiles (user_id, role)
SELECT id, 'member' FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_profiles);
```

### RLS policies tidak berfungsi

**Cause:** RLS mungkin tidak enabled.

**Solution:**
```sql
-- Verify RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('user_profiles', 'role_audit_logs');

-- Enable RLS if needed
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_audit_logs ENABLE ROW LEVEL SECURITY;
```

### Error "Cannot remove the last admin"

**Cause:** Mencoba remove admin terakhir (ini adalah expected behavior).

**Solution:** Promote user lain menjadi admin terlebih dahulu, baru demote admin yang lama.

## 📚 API Reference

### RoleManagementClient

#### Methods

##### `getUserProfile(userId: string): Promise<UserProfile | null>`
Get user profile by user ID.

##### `getCurrentUserRole(): Promise<UserRole | null>`
Get current authenticated user's role.

##### `isCurrentUserAdmin(): Promise<boolean>`
Check if current user is admin.

##### `getAllUserProfiles(): Promise<UserWithProfile[]>`
Get all user profiles with email (admin only).

##### `updateUserRole(userId: string, newRole: UserRole): Promise<RoleChangeResult>`
Update user role (admin only).

##### `getRoleAuditLogs(userId?: string): Promise<AuditLogWithDetails[]>`
Get role change audit logs (admin only).

##### `getAdminCount(): Promise<number>`
Get count of admin users.

### Types

```typescript
enum UserRole {
  MEMBER = 'member',
  ADMIN = 'admin'
}

type UserProfile = {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

type RoleChangeResult = {
  success: boolean;
  message: string;
  profile?: UserProfile;
  error?: string;
}
```

## 🤝 Contributing

Contributions welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Built with [Supabase](https://supabase.com)
- UI components styled with [Tailwind CSS](https://tailwindcss.com)
- Tested with [Jest](https://jestjs.io)

## 📞 Support

Jika ada pertanyaan atau masalah:

1. Check [Setup Instructions](./supabase/SETUP_INSTRUCTIONS.md)
2. Check [Troubleshooting](#-troubleshooting) section
3. Review [Examples](./src/examples/RoleManagementExample.tsx)
4. Open an issue on GitHub

---

**Happy coding! 🚀**
