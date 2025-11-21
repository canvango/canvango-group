import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from '../Sidebar.js';
import { ROUTES } from '../../../config/routes.config.js';

// Mock window.innerWidth for mobile tests
const mockInnerWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
};

describe('Sidebar Navigation - URL Duplication Fix', () => {
  const mockUser = {
    username: 'testuser',
    balance: 100000,
    role: 'admin' as const,
    stats: {
      transactions: 5,
    },
  };

  const mockGuestUser = {
    username: 'guest',
    balance: 0,
    role: 'guest' as const,
  };

  beforeEach(() => {
    mockInnerWidth(1024); // Desktop view
  });

  describe('Admin Navigation - URL Duplication Prevention', () => {
    it('should show admin dropdown button', () => {
      render(
        <MemoryRouter initialEntries={['/member/dashboard']}>
          <Sidebar user={mockUser} isOpen={true} />
        </MemoryRouter>
      );

      const adminDropdownButton = screen.getByText('Menu Admin');
      expect(adminDropdownButton).toBeTruthy();
    });

    it('should toggle admin dropdown when clicked', () => {
      render(
        <MemoryRouter initialEntries={['/member/dashboard']}>
          <Sidebar user={mockUser} isOpen={true} />
        </MemoryRouter>
      );

      const adminDropdownButton = screen.getByText('Menu Admin');
      
      // Initially, admin menu items should not be visible
      expect(screen.queryByText('Dashboard Admin')).toBeNull();
      
      // Click to open dropdown
      fireEvent.click(adminDropdownButton);
      
      // Now admin menu items should be visible
      expect(screen.getByText('Dashboard Admin')).toBeTruthy();
    });

    it('should navigate to admin dashboard without URL duplication', () => {
      render(
        <MemoryRouter initialEntries={['/member/dashboard']}>
          <Sidebar user={mockUser} isOpen={true} />
        </MemoryRouter>
      );

      // Open dropdown first
      const adminDropdownButton = screen.getByText('Menu Admin');
      fireEvent.click(adminDropdownButton);

      const adminDashboardLink = screen.getByText('Dashboard Admin').closest('a');
      expect(adminDashboardLink).toBeTruthy();
      expect(adminDashboardLink?.getAttribute('href')).toBe('/admin/dashboard');
    });

    it('should have correct paths for all admin menu items', () => {
      render(
        <MemoryRouter initialEntries={['/member/dashboard']}>
          <Sidebar user={mockUser} isOpen={true} />
        </MemoryRouter>
      );

      // Open dropdown first
      const adminDropdownButton = screen.getByText('Menu Admin');
      fireEvent.click(adminDropdownButton);

      const adminMenuItems = [
        { label: 'Dashboard Admin', expectedPath: '/admin/dashboard' },
        { label: 'Kelola Pengguna', expectedPath: '/admin/users' },
        { label: 'Kelola Transaksi', expectedPath: '/admin/transactions' },
        { label: 'Kelola Klaim', expectedPath: '/admin/claims' },
        { label: 'Kelola Tutorial', expectedPath: '/admin/tutorials' },
        { label: 'Kelola Produk', expectedPath: '/admin/products' },
        { label: 'Kelola Kategori', expectedPath: '/admin/categories' },
        { label: 'Pengaturan Sistem', expectedPath: '/admin/settings' },
        { label: 'Log Aktivitas', expectedPath: '/admin/audit-logs' },
      ];

      adminMenuItems.forEach(({ label, expectedPath }) => {
        const link = screen.getByText(label).closest('a');
        expect(link?.getAttribute('href')).toBe(expectedPath);
      });
    });

    it('should use ROUTES.ADMIN constants for admin paths', () => {
      // Verify that ROUTES.ADMIN paths are properly defined
      expect(ROUTES.ADMIN.DASHBOARD).toBe('admin/dashboard');
      expect(ROUTES.ADMIN.USERS).toBe('admin/users');
      expect(ROUTES.ADMIN.TRANSACTIONS).toBe('admin/transactions');
      expect(ROUTES.ADMIN.CLAIMS).toBe('admin/claims');
      expect(ROUTES.ADMIN.TUTORIALS).toBe('admin/tutorials');
      expect(ROUTES.ADMIN.PRODUCTS).toBe('admin/products');
      expect(ROUTES.ADMIN.CATEGORIES).toBe('admin/categories');
      expect(ROUTES.ADMIN.SETTINGS).toBe('admin/settings');
      expect(ROUTES.ADMIN.AUDIT_LOGS).toBe('admin/audit-logs');
    });
  });

  describe('Sequential Navigation - Clean URLs', () => {
    it('should maintain clean URLs after multiple navigations', () => {
      render(
        <MemoryRouter initialEntries={['/member/dashboard']}>
          <Sidebar user={mockUser} isOpen={true} />
        </MemoryRouter>
      );

      // Verify Dashboard link
      const dashboardLink = screen.getByText('Dashboard').closest('a');
      expect(dashboardLink?.getAttribute('href')).toBe('/dashboard');

      // Open admin dropdown
      const adminDropdownButton = screen.getByText('Menu Admin');
      fireEvent.click(adminDropdownButton);

      // Verify Admin Dashboard link
      const adminDashboardLink = screen.getByText('Dashboard Admin').closest('a');
      expect(adminDashboardLink?.getAttribute('href')).toBe('/admin/dashboard');

      // Verify Users link
      const usersLink = screen.getByText('Kelola Pengguna').closest('a');
      expect(usersLink?.getAttribute('href')).toBe('/admin/users');

      // All paths should be clean without duplication
      expect(dashboardLink?.getAttribute('href')).not.toContain('dashboard/dashboard');
      expect(adminDashboardLink?.getAttribute('href')).not.toContain('dashboard/dashboard');
      expect(usersLink?.getAttribute('href')).not.toContain('users/users');
    });
  });

  describe('Main Menu Navigation', () => {
    it('should have correct paths for main menu items', () => {
      render(
        <MemoryRouter initialEntries={['/member/dashboard']}>
          <Sidebar user={mockUser} isOpen={true} />
        </MemoryRouter>
      );

      const mainMenuItems = [
        { label: 'Dashboard', expectedPath: '/dashboard' },
        { label: 'Riwayat Transaksi', expectedPath: '/riwayat-transaksi' },
        { label: 'Top Up', expectedPath: '/top-up' },
      ];

      mainMenuItems.forEach(({ label, expectedPath }) => {
        const link = screen.getByText(label).closest('a');
        expect(link?.getAttribute('href')).toBe(expectedPath);
      });
    });
  });

  describe('Account Menu Navigation', () => {
    it('should have correct paths for account menu items', () => {
      render(
        <MemoryRouter initialEntries={['/member/dashboard']}>
          <Sidebar user={mockUser} isOpen={true} />
        </MemoryRouter>
      );

      const accountMenuItems = [
        { label: 'Akun BM', expectedPath: '/akun-bm' },
        { label: 'Akun Personal', expectedPath: '/akun-personal' },
      ];

      accountMenuItems.forEach(({ label, expectedPath }) => {
        const link = screen.getByText(label).closest('a');
        expect(link?.getAttribute('href')).toBe(expectedPath);
      });
    });
  });

  describe('Service Menu Navigation', () => {
    it('should have correct paths for service menu items', () => {
      render(
        <MemoryRouter initialEntries={['/member/dashboard']}>
          <Sidebar user={mockUser} isOpen={true} />
        </MemoryRouter>
      );

      const serviceMenuItems = [
        { label: 'Jasa Verified BM', expectedPath: '/jasa-verified-bm' },
        { label: 'Claim Garansi', expectedPath: '/claim-garansi' },
        { label: 'API', expectedPath: '/api' },
        { label: 'Tutorial', expectedPath: '/tutorial' },
      ];

      serviceMenuItems.forEach(({ label, expectedPath }) => {
        const link = screen.getByText(label).closest('a');
        expect(link?.getAttribute('href')).toBe(expectedPath);
      });
    });
  });

  describe('Active State Highlighting', () => {
    it('should highlight correct menu item when on dashboard', () => {
      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <Sidebar user={mockUser} isOpen={true} />
        </MemoryRouter>
      );

      const dashboardLink = screen.getByText('Dashboard').closest('a');
      expect(dashboardLink?.className).toContain('bg-primary-50');
      expect(dashboardLink?.className).toContain('text-primary-600');
    });

    it('should highlight correct admin menu item when on admin page', () => {
      render(
        <MemoryRouter initialEntries={['/admin/users']}>
          <Sidebar user={mockUser} isOpen={true} />
        </MemoryRouter>
      );

      // Open admin dropdown
      const adminDropdownButton = screen.getByText('Menu Admin');
      fireEvent.click(adminDropdownButton);

      const usersLink = screen.getByText('Kelola Pengguna').closest('a');
      expect(usersLink?.className).toContain('bg-primary-600');
      expect(usersLink?.className).toContain('text-white');
    });

    it('should only highlight one menu item at a time', () => {
      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <Sidebar user={mockUser} isOpen={true} />
        </MemoryRouter>
      );

      const activeLinks = screen.getAllByRole('link').filter((link) =>
        link.className.includes('bg-primary-50')
      );

      expect(activeLinks.length).toBe(1);
    });
  });

  describe('Guest User Navigation', () => {
    it('should show limited menu for guest users', () => {
      render(
        <MemoryRouter initialEntries={['/member/dashboard']}>
          <Sidebar user={mockGuestUser} isOpen={true} />
        </MemoryRouter>
      );

      // Guest should see these items
      expect(screen.getByText('Dashboard')).toBeTruthy();
      expect(screen.getByText('Akun BM')).toBeTruthy();
      expect(screen.getByText('Akun Personal')).toBeTruthy();
      expect(screen.getByText('API')).toBeTruthy();
      expect(screen.getByText('Tutorial')).toBeTruthy();

      // Guest should NOT see these items
      expect(screen.queryByText('Riwayat Transaksi')).toBeNull();
      expect(screen.queryByText('Top Up')).toBeNull();
      expect(screen.queryByText('Menu Admin')).toBeNull();
    });

    it('should have correct paths for guest menu items', () => {
      render(
        <MemoryRouter initialEntries={['/member/dashboard']}>
          <Sidebar user={mockGuestUser} isOpen={true} />
        </MemoryRouter>
      );

      const guestMenuItems = [
        { label: 'Dashboard', expectedPath: '/dashboard' },
        { label: 'Akun BM', expectedPath: '/akun-bm' },
        { label: 'Akun Personal', expectedPath: '/akun-personal' },
        { label: 'API', expectedPath: '/api' },
        { label: 'Tutorial', expectedPath: '/tutorial' },
      ];

      guestMenuItems.forEach(({ label, expectedPath }) => {
        const link = screen.getByText(label).closest('a');
        expect(link?.getAttribute('href')).toBe(expectedPath);
      });
    });
  });

  describe('Mobile Sidebar Behavior', () => {
    it('should close sidebar on mobile after navigation', () => {
      mockInnerWidth(375); // Mobile view
      const onClose = jest.fn();

      render(
        <MemoryRouter initialEntries={['/member/dashboard']}>
          <Sidebar user={mockUser} isOpen={true} onClose={onClose} />
        </MemoryRouter>
      );

      const dashboardLink = screen.getByText('Dashboard');
      fireEvent.click(dashboardLink);

      expect(onClose).toHaveBeenCalled();
    });

    it('should not close sidebar on desktop after navigation', () => {
      mockInnerWidth(1024); // Desktop view
      const onClose = jest.fn();

      render(
        <MemoryRouter initialEntries={['/member/dashboard']}>
          <Sidebar user={mockUser} isOpen={true} onClose={onClose} />
        </MemoryRouter>
      );

      const dashboardLink = screen.getByText('Dashboard');
      fireEvent.click(dashboardLink);

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Path Normalization', () => {
    it('should correctly normalize paths with /member/ prefix', () => {
      render(
        <MemoryRouter initialEntries={['/admin/dashboard']}>
          <Sidebar user={mockUser} isOpen={true} />
        </MemoryRouter>
      );

      // Open admin dropdown
      const adminDropdownButton = screen.getByText('Menu Admin');
      fireEvent.click(adminDropdownButton);

      const adminDashboardLink = screen.getByText('Dashboard Admin').closest('a');
      // The href should be the cleaned path (without /member/)
      expect(adminDashboardLink?.getAttribute('href')).toBe('/admin/dashboard');
    });

    it('should handle paths consistently across all menu sections', () => {
      render(
        <MemoryRouter initialEntries={['/member/dashboard']}>
          <Sidebar user={mockUser} isOpen={true} />
        </MemoryRouter>
      );

      const allLinks = screen.getAllByRole('link');
      
      allLinks.forEach((link) => {
        const href = link.getAttribute('href');
        if (href) {
          // All hrefs should be relative paths without /member/ prefix
          expect(href).not.toContain('/member/');
          // All hrefs should start with /
          expect(href.startsWith('/')).toBe(true);
          // No href should have duplicate path segments
          const segments = href.split('/').filter(Boolean);
          const uniqueSegments = new Set(segments);
          expect(segments.length).toBe(uniqueSegments.size);
        }
      });
    });
  });
});
