// Post Model - Database operations untuk posts
// Menggunakan Prisma dan shared types

import { Post, CreatePostRequest, UpdatePostRequest, PostSearchParams } from '@shared/types';
import { prisma } from '@/utils/database';
import { logger } from '@/utils/logger';

export class PostModel {
  // Find many posts with filters and pagination
  async findMany(searchParams: PostSearchParams): Promise<{
    posts: Post[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }> {
    try {
      const { page = 1, limit = 10, status, categoryIds, tagIds, query, sortBy = 'createdAt', sortOrder = 'desc' } = searchParams;
      
      const skip = (page - 1) * limit;
      
      // Build where clause
      const where: Record<string, unknown> = {};
      
      if (status) {
        where['status'] = status;
      }
      
      if (query) {
        where['OR'] = [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
          { excerpt: { contains: query, mode: 'insensitive' } },
        ];
      }
      
      if (categoryIds && categoryIds.length > 0) {
        where['categoryId'] = { in: categoryIds };
      }
      
      if (tagIds && tagIds.length > 0) {
        where['tags'] = {
          some: {
            id: { in: tagIds }
          }
        };
      }
      
      // Get posts with relations
      const posts = await prisma.post.findMany({
        where,
        include: {
          author: true,
          category: true,
          tags: true,
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      });
      
      // Get total count
      const total = await prisma.post.count({ where });
      const totalPages = Math.ceil(total / limit);
      
      return {
        posts: posts as unknown as Post[],
        page,
        limit,
        total,
        totalPages,
      };
    } catch (error) {
      logger.error('Error finding posts:', error);
      throw error;
    }
  }

  // Find post by ID
  async findById(id: string): Promise<Post | null> {
    try {
      const post = await prisma.post.findUnique({
        where: { id },
        include: {
          author: true,
          category: true,
          tags: true,
        },
      });
      
      return post as unknown as Post | null;
    } catch (error) {
      logger.error('Error finding post by ID:', error);
      throw error;
    }
  }

  // Find category by slug
  async findCategoryBySlug(slug: string): Promise<any | null> {
    try {
      const category = await prisma.category.findUnique({
        where: { slug },
      });
      
      return category;
    } catch (error) {
      logger.error('Error finding category by slug:', error);
      throw error;
    }
  }

  // Create new post
  async create(data: CreatePostRequest & { authorId: string }): Promise<Post> {
    try {
      const { categoryIds, tagIds, ...postData } = data;
      
      const { authorId, ...createData } = postData;
      const post = await prisma.post.create({
        data: {
          ...createData,
          categoryId: categoryIds && categoryIds.length > 0 ? categoryIds[0] : null,
          tags: tagIds ? {
            connect: tagIds.map(id => ({ id }))
          } : undefined,
          author: {
            connect: { id: authorId }
          }
        } as any,
        include: {
          author: true,
          category: true,
          tags: true,
        },
      });
      
      logger.info(`Post created: ${post.id}`);
      return post as unknown as Post;
    } catch (error) {
      logger.error('Error creating post:', error);
      throw error;
    }
  }

  // Update post
  async update(id: string, data: UpdatePostRequest): Promise<Post | null> {
    try {
      const { categoryIds, tagIds, ...updateData } = data;
      
      const post = await prisma.post.update({
        where: { id },
        data: {
          ...updateData,
          categoryId: categoryIds && categoryIds.length > 0 ? categoryIds[0] : null,
          tags: tagIds ? {
            set: tagIds.map(id => ({ id }))
          } : undefined,
        } as any,
        include: {
          author: true,
          category: true,
          tags: true,
        },
      });
      
      logger.info(`Post updated: ${id}`);
      return post as unknown as Post;
    } catch (error) {
      logger.error('Error updating post:', error);
      throw error;
    }
  }

  // Delete post
  async delete(id: string): Promise<boolean> {
    try {
      await prisma.post.delete({
        where: { id },
      });
      
      logger.info(`Post deleted: ${id}`);
      return true;
    } catch (error) {
      logger.error('Error deleting post:', error);
      throw error;
    }
  }

  // Find posts by author
  async findByAuthor(authorId: string, pagination: { page: number; limit: number }): Promise<{
    posts: Post[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const { page, limit } = pagination;
      const skip = (page - 1) * limit;
      
      const posts = await prisma.post.findMany({
        where: { authorId },
        include: {
          author: true,
          category: true,
          tags: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      });
      
      const total = await prisma.post.count({ where: { authorId } });
      const totalPages = Math.ceil(total / limit);
      
      return {
        posts: posts as unknown as Post[],
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    } catch (error) {
      logger.error('Error finding posts by author:', error);
      throw error;
    }
  }

  // Find posts by category
  async findByCategory(categoryId: string, pagination: { page: number; limit: number }): Promise<{
    posts: Post[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const { page, limit } = pagination;
      const skip = (page - 1) * limit;
      
      const posts = await prisma.post.findMany({
        where: {
          categoryId: categoryId
        },
        include: {
          author: true,
          category: true,
          tags: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      });
      
      const total = await prisma.post.count({
        where: {
          categoryId: categoryId
        }
      });
      const totalPages = Math.ceil(total / limit);
      
      return {
        posts: posts as unknown as Post[],
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    } catch (error) {
      logger.error('Error finding posts by category:', error);
      throw error;
    }
  }

  // Search posts
  async search(query: string): Promise<Post[]> {
    try {
      const posts = await prisma.post.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
            { excerpt: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: {
          author: true,
          category: true,
          tags: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      
      return posts as unknown as Post[];
    } catch (error) {
      logger.error('Error searching posts:', error);
      throw error;
    }
  }

  // Get post statistics
  async getStats(): Promise<{
    total: number;
    published: number;
    draft: number;
    archived: number;
    byCategory: Record<string, number>;
    recentPosts: Post[];
  }> {
    try {
      const [total, published, draft, archived, recentPosts] = await Promise.all([
        prisma.post.count(),
        prisma.post.count({ where: { status: 'PUBLISHED' } }),
        prisma.post.count({ where: { status: 'DRAFT' } }),
        prisma.post.count({ where: { status: 'ARCHIVED' } }),
        prisma.post.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            author: true,
            category: true,
            tags: true,
          },
        }),
      ]);
      
      // Get posts by category
      const postsByCategory = await prisma.post.groupBy({
        by: ['categoryId'],
        _count: true,
      });
      
      const byCategory: Record<string, number> = {};
      postsByCategory.forEach((item) => {
        if (item.categoryId) {
          byCategory[item.categoryId] = item._count;
        }
      });
      
      return {
        total,
        published,
        draft,
        archived,
        byCategory,
        recentPosts: recentPosts as unknown as Post[],
      };
    } catch (error) {
      logger.error('Error getting post stats:', error);
      throw error;
    }
  }

  // Find recent posts
  async findRecent(limit: number = 10): Promise<Post[]> {
    try {
      const posts = await prisma.post.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: true,
          category: true,
          tags: true,
        },
      });
      
      return posts as unknown as Post[];
    } catch (error) {
      logger.error('Error finding recent posts:', error);
      throw error;
    }
  }

  // Find posts with pagination
  async findWithPagination(page: number = 1, limit: number = 10): Promise<{
    posts: Post[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const skip = (page - 1) * limit;
      
      const posts = await prisma.post.findMany({
        include: {
          author: true,
          category: true,
          tags: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      });
      
      const total = await prisma.post.count();
      const totalPages = Math.ceil(total / limit);
      
      return {
        posts: posts as unknown as Post[],
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    } catch (error) {
      logger.error('Error finding posts with pagination:', error);
      throw error;
    }
  }
} 