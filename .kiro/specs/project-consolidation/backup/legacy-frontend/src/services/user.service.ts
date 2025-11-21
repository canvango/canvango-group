import apiClient from './api';

// Types
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: 'member' | 'admin';
  balance: number;
  createdAt: string;
  lastLoginAt?: string;
}

export interface UserStats {
  totalTransactions: number;
  totalSpent: number;
  totalTopUp: number;
  accountsPurchased: number;
  successRate: number;
}

export interface UpdateProfileRequest {
  username?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

// User Service
export const userService = {
  /**
   * Get current user profile
   */
  async getProfile(): Promise<UserProfile> {
    const response = await apiClient.get('/user/profile');
    return response.data;
  },

  /**
   * Get user statistics
   */
  async getStats(): Promise<UserStats> {
    const response = await apiClient.get('/user/stats');
    return response.data;
  },

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<{
    success: boolean;
    message: string;
    user: UserProfile;
  }> {
    const response = await apiClient.put('/user/profile', data);
    return response.data;
  },

  /**
   * Get user balance
   */
  async getBalance(): Promise<{ balance: number }> {
    const response = await apiClient.get('/user/balance');
    return response.data;
  },

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await apiClient.post('/user/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  }
};

export default userService;
