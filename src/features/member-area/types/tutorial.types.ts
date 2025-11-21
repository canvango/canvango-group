/**
 * Tutorial Type Definitions
 */

export interface Tutorial {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  thumbnail?: string;
  video_url?: string;
  duration?: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  status: 'draft' | 'published' | 'archived';
  views: number;
  likes: number;
  author_id: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface TutorialCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  order: number;
}

export interface TutorialProgress {
  id: string;
  user_id: string;
  tutorial_id: string;
  progress: number;
  completed: boolean;
  last_position?: number;
  created_at: string;
  updated_at: string;
}
