import React from 'react';
import Card from '../../../../shared/components/Card';
import UserTableRow from './UserTableRow';

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

interface AdminUsersTableProps {
  users: User[];
  onRoleChange: (userId: string, newRole: string) => Promise<void>;
  updating: string | null;
}

/**
 * AdminUsersTable - Table component for displaying admin users
 * 
 * @description
 * Displays a table of users with admin role. Features red-themed styling
 * to distinguish from member table. Includes empty state when no admins exist.
 * 
 * @component
 * @category User Management
 */
const AdminUsersTable: React.FC<AdminUsersTableProps> = ({
  users,
  onRoleChange,
  updating,
}) => {
  return (
    <Card padding="none">
      <div className="overflow-x-auto">
        <table className="w-full" aria-label="Administrator users">
          <thead className="bg-red-50 border-b border-red-200">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-64"
              >
                User
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-48"
              >
                Email
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-36"
              >
                Phone
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-32"
              >
                Balance
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-32"
              >
                Role
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-32"
              >
                Registered
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Tidak ada data administrator
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <UserTableRow
                  key={user.id}
                  user={user}
                  onRoleChange={onRoleChange}
                  updating={updating}
                  variant="admin"
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default AdminUsersTable;
