import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { RegisterData } from '../../types/user.types';
import { validateForm, ValidationRules, ValidationPatterns } from '../../utils/validation';
import Button from '../common/Button';

interface RegisterFormData extends RegisterData {
  confirmPassword: string;
}

/**
 * RegisterForm component with validation
 * Requirements: 1.1
 */
export const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    password: {
      required: true,
      minLength: 6,
    },
    confirmPassword: {
      required: true,
      custom: (value) => {
        if (value !== formData.password) {
          return 'Passwords do not match';
        }
        return undefined;
      },
    },
  };

  const validateFormData = (): boolean => {
    const newErrors = validateForm(formData, validationRules, {
      username: 'Username',
      email: 'Email',
      fullName: 'Full name',
      password: 'Password',
      confirmPassword: 'Confirm password',
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

    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      
      // Redirect to dashboard after successful registration (Requirement: 1.4)
      navigate('/dashboard', { replace: true });
    } catch (error) {
      // Error is handled by AuthContext with toast
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="card">
        <div className="card-body p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 text-gray-800">
            Register for Canvango Group
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                className={`input ${errors.username ? 'input-error' : ''}`}
                placeholder="Choose a username"
                disabled={isSubmitting}
              />
              {errors.username && (
                <p className="text-danger-500 text-xs mt-1">{errors.username}</p>
              )}
            </div>

            <div>
              <label className="label" htmlFor="fullName">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                className={`input ${errors.fullName ? 'input-error' : ''}`}
                placeholder="Enter your full name"
                disabled={isSubmitting}
              />
              {errors.fullName && (
                <p className="text-danger-500 text-xs mt-1">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label className="label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`input ${errors.email ? 'input-error' : ''}`}
                placeholder="Enter your email"
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-danger-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className={`input ${errors.password ? 'input-error' : ''}`}
                placeholder="Choose a password"
                disabled={isSubmitting}
              />
              {errors.password && (
                <p className="text-danger-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="label" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`input ${errors.confirmPassword ? 'input-error' : ''}`}
                placeholder="Confirm your password"
                disabled={isSubmitting}
              />
              {errors.confirmPassword && (
                <p className="text-danger-500 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                loading={isSubmitting}
                className="w-full"
              >
                Register
              </Button>
            </div>

            <div className="text-center pt-2">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-primary-600 hover:text-primary-800 font-semibold"
                >
                  Login here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
