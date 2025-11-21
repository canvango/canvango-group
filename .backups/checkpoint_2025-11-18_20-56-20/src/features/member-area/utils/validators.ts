/**
 * Validator Utilities
 * Functions for validating user input
 */

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate Indonesian phone number
 */
export const isValidPhone = (phone: string): boolean => {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Indonesian phone numbers: 10-13 digits, starts with 0 or 62
  if (cleaned.startsWith('0')) {
    return cleaned.length >= 10 && cleaned.length <= 13;
  }
  
  if (cleaned.startsWith('62')) {
    return cleaned.length >= 11 && cleaned.length <= 14;
  }
  
  return false;
};

/**
 * Validate URL format
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate password strength
 * Returns: { valid: boolean, errors: string[] }
 */
export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password minimal 8 karakter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password harus mengandung huruf besar');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password harus mengandung huruf kecil');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password harus mengandung angka');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password harus mengandung karakter spesial');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Validate amount (must be positive number)
 */
export const isValidAmount = (amount: number, min?: number, max?: number): boolean => {
  if (amount <= 0) return false;
  if (min !== undefined && amount < min) return false;
  if (max !== undefined && amount > max) return false;
  return true;
};

/**
 * Validate username
 */
export const isValidUsername = (username: string): boolean => {
  // 3-20 characters, alphanumeric and underscore only
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

/**
 * Validate date range
 */
export const isValidDateRange = (startDate: string, endDate: string): boolean => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return false;
  }
  
  return start <= end;
};

/**
 * Validate file type
 */
export const isValidFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type);
};

/**
 * Validate file size
 */
export const isValidFileSize = (file: File, maxSizeInMB: number): boolean => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};

/**
 * Validate required field
 */
export const isRequired = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

/**
 * Validate min length
 */
export const hasMinLength = (value: string, minLength: number): boolean => {
  return value.length >= minLength;
};

/**
 * Validate max length
 */
export const hasMaxLength = (value: string, maxLength: number): boolean => {
  return value.length <= maxLength;
};

/**
 * Validate numeric string
 */
export const isNumeric = (value: string): boolean => {
  return /^\d+$/.test(value);
};

/**
 * Validate alphanumeric string
 */
export const isAlphanumeric = (value: string): boolean => {
  return /^[a-zA-Z0-9]+$/.test(value);
};

/**
 * Validate Indonesian ID card number (KTP)
 */
export const isValidKTP = (ktp: string): boolean => {
  // Remove all non-numeric characters
  const cleaned = ktp.replace(/\D/g, '');
  
  // KTP must be exactly 16 digits
  return cleaned.length === 16 && isNumeric(cleaned);
};

/**
 * Validate credit card number (Luhn algorithm)
 */
export const isValidCreditCard = (cardNumber: string): boolean => {
  const cleaned = cardNumber.replace(/\D/g, '');
  
  if (cleaned.length < 13 || cleaned.length > 19) {
    return false;
  }
  
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i), 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

/**
 * Validate postal code (Indonesian format)
 */
export const isValidPostalCode = (postalCode: string): boolean => {
  // Indonesian postal codes are 5 digits
  const cleaned = postalCode.replace(/\D/g, '');
  return cleaned.length === 5;
};

/**
 * Check if value is in range
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

/**
 * Validate array has minimum items
 */
export const hasMinItems = <T>(array: T[], minItems: number): boolean => {
  return array.length >= minItems;
};

/**
 * Validate array has maximum items
 */
export const hasMaxItems = <T>(array: T[], maxItems: number): boolean => {
  return array.length <= maxItems;
};
