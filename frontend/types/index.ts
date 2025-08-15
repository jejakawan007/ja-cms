/**
 * Central Type Exports for JA-CMS Frontend
 * Exports all types from different modules
 */

// API Types
export * from './api';

// Component Types  
export * from './components';

// Common utility types
export type Maybe<T> = T | null | undefined;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Event handler types
export type EventHandler<T = Event> = (event: T) => void;
export type AsyncEventHandler<T = Event> = (event: T) => Promise<void>;

// Generic data types
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// API request/response helpers
export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiRequestConfig {
  method: ApiMethod;
  url: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
}

// Form types
export type FormMode = 'create' | 'edit' | 'view';

export interface FormState<T> {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}

// Table/List types
export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterConfig {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith' | 'in' | 'notIn';
  value: any;
}

export interface QueryConfig {
  page?: number;
  limit?: number;
  sort?: SortConfig;
  filters?: FilterConfig[];
  search?: string;
}

// Theme types
export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeConfig {
  mode: ThemeMode;
  primaryColor: string;
  borderRadius: number;
  fontFamily: string;
}

// Permission types
export type Permission = string;
export type Role = 'USER' | 'EDITOR' | 'ADMIN' | 'SUPER_ADMIN';

// Navigation types
export interface NavigationItem {
  id: string;
  label: string;
  icon?: string;
  href?: string;
  children?: NavigationItem[];
  permissions?: Permission[];
  badge?: {
    text: string;
    variant: 'default' | 'success' | 'warning' | 'error';
  };
}

// File types
export interface FileUploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  result?: any;
}

// Date/Time types
export type DateFormat = 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY';
export type TimeFormat = '12h' | '24h';

// Language/Locale types
export type Language = 'en' | 'id';
export type Timezone = string; // IANA timezone identifier

// Status types
export type Status = 'active' | 'inactive' | 'pending' | 'suspended';
export type ProcessingStatus = 'idle' | 'loading' | 'success' | 'error';

// Color types
export type ColorVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

// Size types
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Position types
export type Position = 'top' | 'bottom' | 'left' | 'right';
export type Alignment = 'start' | 'center' | 'end';

// Animation types
export type AnimationType = 'fade' | 'slide' | 'scale' | 'bounce';
export type AnimationDuration = 'fast' | 'normal' | 'slow';

// Responsive breakpoint types
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

// Loading states
export interface LoadingStates {
  [key: string]: boolean;
}

// Feature flags
export interface FeatureFlags {
  [key: string]: boolean;
}

