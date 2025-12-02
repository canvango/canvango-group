import React, { useState, useMemo, useEffect } from 'react';
import { ShoppingBag, Wallet, TrendingUp, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import SummaryCard from '../components/dashboard/SummaryCard';
import TabNavigation, { Tab } from '../components/transactions/TabNavigation';
import TransactionFilters from '../components/transactions/TransactionFilters';
import TransactionTable from '../components/transactions/TransactionTable';
import TransactionDetailModal from '../components/transactions/TransactionDetailModal';
import AccountDetailModal from '../components/transactions/AccountDetailModal';
import TripayTransactionDetailModal from '@/features/payment/components/TripayTransactionDetailModal';
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
import { supabase } from '@/clients/supabase';
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
    
    // TriPay payment gateway fields
    tripayReference: dbTxn.tripay_reference,
    tripayMerchantRef: dbTxn.tripay_merchant_ref,
    tripayPaymentMethod: dbTxn.tripay_payment_method,
    tripayPaymentName: dbTxn.tripay_payment_name,
    tripayStatus: dbTxn.tripay_status,
    tripayQrUrl: dbTxn.tripay_qr_url,
    tripayPaymentUrl: dbTxn.tripay_payment_url,
    tripayAmount: dbTxn.tripay_amount ? Number(dbTxn.tripay_amount) : undefined,
    tripayFee: dbTxn.tripay_fee ? Number(dbTxn.tripay_fee) : undefined,
    tripayTotalAmount: dbTxn.tripay_total_amount ? Number(dbTxn.tripay_total_amount) : undefined,
    tripayCallbackData: dbTxn.tripay_callback_data,
  };
};

