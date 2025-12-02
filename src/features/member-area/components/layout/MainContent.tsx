import React from 'react';
import EmailVerificationBanner from '@/components/EmailVerificationBanner';

interface MainContentProps {
  children: React.ReactNode;
}

const MainContent: React.FC<MainContentProps> = ({ children }) => {
  return (
    <main 
      id="main-content"
      className="mt-16 min-h-screen bg-gray-50 transition-all duration-300 p-3 md:p-6 lg:ml-60"
      tabIndex={-1}
    >
      <div className="w-full mx-auto px-2 md:px-4 lg:px-6">
        <EmailVerificationBanner />
        {children}
      </div>
    </main>
  );
};

export default MainContent;
