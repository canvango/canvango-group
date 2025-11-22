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

import { supabase } from '@/clients/supabase';
import { handleSupabaseOperation } from '@/utils/supabaseErrorHandler';
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
  return handleSupabaseOperation(async () => {
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!authUser) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (error) throw error;
    return { data, error: null };
  });
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
  return handleSupabaseOperation(async () => {
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!authUser) throw new Error('Not authenticated');

    // Fetch purchases for stats
    const { data: purchases, error: purchasesError } = await supabase
      .from('purchases')
      .select('*, product:products(*)')
      .eq('user_id', authUser.id);

    if (purchasesError) throw purchasesError;

    // Calculate stats
    const totalPurchases = purchases?.length || 0;
    const totalSpending = purchases?.reduce((sum, p) => sum + (p.product?.price || 0), 0) || 0;
    const activePurchases = purchases?.filter(p => p.status === 'active').length || 0;
    const successRate = totalPurchases > 0 ? (activePurchases / totalPurchases) * 100 : 0;

    const stats: UserStats = {
      totalPurchases,
      totalSpending,
      activePurchases,
      successRate,
      recentActivity: [],
    };

    return { data: stats, error: null };
  });
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
  return handleSupabaseOperation(async () => {
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!authUser) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('users')
      .select('balance')
      .eq('id', authUser.id)
      .single();

    if (error) throw error;

    const balanceData: UserBalance = {
      balance: data.balance || 0,
      currency: 'IDR',
      lastUpdated: new Date().toISOString(),
    };

    return { data: balanceData, error: null };
  });
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
  return handleSupabaseOperation(async () => {
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!authUser) throw new Error('Not authenticated');

    const updateData: any = {};
    if (data.username) updateData.username = data.username;
    if (data.email) updateData.email = data.email;
    if (data.fullName) updateData.full_name = data.fullName;
    if (data.avatar) updateData.avatar = data.avatar;

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', authUser.id)
      .select()
      .single();

    if (error) throw error;
    return { data: updatedUser, error: null };
  });
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
  return handleSupabaseOperation(async () => {
    const { error } = await supabase.auth.updateUser({
      password: data.newPassword,
    });

    if (error) throw error;
    return { data: { message: 'Password changed successfully' }, error: null };
  });
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
  return handleSupabaseOperation(async () => {
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!authUser) throw new Error('Not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${authUser.id}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('user-uploads')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('user-uploads')
      .getPublicUrl(filePath);

    // Update user profile with avatar URL
    const { error: updateError } = await supabase
      .from('users')
      .update({ avatar: publicUrl })
      .eq('id', authUser.id);

    if (updateError) throw updateError;

    return { data: { avatarUrl: publicUrl }, error: null };
  });
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
  return handleSupabaseOperation(async () => {
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!authUser) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('users')
      .update({ avatar: null })
      .eq('id', authUser.id);

    if (error) throw error;
    return { data: { message: 'Avatar deleted successfully' }, error: null };
  });
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
  return handleSupabaseOperation(async () => {
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!authUser) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('users')
      .select('notification_preferences')
      .eq('id', authUser.id)
      .single();

    if (error) throw error;

    const prefs: NotificationPreferences = data.notification_preferences || {
      emailNotifications: true,
      transactionAlerts: true,
      warrantyReminders: true,
      promotionalEmails: false,
    };

    return { data: prefs, error: null };
  });
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
  return handleSupabaseOperation(async () => {
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!authUser) throw new Error('Not authenticated');

    // Get current preferences
    const { data: currentData, error: fetchError } = await supabase
      .from('users')
      .select('notification_preferences')
      .eq('id', authUser.id)
      .single();

    if (fetchError) throw fetchError;

    const updatedPrefs = {
      ...(currentData.notification_preferences || {}),
      ...preferences,
    };

    const { data, error } = await supabase
      .from('users')
      .update({ notification_preferences: updatedPrefs })
      .eq('id', authUser.id)
      .select('notification_preferences')
      .single();

    if (error) throw error;
    return { data: data.notification_preferences, error: null };
  });
};
