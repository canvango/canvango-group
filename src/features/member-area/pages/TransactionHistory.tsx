import React, { useState, useMemo, useEffect } from 'react';
import { ShoppingBag, Wallet, TrendingUp } from 'lucide-react';
import SummaryCard from '../components/dashboard/SummaryCard';
import TabNavigation, { Tab } from '../components/transactions/TabNavigation';
import TransactionFilters from '../components/transactions/TransactionFilters';
import TransactionTable from '../components/transactions/TransactionTable';
import TransactionDetailModal from '../components/transactions/TransactionDetailModal';
import AccountDetailModal from '../components/transactions/AccountDetailModal';
import Pagination from '../../../shared/components/Pagination';
import { Transaction, TransactionType, TransactionStatus } from '../types/transaction';
import { formatCurrency } from '../utils/formatters';
import { usePageTitle } from '../hooks/usePageTitle';
import { usePersistedFilters } from '../../../shared/hooks/usePersistedFilters';
import { 
  fetchExtendedTransactionStats, 
  getMemberTransactions,
  ExtendedTransactionStats 
} from '../services/transactions.service';
import { supabase } from '../services/supabase';
import { ErrorFallback } from '../../../shared/components/ErrorFallback';
import { ApplicationError, createNetworkError } from '../../../shared/utils/errors';
import { LoadingSpinner } from '../../../shared/components/LoadingSpinner';

// Helper function to map database transaction to Transaction type
const mapDbTransactionToTransaction = (dbTxn: any): Transaction => {
  // Map status from database to TransactionStatus enum
  const statusMap: Record<string, TransactionStatus> = {
    'completed': TransactionStatus.SUCCESS,
    'pending': TransactionStatus.PENDING,
    'failed': TransactionStatus.FAILED,
    'cancelled': TransactionStatus.FAILED,
    'processing': TransactionStatus.PENDING,
  };

  // Map warranty data if available
  let warranty = undefined;
  if (dbTxn.warranty_expires_at) {
    warranty = {
      expiresAt: new Date(dbTxn.warranty_expires_at),
      claimed: dbTxn.purchase_status === 'claimed',
    };
  }

  return {
    id: dbTxn.id,
    userId: dbTxn.user_id,
    type: dbTxn.transaction_type === 'purchase' ? TransactionType.PURCHASE : TransactionType.TOPUP,
    status: statusMap[dbTxn.status] || TransactionStatus.PENDING,
    amount: Number(dbTxn.amount),
    quantity: 1, // Default to 1
    product: dbTxn.product_name ? {
      id: dbTxn.product_id,
      title: dbTxn.product_name
    } : undefined,
    paymentMethod: dbTxn.payment_method || 'Unknown',
    createdAt: new Date(dbTxn.created_at),
    updatedAt: new Date(dbTxn.updated_at),
    warranty: warranty,
    // Store purchase_id and account_details for AccountDetailModal
    purchaseId: dbTxn.purchase_id,
    accountDetails: dbTxn.account_details,
  };
};

