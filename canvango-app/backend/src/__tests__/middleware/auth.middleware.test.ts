// Mock the Supabase client before importing
jest.mock('../../config/supabase.js');

import { Request, Response, NextFunction } from 'express';
import { authenticate, optionalAuthenticate } from '../../middleware/auth.middleware.js';
import { getSupabaseClient } from '../../config/supabase.js';

const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
  },
  from: jest.fn(),
};

describe('Authentication Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    (getSupabaseClient as jest.Mock).mockReturnValue(mockSupabaseClient);

    mockRequest = {
      headers: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  describe('authenticate', () => {
    it('should authenticate valid token and attach user to request', async () => {
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
      };

      const mockUserData = {
        role: 'member',
      };

      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockUserData,
              error: null,
            }),
          }),
        }),
      });

      await authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalledWith('valid-token');
      expect(mockRequest.user).toEqual({
        userId: mockUser.id,
        email: mockUser.email,
        role: 'member',
      });
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 401 when no token provided', async () => {
      mockRequest.headers = {};

      await authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'AUTH_003',
          message: 'No authentication token provided',
        },
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when token is invalid', async () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' },
      });

      await authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'AUTH_002',
          message: 'Invalid or expired token',
        },
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when token is expired', async () => {
      mockRequest.headers = {
        authorization: 'Bearer expired-token',
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Token expired' },
      });

      await authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'AUTH_002',
          message: 'Invalid or expired token',
        },
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle missing Authorization header format', async () => {
      mockRequest.headers = {
        authorization: 'InvalidFormat',
      };

      await authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'AUTH_003',
          message: 'No authentication token provided',
        },
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should default to member role when user not in database', async () => {
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'newuser@example.com',
      };

      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116', message: 'No rows found' },
            }),
          }),
        }),
      });

      await authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.user).toEqual({
        userId: mockUser.id,
        email: mockUser.email,
        role: 'member',
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle internal server errors', async () => {
      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };

      mockSupabaseClient.auth.getUser.mockRejectedValue(new Error('Database connection failed'));

      await authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error during authentication',
        },
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('optionalAuthenticate', () => {
    it('should attach user when valid token provided', async () => {
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
      };

      const mockUserData = {
        role: 'member',
      };

      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockUserData,
              error: null,
            }),
          }),
        }),
      });

      await optionalAuthenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.user).toEqual({
        userId: mockUser.id,
        email: mockUser.email,
        role: 'member',
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should continue without user when no token provided', async () => {
      mockRequest.headers = {};

      await optionalAuthenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should continue without user when token is invalid', async () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' },
      });

      await optionalAuthenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should continue without user on internal errors', async () => {
      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };

      mockSupabaseClient.auth.getUser.mockRejectedValue(new Error('Connection failed'));

      await optionalAuthenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });
});
