import { describe, it, expect } from 'vitest';

// Test data
const mockUsers = [
  {
    id: '1',
    email: 'admin@test.com',
    username: 'admin1',
    full_name: 'Admin User',
    role: 'admin' as const,
    balance: 1000,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    email: 'admin2@test.com',
    username: 'admin2',
    full_name: 'Admin Two',
    role: 'admin' as const,
    balance: 2000,
    created_at: '2024-01-02T00:00:00Z',
  },
  {
    id: '3',
    email: 'member@test.com',
    username: 'member1',
    full_name: 'Member User',
    role: 'member' as const,
    balance: 500,
    created_at: '2024-01-03T00:00:00Z',
  },
  {
    id: '4',
    email: 'guest@test.com',
    username: 'guest1',
    full_name: 'Guest User',
    role: 'guest' as const,
    balance: 0,
    created_at: '2024-01-04T00:00:00Z',
  },
];

// Utility functions to test
const filterUsersByRole = (users: typeof mockUsers) => {
  const adminUsers = users.filter(user => user.role === 'admin');
  const memberUsers = users.filter(user => user.role === 'member' || user.role === 'guest');
  return { adminUsers, memberUsers };
};

const validateRoleChange = (
  _userId: string,
  currentRole: string,
  newRole: string,
  allUsers: typeof mockUsers
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

describe('UserManagement - Filtering Logic', () => {
  it('should correctly separate admin and member users', () => {
    const { adminUsers, memberUsers } = filterUsersByRole(mockUsers);

    expect(adminUsers).toHaveLength(2);
    expect(memberUsers).toHaveLength(2);
    expect(adminUsers.every(u => u.role === 'admin')).toBe(true);
    expect(memberUsers.every(u => u.role === 'member' || u.role === 'guest')).toBe(true);
  });

  it('should handle empty array', () => {
    const { adminUsers, memberUsers } = filterUsersByRole([]);

    expect(adminUsers).toHaveLength(0);
    expect(memberUsers).toHaveLength(0);
  });

  it('should handle array with only admins', () => {
    const onlyAdmins = mockUsers.filter(u => u.role === 'admin');
    const { adminUsers, memberUsers } = filterUsersByRole(onlyAdmins);

    expect(adminUsers).toHaveLength(2);
    expect(memberUsers).toHaveLength(0);
  });

  it('should handle array with only members', () => {
    const onlyMembers = mockUsers.filter(u => u.role !== 'admin');
    const { adminUsers, memberUsers } = filterUsersByRole(onlyMembers);

    expect(adminUsers).toHaveLength(0);
    expect(memberUsers).toHaveLength(2);
  });
});

describe('UserManagement - Validation Logic', () => {
  it('should block removing last admin', () => {
    const singleAdmin = [mockUsers[0], mockUsers[2]]; // 1 admin, 1 member
    const result = validateRoleChange('1', 'admin', 'member', singleAdmin);

    expect(result.valid).toBe(false);
    expect(result.error).toContain('admin terakhir');
  });

  it('should allow removing admin when multiple exist', () => {
    const multipleAdmins = [mockUsers[0], mockUsers[1], mockUsers[2]]; // 2 admins, 1 member
    const result = validateRoleChange('1', 'admin', 'member', multipleAdmins);

    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should allow changing member to admin', () => {
    const result = validateRoleChange('3', 'member', 'admin', mockUsers);

    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should allow changing guest to member', () => {
    const result = validateRoleChange('4', 'guest', 'member', mockUsers);

    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should allow changing member to guest', () => {
    const result = validateRoleChange('3', 'member', 'guest', mockUsers);

    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should allow admin to stay admin', () => {
    const result = validateRoleChange('1', 'admin', 'admin', mockUsers);

    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });
});
