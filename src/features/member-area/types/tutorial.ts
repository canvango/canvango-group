/**
 * Tutorial types for member area
 * Matches database schema exactly
 */

export type TutorialCategory = 
  | 'bm_management' 
  | 'advertising' 
  | 'troubleshooting' 
  | 'api';

export interface Tutorial {
  id: string;
  title: string;
  slug: string;
  category: string; // Allow any string for flexibility
  description: string | null;
  content: string;
  video_url: string | null;
  thumbnail_url: string | null;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | null;
  duration_minutes: number | null;
  view_count: number;
  is_published: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
}
