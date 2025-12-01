import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, LoginCredentials } from '../types/user';
import * as authService from '../services/auth.service';
import { supabase } from '@/clients/supabase';
import { clearAllFilterPreferences } from '../../../shared/hooks/useLocalStorageFilters';
import { refreshCSRFToken, clearCSRFToken } from '../../../shared/utils/csrf';
import { useNotification } from '../../../shared/hooks/useNotification';


interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  loading: boolean; // Alias for compatibility
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: import('../types/user').RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Token storage keys
const TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
// USER_DATA_KEY removed - role is no longer cached in localStorage

// Flag to prevent race conditions
let isFetchingProfile = false;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const notification = useNotification();

  /**
   * Fetch user profile from Supabase with race condition prevention
   * Note: User data (including role) is NOT cached in localStorage
   * Includes timeout and token cleanup on persistent errors
   */
  const fetchUserProfile = useCallback(async (): Promise<User | null> => {
    // Prevent multiple simultaneous fetches
    if (isFetchingProfile) {
      console.log('Profile fetch already in progress, skipping...');
      return null;
    }

    isFetchingProfile = true;
    
    try {
      // Add timeout to prevent hanging
      const userDataPromise = authService.getCurrentUser();
      const timeoutPromise = new Promise<null>((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
      );
      
      const userData = await Promise.race([userDataPromise, timeoutPromise]);
      
      if (!userData) {
        // If no user data returned, check if token is still valid
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
          console.warn('⚠️ Token exists but no user data - clearing invalid token');
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
        }
      }
      
      return userData;
    } catch (error: any) {
      console.error('Failed to fetch user profile:', error);
      
      // Check if it's an auth error (401, 403, expired token)
      const isAuthError = 
        error?.status === 401 || 
        error?.status === 403 ||
        error?.message?.includes('JWT') ||
        error?.message?.includes('expired') ||
        error?.message?.includes('invalid') ||
        error?.message?.includes('timeout');
      
      if (isAuthError) {
        console.warn('⚠️ Auth error detected - clearing tokens');
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      }
      
      return null;
    } finally {
      isFetchingProfile = false;
    }
  }, []);

  /**
   * Initialize auth state on mount
   * Check for stored token and validate by fetching user data
   * Also listen for Supabase auth state changes
   * Includes timeout to prevent infinite loading
   */
  useEffect(() => {
    let isMounted = true;
    
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        
        if (token) {
          // Fetch fresh user data from database (no caching)
          const userData = await fetchUserProfile();
          
          if (!isMounted) return;
          
          if (userData) {
            setUser(userData);
          } else {
            // Clear tokens if fetch failed
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear tokens on error
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Set timeout to prevent infinite loading (10 seconds max)
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn('⚠️ Auth initialization timeout - setting loading to false');
        setIsLoading(false);
      }
    }, 10000);

    initializeAuth().finally(() => {
      clearTimeout(timeoutId);
    });

    // Listen for Supabase auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event);
      
      // Ignore USER_UPDATED and PASSWORD_RECOVERY events to prevent unnecessary re-renders
      if (event === 'USER_UPDATED' || event === 'PASSWORD_RECOVERY') {
        console.log('ℹ️ Ignoring', event, 'event');
        return;
      }
      
      if (event === 'SIGNED_OUT') {
        // Auth state listener: Just ensure state is cleared
        // The logout() function already handles cleanup, so we only need to ensure consistency
        console.log('ℹ️ SIGNED_OUT event received, ensuring clean state');
        if (isMounted) {
          setUser(null);
        }
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Update tokens and fetch user data
        if (session?.access_token) {
          localStorage.setItem(TOKEN_KEY, session.access_token);
          if (session.refresh_token) {
            localStorage.setItem(REFRESH_TOKEN_KEY, session.refresh_token);
          }
          
          // Only fetch profile if not already fetching (prevent race condition)
          if (!isFetchingProfile && isMounted) {
            const userData = await fetchUserProfile();
            if (userData && isMounted) {
              setUser(userData);
            }
          } else {
            console.log('ℹ️ Profile fetch already in progress or component unmounted, skipping duplicate fetch');
          }
        }
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      authListener.subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  /**
   * Role and Balance change detection mechanism
   * Uses Realtime subscription for instant updates
   * Updates user state when role or balance changes
   */
  useEffect(() => {
    // Only run if user is logged in
    if (!user?.id) return;

    console.log('🔄 Starting Realtime subscription for user:', user.id);
    
    // Subscribe to user table changes for this specific user
    const channel = supabase
      .channel(`user-changes-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔔 User data changed:', payload);
          
          const newData = payload.new as any;
          
          // Update user state with new data using callback to avoid stale closure
          setUser((prevUser) => {
            if (!prevUser) return prevUser;
            
            // Check if role changed
            if (newData.role && newData.role !== prevUser.role) {
              console.log('🔔 Role changed:', prevUser.role, '->', newData.role);
              notification.info(`Your role has been updated to ${newData.role}`);
            }
            
            // Check if balance changed
            if (newData.balance !== undefined && newData.balance !== prevUser.balance) {
              console.log('💰 Balance changed:', prevUser.balance, '->', newData.balance);
            }
            
            return {
              ...prevUser,
              role: newData.role || prevUser.role,
              balance: newData.balance !== undefined ? newData.balance : prevUser.balance,
              username: newData.username || prevUser.username,
              email: newData.email || prevUser.email,
              fullName: newData.full_name || prevUser.fullName,
              updatedAt: newData.updated_at || prevUser.updatedAt,
            };
          });
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Realtime subscription active');
        }
      });
    
    return () => {
      console.log('🛑 Stopping Realtime subscription for user:', user.id);
      // Properly cleanup channel
      supabase.removeChannel(channel);
      console.log('✅ Realtime channel removed');
    };
  }, [user?.id, notification]); // Only depend on user.id to prevent unnecessary re-subscriptions

  /**
   * Login user with credentials using Supabase Auth
   * Note: User data is NOT cached in localStorage
   */
  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      // Don't set loading state here - let the form component handle it
      // This prevents GuestRoute from re-rendering and causing issues
      
      const { token, refreshToken, user: userData } = await authService.login(credentials);

      // Store tokens only (no user data caching)
      localStorage.setItem(TOKEN_KEY, token);
      if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      }

      // Generate new CSRF token for the session
      refreshCSRFToken();

      // Set user state (in memory only)
      setUser(userData);
      console.log('User logged in with role:', userData.role);
    } catch (error: any) {
      console.error('Login failed:', error);
      
      // Pass through the error message from auth.service (already in Indonesian)
      throw error;
    }
  };

  /**
   * Register new user with Supabase Auth
   * Note: User data is NOT cached in localStorage
   */
  const register = async (data: import('../types/user').RegisterData): Promise<void> => {
    try {
      setIsLoading(true);
      
      const userData = await authService.register(data);

      // Get session from Supabase after registration
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (sessionData?.session) {
        // Store tokens only (no user data caching)
        localStorage.setItem(TOKEN_KEY, sessionData.session.access_token);
        if (sessionData.session.refresh_token) {
          localStorage.setItem(REFRESH_TOKEN_KEY, sessionData.session.refresh_token);
        }
      }

      // Generate new CSRF token for the session
      refreshCSRFToken();

      // Set user state (in memory only)
      setUser(userData);
      console.log('User registered with role:', userData.role);
    } catch (error: any) {
      console.error('Registration failed:', error);
      
      // Provide more specific error messages
      if (error.message?.includes('already registered') || error.message?.includes('already exists')) {
        throw new Error('Email or username already exists');
      } else if (error.status === 429) {
        throw new Error('Too many registration attempts. Please try again later.');
      } else {
        throw new Error(error.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout user and clear tokens
   * Uses timeout to prevent hanging on expired sessions
   */
  const logout = useCallback(async () => {
    console.log('🔄 Starting logout process...');
    
    // Clear user state immediately for instant UI feedback
    setUser(null);
    
    try {
      // Call Supabase logout with timeout to prevent hanging
      const logoutPromise = authService.logout();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Logout timeout')), 3000)
      );
      
      await Promise.race([logoutPromise, timeoutPromise]);
      console.log('✅ Supabase logout successful');
    } catch (error) {
      console.error('❌ Logout error (continuing with cleanup):', error);
      // Continue with cleanup even if Supabase logout fails or times out
    }
    
    // Clear tokens from storage
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    
    // Clear CSRF token
    clearCSRFToken();
    
    // Clear filter preferences
    clearAllFilterPreferences();
    
    console.log('✅ User logged out, all data cleared');
  }, []);

  /**
   * Update user profile
   * Note: User data is NOT cached in localStorage
   */
  const updateProfile = async (data: Partial<User>): Promise<void> => {
    if (!user) {
      throw new Error('No user logged in');
    }
    
    try {
      // Update user profile in Supabase
      const { data: updatedData, error } = await supabase
        .from('users')
        .update({
          username: data.username,
          full_name: data.fullName,
          email: data.email,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Map to User type
      const updatedUser: User = {
        ...user,
        username: updatedData.username,
        email: updatedData.email,
        fullName: updatedData.full_name || updatedData.username,
        updatedAt: updatedData.updated_at,
      };
      
      // Update local user state (in memory only)
      setUser(updatedUser);
      console.log('Profile updated:', updatedUser);
    } catch (error: any) {
      console.error('Update profile failed:', error);
      
      if (error.code === '23505') {
        throw new Error('Username or email already exists');
      } else {
        throw new Error(error.message || 'Failed to update profile. Please try again.');
      }
    }
  };

  /**
   * Refresh user data from server
   */
  const refreshUser = async (): Promise<void> => {
    try {
      const userData = await fetchUserProfile();
      if (userData) {
        setUser(userData);
        console.log('User data refreshed:', userData);
      } else {
        console.log('Failed to refresh user data, keeping current state');
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      // Keep current user state on error
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isGuest: !user,
    isLoading,
    loading: isLoading, // Alias for compatibility with Legacy components
    login,
    register,
    logout,
    updateProfile,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to access auth context
 * Must be used within AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Get stored auth token
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Get stored refresh token
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Set auth token
 */
export const setAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Clear all auth tokens
 */
export const clearAuthTokens = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

/**
 * @deprecated User data is no longer cached in localStorage
 * Role is always fetched fresh from database
 */
export const getCachedUserData = (): User | null => {
  console.warn('getCachedUserData is deprecated - user data is no longer cached');
  return null;
};

export default AuthContext;
