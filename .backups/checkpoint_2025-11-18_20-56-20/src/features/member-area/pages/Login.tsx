import React from 'react';
import { LoginForm } from '../components/auth/LoginForm';

/**
 * Login page with two-column layout
 * Requirements: 1.2, 1.4
 */
const Login: React.FC = () => {
  return (
    <div className="min-h-screen flex">
      {/* Left Column - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-700 p-12 flex-col justify-center items-center">
        <div className="max-w-lg text-center">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-3">
              <span className="text-primary-600 font-bold text-xl">C</span>
            </div>
            <h1 className="text-white text-2xl font-bold">CANVANGO GROUP</h1>
          </div>
          
          {/* Heading */}
          <h2 className="text-white text-3xl font-bold mb-4 leading-tight">
            Masuk Dan Dapatkan Akun BM & Personal Facebook Terpercaya
          </h2>
          
          {/* Description */}
          <p className="text-primary-100 text-lg leading-relaxed">
            Solusi lengkap untuk kebutuhan akun Business Manager, akun Personal Facebook berkualitas, dan layanan Verifikasi BM profesional.
          </p>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
