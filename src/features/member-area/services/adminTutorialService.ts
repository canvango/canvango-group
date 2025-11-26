/**
 * Admin Tutorial Management Service
 * Uses Supabase direct connection (frontend-only architecture)
 */

import { supabase } from '@/clients/supabase';
import {
  Tutorial,
  CreateTutorialData,
  UpdateTutorialData,
  TutorialStats,
  TutorialFilters,
} from '../types/tutorial.types';

export const adminTutorialService = {
  /**
   * Get all tutorials with optional filters and pagination
   */
  async getTutorials(filters?: TutorialFilters, page: number = 1, limit: number = 20) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('tutorials')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters?.is_published !== undefined) {
      query = query.eq('is_published', filters.is_published);
    }

    // Apply pagination
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      tutorials: (data || []) as Tutorial[],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  },

  /**
   * Get tutorial statistics
   */
  async getTutorialStats(): Promise<TutorialStats> {
    const { data, error } = await supabase
      .from('tutorials')
      .select('is_published, category, view_count, title, id');

    if (error) throw error;

    const tutorials = data || [];

    const stats: TutorialStats = {
      total: tutorials.length,
      published: tutorials.filter(t => t.is_published).length,
      draft: tutorials.filter(t => !t.is_published).length,
      categories: [],
      most_viewed: [],
    };

    // Count by category
    const categoryMap = new Map<string, number>();
    tutorials.forEach(tutorial => {
      const category = tutorial.category || 'Uncategorized';
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });

    stats.categories = Array.from(categoryMap.entries()).map(([name, count]) => ({
      name,
      count,
    }));

    // Get most viewed tutorials (top 5)
    const sortedByViews = [...tutorials]
      .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
      .slice(0, 5);

    stats.most_viewed = sortedByViews.map(t => ({
      id: t.id,
      title: t.title,
      view_count: t.view_count || 0,
    }));

    return stats;
  },

  /**
   * Create new tutorial
   */
  async createTutorial(tutorialData: CreateTutorialData): Promise<Tutorial> {
    const { data, error } = await supabase
      .from('tutorials')
      .insert({
        ...tutorialData,
        view_count: 0,
        is_published: tutorialData.is_published ?? false,
        tags: tutorialData.tags ?? [],
      })
      .select()
      .single();

    if (error) throw error;
    return data as Tutorial;
  },

  /**
   * Update existing tutorial
   */
  async updateTutorial(id: string, tutorialData: UpdateTutorialData): Promise<Tutorial> {
    const { data, error } = await supabase
      .from('tutorials')
      .update({
        ...tutorialData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Tutorial;
  },

  /**
   * Delete tutorial
   */
  async deleteTutorial(id: string): Promise<void> {
    const { error } = await supabase
      .from('tutorials')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Get single tutorial by ID
   */
  async getTutorialById(id: string): Promise<Tutorial> {
    const { data, error } = await supabase
      .from('tutorials')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Tutorial;
  },

  /**
   * Toggle tutorial publish status
   */
  async togglePublishStatus(id: string, isPublished: boolean): Promise<Tutorial> {
    const { data, error } = await supabase
      .from('tutorials')
      .update({
        is_published: isPublished,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Tutorial;
  },
};
