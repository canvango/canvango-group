import React, { useState, useEffect } from 'react';
import { TurnstileWidget } from '../shared/components';
import { useTurnstile } from '../shared/hooks';

interface TurnstileProtectionProps {
  children: React.ReactNode;
}

/**
 * Full Page Turnstile Protection Component
 * Protects the entire application with Cloudflare Turnstile verification
 * Similar to the protection shown in tripay.co.id
 */
export const TurnstileProtection: React.FC<TurnstileProtectionProps> = ({ children }) => {
  const [isVerified, setIsVerified] = useState(false);
  const { token, setToken, verifyToken, isVerifying, reset: resetTurnstile } = useTurnstile();
  const isTurnstileEnabled = !!import.meta.env.VITE_TURNSTILE_SITE_KEY;

  // Check if user was previously verified in this session
  useEffect(() => {
    const verified = sessionStorage.getItem('turnstile_verified');
    const verifiedTime = sessionStorage.getItem('turnstile_verified_time');
    
    if (verified === 'true' && verifiedTime) {
      const timeElapsed = Date.now() - parseInt(verifiedTime);
      const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
      
      // If verification is still valid (less than 5 minutes old)
      if (timeElapsed < fiveMinutes) {
        setIsVerified(true);
        return;
      }
    }
    
    // Clear expired verification
    sessionStorage.removeItem('turnstile_verified');
    sessionStorage.removeItem('turnstile_verified_time');
  }, []);

  // Auto-verify when token is received
  useEffect(() => {
    if (token && !isVerified && !isVerifying) {
      handleVerification();
    }
  }, [token]);

  const handleVerification = async () => {
    if (!token) return;

    const isValid = await verifyToken();
    
    if (isValid) {
      setIsVerified(true);
      // Store verification in session storage
      sessionStorage.setItem('turnstile_verified', 'true');
      sessionStorage.setItem('turnstile_verified_time', Date.now().toString());
    } else {
      // Reset on failure
      resetTurnstile();
    }
  };

  // If Turnstile is not enabled, show content directly
  if (!isTurnstileEnabled) {
    return <>{children}</>;
  }

  // If already verified, show content
  if (isVerified) {
    return <>{children}</>;
  }

  // Show Turnstile verification page
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <img 
              src="/logo.png" 
              alt="Canvango Group" 
              className="h-12 w-auto"
            />
          </div>
          
          {/* Description */}
          <p className="text-sm text-gray-700 mb-6 leading-relaxed">
            Verify you are human by completing the action below.
          </p>

          {/* Turnstile Widget */}
          <div className="flex justify-center mb-4">
            <TurnstileWidget
              onSuccess={setToken}
              onError={resetTurnstile}
              onExpire={resetTurnstile}
            />
          </div>

          {/* Loading state */}
          {isVerifying && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Memverifikasi...</span>
            </div>
          )}

          {/* Security notice */}
          <p className="text-xs text-gray-500 mt-6 leading-relaxed">
            canvango.com needs to review the security of your connection before proceeding.
          </p>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Performance & security by{' '}
              <a 
                href="https://www.cloudflare.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Cloudflare
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
