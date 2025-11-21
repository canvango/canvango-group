import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserManagement from '../UserManagement';
import { supabase } from '../../services/supabase';

// Mock Supabase client
vi.mock('../../../../clients/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

// Mock ToastContext
vi.mock('../../../../shared/contexts/ToastContext', () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}));

const mockUsers = [
  {
    id: '1',
    email: 'admin@test.com',
    username: 'admin1',
    full_name: 'Admin User',
    role: 'admin',
    balance: 1000,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    email: 'admin2@test.com',
    username: 'admin2',
    full_name: 'Admin Two',
    role: 'admin',
    balance: 2000,
    created_at: '2024-01-02T00:00:00Z',
  },
  {
    id: '3',
    email: 'member@test.com',
    username: 'member1',
    full_name: 'Member User',
    role: 'member',
    balance: 500,
    created_at: '2024-01-03T00:00:00Z',
  },
  {
    id: '4',
    email: 'guest@test.com',
    username: 'guest1',
    full_name: 'Guest User',
    role: 'guest',
    balance: 0,
    created_at: '2024-01-04T00:00:00Z',
  },
];

describe('UserManagement Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock Supabase select query
    const mockSelect = vi.fn().mockReturnThis();
    const mockOrder = vi.fn().mockResolvedValue({
      data: mockUsers,
      error: null,
    });

    (supabase.from as any).mockReturnValue({
      select: mockSelect,
      order: mockOrder,
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    });

    mockSelect.mockReturnValue({
      order: mockOrder,
    });
  });

  it('should render with users in correct tables', async () => {
    render(<UserManagement />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Administrator')).toBeInTheDocument();
    });

    // Check admin table
    const adminSection = screen.getByText('Administrator').closest('section');
    expect(adminSection).toBeInTheDocument();
    
    if (adminSection) {
      expect(within(adminSection).getByText('Admin User')).toBeInTheDocument();
      expect(within(adminSection).getByText('Admin Two')).toBeInTheDocument();
    }

    // Check member table
    const memberSection = screen.getByText('Member & Guest').closest('section');
    expect(memberSection).toBeInTheDocument();
    
    if (memberSection) {
      expect(within(memberSection).getByText('Member User')).toBeInTheDocument();
      expect(within(memberSection).getByText('Guest User')).toBeInTheDocument();
    }
  });

  it('should show correct counts in stats cards', async () => {
    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('Total Users')).toBeInTheDocument();
    });

    // Check stats
    expect(screen.getByText('4')).toBeInTheDocument(); // Total users
    expect(screen.getByText('2')).toBeInTheDocument(); // Admins (appears twice - in stats and count)
  });

  it('should refresh data when refresh button is clicked', async () => {
    const user = userEvent.setup();
    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('Refresh')).toBeInTheDocument();
    });

    const refreshButton = screen.getByText('Refresh');
    await user.click(refreshButton);

    // Verify supabase was called again
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledTimes(2); // Initial load + refresh
    });
  });

  it('should display loading state', async () => {
    // Mock slow response
    const mockSelect = vi.fn().mockReturnThis();
    const mockOrder = vi.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ data: mockUsers, error: null }), 100))
    );

    (supabase.from as any).mockReturnValue({
      select: mockSelect,
      order: mockOrder,
    });

    mockSelect.mockReturnValue({
      order: mockOrder,
    });

    render(<UserManagement />);

    // Should show loading
    expect(screen.getAllByText('Loading...').length).toBeGreaterThan(0);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Administrator')).toBeInTheDocument();
    }, { timeout: 200 });
  });

  it('should display empty state when no users', async () => {
    // Mock empty response
    const mockSelect = vi.fn().mockReturnThis();
    const mockOrder = vi.fn().mockResolvedValue({
      data: [],
      error: null,
    });

    (supabase.from as any).mockReturnValue({
      select: mockSelect,
      order: mockOrder,
    });

    mockSelect.mockReturnValue({
      order: mockOrder,
    });

    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('Tidak ada administrator')).toBeInTheDocument();
      expect(screen.getByText('Tidak ada member atau guest')).toBeInTheDocument();
    });
  });
});
