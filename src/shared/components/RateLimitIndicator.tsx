/**
 * RateLimitIndicator Component
 * 
 * Displays API rate limit status and warnings
 */

import React, { useEffect, useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import {
  RateLimitInfo,
  RateLimitStatus,
  calculateRateLimitStatus,
  getRateLimitColor,
  getRateLimitMessage,
} from '../utils/rate-limit';

interface RateLimitIndicatorProps {
  /**
   * Rate limit information
   */
  rateLimitInfo: RateLimitInfo | null;
  
  /**
   * Whether to show the indicator
   */
  show?: boolean;
  
  /**
   * Position of the indicator
   */
  position?: 'top' | 'bottom' | 'inline';
  
  /**
   * Whether to show detailed information
   */
  detailed?: boolean;
  
  /**
   * Custom className
   */
  className?: string;
  
  /**
   * Callback when rate limit is exceeded
   */
  onExceeded?: () => void;
  
  /**
   * Callback when approaching rate limit
   */
  onApproaching?: () => void;
}

/**
 * RateLimitIndicator component
 * 
 * @example
 * <RateLimitIndicator rateLimitInfo={info} position="top" detailed />
 */
export const RateLimitIndicator: React.FC<RateLimitIndicatorProps> = ({
  rateLimitInfo,
  show = true,
  position = 'inline',
  detailed = false,
  className = '',
  onExceeded,
  onApproaching,
}) => {
  const [status, setStatus] = useState<RateLimitStatus | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');

  // Calculate status when rate limit info changes
  useEffect(() => {
    if (!rateLimitInfo) {
      setStatus(null);
      return;
    }

    const newStatus = calculateRateLimitStatus(rateLimitInfo);
    setStatus(newStatus);

    // Trigger callbacks
    if (newStatus.isExceeded && onExceeded) {
      onExceeded();
    } else if (newStatus.isApproaching && onApproaching) {
      onApproaching();
    }
  }, [rateLimitInfo, onExceeded, onApproaching]);

  // Update time left every second
  useEffect(() => {
    if (!status || status.timeUntilReset <= 0) {
      return;
    }

    const interval = setInterval(() => {
      if (rateLimitInfo) {
        const newStatus = calculateRateLimitStatus(rateLimitInfo);
        setTimeLeft(newStatus.resetTimeFormatted);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [status, rateLimitInfo]);

  // Don't show if no rate limit info or show is false
  if (!show || !rateLimitInfo || !status) {
    return null;
  }

  // Don't show if status is safe and not detailed
  if (status.level === 'safe' && !detailed) {
    return null;
  }

  const colors = getRateLimitColor(status.level);
  const message = getRateLimitMessage(status, rateLimitInfo);

  const getIcon = () => {
    switch (status.level) {
      case 'exceeded':
        return <AlertCircle className="w-5 h-5" />;
      case 'danger':
        return <AlertTriangle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'safe':
      default:
        return <CheckCircle className="w-5 h-5" />;
    }
  };

  const positionClasses = {
    top: 'fixed top-0 left-0 right-0 z-50',
    bottom: 'fixed bottom-0 left-0 right-0 z-50',
    inline: '',
  };

  return (
    <div
      className={`
        ${colors.bg} ${colors.text} ${colors.border}
        border rounded-lg p-4
        ${positionClasses[position]}
        ${className}
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">
            {message}
          </p>
          
          {detailed && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span>Usage:</span>
                <span className="font-medium">
                  {rateLimitInfo.used} / {rateLimitInfo.limit} requests
                </span>
              </div>
              
              <div className="w-full bg-white bg-opacity-50 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    status.level === 'exceeded' ? 'bg-red-600' :
                    status.level === 'danger' ? 'bg-orange-600' :
                    status.level === 'warning' ? 'bg-yellow-600' :
                    'bg-green-600'
                  }`}
                  style={{ width: `${Math.min(100, status.usagePercentage)}%` }}
                  role="progressbar"
                  aria-valuenow={status.usagePercentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
              
              {status.timeUntilReset > 0 && (
                <div className="flex items-center gap-1 text-xs mt-2">
                  <Clock className="w-3 h-3" />
                  <span>Resets in {timeLeft || status.resetTimeFormatted}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Compact rate limit badge
 */
export const RateLimitBadge: React.FC<{
  rateLimitInfo: RateLimitInfo | null;
  className?: string;
}> = ({ rateLimitInfo, className = '' }) => {
  if (!rateLimitInfo) {
    return null;
  }

  const status = calculateRateLimitStatus(rateLimitInfo);
  const colors = getRateLimitColor(status.level);

  // Only show if approaching or exceeded
  if (status.level === 'safe') {
    return null;
  }

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium
        ${colors.bg} ${colors.text} ${colors.border} border
        ${className}
      `}
      title={getRateLimitMessage(status, rateLimitInfo)}
    >
      <AlertTriangle className="w-3 h-3" />
      <span>{rateLimitInfo.remaining} left</span>
    </div>
  );
};

export default RateLimitIndicator;
