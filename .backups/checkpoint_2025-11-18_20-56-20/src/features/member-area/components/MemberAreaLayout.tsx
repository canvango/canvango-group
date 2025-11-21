import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, Sidebar, MainContent, WhatsAppButton, Footer } from './layout';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';
import { SkipLink } from '../../../shared/components';

interface MemberAreaLayoutProps {
  children: React.ReactNode;
}

const MemberAreaLayout: React.FC<MemberAreaLayoutProps> = ({ children }) => {
  const { user, logout, isLoading } = useAuth();
  const { sidebarOpen, toggleSidebar, closeSidebar } = useUI();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
      // Still navigate to login even if logout fails
      navigate('/login', { replace: true });
    }
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Create guest user object if no user is authenticated
  const displayUser = user || {
    username: 'Guest',
    balance: 0,
    role: 'guest' as const
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Skip to main content link for keyboard navigation */}
      <SkipLink />
      
      <Header
        user={{
          username: displayUser.username,
          role: displayUser.role,
          avatar: user?.avatar
        }}
        onProfileClick={() => console.log('Profile clicked')}
        onLogout={handleLogout}
        onMenuClick={toggleSidebar}
        sidebarOpen={sidebarOpen}
      />
      
      <Sidebar
        user={{
          username: displayUser.username,
          balance: displayUser.balance,
          role: displayUser.role,
          stats: undefined // Stats will be loaded separately if needed
        }}
        isOpen={sidebarOpen}
        onClose={closeSidebar}
      />
      
      <MainContent>{children}</MainContent>
      
      <Footer />
      
      <WhatsAppButton phoneNumber="6281234567890" />
    </div>
  );
};

export default MemberAreaLayout;
