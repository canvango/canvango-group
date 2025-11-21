export interface User {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  role: 'guest' | 'member' | 'admin';
  balance: number;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
  emailVerified?: boolean;
  phoneNumber?: string;
  stats?: UserStats;
}

export interface UserStats {
  totalPurchases: number;
  totalSpending: number;
  totalTopUps: number;
  successRate: number;
}

export interface LoginCredentials {
  identifier: string; // Can be email or username
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  fullName: string;
}
