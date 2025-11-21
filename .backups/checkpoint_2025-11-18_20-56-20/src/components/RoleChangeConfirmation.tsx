import React from 'react';
import { UserProfile, UserRole } from '../types/roleManagement';

interface RoleChangeConfirmationProps {
  user: UserProfile;
  newRole: UserRole;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export const RoleChangeConfirmation: React.FC<RoleChangeConfirmationProps> = ({
  user,
  newRole,
  onConfirm,
  onCancel
}) => {
  const [isConfirming, setIsConfirming] = React.useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
    } finally {
      setIsConfirming(false);
    }
  };

  const isPromotingToAdmin = newRole === UserRole.ADMIN;
  const isDemotingToMember = newRole === UserRole.MEMBER;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Confirm Role Change
          </h3>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* User Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">User ID</div>
            <div className="text-sm font-mono text-gray-900 break-all">{user.user_id}</div>
          </div>

          {/* Role Change Info */}
          <div className="flex items-center justify-center space-x-4">
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Current Role</div>
              <span
                className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                  user.role === UserRole.ADMIN
                    ? 'bg-purple-100 text-purple-800 border-purple-300'
                    : 'bg-gray-100 text-gray-800 border-gray-300'
                }`}
              >
                {user.role}
              </span>
            </div>

            <div className="text-gray-400">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </div>

            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">New Role</div>
              <span
                className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                  newRole === UserRole.ADMIN
                    ? 'bg-purple-100 text-purple-800 border-purple-300'
                    : 'bg-gray-100 text-gray-800 border-gray-300'
                }`}
              >
                {newRole}
              </span>
            </div>
          </div>

          {/* Warning Messages */}
          {isPromotingToAdmin && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Promoting to Admin
                  </h3>
                  <div className="mt-1 text-sm text-yellow-700">
                    This user will have full administrative access, including the ability to
                    manage other users' roles.
                  </div>
                </div>
              </div>
            </div>
          )}

          {isDemotingToMember && user.role === UserRole.ADMIN && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Demoting Admin to Member
                  </h3>
                  <div className="mt-1 text-sm text-red-700">
                    This user will lose all administrative privileges. Make sure there is at
                    least one other admin before proceeding.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Confirmation Question */}
          <div className="text-center text-gray-700">
            Are you sure you want to change this user's role?
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3 rounded-b-lg">
          <button
            onClick={onCancel}
            disabled={isConfirming}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isConfirming}
            className={`px-4 py-2 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed ${
              isPromotingToAdmin
                ? 'bg-purple-600 hover:bg-purple-700'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isConfirming ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Confirming...
              </span>
            ) : (
              'Confirm Change'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
