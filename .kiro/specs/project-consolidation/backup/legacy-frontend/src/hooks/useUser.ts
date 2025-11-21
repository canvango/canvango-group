import { useState, useEffect } from 'react';
import { userService, type UserProfile, type UserStats, type UpdateProfileRequest } from '../services/user.service';

interface UseUserReturn {
  profile: UserProfile | null;
  stats: UserStats | null;
  balance: number;
  loading: boolean;
  error: string | null;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshBalance: () => Promise<void>;
}

/**
 * useUser - Hook for managing user profile and stats
 */
export const useUser = (): UseUserReturn => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      const data = await userService.getProfile();
      setProfile(data);
      setBalance(data.balance);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    }
  };

  const fetchStats = async () => {
    try {
      const data = await userService.getStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    }
  };

  const fetchBalance = async () => {
    try {
      const data = await userService.getBalance();
      setBalance(data.balance);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch balance');
    }
  };

  const updateProfile = async (data: UpdateProfileRequest) => {
    setLoading(true);
    setError(null);

    try {
      const result = await userService.updateProfile(data);
      if (result.success) {
        setProfile(result.user);
      } else {
        throw new Error(result.message || 'Update failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      await Promise.all([fetchProfile(), fetchStats()]);
      setLoading(false);
    };

    loadUserData();
  }, []);

  return {
    profile,
    stats,
    balance,
    loading,
    error,
    updateProfile,
    refreshProfile: fetchProfile,
    refreshBalance: fetchBalance
  };
};

export default useUser;
