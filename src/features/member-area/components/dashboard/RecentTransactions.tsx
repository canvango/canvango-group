import React from 'react';
import { Eye, RefreshCw, CheckCircle, Clock, XCircle } from 'lucide-react';
import type { Transaction } from '../../types/transaction';
import { TransactionStatus } from '../../types/transaction';
import TransactionCard from './TransactionCard';

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

  const statusConfig: Record<TransactionStatus, { color: string; label: string; icon: React.ElementType }> = {
    [TransactionStatus.SUCCESS]: { color: 'bg-green-100 text-green-800', label: 'Berhasil', icon: CheckCircle },
    [TransactionStatus.COMPLETED]: { color: 'bg-green-100 text-green-800', label: 'Berhasil', icon: CheckCircle },
    [TransactionStatus.PENDING]: { color: 'bg-orange-100 text-orange-800', label: 'Pending', icon: Clock },
    [TransactionStatus.FAILED]: { color: 'bg-red-100 text-red-800', label: 'Gagal', icon: XCircle },
    [TransactionStatus.CANCELLED]: { color: 'bg-gray-100 text-gray-800', label: 'Dibatalkan', icon: XCircle }
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Eye className="w-5 h-5 text-primary-600" />
          <h3 className="text-base md:text-lg font-semibold text-gray-900">
            Transaksi Terbaru
          </h3>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="py-8 text-center">
          <RefreshCw className="w-6 h-6 text-gray-400 animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-500">Memuat transaksi...</p>
        </div>
      ) : error ? (
        <div className="py-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-3">
            <XCircle className="w-6 h-6 text-red-600" />
          </div>
          <h4 className="text-sm font-semibold text-gray-900 mb-1">Gagal Memuat Data</h4>
          <p className="text-xs text-gray-600">{error}</p>
        </div>
      ) : !filteredTransactions || filteredTransactions.length === 0 ? (
        <div className="py-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
            <Eye className="w-6 h-6 text-gray-400" />
          </div>
          <h4 className="text-sm font-semibold text-gray-900 mb-1">Belum Ada Transaksi</h4>
          <p className="text-xs text-gray-600">Transaksi terbaru Anda akan muncul di sini</p>
        </div>
      ) : (
        <>
          {/* Mobile View - Card Layout */}
          <div className="md:hidden p-4 space-y-3">
            {filteredTransactions.map((tx) => (
              <TransactionCard key={tx.id} transaction={tx} />
            ))}
          </div>

          {/* Desktop View - Table Layout */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Produk
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Jumlah
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((tx) => {
                  const config = statusConfig[tx.status];
                  const Icon = config.icon;
                  const quantity = tx.quantity || (tx as any).metadata?.quantity || 1;
                  const username = (tx as any).username || 'User';
                  
                  // Mask username
                  const maskUsername = (username: string): string => {
                    if (!username || username.length <= 3) return username + '******';
                    return username.substring(0, 3) + '******';
                  };
                  
                  return (
                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-semibold text-gray-700">
                        {maskUsername(username)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {formatDate(tx.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-700">
                        {tx.productName || tx.product?.title || 'Layanan Verifikasi BM'}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-700">
                        {quantity} Akun
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-700">
                        Rp {tx.amount.toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3">
                        <span 
                          className={`px-3 py-1 text-xs font-medium rounded-2xl border inline-flex items-center gap-1 ${config.color}`}
                        >
                          <Icon className="w-3 h-3" />
                          {config.label.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default RecentTransactions;
