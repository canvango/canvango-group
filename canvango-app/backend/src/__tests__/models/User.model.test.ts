// Mock the Supabase client before importing
jest.mock('../../config/supabase.js');

import { UserModel, CreateUserInput, UpdateUserInput } from '../../models/User.model.js';
import { getSupabaseClient } from '../../config/supabase.js';

// Create a fresh mock for each test
let mockSupabaseClient: any;

describe('UserModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create fresh mock instance
    mockSupabaseClient = {
      from: jest.fn(),
      rpc: jest.fn(),
    };
    
    (getSupabaseClient as jest.Mock).mockReturnValue(mockSupabaseClient);
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const userData: CreateUserInput = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'testuser',
        email: 'test@example.com',
        full_name: 'Test User',
      };

      const mockUser = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        password: '',
        full_name: userData.full_name,
        role: 'member',
        balance: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login_at: null,
      };

      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockUser, error: null }),
          }),
        }),
      });

      const result = await UserModel.create(userData);

      expect(result).toEqual(mockUser);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('users');
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      const mockUser = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'member',
        balance: 0,
      };

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockUser, error: null }),
          }),
        }),
      });

      const result = await UserModel.findById('1');

      expect(result).toEqual(mockUser);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('users');
    });

    it('should return null when user not found', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ 
              data: null, 
              error: { code: 'PGRST116', message: 'No rows found' } 
            }),
          }),
        }),
      });

      const result = await UserModel.findById('999');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
      };

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockUser, error: null }),
          }),
        }),
      });

      const result = await UserModel.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('users');
    });
  });

  describe('validateUserData', () => {
    it('should validate correct user data', () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        full_name: 'Test User',
      };

      const result = UserModel.validateUserData(userData);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject username that is too short', () => {
      const userData = {
        username: 'ab',
      };

      const result = UserModel.validateUserData(userData);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Username must be at least 3 characters long');
    });

    it('should reject invalid email format', () => {
      const userData = {
        email: 'invalid-email',
      };

      const result = UserModel.validateUserData(userData);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid email format');
    });

    it('should reject full_name that is too short', () => {
      const userData = {
        full_name: 'A',
      };

      const result = UserModel.validateUserData(userData);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Full name must be at least 2 characters long');
    });

    it('should reject username with invalid characters', () => {
      const userData = {
        username: 'test@user',
      };

      const result = UserModel.validateUserData(userData);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Username can only contain letters, numbers, and underscores');
    });
  });

  describe('updateBalance', () => {
    it('should update user balance using RPC', async () => {
      const mockUser = {
        id: '1',
        balance: 150,
        username: 'testuser',
        email: 'test@example.com',
      };

      // Mock RPC call
      mockSupabaseClient.rpc.mockResolvedValue({ data: null, error: null });

      // Mock findById call after RPC
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockUser, error: null }),
          }),
        }),
      });

      const result = await UserModel.updateBalance('1', 50);

      expect(result).toEqual(mockUser);
      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('update_user_balance', {
        user_id: '1',
        amount_change: 50,
      });
    });
  });

  describe('update', () => {
    it('should update user data', async () => {
      const mockUser = {
        id: '1',
        username: 'updateduser',
        email: 'updated@example.com',
        full_name: 'Updated User',
        role: 'member',
      };

      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: mockUser, error: null }),
            }),
          }),
        }),
      });

      const result = await UserModel.update('1', { username: 'updateduser' });

      expect(result).toEqual(mockUser);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('users');
    });
  });

  describe('findAll', () => {
    it('should find all users', async () => {
      const mockUsers = [
        { id: '1', username: 'user1', email: 'user1@example.com' },
        { id: '2', username: 'user2', email: 'user2@example.com' },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ data: mockUsers, error: null }),
        }),
      });

      const result = await UserModel.findAll();

      expect(result).toEqual(mockUsers);
      expect(result).toHaveLength(2);
    });

    it('should filter users by role', async () => {
      const mockUsers = [
        { id: '1', username: 'admin1', role: 'admin' },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: mockUsers, error: null }),
          }),
        }),
      });

      const result = await UserModel.findAll({ role: 'admin' });

      expect(result).toEqual(mockUsers);
    });
  });

  describe('count', () => {
    it('should count all users', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({ count: 5, error: null }),
      });

      const result = await UserModel.count();

      expect(result).toBe(5);
    });
  });

  describe('delete', () => {
    it('should delete user', async () => {
      mockSupabaseClient.from.mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      });

      const result = await UserModel.delete('1');

      expect(result).toBe(true);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('users');
    });
  });
});
