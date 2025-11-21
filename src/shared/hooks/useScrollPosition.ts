import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

// Store scroll positions for different routes
const scrollPositions: Record<string, number> = {};

export const useScrollPosition = (key?: string) => {
  const location = useLocation();
  const scrollKey = key || location.pathname;
  const isRestoringRef = useRef(false);

  useEffect(() => {
    // Restore scroll position when component mounts
    const savedPosition = scrollPositions[scrollKey];
    if (savedPosition !== undefined && !isRestoringRef.current) {
      isRestoringRef.current = true;
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        window.scrollTo(0, savedPosition);
        isRestoringRef.current = false;
      });
    }

    // Save scroll position when component unmounts or route changes
    return () => {
      scrollPositions[scrollKey] = window.scrollY;
    };
  }, [scrollKey]);
};

export const useSmoothScroll = () => {
  const scrollToTop = (smooth = true) => {
    window.scrollTo({
      top: 0,
      behavior: smooth ? 'smooth' : 'auto'
    });
  };

  const scrollToElement = (elementId: string, offset = 0, smooth = true) => {
    const element = document.getElementById(elementId);
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({
        top,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  };

  const scrollToBottom = (smooth = true) => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto'
    });
  };

  return {
    scrollToTop,
    scrollToElement,
    scrollToBottom
  };
};

export const useScrollDirection = () => {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY.current) {
        setScrollDirection('down');
      } else if (currentScrollY < lastScrollY.current) {
        setScrollDirection('up');
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollDirection;
};

export const useScrollThreshold = (threshold = 100) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > threshold);
    };

    handleScroll(); // Check initial state
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return isScrolled;
};
