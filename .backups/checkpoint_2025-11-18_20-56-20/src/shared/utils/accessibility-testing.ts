/**
 * Accessibility Testing Utilities
 * Provides utilities for testing and validating accessibility in development
 */

/**
 * Check if an element has proper focus indicators
 */
export const hasFocusIndicator = (element: HTMLElement): boolean => {
  const styles = window.getComputedStyle(element);
  const pseudoStyles = window.getComputedStyle(element, ':focus');
  
  // Check for outline, box-shadow, or border changes on focus
  return (
    styles.outline !== 'none' ||
    pseudoStyles.outline !== 'none' ||
    pseudoStyles.boxShadow !== 'none' ||
    pseudoStyles.borderColor !== styles.borderColor
  );
};

/**
 * Check if interactive elements have minimum touch target size
 */
export const hasMinimumTouchTarget = (element: HTMLElement): boolean => {
  const rect = element.getBoundingClientRect();
  const minSize = 44; // WCAG 2.1 Level AAA: 44x44 pixels
  
  return rect.width >= minSize && rect.height >= minSize;
};

/**
 * Check if an image has alt text
 */
export const hasAltText = (img: HTMLImageElement): boolean => {
  return img.hasAttribute('alt');
};

/**
 * Check if a form input has an associated label
 */
export const hasAssociatedLabel = (input: HTMLInputElement): boolean => {
  // Check for explicit label association
  if (input.id) {
    const label = document.querySelector(`label[for="${input.id}"]`);
    if (label) return true;
  }
  
  // Check for implicit label (input wrapped in label)
  const parentLabel = input.closest('label');
  if (parentLabel) return true;
  
  // Check for aria-label or aria-labelledby
  return input.hasAttribute('aria-label') || input.hasAttribute('aria-labelledby');
};

/**
 * Check if an element has proper ARIA attributes
 */
export const hasProperAria = (element: HTMLElement): {
  valid: boolean;
  issues: string[];
} => {
  const issues: string[] = [];
  
  // Check for aria-hidden on focusable elements
  if (element.hasAttribute('aria-hidden') && element.getAttribute('aria-hidden') === 'true') {
    if (element.tabIndex >= 0) {
      issues.push('Focusable element should not have aria-hidden="true"');
    }
  }
  
  // Check for aria-label on non-interactive elements
  const interactiveTags = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'];
  if (element.hasAttribute('aria-label') && !interactiveTags.includes(element.tagName)) {
    const role = element.getAttribute('role');
    if (!role || !['button', 'link', 'textbox', 'combobox'].includes(role)) {
      issues.push('aria-label should only be used on interactive elements');
    }
  }
  
  // Check for required ARIA attributes based on role
  const role = element.getAttribute('role');
  if (role === 'button' && element.tagName !== 'BUTTON') {
    if (!element.hasAttribute('tabindex')) {
      issues.push('Elements with role="button" should have tabindex');
    }
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
};

/**
 * Check heading hierarchy
 */
export const checkHeadingHierarchy = (container: HTMLElement = document.body): {
  valid: boolean;
  issues: string[];
} => {
  const headings = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  const issues: string[] = [];
  let previousLevel = 0;
  
  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.substring(1));
    
    // Check for h1
    if (index === 0 && level !== 1) {
      issues.push('Page should start with h1');
    }
    
    // Check for skipped levels
    if (level > previousLevel + 1) {
      issues.push(`Heading level skipped: h${previousLevel} to h${level}`);
    }
    
    previousLevel = level;
  });
  
  return {
    valid: issues.length === 0,
    issues
  };
};

/**
 * Check for keyboard traps
 */
export const checkKeyboardTrap = async (container: HTMLElement): Promise<boolean> => {
  const focusableElements = container.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  if (focusableElements.length === 0) return true;
  
  // Focus first element
  focusableElements[0].focus();
  
  // Simulate Tab key presses
  for (let i = 0; i < focusableElements.length * 2; i++) {
    const activeElement = document.activeElement;
    
    // Check if focus is still within container
    if (!container.contains(activeElement)) {
      return false; // Focus escaped, which is good
    }
    
    // Simulate Tab
    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
    activeElement?.dispatchEvent(event);
    
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  
  return true; // No trap detected
};

/**
 * Accessibility audit for a component
 */
export const auditAccessibility = (element: HTMLElement): {
  passed: boolean;
  warnings: string[];
  errors: string[];
} => {
  const warnings: string[] = [];
  const errors: string[] = [];
  
  // Check interactive elements
  const interactiveElements = element.querySelectorAll<HTMLElement>(
    'button, a, input, select, textarea, [role="button"], [role="link"]'
  );
  
  interactiveElements.forEach((el) => {
    // Check touch target size
    if (!hasMinimumTouchTarget(el)) {
      warnings.push(`Element ${el.tagName} does not meet minimum touch target size (44x44px)`);
    }
    
    // Check for accessible name
    const hasAccessibleName = 
      el.textContent?.trim() ||
      el.hasAttribute('aria-label') ||
      el.hasAttribute('aria-labelledby') ||
      (el instanceof HTMLInputElement && hasAssociatedLabel(el));
    
    if (!hasAccessibleName) {
      errors.push(`Interactive element ${el.tagName} does not have an accessible name`);
    }
  });
  
  // Check images
  const images = element.querySelectorAll<HTMLImageElement>('img');
  images.forEach((img) => {
    if (!hasAltText(img)) {
      errors.push(`Image missing alt attribute: ${img.src}`);
    }
  });
  
  // Check form inputs
  const inputs = element.querySelectorAll<HTMLInputElement>('input, select, textarea');
  inputs.forEach((input) => {
    if (!hasAssociatedLabel(input)) {
      errors.push(`Form input missing label: ${input.name || input.id || 'unknown'}`);
    }
  });
  
  // Check heading hierarchy
  const headingCheck = checkHeadingHierarchy(element);
  if (!headingCheck.valid) {
    warnings.push(...headingCheck.issues);
  }
  
  return {
    passed: errors.length === 0,
    warnings,
    errors
  };
};

/**
 * Log accessibility issues to console (development only)
 */
import { isDev } from './env';

export const logAccessibilityIssues = (element: HTMLElement, componentName?: string): void => {
  if (!isDev()) return;
  
  const audit = auditAccessibility(element);
  
  if (audit.errors.length > 0 || audit.warnings.length > 0) {
    console.group(`♿ Accessibility Issues${componentName ? ` in ${componentName}` : ''}`);
    
    if (audit.errors.length > 0) {
      console.error('Errors:', audit.errors);
    }
    
    if (audit.warnings.length > 0) {
      console.warn('Warnings:', audit.warnings);
    }
    
    console.groupEnd();
  }
};

/**
 * React hook for accessibility testing in development
 */
export const useAccessibilityAudit = (
  ref: React.RefObject<HTMLElement>,
  componentName?: string
) => {
  React.useEffect(() => {
    if (!isDev()) return;
    
    const element = ref.current;
    if (!element) return;
    
    // Run audit after a short delay to allow component to fully render
    const timer = setTimeout(() => {
      logAccessibilityIssues(element, componentName);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [ref, componentName]);
};

// Make React available for the hook
import React from 'react';
