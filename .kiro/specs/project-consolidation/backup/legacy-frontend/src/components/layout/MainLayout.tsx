import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Sidebar from './Sidebar';
import Header from './Header';
import Dashboard from '../../pages/Dashboard';
import AkunBM from '../../pages/AkunBM';
import AkunPersonal from '../../pages/AkunPersonal';
import JasaVerifiedBM from '../../pages/JasaVerifiedBM';
import API from '../../pages/API';
import TransactionHistory from '../../pages/TransactionHistory';
import TopUp from '../../pages/TopUp';
import ClaimGaransi from '../../pages/ClaimGaransi';
import Tutorial from '../../pages/Tutorial';
import UserManagement from '../../pages/admin/UserManagement';
import TransactionManagement from '../../pages/admin/TransactionManagement';
import ClaimManagement from '../../pages/admin/ClaimManagement';
import TutorialManagement from '../../pages/admin/TutorialManagement';
import ProductManagement from '../../pages/admin/ProductManagement';
import AdminDashboard from '../../pages/admin/AdminDashboard';
import SystemSettings from '../../pages/admin/SystemSettings';
import AuditLog from '../../pages/admin/AuditLog';

type PageId = 
  | 'dashboard'
  | 'akun-bm'
  | 'akun-personal'
  | 'jasa-verified-bm'
  | 'api'
  | 'riwayat-transaksi'
  | 'top-up'
  | 'claim-garansi'
  | 'tutorial'
  | 'admin-dashboard'
  | 'admin-users'
  | 'admin-transactions'
  | 'admin-claims'
  | 'admin-tutorials'
  | 'admin-products'
  | 'admin-settings'
  | 'admin-audit-logs';

const MainLayout: React.FC = () => {
  const { user, isGuest } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');

  // Map URL paths to page IDs
  const pathToPageId: Record<string, PageId> = {
    '/dashboard': 'dashboard',
    '/akun-bm': 'akun-bm',
    '/akun-personal': 'akun-personal',
    '/jasa-verified-bm': 'jasa-verified-bm',
    '/api': 'api',
    '/riwayat-transaksi': 'riwayat-transaksi',
    '/top-up': 'top-up',
    '/claim-garansi': 'claim-garansi',
    '/tutorial': 'tutorial',
    '/admin/dashboard': 'admin-dashboard',
    '/admin/users': 'admin-users',
    '/admin/transactions': 'admin-transactions',
    '/admin/claims': 'admin-claims',
    '/admin/tutorials': 'admin-tutorials',
    '/admin/products': 'admin-products',
    '/admin/settings': 'admin-settings',
    '/admin/audit-logs': 'admin-audit-logs',
  };

  // Sync current page with URL
  useEffect(() => {
    const pageId = pathToPageId[location.pathname];
    if (pageId) {
      setCurrentPage(pageId);
    } else if (location.pathname === '/' || location.pathname === '') {
      navigate('/dashboard', { replace: true });
    }
  }, [location.pathname, navigate]);

  // Handle page change from sidebar
  const handlePageChange = (pageId: PageId) => {
    setCurrentPage(pageId);
  };

  // Render the appropriate page component
  const renderPage = () => {
    const userRole = isGuest ? 'guest' : (user?.role || 'guest');

    // Check permissions for member-only pages
    const memberPages: PageId[] = ['riwayat-transaksi', 'top-up', 'claim-garansi', 'tutorial'];
    if (memberPages.includes(currentPage)) {
      if (userRole === 'guest') {
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center bg-white p-8 rounded-lg shadow-md">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Login Required</h3>
              <p className="text-gray-600 mb-4">Anda harus login sebagai member untuk mengakses halaman ini.</p>
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Login Sekarang
              </button>
            </div>
          </div>
        );
      }
    }

    // Check permissions for admin pages
    const adminPages: PageId[] = [
      'admin-dashboard',
      'admin-users',
      'admin-transactions',
      'admin-claims',
      'admin-tutorials',
      'admin-products',
      'admin-settings',
      'admin-audit-logs',
    ];
    if (adminPages.includes(currentPage)) {
      if (userRole !== 'admin') {
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center bg-white p-8 rounded-lg shadow-md">
              <svg className="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
              <p className="text-gray-600 mb-4">Anda tidak memiliki akses ke halaman admin.</p>
              <button
                onClick={() => setCurrentPage('dashboard')}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Kembali ke Dashboard
              </button>
            </div>
          </div>
        );
      }
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'akun-bm':
        return <AkunBM />;
      case 'akun-personal':
        return <AkunPersonal />;
      case 'jasa-verified-bm':
        return <JasaVerifiedBM />;
      case 'api':
        return <API />;
      case 'riwayat-transaksi':
        return <TransactionHistory />;
      case 'top-up':
        return <TopUp />;
      case 'claim-garansi':
        return <ClaimGaransi />;
      case 'tutorial':
        return <Tutorial />;
      case 'admin-dashboard':
        return <AdminDashboard />;
      case 'admin-users':
        return <UserManagement />;
      case 'admin-transactions':
        return <TransactionManagement />;
      case 'admin-claims':
        return <ClaimManagement />;
      case 'admin-tutorials':
        return <TutorialManagement />;
      case 'admin-products':
        return <ProductManagement />;
      case 'admin-settings':
        return <SystemSettings />;
      case 'admin-audit-logs':
        return <AuditLog />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar currentPage={currentPage} onPageChange={handlePageChange} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
