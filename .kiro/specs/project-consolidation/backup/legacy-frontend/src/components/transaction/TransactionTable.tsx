import { Transaction } from '../../types/transaction.types';
import SkeletonTable from '../common/SkeletonTable';

interface TransactionTableProps {
  transactions: Transaction[];
  loading?: boolean;
}

const TransactionTable = ({ transactions, loading }: TransactionTableProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'BERHASIL':
        return 'badge-success';
      case 'PENDING':
        return 'badge-warning';
      case 'GAGAL':
        return 'badge-danger';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'BERHASIL':
        return 'Berhasil';
      case 'PENDING':
        return 'Pending';
      case 'GAGAL':
        return 'Gagal';
      default:
        return status;
    }
  };

  if (loading) {
    return <SkeletonTable rows={5} columns={5} />;
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-base sm:text-lg">Belum ada transaksi</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead className="table-header">
          <tr>
            <th className="table-header-cell">
              Tanggal
            </th>
            <th className="table-header-cell">
              Produk
            </th>
            <th className="table-header-cell">
              Jumlah
            </th>
            <th className="table-header-cell">
              Total
            </th>
            <th className="table-header-cell">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="table-body">
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="table-row">
              <td className="table-cell text-xs sm:text-sm">
                {formatDate(transaction.created_at)}
              </td>
              <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-900">
                <div className="font-medium">{transaction.product_name}</div>
                <div className="text-gray-500 text-xxs sm:text-xs">{transaction.product_type}</div>
              </td>
              <td className="table-cell text-xs sm:text-sm">
                {transaction.quantity}
              </td>
              <td className="table-cell text-xs sm:text-sm font-medium">
                {formatCurrency(transaction.total_amount)}
              </td>
              <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                <span
                  className={`badge ${getStatusBadgeClass(
                    transaction.status
                  )}`}
                >
                  {getStatusText(transaction.status)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
