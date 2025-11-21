import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiKeysService } from '../services/api-keys.service';
import { APIKey, APIStats, APIEndpoint } from '../types/api';

/**
 * Hook to fetch the user's API key
 */
export const useAPIKey = () => {
  return useQuery<APIKey, Error>({
    queryKey: ['apiKey'],
    queryFn: apiKeysService.fetchAPIKey,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to generate a new API key
 */
export const useGenerateAPIKey = () => {
  const queryClient = useQueryClient();

  return useMutation<APIKey, Error>({
    mutationFn: apiKeysService.generateAPIKey,
    onSuccess: (data) => {
      // Update the API key in the cache
      queryClient.setQueryData(['apiKey'], data);
    },
  });
};

/**
 * Hook to fetch API usage statistics
 */
export const useAPIStats = () => {
  return useQuery<APIStats, Error>({
    queryKey: ['apiStats'],
    queryFn: apiKeysService.fetchAPIStats,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

/**
 * Hook to fetch API endpoints documentation
 */
export const useAPIEndpoints = () => {
  return useQuery<APIEndpoint[], Error>({
    queryKey: ['apiEndpoints'],
    queryFn: apiKeysService.fetchAPIEndpoints,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
