import React, { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export const OfflineDetector: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowNotification(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showNotification) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      {isOnline ? (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 shadow-lg flex items-center gap-3">
          <Wifi className="w-5 h-5 text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-900">Kembali Online</p>
            <p className="text-xs text-green-700">Koneksi internet tersambung kembali</p>
          </div>
        </div>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 shadow-lg flex items-center gap-3">
          <WifiOff className="w-5 h-5 text-red-600" />
          <div>
            <p className="text-sm font-medium text-red-900">Tidak Ada Koneksi</p>
            <p className="text-xs text-red-700">Periksa koneksi internet Anda</p>
          </div>
        </div>
      )}
    </div>
  );
};
