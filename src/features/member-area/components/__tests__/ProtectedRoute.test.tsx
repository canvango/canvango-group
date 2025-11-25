import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProtectedRoute from '../ProtectedRoute';
import { AuthProvider } from '../../contexts/AuthContext';
import * as authService from '../../services/auth.service';
import { supabase } from '../../services/supabase';

// Mock the auth service
vi.mock('../../services/auth.service');
vi.mock('../../services/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      }))
    },
    from: vi.fn()
  }
}));

// Mock notification hook
vi.mock('../../../../shared/hooks/useNotification', () => ({
  useNotification: () => ({
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn()
  })
}));

// Test components
const AdminPage = () => <div>Admin Dashboard</div>;
const MemberPage = () => <div>Member Dashboard</div>;
const LoginPage = () => <div>Login Page</div>;
const UnauthorizedPage = () => <div>Unauthorized</div>;

describe('ProtectedRoute - Admin Route Guards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const renderWithRouter = (initialRoute: string, user: any = null) => {
    // Mock getCurrentUser
    vi.mocked(authService.getCurrentUser).mockResolvedValue(user);
    
    // Mock Supabase session
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { 
        session: user ? { 
          access_token: 'test-token',
          user: { id: user.id }
        } : null 
      },
      error: null
    } as any);

    // Mock Supabase from().select() for role verification
    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: user ? { role: user.role } : null,
          error: null
        })
      })
    });
    
    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect
    } as any);

    return render(
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <MemberPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>,
      { 
        wrapper: ({ children }) => children,
        initialEntries: [initialRoute]
      } as any
    );
  };

  it('should allow admin to access admin routes', async () => {
    const adminUser = {
      id: 'admin-123',
      username: 'admin',
      email: 'admin@test.com',
      fullName: 'Admin User',
      role: 'admin',
      balance: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Set token to simulate logged in state
    localStorage.setItem('authToken', 'test-token');

    renderWithRouter('/admin/dashboard', adminUser);

    // Wait for role verification to complete
    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });

    // Verify role was queried from database
    expect(supabase.from).toHaveBeenCalledWith('users');
  });

  it('should prevent member from accessing admin routes', async () => {
    const memberUser = {
      id: 'member-123',
      username: 'member',
      email: 'member@test.com',
      fullName: 'Member User',
      role: 'member',
      balance: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Set token to simulate logged in state
    localStorage.setItem('authToken', 'test-token');

    renderWithRouter('/admin/dashboard', memberUser);

    // Wait for role verification and redirect
    await waitFor(() => {
      expect(screen.getByText('Unauthorized')).toBeInTheDocument();
    });

    // Verify role was queried from database
    expect(supabase.from).toHaveBeenCalledWith('users');
  });

  it('should redirect unauthenticated users to login', async () => {
    renderWithRouter('/admin/dashboard', null);

    // Wait for redirect to login
    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });

  it('should query fresh role from database on route access', async () => {
    const adminUser = {
      id: 'admin-123',
      username: 'admin',
      email: 'admin@test.com',
      fullName: 'Admin User',
      role: 'admin',
      balance: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem('authToken', 'test-token');

    renderWithRouter('/admin/dashboard', adminUser);

    // Wait for role verification
    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });

    // Verify that role was queried from database, not just from cached user state
    expect(supabase.from).toHaveBeenCalledWith('users');
    const fromCall = vi.mocked(supabase.from).mock.results[0].value;
    expect(fromCall.select).toHaveBeenCalledWith('role');
  });

  it('should show loading state while verifying role', async () => {
    const adminUser = {
      id: 'admin-123',
      username: 'admin',
      email: 'admin@test.com',
      fullName: 'Admin User',
      role: 'admin',
      balance: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Mock slow database query
    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockImplementation(() => 
          new Promise(resolve => 
            setTimeout(() => resolve({
              data: { role: 'admin' },
              error: null
            }), 100)
          )
        )
      })
    });
    
    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect
    } as any);

    localStorage.setItem('authToken', 'test-token');

    renderWithRouter('/admin/dashboard', adminUser);

    // Should show loading state initially
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Wait for role verification to complete
    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });
  });

  it('should handle role verification errors gracefully', async () => {
    const adminUser = {
      id: 'admin-123',
      username: 'admin',
      email: 'admin@test.com',
      fullName: 'Admin User',
      role: 'admin',
      balance: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Mock database error
    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' }
        })
      })
    });
    
    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect
    } as any);

    localStorage.setItem('authToken', 'test-token');

    renderWithRouter('/admin/dashboard', adminUser);

    // Should fall back to user state role and allow access
    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });
  });
});
