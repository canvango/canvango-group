import { useState, useCallback } from 'react';

interface UseTurnstileReturn {
  token: string | null;
  isVerifying: boolean;
  isVerified: boolean;
  error: string | null;
  setToken: (token: string) => void;
  verifyToken: () => Promise<boolean>;
  reset: () => void;
}

/**
 * Hook for managing Cloudflare Turnstile verification
 * 
 * Handles token storage, verification with backend, and state management
 */
export const useTurnstile = (): UseTurnstileReturn => {
  const [token, setTokenState] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setToken = useCallback((newToken: string) => {
    setTokenState(newToken);
    setError(null);
    setIsVerified(false);
  }, []);

  const verifyToken = useCallback(async (): Promise<boolean> => {
    if (!token) {
      setError('Token tidak tersedia');
      return false;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const response = await fetch('/api/verify-turnstile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (data.success) {
        setIsVerified(true);
        return true;
      } else {
        setError('Verifikasi gagal. Silakan coba lagi.');
        setIsVerified(false);
        return false;
      }
    } catch (err) {
      console.error('Turnstile verification error:', err);
      setError('Terjadi kesalahan saat verifikasi. Silakan coba lagi.');
      setIsVerified(false);
      return false;
    } finally {
      setIsVerifying(false);
    }
  }, [token]);

  const reset = useCallback(() => {
    setTokenState(null);
    setIsVerifying(false);
    setIsVerified(false);
    setError(null);
  }, []);

  return {
    token,
    isVerifying,
    isVerified,
    error,
    setToken,
    verifyToken,
    reset,
  };
};
