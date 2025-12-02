import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
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
  onDelete?: (userId: string) => Promise<void>;
  updating: string | null;
  deleting: string | null;
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
  onDelete,
  updating,
  deleting,
  variant,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isUpdating = updating === user.id;
  const isDeleting = deleting === user.id;

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (onDelete) {
      await onDelete(user.id);
      setShowDeleteConfirm(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

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
      <td className="px-6 py-4 whitespace-nowrap w-64">
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
      <td className="px-6 py-4 whitespace-nowrap w-48">
        <div className="text-sm text-gray-900">{user.email}</div>
      </td>

      {/* Phone */}
      <td className="px-6 py-4 whitespace-nowrap w-36">
        <div className="text-sm text-gray-900">{user.phone || '-'}</div>
      </td>

      {/* Balance */}
      <td className="px-6 py-4 whitespace-nowrap w-32">
        <div className="text-sm text-gray-900">
          Rp {user.balance?.toLocaleString('id-ID') || 0}
        </div>
      </td>

      {/* Role Selector */}
      <td className="px-6 py-4 whitespace-nowrap w-32 relative">
        <div className="relative z-10">
          <SelectDropdown
            value={user.role}
            onChange={(value) => onRoleChange(user.id, value)}
            options={roleOptions}
            disabled={isUpdating}
            className="w-32"
            placeholder="Select role"
          />
        </div>
      </td>

      {/* Registration Date */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-32">
        {new Date(user.created_at).toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })}
      </td>

      {/* Actions */}
      <td className="px-6 py-4 whitespace-nowrap text-right w-24">
        {onDelete && (
          <div className="relative">
            {!showDeleteConfirm ? (
              <button
                onClick={handleDeleteClick}
                disabled={isUpdating || isDeleting}
                className="inline-flex items-center justify-center p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete user"
                aria-label={`Delete ${user.full_name || user.username}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="px-2 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                  aria-label="Confirm delete"
                >
                  {isDeleting ? 'Deleting...' : 'Yes'}
                </button>
                <button
                  onClick={handleDeleteCancel}
                  disabled={isDeleting}
                  className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                  aria-label="Cancel delete"
                >
                  No
                </button>
              </div>
            )}
          </div>
        )}
      </td>
    </tr>
  );
};

export default UserTableRow;
