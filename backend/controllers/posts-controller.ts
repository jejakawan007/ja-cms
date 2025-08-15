// Posts Controller - Business logic untuk posts
// Menggunakan shared types dan config

import { Request, Response } from 'express';
import { z } from 'zod';
import { CreatePostRequest, UpdatePostRequest, PostSearchParams } from '@shared/types';
import { PostService } from '../services/post-service';
import { createValidationError, createNotFoundError, createForbiddenError } from '../middleware/error-handler';

// Validation schemas
const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  slug: z.string().min(1, 'Slug is required').max(255, 'Slug too long'),
  excerpt: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  featuredImage: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  categoryIds: z.array(z.string()).optional(),
  tagIds: z.array(z.string()).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  canonicalUrl: z.string().optional(),
});

const updatePostSchema = createPostSchema.partial();

const querySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default('10'),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  categoryIds: z.array(z.string()).optional(),
  tagIds: z.array(z.string()).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export class PostsController {
  private postService: PostService;

  constructor() {
    this.postService = new PostService();
  }

  // Get all posts with pagination and filtering
  async getPosts(req: Request, res: Response): Promise<void> {
    const query = querySchema.parse(req.query);
    const searchParams: PostSearchParams = {
      page: query.page,
      limit: query.limit,
      status: query.status,
      categoryIds: query.categoryIds,
      tagIds: query.tagIds,
      query: query.search,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    };

    const result = await this.postService.getPosts(searchParams);

    res.json({
      success: true,
      data: result.posts,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
        hasNext: result.page < result.totalPages,
        hasPrev: result.page > 1,
      },
    });
  }

  // Get post by ID
  async getPost(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const post = await this.postService.getPostById(id);
    if (!post) {
      throw createNotFoundError('Post tidak ditemukan');
    }

    res.json({
      success: true,
      data: post,
    });
  }

  // Create new post
  async createPost(req: Request, res: Response): Promise<void> {
    const validation = createPostSchema.safeParse(req.body);
    if (!validation.success) {
      throw createValidationError(validation.error.errors[0]?.message || 'Data tidak valid');
    }

    const postData: CreatePostRequest = {
      title: validation.data.title,
      content: validation.data.content,
      excerpt: validation.data.excerpt,
      featuredImage: validation.data.featuredImage,
      status: validation.data.status,
      categoryIds: validation.data.categoryIds || [],
      tagIds: validation.data.tagIds || [],
    };
    
    const userId = (req as { user?: { userId: string } }).user?.userId;

    if (!userId) {
      throw createForbiddenError('Anda harus login untuk membuat post');
    }

    const post = await this.postService.createPost(postData, userId);

    res.status(201).json({
      success: true,
      data: post,
      message: 'Post berhasil dibuat',
    });
  }

  // Update post
  async updatePost(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const validation = updatePostSchema.safeParse(req.body);
    
    if (!validation.success) {
      throw createValidationError(validation.error.errors[0]?.message || 'Data tidak valid');
    }

    const updateData: UpdatePostRequest = validation.data;
    const userId = (req as { user?: { userId: string } }).user?.userId;

    if (!userId) {
      throw createForbiddenError('Anda harus login untuk mengupdate post');
    }

    const post = await this.postService.updatePost(id, updateData);
    if (!post) {
      throw createNotFoundError('Post tidak ditemukan');
    }

    res.json({
      success: true,
      data: post,
      message: 'Post berhasil diperbarui',
    });
  }

  // Delete post
  async deletePost(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = (req as { user?: { userId: string } }).user?.userId;

    if (!userId) {
      throw createForbiddenError('Anda harus login untuk menghapus post');
    }

    const deleted = await this.postService.deletePost(id);
    if (!deleted) {
      throw createNotFoundError('Post tidak ditemukan');
    }

    res.json({
      success: true,
      message: 'Post berhasil dihapus',
    });
  }

  // Publish post
  async publishPost(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = (req as { user?: { userId: string } }).user?.userId;

    if (!userId) {
      throw createForbiddenError('Anda harus login untuk publish post');
    }

    const post = await this.postService.publishPost(id);
    if (!post) {
      throw createNotFoundError('Post tidak ditemukan');
    }

    res.json({
      success: true,
      data: post,
      message: 'Post berhasil dipublish',
    });
  }

  // Unpublish post
  async unpublishPost(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = (req as { user?: { userId: string } }).user?.userId;

    if (!userId) {
      throw createForbiddenError('Anda harus login untuk unpublish post');
    }

    const post = await this.postService.unpublishPost(id);
    if (!post) {
      throw createNotFoundError('Post tidak ditemukan');
    }

    res.json({
      success: true,
      data: post,
      message: 'Post berhasil diunpublish',
    });
  }

  // Archive post
  async archivePost(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = (req as { user?: { userId: string } }).user?.userId;

    if (!userId) {
      throw createForbiddenError('Anda harus login untuk archive post');
    }

    const post = await this.postService.archivePost(id);
    if (!post) {
      throw createNotFoundError('Post tidak ditemukan');
    }

    res.json({
      success: true,
      data: post,
      message: 'Post berhasil diarchive',
    });
  }

  // Restore post
  async restorePost(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = (req as { user?: { userId: string } }).user?.userId;

    if (!userId) {
      throw createForbiddenError('Anda harus login untuk restore post');
    }

    const post = await this.postService.restorePost(id);
    if (!post) {
      throw createNotFoundError('Post tidak ditemukan');
    }

    res.json({
      success: true,
      data: post,
      message: 'Post berhasil direstore',
    });
  }

  // Schedule post
  async schedulePost(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { scheduledAt } = req.body;
    const userId = (req as { user?: { userId: string } }).user?.userId;

    if (!userId) {
      throw createForbiddenError('Anda harus login untuk schedule post');
    }

    if (!scheduledAt) {
      throw createValidationError('Scheduled date diperlukan');
    }

    const post = await this.postService.schedulePost(id, new Date(scheduledAt));
    if (!post) {
      throw createNotFoundError('Post tidak ditemukan');
    }

    res.json({
      success: true,
      data: post,
      message: 'Post berhasil dijadwalkan',
    });
  }

  // Unschedule post
  async unschedulePost(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = (req as { user?: { userId: string } }).user?.userId;

    if (!userId) {
      throw createForbiddenError('Anda harus login untuk unschedule post');
    }

    const post = await this.postService.unschedulePost(id);
    if (!post) {
      throw createNotFoundError('Post tidak ditemukan');
    }

    res.json({
      success: true,
      data: post,
      message: 'Post berhasil diunschedule',
    });
  }

  // Get posts by author
  async getPostsByAuthor(req: Request, res: Response): Promise<void> {
    const { authorId } = req.params;
    const query = querySchema.parse(req.query);

    const result = await this.postService.getPostsByAuthor(authorId, {
      page: query.page,
      limit: query.limit,
    });

    res.json({
      success: true,
      data: result.posts,
      pagination: {
        page: result.pagination.page,
        limit: result.pagination.limit,
        total: result.pagination.total,
        totalPages: result.pagination.totalPages,
        hasNext: result.pagination.page < result.pagination.totalPages,
        hasPrev: result.pagination.page > 1,
      },
    });
  }

  // Get posts by category
  async getPostsByCategory(req: Request, res: Response): Promise<void> {
    const { categoryId } = req.params;
    const query = querySchema.parse(req.query);

    const result = await this.postService.getPostsByCategory(categoryId, {
      page: query.page,
      limit: query.limit,
    });

    res.json({
      success: true,
      data: result.posts,
      pagination: {
        page: result.pagination.page,
        limit: result.pagination.limit,
        total: result.pagination.total,
        totalPages: result.pagination.totalPages,
        hasNext: result.pagination.page < result.pagination.totalPages,
        hasPrev: result.pagination.page > 1,
      },
    });
  }

  // Search posts
  async searchPosts(req: Request, res: Response): Promise<void> {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      throw createValidationError('Query parameter diperlukan');
    }

    const posts = await this.postService.searchPosts(q);

    res.json({
      success: true,
      data: posts,
    });
  }

  // Get post statistics
  async getPostStats(_req: Request, res: Response): Promise<void> {
    const stats = await this.postService.getPostStats();

    res.json({
      success: true,
      data: stats,
    });
  }
} 