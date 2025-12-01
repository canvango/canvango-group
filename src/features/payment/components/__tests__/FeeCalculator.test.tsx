/**
 * Component Tests for FeeCalculator
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeeCalculator } from '../FeeCalculator';
import type { TripayPaymentMethod } from '@/services/tripay.service';

describe('FeeCalculator', () => {
  const mockMethod: TripayPaymentMethod = {
    code: 'BRIVA',
    name: 'BRI Virtual Account',
    fee_merchant: { flat: 4000, percent: 1.5 },
    fee_customer: { flat: 0, percent: 0 },
    total_fee: { flat: 4000, percent: 1.5 },
    minimum_fee: 0,
    maximum_fee: 0,
    minimum_amount: 10000,
    maximum_amount: 0,
    icon_url: '',
    active: true,
  };

  it('should display base amount', () => {
    render(<FeeCalculator amount={100000} paymentMethod={mockMethod} />);

    expect(screen.getByText('Jumlah')).toBeInTheDocument();
    expect(screen.getByText(/Rp\s*100\.000/)).toBeInTheDocument();
  });

  it('should display flat fee', () => {
    render(<FeeCalculator amount={100000} paymentMethod={mockMethod} />);

    expect(screen.getByText('Biaya Tetap')).toBeInTheDocument();
    expect(screen.getByText(/Rp\s*4\.000/)).toBeInTheDocument();
  });

  it('should display percentage fee', () => {
    render(<FeeCalculator amount={100000} paymentMethod={mockMethod} />);

    expect(screen.getByText(/Biaya Persentase \(1\.5%\)/)).toBeInTheDocument();
    expect(screen.getByText(/Rp\s*1\.500/)).toBeInTheDocument();
  });

  it('should display total fee', () => {
    render(<FeeCalculator amount={100000} paymentMethod={mockMethod} />);

    expect(screen.getByText('Total Biaya')).toBeInTheDocument();
    // 4000 + 1500 = 5500
    expect(screen.getByText(/Rp\s*5\.500/)).toBeInTheDocument();
  });

  it('should display final total amount', () => {
    render(<FeeCalculator amount={100000} paymentMethod={mockMethod} />);

    expect(screen.getByText('Total Bayar')).toBeInTheDocument();
    // 100000 + 5500 = 105500
    expect(screen.getByText(/Rp\s*105\.500/)).toBeInTheDocument();
  });

  it('should show warning when amount is below minimum', () => {
    render(<FeeCalculator amount={5000} paymentMethod={mockMethod} />);

    expect(screen.getByText('Peringatan')).toBeInTheDocument();
    expect(screen.getByText(/Nominal minimal/)).toBeInTheDocument();
  });

  it('should show warning when amount exceeds maximum', () => {
    const methodWithMax: TripayPaymentMethod = {
      ...mockMethod,
      maximum_amount: 50000,
    };

    render(<FeeCalculator amount={100000} paymentMethod={methodWithMax} />);

    expect(screen.getByText('Peringatan')).toBeInTheDocument();
    expect(screen.getByText(/Nominal maksimal/)).toBeInTheDocument();
  });

  it('should apply minimum fee when calculated fee is lower', () => {
    const methodWithMinFee: TripayPaymentMethod = {
      ...mockMethod,
      fee_merchant: { flat: 100, percent: 0 },
      total_fee: { flat: 100, percent: 0 },
      minimum_fee: 1000,
    };

    render(<FeeCalculator amount={10000} paymentMethod={methodWithMinFee} />);

    // Should show minimum fee (1000) instead of calculated fee (100)
    expect(screen.getByText(/Rp\s*1\.000/)).toBeInTheDocument();
  });

  it('should apply maximum fee when calculated fee is higher', () => {
    const methodWithMaxFee: TripayPaymentMethod = {
      ...mockMethod,
      fee_merchant: { flat: 0, percent: 5 },
      total_fee: { flat: 0, percent: 5 },
      maximum_fee: 5000,
    };

    render(<FeeCalculator amount={200000} paymentMethod={methodWithMaxFee} />);

    // Should show maximum fee (5000) instead of calculated fee (10000)
    expect(screen.getByText(/Rp\s*5\.000/)).toBeInTheDocument();
  });

  it('should display info message', () => {
    render(<FeeCalculator amount={100000} paymentMethod={mockMethod} />);

    expect(screen.getByText(/Biaya admin sudah termasuk/)).toBeInTheDocument();
  });
});
