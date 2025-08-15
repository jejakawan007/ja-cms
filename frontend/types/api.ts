/**
 * API Types & Interfaces for JA-CMS Frontend
 * Based on docs/development/features/API_SCHEMAS.md
 */

// =============================================
// COMMON API TYPES
// =============================================

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: APIError;
  pagination?: Pagination;
  meta?: ResponseMeta;
}

export interface APIError {
  code: string;
  message: string;
  details?: any;
  field?: string; // for validation errors
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ResponseMeta {
  timestamp: string;
  requestId: string;
  version: string;
  processingTime: number; // milliseconds
}

// =============================================
// ANALYTICS API TYPES
// =============================================

export interface AnalyticsDashboardRequest {
  dateRange: {
    start: string; // ISO 8601 date
    end: string;   // ISO 8601 date
  };
  metrics?: ('visitors' | 'pageviews' | 'sessions' | 'bounceRate')[];
  granularity?: 'hour' | 'day' | 'week' | 'month';
}

export interface AnalyticsDashboardResponse {
  overview: {
    visitors: {
      total: number;
      change: number; // percentage change
      trend: 'up' | 'down' | 'stable';
    };
    pageViews: {
      total: number;
      change: number;
      trend: 'up' | 'down' | 'stable';
    };
    sessions: {
      total: number;
      averageDuration: number; // seconds
      bounceRate: number; // percentage
    };
    conversionRate: number;
  };
  charts: {
    traffic: {
      labels: string[];
      datasets: {
        label: string;
        data: number[];
        borderColor: string;
        backgroundColor: string;
      }[];
    };
    sources: {
      direct: number;
      search: number;
      social: number;
      referral: number;
    };
    devices: {
      desktop: number;
      mobile: number;
      tablet: number;
    };
  };
  topPages: {
    path: string;
    views: number;
    uniqueViews: number;
    avgTime: number;
  }[];
  realtimeData: {
    activeUsers: number;
    currentPageViews: number;
    topCountries: { country: string; users: number; }[];
  };
}

// =============================================
// USER MANAGEMENT API TYPES
// =============================================

export interface User {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  isActive: boolean;
  isVerified: boolean;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  USER = 'USER',
  EDITOR = 'EDITOR', 
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatar?: string;
  isActive?: boolean;
  role?: UserRole;
}

export interface UsersListResponse {
  users: User[];
  pagination: Pagination;
  filters: {
    roles: UserRole[];
    status: ('active' | 'inactive')[];
  };
}

// =============================================
// CONTENT MANAGEMENT API TYPES
// =============================================

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  status: PostStatus;
  publishedAt?: string;
  authorId: string;
  categoryId?: string;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  canonicalUrl?: string;
  // Relations
  author: User;
  category?: Category;
  views: number;
  likes: number;
  comments: number;
}

export enum PostStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
  SCHEDULED = 'SCHEDULED'
}

export interface CreatePostRequest {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  status?: PostStatus;
  publishedAt?: string;
  categoryId?: string;
  tagIds?: string[];
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}

export interface UpdatePostRequest extends Partial<CreatePostRequest> {}

export interface PostsListResponse {
  posts: Post[];
  pagination: Pagination;
  filters: {
    statuses: PostStatus[];
    categories: Category[];
    authors: User[];
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  parent?: Category;
  children: Category[];
  postsCount: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  color?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  postsCount: number;
}

// =============================================
// MEDIA MANAGEMENT API TYPES
// =============================================

export interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number; // for video/audio files
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  caption?: string;
  description?: string;
  folderId?: string;
  uploadedBy: string;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  metadata?: any; // EXIF data, video info, etc.
  tags: MediaTag[];
  createdAt: string;
  updatedAt: string;
  // Relations
  folder?: MediaFolder;
  uploader: User;
}

export interface MediaFolder {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  path: string; // Full path for efficient queries
  isPublic: boolean;
  permissions?: any; // Folder-specific permissions
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  parent?: MediaFolder;
  children: MediaFolder[];
  files: MediaFile[];
  creator: User;
  filesCount: number;
  totalSize: number;
}

export interface MediaTag {
  id: string;
  name: string;
  slug: string;
  color: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  filesCount: number;
}

export interface UploadMediaRequest {
  files: File[];
  folderId?: string;
  tags?: string[];
  alt?: string;
  caption?: string;
  description?: string;
}

export interface MediaUploadResponse {
  files: MediaFile[];
  failed: {
    filename: string;
    error: string;
  }[];
}

// =============================================
// AUTHENTICATION API TYPES
// =============================================

export interface LoginRequest {
  email: string;
  password: string;
  remember?: boolean;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number; // seconds
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthUser extends User {
  permissions: string[];
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
  };
  dashboard: {
    layout: 'grid' | 'list';
    widgets: string[];
  };
}

// =============================================
// SETTINGS & SYSTEM API TYPES
// =============================================

export interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    siteUrl: string;
    adminEmail: string;
    timezone: string;
    language: string;
    dateFormat: string;
    timeFormat: string;
  };
  appearance: {
    theme: string;
    logo?: string;
    favicon?: string;
    customCss?: string;
  };
  content: {
    postsPerPage: number;
    enableComments: boolean;
    moderateComments: boolean;
    enableLikes: boolean;
    enableSharing: boolean;
  };
  media: {
    maxUploadSize: number; // bytes
    allowedTypes: string[];
    enableImageOptimization: boolean;
    cdnEnabled: boolean;
    cdnUrl?: string;
  };
  security: {
    enableTwoFactor: boolean;
    sessionTimeout: number; // minutes
    maxLoginAttempts: number;
    enableCaptcha: boolean;
  };
}

export interface UpdateSettingsRequest extends Partial<SystemSettings> {}

// =============================================
// DASHBOARD STATS TYPES
// =============================================

export interface DashboardStats {
  totalUsers: number;
  totalPosts: number;
  totalMedia: number;
  postsByStatus: {
    DRAFT: number;
    PUBLISHED: number;
    ARCHIVED: number;
  };
  postsByCategory: {
    [categoryName: string]: number;
  };
  recentPosts: Post[];
  // Optional fields for future enhancements
  totalViews?: number;
  totalEngagement?: number;
  postsThisMonth?: number;
  viewsToday?: number;
  activeUsers?: number;
  conversionRate?: number;
  recentUsers?: User[];
  popularPosts?: Post[];
  systemHealth?: {
    status: 'healthy' | 'warning' | 'error';
    uptime: number;
    memoryUsage: number;
    diskUsage: number;
  };
}

// =============================================
// CHART DATA TYPES
// =============================================

export interface ChartDataPoint {
  name: string;
  value: number;
  date?: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
    fill?: boolean;
  }[];
}

// =============================================
// NOTIFICATION TYPES
// =============================================

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  userId: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface CreateNotificationRequest {
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  userId?: string; // If not provided, send to all users
  link?: string;
}
