/**
 * Unit tests for auth.service.ts
 * Tests Supabase native authentication without custom JWT claims
 */

import * as authService from '../auth.service';
import { supabase } from '../supabase';

// Mock Supabase client
jest.mock('../supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      signUp: jest.fn(),
      refreshSession: jest.fn(),
    },
    from: jest.fn(),
  },
}));

describe('Auth Service - Supabase Native Auth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn(); // Suppress console logs in tests
    console.error = jest.fn();
  });

  describe('login', () => {
    const mockSession = {
      access_token: 'test-access-token',
      refresh_token: 'test-refresh-token',
    };

    const mockAuthUser = {
      id: 'user-123',
      email: 'test@example.com',
      created_at: '2024-01-01T00:00:00Z',
    };

    const mockProfile = {
      id: 'user-123',
      username: 'testuser',
      email: 'test@example.com',
      full_name: 'Test User',
      balance: 100,
      role: 'member',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    it('should login with email and return fresh role from database', async () => {
      // Mock Supabase auth response
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: {
          session: mockSession as any,
          user: mockAuthUser as any,
        },
        error: null,
      });

      // Mock profile query
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockProfile,
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await authService.login({
        identifier: 'test@example.com',
        password: 'password123',
      });

      // Verify login returns tokens and user with role from DB
      expect(result.token).toBe('test-access-token');
      expect(result.refreshToken).toBe('test-refresh-token');
      expect(result.user.role).toBe('member');
      expect(result.user.username).toBe('testuser');

      // Verify Supabase was called correctly
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });

      // Verify role was queried from database
      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(mockSelect).toHaveBeenCalledWith('*');
    });

    it('should convert username to email before login', async () => {
      // Mock username lookup
      const mockUsernameSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { email: 'test@example.com' },
            error: null,
          }),
        }),
      });

      // Mock auth response
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: {
          session: mockSession as any,
          user: mockAuthUser as any,
        },
        error: null,
      });

      // Mock profile query
      const mockProfileSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockProfile,
            error: null,
          }),
        }),
      });

      // Setup from() to return different mocks based on call order
      let callCount = 0;
      (supabase.from as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return { select: mockUsernameSelect } as any;
        } else {
          return { select: mockProfileSelect } as any;
        }
      });

      const result = await authService.login({
        identifier: 'testuser',
        password: 'password123',
      });

      // Verify username was converted to email
      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(mockUsernameSelect).toHaveBeenCalledWith('email');

      // Verify login used email
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.user.username).toBe('testuser');
    });

    it('should handle invalid credentials error', async () => {
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { session: null, user: null },
        error: { message: 'Invalid login credentials' } as any,
      });

      await expect(
        authService.login({
          identifier: 'test@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Username atau password salah');
    });

    it('should handle username not found error', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'No rows found' },
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      } as any);

      await expect(
        authService.login({
          identifier: 'nonexistent',
          password: 'password123',
        })
      ).rejects.toThrow('Invalid username or password');
    });

    it('should handle rate limit error', async () => {
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { session: null, user: null },
        error: { message: 'Rate limit exceeded', status: 429 } as any,
      });

      await expect(
        authService.login({
          identifier: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Terlalu banyak percobaan login');
    });

    it('should handle email not confirmed error', async () => {
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { session: null, user: null },
        error: { message: 'Email not confirmed' } as any,
      });

      await expect(
        authService.login({
          identifier: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Email belum diverifikasi');
    });
  });

  describe('getCurrentUser', () => {
    const mockSession = {
      access_token: 'test-token',
      user: {
        id: 'user-123',
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z',
      },
    };

    const mockProfile = {
      id: 'user-123',
      username: 'testuser',
      email: 'test@example.com',
      full_name: 'Test User',
      balance: 100,
      role: 'admin',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    it('should query role from database, not from cached data', async () => {
      // Mock session
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession as any },
        error: null,
      });

      // Mock profile query
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockProfile,
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      } as any);

      const user = await authService.getCurrentUser();

      // Verify role is from database
      expect(user?.role).toBe('admin');
      expect(user?.username).toBe('testuser');

      // Verify database was queried
      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(mockSelect).toHaveBeenCalledWith('*');
    });

    it('should return null when no session exists', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const user = await authService.getCurrentUser();

      expect(user).toBeNull();
    });

    it('should fallback to member role on profile fetch error', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession as any },
        error: null,
      });

      // Mock profile query error
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' },
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      } as any);

      const user = await authService.getCurrentUser();

      // Should return user with fallback role
      expect(user).not.toBeNull();
      expect(user?.role).toBe('member');
      expect(user?.id).toBe('user-123');
    });

    it('should handle session error gracefully', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: { message: 'Session error' } as any,
      });

      const user = await authService.getCurrentUser();

      expect(user).toBeNull();
    });
  });

  describe('logout', () => {
    it('should call Supabase signOut', async () => {
      (supabase.auth.signOut as jest.Mock).mockResolvedValue({
        error: null,
      });

      await authService.logout();

      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it('should throw error on logout failure', async () => {
      const error = new Error('Logout failed');
      (supabase.auth.signOut as jest.Mock).mockResolvedValue({
        error: error as any,
      });

      await expect(authService.logout()).rejects.toThrow('Logout failed');
    });
  });

  describe('register', () => {
    const mockAuthUser = {
      id: 'user-123',
      email: 'newuser@example.com',
    };

    const mockProfile = {
      id: 'user-123',
      username: 'newuser',
      email: 'newuser@example.com',
      full_name: 'New User',
      phone: '+1234567890',
      phone_verified_at: '2024-01-01T00:00:00Z',
      balance: 0,
      role: 'member',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    it('should register user with default member role', async () => {
      // Mock auth signup
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: mockAuthUser as any, session: null },
        error: null,
      });

      // Mock profile insert
      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockProfile,
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
      } as any);

      const user = await authService.register({
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'password123',
        fullName: 'New User',
        phone: '+1234567890',
      });

      // Verify user has member role
      expect(user.role).toBe('member');
      expect(user.username).toBe('newuser');
      expect(user.balance).toBe(0);

      // Verify profile was created with member role
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'member',
          balance: 0,
        })
      );
    });

    it('should handle registration errors', async () => {
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Email already registered' } as any,
      });

      await expect(
        authService.register({
          email: 'existing@example.com',
          username: 'existing',
          password: 'password123',
          phone: '+1234567890',
        })
      ).rejects.toThrow();
    });
  });

  describe('refreshToken', () => {
    it('should refresh session and return new tokens', async () => {
      const mockSession = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
      };

      (supabase.auth.refreshSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession as any, user: null },
        error: null,
      });

      const result = await authService.refreshToken();

      expect(result).toEqual({
        token: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
    });

    it('should return null on refresh error', async () => {
      (supabase.auth.refreshSession as jest.Mock).mockResolvedValue({
        data: { session: null, user: null },
        error: { message: 'Refresh failed' } as any,
      });

      const result = await authService.refreshToken();

      expect(result).toBeNull();
    });
  });
});
