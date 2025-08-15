// Posts API Service
// Service for managing posts

import { apiClient, ApiResponse } from './client';

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'SCHEDULED';
  publishedAt?: string;
  authorId: string;
  categoryId?: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  tags: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'SCHEDULED';
  categoryId?: string;
  tagIds?: string[];
  publishedAt?: string;
}

export interface UpdatePostRequest extends Partial<CreatePostRequest> {
  id: string;
}

export interface PostSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'SCHEDULED';
  categoryId?: string;
  authorId?: string;
  tagIds?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: unknown;
}

export const postsApi = {
  // Get all posts
  async getPosts(params?: PostSearchParams): Promise<ApiResponse<{ posts: Post[]; pagination: unknown }>> {
    return apiClient.get<{ posts: Post[]; pagination: unknown }>('/posts', params);
  },

  // Get single post
  async getPost(id: string): Promise<ApiResponse<Post>> {
    return apiClient.get<Post>(`/posts/${id}`);
  },

  // Get post by slug
  async getPostBySlug(slug: string): Promise<ApiResponse<Post>> {
    return apiClient.get<Post>(`/posts/slug/${slug}`);
  },

  // Create post
  async createPost(data: CreatePostRequest): Promise<ApiResponse<Post>> {
    return apiClient.post<Post>('/posts', data);
  },

  // Update post
  async updatePost(data: UpdatePostRequest): Promise<ApiResponse<Post>> {
    const { id, ...updateData } = data;
    return apiClient.put<Post>(`/posts/${id}`, updateData);
  },

  // Delete post
  async deletePost(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/posts/${id}`);
  },

  // Publish post
  async publishPost(id: string): Promise<ApiResponse<Post>> {
    return apiClient.patch<Post>(`/posts/${id}/publish`);
  },

  // Unpublish post
  async unpublishPost(id: string): Promise<ApiResponse<Post>> {
    return apiClient.patch<Post>(`/posts/${id}/unpublish`);
  },

  // Get post statistics
  async getPostStats(): Promise<ApiResponse<{
    total: number;
    published: number;
    draft: number;
    archived: number;
    scheduled: number;
  }>> {
    return apiClient.get<{
      total: number;
      published: number;
      draft: number;
      archived: number;
      scheduled: number;
    }>('/posts/stats');
  }
};
