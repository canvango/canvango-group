import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoginCredentials } from '../../types/user';
import { validateForm, ValidationRules } from '../../../../shared/utils';
import Button from '../../../../shared/components/Button';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

/**
 * LoginForm component with validation
 * Requirements: 1.2, 1.4
 */
export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState<LoginCredentials>({
    identifier: '',
    password: '',
  });
  
  const [errors, setErrors] = useState<Partial<LoginCredentials>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string>('');

  const validationRules: ValidationRules = {
    identifier: {
      required: true,
      minLength: 3,
    },
    password: {
      required: true,
      minLength: 6,
    },
  };

  const validateFormData = (): boolean => {
    const newErrors = validateForm(formData, validationRules, {
      identifier: 'Username or Email',
      password: 'Password',
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof LoginCredentials]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateFormData()) {
      return;
    }

    setIsSubmitting(true);
    setLoginError('');

    try {
      await login(formData);
      
      // Redirect after login based on role (Requirement: 1.4)
      // If user was trying to access a specific page, redirect there
      // Otherwise, redirect based on role
      const from = (location.state as any)?.from?.pathname;
      
      if (from && from !== '/login' && from !== '/register') {
        // User was trying to access a specific page, redirect there
        navigate(from, { replace: true });
      } else {
        // Default redirect to dashboard
        navigate('/dashboard', { replace: true });
      }
    } catch (error: any) {
      // Show error message
      setLoginError(error?.message || 'Username atau kata sandi salah. Silakan coba lagi.');
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Masuk ke akun
          </h2>
          <p className="text-sm text-gray-600">
            Selamat datang kembali! Silakan masuk untuk melanjutkan.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username Field */}
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-2"
              htmlFor="identifier"
            >
              Username
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              <input
                id="identifier"
                name="identifier"
                type="text"
                value={formData.identifier}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.identifier ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="canvango"
                disabled={isSubmitting}
              />
            </div>
            {errors.identifier && (
              <p className="text-red-500 text-xs mt-1">{errors.identifier}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-2"
              htmlFor="password"
            >
              Kata sandi
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                className={`w-full pl-10 pr-12 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="••••••••••••"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* Error Message */}
          {loginError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-800 font-medium">
                  Upss, username atau kata sandi salah!
                </p>
                <p className="text-xs text-red-600 mt-1">
                  Silakan periksa kembali username dan kata sandi Anda.
                </p>
              </div>
            </div>
          )}

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Ingat saya</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Lupa kata sandi?
            </Link>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-colors"
          >
            Masuk
          </Button>

          {/* Register Link */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Belum punya akun?{' '}
              <Link
                to="/register"
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Daftar
              </Link>
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Dengan masuk, Anda menyetujui{' '}
              <a href="#" className="text-blue-600 hover:underline">Ketentuan Layanan</a>
              {' '}dan{' '}
              <a href="#" className="text-blue-600 hover:underline">Kebijakan Privasi</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
