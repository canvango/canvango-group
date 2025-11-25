import React, { useState, useRef, useEffect } from 'react';
import { User, Menu, LogOut, ChevronDown, LogIn, UserPlus } from 'lucide-react';

/**
 * Props for the Header component
 * 
 * @interface HeaderProps
 * @property {Object} user - User information to display
 * @property {string} user.username - Username to display
 * @property {'member' | 'admin'} user.role - User role
 * @property {string} [user.avatar] - Optional avatar image URL
 * @property {() => void} onProfileClick - Callback when profile button is clicked
 * @property {() => void} onLogout - Callback when logout button is clicked
 * @property {() => void} [onMenuClick] - Callback when mobile menu button is clicked
 * @property {boolean} [sidebarOpen=false] - Whether sidebar is currently open (for ARIA)
 */
interface HeaderProps {
  user: {
    username: string;
    role: 'guest' | 'member' | 'admin';
    avatar?: string;
  };
  onProfileClick: () => void;
  onLogout: () => void;
  onMenuClick?: () => void;
  sidebarOpen?: boolean;
}

/**
 * Header - Main navigation header for the member area
 * 
 * @description
 * Displays the Canvango Group branding, user profile information with dropdown menu,
 * and mobile menu toggle. Fixed at the top of the viewport with proper z-index management.
 * Responsive design shows hamburger menu on mobile devices and full branding on desktop.
 * Profile dropdown includes logout functionality.
 * 
 * @example
 * ```tsx
 * <Header
 *   user={{
 *     username: 'john_doe',
 *     role: 'member',
 *     avatar: '/avatars/john.jpg'
 *   }}
 *   onProfileClick={() => navigate('/profile')}
 *   onLogout={() => handleLogout()}
 *   onMenuClick={() => toggleSidebar()}
 *   sidebarOpen={isSidebarOpen}
 * />
 * ```
 * 
 * @component
 * @category Layout
 * 
 * @accessibility
 * - Hamburger menu button has aria-label and aria-expanded
 * - Profile dropdown has descriptive aria-label with username
 * - Focus indicators meet WCAG 2.1 AA standards
 * - Keyboard navigable with Tab and Escape keys
 * - Avatar images have empty alt text (decorative)
 * - Dropdown closes on outside click and Escape key
 * 
 * @see {@link Sidebar} for the navigation sidebar
 * @see {@link MemberAreaLayout} for the complete layout structure
 */
const Header: React.FC<HeaderProps> = ({ user, onProfileClick, onLogout, onMenuClick, sidebarOpen = false }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const isGuest = user.role === 'guest';

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

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogoutClick = async () => {
    setIsDropdownOpen(false);
    setIsLoggingOut(true);
    
    try {
      await onLogout();
    } finally {
      // Reset state after a short delay (in case navigation doesn't happen)
      setTimeout(() => setIsLoggingOut(false), 1000);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        <div className="flex items-center space-x-2">
          {/* Hamburger menu for mobile */}
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              aria-label="Toggle navigation menu"
              aria-expanded={sidebarOpen}
              aria-controls="sidebar-navigation"
              type="button"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
          )}
          
          <img 
            src="/logo.png" 
            alt="Canvango Group" 
            className="h-8 w-auto"
          />
          <span className="text-lg md:text-xl font-bold text-gray-900">Canvango Group</span>
        </div>
        
        {/* Guest buttons or Profile dropdown */}
        {isGuest ? (
          <div className="flex items-center gap-2">
            <a
              href="/login"
              className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              aria-label="Login"
              title="Login"
            >
              <LogIn className="w-5 h-5" />
            </a>
            <a
              href="/register"
              className="p-2 rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              aria-label="Register"
              title="Register"
            >
              <UserPlus className="w-5 h-5" />
            </a>
          </div>
        ) : (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              aria-label={`User profile menu: ${user.username}`}
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
              type="button"
            >
              {user.avatar ? (
                <img src={user.avatar} alt="" className="w-8 h-8 rounded-full" aria-hidden="true" />
              ) : (
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center" aria-hidden="true">
                  <User className="w-5 h-5 text-primary-600" />
                </div>
              )}
              <div className="text-left hidden sm:block">
                <div className="text-sm font-medium text-gray-900">{user.username}</div>
                <div className="text-xs text-gray-500 capitalize">{user.role}</div>
              </div>
              <ChevronDown 
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
                  <div className="text-sm font-medium text-gray-900">{user.username}</div>
                  <div className="text-xs text-gray-500 capitalize">{user.role}</div>
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
                  <User className="w-4 h-4 text-gray-500" aria-hidden="true" />
                  <span>Profile Saya</span>
                </button>

                {/* Logout menu item */}
                <button
                  onClick={handleLogoutClick}
                  disabled={isLoggingOut}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors focus:outline-none focus:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  role="menuitem"
                  type="button"
                >
                  <LogOut className={`w-4 h-4 ${isLoggingOut ? 'animate-spin' : ''}`} aria-hidden="true" />
                  <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
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
