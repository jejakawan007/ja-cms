// Post Service - Business logic untuk post management
// Menggunakan shared types dan config

import { Post, CreatePostRequest, UpdatePostRequest, PostSearchParams } from '@shared/types';
import { PostModel } from '../models/post-model';

export class PostService {
  private postModel: PostModel;

  constructor() {
    this.postModel = new PostModel();
  }

  // Get all posts with pagination and filters
  async getPosts(searchParams: PostSearchParams): Promise<{
    posts: Post[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }> {
    return await this.postModel.findMany(searchParams);
  }

  // Get post by ID
  async getPostById(id: string): Promise<Post | null> {
    return await this.postModel.findById(id);
  }

  // Create new post
  async createPost(postData: CreatePostRequest, authorId: string): Promise<Post> {
    // Set default category if none provided
    if (!postData.categoryIds || postData.categoryIds.length === 0) {
      // Find Uncategorized category
      const uncategorizedCategory = await this.postModel.findCategoryBySlug('uncategorized');
      if (uncategorizedCategory) {
        postData.categoryIds = [uncategorizedCategory.id];
      }
    }

    const post = await this.postModel.create({
      ...postData,
      authorId,
    });
    
    return post;
  }

  // Update post
  async updatePost(id: string, updateData: UpdatePostRequest): Promise<Post | null> {
    return await this.postModel.update(id, updateData);
  }

  // Delete post
  async deletePost(id: string): Promise<boolean> {
    return await this.postModel.delete(id);
  }

  // Publish post
  async publishPost(id: string): Promise<Post | null> {
    return await this.postModel.update(id, {
      status: 'PUBLISHED',
      publishedAt: new Date(),
    });
  }

  // Unpublish post
  async unpublishPost(id: string): Promise<Post | null> {
    return await this.postModel.update(id, {
      status: 'DRAFT',
      publishedAt: null,
    });
  }

  // Archive post
  async archivePost(id: string): Promise<Post | null> {
    return await this.postModel.update(id, {
      status: 'ARCHIVED',
    });
  }

  // Restore post
  async restorePost(id: string): Promise<Post | null> {
    return await this.postModel.update(id, {
      status: 'DRAFT',
    });
  }

  // Schedule post
  async schedulePost(id: string, scheduledAt: Date): Promise<Post | null> {
    return await this.postModel.update(id, {
      status: 'SCHEDULED',
      publishedAt: scheduledAt,
    });
  }

  // Unschedule post
  async unschedulePost(id: string): Promise<Post | null> {
    return await this.postModel.update(id, {
      status: 'DRAFT',
    });
  }

  // Get posts by author
  async getPostsByAuthor(authorId: string, pagination: { page: number; limit: number }): Promise<{
    posts: Post[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    return await this.postModel.findByAuthor(authorId, pagination);
  }

  // Get posts by category
  async getPostsByCategory(categoryId: string, pagination: { page: number; limit: number }): Promise<{
    posts: Post[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    return await this.postModel.findByCategory(categoryId, pagination);
  }

  // Search posts
  async searchPosts(query: string): Promise<Post[]> {
    return await this.postModel.search(query);
  }

  // Get post statistics
  async getPostStats(): Promise<{
    total: number;
    published: number;
    draft: number;
    archived: number;
    byCategory: Record<string, number>;
    recentPosts: Post[];
  }> {
    return await this.postModel.getStats();
  }

  // Get recent posts
  async getRecentPosts(limit: number = 10): Promise<Post[]> {
    return await this.postModel.findRecent(limit);
  }

  // Get posts with pagination
  async getPostsWithPagination(page: number = 1, limit: number = 10): Promise<{
    posts: Post[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    return await this.postModel.findWithPagination(page, limit);
  }
} 