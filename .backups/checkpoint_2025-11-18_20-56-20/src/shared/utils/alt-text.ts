/**
 * Alt Text Utilities
 * Provides utilities for generating descriptive alt text for images
 */

/**
 * Generate alt text for product images
 */
export const productImageAlt = (productName: string, category?: string): string => {
  if (category) {
    return `${productName} - ${category} product image`;
  }
  return `${productName} product image`;
};

/**
 * Generate alt text for user avatars
 */
export const avatarAlt = (username: string): string => {
  return `${username}'s profile picture`;
};

/**
 * Generate alt text for logos
 */
export const logoAlt = (companyName: string): string => {
  return `${companyName} logo`;
};

/**
 * Generate alt text for icons that convey meaning
 */
export const iconAlt = (action: string, context?: string): string => {
  if (context) {
    return `${action} ${context}`;
  }
  return action;
};

/**
 * Generate alt text for status indicators
 */
export const statusImageAlt = (status: string, item?: string): string => {
  if (item) {
    return `${status} status for ${item}`;
  }
  return `${status} status`;
};

/**
 * Generate alt text for charts and graphs
 */
export const chartAlt = (chartType: string, dataDescription: string): string => {
  return `${chartType} showing ${dataDescription}`;
};

/**
 * Generate alt text for thumbnails
 */
export const thumbnailAlt = (title: string, type: string = 'content'): string => {
  return `Thumbnail for ${title} ${type}`;
};

/**
 * Check if an image is decorative (should have empty alt)
 */
export const isDecorativeImage = (_context: 'icon-with-text' | 'background' | 'border' | 'spacer'): boolean => {
  return true; // All these contexts are decorative
};

/**
 * Get appropriate alt text or empty string for decorative images
 */
export const getAltText = (
  isDecorative: boolean,
  descriptiveAlt?: string
): string => {
  return isDecorative ? '' : (descriptiveAlt || '');
};

/**
 * Alt text best practices
 */
export const altTextGuidelines = {
  /**
   * Maximum recommended length for alt text
   */
  maxLength: 125,

  /**
   * Check if alt text is too long
   */
  isTooLong: (alt: string): boolean => {
    return alt.length > altTextGuidelines.maxLength;
  },

  /**
   * Truncate alt text if too long
   */
  truncate: (alt: string): string => {
    if (alt.length <= altTextGuidelines.maxLength) {
      return alt;
    }
    return alt.substring(0, altTextGuidelines.maxLength - 3) + '...';
  },

  /**
   * Validate alt text
   */
  validate: (alt: string): {
    isValid: boolean;
    warnings: string[];
  } => {
    const warnings: string[] = [];

    if (!alt || alt.trim() === '') {
      warnings.push('Alt text is empty. Use empty string only for decorative images.');
    }

    if (alt.toLowerCase().startsWith('image of') || alt.toLowerCase().startsWith('picture of')) {
      warnings.push('Avoid starting with "image of" or "picture of"');
    }

    if (altTextGuidelines.isTooLong(alt)) {
      warnings.push(`Alt text is too long (${alt.length} characters). Keep it under ${altTextGuidelines.maxLength} characters.`);
    }

    if (alt.includes('  ')) {
      warnings.push('Alt text contains multiple consecutive spaces');
    }

    return {
      isValid: warnings.length === 0,
      warnings
    };
  }
};

/**
 * Common alt text patterns
 */
export const commonAltText = {
  // Decorative (empty alt)
  decorative: '',

  // Loading states
  loading: 'Loading',
  spinner: 'Loading indicator',

  // Actions
  close: 'Close',
  menu: 'Menu',
  search: 'Search',
  filter: 'Filter',
  sort: 'Sort',
  edit: 'Edit',
  delete: 'Delete',
  download: 'Download',
  upload: 'Upload',
  refresh: 'Refresh',

  // Navigation
  previous: 'Previous',
  next: 'Next',
  home: 'Home',
  back: 'Back',

  // Social
  facebook: 'Facebook',
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  twitter: 'Twitter',

  // Status
  success: 'Success',
  error: 'Error',
  warning: 'Warning',
  info: 'Information'
};

/**
 * Generate alt text for complex images
 */
export const complexImageAlt = {
  /**
   * For images that need long descriptions
   * Returns short alt and suggests using aria-describedby for full description
   */
  withLongDescription: (shortAlt: string, longDescriptionId: string): {
    alt: string;
    ariaDescribedby: string;
  } => {
    return {
      alt: shortAlt,
      ariaDescribedby: longDescriptionId
    };
  },

  /**
   * For images with text
   */
  withText: (imageDescription: string, textContent: string): string => {
    return `${imageDescription}. Text reads: ${textContent}`;
  },

  /**
   * For linked images
   */
  linkedImage: (imageDescription: string, linkDestination: string): string => {
    return `${imageDescription}. Link to ${linkDestination}`;
  }
};
