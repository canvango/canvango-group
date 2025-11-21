import { useQuery } from '@tanstack/react-query';
import { tutorialsService, TutorialFilters } from '../services/tutorials.service';

/**
 * Hook to fetch tutorials with filters
 */
export const useTutorials = (filters?: TutorialFilters) => {
  return useQuery({
    queryKey: ['tutorials', filters],
    queryFn: () => tutorialsService.fetchTutorials(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch a single tutorial by slug
 */
export const useTutorial = (slug: string) => {
  return useQuery({
    queryKey: ['tutorial', slug],
    queryFn: () => tutorialsService.fetchTutorialBySlug(slug),
    enabled: !!slug,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
