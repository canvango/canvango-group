/**
 * SafeContent Component
 * 
 * A component that safely renders user-generated content with XSS protection
 */

import React from 'react';
import { useSafeContent, useSafeHtml } from '../hooks/useSafeContent';

interface SafeContentProps {
  /**
   * Content to display
   */
  content: string | null | undefined;
  
  /**
   * Type of content
   */
  type?: 'text' | 'html' | 'url' | 'email' | 'phone' | 'number';
  
  /**
   * Whether to strip HTML tags
   */
  stripHtml?: boolean;
  
  /**
   * Whether to escape HTML entities
   */
  escapeHtml?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * HTML element to render as
   */
  as?: React.ElementType;
  
  /**
   * Whether to render as HTML (use with caution)
   */
  dangerouslyRenderHtml?: boolean;
}

/**
 * SafeContent component for displaying sanitized user content
 * 
 * @example
 * // Display sanitized text
 * <SafeContent content={userInput} type="text" />
 * 
 * @example
 * // Display sanitized URL
 * <SafeContent content={userUrl} type="url" as="a" />
 * 
 * @example
 * // Display sanitized HTML (use with caution)
 * <SafeContent content={richText} type="html" dangerouslyRenderHtml />
 */
export const SafeContent: React.FC<SafeContentProps> = ({
  content,
  type = 'text',
  stripHtml = false,
  escapeHtml = true,
  className,
  as: Component = 'span',
  dangerouslyRenderHtml = false,
}) => {
  const safeText = useSafeContent(content, { type, stripHtml, escapeHtml });
  const safeHtml = useSafeHtml(content);

  // If rendering as HTML
  if (dangerouslyRenderHtml && type === 'html' && safeHtml) {
    return (
      <Component
        className={className}
        dangerouslySetInnerHTML={safeHtml}
      />
    );
  }

  // For URL type, render as link
  if (type === 'url' && safeText) {
    return (
      <a
        href={safeText}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
      >
        {safeText}
      </a>
    );
  }

  // For email type, render as mailto link
  if (type === 'email' && safeText) {
    return (
      <a
        href={`mailto:${safeText}`}
        className={className}
      >
        {safeText}
      </a>
    );
  }

  // For phone type, render as tel link
  if (type === 'phone' && safeText) {
    return (
      <a
        href={`tel:${safeText}`}
        className={className}
      >
        {safeText}
      </a>
    );
  }

  // Default: render as text
  return (
    <Component className={className}>
      {safeText}
    </Component>
  );
};

export default SafeContent;
