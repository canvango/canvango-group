import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

/**
 * useAuth - Hook to access authentication context
 * 
 * @throws Error if used outside of AuthProvider
 * @returns AuthContextType with user, isAuthenticated, loading, login, register, logout
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default useAuth;
