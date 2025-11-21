import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import {
  fetchUserProfile,
  fetchUserStats,
  fetchUserBalance,
  updateUserProfile,
  UserProfile,
  UserStats,
  UserBalance,
  UpdateProfileData,
} from '../services/user.service';

/**
 * Hook to fetch user profile
 */
export const useUserProfile = (): UseQueryResult<UserProfile, Error> => {
  return useQuery({
    queryKey: ['userProfile'],
    queryFn: fetchUserProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

/**
 * Hook to fetch user statistics
 */
export const useUserStats = (): UseQueryResult<UserStats, Error> => {
  return useQuery({
    queryKey: ['userStats'],
    queryFn: fetchUserStats,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to fetch user balance
 */
export const useUserBalance = (): UseQueryResult<UserBalance, Error> => {
  return useQuery({
    queryKey: ['userBalance'],
    queryFn: fetchUserBalance,
    staleTime: 1 * 60 * 1000, // 1 minute - balance changes frequently
  });
};

/**
 * Hook to update user profile
 */
export const useUpdateProfile = (): UseMutationResult<UserProfile, Error, UpdateProfileData> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (data) => {
      // Update the cached profile data
      queryClient.setQueryData(['userProfile'], data);
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
};

/**
 * Combined hook for user data management
 * Provides profile, stats, and balance in a single hook
 */
export const useUser = () => {
  const profileQuery = useUserProfile();
  const statsQuery = useUserStats();
  const balanceQuery = useUserBalance();
  const updateProfileMutation = useUpdateProfile();

  return {
    // Profile data
    profile: profileQuery.data,
    profileLoading: profileQuery.isLoading,
    profileError: profileQuery.error,
    
    // Stats data
    stats: statsQuery.data,
    statsLoading: statsQuery.isLoading,
    statsError: statsQuery.error,
    
    // Balance data
    balance: balanceQuery.data?.balance ?? 0,
    balanceLoading: balanceQuery.isLoading,
    balanceError: balanceQuery.error,
    
    // Combined loading state
    loading: profileQuery.isLoading || statsQuery.isLoading || balanceQuery.isLoading,
    
    // Combined error state
    error: profileQuery.error || statsQuery.error || balanceQuery.error,
    
    // Update profile
    updateProfile: updateProfileMutation.mutate,
    updateProfileAsync: updateProfileMutation.mutateAsync,
    isUpdating: updateProfileMutation.isPending,
    updateError: updateProfileMutation.error,
    
    // Refetch functions
    refreshProfile: profileQuery.refetch,
    refreshStats: statsQuery.refetch,
    refreshBalance: balanceQuery.refetch,
    refreshAll: () => {
      profileQuery.refetch();
      statsQuery.refetch();
      balanceQuery.refetch();
    },
  };
};
