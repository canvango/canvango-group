import { useEffect, useCallback, RefObject } from 'react';

export interface KeyboardNavigationOptions {
  onEnter?: () => void;
  onEscape?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onTab?: (e: KeyboardEvent) => void;
  onSpace?: () => void;
  enabled?: boolean;
}

/**
 * Hook for handling keyboard navigation
 * Provides consistent keyboard interaction patterns across components
 */
export const useKeyboardNavigation = (
  ref: RefObject<HTMLElement>,
  options: KeyboardNavigationOptions
) => {
  const {
    onEnter,
    onEscape,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onTab,
    onSpace,
    enabled = true
  } = options;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      switch (e.key) {
        case 'Enter':
          if (onEnter) {
            e.preventDefault();
            onEnter();
          }
          break;
        case 'Escape':
          if (onEscape) {
            e.preventDefault();
            onEscape();
          }
          break;
        case 'ArrowUp':
          if (onArrowUp) {
            e.preventDefault();
            onArrowUp();
          }
          break;
        case 'ArrowDown':
          if (onArrowDown) {
            e.preventDefault();
            onArrowDown();
          }
          break;
        case 'ArrowLeft':
          if (onArrowLeft) {
            e.preventDefault();
            onArrowLeft();
          }
          break;
        case 'ArrowRight':
          if (onArrowRight) {
            e.preventDefault();
            onArrowRight();
          }
          break;
        case 'Tab':
          if (onTab) {
            onTab(e);
          }
          break;
        case ' ':
          if (onSpace) {
            e.preventDefault();
            onSpace();
          }
          break;
      }
    },
    [enabled, onEnter, onEscape, onArrowUp, onArrowDown, onArrowLeft, onArrowRight, onTab, onSpace]
  );

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.addEventListener('keydown', handleKeyDown as EventListener);
    return () => {
      element.removeEventListener('keydown', handleKeyDown as EventListener);
    };
  }, [ref, handleKeyDown]);
};

/**
 * Hook for managing focus trap within a container
 * Useful for modals and dialogs
 */
export const useFocusTrap = (
  containerRef: RefObject<HTMLElement>,
  isActive: boolean = true
) => {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    
    // Focus first element on mount
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [containerRef, isActive]);
};

/**
 * Hook for managing roving tabindex in lists
 * Allows arrow key navigation through list items
 */
export const useRovingTabIndex = (
  containerRef: RefObject<HTMLElement>,
  itemSelector: string = '[role="option"], [role="menuitem"], [role="tab"]'
) => {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let currentIndex = 0;
    const items = Array.from(container.querySelectorAll<HTMLElement>(itemSelector));

    const updateTabIndex = (index: number) => {
      items.forEach((item, i) => {
        item.setAttribute('tabindex', i === index ? '0' : '-1');
      });
      items[index]?.focus();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (!items.includes(target)) return;

      currentIndex = items.indexOf(target);

      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault();
          currentIndex = (currentIndex + 1) % items.length;
          updateTabIndex(currentIndex);
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault();
          currentIndex = (currentIndex - 1 + items.length) % items.length;
          updateTabIndex(currentIndex);
          break;
        case 'Home':
          e.preventDefault();
          currentIndex = 0;
          updateTabIndex(currentIndex);
          break;
        case 'End':
          e.preventDefault();
          currentIndex = items.length - 1;
          updateTabIndex(currentIndex);
          break;
      }
    };

    // Initialize tabindex
    updateTabIndex(0);

    container.addEventListener('keydown', handleKeyDown);
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [containerRef, itemSelector]);
};
