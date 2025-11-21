# Design Document - Admin User Role Management

## Overview

Dokumen ini menjelaskan desain teknis untuk implementasi fitur pemisahan tabel admin dan member di halaman User Management (`/admin/users`). Fitur ini akan meningkatkan UX dengan memisahkan user berdasarkan role mereka ke dalam dua tabel yang berbeda.

## Architecture

### Component Structure

```
src/features/member-area/pages/
└── UserManagement.tsx (existing - will be refactored)

src/features/member-area/components/user-management/
├── index.ts
├── UserStatsCards.tsx (new)
├── AdminUsersTable.tsx (new)
├── MemberUsersTable.tsx (new)
└── UserTableRow.tsx (new - shared component)
```

### Data Flow

```
UserManagement Page
    ↓
Fetch all users from Supabase
    ↓
Filter users by role
    ↓
┌─────────────────┬─────────────────┐
│  Admin Users    │  Member Users   │
│  (role='admin') │  (role='member' │
│                 │   or 'guest')   │
└─────────────────┴─────────────────┘
    ↓                   ↓
AdminUsersTable    MemberUsersTable
```

## Components and Interfaces

### 1. UserManagement.tsx (Refactored)

**Purpose**: Main container component yang mengatur state dan data fetching

**State Management**:
```typescript
interface UserManagementState {
  users: User[];
  loading: boolean;
  updating: string | null; // user ID being updated
}
```

**Key Functions**:
- `fetchUsers()`: Fetch semua user dari Supabase
- `updateUserRole(userId: string, newRole: string)`: Update role user
- `validateRoleChange(userId: string, newRole: string)`: Validasi sebelum update

**Layout Structure**:
```tsx
<div className="space-y-6">
  {/* Header with title and refresh button */}
  <Header />
  
  {/* Stats Cards */}
  <UserStatsCards 
    totalUsers={users.length}
    totalAdmins={adminUsers.length}
    totalMembers={memberUsers.length}
  />
  
  {/* Admin Users Table */}
  <section>
    <h2>Administrator</h2>
    <AdminUsersTable 
      users={adminUsers}
      onRoleChange={updateUserRole}
      updating={updating}
    />
  </section>
  
  {/* Member Users Table */}
  <section>
    <h2>Member & Guest</h2>
    <MemberUsersTable 
      users={memberUsers}
      onRoleChange={updateUserRole}
      updating={updating}
    />
  </section>
</div>
```

### 2. UserStatsCards.tsx (New Component)

**Purpose**: Menampilkan statistik user dalam card format

**Props**:
```typescript
interface UserStatsCardsProps {
  totalUsers: number;
  totalAdmins: number;
  totalMembers: number;
}
```

**Design**:
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <Card className="p-4">
    <div className="text-sm text-gray-600">Total Users</div>
    <div className="text-2xl font-bold text-gray-900">{totalUsers}</div>
  </Card>
  
  <Card className="p-4">
    <div className="text-sm text-gray-600">Administrators</div>
    <div className="text-2xl font-bold text-red-600">{totalAdmins}</div>
  </Card>
  
  <Card className="p-4">
    <div className="text-sm text-gray-600">Members</div>
    <div className="text-2xl font-bold text-blue-600">{totalMembers}</div>
  </Card>
</div>
```

### 3. AdminUsersTable.tsx (New Component)

**Purpose**: Tabel khusus untuk menampilkan admin users

**Props**:
```typescript
interface AdminUsersTableProps {
  users: User[];
  onRoleChange: (userId: string, newRole: string) => Promise<void>;
  updating: string | null;
}
```

**Features**:
- Display admin users only
- Role dropdown with validation (prevent removing last admin)
- Highlight styling untuk admin (red accent)
- Empty state jika tidak ada admin

**Design**:
```tsx
<Card>
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-red-50 border-b border-red-200">
        <tr>
          <th>User</th>
          <th>Email</th>
          <th>Balance</th>
          <th>Role</th>
          <th>Registered</th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <UserTableRow 
            key={user.id}
            user={user}
            onRoleChange={onRoleChange}
            updating={updating}
            variant="admin"
          />
        ))}
      </tbody>
    </table>
  </div>
