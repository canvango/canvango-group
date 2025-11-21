/**
 * Form validation utilities
 * Provides reusable validation functions for forms across the application
 */

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | undefined;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

/**
 * Validate a single field based on rules
 */
export const validateField = (
  value: any,
  rules: ValidationRule,
  fieldName: string = 'Field'
): string | undefined => {
  // Required validation
  if (rules.required) {
    if (value === undefined || value === null || value === '') {
      return `${fieldName} is required`;
    }
    if (typeof value === 'string' && value.trim() === '') {
      return `${fieldName} is required`;
    }
  }

  // Skip other validations if value is empty and not required
  if (!value && !rules.required) {
    return undefined;
  }

  // String validations
  if (typeof value === 'string') {
    // Min length validation
    if (rules.minLength !== undefined && value.length < rules.minLength) {
      return `${fieldName} must be at least ${rules.minLength} characters`;
    }

    // Max length validation
    if (rules.maxLength !== undefined && value.length > rules.maxLength) {
      return `${fieldName} must not exceed ${rules.maxLength} characters`;
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value)) {
      return `${fieldName} format is invalid`;
    }
  }

  // Number validations
  if (typeof value === 'number' || !isNaN(Number(value))) {
    const numValue = Number(value);

    // Min value validation
    if (rules.min !== undefined && numValue < rules.min) {
      return `${fieldName} must be at least ${rules.min}`;
    }

    // Max value validation
    if (rules.max !== undefined && numValue > rules.max) {
      return `${fieldName} must not exceed ${rules.max}`;
    }
  }

  // Custom validation
  if (rules.custom) {
    return rules.custom(value);
  }

  return undefined;
};

/**
 * Validate multiple fields based on rules
 */
export const validateForm = <T extends Record<string, any>>(
  data: T,
  rules: ValidationRules,
  fieldLabels?: Record<string, string>
): Partial<Record<keyof T, string>> => {
  const errors: Partial<Record<keyof T, string>> = {};

  for (const field in rules) {
    const fieldLabel = fieldLabels?.[field] || field;
    const error = validateField(data[field], rules[field], fieldLabel);
    if (error) {
      errors[field as keyof T] = error;
    }
  }

  return errors;
};

/**
 * Common validation patterns
 */
export const ValidationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  username: /^[a-zA-Z0-9_]+$/,
  phone: /^(\+62|62|0)[0-9]{9,12}$/,
  url: /^https?:\/\/.+/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  alphabetic: /^[a-zA-Z]+$/,
  numeric: /^[0-9]+$/,
};

/**
 * Common validation rules
 */
export const CommonValidationRules = {
  email: {
    required: true,
    pattern: ValidationPatterns.email,
  },
  password: {
    required: true,
    minLength: 6,
  },
  username: {
    required: true,
    minLength: 3,
    pattern: ValidationPatterns.username,
  },
  fullName: {
    required: true,
    minLength: 2,
  },
  amount: {
    required: true,
    min: 0,
  },
  description: {
    required: true,
    minLength: 10,
    maxLength: 5000,
  },
};

/**
 * Sanitize input to prevent XSS
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  return ValidationPatterns.email.test(email);
};

/**
 * Validate password strength
 */
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  message: string;
} => {
  if (password.length < 6) {
    return {
      isValid: false,
      strength: 'weak',
      message: 'Password must be at least 6 characters',
    };
  }

  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  let score = 0;

  // Check for length
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  // Check for character types
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) {
    strength = 'weak';
  } else if (score <= 4) {
    strength = 'medium';
  } else {
    strength = 'strong';
  }

  return {
    isValid: true,
    strength,
    message: `Password strength: ${strength}`,
  };
};

/**
 * Format validation error messages for display
 */
export const formatValidationErrors = (errors: Record<string, string>): string => {
  return Object.values(errors).join(', ');
};

/**
 * Check if form has errors
 */
export const hasErrors = (errors: Record<string, any>): boolean => {
  return Object.keys(errors).some(key => errors[key] !== undefined && errors[key] !== '');
};