const TransactionHistory: React.FC = () => {
  usePageTitle('Transaction History');
  
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Persisted filters
  const { filters, setFilter, setFilters } = usePersistedFilters('transaction-history', {
    tab: 'accounts',
    warranty: 'all',
    paymentMethod: 'all',
    tripayStatus: 'all',
    dateStart: '',
    dateEnd: '',
    page: 1,
    pageSize: 10,
  });

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAccountDetailModalOpen, setIsAccountDetailModalOpen] = useState(false);
  const [isTripayDetailModalOpen, setIsTripayDetailModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApplicationError | null>(null);
  const [loadingProgress, setLoadingProgress] = useState<string>('Memuat data...');
  
  // Real data from database
  const [stats, setStats] = useState<ExtendedTransactionStats | null>(null);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);

  // Extract filter values
  const activeTab = filters.tab;
  const warrantyFilter = filters.warranty;
  const paymentMethodFilter = filters.paymentMethod;
  const tripayStatusFilter = filters.tripayStatus;
  const dateRange = { start: filters.dateStart, end: filters.dateEnd };
  const currentPage = filters.page;
  const pageSize = filters.pageSize;

  // Handle redirect from Tripay payment
  useEffect(() => {
    const tripayRef = searchParams.get('tripay_reference');
    const merchantRef = searchParams.get('tripay_merchant_ref');
    
    if (tripayRef && merchantRef) {
      // Show success notification
      toast.success('Pembayaran berhasil! Transaksi Anda sedang diproses.', {
        duration: 5000,
        icon: '✅',
      });
      
      // Clean URL after showing notification
      setTimeout(() => {
        navigate('/riwayat-transaksi', { replace: true });
      }, 1000);
    }
  }, [searchParams, navigate]);

  // Load data from database
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setLoadingProgress('Memuat data pengguna...');

        // Get current user with timeout
        const userPromise = supabase.auth.getUser();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout: Gagal memuat data pengguna')), 10000)
        );
        
        const { data: { user } } = await Promise.race([userPromise, timeoutPromise]) as any;
        
        if (!user) {
          throw new Error('User not authenticated');
        }

        // Load stats
        setLoadingProgress('Memuat statistik transaksi...');
        const statsPromise = fetchExtendedTransactionStats();
        const statsTimeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout: Gagal memuat statistik')), 10000)
        );
        
        const statsData = await Promise.race([statsPromise, statsTimeoutPromise]) as ExtendedTransactionStats;
        setStats(statsData);

        // Load transactions with reduced limit for better performance
        setLoadingProgress('Memuat riwayat transaksi...');
        const transactionsPromise = getMemberTransactions({
          userId: user.id,
          limit: 100, // Reduced from 1000 to 100 for better performance
          offset: 0
        });
        const transactionsTimeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout: Gagal memuat transaksi')), 15000)
        );

        const dbTransactions = await Promise.race([transactionsPromise, transactionsTimeoutPromise]) as any[];

        // Map database transactions to Transaction type
        setLoadingProgress('Memproses data...');
        const mappedTransactions = dbTransactions.map(mapDbTransactionToTransaction);
        setAllTransactions(mappedTransactions);

      } catch (err) {
        console.error('Error loading transactions:', err);
        
        // Show user-friendly error message
        const errorMessage = err instanceof Error ? err.message : 'Gagal memuat data transaksi';
        toast.error(errorMessage, { duration: 5000 });
        
        const appError = err instanceof ApplicationError 
          ? err 
          : createNetworkError(errorMessage);
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
        setLoadingProgress('Memuat data...');
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
      // Warranty filter (only for purchase transactions)
      if (activeTab === 'accounts' && warrantyFilter !== 'all' && transaction.type === TransactionType.PURCHASE) {
        if (warrantyFilter === 'no-warranty' && transaction.warranty) return false;
        if (warrantyFilter === 'active' && (!transaction.warranty || transaction.warranty.claimed || new Date(transaction.warranty.expiresAt) < new Date())) return false;
        if (warrantyFilter === 'expired' && (!transaction.warranty || new Date(transaction.warranty.expiresAt) >= new Date())) return false;
        if (warrantyFilter === 'claimed' && (!transaction.warranty || !transaction.warranty.claimed)) return false;
      }

      // Payment method filter (only for topup transactions)
      if (activeTab === 'topup' && paymentMethodFilter !== 'all') {
        if (transaction.paymentMethod !== paymentMethodFilter) return false;
      }

      // TriPay status filter (only for topup transactions)
      if (activeTab === 'topup' && tripayStatusFilter !== 'all') {
        if (!transaction.tripayStatus || transaction.tripayStatus !== tripayStatusFilter) return false;
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
  }, [filteredByTab, activeTab, warrantyFilter, paymentMethodFilter, tripayStatusFilter, dateRange]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / pageSize);
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredTransactions.slice(startIndex, startIndex + pageSize);
  }, [filteredTransactions, currentPage, pageSize]);

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    
    // Check if it's a TriPay transaction (TOPUP with tripay_reference)
    if (transaction.type === TransactionType.TOPUP && transaction.tripayReference) {
      setIsTripayDetailModalOpen(true);
    } else {
      setIsDetailModalOpen(true);
    }
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
    setFilters({ 
      tab: tabId, 
      page: 1, 
      warranty: 'all',
      paymentMethod: 'all',
      tripayStatus: 'all'
    });
  };

  const handleWarrantyFilterChange = (value: string) => {
    setFilters({ warranty: value, page: 1 });
  };

  const handlePaymentMethodFilterChange = (value: string) => {
    setFilters({ paymentMethod: value, page: 1 });
  };

  const handleTripayStatusFilterChange = (value: string) => {
    setFilters({ tripayStatus: value, page: 1 });
  };

  const handleDateRangeChange = (range: { start: string; end: string }) => {
    setFilters({ dateStart: range.start, dateEnd: range.end, page: 1 });
  };

  const tabs: Tab[] = [
    {
      id: 'accounts',
      label: 'Transaksi Akun',
      icon: <ShoppingBag className="w-4 h-4" />,
      count: allTransactions.filter(t => t.type === TransactionType.PURCHASE).length
    },
    {
      id: 'topup',
      label: 'Top Up',
      icon: <Wallet className="w-4 h-4" />,
      count: allTransactions.filter(t => t.type === TransactionType.TOPUP).length
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Riwayat Transaksi</h1>
        <p className="text-sm leading-relaxed text-gray-600 mt-1">Lihat semua transaksi pembelian dan top up Anda</p>
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
          <LoadingSpinner size="lg" text={loadingProgress} />
        </div>
      )}

      {/* Summary Cards - Different per tab */}
      {activeTab === 'accounts' ? (
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
            icon={CheckCircle}
            value={stats?.completedTransactions || 0}
            label="Transaksi Selesai"
            bgColor="bg-green-50"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
          <SummaryCard
            icon={Wallet}
            value={formatCurrency(stats?.totalTopup || 0)}
            label="Total Top Up"
            bgColor="bg-primary-50"
          />
          <SummaryCard
            icon={Clock}
            value={allTransactions.filter(t => t.type === TransactionType.TOPUP && t.status === TransactionStatus.PENDING).length}
            label="Pending"
            bgColor="bg-orange-50"
          />
          <SummaryCard
            icon={CheckCircle}
            value={allTransactions.filter(t => t.type === TransactionType.TOPUP && t.status === TransactionStatus.SUCCESS).length}
            label="Berhasil"
            bgColor="bg-green-50"
          />
        </div>
      )}

      {/* Tab Navigation */}
      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Filters - Different per tab */}
      {activeTab === 'accounts' ? (
        <TransactionFilters
          warrantyFilter={warrantyFilter}
          dateRange={dateRange}
          onWarrantyFilterChange={handleWarrantyFilterChange}
          onDateRangeChange={handleDateRangeChange}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200 p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Payment Method Filter */}
            <div>
              <label htmlFor="payment-method-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Metode Pembayaran
              </label>
              <select
                id="payment-method-filter"
                value={paymentMethodFilter}
                onChange={(e) => handlePaymentMethodFilterChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm text-gray-700"
              >
                <option value="all">Semua Metode</option>
                <option value="QRIS2">QRIS</option>
                <option value="BRIVA">BRI Virtual Account</option>
                <option value="BNIVA">BNI Virtual Account</option>
                <option value="MANDIRIVA">Mandiri Virtual Account</option>
                <option value="PERMATAVA">Permata Virtual Account</option>
              </select>
            </div>

            {/* TriPay Status Filter */}
            <div>
              <label htmlFor="tripay-status-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Status Pembayaran
              </label>
              <select
                id="tripay-status-filter"
                value={tripayStatusFilter}
                onChange={(e) => handleTripayStatusFilterChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm text-gray-700"
              >
                <option value="all">Semua Status</option>
                <option value="UNPAID">Belum Dibayar</option>
                <option value="PAID">Sudah Dibayar</option>
                <option value="EXPIRED">Kadaluarsa</option>
                <option value="FAILED">Gagal</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label htmlFor="date-start-topup" className="block text-sm font-medium text-gray-700 mb-2">
                Rentang Tanggal
              </label>
              <div className="flex gap-2">
                <input
                  id="date-start-topup"
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => handleDateRangeChange({ ...dateRange, start: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm text-gray-700"
                  aria-label="Tanggal mulai"
                />
                <span className="flex items-center text-gray-500 text-sm">-</span>
                <input
                  id="date-end-topup"
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => handleDateRangeChange({ ...dateRange, end: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm text-gray-700"
                  aria-label="Tanggal akhir"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Table - Desktop */}
      <div className="hidden md:block">
        <TransactionTable
          transactions={paginatedTransactions}
          onViewDetails={handleViewDetails}
          isLoading={isLoading}
          transactionType={activeTab === 'accounts' ? 'purchase' : 'topup'}
        />
      </div>

      {/* Transaction Cards - Mobile */}
      <div className="md:hidden space-y-3">
        {paginatedTransactions.map((transaction) => (
          <div 
            key={transaction.id}
            className="bg-white rounded-3xl border border-gray-200 p-4 divide-y divide-dashed divide-gray-200 hover:shadow-md transition-shadow duration-200"
          >
            {/* ID Transaksi */}
            <div className="flex justify-between items-start py-2.5 first:pt-0">
              <span className="text-xs text-gray-500">ID Transaksi</span>
              <span className="text-xs font-medium text-gray-700 text-right font-mono">
                {transaction.id.substring(0, 8)}...
              </span>
            </div>

            {/* Tanggal */}
            <div className="flex justify-between items-start py-2.5">
              <span className="text-xs text-gray-500">Tanggal</span>
              <span className="text-xs font-medium text-gray-700 text-right">
                {new Date(transaction.createdAt).toLocaleDateString('id-ID', { 
                  day: '2-digit', 
                  month: 'short', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>

            {/* Produk / Metode Pembayaran */}
            {activeTab === 'accounts' ? (
              <>
                <div className="flex justify-between items-start py-2.5">
                  <span className="text-xs text-gray-500">Produk</span>
                  <span className="text-xs font-medium text-gray-700 text-right max-w-[60%]">
                    {transaction.product?.title || '-'}
                  </span>
                </div>
                <div className="flex justify-between items-start py-2.5">
                  <span className="text-xs text-gray-500">Jumlah</span>
                  <span className="text-xs font-medium text-gray-700 text-right">
                    {transaction.quantity || 1} Akun
                  </span>
                </div>
              </>
            ) : (
              <div className="flex justify-between items-start py-2.5">
                <span className="text-xs text-gray-500">Metode Pembayaran</span>
                <span className="text-xs font-medium text-gray-700 text-right">
                  {transaction.tripayPaymentName || transaction.paymentMethod || '-'}
                </span>
              </div>
            )}

            {/* Total */}
            <div className="flex justify-between items-start py-2.5">
              <span className="text-xs text-gray-500">{activeTab === 'topup' ? 'Nominal' : 'Total'}</span>
              <span className="text-xs font-medium text-gray-700 text-right">
                Rp {transaction.amount.toLocaleString('id-ID')}
              </span>
            </div>

            {/* Status */}
            <div className="flex justify-between items-start py-2.5">
              <span className="text-xs text-gray-500">Status</span>
              <span 
                className={`px-3 py-1 text-xs font-medium rounded-2xl border flex items-center gap-1 ${
                  transaction.status === TransactionStatus.SUCCESS || transaction.status === TransactionStatus.COMPLETED
                    ? 'bg-green-100 text-green-800 border-green-200'
                    : transaction.status === TransactionStatus.PENDING
                    ? 'bg-orange-100 text-orange-800 border-orange-200'
                    : 'bg-red-100 text-red-800 border-red-200'
                }`}
              >
                {transaction.status === TransactionStatus.SUCCESS || transaction.status === TransactionStatus.COMPLETED ? (
                  <>
                    <CheckCircle className="w-3 h-3" />
                    BERHASIL
                  </>
                ) : transaction.status === TransactionStatus.PENDING ? (
                  <>
                    <Clock className="w-3 h-3" />
                    PENDING
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3" />
                    GAGAL
                  </>
                )}
              </span>
            </div>

            {/* Garansi - Only for purchase transactions */}
            {activeTab === 'accounts' && transaction.warranty && (
              <div className="flex justify-between items-start py-2.5">
                <span className="text-xs text-gray-500">Garansi</span>
                <span 
                  className={`px-3 py-1 text-xs font-medium rounded-2xl border ${
                    transaction.warranty.claimed
                      ? 'bg-red-100 text-red-800 border-red-200'
                      : new Date(transaction.warranty.expiresAt) < new Date()
                      ? 'bg-gray-100 text-gray-800 border-gray-200'
                      : 'bg-green-100 text-green-800 border-green-200'
                  }`}
                >
                  {transaction.warranty.claimed
                    ? 'Diklaim'
                    : new Date(transaction.warranty.expiresAt) < new Date()
                    ? 'Kadaluarsa'
                    : 'Aktif'}
                </span>
              </div>
            )}

            {/* Status TriPay - Only for topup transactions */}
            {activeTab === 'topup' && transaction.tripayStatus && (
              <div className="flex justify-between items-start py-2.5">
                <span className="text-xs text-gray-500">Status TriPay</span>
                <span 
                  className={`px-3 py-1 text-xs font-medium rounded-2xl border ${
                    transaction.tripayStatus === 'PAID'
                      ? 'bg-green-100 text-green-800 border-green-200'
                      : transaction.tripayStatus === 'UNPAID'
                      ? 'bg-orange-100 text-orange-800 border-orange-200'
                      : transaction.tripayStatus === 'EXPIRED'
                      ? 'bg-gray-100 text-gray-800 border-gray-200'
                      : 'bg-red-100 text-red-800 border-red-200'
                  }`}
                >
                  {transaction.tripayStatus === 'PAID' ? 'Dibayar' : 
                   transaction.tripayStatus === 'UNPAID' ? 'Belum Dibayar' :
                   transaction.tripayStatus === 'EXPIRED' ? 'Kadaluarsa' :
                   transaction.tripayStatus}
                </span>
              </div>
            )}

            {/* Aksi */}
            <div className="flex gap-2 pt-3 last:pb-0">
              <button
                onClick={() => handleViewDetails(transaction)}
                className="flex-1 px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
              >
                Detail
              </button>
              {activeTab === 'accounts' && transaction.accountDetails && (
                <button
                  onClick={() => handleViewAccountDetails(transaction)}
                  className="flex-1 px-3 py-2 text-xs font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors"
                >
                  Lihat Akun
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

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
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
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

      {/* TriPay Transaction Detail Modal */}
      <TripayTransactionDetailModal
        transaction={selectedTransaction}
        isOpen={isTripayDetailModalOpen}
        onClose={() => {
          setIsTripayDetailModalOpen(false);
          setSelectedTransaction(null);
        }}
        onRefreshStatus={() => {
          // Reload transactions after status refresh
          window.location.reload();
        }}
      />
    </div>
  );
};

export default TransactionHistory;
