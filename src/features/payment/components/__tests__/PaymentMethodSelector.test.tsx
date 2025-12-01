/**
 * Component Tests for PaymentMethodSelector
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PaymentMethodSelector } from '../PaymentMethodSelector';

// Mock hooks
vi.mock('@/hooks/useTripay', () => ({
  usePaymentMethods: vi.fn(() => ({
    data: [
      {
        code: 'BRIVA',
        name: 'BRI Virtual Account',
        group_name: 'Virtual Account',
        fee_merchant: { flat: 4000, percent: 0 },
        fee_customer: { flat: 0, percent: 0 },
        total_fee: { flat: 4000, percent: 0 },
        minimum_fee: 0,
        maximum_fee: 0,
        minimum_amount: 10000,
        maximum_amount: 0,
        icon_url: '',
        active: true,
      },
      {
        code: 'QRIS',
        name: 'QRIS',
        group_name: 'QRIS',
        fee_merchant: { flat: 0, percent: 0.7 },
        fee_customer: { flat: 0, percent: 0 },
        total_fee: { flat: 0, percent: 0.7 },
        minimum_fee: 0,
        maximum_fee: 0,
        minimum_amount: 1000,
        maximum_amount: 0,
        icon_url: '',
        active: true,
      },
    ],
    isLoading: false,
    error: null,
  })),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('PaymentMethodSelector', () => {
  it('should render payment methods grouped by type', () => {
    const onSelect = vi.fn();

    render(
      <PaymentMethodSelector amount={100000} selectedMethod={null} onSelect={onSelect} />,
      { wrapper: createWrapper() }
    );

    // Check if groups are rendered
    expect(screen.getByText('Virtual Account')).toBeInTheDocument();
    expect(screen.getByText('QRIS')).toBeInTheDocument();
  });

  it('should display fee and total for each method', () => {
    const onSelect = vi.fn();

    render(
      <PaymentMethodSelector amount={100000} selectedMethod={null} onSelect={onSelect} />,
      { wrapper: createWrapper() }
    );

    // BRIVA should show flat fee
    expect(screen.getByText(/Rp\s*4\.000/)).toBeInTheDocument();

    // QRIS should show percentage fee
    expect(screen.getByText(/Rp\s*700/)).toBeInTheDocument();
  });

  it('should call onSelect when method is clicked', () => {
    const onSelect = vi.fn();

    render(
      <PaymentMethodSelector amount={100000} selectedMethod={null} onSelect={onSelect} />,
      { wrapper: createWrapper() }
    );

    // Click on BRIVA
    const brivaButton = screen.getByText('BRI Virtual Account').closest('button');
    fireEvent.click(brivaButton!);

    expect(onSelect).toHaveBeenCalledWith('BRIVA');
  });

  it('should highlight selected method', () => {
    const onSelect = vi.fn();

    render(
      <PaymentMethodSelector amount={100000} selectedMethod="BRIVA" onSelect={onSelect} />,
      { wrapper: createWrapper() }
    );

    const brivaButton = screen.getByText('BRI Virtual Account').closest('button');
    expect(brivaButton).toHaveClass('border-blue-500');
  });

  it('should disable methods that do not meet minimum amount', () => {
    const onSelect = vi.fn();

    // Amount below BRIVA minimum (10000)
    render(
      <PaymentMethodSelector amount={5000} selectedMethod={null} onSelect={onSelect} />,
      { wrapper: createWrapper() }
    );

    const brivaButton = screen.getByText('BRI Virtual Account').closest('button');
    expect(brivaButton).toBeDisabled();
  });

  it('should show warning for invalid amounts', () => {
    const onSelect = vi.fn();

    render(
      <PaymentMethodSelector amount={5000} selectedMethod={null} onSelect={onSelect} />,
      { wrapper: createWrapper() }
    );

    // Should show minimum amount warning for BRIVA
    expect(screen.getByText(/Minimal Rp\s*10\.000/)).toBeInTheDocument();
  });

  it('should show loading state', () => {
    // Mock loading state
    vi.mock('@/hooks/useTripay', () => ({
      usePaymentMethods: vi.fn(() => ({
        data: null,
        isLoading: true,
        error: null,
      })),
    }));

    const onSelect = vi.fn();

    render(
      <PaymentMethodSelector amount={100000} selectedMethod={null} onSelect={onSelect} />,
      { wrapper: createWrapper() }
    );

    // Should show loading skeletons
    expect(screen.getAllByRole('status')).toHaveLength(3);
  });
});

/**
 * NOTE: These are basic component tests
 * 
 * For comprehensive testing, you should also test:
 * 
 * 1. Group expansion/collapse
 * 2. Fee calculation edge cases
 * 3. Maximum amount validation
 * 4. Error states
 * 5. Empty states
 * 6. Accessibility (keyboard navigation, ARIA labels)
 * 7. Responsive behavior
 * 8. Icon rendering
 */
