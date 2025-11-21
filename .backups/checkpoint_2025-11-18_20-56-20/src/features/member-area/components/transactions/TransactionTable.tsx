import React, { useState } from 'react';
import { Eye, ChevronUp, ChevronDown } from 'lucide-react';
import Badge from '../../../../shared/components/Badge';
import Button from '../../../../shared/components/Button';
import { Transaction, TransactionStatus } from '../../types/transaction';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { SkeletonTable } from '../../../../shared/components/SkeletonLoader';
import EmptyState from '../shared/EmptyState';

export interface TransactionTableProps {
  transactions: Transaction[];
  onViewDetails: (transaction: Transaction) => void;
  isLoading?: boolean;
}

type SortField = 'date' | 'amount' | 'status';
type SortOrder = 'asc' | 'desc';

const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  onViewDetails,
  isLoading = false
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
    <div className="overflow-x-auto bg-white rounded-lg shadow -mx-4 md:mx-0">
      <table className="w-full min-w-[800px]">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID Transaksi
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('date')}
            >
              <div className="flex items-center gap-1">
                Tanggal
                <SortIcon field="date" />
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Produk
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Jumlah
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('amount')}
            >
              <div className="flex items-center gap-1">
                Total
                <SortIcon field="amount" />
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('status')}
            >
              <div className="flex items-center gap-1">
                Status
                <SortIcon field="status" />
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Garansi
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedTransactions.map((transaction) => (
            <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                #{transaction.id.slice(0, 8)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDateTime(transaction.createdAt)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {transaction.product?.title || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {transaction.quantity || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                {formatCurrency(transaction.amount)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(transaction.status)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getWarrantyBadge(transaction.warranty)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Eye className="w-4 h-4" />}
                  onClick={() => onViewDetails(transaction)}
                  aria-label={`Lihat detail transaksi ${transaction.id}`}
                >
                  Lihat
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
