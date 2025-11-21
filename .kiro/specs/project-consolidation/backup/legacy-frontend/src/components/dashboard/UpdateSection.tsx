import React from 'react';

const UpdateSection: React.FC = () => {
  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
          <span className="text-xl sm:text-2xl mr-2">📢</span>
          Update Terbaru
        </h2>
      </div>
      <div className="card-body">
        <div className="space-y-4">
          <div className="border-l-4 border-primary-500 pl-4 py-2">
            <p className="font-medium text-gray-900 text-sm sm:text-base">Sistem Baru Diluncurkan</p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Platform web baru dengan fitur yang lebih lengkap</p>
          </div>
          <div className="border-l-4 border-success-500 pl-4 py-2">
            <p className="font-medium text-gray-900 text-sm sm:text-base">Metode Pembayaran Baru</p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Kini tersedia lebih banyak pilihan pembayaran</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateSection;
