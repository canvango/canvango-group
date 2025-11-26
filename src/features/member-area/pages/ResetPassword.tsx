import React from 'react';
import { ResetPasswordForm } from '../components/auth/ResetPasswordForm';

/**
 * Reset Password page with two-column layout
 * Matches Login and Register page design
 */
const ResetPassword: React.FC = () => {
  return (
    <div className="min-h-screen flex">
      {/* Left Column - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-700 p-12 flex-col justify-center items-center">
        <div className="max-w-lg text-center">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <div className="bg-white rounded-full px-8 py-4 shadow-lg flex items-center gap-4">
              <img 
                src="/logo.png" 
                alt="Canvango Group" 
                className="h-12 w-auto"
              />
              <h1 className="text-2xl font-bold" style={{ color: '#5271ff' }}>CANVANGO GROUP</h1>
            </div>
          </div>
          
          {/* Heading */}
          <h2 className="text-white text-3xl font-bold mb-4 leading-tight">
            Buat Password Baru Yang Aman
          </h2>
          
          {/* Description */}
          <p className="text-primary-100 text-lg leading-relaxed">
            Pastikan password baru Anda kuat dan mudah diingat. Gunakan kombinasi huruf besar, huruf kecil, dan angka untuk keamanan maksimal.
          </p>
        </div>
      </div>

      {/* Right Column - Reset Password Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <ResetPasswordForm />
      </div>
    </div>
  );
};

export default ResetPassword;
