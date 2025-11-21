import React from 'react';
import Badge from '../../../../shared/components/Badge';
import { SkeletonTable } from '../../../../shared/components/SkeletonLoader';
import EmptyState from '../shared/EmptyState';
import { Eye, AlertCircle } from 'lucide-react';
import type { Transaction } from '../../types/transaction';
import { TransactionStatus } from '../../types/transaction';

interface RecentTransactionsProps {
  transactions: Transaction[];
  isLoading?: boolean;
  error?: string | null;
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ 
  transactions, 
  isLoading = false,
  error = null
}) => {
  // Filter out Top Up Saldo transactions
  const filteredTransactions = transactions.filter(tx => tx.transactionType !== 'topup');

  const statusVariant: Record<TransactionStatus, 'success' | 'warning' | 'error'> = {
    [TransactionStatus.SUCCESS]: 'success',
    [TransactionStatus.COMPLETED]: 'success',
    [TransactionStatus.PENDING]: 'warning',
    [TransactionStatus.FAILED]: 'error',
    [TransactionStatus.CANCELLED]: 'error'
  };

  const statusLabel: Record<TransactionStatus, string> = {
    [TransactionStatus.SUCCESS]: 'Berhasil',
    [TransactionStatus.COMPLETED]: 'Berhasil',
    [TransactionStatus.PENDING]: 'Pending',
    [TransactionStatus.FAILED]: 'Gagal',
    [TransactionStatus.CANCELLED]: 'Dibatalkan'
  };

  // Format date to readable format
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return <SkeletonTable rows={5} columns={6} />;
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-white rounded-3xl shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Eye className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Transaksi Terbaru</h3>
          </div>
        </div>
        <div className="p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Gagal Memuat Data</h3>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!filteredTransactions || filteredTransactions.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow overflow-hidden">
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
    <div className="bg-white rounded-3xl shadow overflow-hidden">
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
              <th className="px-3 md:px-4 py-2 md:py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-tight">User</th>
              <th className="px-3 md:px-4 py-2 md:py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-tight">Tanggal</th>
              <th className="px-3 md:px-4 py-2 md:py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-tight">Produk</th>
              <th className="px-3 md:px-4 py-2 md:py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-tight">Jumlah</th>
              <th className="px-3 md:px-4 py-2 md:py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-tight">Total</th>
              <th className="px-3 md:px-4 py-2 md:py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-tight">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredTransactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-gray-50">
                <td className="px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm text-gray-900 leading-tight">
                  {(tx as any).username || 'user****'}
                </td>
                <td className="px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm text-gray-600 leading-tight">
                  {formatDate(tx.createdAt)}
                </td>
                <td className="px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm text-gray-900 leading-tight">
                  {tx.productName || tx.product?.title || 'N/A'}
                </td>
                <td className="px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm text-gray-600 leading-tight">
                  {`${tx.quantity || 1} Akun`}
                </td>
                <td className="px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm font-medium text-gray-900 leading-tight">
                  Rp {tx.amount.toLocaleString('id-ID')}
                </td>
                <td className="px-3 md:px-4 py-2 md:py-2.5">
                  <Badge variant={statusVariant[tx.status]} size="sm">
                    {statusLabel[tx.status]}
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
