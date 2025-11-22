/**
 * Authentication Service using Supabase Auth
 */

import { supabase } from './supabase';
import { User, LoginCredentials } from '../types/user';
import { handleSupabaseAuth, handleSupabaseOperation } from '@/utils/supabaseErrorHandler';

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
      console.log('🔍 Looking up email for username:', credentials.identifier);
      
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('username', credentials.identifier)
        .single();
      
      console.log('📧 Username lookup result:', { userData, userError });
      
      if (userError || !userData) {
        console.error('❌ Username lookup failed:', userError);
        throw new Error('Invalid username or password');
      }
      
      email = userData.email;
      console.log('✅ Found email for username:', email);
    }
    
    // Sign in with Supabase Auth
    console.log('🔐 Attempting login with email:', email);
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: credentials.password,
    });
    
    if (authError) {
      console.error('❌ Supabase auth error:', authError);
      
      // Map Supabase errors to user-friendly messages
      if (authError.message?.includes('Invalid login credentials')) {
        throw new Error('Username atau password salah. Silakan coba lagi.');
      } else if (authError.message?.includes('Email not confirmed')) {
        throw new Error('Email belum diverifikasi. Silakan cek email Anda.');
      } else if (authError.message?.includes('User not found')) {
        throw new Error('Username atau password salah. Silakan coba lagi.');
      } else if (authError.status === 429) {
        throw new Error('Terlalu banyak percobaan login. Silakan coba lagi nanti.');
      } else {
        throw new Error('Login gagal. Silakan coba lagi.');
      }
    }
    
    if (!authData.session || !authData.user) {
      console.error('❌ No session created after login');
      throw new Error('Login gagal. Silakan coba lagi.');
    }
    
    console.log('✅ Login successful, user ID:', authData.user.id);
    
    // Fetch user profile from users table
    console.log('📋 Fetching user profile for ID:', authData.user.id);
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();
    
    if (profileError || !profileData) {
      console.error('❌ Failed to fetch user profile:', profileError);
      throw new Error('Gagal mengambil data profil. Silakan coba lagi.');
    }
    
    console.log('✅ Profile fetched successfully:', profileData.username);
    
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
  phone: string;
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
        phone: data.phone,
        phone_verified_at: new Date().toISOString(),
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
      phone: profileData.phone,
      phoneVerifiedAt: profileData.phone_verified_at,
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
