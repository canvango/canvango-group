import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { 
  WelcomeBanner,
  RunningText,
  AlertBox, 
  RecentTransactions,
  CustomerSupportSection,
  UpdatesSection
} from '../components/dashboard';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAuth } from '../contexts/AuthContext';
import { getRecentTransactions } from '../services/transaction.service';
import type { Transaction } from '../types/transaction';

const Dashboard: React.FC = () => {
  usePageTitle('Dashboard');
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [mockUpdates] = useState([
    {
      id: '1',
      title: 'Peningkatan Sistem Keamanan',
      description: 'Kami telah meningkatkan sistem keamanan untuk melindungi data Anda dengan lebih baik.',
      date: '15 Nov 2025',
      type: 'feature' as const
    },
    {
      id: '2',
      title: 'Pemeliharaan Terjadwal',
      description: 'Sistem akan menjalani pemeliharaan rutin pada 20 Nov 2025 pukul 02:00 - 04:00 WIB.',
      date: '14 Nov 2025',
      type: 'maintenance' as const
    }
  ]);

  // Fetch recent transactions (public - all users)
  // OPTIMIZED: Defer loading to improve initial page render
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getRecentTransactions();
        setTransactions(data);
      } catch (err) {
        console.error('Failed to fetch transactions:', err);
        setError('Gagal memuat transaksi terbaru');
        setTransactions([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Defer transaction fetch by 100ms to prioritize initial render
    const timer = setTimeout(fetchTransactions, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleRefreshUpdates = () => {
    console.log('Refreshing updates...');
    // In real implementation, this would fetch latest updates from API
  };

  return (
    <div>
      <WelcomeBanner
        username={user?.username || user?.fullName || 'Member'}
        message="Dapatkan akun iklan premium terlengkap dan terpercaya"
      />

      <RunningText text="🌟 Selamat Datang canvango, Kami Punya Banyak akun iklan facebook ads dengan garansi resmi! | 🚀 Dapatkan akun iklan dengan kualitas terbaik di indonesia | 💼 Akun Business Manager dengan kualitas terbaik" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 lg:gap-6 mb-6">
        <AlertBox
          type="warning"
          icon={AlertTriangle}
          title="PERHATIAN!!!"
          content={
            <div className="space-y-2 md:space-y-2.5">
              <div>
                <p className="font-semibold text-amber-900 mb-1.5 text-sm md:text-base leading-tight">⚠️ PERINGATAN RESMI: RISIKO PENYALAHGUNAAN AKUN ⚠️</p>
                <p className="mb-1.5 text-sm leading-snug">Kami <span className="font-bold">TIDAK BERTANGGUNG JAWAB</span> atas:</p>
                <ul className="list-disc list-inside space-y-0.5 ml-2 text-sm leading-snug">
                  <li>Pelanggaran UU ITE (Pencemaran Nama Baik/Konten Ilegal)</li>
                  <li>Penipuan Digital/Scam</li>
                  <li>Penyebaran Hoaks/SARA</li>
                  <li>Aktivitas Ilegal lainnya</li>
                </ul>
              </div>
              <p className="font-semibold text-sm leading-snug">Segala konsekuensi hukum (pidana/perdata) menjadi tanggung jawab PEMBELI.</p>
              <div>
                <p className="font-semibold mb-1 text-sm leading-snug">Jika menyetujui:</p>
                <ul className="list-disc list-inside space-y-0.5 ml-2 text-sm leading-snug">
                  <li>Semua risiko hukum di Indonesia</li>
                  <li>Pelepasan tanggung jawab kami jika pembeli terkena jerat hukum karna penyalahgunaan akun</li>
                </ul>
              </div>
              <p className="font-semibold text-sm leading-snug">Silakan lanjutkan transaksi.</p>
            </div>
          }
        />
        <CustomerSupportSection />
      </div>

      <div className="mb-6">
        <UpdatesSection 
          updates={mockUpdates}
          onRefresh={handleRefreshUpdates}
          isLoading={false}
        />
      </div>

      {/* Show recent transactions from all users */}
      <RecentTransactions
        transactions={transactions}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
};

export default Dashboard;
