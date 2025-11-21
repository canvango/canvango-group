/**
 * CSRF Protection Utilities
 * 
 * Provides client-side CSRF token management for protecting against
 * Cross-Site Request Forgery attacks.
 */

const CSRF_TOKEN_KEY = 'csrf_token';
const CSRF_HEADER_NAME = 'X-CSRF-Token';

/**
 * Generate a random CSRF token
 */
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Get the current CSRF token from sessionStorage
 * If no token exists, generate a new one
 */
export const getCSRFToken = (): string => {
  let token = sessionStorage.getItem(CSRF_TOKEN_KEY);
  
  if (!token) {
    token = generateCSRFToken();
    sessionStorage.setItem(CSRF_TOKEN_KEY, token);
  }
  
  return token;
};

/**
 * Set a new CSRF token
 */
export const setCSRFToken = (token: string): void => {
  sessionStorage.setItem(CSRF_TOKEN_KEY, token);
};

/**
 * Clear the CSRF token (e.g., on logout)
 */
export const clearCSRFToken = (): void => {
  sessionStorage.removeItem(CSRF_TOKEN_KEY);
};

/**
 * Get the CSRF header name
 */
export const getCSRFHeaderName = (): string => {
  return CSRF_HEADER_NAME;
};

/**
 * Get CSRF headers object for API requests
 */
export const getCSRFHeaders = (): Record<string, string> => {
  return {
    [CSRF_HEADER_NAME]: getCSRFToken()
  };
};

/**
 * Validate CSRF token (client-side check)
 * This is a basic check - server-side validation is required
 */
export const validateCSRFToken = (token: string): boolean => {
  const storedToken = sessionStorage.getItem(CSRF_TOKEN_KEY);
  return storedToken === token && token.length === 64;
};

/**
 * Refresh CSRF token
 * Should be called after successful authentication or periodically
 */
export const refreshCSRFToken = (): string => {
  const newToken = generateCSRFToken();
  setCSRFToken(newToken);
  return newToken;
};
