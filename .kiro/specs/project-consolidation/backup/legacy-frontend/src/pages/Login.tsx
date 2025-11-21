import React from 'react';
import { LoginForm } from '../components/auth/LoginForm';

/**
 * Login page
 * Requirements: 1.2, 1.4
 */
const Login: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Canvango Group</h1>
        <p className="mt-2 text-sm text-gray-600">
          Digital Marketing & Business Verification Platform
        </p>
      </div>
      <LoginForm />
    </div>
  );
};

export default Login;
