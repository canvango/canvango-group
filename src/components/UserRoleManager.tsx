import React, { useState, useEffect } from 'react';
import { RoleManagementClient } from '../clients/RoleManagementClient';
import { UserWithProfile, UserRole } from '../types/roleManagement';
import { RoleChangeConfirmation } from './RoleChangeConfirmation';

interface UserRoleManagerProps {
  roleClient: RoleManagementClient;
}

type FilterRole = 'all' | UserRole;

export const UserRoleManager: React.FC<UserRoleManagerProps> = ({ roleClient }) => {
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<FilterRole>('all');
  const [selectedUser, setSelectedUser] = useState<UserWithProfile | null>(null);
  const [newRole, setNewRole] = useState<UserRole | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Load users on mount
  useEffect(() => {
    loadUsers();
  }, []);

  // Filter users when search or filter changes
  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, filterRole]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const allUsers = await roleClient.getAllUserProfiles();
      setUsers(allUsers);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by role
    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.profile.role === filterRole);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(query)
      );
    }

    setFilteredUsers(filtered);
  };

  const handleRoleChangeClick = (user: UserWithProfile, role: UserRole) => {
    setSelectedUser(user);
    setNewRole(role);
  };

  const handleRoleChangeConfirm = async () => {
    if (!selectedUser || !newRole) return;

    try {
      const result = await roleClient.updateUserRole(selectedUser.id, newRole);
      
      if (result.success) {
        setNotification({
          type: 'success',
          message: `Successfully changed ${selectedUser.email}'s role to ${newRole}`
        });
        
        // Reload users
        await loadUsers();
      } else {
        setNotification({
          type: 'error',
          message: result.message || 'Failed to update role'
        });
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to update role'
      });
    } finally {
      setSelectedUser(null);
      setNewRole(null);
      
      // Auto-hide notification after 5 seconds
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleRoleChangeCancel = () => {
    setSelectedUser(null);
    setNewRole(null);
  };

  const getRoleBadgeClass = (role: UserRole) => {
    return role === UserRole.ADMIN
      ? 'bg-purple-100 text-purple-800 border-purple-300'
      : 'bg-gray-100 text-gray-800 border-gray-300';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">{error}</p>
        <button
          onClick={loadUsers}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">User Role Management</h2>
        <button
          onClick={loadUsers}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={`p-4 rounded-lg border ${
            notification.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4">
        {/* Search */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Role Filter */}
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value as FilterRole)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Roles</option>
          <option value={UserRole.MEMBER}>Members</option>
          <option value={UserRole.ADMIN}>Admins</option>
        </select>
      </div>

      {/* User List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.email}</div>
                    <div className="text-xs text-gray-500">{user.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getRoleBadgeClass(
                        user.profile.role
                      )}`}
                    >
                      {user.profile.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {user.profile.role === UserRole.MEMBER ? (
                      <button
                        onClick={() => handleRoleChangeClick(user, UserRole.ADMIN)}
                        className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                      >
                        Promote to Admin
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRoleChangeClick(user, UserRole.MEMBER)}
                        className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                      >
                        Demote to Member
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 border border-gray-200 rounded-lg">
          <div className="text-sm text-gray-500">Total Users</div>
          <div className="text-2xl font-bold text-gray-900">{users.length}</div>
        </div>
        <div className="bg-purple-50 p-4 border border-purple-200 rounded-lg">
          <div className="text-sm text-purple-600">Admins</div>
          <div className="text-2xl font-bold text-purple-900">
            {users.filter(u => u.profile.role === UserRole.ADMIN).length}
          </div>
        </div>
        <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg">
          <div className="text-sm text-gray-600">Members</div>
          <div className="text-2xl font-bold text-gray-900">
            {users.filter(u => u.profile.role === UserRole.MEMBER).length}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {selectedUser && newRole && (
        <RoleChangeConfirmation
          user={selectedUser.profile}
          newRole={newRole}
          onConfirm={handleRoleChangeConfirm}
          onCancel={handleRoleChangeCancel}
        />
      )}
    </div>
  );
};
