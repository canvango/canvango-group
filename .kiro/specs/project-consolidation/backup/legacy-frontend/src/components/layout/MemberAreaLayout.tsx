import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import WhatsAppButton from './WhatsAppButton';

const MemberAreaLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout, loading } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Create guest user if no user is logged in
  const displayUser = user || {
    username: 'Guest',
    email: 'guest@canvango.com',
    fullName: 'Guest User',
    role: 'guest' as const,
    balance: 0,
    id: 'guest',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleProfileClick = () => {
    console.log('Profile clicked - implement profile navigation');
    // TODO: Navigate to profile page or show profile dropdown
  };

  const handleLogout = async () => {
    await logout();
    // User will be redirected to landing page by GuestRoute
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        user={{
          username: displayUser.username,
          role: displayUser.role === 'guest' ? 'member' : displayUser.role,
          avatar: undefined
        }}
        onProfileClick={handleProfileClick}
        onLogout={handleLogout}
        onMenuClick={toggleSidebar}
        sidebarOpen={sidebarOpen}
        isGuest={!user}
      />
      
      <Sidebar
        user={{
          username: displayUser.username,
          balance: displayUser.balance,
          role: displayUser.role,
          stats: {
            transactions: 0 // TODO: Fetch from API
          }
        }}
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        isGuest={!user}
      />
      
      {/* Main Content Area */}
      <main 
        className="pt-16 ml-0 md:ml-60 min-h-screen transition-all duration-300"
        id="main-content"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          <Outlet />
        </div>
      </main>
      
      <Footer />
      
      <WhatsAppButton phoneNumber="6281234567890" />
    </div>
  );
};

export default MemberAreaLayout;
