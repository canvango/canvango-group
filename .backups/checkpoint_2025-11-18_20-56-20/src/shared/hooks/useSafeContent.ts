/**
 * useSafeContent Hook
 * 
 * React hook for safely handling and sanitizing user-generated content
 */

import { useMemo } from 'react';
import { isDev } from '../utils/env';
import {
  sanitizeInput,
  sanitizeUrl,
  sanitizeEmail,
  sanitizePhone,
  sanitizeNumber,
  escapeHtml,
  stripHtmlTags,
  createSafeHtml,
  containsDangerousContent,
} from '../utils/xss-prevention';

interface UseSafeContentOptions {
  /**
   * Type of content to sanitize
   */
  type?: 'text' | 'html' | 'url' | 'email' | 'phone' | 'number';
  
  /**
   * Whether to strip HTML tags completely
   */
  stripHtml?: boolean;
  
  /**
   * Whether to escape HTML entities
   */
  escapeHtml?: boolean;
}

/**
 * Hook to safely sanitize content based on type
 */
export const useSafeContent = (
  content: string | null | undefined,
  options: UseSafeContentOptions = {}
): string => {
  const {
    type = 'text',
    stripHtml = false,
    escapeHtml: shouldEscapeHtml = true,
  } = options;

  return useMemo(() => {
    if (!content) return '';

    let sanitized = content;

    // Apply type-specific sanitization
    switch (type) {
      case 'url':
        sanitized = sanitizeUrl(sanitized);
        break;
      
      case 'email':
        sanitized = sanitizeEmail(sanitized);
        break;
      
      case 'phone':
        sanitized = sanitizePhone(sanitized);
        break;
      
      case 'number':
        sanitized = sanitizeNumber(sanitized);
        break;
      
      case 'html':
        // For HTML content, use createSafeHtml
        // This is handled separately in useSafeHtml hook
        sanitized = content;
        break;
      
      case 'text':
      default:
        if (stripHtml) {
          sanitized = stripHtmlTags(sanitized);
        }
        if (shouldEscapeHtml) {
          sanitized = escapeHtml(sanitized);
        } else {
          sanitized = sanitizeInput(sanitized);
        }
        break;
    }

    return sanitized;
  }, [content, type, stripHtml, shouldEscapeHtml]);
};

/**
 * Hook to safely create HTML content for dangerouslySetInnerHTML
 * Only use when absolutely necessary
 */
export const useSafeHtml = (
  html: string | null | undefined
): { __html: string } | null => {
  return useMemo(() => {
    if (!html) return null;
    
    // Warn in development if dangerous content is detected
    if (isDev() && containsDangerousContent(html)) {
      console.warn('Potentially dangerous HTML content detected:', html.substring(0, 100));
    }
    
    return createSafeHtml(html);
  }, [html]);
};

/**
 * Hook to validate if content is safe
 */
export const useIsSafeContent = (content: string | null | undefined): boolean => {
  return useMemo(() => {
    if (!content) return true;
    return !containsDangerousContent(content);
  }, [content]);
};

/**
 * Hook to sanitize multiple fields in an object
 */
export const useSafeObject = <T extends Record<string, any>>(
  obj: T | null | undefined,
  fieldTypes: Partial<Record<keyof T, UseSafeContentOptions['type']>> = {}
): T | null => {
  return useMemo(() => {
    if (!obj) return null;

    const sanitized: any = {};

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        const type = fieldTypes[key] || 'text';

        if (typeof value === 'string') {
          // Sanitize string values
          switch (type) {
            case 'url':
              sanitized[key] = sanitizeUrl(value);
              break;
            case 'email':
              sanitized[key] = sanitizeEmail(value);
              break;
            case 'phone':
              sanitized[key] = sanitizePhone(value);
              break;
            case 'number':
              sanitized[key] = sanitizeNumber(value);
              break;
            default:
              sanitized[key] = sanitizeInput(value);
              break;
          }
        } else {
          // Keep non-string values as-is
          sanitized[key] = value;
        }
      }
    }

    return sanitized as T;
  }, [obj, fieldTypes]);
};

export default useSafeContent;
