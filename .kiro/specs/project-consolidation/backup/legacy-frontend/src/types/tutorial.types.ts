/**
 * Tutorial Type Definitions
 * Centralized types for tutorial-related data structures
 */

export enum TutorialCategory {
  GETTING_STARTED = 'getting_started',
  ACCOUNT_MANAGEMENT = 'account_management',
  PURCHASING = 'purchasing',
  WARRANTY = 'warranty',
  API = 'api',
  TROUBLESHOOTING = 'troubleshooting',
  BEST_PRACTICES = 'best_practices'
}

export enum TutorialDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}

export enum TutorialFormat {
  TEXT = 'text',
  VIDEO = 'video',
  INTERACTIVE = 'interactive',
  PDF = 'pdf'
}

export interface Tutorial {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  category: TutorialCategory;
  difficulty: TutorialDifficulty;
  format: TutorialFormat;
  duration: number; // in minutes
  views: number;
  likes: number;
  tags: string[];
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  thumbnail?: string;
  videoUrl?: string;
  attachments?: TutorialAttachment[];
  relatedTutorials?: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface TutorialAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

export interface TutorialFilters {
  category?: TutorialCategory;
  difficulty?: TutorialDifficulty;
  format?: TutorialFormat;
  search?: string;
  tags?: string[];
}

export interface TutorialStats {
  totalTutorials: number;
  totalViews: number;
  totalLikes: number;
  averageRating: number;
  popularTutorials: Tutorial[];
  recentTutorials: Tutorial[];
}

export interface TutorialProgress {
  tutorialId: string;
  userId: string;
  progress: number; // 0-100
  completed: boolean;
  lastViewedAt: string;
  completedAt?: string;
}
