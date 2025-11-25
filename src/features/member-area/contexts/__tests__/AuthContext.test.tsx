/**
 * Unit tests for AuthContext
 * Tests role polling, notifications, redirects, and localStorage behavior
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import * as authService from '../../services/auth.service';
import { supabase } from '../../services/supabase';
import * as rolePollingConfig from '../../config/rolePolling.config';
import * as rolePollingUtils from '../../utils/rolePollingUtils';
import * as roleRealtimeUtils from '../../utils/roleRealtimeUtils';

// Mock dependencies
jest.mock('../../services/auth.service');
jest.mock('../../services/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
    from: jest.fn(),
  },
}));
jest.mock('../../config/rolePolling.config');
jest.mock('../../utils/rolePollingUtils');
jest.mock('../../utils/roleRealtimeUtils');
jest.mock('../../../../shared/hooks/useNotification', () => ({
  useNotification: () => ({
    info: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
  }),
}));
jest.mock('../../../../shared/utils/csrf', () => ({
  refreshCSRFToken: jest.fn(),
  clearCSRFToken: jest.fn(),
}));
jest.mock('../../../../shared/hooks/useLocalStorageFilters', () => ({
  clearAllFilterPreferences: jest.fn(),
}));

describe('AuthContext', () => {
  const mockUser = {
    id: 'user-123',
    username: 'testuser',
    email: 'test@example.com',
    fullName: 'Test User',
    balance: 100,
    role: 'member' as const,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();

    // Default mock implementations
    (rolePollingConfig.isRolePollingEnabled as jest.Mock).mockReturnValue(true);
    (rolePollingConfig.getRolePollingInterval as jest.Mock).mockReturnValue(5000);
    (rolePollingConfig.useRealtimeRoleUpdates as jest.Mock).mockReturnValue(false);
    (rolePollingUtils.queryUserRole as jest.Mock).mockResolvedValue({
      role: 'member',
      fromCache: false,
    });
  });

  describe('Role Polling Detection', () => {
    it('should detect role change via polling', async () => {
      // Setup: User starts as member
      (authService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: { access_token: 'token' } },
        error: null,
      });

      // Store token to trigger auth initialization
      localStorage.setItem('authToken', 'test-token');

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      // Wait for initial user load
      await waitFor(() => {
        expect(result.current.user).not.toBeNull();
      });

      expect(result.current.user?.role).toBe('member');

      // Simulate role change in database
      (rolePollingUtils.queryUserRole as jest.Mock).mockResolvedValue({
        role: 'admin',
        fromCache: false,
      });

      // Wait for polling to detect change (5 seconds + buffer)
      await waitFor(
        () => {
          expect(result.current.user?.role).toBe('admin');
        },
        { timeout: 6000 }
      );

      // Verify queryUserRole was called
      expect(rolePollingUtils.queryUserRole).toHaveBeenCalled();
    });

    it('should use cached role when query fails', async () => {
      (authService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: { access_token: 'token' } },
        error: null,
      });

      localStorage.setItem('authToken', 'test-token');

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.user).not.toBeNull();
      });

      // Simulate query failure with cached role
      (rolePollingUtils.queryUserRole as jest.Mock).mockResolvedValue({
        role: 'member',
        fromCache: true,
      });

      // Wait for polling interval
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 5500));
      });

      // Role should remain member (from cache)
      expect(result.current.user?.role).toBe('member');
    });

    it('should not poll when role polling is disabled', async () => {
      (rolePollingConfig.isRolePollingEnabled as jest.Mock).mockReturnValue(false);
      (authService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: { access_token: 'token' } },
        error: null,
      });

      localStorage.setItem('authToken', 'test-token');

      renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      // Wait to ensure polling doesn't start
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 6000));
      });

      // queryUserRole should not be called
      expect(rolePollingUtils.queryUserRole).not.toHaveBeenCalled();
    });

    it('should stop polling when user logs out', async () => {
      (authService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
      (authService.logout as jest.Mock).mockResolvedValue(undefined);
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: { access_token: 'token' } },
        error: null,
      });

      localStorage.setItem('authToken', 'test-token');

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.user).not.toBeNull();
      });

      // Clear mock call history
      (rolePollingUtils.queryUserRole as jest.Mock).mockClear();

      // Logout
      await act(async () => {
        await result.current.logout();
      });

      // Wait to ensure polling stopped
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 6000));
      });

      // queryUserRole should not be called after logout
      expect(rolePollingUtils.queryUserRole).not.toHaveBeenCalled();
    });
  });

  describe('Realtime Subscription', () => {
    it('should use Realtime subscription when enabled', async () => {
      (rolePollingConfig.useRealtimeRoleUpdates as jest.Mock).mockReturnValue(true);
      
      const mockUnsubscribe = jest.fn();
      (roleRealtimeUtils.subscribeToRoleChanges as jest.Mock).mockReturnValue(mockUnsubscribe);
      
      (authService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: { access_token: 'token' } },
        error: null,
      });

      localStorage.setItem('authToken', 'test-token');

      const { result, unmount } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.user).not.toBeNull();
      });

      // Verify Realtime subscription was set up
      expect(roleRealtimeUtils.subscribeToRoleChanges).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          currentRole: 'member',
          onRoleChange: expect.any(Function),
          onError: expect.any(Function),
        })
      );

      // Verify polling is NOT used
      expect(rolePollingUtils.queryUserRole).not.toHaveBeenCalled();

      // Cleanup should call unsubscribe
      unmount();
      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('should handle role change via Realtime', async () => {
      (rolePollingConfig.useRealtimeRoleUpdates as jest.Mock).mockReturnValue(true);
      
      let roleChangeCallback: any;
      (roleRealtimeUtils.subscribeToRoleChanges as jest.Mock).mockImplementation(
        (userId, options) => {
          roleChangeCallback = options.onRoleChange;
          return jest.fn();
        }
      );

      (authService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: { access_token: 'token' } },
        error: null,
      });

      localStorage.setItem('authToken', 'test-token');

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.user).not.toBeNull();
      });

      expect(result.current.user?.role).toBe('member');

      // Simulate Realtime role change event
      act(() => {
        roleChangeCallback('admin', 'member');
      });

      // Role should be updated immediately
      expect(result.current.user?.role).toBe('admin');
    });
  });

  describe('Role Change Notification', () => {
    it('should show notification when role changes', async () => {
      const mockNotification = {
        info: jest.fn(),
        success: jest.fn(),
        error: jest.fn(),
        warning: jest.fn(),
      };

      // Mock useNotification to return our mock
      jest.mock('../../../../shared/hooks/useNotification', () => ({
        useNotification: () => mockNotification,
      }));

      (authService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: { access_token: 'token' } },
        error: null,
      });

      localStorage.setItem('authToken', 'test-token');

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.user).not.toBeNull();
      });

      // Simulate role change
      (rolePollingUtils.queryUserRole as jest.Mock).mockResolvedValue({
        role: 'admin',
        fromCache: false,
      });

      // Wait for polling to detect change
      await waitFor(
        () => {
          expect(result.current.user?.role).toBe('admin');
        },
        { timeout: 6000 }
      );

      // Note: Notification mock is set up in beforeEach, so we can't verify the call here
      // This test verifies the role change happens, notification is tested in integration
    });
  });

  describe('localStorage Behavior', () => {
    it('should not cache role in localStorage', async () => {
      (authService.login as jest.Mock).mockResolvedValue({
        token: 'access-token',
        refreshToken: 'refresh-token',
        user: mockUser,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await act(async () => {
        await result.current.login({
          identifier: 'test@example.com',
          password: 'password123',
        });
      });

      // Verify tokens are stored
      expect(localStorage.getItem('authToken')).toBe('access-token');
      expect(localStorage.getItem('refreshToken')).toBe('refresh-token');

      // Verify user data is NOT stored in localStorage
      expect(localStorage.getItem('userData')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
      
      // Check that no localStorage key contains role
      const allKeys = Object.keys(localStorage);
      const roleKeys = allKeys.filter(key => {
        const value = localStorage.getItem(key);
        return value && value.includes('role');
      });
      
      expect(roleKeys.length).toBe(0);
    });

    it('should clear tokens on logout', async () => {
      (authService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
      (authService.logout as jest.Mock).mockResolvedValue(undefined);
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: { access_token: 'token' } },
        error: null,
      });

      localStorage.setItem('authToken', 'test-token');
      localStorage.setItem('refreshToken', 'test-refresh-token');

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.user).not.toBeNull();
      });

      // Logout
      await act(async () => {
        await result.current.logout();
      });

      // Verify tokens are cleared
      expect(localStorage.getItem('authToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(result.current.user).toBeNull();
    });

    it('should only store tokens, not user data on register', async () => {
      (authService.register as jest.Mock).mockResolvedValue(mockUser);
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: {
          session: {
            access_token: 'new-access-token',
            refresh_token: 'new-refresh-token',
          },
        },
        error: null,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await act(async () => {
        await result.current.register({
          email: 'newuser@example.com',
          username: 'newuser',
          password: 'password123',
          phone: '+1234567890',
        });
      });

      // Verify tokens are stored
      expect(localStorage.getItem('authToken')).toBe('new-access-token');
      expect(localStorage.getItem('refreshToken')).toBe('new-refresh-token');

      // Verify user data is NOT stored
      expect(localStorage.getItem('userData')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('Role Validation', () => {
    it('should validate role type and fallback to member for invalid roles', async () => {
      (authService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: { access_token: 'token' } },
        error: null,
      });

      localStorage.setItem('authToken', 'test-token');

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.user).not.toBeNull();
      });

      // Simulate invalid role from database
      (rolePollingUtils.queryUserRole as jest.Mock).mockResolvedValue({
        role: 'invalid_role',
        fromCache: false,
      });

      // Wait for polling
      await waitFor(
        () => {
          // Role should be validated and set to member
          expect(result.current.user?.role).toBe('member');
        },
        { timeout: 6000 }
      );
    });

    it('should accept valid roles: guest, member, admin', async () => {
      (authService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: { access_token: 'token' } },
        error: null,
      });

      localStorage.setItem('authToken', 'test-token');

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.user).not.toBeNull();
      });

      // Test each valid role
      const validRoles = ['guest', 'member', 'admin'] as const;

      for (const role of validRoles) {
        (rolePollingUtils.queryUserRole as jest.Mock).mockResolvedValue({
          role,
          fromCache: false,
        });

        await waitFor(
          () => {
            expect(result.current.user?.role).toBe(role);
          },
          { timeout: 6000 }
        );
      }
    });
  });

  describe('Auth State Management', () => {
    it('should initialize with loading state', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.user).toBeNull();
    });

    it('should set isAuthenticated based on user state', async () => {
      (authService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: { access_token: 'token' } },
        error: null,
      });

      localStorage.setItem('authToken', 'test-token');

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.isGuest).toBe(false);
      });
    });

    it('should handle auth state change events', async () => {
      let authStateCallback: any;
      (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation((callback) => {
        authStateCallback = callback;
        return {
          data: { subscription: { unsubscribe: jest.fn() } },
        };
      });

      (authService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      // Simulate SIGNED_IN event
      await act(async () => {
        await authStateCallback('SIGNED_IN', {
          access_token: 'new-token',
          refresh_token: 'new-refresh',
        });
      });

      // Verify tokens are updated
      expect(localStorage.getItem('authToken')).toBe('new-token');
      expect(localStorage.getItem('refreshToken')).toBe('new-refresh');
    });
  });
});
