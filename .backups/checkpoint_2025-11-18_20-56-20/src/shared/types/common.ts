/**
 * Common Type Definitions
 * Shared types used across the application
 */

export type SortDirection = 'asc' | 'desc';

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface SortParams {
  sortBy: string;
  sortOrder: SortDirection;
}

export interface FilterParams {
  [key: string]: string | number | boolean | undefined;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface TimeRange {
  start: string;
  end: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  coordinates?: Coordinates;
}

export interface FileUpload {
  file: File;
  preview?: string;
  progress?: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
  icon?: string;
  description?: string;
}

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ComponentType<any>;
  count?: number;
  disabled?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<any>;
}

export interface MenuItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ComponentType<any>;
  badge?: string | number;
  children?: MenuItem[];
  onClick?: () => void;
  disabled?: boolean;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  actionLabel?: string;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  query: string;
  took: number; // search time in ms
  suggestions?: string[];
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  metadata?: Record<string, any>;
}

export interface TimeSeriesData {
  timestamp: string;
  value: number;
  label?: string;
}

export interface KeyValuePair<T = any> {
  key: string;
  value: T;
}

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

export interface TooltipProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
}

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

export interface CardProps {
  variant?: 'default' | 'bordered' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};
