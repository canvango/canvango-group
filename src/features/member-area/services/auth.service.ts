/**
 * Authentication Service using Supabase Native Auth
 * 
 * This service handles all authentication operations using Supabase's native
 * authentication system. Key features:
 * - No custom JWT claims - role is always queried from database
 * - Username-to-email conversion for flexible login
 * - Fresh role data on every request (no caching)
 * 
 * @module auth.service
 */

import { supabase } from '@/clients/supabase';
import { User, LoginCredentials } from '../types/user';

/**
 * Login with email or username and password
 * 
 * This function handles authentication using Supabase native auth.
 * If a username is provided, it's automatically converted to email.
 * User role is fetched fresh from the database after authentication.
 * 
 * @param credentials - Login credentials (email/username and password)
 * @returns Promise with access token, refresh token, and user data
 * @throws Error if login fails or credentials are invalid
 * 
 * @example
 * ```typescript
 * // Login with email
 * const result = await login({ identifier: 'user@example.com', password: 'pass123' });
 * 
 * // Login with username (auto-converted to email)
 * const result = await login({ identifier: 'username', password: 'pass123' });
 * ```
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
      // Convert username to lowercase for case-insensitive lookup
      const lowercaseUsername = credentials.identifier.toLowerCase();
      console.log('🔍 Looking up email for username (case-insensitive):', lowercaseUsername);
      
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email')
        .ilike('username', lowercaseUsername)
        .single();
      
      console.log('📧 Username lookup result:', { userData, userError });
      
      if (userError || !userData) {
        console.error('❌ Username lookup failed:', {
          error: userError,
          message: userError?.message,
          code: userError?.code,
          details: userError?.details
        });
        throw new Error('Username atau password salah. Silakan coba lagi.');
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
 * Logout current user and clear session
 * 
 * Terminates the Supabase session and clears all stored tokens.
 * Handles expired sessions gracefully without throwing errors.
 * 
 * @throws Error only if logout fails for reasons other than expired session
 */
export const logout = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      // Ignore errors related to expired/invalid sessions
      // These are expected when user has been idle
      if (
        error.message?.includes('session_not_found') ||
        error.message?.includes('invalid_token') ||
        error.message?.includes('expired') ||
        error.status === 401
      ) {
        console.log('Session already expired, proceeding with local cleanup');
        return;
      }
      
      console.error('Logout error:', error);
      throw error;
    }
  } catch (error: any) {
    // Network errors or timeouts - proceed with local cleanup
    if (error.message?.includes('Failed to fetch') || error.message?.includes('timeout')) {
      console.log('Network error during logout, proceeding with local cleanup');
      return;
    }
    throw error;
  }
};

/**
 * Get current user profile with fresh role from database
 * 
 * This function ALWAYS queries the user's role from the database,
 * ensuring the role is up-to-date. No caching is performed.
 * Includes timeout and better error handling for expired sessions.
 * 
 * @returns Promise with User object or null if not authenticated
 * @throws Error if session is expired or invalid (for proper error handling upstream)
 * 
 * @example
 * ```typescript
 * const user = await getCurrentUser();
 * if (user) {
 *   console.log('Current role:', user.role); // Always fresh from DB
 * }
 * ```
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    // Get current session with timeout
    const sessionPromise = supabase.auth.getSession();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Session check timeout')), 3000)
    );
    
    const { data: { session }, error: sessionError } = await Promise.race([
      sessionPromise,
      timeoutPromise
    ]) as any;
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      
      // Check if it's an auth error that should clear tokens
      const isAuthError = 
        sessionError.status === 401 || 
        sessionError.status === 403 ||
        sessionError.message?.includes('JWT') ||
        sessionError.message?.includes('expired') ||
        sessionError.message?.includes('invalid');
      
      if (isAuthError) {
        // Throw error so upstream can handle token cleanup
        throw new Error('Session expired or invalid');
      }
      
      return null;
    }
    
    if (!session) {
      return null;
    }
    
    // Check if session is expired
    const now = Math.floor(Date.now() / 1000);
    if (session.expires_at && session.expires_at < now) {
      console.warn('⚠️ Session expired');
      throw new Error('Session expired');
    }
    
    // Fetch user profile with fresh role from database with timeout
    const profilePromise = supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    const profileTimeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Profile fetch timeout')), 3000)
    );
    
    const { data: profileData, error: profileError } = await Promise.race([
      profilePromise,
      profileTimeoutPromise
    ]) as any;
    
    if (profileError) {
      console.error('Failed to fetch user profile:', profileError);
      
      // Check if it's a critical error
      if (profileError.code === 'PGRST116') {
        // User not found in database
        console.error('User profile not found in database');
        throw new Error('User profile not found');
      }
      
      // For other errors, return graceful fallback
      return {
        id: session.user.id,
        username: session.user.email?.split('@')[0] || 'user',
        email: session.user.email || '',
        fullName: session.user.email?.split('@')[0] || 'user',
        balance: 0,
        role: 'member', // Fallback to 'member' role for safety
        createdAt: session.user.created_at,
        updatedAt: new Date().toISOString(),
      };
    }
    
    if (!profileData) {
      console.error('No profile data found for user');
      return null;
    }
    
    // Map to User type with role always from database
    const user: User = {
      id: profileData.id,
      username: profileData.username,
      email: profileData.email,
      fullName: profileData.full_name || profileData.username,
      balance: profileData.balance || 0,
      role: profileData.role || 'member', // Always from database, fallback to 'member'
      createdAt: profileData.created_at,
      updatedAt: profileData.updated_at,
    };
    
    return user;
  } catch (error: any) {
    console.error('Get current user error:', error);
    
    // Re-throw auth errors for proper handling upstream
    if (
      error?.message?.includes('expired') ||
      error?.message?.includes('invalid') ||
      error?.message?.includes('timeout') ||
      error?.message?.includes('not found')
    ) {
      throw error;
    }
    
    return null;
  }
};

/**
 * Refresh access token using refresh token
 * 
 * @returns Promise with new access token and refresh token, or null if refresh fails
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
 * Register new user with default 'member' role
 * 
 * Creates a new user account in Supabase Auth and creates a corresponding
 * profile in the users table with role set to 'member' by default.
 * 
 * @param data - Registration data including email, username, password, etc.
 * @returns Promise with created User object
 * @throws Error if registration fails
 */
export const register = async (data: {
  email: string;
  username: string;
  password: string;
  fullName?: string;
  phone: string;
}): Promise<User> => {
  try {
    // Convert username to lowercase for case-insensitive storage
    const lowercaseUsername = data.username.toLowerCase();
    
    // Sign up with Supabase Auth
    // Pass user metadata so trigger can extract phone
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          username: lowercaseUsername,
          full_name: data.fullName || lowercaseUsername,
          phone: data.phone,
        }
      }
    });
    
    if (authError) {
      throw authError;
    }
    
    if (!authData.user) {
      throw new Error('Registration failed - no user created');
    }
    
    // Fetch user profile created by trigger
    // The trigger already created the profile with phone from metadata
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
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
