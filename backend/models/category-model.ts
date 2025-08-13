// Category Model - Database operations untuk categories
// Menggunakan Prisma dan any types untuk sementara

import { prisma } from '@/utils/database';
import { logger } from '@/utils/logger';

export class CategoryModel {
  // Find many categories with filters and pagination
  async findMany(searchParams: any): Promise<{
    categories: any[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }> {
    try {
      const { page = 1, limit = 10, query, parentId, sortBy = 'name', sortOrder = 'asc' } = searchParams;
      
      const skip = (page - 1) * limit;
      
      // Build where clause
      const where: Record<string, unknown> = {};
      
      if (parentId === 'null') {
        where['parentId'] = null; // Only root categories
      } else if (parentId) {
        where['parentId'] = parentId;
      }
      
      if (query) {
        where['OR'] = [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ];
      }
      
      // Get categories with relations
      const categories = await prisma.category.findMany({
        where,
        include: {
          parent: true,
          children: true,
          _count: {
            select: {
              posts: true,
              children: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      });
      
      // Get total count
      const total = await prisma.category.count({ where });
      const totalPages = Math.ceil(total / limit);
      
      return {
        categories: categories as any[],
        page,
        limit,
        total,
        totalPages,
      };
    } catch (error) {
      logger.error('Error finding categories:', error);
      throw error;
    }
  }

  // Find category by ID
  async findById(id: string): Promise<any | null> {
    try {
      const category = await prisma.category.findUnique({
        where: { id },
        include: {
          parent: true,
          children: true,
          _count: {
            select: {
              posts: true,
              children: true,
            },
          },
        },
      });
      
      return category as any | null;
    } catch (error) {
      logger.error('Error finding category by ID:', error);
      throw error;
    }
  }

  // Find category by slug
  async findBySlug(slug: string): Promise<any | null> {
    try {
      const category = await prisma.category.findUnique({
        where: { slug },
        include: {
          parent: true,
          children: true,
          _count: {
            select: {
              posts: true,
              children: true,
            },
          },
        },
      });
      
      return category as any | null;
    } catch (error) {
      logger.error('Error finding category by slug:', error);
      throw error;
    }
  }

  // Create new category
  async create(data: any): Promise<any> {
    try {
      const category = await prisma.category.create({
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          color: data.color || '#6b7280',
          parentId: data.parentId,
          isActive: data.isActive !== undefined ? data.isActive : true,
          sortOrder: data.sortOrder || 0,
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
        },
        include: {
          parent: true,
          children: true,
          _count: {
            select: {
              posts: true,
              children: true,
            },
          },
        },
      });
      
      return category as any;
    } catch (error) {
      logger.error('Error creating category:', error);
      throw error;
    }
  }

  // Update category
  async update(id: string, data: any): Promise<any | null> {
    try {
      const category = await prisma.category.update({
        where: { id },
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          color: data.color,
          parentId: data.parentId,
          isActive: data.isActive,
          sortOrder: data.sortOrder,
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
        },
        include: {
          parent: true,
          children: true,
          _count: {
            select: {
              posts: true,
              children: true,
            },
          },
        },
      });
      
      return category as any | null;
    } catch (error) {
      logger.error('Error updating category:', error);
      throw error;
    }
  }

  // Delete category
  async delete(id: string): Promise<boolean> {
    try {
      // Check if category has children
      const children = await prisma.category.findMany({
        where: { parentId: id },
      });

      if (children.length > 0) {
        throw new Error('Cannot delete category with children');
      }

      // Check if category has posts
      const posts = await prisma.post.findMany({
        where: { categoryId: id },
      });

      if (posts.length > 0) {
        throw new Error('Cannot delete category with posts');
      }

      await prisma.category.delete({
        where: { id },
      });
      
      return true;
    } catch (error) {
      logger.error('Error deleting category:', error);
      throw error;
    }
  }

  // Get category hierarchy
  async getHierarchy(): Promise<any[]> {
    try {
      const categories = await prisma.category.findMany({
        where: {},
        include: {
          parent: true,
          children: {
            where: {},
            include: {
              _count: {
                select: {
                  posts: true,
                },
              },
            },
          },
          _count: {
            select: {
              posts: true,
              children: true,
            },
          },
        },
        orderBy: [

          { name: 'asc' },
        ],
      });
      
      return categories as any[];
    } catch (error) {
      logger.error('Error getting category hierarchy:', error);
      throw error;
    }
  }

  // Get root categories only
  async getRootCategories(): Promise<any[]> {
    try {
      const categories = await prisma.category.findMany({
        where: {
          parentId: null,

        },
        include: {
          children: {
            where: {},
            include: {
              _count: {
                select: {
                  posts: true,
                },
              },
            },
          },
          _count: {
            select: {
              posts: true,
              children: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });
      
      return categories as any[];
    } catch (error) {
      logger.error('Error getting root categories:', error);
      throw error;
    }
  }

  // Get category stats
  async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    withPosts: number;
    withChildren: number;
  }> {
    try {
      const [total, active, inactive, withPosts, withChildren] = await Promise.all([
        prisma.category.count(),
        prisma.category.count(),
        prisma.category.count(),
        prisma.category.count({
          where: {
            posts: {
              some: {},
            },
          },
        }),
        prisma.category.count({
          where: {
            children: {
              some: {},
            },
          },
        }),
      ]);

      return {
        total,
        active,
        inactive,
        withPosts,
        withChildren,
      };
    } catch (error) {
      logger.error('Error getting category stats:', error);
      throw error;
    }
  }

  // Generate slug from name
  async generateSlug(name: string, excludeId?: string): Promise<string> {
    try {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      let counter = 1;
      let finalSlug = slug;
      let isUnique = false;

      while (!isUnique) {
        const existing = await prisma.category.findFirst({
          where: {
            slug: finalSlug,
            ...(excludeId && { id: { not: excludeId } }),
          },
        });

        if (!existing) {
          isUnique = true;
        } else {
          finalSlug = `${slug}-${counter}`;
          counter++;
        }
      }

      return finalSlug;
    } catch (error) {
      logger.error('Error generating slug:', error);
      throw error;
    }
  }
}
