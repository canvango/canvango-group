export type AnnouncementType = 'info' | 'warning' | 'success' | 'maintenance' | 'update';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: AnnouncementType;
  priority: number;
  is_published: boolean;
  published_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAnnouncementInput {
  title: string;
  content: string;
  type: AnnouncementType;
  priority?: number;
  is_published?: boolean;
  published_at?: string | null;
}

export interface UpdateAnnouncementInput {
  title?: string;
  content?: string;
  type?: AnnouncementType;
  priority?: number;
  is_published?: boolean;
  published_at?: string | null;
}
