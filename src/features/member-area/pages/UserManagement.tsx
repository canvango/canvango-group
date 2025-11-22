import React, { useState, useMemo } from 'react';
import Button from '../../../shared/components/Button';
import { useToast } from '../../../shared/contexts/ToastContext';
import { supabase } from '../services/supabase';
import { 
  UserStatsCards, 
  AdminUsersTable, 
  MemberUsersTable 
} from '../components/user-management';

interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  role: 'guest' | 'member' | 'admin';
  balance: number;
  phone?: string | null;
  created_at: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const { showToast } = useToast();

  // Filter users by role using useMemo for performance
  const adminUsers = useMemo(
    () => users.filter(user => user.role === 'admin'),
    [users]
  );

  const memberUsers = useMemo(
    () => users.filter(user => user.role === 'member' || user.role === 'guest'),
    [users]
  );

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, username, full_name, role, balance, phone, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUsers(data || []);
    } catch (error: any) {
      showToast({ type: 'error', message: error.message || 'Gagal memuat data user' });
    } finally {
      setLoading(false);
    }
  };

  // Validate role change - prevent removing last admin
  const validateRoleChange = (
    _userId: string,
    currentRole: string,
    newRole: string
  ): { valid: boolean; error?: string } => {
    // Prevent removing last admin
    if (currentRole === 'admin' && newRole !== 'admin') {
      const adminCount = users.filter(u => u.role === 'admin').length;
      if (adminCount <= 1) {
        return {
          valid: false,
          error: 'Tidak dapat mengubah role admin terakhir. Minimal harus ada 1 admin.'
        };
      }
    }

    return { valid: true };
  };

  // Update user role with validation
  const updateUserRole = async (userId: string, newRole: string) => {
    setUpdating(userId);
    try {
      // Find current user
      const currentUser = users.find(u => u.id === userId);
      if (!currentUser) {
        throw new Error('User tidak ditemukan');
      }

      // Validate role change
      const validation = validateRoleChange(userId, currentUser.role, newRole);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Update in database
      const { error } = await supabase
        .from('users')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole as any } : user
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

  // Load users on mount
  React.useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      {/* Screen reader announcements */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      >
        {loading && 'Loading user data...'}
        {updating && 'Updating user role...'}
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Kelola role dan akses user</p>
        </div>
        <Button
          onClick={fetchUsers}
          disabled={loading}
          variant="outline"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {/* Stats Cards */}
      <UserStatsCards
        totalUsers={users.length}
        totalAdmins={adminUsers.length}
        totalMembers={memberUsers.length}
      />

      {/* Administrator Section */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Administrator
        </h2>
        {loading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
            Loading...
          </div>
        ) : (
          <AdminUsersTable
            users={adminUsers}
            onRoleChange={updateUserRole}
            updating={updating}
          />
        )}
      </section>

      {/* Member & Guest Section */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Member & Guest
        </h2>
        {loading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
            Loading...
          </div>
        ) : (
          <MemberUsersTable
            users={memberUsers}
            onRoleChange={updateUserRole}
            updating={updating}
          />
        )}
      </section>
    </div>
  );
};

export default UserManagement;