</Card>
```

### 4. MemberUsersTable.tsx (New Component)

**Purpose**: Tabel khusus untuk menampilkan member dan guest users

**Props**:
```typescript
interface MemberUsersTableProps {
  users: User[];
  onRoleChange: (userId: string, newRole: string) => Promise<void>;
  updating: string | null;
}
```

**Features**:
- Display member and guest users
- Role dropdown untuk upgrade/downgrade
- Blue accent untuk member
- Empty state jika tidak ada member

**Design**:
```tsx
<Card>
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-blue-50 border-b border-blue-200">
        <tr>
          <th>User</th>
          <th>Email</th>
          <th>Balance</th>
          <th>Role</th>
          <th>Registered</th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <UserTableRow 
            key={user.id}
            user={user}
            onRoleChange={onRoleChange}
            updating={updating}
            variant="member"
          />
        ))}
      </tbody>
    </table>
  </div>
</Card>
```

### 5. UserTableRow.tsx (New Shared Component)

**Purpose**: Reusable row component untuk kedua tabel

**Props**:
```typescript
interface UserTableRowProps {
  user: User;
  onRoleChange: (userId: string, newRole: string) => Promise<void>;
  updating: string | null;
  variant: 'admin' | 'member';
}
```

**Design**:
```tsx
<tr className="hover:bg-gray-50">
  <td className="px-6 py-4">
    {/* Avatar + Name */}
    <div className="flex items-center">
      <div className={`avatar ${variant === 'admin' ? 'bg-red-100' : 'bg-blue-100'}`}>
        {user.username?.charAt(0).toUpperCase()}
      </div>
      <div className="ml-4">
        <div className="font-medium">{user.full_name}</div>
        <div className="text-sm text-gray-500">@{user.username}</div>
      </div>
    </div>
  </td>
  
  <td className="px-6 py-4">{user.email}</td>
  
  <td className="px-6 py-4">
    Rp {user.balance?.toLocaleString('id-ID')}
  </td>
  
  <td className="px-6 py-4">
    <SelectDropdown
      value={user.role}
      onChange={(value) => onRoleChange(user.id, value)}
      options={roleOptions}
      disabled={updating === user.id}
    />
  </td>
  
  <td className="px-6 py-4">
    {formatDate(user.created_at)}
  </td>
</tr>
```

## Data Models

### User Interface (Existing)

```typescript
interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  role: 'guest' | 'member' | 'admin';
  balance: number;
  created_at: string;
  updated_at?: string;
}
```

### Role Options

```typescript
const roleOptions = [
  { value: 'guest', label: 'Guest' },
  { value: 'member', label: 'Member' },
  { value: 'admin', label: 'Admin' },
];
```

## Business Logic

### 1. User Filtering

```typescript
const filterUsersByRole = (users: User[]) => {
  const adminUsers = users.filter(u => u.role === 'admin');
  const memberUsers = users.filter(u => u.role === 'member' || u.role === 'guest');
  
  return { adminUsers, memberUsers };
};
```

### 2. Role Change Validation

```typescript
const validateRoleChange = (
  userId: string, 
  currentRole: string, 
  newRole: string, 
  allUsers: User[]
): { valid: boolean; error?: string } => {
  // Prevent removing last admin
  if (currentRole === 'admin' && newRole !== 'admin') {
    const adminCount = allUsers.filter(u => u.role === 'admin').length;
    if (adminCount <= 1) {
      return {
        valid: false,
        error: 'Tidak dapat mengubah role admin terakhir. Minimal harus ada 1 admin.'
      };
    }
  }
  
  return { valid: true };
};
```

### 3. Update Role Function

```typescript
const updateUserRole = async (userId: string, newRole: string) => {
  setUpdating(userId);
  
  try {
    // Find current user
    const currentUser = users.find(u => u.id === userId);
    if (!currentUser) throw new Error('User tidak ditemukan');
    
    // Validate role change
    const validation = validateRoleChange(
      userId, 
      currentUser.role, 
      newRole, 
      users
    );
    
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    
    // Update in database
    const { error } = await supabase
      .from('users')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('id', userId);
    
    if (error) throw error;
    
    // Update local state
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, role: newRole as any } 
        : user
    ));
    
    showToast({ 
      type: 'success', 
      message: `Role berhasil diubah menjadi ${newRole}` 
    });
    
  } catch (error: any) {
    showToast({ 
      type: 'error', 
      message: error.message || 'Gagal mengubah role' 
    });
  } finally {
    setUpdating(null);
  }
};
```

## Error Handling

### Error Scenarios

1. **Last Admin Protection**
   - Error: "Tidak dapat mengubah role admin terakhir"
   - Action: Block the change, show error toast

2. **Database Error**
   - Error: Supabase error message
   - Action: Show error toast, keep original role

3. **Network Error**
   - Error: "Gagal terhubung ke server"
   - Action: Show error toast, allow retry

4. **Permission Error**
   - Error: "Anda tidak memiliki akses untuk mengubah role"
   - Action: Show error toast (handled by RLS)

### Error Display

```typescript
const handleError = (error: any) => {
  let message = 'Terjadi kesalahan';
  
  if (error.message) {
    message = error.message;
  } else if (error.code === 'PGRST301') {
    message = 'Anda tidak memiliki akses untuk mengubah role';
  }
  
  showToast({ type: 'error', message });
};
```

## Testing Strategy

### Unit Tests

1. **filterUsersByRole()**
   - Test: Correctly separates admin and member users
   - Test: Handles empty array
   - Test: Handles all same role

2. **validateRoleChange()**
   - Test: Blocks removing last admin
   - Test: Allows removing admin when multiple exist
   - Test: Allows any other role changes

3. **updateUserRole()**
   - Test: Successfully updates role
   - Test: Handles validation errors
   - Test: Handles database errors
   - Test: Updates local state correctly

### Integration Tests

1. **User Management Page**
   - Test: Loads and displays users in correct tables
   - Test: Stats cards show correct counts
   - Test: Role change moves user between tables
   - Test: Refresh button reloads data

### Manual Testing Checklist

- [ ] Admin table shows only admins
- [ ] Member table shows members and guests
- [ ] Stats cards show correct counts
- [ ] Role dropdown works in both tables
- [ ] Cannot remove last admin
- [ ] User moves to correct table after role change
- [ ] Loading states work correctly
- [ ] Error messages display properly
- [ ] Refresh button works
- [ ] Responsive on mobile
- [ ] Accessible with keyboard navigation

## Performance Considerations

### Optimization Strategies

1. **Memoization**
```typescript
const adminUsers = useMemo(
  () => users.filter(u => u.role === 'admin'),
  [users]
);

