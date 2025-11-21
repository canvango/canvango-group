import React from 'react';

const SupportSection: React.FC = () => {
  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900">
          Customer Support & Security
        </h2>
      </div>
      <div className="card-body">
        <div className="space-y-3 text-sm sm:text-base text-gray-600">
          <div className="flex items-center space-x-2">
            <span className="text-lg">📧</span>
            <span>Email: support@canvangogroup.com</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg">💬</span>
            <span>WhatsApp: +62 812-3456-7890</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg">🔒</span>
            <span>Keamanan: security@canvangogroup.com</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportSection;
