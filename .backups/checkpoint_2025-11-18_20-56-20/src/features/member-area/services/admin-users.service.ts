import apiClient from './api';

export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: 'guest' | 'member' | 'admin';
  balance: number;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

export interface GetUsersParams {
  role?: 'guest' | 'member' | 'admin';
  search?: string;
  page?: number;
  limit?: number;
}

export interface GetUsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  full_name?: string;
}

export interface UpdateBalanceData {
  balance: number;
}

export interface UpdateRoleData {
  role: 'guest' | 'member' | 'admin';
}

/**
 * Admin Users Service
 * Handles administrative operations for user management
 */
export const adminUsersService = {
  /**
   * Get all users with filtering, search, and pagination
   */
  getAllUsers: async (params?: GetUsersParams): Promise<GetUsersResponse> => {
    const response = await apiClient.get('/admin/users', { params });
    return response.data.data;
  },

  /**
   * Update user details
   */
  updateUser: async (userId: string, data: UpdateUserData): Promise<User> => {
    const response = await apiClient.put(`/admin/users/${userId}`, data);
    return response.data.data;
  },

  /**
   * Update user balance
   */
  updateUserBalance: async (userId: string, data: UpdateBalanceData): Promise<User> => {
    const response = await apiClient.put(`/admin/users/${userId}/balance`, data);
    return response.data.data;
  },

  /**
   * Update user role
   */
  updateUserRole: async (userId: string, data: UpdateRoleData): Promise<User> => {
    const response = await apiClient.put(`/admin/users/${userId}/role`, data);
    return response.data.data;
  },

  /**
   * Delete user
   */
  deleteUser: async (userId: string): Promise<void> => {
    await apiClient.delete(`/admin/users/${userId}`);
  },
};
