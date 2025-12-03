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
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 p-12 flex-col justify-center items-center relative overflow-hidden">
        {/* Decorative Blur Circles */}
        <div className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-blue-400/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] bg-indigo-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-purple-400/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-lg text-center">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <div className="bg-white rounded-full px-8 py-6 shadow-lg">
              <img 
                src="/logo.png" 
                alt="Canvango Group" 
                className="h-12 w-auto"
              />
            </div>
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
