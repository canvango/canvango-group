import React from 'react';
import { Home } from 'lucide-react';

interface WelcomeBannerProps {
  username: string;
  message: string;
  operationalInfo?: string;
}

const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ username, message, operationalInfo }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#0866FF] via-[#0A7CFF] to-[#0D96FF] rounded-3xl p-6 sm:p-8 mb-6 shadow-2xl">
      {/* Meta-style mesh gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-400/30 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent"></div>
      
      {/* Animated gradient orbs - Meta style */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-blue-300/25 via-blue-400/15 to-transparent rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-tr from-blue-500/20 via-blue-600/10 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      
      {/* Subtle dot pattern */}
      <div className="absolute inset-0 opacity-[0.07]" style={{
        backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
        backgroundSize: '24px 24px'
      }}></div>
      
      {/* Glossy overlay - Meta signature look */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/5"></div>
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 animate-shimmer"></div>
      
      <div className="relative z-10">
        <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
          <div className="bg-white/20 backdrop-blur-md p-2.5 rounded-xl shadow-lg border border-white/30">
            <Home className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold break-words text-white drop-shadow-lg tracking-tight">
            Selamat Datang, {username}
          </h1>
        </div>
        <p className="text-blue-50 text-sm sm:text-base leading-relaxed font-medium mt-1 drop-shadow-md">
          {message}
        </p>
        {operationalInfo && (
          <div className="mt-4 bg-white/15 backdrop-blur-md rounded-2xl p-3 border border-white/25 shadow-lg">
            <p className="text-xs sm:text-sm leading-relaxed text-white/95">{operationalInfo}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeBanner;
