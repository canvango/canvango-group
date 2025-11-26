import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { RegisterData } from '../../types/user';
import { validateForm, ValidationRules, ValidationPatterns } from '../../../../shared/utils';
import Button from '../../../../shared/components/Button';
import { AlertCircle, Eye, EyeOff, Smartphone } from 'lucide-react';
import { useToast } from '../../../../shared/contexts/ToastContext';

interface RegisterFormData extends RegisterData {
  phone: string;
}

/**
 * RegisterForm component with validation
 * Requirements: 1.1
 */
export const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showSuccess } = useToast();
  
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phone: '',
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [registerError, setRegisterError] = useState<string>('');

  const validationRules: ValidationRules = {
    username: {
      required: true,
      minLength: 3,
      pattern: ValidationPatterns.username,
    },
    email: {
      required: true,
      pattern: ValidationPatterns.email,
    },
    fullName: {
      required: true,
      minLength: 2,
    },
    phone: {
      required: true,
      pattern: /^(\+?62|0)8[0-9]{8,12}$/,
    },
    password: {
      required: true,
      minLength: 6,
    },
  };

  const validateFormData = (): boolean => {
    const newErrors = validateForm(formData, validationRules, {
      username: 'Username',
      email: 'Email',
      fullName: 'Full name',
      phone: 'Phone number',
      password: 'Password',
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof RegisterFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateFormData()) {
      return;
    }

    setIsSubmitting(true);
    setRegisterError('');

    try {
      // Normalize phone number
      let normalizedPhone = formData.phone;
      if (formData.phone.startsWith('0')) {
        normalizedPhone = '+62' + formData.phone.substring(1);
      } else if (!formData.phone.startsWith('+')) {
        normalizedPhone = '+' + formData.phone;
      }

      await register({
        ...formData,
        phone: normalizedPhone
      });
      
      // Show success notification
      showSuccess('Pendaftaran berhasil! Selamat datang 🎉');
      
      // Small delay to ensure toast is visible before redirect
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Redirect to dashboard after successful registration (Requirement: 1.4)
      navigate('/dashboard', { replace: true });
    } catch (error: any) {
      // Show error message
      setRegisterError(error?.message || 'Terjadi kesalahan saat mendaftar. Silakan coba lagi.');
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8">
        {/* Header */}
        <div className="mb-5">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
            Daftar akun baru
          </h2>
          <p className="text-xs md:text-sm text-gray-600">
            Buat akun untuk mulai menggunakan layanan kami
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Username Field */}
          <div>
            <label
              className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5"
              htmlFor="username"
            >
              Username
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                className={`w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2 md:py-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.username ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="canvango"
                disabled={isSubmitting}
              />
            </div>
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">{errors.username}</p>
            )}
          </div>

          {/* Full Name Field */}
          <div>
            <label
              className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5"
              htmlFor="fullName"
            >
              Nama Lengkap
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2 md:py-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.fullName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="John Doe"
                disabled={isSubmitting}
              />
            </div>
            {errors.fullName && (
              <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label
              className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5"
              htmlFor="email"
            >
              Email
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2 md:py-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="john@example.com"
                disabled={isSubmitting}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <label
              className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5"
              htmlFor="phone"
            >
              Nomor HP
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Smartphone className="w-4 h-4 md:w-5 md:h-5" />
              </span>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2 md:py-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="08xxxxxxxxxx"
                disabled={isSubmitting}
              />
            </div>
            {errors.phone ? (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            ) : (
              <p className="text-xs text-gray-500 mt-1">Format: 08xxx atau +62xxx</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label
              className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5"
              htmlFor="password"
            >
              Kata sandi
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                className={`w-full pl-9 md:pl-10 pr-10 md:pr-12 py-2 md:py-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Min. 6 karakter"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4 md:w-5 md:h-5" /> : <Eye className="w-4 h-4 md:w-5 md:h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* Error Message */}
          {registerError && (
            <div className="flex items-start gap-2 p-2.5 bg-red-50 border border-red-200 rounded-xl animate-shake">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 flex-1">
                {registerError}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-medium transition-colors mt-4"
          >
            Daftar
          </Button>

          {/* Login Link */}
          <div className="text-center pt-3 border-t border-gray-200">
            <p className="text-xs md:text-sm text-gray-600">
              Sudah punya akun?{' '}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Masuk
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
