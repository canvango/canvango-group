import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const WelcomeBanner: React.FC = () => {
  const { user, isGuest } = useAuth();

  return (
    <div className="card">
      <div className="card-body">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Selamat Datang, {isGuest ? 'Guest' : user?.fullName}!
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Platform layanan digital marketing dan verifikasi akun bisnis
        </p>
      </div>
    </div>
  );
};

export default WelcomeBanner;
