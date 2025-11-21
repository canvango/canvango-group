import React from 'react';
import { Copy, Check } from 'lucide-react';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import Button from './Button';

export interface CopyButtonProps {
  /**
   * The text to copy to clipboard
   */
  text: string;
  /**
   * Button variant
   */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  /**
   * Button size
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Label to show when not copied
   */
  label?: string;
  /**
   * Label to show when copied
   */
  copiedLabel?: string;
  /**
   * Show icon only (no text)
   */
  iconOnly?: boolean;
  /**
   * Custom aria-label
   */
  ariaLabel?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Callback when copy is successful
   */
  onCopy?: () => void;
  /**
   * Callback when copy fails
   */
  onError?: (error: Error) => void;
}

/**
 * Reusable copy-to-clipboard button component
 * 
 * @example
 * ```tsx
 * // Icon only button
 * <CopyButton text="API_KEY_123" iconOnly />
 * 
 * // Button with label
 * <CopyButton text="API_KEY_123" label="Copy Key" />
 * 
 * // Custom variant and size
 * <CopyButton 
 *   text="API_KEY_123" 
 *   variant="outline" 
 *   size="sm"
 *   label="Copy"
 * />
 * ```
 */
export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  variant = 'outline',
  size = 'md',
  label = 'Copy',
  copiedLabel = 'Copied!',
  iconOnly = false,
  ariaLabel,
  className = '',
  onCopy,
  onError,
}) => {
  const { copied, copyToClipboard } = useCopyToClipboard();

  const handleCopy = async () => {
    try {
      const success = await copyToClipboard(text);
      if (success && onCopy) {
        onCopy();
      } else if (!success && onError) {
        onError(new Error('Failed to copy to clipboard'));
      }
    } catch (error) {
      if (onError) {
        onError(error as Error);
      }
    }
  };

  const getAriaLabel = () => {
    if (ariaLabel) return ariaLabel;
    if (copied) return copiedLabel;
    return label;
  };

  if (iconOnly) {
    return (
      <button
        onClick={handleCopy}
        disabled={copied}
        className={`p-2 text-gray-400 hover:text-primary-600 transition-colors disabled:opacity-50 ${className}`}
        aria-label={getAriaLabel()}
        title={getAriaLabel()}
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-600" aria-hidden="true" />
        ) : (
          <Copy className="w-4 h-4" aria-hidden="true" />
        )}
      </button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      disabled={copied}
      aria-label={getAriaLabel()}
      className={className}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 mr-2" aria-hidden="true" />
          {copiedLabel}
        </>
      ) : (
        <>
          <Copy className="w-4 h-4 mr-2" aria-hidden="true" />
          {label}
        </>
      )}
    </Button>
  );
};

export default CopyButton;
