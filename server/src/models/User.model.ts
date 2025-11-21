import { getSupabaseClient } from '../config/supabase.js';
import { cache, CacheKeys, CacheInvalidation } from '../utils/cache.js';

export type UserRole = 'guest' | 'member' | 'admin';

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
  balance: number;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

export interface CreateUserInput {
  id: string; // Supabase auth user ID
  username: string;
  email: string;
  full_name: string;
  role?: UserRole;
}

export interface UpdateUserInput {
  username?: string;
  email?: string;
  full_name?: string;
  role?: UserRole;
  balance?: number;
}

export class UserModel {
  private static get supabase() {
    return getSupabaseClient();
  }

  /**
   * Create a new user (called after Supabase Auth registration)
   */
  static async create(userData: CreateUserInput): Promise<User | null> {
    const insertData = {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      password: '', // Password managed by Supabase Auth
      full_name: userData.full_name,
      role: userData.role || ('member' as UserRole),
      balance: 0
    };

    const { data, error } = await this.supabase
      .from('users')
      .insert(insertData as any)
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return null;
    }

    return data as User;
  }

  /**
   * Find user by ID
   */
  static async findById(id: string): Promise<User | null> {
    // Check cache first
    const cached = cache.get<User>(CacheKeys.user(id));
    if (cached) {
      return cached;
    }

    const { data, error } = await this.supabase
      .from('users')
      .select('id, username, email, password, full_name, role, balance, created_at, updated_at, last_login_at')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('Error finding user by ID:', error);
      return null;
    }

    // Cache the result for 5 minutes
    if (data) {
      cache.set(CacheKeys.user(id), data as User, 5 * 60 * 1000);
    }

    return data as User;
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<User | null> {
    // Check cache first
    const cached = cache.get<User>(CacheKeys.userByEmail(email));
    if (cached) {
      return cached;
    }

    const { data, error } = await this.supabase
      .from('users')
      .select('id, username, email, password, full_name, role, balance, created_at, updated_at, last_login_at')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error finding user by email:', error);
      return null;
    }

    // Cache the result
    if (data) {
      const user = data as User;
      cache.set(CacheKeys.userByEmail(email), user, 5 * 60 * 1000);
      cache.set(CacheKeys.user(user.id), user, 5 * 60 * 1000);
    }

    return data as User;
  }

  /**
   * Find user by username (case-insensitive)
   */
  static async findByUsername(username: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('id, username, email, password, full_name, role, balance, created_at, updated_at, last_login_at')
      .ilike('username', username)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error finding user by username:', error);
      return null;
    }

    return data as User;
  }

  /**
   * Find user by email or username (case-insensitive for username)
   */
  static async findByEmailOrUsername(identifier: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('id, username, email, password, full_name, role, balance, created_at, updated_at, last_login_at')
      .or(`email.eq.${identifier},username.ilike.${identifier}`)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error finding user:', error);
      return null;
    }

    return data as User;
  }

  /**
   * Update user
   */
  static async update(id: string, userData: UpdateUserInput): Promise<User | null> {
    // Build update object with only provided fields
    const updateData: any = {};
    
    if (userData.username !== undefined) {
      updateData.username = userData.username;
    }
    if (userData.email !== undefined) {
      updateData.email = userData.email;
    }
    if (userData.full_name !== undefined) {
      updateData.full_name = userData.full_name;
    }
    if (userData.role !== undefined) {
      updateData.role = userData.role;
    }
    if (userData.balance !== undefined) {
      updateData.balance = userData.balance;
    }

    // If no fields to update, return current user
    if (Object.keys(updateData).length === 0) {
      return this.findById(id);
    }

    const { data, error } = await (this.supabase
      .from('users')
      .update as any)(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return null;
    }

    // Invalidate cache
    CacheInvalidation.user(id);

    return data as User;
  }

  /**
   * Update last login timestamp
   */
  static async updateLastLogin(id: string): Promise<void> {
    const updateData = {
      last_login_at: new Date().toISOString()
    };

    const { error } = await (this.supabase
      .from('users')
      .update as any)(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating last login:', error);
    }
  }

  /**
   * Delete user
   */
  static async delete(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting user:', error);
      return false;
    }

    return true;
  }

  /**
   * Get all users with optional filtering
   */
  static async findAll(filters?: {
    role?: UserRole;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<User[]> {
    let query = this.supabase.from('users').select('id, username, email, full_name, role, balance, created_at, updated_at, last_login_at');

    if (filters?.role) {
      query = query.eq('role', filters.role);
    }

    if (filters?.search) {
      query = query.or(`username.ilike.%${filters.search}%,email.ilike.%${filters.search}%,full_name.ilike.%${filters.search}%`);
    }

    query = query.order('created_at', { ascending: false });

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error finding users:', error);
      return [];
    }

    return (data || []) as User[];
  }

  /**
   * Count users with optional filtering
   */
  static async count(filters?: { role?: UserRole; search?: string }): Promise<number> {
    let query = this.supabase.from('users').select('*', { count: 'exact', head: true });

    if (filters?.role) {
      query = query.eq('role', filters.role);
    }

    if (filters?.search) {
      query = query.or(`username.ilike.%${filters.search}%,email.ilike.%${filters.search}%,full_name.ilike.%${filters.search}%`);
    }

    const { count, error } = await query;

    if (error) {
      console.error('Error counting users:', error);
      return 0;
    }

    return count || 0;
  }

  /**
   * Update user balance
   * Note: This uses a PostgreSQL function for atomic balance updates
   * The function must be created in the database first (see src/database/functions/update_user_balance.sql)
   */
  static async updateBalance(id: string, amount: number): Promise<User | null> {
    // Use RPC function for atomic balance update
    const { error } = await this.supabase
      .rpc('update_user_balance' as any, {
        user_id: id,
        amount_change: amount
      } as any);

    if (error) {
      console.error('Error updating balance:', error);
      return null;
    }

    // Invalidate cache
    CacheInvalidation.user(id);

    return this.findById(id);
  }

  /**
   * Validate user data
   */
  static validateUserData(userData: Partial<CreateUserInput>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (userData.username !== undefined) {
      if (userData.username.length < 3) {
        errors.push('Username must be at least 3 characters long');
      }
      if (userData.username.length > 50) {
        errors.push('Username must not exceed 50 characters');
      }
      if (!/^[a-zA-Z0-9_]+$/.test(userData.username)) {
        errors.push('Username can only contain letters, numbers, and underscores');
      }
    }

    if (userData.email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        errors.push('Invalid email format');
      }
    }

    if (userData.full_name !== undefined) {
      if (userData.full_name.length < 2) {
        errors.push('Full name must be at least 2 characters long');
      }
      if (userData.full_name.length > 255) {
        errors.push('Full name must not exceed 255 characters');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
