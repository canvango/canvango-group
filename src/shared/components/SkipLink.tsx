import React from 'react';

export interface SkipLinkProps {
  href?: string;
  children?: React.ReactNode;
}

/**
 * SkipLink component for keyboard navigation
 * Allows users to skip to main content
 */
const SkipLink: React.FC<SkipLinkProps> = ({
  href = '#main-content',
  children = 'Skip to main content'
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    const target = document.getElementById(targetId);
    
    if (target) {
      // Set tabindex to make it focusable
      target.setAttribute('tabindex', '-1');
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      // Remove tabindex after focus
      target.addEventListener('blur', () => {
        target.removeAttribute('tabindex');
      }, { once: true });
    }
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className="
        sr-only
        focus:not-sr-only
        focus:absolute
        focus:top-4
        focus:left-4
        focus:z-[100]
        focus:px-4
        focus:py-2
        focus:bg-primary-600
        focus:text-white
        focus:rounded-lg
        focus:shadow-lg
        focus:outline-none
        focus:ring-2
        focus:ring-primary-500
        focus:ring-offset-2
        transition-all
      "
    >
      {children}
    </a>
  );
};

export default SkipLink;
