/**
 * Admin Tutorial Management Service
 */

import { supabase } from './supabase';

export interface TutorialStats {
  total: number;
  published: number;
  draft: number;
  categories: Array<{ name: string; count: number }>;
  total_tutorials?: number;
  total_categories?: number;
  most_viewed?: Array<{ title: string; view_count: number }>;
}

export interface CreateTutorialData {
  title: string;
  description: string;
  content: string;
  category: string;
  tags?: string[];
  thumbnail?: string;
  video_url?: string;
  duration?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  status?: 'draft' | 'published' | 'archived';
}

export interface UpdateTutorialData {
  title?: string;
  description?: string;
  content?: string;
  category?: string;
  tags?: string[];
  thumbnail?: string;
  video_url?: string;
  duration?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  status?: 'draft' | 'published' | 'archived';
}

export const adminTutorialService = {
  async getTutorials(page: number = 1, limit: number = 20) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('tutorials')
      .select('*', { count: 'exact' })
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      tutorials: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  },

  async getTutorialStats(): Promise<TutorialStats> {
    const { data, error } = await supabase
      .from('tutorials')
      .select('status, category');

    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      published: data?.filter(t => t.status === 'published').length || 0,
      draft: data?.filter(t => t.status === 'draft').length || 0,
      categories: [] as Array<{ name: string; count: number }>,
    };

    // Count by category
    const categoryMap = new Map<string, number>();
    data?.forEach(tutorial => {
      const category = tutorial.category || 'Uncategorized';
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });

    stats.categories = Array.from(categoryMap.entries()).map(([name, count]) => ({
      name,
      count,
    }));

    return stats;
  },

  async createTutorial(tutorialData: CreateTutorialData) {
    const { data, error } = await supabase
      .from('tutorials')
      .insert(tutorialData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTutorial(id: string, tutorialData: UpdateTutorialData) {
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
    return data;
  },

  async deleteTutorial(id: string) {
    const { error } = await supabase
      .from('tutorials')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
