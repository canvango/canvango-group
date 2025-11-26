/**
 * Tutorial Type Definitions
 * Matches Supabase database schema exactly
 */

export type TutorialDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Tutorial {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string | null;
  content: string;
  video_url: string | null;
  thumbnail_url: string | null;
  difficulty: TutorialDifficulty | null;
  duration_minutes: number | null;
  view_count: number;
  is_published: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateTutorialData {
  title: string;
  slug: string;
  category: string;
  description?: string;
  content: string;
  video_url?: string;
  thumbnail_url?: string;
  difficulty?: TutorialDifficulty;
  duration_minutes?: number;
  is_published?: boolean;
  tags?: string[];
}

export interface UpdateTutorialData {
  title?: string;
  slug?: string;
  category?: string;
  description?: string;
  content?: string;
  video_url?: string;
  thumbnail_url?: string;
  difficulty?: TutorialDifficulty;
  duration_minutes?: number;
  is_published?: boolean;
  tags?: string[];
}

export interface TutorialStats {
  total: number;
  published: number;
  draft: number;
  categories: Array<{ name: string; count: number }>;
  most_viewed: Array<{ title: string; view_count: number; id: string }>;
}

export interface TutorialFilters {
  category?: string;
  search?: string;
  is_published?: boolean;
}
