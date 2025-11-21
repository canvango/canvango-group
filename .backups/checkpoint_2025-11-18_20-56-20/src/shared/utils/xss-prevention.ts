/**
 * XSS Prevention Utilities
 * 
 * Provides utilities for sanitizing user input and preventing
 * Cross-Site Scripting (XSS) attacks.
 * 
 * Note: React provides built-in XSS protection by escaping content
 * in JSX. These utilities are for additional protection when dealing
 * with user-generated content or when using dangerouslySetInnerHTML.
 */

/**
 * HTML entities that need to be escaped
 */
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

/**
 * Escape HTML special characters to prevent XSS
 * Use this when displaying user-generated content
 */
export const escapeHtml = (text: string): string => {
  return text.replace(/[&<>"'/]/g, (char) => HTML_ENTITIES[char] || char);
};

/**
 * Remove all HTML tags from a string
 * Useful for plain text display
 */
export const stripHtmlTags = (html: string): string => {
  return html.replace(/<[^>]*>/g, '');
};

/**
 * Sanitize URL to prevent javascript: and data: protocols
 * Returns empty string if URL is potentially dangerous
 */
export const sanitizeUrl = (url: string): string => {
  if (!url) return '';
  
  const trimmedUrl = url.trim().toLowerCase();
  
  // Block dangerous protocols
  const dangerousProtocols = [
    'javascript:',
    'data:text/html',
    'vbscript:',
    'file:',
    'about:',
  ];
  
  for (const protocol of dangerousProtocols) {
    if (trimmedUrl.startsWith(protocol)) {
      console.warn('Blocked potentially dangerous URL:', url);
      return '';
    }
  }
  
  // Allow http, https, mailto, tel, and relative URLs
  if (
    trimmedUrl.startsWith('http://') ||
    trimmedUrl.startsWith('https://') ||
    trimmedUrl.startsWith('mailto:') ||
    trimmedUrl.startsWith('tel:') ||
    trimmedUrl.startsWith('/') ||
    trimmedUrl.startsWith('#') ||
    trimmedUrl.startsWith('?')
  ) {
    return url;
  }
  
  // If no protocol, assume relative URL
  if (!trimmedUrl.includes(':')) {
    return url;
  }
  
  // Block unknown protocols
  console.warn('Blocked URL with unknown protocol:', url);
  return '';
};

/**
 * Sanitize user input for safe display
 * Removes dangerous characters and patterns
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  let sanitized = input;
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');
  
  // Remove control characters except newlines and tabs
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Escape HTML entities
  sanitized = escapeHtml(sanitized);
  
  return sanitized;
};

/**
 * Validate and sanitize email addresses
 */
export const sanitizeEmail = (email: string): string => {
  if (!email) return '';
  
  // Remove whitespace
  let sanitized = email.trim();
  
  // Basic email validation pattern
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailPattern.test(sanitized)) {
    return '';
  }
  
  // Convert to lowercase
  sanitized = sanitized.toLowerCase();
  
  // Remove any HTML entities
  sanitized = sanitized.replace(/[<>"']/g, '');
  
  return sanitized;
};

/**
 * Sanitize phone numbers
 */
export const sanitizePhone = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-digit characters except + at the start
  let sanitized = phone.trim();
  
  // Allow + at the start for international numbers
  if (sanitized.startsWith('+')) {
    sanitized = '+' + sanitized.slice(1).replace(/\D/g, '');
  } else {
    sanitized = sanitized.replace(/\D/g, '');
  }
  
  return sanitized;
};

/**
 * Sanitize numeric input
 */
export const sanitizeNumber = (value: string): string => {
  if (!value) return '';
  
  // Remove all non-numeric characters except decimal point and minus
  let sanitized = value.replace(/[^\d.-]/g, '');
  
  // Ensure only one decimal point
  const parts = sanitized.split('.');
  if (parts.length > 2) {
    sanitized = parts[0] + '.' + parts.slice(1).join('');
  }
  
  // Ensure minus only at the start
  if (sanitized.includes('-')) {
    const isNegative = sanitized.startsWith('-');
    sanitized = sanitized.replace(/-/g, '');
    if (isNegative) {
      sanitized = '-' + sanitized;
    }
  }
  
  return sanitized;
};

/**
 * Sanitize filename to prevent directory traversal
 */
export const sanitizeFilename = (filename: string): string => {
  if (!filename) return '';
  
  let sanitized = filename;
  
  // Remove path separators
  sanitized = sanitized.replace(/[/\\]/g, '');
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');
  
  // Remove control characters
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
  
  // Remove leading dots (hidden files)
  sanitized = sanitized.replace(/^\.+/, '');
  
  // Limit length
  if (sanitized.length > 255) {
    sanitized = sanitized.substring(0, 255);
  }
  
  return sanitized;
};

/**
 * Check if a string contains potentially dangerous content
 */
export const containsDangerousContent = (content: string): boolean => {
  if (!content) return false;
  
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // Event handlers like onclick=
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /<link/i,
    /<meta/i,
    /data:text\/html/i,
    /vbscript:/i,
  ];
  
  return dangerousPatterns.some(pattern => pattern.test(content));
};

/**
 * Sanitize object keys to prevent prototype pollution
 */
export const sanitizeObjectKeys = <T extends Record<string, any>>(obj: T): T => {
  const sanitized: any = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // Skip dangerous keys
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }
      
      sanitized[key] = obj[key];
    }
  }
  
  return sanitized;
};

/**
 * Create a safe HTML string for use with dangerouslySetInnerHTML
 * Only use this when absolutely necessary and with trusted content
 * 
 * @param html - HTML string to sanitize
 * @returns Object with __html property for React
 */
export const createSafeHtml = (html: string): { __html: string } => {
  // Remove script tags and their content
  let safe = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers
  safe = safe.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  safe = safe.replace(/on\w+\s*=\s*[^\s>]*/gi, '');
  
  // Remove javascript: and data: protocols
  safe = safe.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"');
  safe = safe.replace(/src\s*=\s*["']javascript:[^"']*["']/gi, 'src=""');
  safe = safe.replace(/href\s*=\s*["']data:text\/html[^"']*["']/gi, 'href="#"');
  
  // Remove dangerous tags
  const dangerousTags = ['iframe', 'object', 'embed', 'link', 'meta', 'style'];
  dangerousTags.forEach(tag => {
    const regex = new RegExp(`<${tag}\\b[^<]*(?:(?!<\\/${tag}>)<[^<]*)*<\\/${tag}>`, 'gi');
    safe = safe.replace(regex, '');
  });
  
  return { __html: safe };
};

/**
 * Validate that content is safe for display
 * Throws an error if dangerous content is detected
 */
export const assertSafeContent = (content: string, fieldName: string = 'Content'): void => {
  if (containsDangerousContent(content)) {
    throw new Error(`${fieldName} contains potentially dangerous content`);
  }
};
