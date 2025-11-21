import React, { useState, useMemo } from 'react';
import {
  ShoppingBagIcon,
  WalletIcon,
  ChartBarIcon,
  EyeIcon,
  FunnelIcon,
  XMarkIcon,
  DocumentDuplicateIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

interface Transaction {
  id: string;
  date: string;
  type: 'purchase' | 'topup';
  product?: string;
  quantity?: number;
  amount: number;
  status: 'success' | 'pending' | 'failed';
  paymentMethod?: string;
  warranty?: {
    expiresAt: string;
    claimed: boolean;
  };
  accounts?: Array<{
    url: string;
    username: string;
    password: string;
  }>;
}

interface SummaryCardProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  value: string | number;
  label: string;
  bgColor: string;
}

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
  count: number;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// ============================================================================
// COMPONENTS
// ============================================================================

const SummaryCard: React.FC<SummaryCardProps> = ({ icon: Icon, value, label, bgColor }) => {
  return (
    <div className={`${bgColor} rounded-lg p-6 shadow-sm`}>
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-full bg-white bg-opacity-50 flex items-center justify-center">
          <Icon className="w-6 h-6 text-indigo-600" />
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
};

const TabNavigation: React.FC<{
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === tab.id
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            {tab.icon}
            <span>{tab.label}</span>
            <span className={`
              px-2 py-0.5 rounded-full text-xs font-medium
              ${activeTab === tab.id ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'}
            `}>
              {tab.count}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
};

const TransactionFilters: React.FC<{
  warrantyFilter: string;
  dateRange: { start: string; end: string };
  onWarrantyFilterChange: (value: string) => void;
  onDateRangeChange: (range: { start: string; end: string }) => void;
}> = ({ warrantyFilter, dateRange, onWarrantyFilterChange, onDateRangeChange }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <FunnelIcon className="w-5 h-5 text-gray-500" />
        <h3 className="text-sm font-semibold text-gray-900">Filter</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status Garansi
          </label>
          <select
            value={warrantyFilter}
            onChange={(e) => onWarrantyFilterChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">Semua</option>
            <option value="active">Garansi Aktif</option>
            <option value="expired">Garansi Kadaluarsa</option>
            <option value="claimed">Sudah Diklaim</option>
            <option value="no-warranty">Tanpa Garansi</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rentang Tanggal
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <span className="flex items-center text-gray-500">-</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const TransactionTable: React.FC<{
  transactions: Transaction[];
  onViewDetails: (transaction: Transaction) => void;
  isLoading?: boolean;
}> = ({ transactions, onViewDetails, isLoading }) => {
  const statusStyles = {
    success: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800'
  };

  const statusLabels = {
    success: 'Berhasil',
    pending: 'Pending',
    failed: 'Gagal'
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <ShoppingBagIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak Ada Transaksi</h3>
        <p className="text-gray-600">Transaksi Anda akan muncul di sini</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Garansi</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{tx.id}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{formatDate(tx.date)}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{tx.product || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{tx.quantity ? `${tx.quantity} Akun` : '-'}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(tx.amount)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[tx.status]}`}>
                    {statusLabels[tx.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  {tx.warranty ? (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      tx.warranty.claimed 
                        ? 'bg-gray-100 text-gray-800'
                        : new Date(tx.warranty.expiresAt) > new Date()
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {tx.warranty.claimed 
                        ? 'Diklaim'
                        : new Date(tx.warranty.expiresAt) > new Date()
                        ? 'Aktif'
                        : 'Kadaluarsa'
                      }
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onViewDetails(tx)}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    <EyeIcon className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const TransactionDetailModal: React.FC<{
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}> = ({ transaction, isOpen, onClose }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen || !transaction) return null;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Detail Transaksi</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">ID Transaksi</p>
                  <p className="text-sm font-medium text-gray-900">{transaction.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tanggal</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(transaction.date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Produk</p>
                  <p className="text-sm font-medium text-gray-900">{transaction.product || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Jumlah</p>
                  <p className="text-sm font-medium text-gray-900">{transaction.quantity ? `${transaction.quantity} Akun` : '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-sm font-medium text-gray-900">{formatCurrency(transaction.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Metode Pembayaran</p>
                  <p className="text-sm font-medium text-gray-900">{transaction.paymentMethod || '-'}</p>
                </div>
              </div>

              {transaction.accounts && transaction.accounts.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Detail Akun</h4>
                  <div className="space-y-3">
                    {transaction.accounts.map((account, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-500">URL</span>
                          <button
                            onClick={() => copyToClipboard(account.url, `url-${index}`)}
                            className="text-indigo-600 hover:text-indigo-800"
                          >
                            {copiedField === `url-${index}` ? (
                              <CheckCircleIcon className="w-4 h-4" />
                            ) : (
                              <DocumentDuplicateIcon className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <p className="text-sm font-mono text-gray-900 break-all">{account.url}</p>

                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs font-medium text-gray-500">Username</span>
                          <button
                            onClick={() => copyToClipboard(account.username, `username-${index}`)}
                            className="text-indigo-600 hover:text-indigo-800"
                          >
                            {copiedField === `username-${index}` ? (
                              <CheckCircleIcon className="w-4 h-4" />
                            ) : (
                              <DocumentDuplicateIcon className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <p className="text-sm font-mono text-gray-900">{account.username}</p>

                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs font-medium text-gray-500">Password</span>
                          <button
                            onClick={() => copyToClipboard(account.password, `password-${index}`)}
                            className="text-indigo-600 hover:text-indigo-800"
                          >
                            {copiedField === `password-${index}` ? (
                              <CheckCircleIcon className="w-4 h-4" />
                            ) : (
                              <DocumentDuplicateIcon className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <p className="text-sm font-mono text-gray-900">{account.password}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}> = ({ currentPage, totalPages, pageSize, totalItems, onPageChange, onPageSizeChange }) => {
  return (
    <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between sm:px-6">
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
            currentPage === 1
              ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
              : 'text-gray-700 bg-white hover:bg-gray-50'
          }`}
        >
          Sebelumnya
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
            currentPage === totalPages
              ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
              : 'text-gray-700 bg-white hover:bg-gray-50'
          }`}
        >
          Selanjutnya
        </button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-700">
            Menampilkan <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> sampai{' '}
            <span className="font-medium">{Math.min(currentPage * pageSize, totalItems)}</span> dari{' '}
            <span className="font-medium">{totalItems}</span> transaksi
          </p>
          {onPageSizeChange && (
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value={10}>10 per halaman</option>
              <option value={25}>25 per halaman</option>
              <option value={50}>50 per halaman</option>
            </select>
          )}
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                currentPage === 1
                  ? 'text-gray-300 bg-gray-100 cursor-not-allowed'
                  : 'text-gray-500 bg-white hover:bg-gray-50'
              }`}
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      page === currentPage
                        ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return (
                  <span
                    key={page}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                  >
                    ...
                  </span>
                );
              }
              return null;
            })}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                currentPage === totalPages
                  ? 'text-gray-300 bg-gray-100 cursor-not-allowed'
                  : 'text-gray-500 bg-white hover:bg-gray-50'
              }`}
            >
              ›
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MOCK DATA
// ============================================================================

const generateMockTransactions = (): Transaction[] => {
  const transactions: Transaction[] = [];
  const products = [
    'BM Verified Premium',
    'BM Limit 250$',
    'Akun Personal Lama',
    'Akun Personal Baru',
    'BM WhatsApp API'
  ];

  for (let i = 1; i <= 30; i++) {
    const isPurchase = i % 4 !== 0;
    const product = products[Math.floor(Math.random() * products.length)];
    const status = ['success', 'pending', 'failed'][Math.floor(Math.random() * 3)] as 'success' | 'pending' | 'failed';
    const hasWarranty = isPurchase && status === 'success';
    
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 60));

    const warrantyExpiresAt = new Date(date);
    warrantyExpiresAt.setDate(warrantyExpiresAt.getDate() + 30);

    transactions.push({
      id: `TRX${String(i).padStart(6, '0')}`,
      date: date.toISOString(),
      type: isPurchase ? 'purchase' : 'topup',
      product: isPurchase ? product : undefined,
      quantity: isPurchase ? Math.floor(Math.random() * 3) + 1 : undefined,
      amount: isPurchase ? Math.floor(Math.random() * 400000) + 100000 : Math.floor(Math.random() * 900000) + 100000,
      status,
      paymentMethod: ['QRIS', 'BCA Virtual Account', 'BRI Virtual Account', 'Mandiri'][Math.floor(Math.random() * 4)],
      warranty: hasWarranty ? {
        expiresAt: warrantyExpiresAt.toISOString(),
        claimed: Math.random() > 0.7
      } : undefined,
      accounts: isPurchase && status === 'success' ? [
        {
          url: `https://business.facebook.com/${Math.random().toString(36).substring(7)}`,
          username: `user_${Math.random().toString(36).substring(7)}`,
          password: Math.random().toString(36).substring(2, 15)
        }
      ] : undefined
    });
  }

  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const TransactionHistory: React.FC = () => {
  const [activeTab, setActiveTab] = useState('accounts');
  const [warrantyFilter, setWarrantyFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLoading] = useState(false);

  const allTransactions = useMemo(() => generateMockTransactions(), []);

  // Filter by tab
  const filteredByTab = useMemo(() => {
    return allTransactions.filter(tx => {
      if (activeTab === 'accounts') return tx.type === 'purchase';
      return tx.type === 'topup';
    });
  }, [allTransactions, activeTab]);

  // Apply filters
  const filteredTransactions = useMemo(() => {
    return filteredByTab.filter(tx => {
      // Warranty filter (only for purchases)
      if (warrantyFilter !== 'all' && tx.type === 'purchase') {
        if (warrantyFilter === 'no-warranty' && tx.warranty) return false;
        if (warrantyFilter === 'active' && (!tx.warranty || tx.warranty.claimed || new Date(tx.warranty.expiresAt) < new Date())) return false;
        if (warrantyFilter === 'expired' && (!tx.warranty || new Date(tx.warranty.expiresAt) >= new Date())) return false;
        if (warrantyFilter === 'claimed' && (!tx.warranty || !tx.warranty.claimed)) return false;
      }

      // Date range filter
      if (dateRange.start) {
        const startDate = new Date(dateRange.start);
        if (new Date(tx.date) < startDate) return false;
      }
      if (dateRange.end) {
        const endDate = new Date(dateRange.end);
        endDate.setHours(23, 59, 59, 999);
        if (new Date(tx.date) > endDate) return false;
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

  // Calculate stats
  const stats = useMemo(() => {
    const purchases = allTransactions.filter(t => t.type === 'purchase' && t.status === 'success');
    const topups = allTransactions.filter(t => t.type === 'topup' && t.status === 'success');
    
    return {
      totalPurchases: purchases.reduce((sum, t) => sum + (t.quantity || 0), 0),
      totalSpending: purchases.reduce((sum, t) => sum + t.amount, 0),
      totalTopups: topups.reduce((sum, t) => sum + t.amount, 0)
    };
  }, [allTransactions]);

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailModalOpen(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setCurrentPage(1);
    setWarrantyFilter('all');
  };

  const tabs: Tab[] = [
    {
      id: 'accounts',
      label: 'Transaksi Akun',
      icon: <ShoppingBagIcon className="w-4 h-4" />,
      count: allTransactions.filter(t => t.type === 'purchase').length
    },
    {
      id: 'topup',
      label: 'Top Up',
      icon: <WalletIcon className="w-4 h-4" />,
      count: allTransactions.filter(t => t.type === 'topup').length
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Riwayat Transaksi</h1>
        <p className="text-gray-600 mt-1">Lihat semua transaksi pembelian dan top up Anda</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
        <SummaryCard
          icon={ShoppingBagIcon}
          value={stats.totalPurchases}
          label="Total Akun Dibeli"
          bgColor="bg-blue-50"
        />
        <SummaryCard
          icon={ChartBarIcon}
          value={formatCurrency(stats.totalSpending)}
          label="Total Pengeluaran"
          bgColor="bg-green-50"
        />
        <SummaryCard
          icon={WalletIcon}
          value={formatCurrency(stats.totalTopups)}
          label="Total Top Up"
          bgColor="bg-indigo-50"
        />
      </div>

      {/* Tab Navigation */}
      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Filters */}
      {activeTab === 'accounts' && (
        <TransactionFilters
          warrantyFilter={warrantyFilter}
          dateRange={dateRange}
          onWarrantyFilterChange={setWarrantyFilter}
          onDateRangeChange={setDateRange}
        />
      )}

      {/* Date filter for top-up */}
      {activeTab === 'topup' && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rentang Tanggal
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <span className="flex items-center text-gray-500">-</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      )}

      {/* Transaction Table */}
      <TransactionTable
        transactions={paginatedTransactions}
        onViewDetails={handleViewDetails}
        isLoading={isLoading}
      />

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
    </div>
  );
};

export default TransactionHistory;
