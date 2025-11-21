import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserIcon, Bars3Icon, ArrowRightOnRectangleIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface HeaderProps {
  user: {
    username: string;
    role: 'member' | 'admin';
    avatar?: string;
  };
  onProfileClick: () => void;
  onLogout: () => void;
  onMenuClick?: () => void;
  sidebarOpen?: boolean;
  isGuest?: boolean;
}

const Header: React.FC<HeaderProps> = ({ user, onProfileClick, onLogout, onMenuClick, sidebarOpen = false, isGuest = false }) => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isDropdownOpen]);

  const handleLogoutClick = () => {
    setIsDropdownOpen(false);
    onLogout();
  };
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        <div className="flex items-center space-x-2">
          {/* Hamburger menu for mobile */}
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              aria-label="Toggle navigation menu"
              aria-expanded={sidebarOpen}
              aria-controls="sidebar-navigation"
              type="button"
            >
              <Bars3Icon className="w-6 h-6 text-gray-700" />
            </button>
          )}
          
          {/* Logo */}
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">CG</span>
          </div>
          <span className="text-lg md:text-xl font-bold text-gray-900">Canvango Group</span>
        </div>
        
        {/* User Profile or Login/Register buttons */}
        {isGuest ? (
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Register
            </button>
          </div>
        ) : (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              aria-label={`User profile menu: ${user?.username || 'User'}`}
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
              type="button"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="w-8 h-8 rounded-full" aria-hidden="true" />
              ) : (
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center" aria-hidden="true">
                  <UserIcon className="w-5 h-5 text-indigo-600" />
                </div>
              )}
              <div className="text-left hidden sm:block">
                <div className="text-sm font-medium text-gray-900">{user?.username || 'User'}</div>
                <div className="text-xs text-gray-500 capitalize">{user?.role || 'member'}</div>
              </div>
              <ChevronDownIcon 
                className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>

            {/* Dropdown menu */}
            {isDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                role="menu"
                aria-orientation="vertical"
              >
                {/* Profile info in dropdown (mobile) */}
                <div className="px-4 py-3 border-b border-gray-100 sm:hidden">
                  <div className="text-sm font-medium text-gray-900">{user?.username || 'User'}</div>
                  <div className="text-xs text-gray-500 capitalize">{user?.role || 'member'}</div>
                </div>

                {/* Profile menu item */}
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onProfileClick();
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-50"
                  role="menuitem"
                  type="button"
                >
                  <UserIcon className="w-4 h-4 text-gray-500" aria-hidden="true" />
                  <span>Profile Saya</span>
                </button>

                {/* Logout menu item */}
                <button
                  onClick={handleLogoutClick}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors focus:outline-none focus:bg-red-50"
                  role="menuitem"
                  type="button"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" aria-hidden="true" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
