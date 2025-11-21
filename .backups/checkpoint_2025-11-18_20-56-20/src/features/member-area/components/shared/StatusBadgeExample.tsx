import React from 'react';
import StatusBadge, { Status } from './StatusBadge';

/**
 * StatusBadge Usage Example
 * 
 * This component demonstrates all the features of the StatusBadge component:
 * - Different status types
 * - Color variants
 * - Optional icons
 * - Size configurations
 */
const StatusBadgeExample: React.FC = () => {
  const statuses: Status[] = [
    'success',
    'failed',
    'pending',
    'processing',
    'approved',
    'rejected',
    'completed',
    'cancelled',
    'active',
    'expired'
  ];

  return (
    <div className="p-8 space-y-8 bg-gray-50">
      <div>
        <h2 className="text-2xl font-bold mb-4">StatusBadge Component Examples</h2>
        <p className="text-gray-600 mb-6">
          Demonstrates all status types with color-coded badges and appropriate icons
        </p>
      </div>

      {/* All Status Types */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">All Status Types (Default Size)</h3>
        <div className="flex flex-wrap gap-3">
          {statuses.map((status) => (
            <StatusBadge key={status} status={status} />
          ))}
        </div>
      </section>

      {/* Size Variations */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Size Variations</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">Small (sm)</p>
            <div className="flex flex-wrap gap-3">
              <StatusBadge status="success" size="sm" />
              <StatusBadge status="pending" size="sm" />
              <StatusBadge status="failed" size="sm" />
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Medium (md) - Default</p>
            <div className="flex flex-wrap gap-3">
              <StatusBadge status="success" size="md" />
              <StatusBadge status="pending" size="md" />
              <StatusBadge status="failed" size="md" />
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Large (lg)</p>
            <div className="flex flex-wrap gap-3">
              <StatusBadge status="success" size="lg" />
              <StatusBadge status="pending" size="lg" />
              <StatusBadge status="failed" size="lg" />
            </div>
          </div>
        </div>
      </section>

      {/* With and Without Icons */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Icon Display Options</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">With Icons (Default)</p>
            <div className="flex flex-wrap gap-3">
              <StatusBadge status="approved" showIcon={true} />
              <StatusBadge status="rejected" showIcon={true} />
              <StatusBadge status="processing" showIcon={true} />
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Without Icons</p>
            <div className="flex flex-wrap gap-3">
              <StatusBadge status="approved" showIcon={false} />
              <StatusBadge status="rejected" showIcon={false} />
              <StatusBadge status="processing" showIcon={false} />
            </div>
          </div>
        </div>
      </section>

      {/* Transaction Status Examples */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Transaction Status (Requirement 2.6, 3.3)</h3>
        <div className="flex flex-wrap gap-3">
          <StatusBadge status="success" />
          <StatusBadge status="pending" />
          <StatusBadge status="failed" />
        </div>
      </section>

      {/* Warranty Claim Status Examples */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Warranty Claim Status (Requirements 8.7, 8.8, 8.9)</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <StatusBadge status="approved" />
            <span className="text-sm text-gray-600">Green badge for approved claims (8.7)</span>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status="rejected" />
            <span className="text-sm text-gray-600">Red badge for rejected claims (8.8)</span>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status="pending" />
            <span className="text-sm text-gray-600">Yellow badge for pending claims (8.9)</span>
          </div>
        </div>
      </section>

      {/* Color-Coded Badges with Icons */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Color-Coded Badges with Icons (Requirement 12.6)</h3>
        <p className="text-sm text-gray-600 mb-4">
          All status badges use consistent color coding with appropriate icons
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <StatusBadge status="success" />
            <span className="text-xs text-gray-500">Green for success</span>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status="failed" />
            <span className="text-xs text-gray-500">Red for failure</span>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status="pending" />
            <span className="text-xs text-gray-500">Yellow for pending</span>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status="processing" />
            <span className="text-xs text-gray-500">Blue for processing</span>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status="active" />
            <span className="text-xs text-gray-500">Green for active</span>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status="expired" />
            <span className="text-xs text-gray-500">Red for expired</span>
          </div>
        </div>
      </section>

      {/* Usage in Tables */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Usage in Tables</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Claim Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm">#TRX001</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status="success" size="sm" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status="approved" size="sm" />
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm">#TRX002</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status="pending" size="sm" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status="pending" size="sm" />
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm">#TRX003</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status="failed" size="sm" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status="rejected" size="sm" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default StatusBadgeExample;
