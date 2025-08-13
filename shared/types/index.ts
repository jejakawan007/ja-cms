// Shared TypeScript types untuk JA-CMS
// Digunakan oleh frontend dan backend

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'USER' | 'EDITOR' | 'ADMIN' | 'SUPER_ADMIN';

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  authorId: string;
  author: User;
  status: PostStatus;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  tags: Tag[];
  categories: Category[];
}

export type PostStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'SCHEDULED';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
  parent?: Category;
  children?: Category[];
  posts?: Post[];
  _count?: {
    posts: number;
    children: number;
  };
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Media {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Menu {
  id: string;
  name: string;
  location: string;
  items: MenuItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuItem {
  id: string;
  title: string;
  url: string;
  target: '_blank' | '_self';
  order: number;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Settings {
  id: string;
  key: string;
  value: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Authentication Types
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  permissions: string[];
  iat: number;
  exp: number;
  type?: 'refresh' | 'access';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Form Types
export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  status: PostStatus;
  categoryIds: string[];
  tagIds: string[];
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  excerpt?: string;
  featuredImage?: string;
  status?: PostStatus;
  categoryIds?: string[];
  tagIds?: string[];
  publishedAt?: Date | null;
}

// Dashboard Types
export interface DashboardStats {
  totalUsers: number;
  totalPosts: number;
  totalCategories: number;
  totalTags: number;
  publishedPosts: number;
  draftPosts: number;
  recentPosts: Post[];
  recentUsers: User[];
}

// Search and Filter Types
export interface SearchParams {
  query?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PostSearchParams extends SearchParams {
  status?: PostStatus;
  authorId?: string;
  categoryIds?: string[];
  tagIds?: string[];
  publishedAfter?: Date;
  publishedBefore?: Date;
}

export interface UserSearchParams extends SearchParams {
  role?: UserRole;
  isActive?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
}

export interface CreateCategoryRequest {
  name: string;
  slug?: string;
  description?: string;
  color?: string;
  parentId?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  slug?: string;
  description?: string;
  color?: string;
  parentId?: string;
}

export interface CategorySearchParams extends SearchParams {
  parentId?: string | null;
} 