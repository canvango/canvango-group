/**
 * ARIA Utilities
 * Provides utilities for managing ARIA attributes and accessibility
 */

/**
 * Generate a unique ID for ARIA relationships
 */
export const generateAriaId = (prefix: string = 'aria'): string => {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * ARIA live region announcer
 * Announces dynamic content changes to screen readers
 */
export class AriaLiveAnnouncer {
  private static instance: AriaLiveAnnouncer;
  private liveRegion: HTMLDivElement | null = null;

  private constructor() {
    this.createLiveRegion();
  }

  static getInstance(): AriaLiveAnnouncer {
    if (!AriaLiveAnnouncer.instance) {
      AriaLiveAnnouncer.instance = new AriaLiveAnnouncer();
    }
    return AriaLiveAnnouncer.instance;
  }

  private createLiveRegion(): void {
    if (typeof document === 'undefined') return;

    this.liveRegion = document.createElement('div');
    this.liveRegion.setAttribute('role', 'status');
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.className = 'sr-only';
    document.body.appendChild(this.liveRegion);
  }

  /**
   * Announce a message to screen readers
   */
  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (!this.liveRegion) return;

    this.liveRegion.setAttribute('aria-live', priority);
    this.liveRegion.textContent = message;

    // Clear after announcement
    setTimeout(() => {
      if (this.liveRegion) {
        this.liveRegion.textContent = '';
      }
    }, 1000);
  }

  /**
   * Announce with assertive priority (interrupts current announcements)
   */
  announceAssertive(message: string): void {
    this.announce(message, 'assertive');
  }

  /**
   * Announce with polite priority (waits for current announcements)
   */
  announcePolite(message: string): void {
    this.announce(message, 'polite');
  }
}

/**
 * Hook-friendly announcer function
 */
export const announce = (message: string, priority: 'polite' | 'assertive' = 'polite'): void => {
  AriaLiveAnnouncer.getInstance().announce(message, priority);
};

/**
 * ARIA label helpers
 */
export const ariaLabel = {
  /**
   * Create label for button with icon only
   */
  iconButton: (action: string, context?: string): string => {
    return context ? `${action} ${context}` : action;
  },

  /**
   * Create label for navigation
   */
  navigation: (location: string): string => {
    return `Navigate to ${location}`;
  },

  /**
   * Create label for close button
   */
  close: (context?: string): string => {
    return context ? `Close ${context}` : 'Close';
  },

  /**
   * Create label for delete/remove action
   */
  delete: (item: string): string => {
    return `Delete ${item}`;
  },

  /**
   * Create label for edit action
   */
  edit: (item: string): string => {
    return `Edit ${item}`;
  },

  /**
   * Create label for view action
   */
  view: (item: string): string => {
    return `View ${item}`;
  },

  /**
   * Create label for loading state
   */
  loading: (context?: string): string => {
    return context ? `Loading ${context}` : 'Loading';
  },

  /**
   * Create label for pagination
   */
  pagination: {
    page: (pageNumber: number): string => `Go to page ${pageNumber}`,
    next: (): string => 'Go to next page',
    previous: (): string => 'Go to previous page',
    first: (): string => 'Go to first page',
    last: (): string => 'Go to last page'
  },

  /**
   * Create label for sort
   */
  sort: (column: string, direction?: 'asc' | 'desc'): string => {
    if (direction) {
      return `Sort by ${column} in ${direction === 'asc' ? 'ascending' : 'descending'} order`;
    }
    return `Sort by ${column}`;
  },

  /**
   * Create label for filter
   */
  filter: (filterName: string): string => {
    return `Filter by ${filterName}`;
  },

  /**
   * Create label for search
   */
  search: (context?: string): string => {
    return context ? `Search ${context}` : 'Search';
  }
};

/**
 * ARIA describedby helpers
 */
export const ariaDescribedBy = {
  /**
   * Combine multiple IDs for aria-describedby
   */
  combine: (...ids: (string | undefined)[]): string | undefined => {
    const validIds = ids.filter(Boolean);
    return validIds.length > 0 ? validIds.join(' ') : undefined;
  }
};

/**
 * ARIA expanded state helper
 */
export const ariaExpanded = (isExpanded: boolean): 'true' | 'false' => {
  return isExpanded ? 'true' : 'false';
};

/**
 * ARIA selected state helper
 */
export const ariaSelected = (isSelected: boolean): 'true' | 'false' => {
  return isSelected ? 'true' : 'false';
};

/**
 * ARIA checked state helper
 */
export const ariaChecked = (isChecked: boolean | 'mixed'): 'true' | 'false' | 'mixed' => {
  if (isChecked === 'mixed') return 'mixed';
  return isChecked ? 'true' : 'false';
};

/**
 * ARIA pressed state helper
 */
export const ariaPressed = (isPressed: boolean): 'true' | 'false' => {
  return isPressed ? 'true' : 'false';
};

/**
 * ARIA invalid state helper
 */
export const ariaInvalid = (isInvalid: boolean): 'true' | 'false' | undefined => {
  return isInvalid ? 'true' : undefined;
};

/**
 * ARIA required state helper
 */
export const ariaRequired = (isRequired: boolean): 'true' | 'false' | undefined => {
  return isRequired ? 'true' : undefined;
};

/**
 * ARIA disabled state helper
 */
export const ariaDisabled = (isDisabled: boolean): 'true' | 'false' | undefined => {
  return isDisabled ? 'true' : undefined;
};

/**
 * ARIA hidden helper
 */
export const ariaHidden = (isHidden: boolean): 'true' | 'false' | undefined => {
  return isHidden ? 'true' : undefined;
};

/**
 * Screen reader only class name
 */
export const srOnlyClass = 'sr-only';
