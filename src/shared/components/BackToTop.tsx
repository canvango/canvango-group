import React from 'react';
import { ArrowUp } from 'lucide-react';
import { useScrollThreshold, useSmoothScroll } from '../hooks/useScrollPosition';

interface BackToTopProps {
  threshold?: number;
  className?: string;
}

export const BackToTop: React.FC<BackToTopProps> = ({ 
  threshold = 300,
  className = ''
}) => {
  const isScrolled = useScrollThreshold(threshold);
  const { scrollToTop } = useSmoothScroll();

  if (!isScrolled) return null;

  return (
    <button
      onClick={() => scrollToTop()}
      className={`fixed bottom-20 right-6 z-40 p-3 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 animate-fade-in ${className}`}
      aria-label="Back to top"
      title="Back to top"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
};
