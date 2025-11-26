import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoginCredentials } from '../../types/user';
import { validateForm, ValidationRules } from '../../../../shared/utils';
import Button from '../../../../shared/components/Button';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useToast } from '../../../../shared/contexts/ToastContext';
import { TurnstileWidget } from '../../../../shared/components';
import { useTurnstile } from '../../../../shared/hooks';

/**
 * LoginForm component with validation
 * Requirements: 1.2, 1.4
 */
export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showSuccess } = useToast();
  
  const [formData, setFormData] = useState<LoginCredentials>({
    identifier: '',
    password: '',
  });
  
  const [errors, setErrors] = useState<Partial<LoginCredentials>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string>('');
  
  // Turnstile verification
  const { token, setToken, verifyToken, isVerifying, reset: resetTurnstile } = useTurnstile();
  const isTurnstileEnabled = !!import.meta.env.VITE_TURNSTILE_SITE_KEY;
  
  // Debug: Log when loginError changes
  React.useEffect(() => {
    console.log('🔴 loginError state changed to:', loginError);
  }, [loginError]);

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
    e.stopPropagation(); // Prevent event bubbling
    
    console.log('🔵 Form submitted');

    if (!validateFormData()) {
      console.log('❌ Validation failed');
      return;
    }

    // Verify Turnstile if enabled
    if (isTurnstileEnabled) {
      if (!token) {
        setLoginError('Silakan selesaikan verifikasi keamanan terlebih dahulu.');
        return;
      }

      setIsSubmitting(true);
      const isVerified = await verifyToken();
      
      if (!isVerified) {
        setLoginError('Verifikasi keamanan gagal. Silakan refresh halaman dan coba lagi.');
        setIsSubmitting(false);
        resetTurnstile();
        return;
      }
    }

    setIsSubmitting(true);
    setLoginError('');
    
    console.log('🔵 Starting login process...');

    try {
      await login(formData);
      
      console.log('✅ Login successful, redirecting...');
      
      // Show success notification
      showSuccess('Login berhasil! Selamat datang kembali 🎉');
      
      // Small delay to ensure toast is visible before redirect
      await new Promise(resolve => setTimeout(resolve, 500));
      
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
      // Prevent any navigation on error
      console.log('❌ Login failed in LoginForm, setting error state');
      console.log('Error object:', error);
      console.log('Error message:', error?.message);
      
      // Show error message - form values are preserved automatically
      const errorMessage = error?.message || 'Username atau kata sandi salah. Silakan coba lagi.';
      
      console.log('Setting loginError to:', errorMessage);
      
      // Use setTimeout to ensure state update happens after current render cycle
      setTimeout(() => {
        setLoginError(errorMessage);
        console.log('✅ loginError state set to:', errorMessage);
      }, 0);
      
      // Don't clear form data - let user correct their input
      // formData state is preserved, only password can be cleared for security if needed
      
      // Reset Turnstile on error
      if (isTurnstileEnabled) {
        resetTurnstile();
      }
    } finally {
      console.log('🔵 Setting isSubmitting to false');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8">
        {/* Header */}
        <div className="mb-5">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
            Masuk ke akun
          </h2>
          <p className="text-xs md:text-sm text-gray-600">
            Selamat datang kembali! Silakan masuk untuk melanjutkan
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Username Field */}
          <div>
            <label
              className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5"
              htmlFor="identifier"
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
                id="identifier"
                name="identifier"
                type="text"
                value={formData.identifier}
                onChange={handleChange}
                className={`w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2 md:py-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
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
                placeholder="••••••••••••"
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
          {loginError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl animate-shake">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 flex-1 font-medium">
                {loginError}
              </p>
            </div>
          )}

          {/* Turnstile Widget */}
          {isTurnstileEnabled && (
            <TurnstileWidget
              onSuccess={setToken}
              onError={resetTurnstile}
              onExpire={resetTurnstile}
              className="my-2"
            />
          )}

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-xs md:text-sm text-gray-700">Ingat saya</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-xs md:text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Lupa kata sandi?
            </Link>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting || isVerifying}
            disabled={isTurnstileEnabled && !token}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-medium transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVerifying ? 'Memverifikasi...' : 'Masuk'}
          </Button>

          {/* Register Link */}
          <div className="text-center pt-3 border-t border-gray-200">
            <p className="text-xs md:text-sm text-gray-600">
              Belum punya akun?{' '}
              <Link
                to="/register"
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Daftar
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
