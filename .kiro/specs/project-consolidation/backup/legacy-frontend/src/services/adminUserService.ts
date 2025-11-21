import api from '../utils/api';

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
 * Get all users with filtering, search, and pagination
 */
export async function getAllUsers(params?: GetUsersParams): Promise<GetUsersResponse> {
  const response = await api.get('/admin/users', { params });
  return response.data.data;
}

/**
 * Update user details
 */
export async function updateUser(userId: string, data: UpdateUserData): Promise<User> {
  const response = await api.put(`/admin/users/${userId}`, data);
  return response.data.data;
}

/**
 * Update user balance
 */
export async function updateUserBalance(userId: string, data: UpdateBalanceData): Promise<User> {
  const response = await api.put(`/admin/users/${userId}/balance`, data);
  return response.data.data;
}

/**
 * Update user role
 */
export async function updateUserRole(userId: string, data: UpdateRoleData): Promise<User> {
  const response = await api.put(`/admin/users/${userId}/role`, data);
  return response.data.data;
}

/**
 * Delete user
 */
export async function deleteUser(userId: string): Promise<void> {
  await api.delete(`/admin/users/${userId}`);
}
