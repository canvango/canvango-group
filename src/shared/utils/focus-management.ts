/**
 * Focus Management Utilities
 * Provides utilities for managing focus in accessible applications
 */

/**
 * Get all focusable elements within a container
 */
export const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(', ');

  return Array.from(container.querySelectorAll<HTMLElement>(selector));
};

/**
 * Get the first focusable element within a container
 */
export const getFirstFocusableElement = (container: HTMLElement): HTMLElement | null => {
  const elements = getFocusableElements(container);
  return elements[0] || null;
};

/**
 * Get the last focusable element within a container
 */
export const getLastFocusableElement = (container: HTMLElement): HTMLElement | null => {
  const elements = getFocusableElements(container);
  return elements[elements.length - 1] || null;
};

/**
 * Check if an element is focusable
 */
export const isFocusable = (element: HTMLElement): boolean => {
  if (element.hasAttribute('disabled')) return false;
  if (element.getAttribute('tabindex') === '-1') return false;
  
  const focusableElements = [
    'A',
    'BUTTON',
    'INPUT',
    'TEXTAREA',
    'SELECT'
  ];

  return (
    focusableElements.includes(element.tagName) ||
    element.hasAttribute('tabindex') ||
    element.getAttribute('contenteditable') === 'true'
  );
};

/**
 * Focus the first element in a container
 */
export const focusFirstElement = (container: HTMLElement): void => {
  const firstElement = getFirstFocusableElement(container);
  firstElement?.focus();
};

/**
 * Focus the last element in a container
 */
export const focusLastElement = (container: HTMLElement): void => {
  const lastElement = getLastFocusableElement(container);
  lastElement?.focus();
};

/**
 * Create a focus trap within a container
 */
export const createFocusTrap = (container: HTMLElement): (() => void) => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    const focusableElements = getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

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

  container.addEventListener('keydown', handleKeyDown);

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
};

/**
 * Save and restore focus
 */
export class FocusManager {
  private previousFocus: HTMLElement | null = null;

  saveFocus(): void {
    this.previousFocus = document.activeElement as HTMLElement;
  }

  restoreFocus(): void {
    if (this.previousFocus && typeof this.previousFocus.focus === 'function') {
      this.previousFocus.focus();
    }
  }

  clear(): void {
    this.previousFocus = null;
  }
}

/**
 * Skip to main content functionality
 */
export const createSkipLink = (): HTMLAnchorElement => {
  const skipLink = document.createElement('a');
  skipLink.href = '#main-content';
  skipLink.textContent = 'Skip to main content';
  skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg';
  
  skipLink.addEventListener('click', (e) => {
    e.preventDefault();
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
    }
  });

  return skipLink;
};
