import { useState, useCallback } from 'react';

export interface UseCopyToClipboardReturn {
  /**
   * Whether the text was successfully copied
   */
  copied: boolean;
  /**
   * Copy text to clipboard
   * @param text - The text to copy
   * @returns Promise that resolves to true if successful, false otherwise
   */
  copyToClipboard: (text: string) => Promise<boolean>;
  /**
   * Reset the copied state
   */
  reset: () => void;
}

/**
 * Custom hook for copying text to clipboard with success feedback
 * 
 * Features:
 * - Uses modern Clipboard API with fallback for older browsers
 * - Provides success state that auto-resets after 2 seconds
 * - Handles errors gracefully
 * 
 * @param resetDelay - Time in milliseconds before resetting copied state (default: 2000)
 * @returns Object with copied state, copyToClipboard function, and reset function
 * 
 * @example
 * ```tsx
 * const { copied, copyToClipboard } = useCopyToClipboard();
 * 
 * return (
 *   <button onClick={() => copyToClipboard('Hello World')}>
 *     {copied ? 'Copied!' : 'Copy'}
 *   </button>
 * );
 * ```
 */
export const useCopyToClipboard = (resetDelay: number = 2000): UseCopyToClipboardReturn => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(async (text: string): Promise<boolean> => {
    try {
      // Try modern Clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        
        // Auto-reset after delay
        setTimeout(() => setCopied(false), resetDelay);
        
        return true;
      } else {
        // Fallback for older browsers or non-secure contexts
        return fallbackCopyToClipboard(text, resetDelay, setCopied);
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      
      // Try fallback method if modern API fails
      return fallbackCopyToClipboard(text, resetDelay, setCopied);
    }
  }, [resetDelay]);

  const reset = useCallback(() => {
    setCopied(false);
  }, []);

  return {
    copied,
    copyToClipboard,
    reset,
  };
};

/**
 * Fallback method for copying text to clipboard using execCommand
 * Works in older browsers and non-secure contexts
 */
function fallbackCopyToClipboard(
  text: string,
  resetDelay: number,
  setCopied: (value: boolean) => void
): boolean {
  try {
    // Create temporary textarea element
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Make it invisible and non-interactive
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    textArea.setAttribute('readonly', '');
    textArea.setAttribute('aria-hidden', 'true');
    
    document.body.appendChild(textArea);
    
    // Select and copy
    textArea.focus();
    textArea.select();
    
    const success = document.execCommand('copy');
    
    // Clean up
    document.body.removeChild(textArea);
    
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), resetDelay);
    }
    
    return success;
  } catch (error) {
    console.error('Fallback copy failed:', error);
    return false;
  }
}
