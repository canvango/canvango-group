import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHouse, faClockRotateLeft, faWallet, faUser, faCircleCheck,
  faShield, faCode, faBook, faUsers, faChartLine, faCreditCard,
  faShieldHalved, faBox, faGear, faClipboardList, 
  faChevronDown, faChevronRight, faBullhorn, faBell
} from '@fortawesome/free-solid-svg-icons';
import { faMeta, faFacebook } from '@fortawesome/free-brands-svg-icons';
import { ROUTES } from '../../config/routes.config';

interface SidebarProps {
  user: {
    username: string;
    balance: number;
    role?: 'member' | 'admin' | 'superadmin' | 'guest';
    stats?: {
      transactions: number;
    };
  };
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, isOpen = true, onClose }) => {
  const location = useLocation();
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);

  const handleLinkClick = () => {
    // Close sidebar on mobile after navigation
    if (onClose && window.innerWidth < 768) {
      onClose();
    }
  };

  const isAdmin = user.role === 'admin' || user.role === 'superadmin';
  const isGuest = user.role === 'guest';
  
  // Helper to check if path is active
  const isPathActive = (path: string): boolean => {
    // Since routes are relative, we need to check against the full pathname
    const fullPath = `/${path}`;
    return location.pathname === fullPath || location.pathname.startsWith(fullPath + '/');
  };

  // Check if any admin route is active
  const isAdminSectionActive = isAdmin && location.pathname.startsWith('/admin');

  // Guest menu structure (limited access)
  const guestMenuStructure = [
    {
      section: 'MENU UTAMA',
      items: [
        { icon: faHouse, label: 'Dashboard', path: ROUTES.DASHBOARD }
      ]
    },
    {
      section: 'AKUN & LAYANAN',
      items: [
        { icon: faMeta, label: 'Akun BM', path: ROUTES.ACCOUNTS.BM },
        { icon: faFacebook, label: 'Akun Personal', path: ROUTES.ACCOUNTS.PERSONAL },
        { icon: faCircleCheck, label: 'Jasa Verified BM', path: ROUTES.SERVICES.VERIFIED_BM }
      ]
    },
    {
      section: 'LAINNYA',
      items: [
        { icon: faCode, label: 'API', path: ROUTES.API },
        { icon: faBook, label: 'Tutorial', path: ROUTES.TUTORIALS }
      ]
    }
  ];

  // Authenticated user menu structure (full access)
  const authenticatedMenuStructure = [
    {
      section: 'MENU UTAMA',
      items: [
        { icon: faHouse, label: 'Dashboard', path: ROUTES.DASHBOARD },
        { icon: faClockRotateLeft, label: 'Riwayat Transaksi', path: ROUTES.TRANSACTIONS },
        { icon: faWallet, label: 'Top Up', path: ROUTES.TOPUP }
      ]
    },
    {
      section: 'AKUN & LAYANAN',
      items: [
        { icon: faMeta, label: 'Akun BM', path: ROUTES.ACCOUNTS.BM },
        { icon: faFacebook, label: 'Akun Personal', path: ROUTES.ACCOUNTS.PERSONAL },
        { icon: faCircleCheck, label: 'Jasa Verified BM', path: ROUTES.SERVICES.VERIFIED_BM },
        { icon: faShield, label: 'Claim Garansi', path: ROUTES.WARRANTY }
      ]
    },
    {
      section: 'LAINNYA',
      items: [
        { icon: faCode, label: 'API', path: ROUTES.API },
        { icon: faBook, label: 'Tutorial', path: ROUTES.TUTORIALS }
      ]
    },
  ];

  // Admin menu items (separate for dropdown)
  const adminMenuItems = isAdmin ? [
    { icon: faChartLine, label: 'Dashboard Admin', path: ROUTES.ADMIN.DASHBOARD },
    { icon: faUsers, label: 'Kelola Pengguna', path: ROUTES.ADMIN.USERS },
    { icon: faCreditCard, label: 'Kelola Transaksi', path: ROUTES.ADMIN.TRANSACTIONS },
    { icon: faShieldHalved, label: 'Kelola Klaim', path: ROUTES.ADMIN.CLAIMS },
    { icon: faBook, label: 'Kelola Tutorial', path: ROUTES.ADMIN.TUTORIALS },
    { icon: faBox, label: 'Kelola Produk', path: ROUTES.ADMIN.PRODUCTS },
    { icon: faBullhorn, label: 'Kelola Announcement', path: ROUTES.ADMIN.ANNOUNCEMENTS },
    { icon: faBell, label: 'Welcome Popups', path: ROUTES.ADMIN.WELCOME_POPUPS },
    { icon: faCircleCheck, label: 'Kelola Verified BM', path: ROUTES.ADMIN.VERIFIED_BM },
    { icon: faGear, label: 'Pengaturan Sistem', path: ROUTES.ADMIN.SETTINGS },
    { icon: faClipboardList, label: 'Log Aktivitas', path: ROUTES.ADMIN.AUDIT_LOGS }
  ] : [];

  // Select menu structure based on user role
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
        className={`fixed left-0 top-16 bottom-0 bg-gray-50 border-r border-gray-200 overflow-y-auto transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        style={{ width: '240px' }}
        aria-label="Main navigation"
        aria-hidden={!isOpen}
      >
        <div className="p-3 md:p-4">
        {/* User Profile Card */}
        <div className="bg-white rounded-3xl p-3 mb-3 shadow-sm">
          <div className={`flex items-center space-x-2 ${isGuest ? '' : 'mb-2'}`}>
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-bold text-base">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900 text-sm">{user.username}</div>
              {/* Only show balance for authenticated users (not guest) */}
              {!isGuest && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-2 py-1 rounded-xl mt-1 border border-green-200">
                  <div className="flex items-center space-x-1.5">
                    <FontAwesomeIcon icon={faWallet} className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                    <div className="text-xs font-bold text-green-700">
                      Rp {user.balance.toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          {user.stats && !isGuest && (
            <div className="text-xs text-green-600 font-medium">+ {user.stats.transactions} transaksi</div>
          )}
        </div>

        {/* Menu Sections */}
        {menuStructure.map((section, idx) => (
          <div key={idx} className="mb-4">
            <div className="text-xs font-semibold text-gray-600 uppercase mb-1.5 px-2">
              {section.section}
            </div>
            <nav className="space-y-0.5">
              {section.items.map((item) => {
                const isItemActive = isPathActive(item.path);
                // Use absolute path by adding leading slash
                const absolutePath = `/${item.path}`;
                
                return (
                  <Link
                    key={item.path}
                    to={absolutePath}
                    onClick={handleLinkClick}
                    className={`w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-lg text-sm transition-colors ${
                      isItemActive
                        ? 'bg-primary-50 text-primary-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    aria-current={isItemActive ? 'page' : undefined}
                  >
                    <FontAwesomeIcon icon={item.icon} className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}

        {/* Admin Dropdown Section - Highlighted */}
        {isAdmin && (
          <div className="mb-4 mt-2 pt-3 border-t border-gray-300">
            <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-2.5 border border-primary-200 shadow-sm">
              <div className="flex items-center space-x-1.5 mb-2 px-1">
                <FontAwesomeIcon icon={faShield} className="w-3.5 h-3.5 text-primary-600" />
                <div className="text-xs font-bold text-primary-700 uppercase tracking-wide">
                  Admin Panel
                </div>
              </div>
              
              <div className="space-y-0.5">
                {/* Dropdown Toggle Button */}
                <button
                  onClick={() => setIsAdminDropdownOpen(!isAdminDropdownOpen)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isAdminSectionActive
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-white text-primary-700 hover:bg-primary-100 border border-primary-200'
                  }`}
                  aria-expanded={isAdminDropdownOpen}
                >
                  <div className="flex items-center space-x-2.5">
                    <FontAwesomeIcon icon={faGear} className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">Menu Admin</span>
                  </div>
                  {isAdminDropdownOpen ? (
                    <FontAwesomeIcon icon={faChevronDown} className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <FontAwesomeIcon icon={faChevronRight} className="w-4 h-4 flex-shrink-0" />
                  )}
                </button>

                {/* Dropdown Items */}
                {isAdminDropdownOpen && (
                  <nav className="space-y-0.5 mt-1 pt-1 border-t border-primary-200">
                    {adminMenuItems.map((item) => {
                      const isItemActive = isPathActive(item.path);
                      const absolutePath = `/${item.path}`;
                      
                      return (
                        <Link
                          key={item.path}
                          to={absolutePath}
                          onClick={handleLinkClick}
                          className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-md text-xs transition-all duration-200 ${
                            isItemActive
                              ? 'bg-primary-600 text-white font-medium shadow-sm'
                              : 'bg-white text-primary-700 hover:bg-primary-100 border border-transparent hover:border-primary-200'
                          }`}
                          aria-current={isItemActive ? 'page' : undefined}
                        >
                          <FontAwesomeIcon icon={item.icon} className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      );
                    })}
                  </nav>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      </aside>
    </>
  );
};

export default Sidebar;
