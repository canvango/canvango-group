
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import EmptyState from '../EmptyState';
import { Package } from 'lucide-react';

describe('EmptyState Component', () => {
  const defaultProps = {
    icon: Package,
    title: 'No Items Found',
    description: 'There are no items to display at this time.',
  };

  it('renders with icon, title, and description', () => {
    render(<EmptyState {...defaultProps} />);
    
    expect(screen.getByText('No Items Found')).toBeInTheDocument();
    expect(screen.getByText('There are no items to display at this time.')).toBeInTheDocument();
  });

  it('renders with optional action button', () => {
    const handleClick = jest.fn();
    const propsWithAction = {
      ...defaultProps,
      action: {
        label: 'Add Item',
        onClick: handleClick,
      },
    };

    render(<EmptyState {...propsWithAction} />);
    
    const button = screen.getByRole('button', { name: 'Add Item' });
    expect(button).toBeInTheDocument();
    
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders without action button when not provided', () => {
    render(<EmptyState {...defaultProps} />);
    
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <EmptyState {...defaultProps} className="custom-class" />
    );
    
    const emptyStateDiv = container.firstChild;
    expect(emptyStateDiv).toHaveClass('custom-class');
  });

  it('has proper accessibility attributes', () => {
    render(<EmptyState {...defaultProps} />);
    
    const container = screen.getByRole('status');
    expect(container).toHaveAttribute('aria-live', 'polite');
  });

  it('renders with different button variants', () => {
    const propsWithSecondaryAction = {
      ...defaultProps,
      action: {
        label: 'Secondary Action',
        onClick: jest.fn(),
        variant: 'secondary' as const,
      },
    };

    render(<EmptyState {...propsWithSecondaryAction} />);
    
    const button = screen.getByRole('button', { name: 'Secondary Action' });
    expect(button).toBeInTheDocument();
  });
});
