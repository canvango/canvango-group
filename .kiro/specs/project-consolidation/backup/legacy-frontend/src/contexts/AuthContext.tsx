import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, RegisterData } from '../types/user.types';
import { supabase } from '../utils/supabase';
import toast from 'react-hot-toast';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await loadUserData(session.user.id, session.user.email || '');
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await loadUserData(session.user.id, session.user.email || '');
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async (userId: string, email: string) => {
    try {
      console.log('Loading user data for:', userId);
      
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      
      if (!supabaseUrl) {
        // No Supabase configured, use mock user data
        console.log('No Supabase configured, using mock user data');
        setUser({
          id: userId,
          username: email.split('@')[0],
          email: email,
          fullName: email.split('@')[0],
          role: 'member',
          balance: 1000000, // Mock balance
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        });
        return;
      }
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database query timeout')), 5000)
      );
      
      // Query from 'users' table (not 'user_profiles')
      const queryPromise = supabase
        .from('users')
        .select('id, username, email, full_name, role, balance, avatar, created_at, updated_at, last_login_at')
        .eq('id', userId)
        .maybeSingle();
      
      // Race between query and timeout
      const { data: userData, error } = await Promise.race([
        queryPromise,
        timeoutPromise
      ]) as any;

      if (error) {
        console.error('Error loading user data:', error);
        // Fallback to basic user object
        setUser({
          id: userId,
          username: email.split('@')[0],
          email: email,
          fullName: email.split('@')[0],
          role: 'member',
          balance: 1000000, // Mock balance
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        });
        return;
      }

      if (!userData) {
        console.warn('User not found in database, using fallback');
        setUser({
          id: userId,
          username: email.split('@')[0],
          email: email,
          fullName: email.split('@')[0],
          role: 'member',
          balance: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        });
        return;
      }

      console.log('User data loaded successfully:', userData);
      
      // Map database fields to frontend User type
      const mappedUser = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        fullName: userData.full_name,
        role: userData.role as 'guest' | 'member' | 'admin',
        balance: Number(userData.balance),
        createdAt: userData.created_at,
        updatedAt: userData.updated_at,
        lastLoginAt: userData.last_login_at,
      };
      
      console.log('Mapped user object:', mappedUser);
      console.log('User role from DB:', userData.role);
      console.log('Mapped role:', mappedUser.role);
      
      setUser(mappedUser);
    } catch (error) {
      console.error('Exception loading user data:', error);
      // Fallback to basic user object
      setUser({
        id: userId,
        username: email.split('@')[0],
        email: email,
        fullName: email.split('@')[0],
        role: 'member',
        balance: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      });
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      // Check if Supabase is configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      
      if (!supabaseUrl) {
        // Mock login for development without Supabase
        console.log('Mock login - No Supabase configured');
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Create mock user
        const mockUser: User = {
          id: 'mock-user-id',
          username: credentials.identifier,
          email: credentials.identifier.includes('@') ? credentials.identifier : `${credentials.identifier}@example.com`,
          fullName: credentials.identifier,
          role: 'member',
          balance: 1000000,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };
        
        setUser(mockUser);
        toast.success('Login berhasil! (Mock Mode)');
        return;
      }
      
      // Convert username to email if needed (case-insensitive)
      let email = credentials.identifier;
      
      // Check if identifier is an email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isEmail = emailRegex.test(credentials.identifier);
      
      if (!isEmail) {
        // If it's a username, query the database to get the email
        try {
          const { data: userData, error: queryError } = await supabase
            .from('users')
            .select('email')
            .ilike('username', credentials.identifier)
            .single();

          if (queryError || !userData) {
            toast.error('User not found');
            throw new Error('User not found');
          }

          email = userData.email;
        } catch (error: any) {
          toast.error(error.message || 'User not found');
          throw error;
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: credentials.password,
      });

      if (error) {
        toast.error(error.message);
        throw error;
      }

      if (data.user) {
        await loadUserData(data.user.id, data.user.email || '');
        toast.success('Login successful');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      // Check if Supabase is configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      
      if (!supabaseUrl) {
        // Mock register for development without Supabase
        console.log('Mock register - No Supabase configured');
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Create mock user
        const mockUser: User = {
          id: 'mock-user-' + Date.now(),
          username: data.username,
          email: data.email,
          fullName: data.fullName,
          role: 'member',
          balance: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };
        
        setUser(mockUser);
        toast.success('Registrasi berhasil! (Mock Mode)');
        return;
      }
      
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            username: data.username,
            full_name: data.fullName,
          },
        },
      });

      if (error) {
        toast.error(error.message);
        throw error;
      }

      if (authData.user) {
        // Check if email confirmation is required
        if (authData.session) {
          // User is automatically logged in
          await loadUserData(authData.user.id, authData.user.email || '');
          toast.success('Registration successful');
        } else {
          // Email confirmation required
          toast.success('Registration successful! Please check your email to confirm your account.');
        }
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(error.message);
        throw error;
      }
      setUser(null);
      toast.success('Logged out successfully');
    } catch (error: any) {
      const errorMessage = error.message || 'Logout failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  const isAuthenticated = user !== null;
  const isGuest = user === null;

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isGuest,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
