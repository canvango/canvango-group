/**
 * React Query Hooks for Admin Tutorial Management
 * Follows Supabase integration standards
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminTutorialService } from '@/features/member-area/services/adminTutorialService';
import {
  CreateTutorialData,
  UpdateTutorialData,
  TutorialFilters,
} from '@/features/member-area/types/tutorial.types';

/**
 * Hook to fetch all tutorials with filters and pagination
 */
export const useAdminTutorials = (
  filters?: TutorialFilters,
  page: number = 1,
  limit: number = 20
) => {
  return useQuery({
    queryKey: ['admin-tutorials', filters, page, limit],
    queryFn: async () => {
      const result = await adminTutorialService.getTutorials(filters, page, limit);
      return result;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Hook to fetch tutorial statistics
 */
export const useAdminTutorialStats = () => {
  return useQuery({
    queryKey: ['admin-tutorial-stats'],
    queryFn: async () => {
      const stats = await adminTutorialService.getTutorialStats();
      return stats;
    },
    staleTime: 60 * 1000, // 1 minute
  });
};

/**
 * Hook to fetch single tutorial by ID
 */
export const useAdminTutorial = (id: string) => {
  return useQuery({
    queryKey: ['admin-tutorial', id],
    queryFn: async () => {
      const tutorial = await adminTutorialService.getTutorialById(id);
      return tutorial;
    },
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute
  });
};

/**
 * Hook to create new tutorial
 */
export const useCreateTutorial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTutorialData) => {
      const tutorial = await adminTutorialService.createTutorial(data);
      return tutorial;
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['admin-tutorials'] });
      queryClient.invalidateQueries({ queryKey: ['admin-tutorial-stats'] });
    },
  });
};

/**
 * Hook to update existing tutorial
 */
export const useUpdateTutorial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTutorialData }) => {
      const tutorial = await adminTutorialService.updateTutorial(id, data);
      return tutorial;
    },
    onSuccess: (data) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['admin-tutorials'] });
      queryClient.invalidateQueries({ queryKey: ['admin-tutorial-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-tutorial', data.id] });
    },
  });
};

/**
 * Hook to delete tutorial
 */
export const useDeleteTutorial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await adminTutorialService.deleteTutorial(id);
      return id;
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['admin-tutorials'] });
      queryClient.invalidateQueries({ queryKey: ['admin-tutorial-stats'] });
    },
  });
};

/**
 * Hook to toggle tutorial publish status
 */
export const useToggleTutorialPublish = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isPublished }: { id: string; isPublished: boolean }) => {
      const tutorial = await adminTutorialService.togglePublishStatus(id, isPublished);
      return tutorial;
    },
    onSuccess: (data) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['admin-tutorials'] });
      queryClient.invalidateQueries({ queryKey: ['admin-tutorial-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-tutorial', data.id] });
    },
  });
};