const TransactionHistory: React.FC = () => {
  usePageTitle('Transaction History');
  
  // Persisted filters
  const { filters, setFilter, setFilters } = usePersistedFilters('transaction-history', {
    tab: 'accounts',
    warranty: 'all',
    dateStart: '',
    dateEnd: '',
    page: 1,
    pageSize: 10,
  });

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAccountDetailModalOpen, setIsAccountDetailModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApplicationError | null>(null);
  
  // Real data from database
  const [stats, setStats] = useState<ExtendedTransactionStats | null>(null);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);

  // Extract filter values
  const activeTab = filters.tab;
  const warrantyFilter = filters.warranty;
  const dateRange = { start: filters.dateStart, end: filters.dateEnd };
  const currentPage = filters.page;
  const pageSize = filters.pageSize;

  // Load data from database
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError('User not authenticated');
          return;
        }

        // Load stats
        const statsData = await fetchExtendedTransactionStats();
        setStats(statsData);

        // Load all transactions (we'll filter client-side for better UX)
        const dbTransactions = await getMemberTransactions({
          userId: user.id,
          limit: 1000, // Get all transactions
          offset: 0
        });

        // Map database transactions to Transaction type
        const mappedTransactions = dbTransactions.map(mapDbTransactionToTransaction);
        setAllTransactions(mappedTransactions);

      } catch (err) {
        console.error('Error loading transactions:', err);
        const appError = err instanceof ApplicationError ? err : createNetworkError('Gagal memuat data transaksi');
        setError(appError);
        // Set empty data on error
        setStats({
          totalAccountsPurchased: 0,
          totalSpending: 0,
          totalTopup: 0,
          totalTransactions: 0,
          pendingTransactions: 0,
          completedTransactions: 0,
          failedTransactions: 0,
          cancelledTransactions: 0,
        });
        setAllTransactions([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []); // Load once on mount

  // Filter transactions by tab
  const filteredByTab = useMemo(() => {
    return allTransactions.filter(transaction => {
      if (activeTab === 'accounts') {
        return transaction.type === TransactionType.PURCHASE;
      } else {
        return transaction.type === TransactionType.TOPUP;
      }
    });
  }, [allTransactions, activeTab]);

  // Apply filters
  const filteredTransactions = useMemo(() => {
    return filteredByTab.filter(transaction => {
      // Warranty filter
      if (warrantyFilter !== 'all' && transaction.type === TransactionType.PURCHASE) {
        if (warrantyFilter === 'no-warranty' && transaction.warranty) return false;
        if (warrantyFilter === 'active' && (!transaction.warranty || transaction.warranty.claimed || new Date(transaction.warranty.expiresAt) < new Date())) return false;
        if (warrantyFilter === 'expired' && (!transaction.warranty || new Date(transaction.warranty.expiresAt) >= new Date())) return false;
        if (warrantyFilter === 'claimed' && (!transaction.warranty || !transaction.warranty.claimed)) return false;
      }

      // Date range filter
      if (dateRange.start) {
        const startDate = new Date(dateRange.start);
        if (new Date(transaction.createdAt) < startDate) return false;
      }
      if (dateRange.end) {
        const endDate = new Date(dateRange.end);
        endDate.setHours(23, 59, 59, 999);
        if (new Date(transaction.createdAt) > endDate) return false;
      }

      return true;
    });
  }, [filteredByTab, warrantyFilter, dateRange]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / pageSize);
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredTransactions.slice(startIndex, startIndex + pageSize);
  }, [filteredTransactions, currentPage, pageSize]);

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailModalOpen(true);
  };

  const handleViewAccountDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsAccountDetailModalOpen(true);
  };

  const handlePageChange = (page: number) => {
    setFilter('page', page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setFilters({ pageSize: newPageSize, page: 1 });
  };

  const handleTabChange = (tabId: string) => {
    setFilters({ tab: tabId, page: 1, warranty: 'all' });
  };

  const handleWarrantyFilterChange = (value: string) => {
    setFilters({ warranty: value, page: 1 });
  };

  const handleDateRangeChange = (range: { start: string; end: string }) => {
    setFilters({ dateStart: range.start, dateEnd: range.end, page: 1 });
  };

  const tabs: Tab[] = [
    {
      id: 'accounts',
      label: 'Transaksi Akun',
      icon: <ShoppingBag className="w-4 h-4" />,
      count: allTransactions.filter(t => t.type === TransactionType.PURCHASE && t.status === TransactionStatus.SUCCESS).length
    },
    {
      id: 'topup',
      label: 'Top Up',
      icon: <Wallet className="w-4 h-4" />,
      count: allTransactions.filter(t => t.type === TransactionType.TOPUP && t.status === TransactionStatus.SUCCESS).length
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Riwayat Transaksi</h1>
        <p className="text-gray-600 mt-1">Lihat semua transaksi pembelian dan top up Anda</p>
      </div>

      {/* Error Message */}
      {error && !isLoading && (
        <ErrorFallback
          error={error}
          title="Gagal Memuat Riwayat Transaksi"
          onRetry={() => {
            setError(null);
            setIsLoading(true);
            // Trigger reload by changing a state
            window.location.reload();
          }}
        />
      )}
      
      {/* Loading State */}
      {isLoading && !error && (
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" text="Memuat riwayat transaksi..." />
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
        <SummaryCard
          icon={ShoppingBag}
          value={stats?.totalAccountsPurchased || 0}
          label="Total Akun Dibeli"
          bgColor="bg-blue-50"
        />
        <SummaryCard
          icon={TrendingUp}
          value={formatCurrency(stats?.totalSpending || 0)}
          label="Total Pengeluaran"
          bgColor="bg-green-50"
        />
        <SummaryCard
          icon={Wallet}
          value={formatCurrency(stats?.totalTopup || 0)}
          label="Total Top Up"
          bgColor="bg-primary-50"
        />
      </div>

      {/* Tab Navigation */}
      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Filters (only show for account transactions) */}
      {activeTab === 'accounts' && (
        <TransactionFilters
          warrantyFilter={warrantyFilter}
          dateRange={dateRange}
          onWarrantyFilterChange={handleWarrantyFilterChange}
          onDateRangeChange={handleDateRangeChange}
        />
      )}

      {/* Date filter for top-up */}
      {activeTab === 'topup' && (
        <div className="flex-1">
          <label htmlFor="date-start-topup" className="block text-sm font-medium text-gray-700 mb-2">
            Rentang Tanggal
          </label>
          <div className="flex gap-2">
            <input
              id="date-start-topup"
              type="date"
              value={dateRange.start}
              onChange={(e) => handleDateRangeChange({ ...dateRange, start: e.target.value })}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              aria-label="Tanggal mulai"
            />
            <span className="flex items-center text-gray-500">-</span>
            <input
              id="date-end-topup"
              type="date"
              value={dateRange.end}
              onChange={(e) => handleDateRangeChange({ ...dateRange, end: e.target.value })}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              aria-label="Tanggal akhir"
            />
          </div>
        </div>
      )}

      {/* Transaction Table */}
      <TransactionTable
        transactions={paginatedTransactions}
        onViewDetails={handleViewDetails}
        onViewAccountDetails={handleViewAccountDetails}
        isLoading={isLoading}
      />

      {/* Empty State */}
      {!isLoading && filteredTransactions.length === 0 && !error && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-gray-400 mb-4">
            {activeTab === 'accounts' ? (
              <ShoppingBag className="w-16 h-16 mx-auto" />
            ) : (
              <Wallet className="w-16 h-16 mx-auto" />
            )}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Belum Ada Transaksi
          </h3>
          <p className="text-gray-600">
            {activeTab === 'accounts' 
              ? 'Anda belum memiliki transaksi pembelian akun.'
              : 'Anda belum memiliki transaksi top up.'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {filteredTransactions.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={filteredTransactions.length}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        transaction={selectedTransaction}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedTransaction(null);
        }}
      />

      {/* Account Detail Modal */}
      <AccountDetailModal
        transaction={selectedTransaction}
        isOpen={isAccountDetailModalOpen}
        onClose={() => {
          setIsAccountDetailModalOpen(false);
          setSelectedTransaction(null);
        }}
      />
    </div>
  );
};

export default TransactionHistory;
