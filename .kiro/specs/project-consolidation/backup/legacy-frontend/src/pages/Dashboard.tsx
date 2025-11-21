import React, { useState, useEffect } from 'react';
import { 
  CubeIcon, 
  ChartBarIcon, 
  ShoppingBagIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  ArrowPathIcon,
  CalendarIcon,
  EnvelopeIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';

// ============================================================================
// INTERFACES
// ============================================================================

interface Transaction {
  id: string;
  date: string;
  product: string;
  quantity: number;
  total: number;
  status: 'success' | 'pending' | 'failed';
}

interface Update {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'feature' | 'maintenance' | 'announcement';
}

interface SummaryCardProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  value: string | number;
  label: string;
  subInfo?: {
    text: string;
    color: 'green' | 'blue' | 'orange' | 'red';
  };
  bgColor: string;
}

// ============================================================================
// COMPONENTS
// ============================================================================

const SummaryCard: React.FC<SummaryCardProps> = ({ icon: Icon, value, label, subInfo, bgColor }) => {
  const colorClasses = {
    green: 'text-green-600',
    blue: 'text-blue-600',
    orange: 'text-orange-600',
    red: 'text-red-600'
  };

  return (
    <div className={`${bgColor} rounded-lg p-4 md:p-6 border border-gray-200`}>
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <div className="w-10 h-10 md:w-12 md:h-12 bg-white/50 rounded-full flex items-center justify-center">
          <Icon className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
        </div>
      </div>
      <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-xs md:text-sm text-gray-600 mb-2">{label}</div>
      {subInfo && (
        <div className={`text-xs md:text-sm font-medium ${colorClasses[subInfo.color]}`}>
          {subInfo.text}
        </div>
      )}
    </div>
  );
};

const WelcomeBanner: React.FC<{ username: string; message: string }> = ({ username, message }) => {
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg p-6 md:p-8 text-white mb-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>
        <h1 className="text-xl md:text-2xl font-bold">Selamat Datang, {username}!</h1>
      </div>
      <p className="text-indigo-100 text-sm md:text-base">{message}</p>
    </div>
  );
};

