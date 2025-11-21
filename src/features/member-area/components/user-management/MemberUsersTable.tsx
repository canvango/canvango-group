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
  created_at: string;
}

interface MemberUsersTableProps {
  users: User[];
  onRoleChange: (userId: string, newRole: string) => Promise<void>;
  updating: string | null;
}

/**
 * MemberUsersTable - Table component for displaying member and guest users
 * 
 * @description
 * Displays a table of users with member or guest role. Features blue-themed styling
 * to distinguish from admin table. Includes empty state when no members exist.
 * 
 * @component
 * @category User Management
 */
const MemberUsersTable: React.FC<MemberUsersTableProps> = ({
  users,
  onRoleChange,
  updating,
}) => {
  return (
    <Card padding="none">
      <div className="overflow-x-auto">
        <table className="w-full" aria-label="Member users">
          <thead className="bg-blue-50 border-b border-blue-200">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
              >
                User
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
              >
                Email
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
              >
                Balance
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
              >
                Role
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
              >
                Registered
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Tidak ada data member atau guest
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <UserTableRow
                  key={user.id}
                  user={user}
                  onRoleChange={onRoleChange}
                  updating={updating}
                  variant="member"
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default MemberUsersTable;
