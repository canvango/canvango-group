import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { renderHook, act } from '@testing-library/react';
import * as ReactRouterDom from 'react-router-dom';
import { useNavigation } from '../useNavigation.js';
import type { ReactNode } from 'react';
import React from 'react';

const { BrowserRouter } = ReactRouterDom;

// Mock react-router-dom
const mockNavigate = jest.fn();
const mockLocation = {
  pathname: '/member/dashboard',
  search: '',
  hash: '',
  state: null,
  key: 'default',
};

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual<typeof ReactRouterDom>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
    useSearchParams: () => [new URLSearchParams(), jest.fn()],
  };
});

describe('useNavigation Hook - URL Duplication Prevention', () => {
  const wrapper = ({ children }: { children: ReactNode }) => {
    return React.createElement(BrowserRouter, null, children);
  };

  beforeEach(() => {
    mockNavigate.mockClear();
    mockLocation.pathname = '/member/dashboard';
    mockLocation.search = '';
  });

  describe('navigateTo - Path Normalization', () => {
    it('should remove /member/ prefix from absolute paths', () => {
      const { result } = renderHook(() => useNavigation(), { wrapper });

      act(() => {
        result.current.navigateTo('/member/admin/dashboard');
      });

      expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard');
    });

    it('should remove /member prefix without trailing slash', () => {
      const { result } = renderHook(() => useNavigation(), { wrapper });

      act(() => {
        result.current.navigateTo('/member');
      });

      expect(mockNavigate).toHaveBeenCalledWith('');
    });

    it('should handle paths with leading slash', () => {
      const { result } = renderHook(() => useNavigation(), { wrapper });

      act(() => {
        result.current.navigateTo('/dashboard');
      });

      expect(mockNavigate).toHaveBeenCalledWith('dashboard');
    });

    it('should handle relative paths without leading slash', () => {
      const { result } = renderHook(() => useNavigation(), { wrapper });

      act(() => {
        result.current.navigateTo('dashboard');
      });

      expect(mockNavigate).toHaveBeenCalledWith('dashboard');
    });

    it('should prevent path duplication for admin routes', () => {
      const { result } = renderHook(() => useNavigation(), { wrapper });

      act(() => {
        result.current.navigateTo('/member/admin/users');
      });

      expect(mockNavigate).toHaveBeenCalledWith('/admin/users');
      expect(mockNavigate).not.toHaveBeenCalledWith('/member/admin/users');
    });

    it('should handle nested admin paths correctly', () => {
      const { result } = renderHook(() => useNavigation(), { wrapper });

      const adminPaths = [
        '/member/admin/dashboard',
        '/member/admin/users',
        '/member/admin/transactions',
        '/member/admin/claims',
        '/member/admin/tutorials',
        '/member/admin/products',
        '/member/admin/settings',
        '/member/admin/audit-logs',
      ];

      adminPaths.forEach((path) => {
        mockNavigate.mockClear();
        act(() => {
          result.current.navigateTo(path);
        });

        const expectedPath = path.replace('/member/', '/');
        expect(mockNavigate).toHaveBeenCalledWith(expectedPath);
      });
    });
  });

  describe('navigateTo - Query Parameters', () => {
    it('should append query parameters to path', () => {
      const { result } = renderHook(() => useNavigation(), { wrapper });

      act(() => {
        result.current.navigateTo('/member/akun-bm', { category: 'verified', page: 1 });
      });

      expect(mockNavigate).toHaveBeenCalledWith('/akun-bm?category=verified&page=1');
    });

    it('should handle undefined query parameters', () => {
      const { result } = renderHook(() => useNavigation(), { wrapper });

      act(() => {
        result.current.navigateTo('/member/dashboard', { filter: undefined });
      });

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    it('should handle empty string query parameters', () => {
      const { result } = renderHook(() => useNavigation(), { wrapper });

      act(() => {
        result.current.navigateTo('/member/dashboard', { search: '' });
      });

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    it('should handle boolean query parameters', () => {
      const { result } = renderHook(() => useNavigation(), { wrapper });

      act(() => {
        result.current.navigateTo('/member/transactions', { warranty: true });
      });

      expect(mockNavigate).toHaveBeenCalledWith('/riwayat-transaksi?warranty=true');
    });
  });

  describe('replace - Path Normalization', () => {
    it('should remove /member/ prefix when replacing', () => {
      const { result } = renderHook(() => useNavigation(), { wrapper });

      act(() => {
        result.current.replace('/member/admin/dashboard');
      });

      expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard', { replace: true });
    });

    it('should handle query parameters when replacing', () => {
      const { result } = renderHook(() => useNavigation(), { wrapper });

      act(() => {
        result.current.replace('/member/akun-bm', { category: 'verified' });
      });

      expect(mockNavigate).toHaveBeenCalledWith('/akun-bm?category=verified', { replace: true });
    });
  });

  describe('isActive - Path Matching', () => {
    it('should correctly identify active path', () => {
      mockLocation.pathname = '/member/dashboard';
      const { result } = renderHook(() => useNavigation(), { wrapper });

      expect(result.current.isActive('/member/dashboard')).toBe(true);
      expect(result.current.isActive('/dashboard')).toBe(true);
    });

    it('should handle admin paths correctly', () => {
      mockLocation.pathname = '/member/admin/users';
      const { result } = renderHook(() => useNavigation(), { wrapper });

      expect(result.current.isActive('/member/admin/users')).toBe(true);
      expect(result.current.isActive('/admin/users')).toBe(true);
      expect(result.current.isActive('/member/admin')).toBe(true);
    });

    it('should support exact matching', () => {
      mockLocation.pathname = '/member/admin/users';
      const { result } = renderHook(() => useNavigation(), { wrapper });

      expect(result.current.isActive('/member/admin/users', true)).toBe(true);
      expect(result.current.isActive('/member/admin', true)).toBe(false);
    });

    it('should normalize paths before comparison', () => {
      mockLocation.pathname = '/member/dashboard';
      const { result } = renderHook(() => useNavigation(), { wrapper });

      // All these should be considered active
      expect(result.current.isActive('/member/dashboard')).toBe(true);
      expect(result.current.isActive('/dashboard')).toBe(true);
      expect(result.current.isActive('dashboard')).toBe(true);
    });
  });

  describe('Sequential Navigation - No Duplication', () => {
    it('should maintain clean paths across multiple navigations', () => {
      const { result } = renderHook(() => useNavigation(), { wrapper });

      // Navigate to dashboard
      act(() => {
        result.current.navigateTo('/member/dashboard');
      });
      expect(mockNavigate).toHaveBeenLastCalledWith('/dashboard');

      // Navigate to admin dashboard
      mockNavigate.mockClear();
      act(() => {
        result.current.navigateTo('/member/admin/dashboard');
      });
      expect(mockNavigate).toHaveBeenLastCalledWith('/admin/dashboard');

      // Navigate to users
      mockNavigate.mockClear();
      act(() => {
        result.current.navigateTo('/member/admin/users');
      });
      expect(mockNavigate).toHaveBeenLastCalledWith('/admin/users');

      // Navigate back to dashboard
      mockNavigate.mockClear();
      act(() => {
        result.current.navigateTo('/member/dashboard');
      });
      expect(mockNavigate).toHaveBeenLastCalledWith('/dashboard');

      // Verify no calls contained duplicated paths
      const allCalls = mockNavigate.mock.calls;
      allCalls.forEach((call) => {
        const path = call[0] as string;
        // Check for common duplication patterns
        expect(path).not.toContain('dashboard/dashboard');
        expect(path).not.toContain('admin/admin');
        expect(path).not.toContain('users/users');
        expect(path).not.toContain('/member/');
      });
    });
  });

  describe('goBack', () => {
    it('should navigate back in history', () => {
      const { result } = renderHook(() => useNavigation(), { wrapper });

      act(() => {
        result.current.goBack();
      });

      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
  });

  describe('currentPath', () => {
    it('should return current pathname', () => {
      mockLocation.pathname = '/member/admin/users';
      const { result } = renderHook(() => useNavigation(), { wrapper });

      expect(result.current.currentPath).toBe('/member/admin/users');
    });
  });

  describe('queryParams', () => {
    it('should parse query parameters from URL', () => {
      mockLocation.search = '?category=verified&page=2';
      const { result } = renderHook(() => useNavigation(), { wrapper });

      expect(result.current.queryParams).toEqual({
        category: 'verified',
        page: '2',
      });
    });

    it('should return empty object when no query parameters', () => {
      mockLocation.search = '';
      const { result } = renderHook(() => useNavigation(), { wrapper });

      expect(result.current.queryParams).toEqual({});
    });
  });
});
