/**
 * API Type Definitions
 * Centralized type definitions for JA-CMS Backend API
 */

// Base API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// Pagination Types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

import { UserRole } from '@shared/types';

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  isActive?: boolean;
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Post Types
export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: PostStatus;
  authorId: string;
  author: User;
  categoryId?: string;
  category?: Category;
  tags: Tag[];
  featuredImage?: MediaFile;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type PostStatus = 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED';

export interface CreatePostRequest {
  title: string;
  slug?: string;
  content: string;
  excerpt?: string;
  status?: PostStatus;
  categoryId?: string;
  tagIds?: string[];
  featuredImageId?: string;
  publishedAt?: Date;
}

export interface UpdatePostRequest {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  status?: PostStatus;
  categoryId?: string;
  tagIds?: string[];
  featuredImageId?: string;
  publishedAt?: Date;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  posts?: Post[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryRequest {
  name: string;
  slug?: string;
  description?: string;
  parentId?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  slug?: string;
  description?: string;
  parentId?: string;
}

// Tag Types
export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  posts?: Post[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTagRequest {
  name: string;
  slug?: string;
  description?: string;
}

export interface UpdateTagRequest {
  name?: string;
  slug?: string;
  description?: string;
}

// Media Types
export interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  alt?: string;
  description?: string;
  uploadedBy: string;
  uploadedByUser?: User;
  dimensions?: {
    width: number;
    height: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface UploadMediaRequest {
  file: Express.Multer.File;
  alt?: string;
  description?: string;
}

// Settings Types
export interface Setting {
  id: string;
  key: string;
  value: string;
  type: SettingType;
  description?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type SettingType = 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON' | 'ARRAY';

export interface CreateSettingRequest {
  key: string;
  value: string;
  type: SettingType;
  description?: string;
  isPublic?: boolean;
}

export interface UpdateSettingRequest {
  value?: string;
  type?: SettingType;
  description?: string;
  isPublic?: boolean;
}

// Error Types
export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
  details?: unknown;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

// Request/Response Types
export interface AuthenticatedRequest extends Express.Request {
  user?: {
    userId: string;
    email: string;
    role: UserRole;
    permissions: string[];
    iat: number;
    exp: number;
  };
}

export interface PaginatedRequest extends Express.Request {
  query: {
    page?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  };
}

// Utility Types
export type WithoutId<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateRequest<T> = WithoutId<T>;
export type UpdateRequest<T> = Partial<WithoutId<T>>;
