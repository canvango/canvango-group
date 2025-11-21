import { Tutorial, TutorialCategory } from '../types/tutorial';
import apiClient from './api';

export interface TutorialFilters {
  category?: TutorialCategory | 'all';
  search?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface TutorialsData {
  tutorials: Tutorial[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

export const tutorialsService = {
  /**
   * Fetch tutorials with optional filters
   */
  async fetchTutorials(filters?: TutorialFilters): Promise<Tutorial[]> {
    const params = new URLSearchParams();
    
    if (filters?.category && filters.category !== 'all') {
      params.append('category', filters.category);
    }
    
    if (filters?.search) {
      params.append('search', filters.search);
    }

    const response = await apiClient.get<ApiResponse<TutorialsData>>(`/tutorials?${params.toString()}`);
    return response.data.data.tutorials || [];
  },

  /**
   * Fetch a single tutorial by slug
   */
  async fetchTutorialBySlug(slug: string): Promise<Tutorial> {
    const response = await apiClient.get<ApiResponse<Tutorial>>(`/tutorials/${slug}`);
    return response.data.data;
  }
};
