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

const Dashboard: React.FC = () => {
  usePageTitle('Dashboard');
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [mockTransactions] = useState([
    { id: '#000575', date: '12 Nov 2025 16:10', product: 'BM TUA VERIFIED', quantity: 1, total: 200000, status: 'success' as const },
    { id: '#000555', date: '08 Nov 2025 13:32', product: 'Jasa Verified BM', quantity: 1, total: 50000, status: 'success' as const },
  ]);

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

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
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

      <RecentTransactions
        transactions={mockTransactions}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Dashboard;
