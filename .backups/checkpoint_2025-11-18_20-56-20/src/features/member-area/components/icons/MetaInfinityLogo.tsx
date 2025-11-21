import React from 'react';
import { FaMeta } from 'react-icons/fa6';

interface MetaInfinityLogoProps {
  className?: string;
}

/**
 * Meta Infinity Logo Component
 * Using Font Awesome's official Meta icon
 * Official Meta infinity symbol in blue (#0866FF)
 */
const MetaInfinityLogo: React.FC<MetaInfinityLogoProps> = ({ className = "w-12 h-12" }) => {
  return <FaMeta className={className} />;
};

export default MetaInfinityLogo;
