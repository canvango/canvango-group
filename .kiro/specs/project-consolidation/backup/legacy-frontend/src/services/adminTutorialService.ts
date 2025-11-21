import api from '../utils/api';
import { Tutorial } from '../types/tutorial.types';

export interface CreateTutorialData {
  title: string;
  description: string;
  content: string;
  category: string;
  tags?: string[];
}

export interface UpdateTutorialData {
  title?: string;
  description?: string;
  content?: string;
  category?: string;
  tags?: string[];
}

export interface TutorialStats {
  total_tutorials: number;
  total_categories: number;
  categories: string[];
  most_viewed: Tutorial[];
  recent_tutorials: Tutorial[];
}

export const adminTutorialService = {
  /**
   * Get all tutorials (admin view)
   */
  getAllTutorials: async (params?: {
    search?: string;
    category?: string;
    tags?: string[];
    limit?: number;
    offset?: number;
  }) => {
    const response = await api.get('/admin/tutorials', { params });
    return response.data;
  },

  /**
   * Create new tutorial
   */
  createTutorial: async (data: CreateTutorialData) => {
    const response = await api.post('/admin/tutorials', data);
    return response.data;
  },

  /**
   * Update tutorial
   */
  updateTutorial: async (id: string, data: UpdateTutorialData) => {
    const response = await api.put(`/admin/tutorials/${id}`, data);
    return response.data;
  },

  /**
   * Delete tutorial
   */
  deleteTutorial: async (id: string) => {
    const response = await api.delete(`/admin/tutorials/${id}`);
    return response.data;
  },

  /**
   * Get tutorial statistics
   */
  getTutorialStats: async (): Promise<{ data: TutorialStats }> => {
    const response = await api.get('/admin/tutorials/stats');
    return response.data;
  },
};
