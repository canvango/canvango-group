import { Tutorial } from '../types/tutorial';
import { supabase } from '@/clients/supabase';
import { handleSupabaseOperation } from '@/utils/supabaseErrorHandler';

export interface TutorialFilters {
  category?: string | 'all';
  search?: string;
}

export const tutorialsService = {
  /**
   * Fetch published tutorials with optional filters - Direct Supabase
   */
  async fetchTutorials(filters?: TutorialFilters): Promise<Tutorial[]> {
    return handleSupabaseOperation(async () => {
      let query = supabase
        .from('tutorials')
        .select('*')
        .eq('is_published', true) // ✅ Fixed: use is_published instead of is_active
        .order('created_at', { ascending: false }); // ✅ Fixed: use created_at instead of order_index

      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return { data: data || [], error: null };
    });
  },

  /**
   * Fetch a single published tutorial by slug - Direct Supabase
   */
  async fetchTutorialBySlug(slug: string): Promise<Tutorial> {
    return handleSupabaseOperation(async () => {
      const { data, error } = await supabase
        .from('tutorials')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true) // ✅ Fixed: use is_published instead of is_active
        .single();

      if (error) throw error;
      if (!data) throw new Error('Tutorial not found');

      // Increment view count
      await supabase
        .from('tutorials')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', data.id);

      return { data, error: null };
    });
  }
};
