import React from 'react';
import { Eye, RefreshCw, CheckCircle, Clock, XCircle, Calendar, User, Package, CreditCard } from 'lucide-react';
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
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Eye className="w-5 h-5 text-primary-600" />
          <h3 className="text-base md:text-lg font-semibold text-gray-900">
            Transaksi Terbaru
          </h3>
        </div>
      </div>

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
          <p className="text-xs text-gray-500">{error}</p>
        </div>
      ) : !filteredTransactions || filteredTransactions.length === 0 ? (
        <div className="py-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
            <Eye className="w-6 h-6 text-gray-400" />
          </div>
          <h4 className="text-sm font-semibold text-gray-900 mb-1">Belum Ada Transaksi</h4>
          <p className="text-xs text-gray-500">Transaksi terbaru Anda akan muncul di sini</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {filteredTransactions.map((tx) => {
            const config = statusConfig[tx.status];
            const Icon = config.icon;
            
            return (
              <div 
                key={tx.id} 
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h4 className="text-sm font-semibold text-gray-900 flex-1">
                    {tx.productName || tx.product?.title || 'N/A'}
                  </h4>
                  <span 
                    className={`px-2.5 py-1 text-xs font-medium rounded-2xl flex-shrink-0 flex items-center gap-1 ${config.color}`}
                  >
                    <Icon className="w-3 h-3" />
                    {config.label}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-2 leading-relaxed">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {(tx as any).username || 'user****'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      {`${tx.quantity || 1} Akun`}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-gray-900">
                      <CreditCard className="w-3 h-3" />
                      Rp {tx.amount.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="w-3 h-3 mr-1" aria-hidden="true" />
                  <time dateTime={tx.createdAt.toString()}>
                    {formatDate(tx.createdAt)}
                  </time>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentTransactions;
