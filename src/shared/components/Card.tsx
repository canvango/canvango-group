import React from 'react';

/**
 * Props for the Card component
 * 
 * @interface CardProps
 * @property {React.ReactNode} children - Card content
 * @property {string} [className] - Additional CSS classes
 * @property {boolean} [hover=false] - Enable hover shadow effect
 * @property {'sm' | 'md' | 'lg' | 'xl' | 'none'} [shadow='md'] - Shadow size
 * @property {'none' | 'sm' | 'md' | 'lg'} [padding='md'] - Internal padding
 */
export interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  shadow?: 'sm' | 'md' | 'lg' | 'xl' | 'none';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * Props for the CardHeader component
 * 
 * @interface CardHeaderProps
 * @property {React.ReactNode} children - Header content
 * @property {string} [className] - Additional CSS classes
 */
export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Props for the CardBody component
 * 
 * @interface CardBodyProps
 * @property {React.ReactNode} children - Body content
 * @property {string} [className] - Additional CSS classes
 */
export interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Props for the CardFooter component
 * 
 * @interface CardFooterProps
 * @property {React.ReactNode} children - Footer content
 * @property {string} [className] - Additional CSS classes
 */
export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Card - Container component for grouping related content
 * 
 * @description
 * Provides a consistent card layout with optional header, body, and footer
 * sections. Supports customizable shadows, padding, and hover effects.
 * Commonly used for displaying products, summaries, and grouped information.
 * 
 * @example
 * ```tsx
 * // Basic card
 * <Card>
 *   <p>Card content</p>
 * </Card>
 * 
 * // Card with sections
 * <Card shadow="lg" hover>
 *   <Card.Header>
 *     <h3>Card Title</h3>
 *   </Card.Header>
 *   <Card.Body>
 *     <p>Main content goes here</p>
 *   </Card.Body>
 *   <Card.Footer>
 *     <Button>Action</Button>
 *   </Card.Footer>
 * </Card>
 * ```
 * 
 * @component
 * @category Shared
 * 
 * @see {@link CardHeader} for header section
 * @see {@link CardBody} for body section
 * @see {@link CardFooter} for footer section
 */
const Card: React.FC<CardProps> & {
  Header: React.FC<CardHeaderProps>;
  Body: React.FC<CardBodyProps>;
  Footer: React.FC<CardFooterProps>;
} = ({
  children,
  className = '',
  hover = false,
  shadow = 'md',
  padding = 'md'
}) => {
  const shadowStyles = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };

  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  return (
    <div
      className={`
        bg-white rounded-lg border border-gray-200
        ${shadowStyles[shadow]}
        ${paddingStyles[padding]}
        ${hover ? 'transition-shadow duration-200 hover:shadow-lg' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => {
  return (
    <div className={`border-b border-gray-200 pb-3 mb-3 ${className}`}>
      {children}
    </div>
  );
};

const CardBody: React.FC<CardBodyProps> = ({ children, className = '' }) => {
  return <div className={className}>{children}</div>;
};

const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => {
  return (
    <div className={`border-t border-gray-200 pt-3 mt-3 ${className}`}>
      {children}
    </div>
  );
};

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
