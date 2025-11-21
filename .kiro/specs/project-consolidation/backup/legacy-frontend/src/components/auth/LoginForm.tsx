import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LoginCredentials } from '../../types/user.types';
import { validateForm, ValidationRules } from '../../utils/validation';
import Button from '../common/Button';

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
        // Default redirect to new member area dashboard
        navigate('/member/dashboard', { replace: true });
      }
    } catch (error) {
      // Error is handled by AuthContext with toast
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="card">
        <div className="card-body p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 text-gray-800">
            Login to Canvango Group
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="label"
                htmlFor="identifier"
              >
                Username or Email
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                value={formData.identifier}
                onChange={handleChange}
                className={`input ${errors.identifier ? 'input-error' : ''}`}
                placeholder="Enter your username or email"
                disabled={isSubmitting}
              />
              {errors.identifier && (
                <p className="text-danger-500 text-xs mt-1">{errors.identifier}</p>
              )}
            </div>

            <div>
              <label
                className="label"
                htmlFor="password"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className={`input ${errors.password ? 'input-error' : ''}`}
                placeholder="Enter your password"
                disabled={isSubmitting}
              />
              {errors.password && (
                <p className="text-danger-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                loading={isSubmitting}
                className="w-full"
              >
                Login
              </Button>
            </div>

            <div className="text-center pt-2">
              <Link
                to="/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-500 block mb-3"
              >
                Forgot your password?
              </Link>
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-primary-600 hover:text-primary-800 font-semibold"
                >
                  Register here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
