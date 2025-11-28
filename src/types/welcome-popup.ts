export interface WelcomePopup {
  id: string;
  title: string;
  content: string; // HTML content from rich text editor
  bullet_points: string[];
  is_active: boolean;
  type: 'welcome' | 'security' | 'promo';
  show_checkbox: boolean;
  button_text: string;
  created_at: string;
  updated_at: string;
}

export interface WelcomePopupFormData {
  title: string;
  content: string;
  bullet_points: string[];
  type: 'welcome' | 'security' | 'promo';
  show_checkbox: boolean;
  button_text: string;
}
