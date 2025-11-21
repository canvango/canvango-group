export enum TutorialCategory {
  GETTING_STARTED = 'getting-started',
  ACCOUNT = 'account',
  TRANSACTION = 'transaction',
  API = 'api',
  TROUBLESHOOT = 'troubleshoot'
}

export interface Tutorial {
  id: string;
  title: string;
  slug: string;
  category: TutorialCategory;
  content: string;
  thumbnail?: string;
  readTime: number;
  views: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}
