/**
 * Analytics and Tracking Utilities
 * 
 * Provides a centralized system for tracking user interactions and page views.
 * Supports multiple analytics providers (Google Analytics, custom analytics, etc.)
 */

export interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
}

export interface PageViewEvent {
  path: string;
  title: string;
  referrer?: string;
  metadata?: Record<string, any>;
}

export interface UserContext {
  userId?: string;
  username?: string;
  role?: string;
  sessionId?: string;
}

/**
 * Analytics provider interface
 * Implement this interface to add support for different analytics services
 */
export interface AnalyticsProvider {
  name: string;
  trackPageView: (event: PageViewEvent, userContext?: UserContext) => void;
  trackEvent: (event: AnalyticsEvent, userContext?: UserContext) => void;
  setUserContext: (context: UserContext) => void;
}

/**
 * Console Analytics Provider
 * Logs analytics events to console (useful for development)
 */
class ConsoleAnalyticsProvider implements AnalyticsProvider {
  name = 'console';

  trackPageView(event: PageViewEvent, userContext?: UserContext): void {
    console.log('[Analytics] Page View:', {
      ...event,
      userContext,
      timestamp: new Date().toISOString()
    });
  }

  trackEvent(event: AnalyticsEvent, userContext?: UserContext): void {
    console.log('[Analytics] Event:', {
      ...event,
      userContext,
      timestamp: new Date().toISOString()
    });
  }

  setUserContext(context: UserContext): void {
    console.log('[Analytics] User Context Set:', context);
  }
}

/**
 * Google Analytics Provider
 * Integrates with Google Analytics (gtag.js)
 */
class GoogleAnalyticsProvider implements AnalyticsProvider {
  name = 'google-analytics';
  private measurementId: string;

  constructor(measurementId: string) {
    this.measurementId = measurementId;
  }

  trackPageView(event: PageViewEvent, userContext?: UserContext): void {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', this.measurementId, {
        page_path: event.path,
        page_title: event.title,
        user_id: userContext?.userId,
        ...event.metadata
      });
    }
  }

  trackEvent(event: AnalyticsEvent, userContext?: UserContext): void {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        user_id: userContext?.userId,
        ...event.metadata
      });
    }
  }

  setUserContext(context: UserContext): void {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('set', {
        user_id: context.userId,
        user_properties: {
          username: context.username,
          role: context.role
        }
      });
    }
  }
}

/**
 * Custom API Analytics Provider
 * Sends analytics events to a custom backend API
 */
class CustomAPIAnalyticsProvider implements AnalyticsProvider {
  name = 'custom-api';
  private apiEndpoint: string;

  constructor(apiEndpoint: string) {
    this.apiEndpoint = apiEndpoint;
  }

  private async sendToAPI(endpoint: string, data: any): Promise<void> {
    try {
      await fetch(`${this.apiEndpoint}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('[Analytics] Failed to send event to API:', error);
    }
  }

  trackPageView(event: PageViewEvent, userContext?: UserContext): void {
    this.sendToAPI('/analytics/pageview', {
      ...event,
      userContext
    });
  }

  trackEvent(event: AnalyticsEvent, userContext?: UserContext): void {
    this.sendToAPI('/analytics/event', {
      ...event,
      userContext
    });
  }

  setUserContext(_context: UserContext): void {
    // Store user context for subsequent events
    // This could be stored in memory or sent to the API
  }
}

/**
 * Analytics Manager
 * Manages multiple analytics providers and provides a unified interface
 */
class AnalyticsManager {
  private providers: AnalyticsProvider[] = [];
  private userContext: UserContext | null = null;
  private enabled: boolean = true;
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Add an analytics provider
   */
  addProvider(provider: AnalyticsProvider): void {
    this.providers.push(provider);
    
    // Set user context for new provider if available
    if (this.userContext) {
      provider.setUserContext(this.userContext);
    }
  }

  /**
   * Remove an analytics provider by name
   */
  removeProvider(name: string): void {
    this.providers = this.providers.filter(p => p.name !== name);
  }

  /**
   * Set user context for all providers
   */
  setUserContext(context: UserContext): void {
    this.userContext = {
      ...context,
      sessionId: this.sessionId
    };
    
    this.providers.forEach(provider => {
      provider.setUserContext(this.userContext!);
    });
  }

  /**
   * Clear user context (e.g., on logout)
   */
  clearUserContext(): void {
    this.userContext = null;
  }

  /**
   * Track a page view
   */
  trackPageView(path: string, title: string, metadata?: Record<string, any>): void {
    if (!this.enabled) return;

    const event: PageViewEvent = {
      path,
      title,
      referrer: typeof document !== 'undefined' ? document.referrer : undefined,
      metadata
    };

    this.providers.forEach(provider => {
      try {
        provider.trackPageView(event, this.userContext || undefined);
      } catch (error) {
        console.error(`[Analytics] Error in provider ${provider.name}:`, error);
      }
    });
  }

  /**
   * Track a custom event
   */
  trackEvent(
    category: string,
    action: string,
    label?: string,
    value?: number,
    metadata?: Record<string, any>
  ): void {
    if (!this.enabled) return;

    const event: AnalyticsEvent = {
      category,
      action,
      label,
      value,
      metadata
    };

    this.providers.forEach(provider => {
      try {
        provider.trackEvent(event, this.userContext || undefined);
      } catch (error) {
        console.error(`[Analytics] Error in provider ${provider.name}:`, error);
      }
    });
  }

  /**
   * Enable analytics tracking
   */
  enable(): void {
    this.enabled = true;
  }

  /**
   * Disable analytics tracking
   */
  disable(): void {
    this.enabled = false;
  }

  /**
   * Check if analytics is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}

// Create singleton instance
const analytics = new AnalyticsManager();

// Initialize default providers based on environment
if (import.meta.env.DEV) {
  // Use console provider in development
  analytics.addProvider(new ConsoleAnalyticsProvider());
} else {
  // In production, add your analytics providers
  // Example: Google Analytics
  // const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
  // if (GA_MEASUREMENT_ID) {
  //   analytics.addProvider(new GoogleAnalyticsProvider(GA_MEASUREMENT_ID));
  // }
  
  // Example: Custom API
  // const ANALYTICS_API = import.meta.env.VITE_ANALYTICS_API;
  // if (ANALYTICS_API) {
  //   analytics.addProvider(new CustomAPIAnalyticsProvider(ANALYTICS_API));
  // }
  
  // For now, use console provider in production too
  analytics.addProvider(new ConsoleAnalyticsProvider());
}

export default analytics;

// Export provider classes for custom implementations
export {
  ConsoleAnalyticsProvider,
  GoogleAnalyticsProvider,
  CustomAPIAnalyticsProvider,
  AnalyticsManager
};
