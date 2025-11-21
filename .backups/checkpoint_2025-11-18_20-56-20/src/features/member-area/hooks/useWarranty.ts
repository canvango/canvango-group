import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchWarrantyClaims,
  fetchClaimById,
  submitWarrantyClaim,
  fetchEligibleAccounts,
  fetchWarrantyStats,
  SubmitClaimData
} from '../services/warranty.service';
import { WarrantyClaim } from '../types/warranty';

/**
 * Hook to fetch all warranty claims
 */
export const useWarrantyClaims = () => {
  return useQuery({
    queryKey: ['warranty', 'claims'],
    queryFn: fetchWarrantyClaims
  });
};

/**
 * Hook to fetch a specific warranty claim
 */
export const useWarrantyClaim = (claimId: string) => {
  return useQuery({
    queryKey: ['warranty', 'claims', claimId],
    queryFn: () => fetchClaimById(claimId),
    enabled: !!claimId
  });
};

/**
 * Hook to fetch eligible accounts for warranty claim
 */
export const useEligibleAccounts = () => {
  return useQuery({
    queryKey: ['warranty', 'eligible-accounts'],
    queryFn: fetchEligibleAccounts
  });
};

/**
 * Hook to fetch warranty statistics
 */
export const useWarrantyStats = () => {
  return useQuery({
    queryKey: ['warranty', 'stats'],
    queryFn: fetchWarrantyStats
  });
};

/**
 * Hook to submit a warranty claim
 */
export const useSubmitClaim = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SubmitClaimData) => submitWarrantyClaim(data),
    onSuccess: (_newClaim: WarrantyClaim) => {
      // Invalidate and refetch claims
      queryClient.invalidateQueries({ queryKey: ['warranty', 'claims'] });
      // Invalidate eligible accounts as the claimed account is no longer eligible
      queryClient.invalidateQueries({ queryKey: ['warranty', 'eligible-accounts'] });
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: ['warranty', 'stats'] });
      // Invalidate transactions as warranty status may have changed
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    }
  });
};
