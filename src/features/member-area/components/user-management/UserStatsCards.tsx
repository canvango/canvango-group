import React from 'react';
import Card from '../../../../shared/components/Card';

/**
 * Props for UserStatsCards component
 */
interface UserStatsCardsProps {
  totalUsers: number;
  totalAdmins: number;
  totalMembers: number;
}

/**
 * UserStatsCards - Display user statistics in card format
 * 
 * @description
 * Shows three statistics cards displaying total users, administrators, and members.
 * Uses responsive grid layout that adapts from 1 column on mobile to 3 columns on desktop.
 * 
 * @component
 * @category User Management
 */
const UserStatsCards: React.FC<UserStatsCardsProps> = ({
  totalUsers,
  totalAdmins,
  totalMembers
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total Users Card */}
      <Card className="p-4">
        <div className="text-sm text-gray-600 mb-1">Total Users</div>
        <div className="text-2xl font-bold text-gray-900">{totalUsers}</div>
      </Card>

      {/* Administrators Card */}
      <Card className="p-4">
        <div className="text-sm text-gray-600 mb-1">Administrators</div>
        <div className="text-2xl font-bold text-red-600">{totalAdmins}</div>
      </Card>

      {/* Members Card */}
      <Card className="p-4">
        <div className="text-sm text-gray-600 mb-1">Members</div>
        <div className="text-2xl font-bold text-blue-600">{totalMembers}</div>
      </Card>
    </div>
  );
};

export default UserStatsCards;
