import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TagsQueryOptions {
  search?: string;
  limit: number;
}

interface CreateTagData {
  name: string;
  slug: string;
  color?: string;
  description?: string;
}

interface UpdateTagData {
  name?: string;
  slug?: string;
  color?: string;
  description?: string;
}

interface TagWhereInput {
  OR?: Array<{
    name?: { contains: string; mode: 'insensitive' };
    slug?: { contains: string; mode: 'insensitive' };
  }>;
}

export class TagsService {
  // Get all tags
  static async getAllTags(options: TagsQueryOptions) {
    try {
      const { search, limit } = options;
      
      const where: TagWhereInput = {};
      
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } }
        ];
      }

      const tags = await prisma.tag.findMany({
        where,
        take: limit,
        orderBy: {
          name: 'asc'
        },
        include: {
          _count: {
            select: {
              posts: true
            }
          }
        }
      });

      return tags.map(tag => ({
        ...tag,
        postCount: tag._count.posts
      }));
    } catch (error) {
      // Log error for debugging
      throw new Error('Failed to get tags');
    }
  }

  // Get tag by ID
  static async getTagById(id: string) {
    try {
      const tag = await prisma.tag.findUnique({
        where: { id },
        include: {
          posts: {
            select: {
              id: true,
              title: true,
              slug: true,
              status: true,
              createdAt: true
            }
          },
          _count: {
            select: {
              posts: true
            }
          }
        }
      });

      if (!tag) {
        return null;
      }

      return {
        ...tag,
        postCount: tag._count.posts
      };
    } catch (error) {
      // Log error for debugging
      throw new Error('Failed to get tag');
    }
  }

  // Create tag
  static async createTag(data: CreateTagData) {
    try {
      const tag = await prisma.tag.create({
        data: {
          name: data.name,
          slug: data.slug,
          color: data.color || '#6B7280',
          description: data.description
        }
      });

      return tag;
    } catch (error) {
      // Log error for debugging
      throw new Error('Failed to create tag');
    }
  }

  // Update tag
  static async updateTag(id: string, updateData: UpdateTagData) {
    try {
      const tag = await prisma.tag.update({
        where: { id },
        data: updateData
      });

      return tag;
    } catch (error) {
      // Log error for debugging
      throw new Error('Failed to update tag');
    }
  }

  // Delete tag
  static async deleteTag(id: string) {
    try {
      const tag = await prisma.tag.delete({
        where: { id }
      });

      return tag;
    } catch (error) {
      // Log error for debugging
      throw new Error('Failed to delete tag');
    }
  }

  // Get tag statistics
  static async getTagStats() {
    try {
      const [
        totalTags,
        tagsWithPosts,
        topTags
      ] = await Promise.all([
        prisma.tag.count(),
        prisma.tag.count({
          where: {
            posts: {
              some: {}
            }
          }
        }),
        prisma.tag.findMany({
          take: 10,
          orderBy: {
            posts: {
              _count: 'desc'
            }
          },
          include: {
            _count: {
              select: {
                posts: true
              }
            }
          }
        })
      ]);

      return {
        totalTags,
        tagsWithPosts,
        tagsWithoutPosts: totalTags - tagsWithPosts,
        topTags: topTags.map(tag => ({
          id: tag.id,
          name: tag.name,
          slug: tag.slug,
          color: tag.color,
          postCount: tag._count.posts
        }))
      };
    } catch (error) {
      // Log error for debugging
      throw new Error('Failed to get tag statistics');
    }
  }
}
