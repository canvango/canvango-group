/**
 * User Service
 * 
 * @module services/user
 * @description
 * Provides API functions for managing user profile and statistics including
 * fetching user profile data, updating profile information, and retrieving
 * user statistics for dashboard display.
 * 
 * @example
 * ```typescript
 * import { fetchUserProfile, updateUserProfile } from './services/user.service';
 * 
 * // Fetch user profile
 * const user = await fetchUserProfile();
 * 
 * // Update profile
 * await updateUserProfile({ username: 'newname' });
 * ```
 */

import apiClient from './api';
import { User, UserStats as UserStatsType } from '../types/user';

/**
 * User profile data structure
 */
export type UserProfile = User;

/**
 * User statistics data structure
 */
export type UserStats = UserStatsType;

/**
 * User balance data structure
 */
export interface UserBalance {
  balance: number;
  currency: string;
  lastUpdated: string;
}

/**
 * Data for updating user profile
 */
export interface UpdateProfileData {
  username?: string;
  email?: string;
  fullName?: string;
  avatar?: string;
}

/**
 * Fetch the current user's profile
 * 
 * @async
 * @function fetchUserProfile
 * @returns {Promise<User>} User profile data including stats
 * 
 * @throws {Error} When user is not authenticated or API request fails
 * 
 * @example
 * ```typescript
 * const user = await fetchUserProfile();
 * console.log(user.username, user.email);
 * console.log('Balance:', user.balance);
 * console.log('Total Purchases:', user.stats.totalPurchases);
 * ```
 * 
 * @see {@link User} for user data structure
 */
export const fetchUserProfile = async (): Promise<User> => {
  const response = await apiClient.get<User>('/user/profile');
  return response.data;
};

/**
 * Fetch user statistics
 * 
 * @async
 * @function fetchUserStats
 * @returns {Promise<UserStats>} User statistics including purchases, spending, and success rate
 * 
 * @throws {Error} When API request fails
 * 
 * @example
 * ```typescript
 * const stats = await fetchUserStats();
 * console.log(`Total Purchases: ${stats.totalPurchases}`);
 * console.log(`Total Spending: Rp ${stats.totalSpending.toLocaleString()}`);
 * console.log(`Success Rate: ${stats.successRate}%`);
 * ```
 * 
 * @see {@link UserStats} for statistics structure
 */
export const fetchUserStats = async (): Promise<UserStats> => {
  const response = await apiClient.get<UserStats>('/user/stats');
  return response.data;
};

/**
 * Fetch user balance
 * 
 * @async
 * @function fetchUserBalance
 * @returns {Promise<UserBalance>} User balance information
 * 
 * @throws {Error} When API request fails
 * 
 * @example
 * ```typescript
 * const balanceData = await fetchUserBalance();
 * console.log(`Balance: Rp ${balanceData.balance.toLocaleString()}`);
 * ```
 */
export const fetchUserBalance = async (): Promise<UserBalance> => {
  const response = await apiClient.get<UserBalance>('/user/balance');
  return response.data;
};

/**
 * Update user profile information
 * 
 * @async
 * @function updateUserProfile
 * @param {UpdateProfileData} data - Profile data to update
 * @returns {Promise<UserProfile>} Updated user profile
 * 
 * @throws {Error} When validation fails or API request fails
 * 
 * @example
 * ```typescript
 * // Update username
 * const updatedUser = await updateUserProfile({
 *   username: 'newusername'
 * });
 * 
 * // Update multiple fields
 * const user = await updateUserProfile({
 *   username: 'newname',
 *   email: 'newemail@example.com',
 *   avatar: 'https://example.com/avatar.jpg'
 * });
 * ```
 * 
 * @security
 * - Email changes may require verification
 * - Username must be unique
 * - Avatar should be validated for size and format
 */
export const updateUserProfile = async (
  data: UpdateProfileData
): Promise<UserProfile> => {
  const response = await apiClient.patch<UserProfile>('/user/profile', data);
  return response.data;
};

