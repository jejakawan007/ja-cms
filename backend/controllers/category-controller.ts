// Category Controller - HTTP request handlers untuk categories

import { Request, Response } from 'express';
import { CategoryModel } from '@/models/category-model';
import { logger } from '@/utils/logger';
import { validateRequest } from '@/middleware/validation';
import { z } from 'zod';
import { CreateCategoryRequest, UpdateCategoryRequest } from '@shared/types';

const categoryModel = new CategoryModel();

// Validation schemas
const createCategorySchema = z.object({
  name: z.string().min(1, 'Nama kategori harus diisi'),
  slug: z.string().min(1, 'Slug harus diisi'),
  description: z.string().nullable().optional(),
  image: z.string().optional(),
  parentId: z.string().nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  metaTitle: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
});

const updateCategorySchema = z.object({
  name: z.string().min(1, 'Nama kategori harus diisi').optional(),
  slug: z.string().min(1, 'Slug harus diisi').optional(),
  description: z.string().nullable().optional(),
  image: z.string().optional(),
  parentId: z.string().nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  metaTitle: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
});

export class CategoryController {
  // Get all categories with pagination and filters
  async getCategories(req: Request, res: Response) {
    try {
      const {
        page = 1,
        limit = 10,
        query,
        parentId,
        isActive,
        sortBy = 'name',
        sortOrder = 'asc',
      } = req.query;

      const searchParams = {
        page: Number(page),
        limit: Number(limit),
        query: query as string,
        parentId: parentId as string,
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
      };

      const result = await categoryModel.findMany(searchParams);

      return res.json({
        success: true,
        data: result.categories,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
          hasNext: result.page < result.totalPages,
          hasPrev: result.page > 1,
        },
      });
    } catch (error) {
      logger.error('Error getting categories:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Gagal memuat kategori',
        },
      });
    }
  }

  // Get category by ID
  async getCategoryById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const category = await categoryModel.findById(id);

      if (!category) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Kategori tidak ditemukan',
          },
        });
      }

      return res.json({
        success: true,
        data: category,
      });
    } catch (error) {
      logger.error('Error getting category by ID:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Gagal memuat kategori',
        },
      });
    }
  }

  // Get category by slug
  async getCategoryBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;

      const category = await categoryModel.findBySlug(slug);

      if (!category) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Kategori tidak ditemukan',
          },
        });
      }

      return res.json({
        success: true,
        data: category,
      });
    } catch (error) {
      logger.error('Error getting category by slug:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Gagal memuat kategori',
        },
      });
    }
  }

  // Create new category
  async createCategory(req: Request, res: Response) {
    try {
      const validation = validateRequest(createCategorySchema, req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Data tidak valid',
            details: validation.errors,
          },
        });
      }

      const data = validation.data;

      // Generate slug if not provided
      if (!data.slug) {
        data.slug = await categoryModel.generateSlug(data.name);
      }

      const category = await categoryModel.create(data as CreateCategoryRequest);

      return res.status(201).json({
        success: true,
        data: category,
        message: 'Kategori berhasil dibuat',
      });
    } catch (error) {
      logger.error('Error creating category:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Unique constraint')) {
          return res.status(400).json({
            success: false,
            error: {
              message: 'Slug kategori sudah ada',
            },
          });
        }
      }

      return res.status(500).json({
        success: false,
        error: {
          message: 'Gagal membuat kategori',
        },
      });
    }
  }

  // Update category
  async updateCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const validation = validateRequest(updateCategorySchema, req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Data tidak valid',
            details: validation.errors,
          },
        });
      }

      const data = validation.data;

      // Generate slug if name is provided but slug is not
      if (data.name && !data.slug) {
        data.slug = await categoryModel.generateSlug(data.name, id);
      }

      const category = await categoryModel.update(id, data as UpdateCategoryRequest);

      if (!category) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Kategori tidak ditemukan',
          },
        });
      }

      return res.json({
        success: true,
        data: category,
        message: 'Kategori berhasil diperbarui',
      });
    } catch (error) {
      logger.error('Error updating category:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Unique constraint')) {
          return res.status(400).json({
            success: false,
            error: {
              message: 'Slug kategori sudah ada',
            },
          });
        }
      }

      return res.status(500).json({
        success: false,
        error: {
          message: 'Gagal memperbarui kategori',
        },
      });
    }
  }

  // Delete category
  async deleteCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const deleted = await categoryModel.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Kategori tidak ditemukan',
          },
        });
      }

      return res.json({
        success: true,
        message: 'Kategori berhasil dihapus',
      });
    } catch (error) {
      logger.error('Error deleting category:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Cannot delete category with children')) {
          return res.status(400).json({
            success: false,
            error: {
              message: 'Tidak dapat menghapus kategori yang memiliki sub-kategori',
            },
          });
        }
        
        if (error.message.includes('Cannot delete category with posts')) {
          return res.status(400).json({
            success: false,
            error: {
              message: 'Tidak dapat menghapus kategori yang memiliki post',
            },
          });
        }
      }

      return res.status(500).json({
        success: false,
        error: {
          message: 'Gagal menghapus kategori',
        },
      });
    }
  }

  // Get category hierarchy
  async getCategoryHierarchy(_req: Request, res: Response) {
    try {
      const categories = await categoryModel.getHierarchy();

      return res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      logger.error('Error getting category hierarchy:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Gagal memuat hierarki kategori',
        },
      });
    }
  }

  // Get root categories
  async getRootCategories(_req: Request, res: Response) {
    try {
      const categories = await categoryModel.getRootCategories();

      return res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      logger.error('Error getting root categories:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Gagal memuat kategori utama',
        },
      });
    }
  }

  // Get category stats
  async getCategoryStats(_req: Request, res: Response) {
    try {
      const stats = await categoryModel.getStats();

      return res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      logger.error('Error getting category stats:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Gagal memuat statistik kategori',
        },
      });
    }
  }

  // Generate slug
  async generateSlug(req: Request, res: Response) {
    try {
      const { name, excludeId } = req.query;

      if (!name || typeof name !== 'string') {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Nama kategori harus disediakan',
          },
        });
      }

      const slug = await categoryModel.generateSlug(name, excludeId as string);

      return res.json({
        success: true,
        data: { slug },
      });
    } catch (error) {
      logger.error('Error generating slug:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Gagal menghasilkan slug',
        },
      });
    }
  }
}
