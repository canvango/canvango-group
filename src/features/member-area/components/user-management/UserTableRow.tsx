import React from 'react';
import SelectDropdown, { SelectOption } from '../../../../shared/components/SelectDropdown';

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

interface UserTableRowProps {
  user: User;
  onRoleChange: (userId: string, newRole: string) => Promise<void>;
  updating: string | null;
  variant: 'admin' | 'member';
}

const roleOptions: SelectOption[] = [
  { value: 'guest', label: 'Guest' },
  { value: 'member', label: 'Member' },
  { value: 'admin', label: 'Admin' },
];

const UserTableRow: React.FC<UserTableRowProps> = ({
  user,
  onRoleChange,
  updating,
  variant,
}) => {
  const isUpdating = updating === user.id;

  // Avatar background color based on variant
  const avatarBgColor = variant === 'admin' 
    ? 'bg-red-100' 
    : 'bg-blue-100';
  
  const avatarTextColor = variant === 'admin'
    ? 'text-red-600'
    : 'text-blue-600';

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      {/* User Info with Avatar */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div 
            className={`
              flex-shrink-0 h-10 w-10 rounded-full 
              flex items-center justify-center
              ${avatarBgColor}
            `}
          >
            <span className={`font-medium ${avatarTextColor}`}>
              {user.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {user.full_name || user.username || 'No Name'}
            </div>
            <div className="text-sm text-gray-500">
              @{user.username || 'unknown'}
            </div>
          </div>
        </div>
      </td>

      {/* Email */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{user.email}</div>
      </td>

      {/* Phone */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{user.phone || '-'}</div>
      </td>

      {/* Balance */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          Rp {user.balance?.toLocaleString('id-ID') || 0}
        </div>
      </td>

      {/* Role Selector */}
      <td className="px-6 py-4 whitespace-nowrap">
        <SelectDropdown
          value={user.role}
          onChange={(value) => onRoleChange(user.id, value)}
          options={roleOptions}
          disabled={isUpdating}
          className="w-32"
          placeholder="Select role"
        />
      </td>

      {/* Registration Date */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(user.created_at).toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })}
      </td>
    </tr>
  );
};

export default UserTableRow;
