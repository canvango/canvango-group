import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  HomeIcon,
  ClockIcon,
  WalletIcon,
  UserIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  CodeBracketIcon,
  BookOpenIcon,
  Square3Stack3DIcon,
  ChartBarIcon,
  UsersIcon,
  CreditCardIcon,
  CubeIcon,
  CogIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

interface SidebarProps {
  user: {
    username: string;
    balance: number;
    role?: 'guest' | 'member' | 'admin';
    stats?: {
      transactions: number;
    };
  };
  isOpen?: boolean;
  onClose?: () => void;
  isGuest?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ user, isOpen = true, onClose, isGuest = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path: string) => {
    navigate(path);
    // Close sidebar on mobile after navigation
    if (onClose && window.innerWidth < 768) {
      onClose();
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const isAdmin = user?.role === 'admin';

  // Menu for authenticated users
  const authenticatedMenuStructure = [
    {
      section: 'MENU UTAMA',
      items: [
        { icon: HomeIcon, label: 'Dashboard', path: '/dashboard' },
        { icon: ClockIcon, label: 'Riwayat Transaksi', path: '/riwayat-transaksi' },
        { icon: WalletIcon, label: 'Top Up', path: '/top-up' }
      ]
    },
    {
      section: 'AKUN & LAYANAN',
      items: [
        { icon: Square3Stack3DIcon, label: 'Akun BM', path: '/akun-bm' },
        { icon: UserIcon, label: 'Akun Personal', path: '/akun-personal' },
        { icon: CheckCircleIcon, label: 'Jasa Verified BM', path: '/jasa-verified-bm' },
        { icon: ShieldCheckIcon, label: 'Claim Garansi', path: '/claim-garansi' }
      ]
    },
    {
      section: 'LAINNYA',
      items: [
        { icon: CodeBracketIcon, label: 'API', path: '/api' },
        { icon: BookOpenIcon, label: 'Tutorial', path: '/tutorial' }
      ]
    },
    ...(isAdmin ? [{
      section: 'ADMIN',
      items: [
        { icon: ChartBarIcon, label: 'Dashboard Admin', path: '/admin/dashboard' },
        { icon: UsersIcon, label: 'Kelola Pengguna', path: '/admin/users' },
        { icon: CreditCardIcon, label: 'Kelola Transaksi', path: '/admin/transactions' },
        { icon: ShieldCheckIcon, label: 'Kelola Klaim', path: '/admin/claims' },
        { icon: BookOpenIcon, label: 'Kelola Tutorial', path: '/admin/tutorials' },
        { icon: CubeIcon, label: 'Kelola Produk', path: '/admin/products' },
        { icon: CogIcon, label: 'Pengaturan Sistem', path: '/admin/settings' },
        { icon: ClipboardDocumentListIcon, label: 'Log Aktivitas', path: '/admin/audit-logs' }
      ]
    }] : [])
  ];

  // Menu for guest users (limited access)
  const guestMenuStructure = [
    {
      section: 'MENU UTAMA',
      items: [
        { icon: HomeIcon, label: 'Dashboard', path: '/dashboard' }
      ]
    },
    {
      section: 'AKUN & LAYANAN',
      items: [
        { icon: Square3Stack3DIcon, label: 'Akun BM', path: '/akun-bm' },
        { icon: UserIcon, label: 'Akun Personal', path: '/akun-personal' }
      ]
    },
    {
      section: 'LAINNYA',
      items: [
        { icon: CodeBracketIcon, label: 'API', path: '/api' },
        { icon: BookOpenIcon, label: 'Tutorial', path: '/tutorial' }
      ]
    }
  ];

  const menuStructure = isGuest ? guestMenuStructure : authenticatedMenuStructure;

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
          role="presentation"
        />
      )}
      
      {/* Sidebar */}
      <aside 
        id="sidebar-navigation"
        className={`fixed left-0 top-16 bottom-0 w-60 md:w-56 lg:w-60 bg-gray-50 border-r border-gray-200 overflow-y-auto transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        aria-label="Main navigation"
        aria-hidden={!isOpen}
      >
        <div className="p-4">
          {/* User Profile Card */}
          <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-bold text-lg">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <div className="font-medium text-gray-900">{user?.username || 'User'}</div>
                <div className="text-sm text-gray-500">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0
                  }).format(user?.balance || 0)}
                </div>
              </div>
            </div>
            {user?.stats && (
              <div className="text-xs text-green-600">+ {user.stats.transactions} transaksi</div>
            )}
          </div>

          {/* Menu Sections */}
          {menuStructure.map((section, idx) => (
            <div key={idx} className="mb-6">
              <div className="text-xs font-semibold text-gray-500 uppercase mb-2 px-2">
                {section.section}
              </div>
              <nav className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isItemActive = isActive(item.path);
                  
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavigate(item.path)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isItemActive
                          ? 'bg-indigo-50 text-indigo-600 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      aria-current={isItemActive ? 'page' : undefined}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
