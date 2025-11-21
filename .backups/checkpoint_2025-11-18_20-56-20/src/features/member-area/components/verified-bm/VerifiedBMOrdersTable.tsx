import React from 'react';
import { Package } from 'lucide-react';
import { VerifiedBMOrder, VerifiedBMOrderStatus } from '../../types/verified-bm';
import Badge from '../../../../shared/components/Badge';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { SkeletonTable } from '../../../../shared/components/SkeletonLoader';

interface VerifiedBMOrdersTableProps {
  orders: VerifiedBMOrder[];
  isLoading?: boolean;
}

const VerifiedBMOrdersTable: React.FC<VerifiedBMOrdersTableProps> = ({ 
  orders,
  isLoading = false 
}) => {
  const getStatusBadge = (status: VerifiedBMOrderStatus) => {
    switch (status) {
      case VerifiedBMOrderStatus.PENDING:
        return <Badge variant="warning">Pending</Badge>;
      case VerifiedBMOrderStatus.PROCESSING:
        return <Badge variant="info">In Progress</Badge>;
      case VerifiedBMOrderStatus.COMPLETED:
        return <Badge variant="success">Completed</Badge>;
      case VerifiedBMOrderStatus.FAILED:
        return <Badge variant="error">Failed</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  if (isLoading) {
    return <SkeletonTable rows={5} columns={5} />;
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Pesanan</h3>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            Anda belum memiliki riwayat pesanan verifikasi BM. Buat pesanan baru untuk memulai.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Riwayat Pesanan</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tanggal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Jumlah
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">#{order.id.slice(0, 8)}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600">{formatDate(order.createdAt)}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{order.quantity} akun</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(order.amount)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(order.status)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VerifiedBMOrdersTable;
