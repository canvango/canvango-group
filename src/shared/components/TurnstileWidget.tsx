import React from 'react';
import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile';

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  className?: string;
}

/**
 * Cloudflare Turnstile Widget Component
 * 
 * Provides bot protection for forms with automatic verification
 * 
 * @see https://developers.cloudflare.com/turnstile/
 */
export const TurnstileWidget: React.FC<TurnstileWidgetProps> = ({
  onSuccess,
  onError,
  onExpire,
  className = '',
}) => {
  const turnstileRef = React.useRef<TurnstileInstance>(null);
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  // If site key is not configured, don't render the widget
  if (!siteKey) {
    console.warn('VITE_TURNSTILE_SITE_KEY is not configured. Turnstile widget will not be rendered.');
    return null;
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-center items-center w-full min-h-[65px] p-2 bg-gray-50 border border-gray-300 rounded-xl">
        <Turnstile
          ref={turnstileRef}
          siteKey={siteKey}
          onSuccess={onSuccess}
          onError={() => {
            console.error('Turnstile verification failed');
            onError?.();
          }}
          onExpire={() => {
            console.warn('Turnstile token expired');
            onExpire?.();
          }}
          options={{
            theme: 'light',
            size: 'normal',
          }}
        />
      </div>
    </div>
  );
};
