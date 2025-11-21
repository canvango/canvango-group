import { getSupabaseClient } from '../config/supabase.js';
import type { Database } from '../types/database.types.js';
import { cache, CacheKeys, CacheInvalidation } from '../utils/cache.js';

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  view_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTutorialInput {
  title: string;
  description: string;
  content: string;
  category: string;
  tags?: string[];
}

export interface UpdateTutorialInput {
  title?: string;
  description?: string;
  content?: string;
  category?: string;
  tags?: string[];
}

type TutorialInsert = Database['public']['Tables']['tutorials']['Insert'];
type TutorialUpdate = Database['public']['Tables']['tutorials']['Update'];

export class TutorialModel {
  private static get supabase() {
    return getSupabaseClient();
  }

  /**
   * Create a new tutorial
   */
  static async create(tutorialData: CreateTutorialInput): Promise<Tutorial> {
    const insertData: TutorialInsert = {
      title: tutorialData.title,
      description: tutorialData.description,
      content: tutorialData.content,
      category: tutorialData.category,
      tags: tutorialData.tags || []
    };

    const { data, error } = await this.supabase
      .from('tutorials')
      .insert(insertData as any)
      .select()
      .single();

    if (error) {
      console.error('Error creating tutorial:', error);
      throw new Error(`Failed to create tutorial: ${error.message}`);
    }

    // Invalidate cache
    CacheInvalidation.tutorials();

    return data as Tutorial;
  }

  /**
   * Find tutorial by ID
   */
  static async findById(id: string): Promise<Tutorial | null> {
    const { data, error } = await this.supabase
      .from('tutorials')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('Error finding tutorial by ID:', error);
      throw new Error(`Failed to find tutorial: ${error.message}`);
    }

