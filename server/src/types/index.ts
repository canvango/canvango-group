export type UserRole = 'guest' | 'member' | 'admin';

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