/**
 * Change user password
 * 
 * @interface ChangePasswordData
 * @property {string} currentPassword - Current password for verification
 * @property {string} newPassword - New password to set
 */
export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

/**
 * Change user password
 * 
 * @async
 * @function changePassword
 * @param {ChangePasswordData} data - Current and new password
 * @returns {Promise<{ message: string }>} Success message
 * 
 * @throws {Error} When current password is incorrect or new password is invalid
 * 
 * @example
 * ```typescript
 * await changePassword({
 *   currentPassword: 'oldpass123',
 *   newPassword: 'newSecurePass456!'
 * });
 * ```
 * 
 * @security
 * - Current password must be verified
 * - New password must meet strength requirements
 * - User session may be invalidated after password change
 */
export const changePassword = async (
  data: ChangePasswordData
): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>(
    '/user/change-password',
    data
  );
  return response.data;
};

/**
 * Upload user avatar
 * 
 * @async
 * @function uploadAvatar
 * @param {File} file - Avatar image file
 * @returns {Promise<{ avatarUrl: string }>} URL of uploaded avatar
 * 
 * @throws {Error} When file is too large or invalid format
 * 
 * @example
 * ```typescript
 * const file = event.target.files[0];
 * const result = await uploadAvatar(file);
 * console.log('Avatar URL:', result.avatarUrl);
 * ```
 * 
 * @security
 * - File size should be limited (e.g., 2MB)
 * - Only image formats allowed (jpg, png, webp)
 * - File should be scanned for malware
 */
export const uploadAvatar = async (
  file: File
): Promise<{ avatarUrl: string }> => {
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await apiClient.post<{ avatarUrl: string }>(
    '/user/avatar',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

/**
 * Delete user avatar
 * 
 * @async
 * @function deleteAvatar
 * @returns {Promise<{ message: string }>} Success message
 * 
 * @throws {Error} When API request fails
 * 
 * @example
 * ```typescript
 * await deleteAvatar();
 * console.log('Avatar deleted successfully');
 * ```
 */
export const deleteAvatar = async (): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>('/user/avatar');
  return response.data;
};

/**
 * Fetch user notification preferences
 * 
 * @interface NotificationPreferences
 * @property {boolean} emailNotifications - Enable email notifications
 * @property {boolean} transactionAlerts - Alert on transaction status changes
 * @property {boolean} warrantyReminders - Remind before warranty expiration
 * @property {boolean} promotionalEmails - Receive promotional emails
 */
export interface NotificationPreferences {
  emailNotifications: boolean;
  transactionAlerts: boolean;
  warrantyReminders: boolean;
  promotionalEmails: boolean;
}

/**
 * Fetch user notification preferences
 * 
 * @async
 * @function fetchNotificationPreferences
 * @returns {Promise<NotificationPreferences>} User's notification settings
 * 
 * @throws {Error} When API request fails
 * 
 * @example
 * ```typescript
 * const prefs = await fetchNotificationPreferences();
 * console.log('Email notifications:', prefs.emailNotifications);
 * ```
 */
export const fetchNotificationPreferences = async (): Promise<NotificationPreferences> => {
  const response = await apiClient.get<NotificationPreferences>(
    '/user/preferences/notifications'
  );
  return response.data;
};

/**
 * Update user notification preferences
 * 
 * @async
 * @function updateNotificationPreferences
 * @param {Partial<NotificationPreferences>} preferences - Preferences to update
 * @returns {Promise<NotificationPreferences>} Updated preferences
 * 
 * @throws {Error} When API request fails
 * 
 * @example
 * ```typescript
 * const updated = await updateNotificationPreferences({
 *   emailNotifications: true,
 *   transactionAlerts: true
 * });
 * ```
 */
export const updateNotificationPreferences = async (
  preferences: Partial<NotificationPreferences>
): Promise<NotificationPreferences> => {
  const response = await apiClient.patch<NotificationPreferences>(
    '/user/preferences/notifications',
    preferences
  );
  return response.data;
};
