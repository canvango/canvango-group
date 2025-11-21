import React from 'react';
import Badge from '../../../../shared/components/Badge';
import { SkeletonTable } from '../../../../shared/components/SkeletonLoader';
import EmptyState from '../shared/EmptyState';
import { Eye } from 'lucide-react';

interface Transaction {
  id: string;
  date: string;
  product: string;
  quantity: number;
  total: number;
  status: 'success' | 'pending' | 'failed';
}

interface RecentTransactionsProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ 
  transactions, 
  isLoading = false 
}) => {
  const statusVariant = {
    success: 'success' as const,
    pending: 'warning' as const,
    failed: 'error' as const
  };

  if (isLoading) {
    return <SkeletonTable rows={5} columns={7} />;
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Eye className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Transaksi Terbaru</h3>
          </div>
        </div>
        <EmptyState
          icon={Eye}
          title="Belum Ada Transaksi"
          description="Transaksi terbaru Anda akan muncul di sini"
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Eye className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Transaksi Terbaru</h3>
        </div>
      </div>
      <div className="overflow-x-auto -mx-4 md:mx-0">
        <table className="w-full min-w-[650px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 md:px-4 py-2 md:py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-tight">ID</th>
              <th className="px-3 md:px-4 py-2 md:py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-tight">Tanggal</th>
              <th className="px-3 md:px-4 py-2 md:py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-tight">Produk</th>
              <th className="px-3 md:px-4 py-2 md:py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-tight">Jumlah</th>
              <th className="px-3 md:px-4 py-2 md:py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-tight">Total</th>
              <th className="px-3 md:px-4 py-2 md:py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-tight">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-gray-50">
                <td className="px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm text-gray-900 leading-tight">{tx.id}</td>
                <td className="px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm text-gray-600 leading-tight">{tx.date}</td>
                <td className="px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm text-gray-900 leading-tight">{tx.product}</td>
                <td className="px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm text-gray-600 leading-tight">{tx.quantity} Akun</td>
                <td className="px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm font-medium text-gray-900 leading-tight">Rp {tx.total.toLocaleString()}</td>
                <td className="px-3 md:px-4 py-2 md:py-2.5">
                  <Badge variant={statusVariant[tx.status]} size="sm">
                    {tx.status === 'success' ? 'Berhasil' : tx.status === 'pending' ? 'Pending' : 'Gagal'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentTransactions;
