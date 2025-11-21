import React, { useState, useMemo } from 'react';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon,
  EyeIcon,
  ExclamationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

interface WarrantyClaim {
  id: string;
  transactionId: string;
  accountName: string;
  reason: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  warrantyExpires: string;
  createdAt: string;
  adminResponse?: string;
}

interface SummaryCardProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  value: string | number;
  label: string;
  bgColor: string;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
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

const ClaimSubmissionForm: React.FC<{
  onSubmit: (data: { transactionId: string; reason: string; description: string }) => void;
}> = ({ onSubmit }) => {
  const [transactionId, setTransactionId] = useState('');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (transactionId && reason && description) {
      onSubmit({ transactionId, reason, description });
      setTransactionId('');
      setReason('');
      setDescription('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ID Transaksi
        </label>
        <input
          type="text"
          value={transactionId}
          onChange={(e) => setTransactionId(e.target.value)}
          placeholder="Contoh: TRX000123"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Alasan Claim
        </label>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          required
        >
          <option value="">Pilih alasan</option>
          <option value="Akun tidak bisa diakses">Akun tidak bisa diakses</option>
          <option value="Akun sudah disabled">Akun sudah disabled</option>
          <option value="Tidak sesuai deskripsi">Tidak sesuai deskripsi</option>
          <option value="Lainnya">Lainnya</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Deskripsi Masalah
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Jelaskan masalah yang Anda alami..."
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
      >
        Ajukan Claim
      </button>
    </form>
  );
};

const ClaimsTable: React.FC<{
  claims: WarrantyClaim[];
  onViewResponse: (claim: WarrantyClaim) => void;
}> = ({ claims, onViewResponse }) => {
  const statusStyles = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  };

  const statusLabels = {
    pending: 'Pending',
    approved: 'Disetujui',
    rejected: 'Ditolak'
  };

  if (claims.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <ClockIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Claim</h3>
        <p className="text-gray-600">Riwayat claim garansi Anda akan muncul di sini</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID Transaksi</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Akun</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alasan</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Garansi Hingga</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {claims.map((claim) => (
              <tr key={claim.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{claim.transactionId}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{formatDate(claim.createdAt)}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{claim.accountName}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{claim.reason}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[claim.status]}`}>
                    {statusLabels[claim.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{formatDate(claim.warrantyExpires)}</td>
                <td className="px-4 py-3">
                  {claim.adminResponse && (
                    <button
                      onClick={() => onViewResponse(claim)}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ResponseModal: React.FC<{
  claim: WarrantyClaim | null;
  isOpen: boolean;
  onClose: () => void;
}> = ({ claim, isOpen, onClose }) => {
  if (!isOpen || !claim) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Respon Admin</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">ID Transaksi</p>
                <p className="text-sm font-medium text-gray-900">{claim.transactionId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                  claim.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {claim.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Respon</p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-900">{claim.adminResponse}</p>
                </div>
              </div>
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

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_CLAIMS: WarrantyClaim[] = [
  {
    id: 'CLM001',
    transactionId: 'TRX000123',
    accountName: 'BM Verified Premium',
    reason: 'Akun sudah disabled',
    description: 'Akun tidak bisa diakses setelah 2 hari pembelian',
    status: 'approved',
    warrantyExpires: '2025-12-15',
    createdAt: '2025-11-10',
    adminResponse: 'Claim Anda telah disetujui. Saldo akan dikembalikan ke akun Anda dalam 1x24 jam.'
  },
  {
    id: 'CLM002',
    transactionId: 'TRX000098',
    accountName: 'Akun Personal Lama',
    reason: 'Tidak sesuai deskripsi',
    description: 'Akun yang diterima berbeda dengan deskripsi',
    status: 'pending',
    warrantyExpires: '2025-12-10',
    createdAt: '2025-11-08'
  },
  {
    id: 'CLM003',
    transactionId: 'TRX000075',
    accountName: 'BM Limit 250$',
    reason: 'Akun tidak bisa diakses',
    description: 'Password tidak berfungsi',
    status: 'rejected',
    warrantyExpires: '2025-12-05',
    createdAt: '2025-11-05',
    adminResponse: 'Setelah kami cek, akun masih berfungsi dengan baik. Pastikan Anda menggunakan kredensial yang benar.'
  }
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ClaimGaransi: React.FC = () => {
  const [claims] = useState<WarrantyClaim[]>(MOCK_CLAIMS);
  const [selectedClaim, setSelectedClaim] = useState<WarrantyClaim | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      pending: claims.filter(c => c.status === 'pending').length,
      approved: claims.filter(c => c.status === 'approved').length,
      rejected: claims.filter(c => c.status === 'rejected').length,
      successRate: claims.length > 0 
        ? Math.round((claims.filter(c => c.status === 'approved').length / claims.length) * 100)
        : 0
    };
  }, [claims]);

  const handleSubmitClaim = (_data: { transactionId: string; reason: string; description: string }) => {
    setNotification({
      type: 'success',
      message: 'Claim garansi berhasil diajukan! Tim kami akan meninjau claim Anda dalam 1-3 hari kerja.'
    });
    
    // Auto-hide after 5 seconds
    setTimeout(() => setNotification(null), 5000);
  };

  const handleViewResponse = (claim: WarrantyClaim) => {
    setSelectedClaim(claim);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Claim Garansi</h1>
        <p className="text-gray-600 mt-1">Ajukan claim garansi untuk transaksi yang bermasalah</p>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={`
            rounded-lg p-4 flex items-start gap-3
            ${notification.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}
          `}
        >
          {notification.type === 'success' ? (
            <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <ExclamationCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className={`text-sm font-medium ${notification.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
              {notification.message}
            </p>
          </div>
          <button
            onClick={() => setNotification(null)}
            className={`text-sm font-medium ${notification.type === 'success' ? 'text-green-600 hover:text-green-700' : 'text-red-600 hover:text-red-700'}`}
          >
            Tutup
          </button>
        </div>
      )}

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 lg:gap-6">
        <SummaryCard
          icon={ClockIcon}
          value={stats.pending}
          label="Claim Pending"
          bgColor="bg-yellow-50"
        />
        <SummaryCard
          icon={CheckCircleIcon}
          value={stats.approved}
          label="Claim Disetujui"
          bgColor="bg-green-50"
        />
        <SummaryCard
          icon={XCircleIcon}
          value={stats.rejected}
          label="Claim Ditolak"
          bgColor="bg-red-50"
        />
        <SummaryCard
          icon={ChartBarIcon}
          value={`${stats.successRate}%`}
          label="Tingkat Keberhasilan"
          bgColor="bg-blue-50"
        />
      </div>

      {/* Claim Submission Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ajukan Claim Baru</h2>
        <ClaimSubmissionForm onSubmit={handleSubmitClaim} />
      </div>

      {/* Claims History */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Riwayat Claim</h2>
        <ClaimsTable claims={claims} onViewResponse={handleViewResponse} />
      </div>

      {/* Information Section */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Tentang Claim Garansi</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Kapan Saya Bisa Mengajukan Claim?</h4>
            <p className="text-gray-600">
              Anda dapat mengajukan claim garansi untuk transaksi yang sudah berhasil namun mengalami masalah 
              seperti produk tidak sesuai deskripsi, produk tidak berfungsi, atau masalah lainnya.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Berapa Lama Proses Review?</h4>
            <p className="text-gray-600">
              Tim kami akan meninjau claim Anda dalam waktu 1-3 hari kerja. Anda akan menerima 
              notifikasi setelah claim Anda diproses.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Apa yang Terjadi Setelah Claim Disetujui?</h4>
            <p className="text-gray-600">
              Jika claim Anda disetujui, saldo akan dikembalikan ke akun Anda secara otomatis dalam 1x24 jam.
            </p>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Butuh Bantuan?</h3>
        <p className="text-gray-600 mb-4">
          Jika Anda memiliki pertanyaan tentang proses claim garansi, silakan hubungi customer support kami:
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center text-gray-700">
            <svg className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>Email: support@canvangogroup.com</span>
          </div>
          <div className="flex items-center text-gray-700">
            <svg className="h-5 w-5 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span>WhatsApp: +62 812-3456-7890</span>
          </div>
        </div>
      </div>

      {/* Response Modal */}
      <ResponseModal
        claim={selectedClaim}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedClaim(null);
        }}
      />
    </div>
  );
};

export default ClaimGaransi;
