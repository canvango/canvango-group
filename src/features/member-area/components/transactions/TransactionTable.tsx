import React, { useState } from 'react';
import { Eye, ChevronUp, ChevronDown } from 'lucide-react';
import Badge from '../../../../shared/components/Badge';
import { Transaction, TransactionStatus } from '../../types/transaction';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { SkeletonTable } from '../../../../shared/components/SkeletonLoader';
import EmptyState from '../shared/EmptyState';

export interface TransactionTableProps {
  transactions: Transaction[];
  onViewDetails: (transaction: Transaction) => void;
  isLoading?: boolean;
  transactionType?: 'purchase' | 'topup'; // Add type to customize columns
}

type SortField = 'date' | 'amount' | 'status';
type SortOrder = 'asc' | 'desc';

const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  onViewDetails,
  isLoading = false,
  transactionType = 'purchase'
}) => {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'date':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'amount':
        comparison = a.amount - b.amount;
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const getStatusBadge = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.SUCCESS:
        return <Badge variant="success" size="sm">Berhasil</Badge>;
      case TransactionStatus.PENDING:
        return <Badge variant="warning" size="sm">Pending</Badge>;
      case TransactionStatus.FAILED:
        return <Badge variant="error" size="sm">Gagal</Badge>;
      default:
        return <Badge variant="default" size="sm">{status}</Badge>;
    }
  };

  const getWarrantyBadge = (warranty?: { expiresAt: Date; claimed: boolean }) => {
    if (!warranty) {
      return <Badge variant="default" size="sm">Tanpa Garansi</Badge>;
    }

    if (warranty.claimed) {
      return <Badge variant="info" size="sm">Sudah Diklaim</Badge>;
    }

    const now = new Date();
    const expiresAt = new Date(warranty.expiresAt);
    
    if (expiresAt < now) {
      return <Badge variant="error" size="sm">Kadaluarsa</Badge>;
    }

    const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft <= 7) {
      return <Badge variant="warning" size="sm">Aktif ({daysLeft} hari)</Badge>;
    }

    return <Badge variant="success" size="sm">Aktif</Badge>;
  };

  const SortIcon: React.FC<{ field: SortField }> = ({ field }) => {
    if (sortField !== field) {
      return <ChevronUp className="w-4 h-4 text-gray-400" />;
    }
    return sortOrder === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-primary-600" />
    ) : (
      <ChevronDown className="w-4 h-4 text-primary-600" />
    );
  };

  if (isLoading) {
    return <SkeletonTable rows={10} columns={8} />;
  }

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={Eye}
        title="Tidak Ada Transaksi"
        description="Transaksi Anda akan muncul di sini setelah melakukan pembelian atau top up"
      />
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-3xl border border-gray-200 -mx-4 md:mx-0">
      <table className="w-full min-w-[800px]">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
              ID Transaksi
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('date')}
            >
              <div className="flex items-center gap-1">
                Tanggal
                <SortIcon field="date" />
              </div>
            </th>
            {transactionType === 'purchase' && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Produk
              </th>
            )}
            {transactionType === 'topup' && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Metode Pembayaran
              </th>
            )}
            {transactionType === 'purchase' && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Jumlah
              </th>
            )}
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('amount')}
            >
              <div className="flex items-center gap-1">
                {transactionType === 'topup' ? 'Nominal' : 'Total'}
                <SortIcon field="amount" />
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('status')}
            >
              <div className="flex items-center gap-1">
                Status
                <SortIcon field="status" />
              </div>
            </th>
            {transactionType === 'purchase' && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Garansi
              </th>
            )}
            {transactionType === 'topup' && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Status TriPay
              </th>
            )}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedTransactions.map((transaction) => (
            <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700 font-mono">
                #{transaction.id.slice(0, 8)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {formatDateTime(transaction.createdAt)}
              </td>
              {transactionType === 'purchase' && (
                <td className="px-6 py-4 text-sm text-gray-700">
                  {transaction.product?.title || '-'}
                </td>
              )}
              {transactionType === 'topup' && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {transaction.tripayPaymentName || transaction.paymentMethod || '-'}
                </td>
              )}
              {transactionType === 'purchase' && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {transaction.quantity || '-'}
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">
                {formatCurrency(transaction.amount)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(transaction.status)}
              </td>
              {transactionType === 'purchase' && (
                <td className="px-6 py-4 whitespace-nowrap">
                  {getWarrantyBadge(transaction.warranty)}
                </td>
              )}
              {transactionType === 'topup' && (
                <td className="px-6 py-4 whitespace-nowrap">
                  {transaction.tripayStatus ? (
                    transaction.tripayStatus === 'PAID' ? (
                      <Badge variant="success" size="sm">Dibayar</Badge>
                    ) : transaction.tripayStatus === 'UNPAID' ? (
                      <Badge variant="warning" size="sm">Belum Dibayar</Badge>
                    ) : transaction.tripayStatus === 'EXPIRED' ? (
                      <Badge variant="error" size="sm">Kadaluarsa</Badge>
                    ) : (
                      <Badge variant="default" size="sm">{transaction.tripayStatus}</Badge>
                    )
                  ) : (
                    <Badge variant="default" size="sm">-</Badge>
                  )}
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <button
                  onClick={() => onViewDetails(transaction)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors duration-200"
                  aria-label={`Lihat detail transaksi ${transaction.id}`}
                  title="Lihat detail"
                >
                  <Eye className="w-4 h-4" />
                  <span>Detail</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
