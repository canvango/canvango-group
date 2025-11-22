import { Tutorial, TutorialCategory } from '../types/tutorial';
import { supabase } from '@/clients/supabase';
import { handleSupabaseOperation } from '@/utils/supabaseErrorHandler';

export interface TutorialFilters {
  category?: TutorialCategory | 'all';
  search?: string;
}

export const tutorialsService = {
  /**
   * Fetch tutorials with optional filters - Direct Supabase
   */
  async fetchTutorials(filters?: TutorialFilters): Promise<Tutorial[]> {
    return handleSupabaseOperation(async () => {
      let query = supabase
        .from('tutorials')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return { data: data || [], error: null };
    });
  },

  /**
   * Fetch a single tutorial by slug - Direct Supabase
   */
  async fetchTutorialBySlug(slug: string): Promise<Tutorial> {
    return handleSupabaseOperation(async () => {
      const { data, error } = await supabase
        .from('tutorials')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Tutorial not found');

      return { data, error: null };
    });
  }
};
