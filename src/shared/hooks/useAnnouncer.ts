import { useCallback, useEffect } from 'react';
import { AriaLiveAnnouncer } from '../utils/aria';

/**
 * Hook for announcing messages to screen readers
 */
export const useAnnouncer = () => {
  const announcer = AriaLiveAnnouncer.getInstance();

  const announce = useCallback(
    (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      announcer.announce(message, priority);
    },
    [announcer]
  );

  const announcePolite = useCallback(
    (message: string) => {
      announcer.announcePolite(message);
    },
    [announcer]
  );

  const announceAssertive = useCallback(
    (message: string) => {
      announcer.announceAssertive(message);
    },
    [announcer]
  );

  return {
    announce,
    announcePolite,
    announceAssertive
  };
};

/**
 * Hook for announcing route changes
 */
export const useRouteAnnouncer = (pageName: string) => {
  const { announcePolite } = useAnnouncer();

  useEffect(() => {
    announcePolite(`Navigated to ${pageName}`);
  }, [pageName, announcePolite]);
};
