import React from 'react';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import type { Transaction } from '../../types/transaction';
import { TransactionStatus } from '../../types/transaction';

interface TransactionCardProps {
  transaction: Transaction;
}

const TransactionCard: React.FC<TransactionCardProps> = ({ transaction }) => {
  const statusConfig: Record<TransactionStatus, { color: string; label: string; icon: React.ElementType }> = {
    [TransactionStatus.SUCCESS]: { color: 'bg-green-100 text-green-800 border-green-200', label: 'BERHASIL', icon: CheckCircle },
    [TransactionStatus.COMPLETED]: { color: 'bg-green-100 text-green-800 border-green-200', label: 'BERHASIL', icon: CheckCircle },
    [TransactionStatus.PENDING]: { color: 'bg-orange-100 text-orange-800 border-orange-200', label: 'PENDING', icon: Clock },
    [TransactionStatus.FAILED]: { color: 'bg-red-100 text-red-800 border-red-200', label: 'GAGAL', icon: XCircle },
    [TransactionStatus.CANCELLED]: { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'DIBATALKAN', icon: XCircle }
  };

  const config = statusConfig[transaction.status];
  const Icon = config.icon;

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('id-ID', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get username from transaction data
  const username = transaction.username || 'Member';
  
  // Mask username - show only first 3 characters for privacy
  const maskUsername = (name: string): string => {
    if (!name) return 'Mem******';
    if (name.length <= 3) return name + '******';
    return name.substring(0, 3) + '******';
  };

  const quantity = transaction.quantity || (transaction as any).metadata?.quantity || 1;

  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-4 divide-y divide-dashed divide-gray-200">
      {/* User */}
      <div className="flex justify-between items-start py-2.5 first:pt-0">
        <span className="text-xs text-gray-500">User</span>
        <span className="text-xs font-medium text-gray-700 text-right">
          {maskUsername(username)}
        </span>
      </div>

      {/* Tanggal */}
      <div className="flex justify-between items-start py-2.5">
        <span className="text-xs text-gray-500">Tanggal</span>
        <span className="text-xs font-medium text-gray-700 text-right">
          {formatDate(transaction.createdAt)}
        </span>
      </div>

      {/* Produk */}
      <div className="flex justify-between items-start py-2.5">
        <span className="text-xs text-gray-500">Produk</span>
        <span className="text-xs font-medium text-gray-700 text-right max-w-[60%]">
          {transaction.productName || transaction.product?.title || 'Layanan Verifikasi BM'}
        </span>
      </div>

      {/* Jumlah */}
      <div className="flex justify-between items-start py-2.5">
        <span className="text-xs text-gray-500">Jumlah</span>
        <span className="text-xs font-medium text-gray-700 text-right">
          {quantity} Akun
        </span>
      </div>

      {/* Total */}
      <div className="flex justify-between items-start py-2.5">
        <span className="text-xs text-gray-500">Total</span>
        <span className="text-xs font-medium text-gray-700 text-right">
          Rp {transaction.amount.toLocaleString('id-ID')}
        </span>
      </div>

      {/* Status */}
      <div className="flex justify-between items-start py-2.5 last:pb-0">
        <span className="text-xs text-gray-500">Status</span>
        <span 
          className={`px-3 py-1 text-xs font-medium rounded-2xl border flex items-center gap-1 ${config.color}`}
        >
          <Icon className="w-3 h-3" />
          {config.label}
        </span>
      </div>
    </div>
  );
};

export default TransactionCard;
