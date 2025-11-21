import api from '../utils/api';
import { Tutorial, TutorialsResponse } from '../types/tutorial.types';

export const tutorialService = {
  /**
   * Get all tutorials with optional search and filters
   */
  getTutorials: async (params?: {
    search?: string;
    category?: string;
    tags?: string[];
    limit?: number;
    offset?: number;
  }): Promise<TutorialsResponse> => {
    const response = await api.get('/tutorials', { params });
    return response.data.data;
  },

  /**
   * Get tutorial by ID
   */
  getTutorialById: async (id: string): Promise<Tutorial> => {
    const response = await api.get(`/tutorials/${id}`);
    return response.data.data;
  },

  /**
   * Get all categories
   */
  getCategories: async (): Promise<string[]> => {
    const response = await api.get('/tutorials/categories');
    return response.data.data;
  },

  /**
   * Get all tags
   */
  getTags: async (): Promise<string[]> => {
    const response = await api.get('/tutorials/tags');
    return response.data.data;
  },
};
