/**
 * AnalyticsProvider Component
 * 
 * Wraps the application to provide automatic analytics tracking
 * Tracks page views and sets user context automatically
 */

import React, { useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import analytics from '../utils/analytics';

interface AnalyticsProviderProps {
  children: ReactNode;
  user?: {
    id: string;
    username: string;
    role: string;
  } | null;
  enabled?: boolean;
}

/**
 * Provider component that handles automatic analytics tracking
 */
export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({
  children,
  user,
  enabled = true
}) => {
  const location = useLocation();

  // Enable/disable analytics based on prop
  useEffect(() => {
    if (enabled) {
      analytics.enable();
    } else {
      analytics.disable();
    }
  }, [enabled]);

  // Set user context when user changes
  useEffect(() => {
    if (user) {
      analytics.setUserContext({
        userId: user.id,
        username: user.username,
        role: user.role
      });
    } else {
      analytics.clearUserContext();
    }
  }, [user]);

  // Track page views on route change
  useEffect(() => {
    const title = document.title || 'Untitled Page';
    
    analytics.trackPageView(location.pathname, title, {
      search: location.search,
      hash: location.hash,
      state: location.state
    });
  }, [location]);

  return <>{children}</>;
};

export default AnalyticsProvider;
