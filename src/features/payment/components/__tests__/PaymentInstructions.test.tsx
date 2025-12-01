/**
 * Component Tests for PaymentInstructions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PaymentInstructions } from '../PaymentInstructions';

// Mock notification hook
vi.mock('@/shared/hooks/useNotification', () => ({
  useNotification: () => ({
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

describe('PaymentInstructions', () => {
  const mockInstructions = [
    {
      title: 'ATM',
      steps: [
        'Masukkan kartu ATM',
        'Pilih menu Transfer',
        'Masukkan nomor Virtual Account',
        'Konfirmasi pembayaran',
      ],
    },
    {
      title: 'Mobile Banking',
      steps: [
        'Buka aplikasi mobile banking',
        'Pilih menu Transfer',
        'Masukkan nomor Virtual Account',
        'Konfirmasi pembayaran',
      ],
    },
  ];

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should display pay code', () => {
    render(
      <PaymentInstructions
        instructions={mockInstructions}
        payCode="1234567890"
      />
    );

    expect(screen.getByText('Kode Pembayaran')).toBeInTheDocument();
    expect(screen.getByText('1234567890')).toBeInTheDocument();
  });

  it('should copy pay code to clipboard', async () => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(() => Promise.resolve()),
      },
    });

    render(
      <PaymentInstructions
        instructions={mockInstructions}
        payCode="1234567890"
      />
    );

    const copyButton = screen.getByTitle('Salin kode');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('1234567890');
    });
  });

  it('should display QR code when provided', () => {
    render(
      <PaymentInstructions
        instructions={mockInstructions}
        qrUrl="https://example.com/qr.png"
      />
    );

    const qrImage = screen.getByAlt('QR Code');
    expect(qrImage).toBeInTheDocument();
    expect(qrImage).toHaveAttribute('src', 'https://example.com/qr.png');
  });

  it('should display checkout URL button', () => {
    render(
      <PaymentInstructions
        instructions={mockInstructions}
        checkoutUrl="https://example.com/checkout"
      />
    );

    const checkoutButton = screen.getByText('Lanjutkan ke Halaman Pembayaran');
    expect(checkoutButton).toBeInTheDocument();
    expect(checkoutButton.closest('a')).toHaveAttribute('href', 'https://example.com/checkout');
  });

  it('should display countdown timer', () => {
    const expiredTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

    render(
      <PaymentInstructions
        instructions={mockInstructions}
        expiredTime={expiredTime}
      />
    );

    expect(screen.getByText('Batas Waktu Pembayaran')).toBeInTheDocument();
    expect(screen.getByText(/01:00:00/)).toBeInTheDocument();
  });

  it('should update countdown timer every second', () => {
    const expiredTime = Math.floor(Date.now() / 1000) + 3600;

    render(
      <PaymentInstructions
        instructions={mockInstructions}
        expiredTime={expiredTime}
      />
    );

    // Initial time
    expect(screen.getByText(/01:00:00/)).toBeInTheDocument();

    // Advance time by 1 second
    vi.advanceTimersByTime(1000);

    // Should show 59:59
    expect(screen.getByText(/00:59:59/)).toBeInTheDocument();
  });

  it('should display instruction tabs', () => {
    render(
      <PaymentInstructions instructions={mockInstructions} />
    );

    expect(screen.getByText('ATM')).toBeInTheDocument();
    expect(screen.getByText('Mobile Banking')).toBeInTheDocument();
  });

  it('should switch between instruction tabs', () => {
    render(
      <PaymentInstructions instructions={mockInstructions} />
    );

    // Initially shows ATM instructions
    expect(screen.getByText('Masukkan kartu ATM')).toBeInTheDocument();

    // Click Mobile Banking tab
    fireEvent.click(screen.getByText('Mobile Banking'));

    // Should show Mobile Banking instructions
    expect(screen.getByText('Buka aplikasi mobile banking')).toBeInTheDocument();
  });

  it('should display instruction steps with numbering', () => {
    render(
      <PaymentInstructions instructions={mockInstructions} />
    );

    // Check if steps are numbered
    const steps = screen.getAllByRole('listitem');
    expect(steps.length).toBeGreaterThan(0);

    // Check if first step has number 1
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should call onRefreshStatus when refresh button clicked', () => {
    const onRefreshStatus = vi.fn();

    render(
      <PaymentInstructions
        instructions={mockInstructions}
        onRefreshStatus={onRefreshStatus}
      />
    );

    const refreshButton = screen.getByText('Refresh Status Pembayaran');
    fireEvent.click(refreshButton);

    expect(onRefreshStatus).toHaveBeenCalled();
  });

  it('should not display refresh button when onRefreshStatus not provided', () => {
    render(
      <PaymentInstructions instructions={mockInstructions} />
    );

    expect(screen.queryByText('Refresh Status Pembayaran')).not.toBeInTheDocument();
  });
});
