/**
 * User Type Definitions
 * Centralized types for user-related data structures
 */

export enum UserRole {
  MEMBER = 'member',
  ADMIN = 'admin'
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  balance: number;
  createdAt: string;
  lastLoginAt?: string;
  emailVerified?: boolean;
  phoneNumber?: string;
}

export interface UserProfile extends User {
  // Additional profile fields
  avatar?: string;
  bio?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  language: string;
  timezone: string;
  currency: string;
}

export interface UserStats {
  totalTransactions: number;
  totalSpent: number;
  totalTopUp: number;
  accountsPurchased: number;
  successRate: number;
  averageOrderValue: number;
  lastPurchaseDate?: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export interface UpdateProfileData {
  username?: string;
  email?: string;
  phoneNumber?: string;
  avatar?: string;
  bio?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
  refreshToken?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