const AlertBox: React.FC<{ type: 'warning' | 'info'; title: string; content: React.ReactNode }> = ({ 
  type, 
  title, 
  content 
}) => {
  const styles = {
    warning: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      icon: 'text-orange-600',
      title: 'text-orange-900'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      title: 'text-blue-900'
    }
  };

  const style = styles[type];

  return (
    <div className={`${style.bg} border ${style.border} rounded-lg p-4`}>
      <div className="flex items-start gap-3">
        <ExclamationTriangleIcon className={`w-5 h-5 ${style.icon} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <h3 className={`text-sm font-semibold ${style.title} mb-2`}>{title}</h3>
          <div className="text-sm text-gray-700">{content}</div>
        </div>
      </div>
    </div>
  );
};

const CustomerSupportSection: React.FC = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Bantuan & Dukungan</h3>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <EnvelopeIcon className="w-4 h-4" />
          <span>Email: support@canvangogroup.com</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <ShieldCheckIcon className="w-4 h-4" />
          <a href="#" className="text-indigo-600 hover:text-indigo-800">Syarat & Ketentuan</a>
        </div>
      </div>
    </div>
  );
};

const UpdatesSection: React.FC<{ 
  updates: Update[]; 
  onRefresh?: () => void;
  isLoading?: boolean;
}> = ({ updates, onRefresh, isLoading }) => {
  const typeColors = {
    feature: 'bg-blue-100 text-blue-800',
    maintenance: 'bg-orange-100 text-orange-800',
    announcement: 'bg-green-100 text-green-800'
  };

  const typeLabels = {
    feature: 'Fitur Baru',
    maintenance: 'Pemeliharaan',
    announcement: 'Pengumuman'
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-base md:text-lg font-semibold text-gray-900">
          Update Terbaru
        </h3>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {updates.length === 0 ? (
        <div className="p-8 text-center">
          <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Belum ada update</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {updates.map((update) => (
            <div key={update.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h4 className="text-sm font-semibold text-gray-900 flex-1">
                  {update.title}
                </h4>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeColors[update.type]}`}>
                  {typeLabels[update.type]}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{update.description}</p>
              <div className="flex items-center text-xs text-gray-500">
                <CalendarIcon className="w-3 h-3 mr-1" />
                <span>{update.date}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const RecentTransactions: React.FC<{
  transactions: Transaction[];
  onViewDetails: (id: string) => void;
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
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Transaksi Terbaru</h3>
        </div>
        <div className="p-8 text-center">
          <EyeIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Belum ada transaksi</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Transaksi Terbaru</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">{tx.id}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{tx.date}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{tx.product}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{tx.quantity} Akun</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  Rp {tx.total.toLocaleString('id-ID')}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[tx.status]}`}>
                    {statusLabels[tx.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onViewDetails(tx.id)}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    <EyeIcon className="w-4 h-4" />
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

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  // Mock data
  const [mockTransactions] = useState<Transaction[]>([
    { 
      id: '#000575', 
      date: '12 Nov 2025 16:10', 
      product: 'BM TUA VERIFIED', 
      quantity: 1, 
      total: 200000, 
      status: 'success' 
    },
    { 
      id: '#000555', 
      date: '08 Nov 2025 13:32', 
      product: 'Jasa Verified BM', 
      quantity: 1, 
      total: 50000, 
      status: 'success' 
    },
  ]);

  const [mockUpdates] = useState<Update[]>([
    {
      id: '1',
      title: 'Peningkatan Sistem Keamanan',
      description: 'Kami telah meningkatkan sistem keamanan untuk melindungi data Anda dengan lebih baik.',
      date: '15 Nov 2025',
      type: 'feature'
    },
    {
      id: '2',
      title: 'Pemeliharaan Terjadwal',
      description: 'Sistem akan menjalani pemeliharaan rutin pada 20 Nov 2025 pukul 02:00 - 04:00 WIB.',
      date: '14 Nov 2025',
      type: 'maintenance'
    }
  ]);

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleRefreshUpdates = () => {
    console.log('Refreshing updates...');
  };

  const handleViewDetails = (id: string) => {
    console.log('View transaction:', id);
    alert(`Melihat detail transaksi ${id}`);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <WelcomeBanner
        username={user?.username || 'Member'}
        message="Operasikan akun premium terlengkap dan terpercaya di Indonesia"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
        {isLoading ? (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                <div className="space-y-3">
                  <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                  <div className="h-8 w-20 bg-gray-200 rounded"></div>
                  <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
            <SummaryCard
              icon={CubeIcon}
              value="58"
              label="Total Akun Dibeli"
              subInfo={{ text: "+ 38 transaksi", color: "green" }}
              bgColor="bg-blue-50"
            />
            <SummaryCard
              icon={ChartBarIcon}
              value="98%"
              label="Tingkat Keberhasilan"
              subInfo={{ text: "Hebat", color: "green" }}
              bgColor="bg-green-50"
            />
            <SummaryCard
              icon={ShoppingBagIcon}
              value="480"
              label="Total Terjual"
              subInfo={{ text: "+ 480 terjual", color: "green" }}
              bgColor="bg-orange-50"
            />
          </>
        )}
      </div>

      {/* Alert and Support Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AlertBox
          type="warning"
          title="PERHATIAN!"
          content={
            <ul className="list-disc list-inside space-y-1">
              <li>Dilarang menggunakan akun untuk hal ilegal</li>
              <li>Penipuan/Scam</li>
              <li>Penyalahgunaan data</li>
            </ul>
          }
        />
        <CustomerSupportSection />
      </div>

      {/* Updates Section */}
      <UpdatesSection 
        updates={mockUpdates}
        onRefresh={handleRefreshUpdates}
        isLoading={false}
      />

      {/* Recent Transactions */}
      <RecentTransactions
        transactions={mockTransactions}
        onViewDetails={handleViewDetails}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Dashboard;