const memberUsers = useMemo(
  () => users.filter(u => u.role === 'member' || u.role === 'guest'),
  [users]
);
```

2. **Debouncing** (if search is added later)
```typescript
const debouncedSearch = useDebounce(searchTerm, 300);
```

3. **Pagination** (if user count is large)
- Consider adding pagination if users > 100
- Use Supabase pagination with `.range()`

## Accessibility

### ARIA Labels

```tsx
<table aria-label="Administrator users">
  <thead>
    <tr>
      <th scope="col">User</th>
      {/* ... */}
    </tr>
  </thead>
</table>

<SelectDropdown
  aria-label={`Change role for ${user.username}`}
  value={user.role}
  onChange={handleChange}
/>
```

### Keyboard Navigation

- Tab through all interactive elements
- Enter/Space to open dropdown
- Arrow keys to navigate options
- Escape to close dropdown

### Screen Reader Support

- Announce role changes
- Announce loading states
- Announce errors

## Security Considerations

### RLS Policies (Already Implemented)

The existing RLS policies from `role-management` spec will handle:
- Only admins can update roles
- Users can read their own role
- Members cannot update any roles

### Client-Side Validation

Additional client-side validation for better UX:
- Prevent last admin removal
- Validate role values
- Check user permissions before attempting update

### Audit Trail

Consider logging role changes:
```typescript
const logRoleChange = async (
  userId: string, 
  oldRole: string, 
  newRole: string, 
  changedBy: string
) => {
  await supabase.from('role_change_log').insert({
    user_id: userId,
    old_role: oldRole,
    new_role: newRole,
    changed_by: changedBy,
    changed_at: new Date().toISOString()
  });
};
```

## Migration Strategy

### Phase 1: Component Creation
1. Create new components (UserStatsCards, AdminUsersTable, MemberUsersTable, UserTableRow)
2. Test components in isolation

### Phase 2: Refactor UserManagement.tsx
1. Import new components
2. Add filtering logic
3. Update layout structure
4. Test integration

### Phase 3: Testing & Polish
1. Run all tests
2. Manual testing
3. Accessibility audit
4. Performance check

### Rollback Plan

If issues occur:
1. Keep original UserManagement.tsx as backup
2. Can quickly revert to single-table view
3. New components are additive, not destructive

## Dependencies

### Existing Dependencies (Already Available)
- React
- Supabase Client
- Card component
- Button component
- SelectDropdown component
- ToastContext
- User types

### No New Dependencies Required

## Future Enhancements

### Potential Features (Out of Scope)
1. Search/filter within each table
2. Sort by column
3. Bulk role changes
4. Export user list
5. User activity logs
6. Role change history view
7. Pagination for large user lists

## References

- Existing Implementation: `src/features/member-area/pages/UserManagement.tsx`
- Related Spec: `.kiro/specs/role-management/`
- Infrastructure Spec: `.kiro/specs/member-area-infrastructure/`
- Shared Components: `src/shared/components/`