    return data;
  }

  /**
   * Get all tutorials with optional filtering
   */
  static async findAll(filters?: {
    category?: string;
    search?: string;
    tags?: string[];
    limit?: number;
    offset?: number;
  }): Promise<Tutorial[]> {
    let query = this.supabase.from('tutorials').select('*');

    // Only show published tutorials
    query = query.eq('is_published', true);

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
    }

    if (filters?.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags);
    }

    query = query.order('created_at', { ascending: false });

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      const limit = filters.limit || 10;
      query = query.range(filters.offset, filters.offset + limit - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error finding tutorials:', error);
      throw new Error(`Failed to find tutorials: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Search tutorials by keyword
   */
  static async search(keyword: string, limit?: number): Promise<Tutorial[]> {
    let query = this.supabase
      .from('tutorials')
      .select('*')
      .eq('is_published', true)
      .or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%,content.ilike.%${keyword}%`)
      .order('view_count', { ascending: false })
      .order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error searching tutorials:', error);
      throw new Error(`Failed to search tutorials: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get tutorials by category
   */
  static async findByCategory(category: string, limit?: number, offset?: number): Promise<Tutorial[]> {
    let query = this.supabase
      .from('tutorials')
      .select('*')
      .eq('is_published', true)
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    if (offset) {
      const limitValue = limit || 10;
      query = query.range(offset, offset + limitValue - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error finding tutorials by category:', error);
      throw new Error(`Failed to find tutorials by category: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get all categories
   */
  static async getCategories(): Promise<string[]> {
    // Check cache first
    const cached = cache.get<string[]>(CacheKeys.tutorialCategories());
    if (cached) {
      return cached;
    }

    const { data, error } = await this.supabase
      .from('tutorials')
      .select('category')
      .eq('is_published', true)
      .order('category');

    if (error) {
      console.error('Error getting categories:', error);
      throw new Error(`Failed to get categories: ${error.message}`);
    }

    // Extract unique categories
    const categories = [...new Set(data.map((row: any) => row.category))];
    
    // Cache for 15 minutes
    cache.set(CacheKeys.tutorialCategories(), categories, 15 * 60 * 1000);
    
    return categories;
  }

  /**
   * Get all tags
   */
  static async getTags(): Promise<string[]> {
    // Check cache first
    const cached = cache.get<string[]>(CacheKeys.tutorialTags());
    if (cached) {
      return cached;
    }

    const { data, error } = await this.supabase
      .from('tutorials')
      .select('tags')
      .eq('is_published', true);

    if (error) {
      console.error('Error getting tags:', error);
      throw new Error(`Failed to get tags: ${error.message}`);
    }

    // Flatten and get unique tags
    const allTags = data.flatMap((row: any) => row.tags || []);
    const uniqueTags = [...new Set(allTags)].sort();
    
    // Cache for 15 minutes
    cache.set(CacheKeys.tutorialTags(), uniqueTags, 15 * 60 * 1000);
    
    return uniqueTags;
  }

  /**
   * Update tutorial
   */
  static async update(id: string, tutorialData: UpdateTutorialInput): Promise<Tutorial | null> {
    const updates: TutorialUpdate = {};

    if (tutorialData.title !== undefined) {
      updates.title = tutorialData.title;
    }
    if (tutorialData.description !== undefined) {
      updates.description = tutorialData.description;
    }
    if (tutorialData.content !== undefined) {
      updates.content = tutorialData.content;
    }
    if (tutorialData.category !== undefined) {
      updates.category = tutorialData.category;
    }
    if (tutorialData.tags !== undefined) {
      updates.tags = tutorialData.tags;
    }

    if (Object.keys(updates).length === 0) {
      return this.findById(id);
    }

    const { data, error } = await (this.supabase
      .from('tutorials') as any)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating tutorial:', error);
      throw new Error(`Failed to update tutorial: ${error.message}`);
    }

    // Invalidate cache
    CacheInvalidation.tutorials();

    return data as Tutorial;
  }

  /**
   * Increment view count using RPC function
   */
  static async incrementViewCount(id: string): Promise<Tutorial | null> {
    const { error } = await this.supabase.rpc('increment_tutorial_views', {
      tutorial_id: id
    } as any);

    if (error) {
      console.error('Error incrementing view count:', error);
      throw new Error(`Failed to increment view count: ${error.message}`);
    }

    // Return updated tutorial
    return this.findById(id);
  }

  /**
   * Delete tutorial
   */
  static async delete(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('tutorials')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting tutorial:', error);
      return false;
    }

    // Invalidate cache
    CacheInvalidation.tutorials();

    return true;
  }

  /**
   * Count tutorials with optional filtering
   */
  static async count(filters?: {
    category?: string;
    search?: string;
    tags?: string[];
  }): Promise<number> {
    let query = this.supabase
      .from('tutorials')
      .select('*', { count: 'exact', head: true });

    // Only count published tutorials
    query = query.eq('is_published', true);

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
    }

    if (filters?.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags);
    }

    const { count, error } = await query;

    if (error) {
      console.error('Error counting tutorials:', error);
      return 0;
    }

    return count || 0;
  }

  /**
   * Get most viewed tutorials
   */
  static async getMostViewed(limit: number = 10): Promise<Tutorial[]> {
    const { data, error } = await this.supabase
      .from('tutorials')
      .select('*')
      .eq('is_published', true)
      .order('view_count', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error getting most viewed tutorials:', error);
      throw new Error(`Failed to get most viewed tutorials: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get recent tutorials
   */
  static async getRecent(limit: number = 10): Promise<Tutorial[]> {
    const { data, error } = await this.supabase
      .from('tutorials')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error getting recent tutorials:', error);
      throw new Error(`Failed to get recent tutorials: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Validate tutorial data
   */
  static validateTutorialData(tutorialData: Partial<CreateTutorialInput>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (tutorialData.title !== undefined) {
      if (tutorialData.title.length < 5) {
        errors.push('Title must be at least 5 characters long');
      }
      if (tutorialData.title.length > 255) {
        errors.push('Title must not exceed 255 characters');
      }
    }

    if (tutorialData.description !== undefined) {
      if (tutorialData.description.length < 10) {
        errors.push('Description must be at least 10 characters long');
      }
    }

    if (tutorialData.content !== undefined) {
      if (tutorialData.content.length < 20) {
        errors.push('Content must be at least 20 characters long');
      }
    }

    if (tutorialData.category !== undefined) {
      if (tutorialData.category.length < 2) {
        errors.push('Category must be at least 2 characters long');
      }
      if (tutorialData.category.length > 100) {
        errors.push('Category must not exceed 100 characters');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
