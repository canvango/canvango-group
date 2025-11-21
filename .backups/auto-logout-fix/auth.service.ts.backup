/**
 * Authentication Service using Supabase Auth
 */

import { supabase } from './supabase';
import { User, LoginCredentials } from '../types/user';

/**
 * Login with email/username and password
 */
export const login = async (credentials: LoginCredentials): Promise<{
  token: string;
  refreshToken: string;
  user: User;
}> => {
  try {
    // Check if credentials.identifier is actually a username
    let email = credentials.identifier;
    
    // If it doesn't contain @, treat it as username and fetch email
    if (!credentials.identifier.includes('@')) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('username', credentials.identifier)
        .single();
      
      if (userError || !userData) {
        throw new Error('Invalid username or password');
      }
      
      email = userData.email;
    }
    
    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: credentials.password,
    });
    
    if (authError) {
      throw authError;
    }
    
    if (!authData.session || !authData.user) {
      throw new Error('Login failed - no session created');
    }
    
    // Fetch user profile from users table
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();
    
    if (profileError || !profileData) {
      throw new Error('Failed to fetch user profile');
    }
    
    // Map to User type
    const user: User = {
      id: profileData.id,
      username: profileData.username,
      email: profileData.email,
      fullName: profileData.full_name || profileData.username,
      balance: profileData.balance || 0,
      role: profileData.role || 'member',
      createdAt: profileData.created_at,
      updatedAt: profileData.updated_at,
    };
    
    return {
      token: authData.session.access_token,
      refreshToken: authData.session.refresh_token,
      user,
    };
  } catch (error: any) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Logout current user
 */
export const logout = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return null;
    }
    
    // Fetch user profile
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    if (profileError || !profileData) {
      return null;
    }
    
    // Map to User type
    const user: User = {
      id: profileData.id,
      username: profileData.username,
      email: profileData.email,
      fullName: profileData.full_name || profileData.username,
      balance: profileData.balance || 0,
      role: profileData.role || 'member',
      createdAt: profileData.created_at,
      updatedAt: profileData.updated_at,
    };
    
    return user;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

/**
 * Refresh access token
 */
export const refreshToken = async (): Promise<{
  token: string;
  refreshToken: string;
} | null> => {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error || !data.session) {
      return null;
    }
    
    return {
      token: data.session.access_token,
      refreshToken: data.session.refresh_token,
    };
  } catch (error) {
    console.error('Refresh token error:', error);
    return null;
  }
};

/**
 * Register new user
 */
export const register = async (data: {
  email: string;
  username: string;
  password: string;
  fullName?: string;
}): Promise<User> => {
  try {
    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });
    
    if (authError) {
      throw authError;
    }
    
    if (!authData.user) {
      throw new Error('Registration failed - no user created');
    }
    
    // Create user profile in users table
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: data.email,
        username: data.username,
        full_name: data.fullName || data.username,
        role: 'member',
        balance: 0,
      })
      .select()
      .single();
    
    if (profileError || !profileData) {
      throw new Error('Failed to create user profile');
    }
    
    // Map to User type
    const user: User = {
      id: profileData.id,
      username: profileData.username,
      email: profileData.email,
      fullName: profileData.full_name || profileData.username,
      balance: profileData.balance || 0,
      role: profileData.role || 'member',
      createdAt: profileData.created_at,
      updatedAt: profileData.updated_at,
    };
    
    return user;
  } catch (error: any) {
    console.error('Registration error:', error);
    throw error;
  }
};
