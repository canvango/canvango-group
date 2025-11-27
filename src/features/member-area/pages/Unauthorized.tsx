import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../../../shared/components/Button';
import { ShieldAlert } from 'lucide-react';

/**
 * Unauthorized Page
 * 
 * Displayed when a user attempts to access a route they don't have permission for.
 * Shows the required role and provides navigation options.
 */
const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as {
    requiredRole?: string;
    userRole?: string;
    from?: string;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-red-600" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Akses Ditolak
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-6">
          Anda tidak memiliki izin untuk mengakses halaman ini.
        </p>
        
        {/* Role Information */}
        {state?.requiredRole && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm border border-gray-200">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Role yang dibutuhkan:</span>
                <span className="text-gray-900 font-semibold capitalize">
                  {state.requiredRole}
                </span>
              </div>
              {state?.userRole && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Role Anda:</span>
                  <span className="text-gray-900 font-semibold capitalize">
                    {state.userRole}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => navigate('/member-area/dashboard')}
            className="w-full"
          >
            Kembali ke Dashboard
          </Button>
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="w-full"
          >
            Kembali ke Halaman Sebelumnya
          </Button>
        </div>

        {/* Help Text */}
        <p className="text-xs text-gray-500 mt-6">
          Jika Anda merasa ini adalah kesalahan, silakan hubungi administrator.
        </p>
      </div>
    </div>
  );
};

export default Unauthorized;
