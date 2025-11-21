import React from 'react';

const AlertSection: React.FC = () => {
  return (
    <div className="bg-warning-50 border-l-4 border-warning-500 rounded-lg p-4 sm:p-6">
      <h2 className="text-base sm:text-lg font-semibold text-warning-900 mb-2 flex items-center">
        <span className="text-xl sm:text-2xl mr-2">⚠️</span>
        Perhatian
      </h2>
      <p className="text-sm sm:text-base text-warning-800">
        Pastikan Anda menggunakan layanan resmi Canvango Group. Waspadai penipuan yang mengatasnamakan kami.
      </p>
    </div>
  );
};

export default AlertSection;
