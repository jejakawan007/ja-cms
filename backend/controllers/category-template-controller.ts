import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { categoryTemplateService } from '../services/category-template-service';

const prisma = new PrismaClient();

class CategoryTemplateController {
  /**
   * Create a category template
   */
  async createTemplate(req: Request, res: Response) {
    try {
      const templateData = req.body;
      
      const template = await categoryTemplateService.createTemplate(templateData);

      res.json({
        success: true,
        data: template,
        message: 'Category template created successfully'
      });
    } catch (error) {
      console.error('Error creating category template:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create category template'
      });
    }
  }

  /**
   * Get all category templates
   */
  async getTemplates(_req: Request, res: Response) {
    try {
      const templates = await categoryTemplateService.getTemplates();
      res.json({
        success: true,
        data: templates,
        message: 'Templates retrieved successfully'
      });
    } catch (error) {
      console.error('Error getting templates:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'TEMPLATE_FETCH_ERROR',
          message: 'Failed to retrieve templates'
        }
      });
    }
  }

  /**
   * Get template by ID
   */
  async getTemplateById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const template = await categoryTemplateService.getTemplateById(id);

      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Category template not found'
        });
      }

      res.json({
        success: true,
        data: template,
        message: 'Category template retrieved successfully'
      });
    } catch (error) {
      console.error('Error fetching category template:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch category template'
      });
    }
  }

  /**
   * Update category template
   */
  async updateTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const template = await categoryTemplateService.updateTemplate(id, updates);

      res.json({
        success: true,
        data: template,
        message: 'Category template updated successfully'
      });
    } catch (error) {
      console.error('Error updating category template:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update category template'
      });
    }
  }

  /**
   * Delete category template
   */
  async deleteTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      await categoryTemplateService.deleteTemplate(id);

      res.json({
        success: true,
        message: 'Category template deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting category template:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete category template'
      });
    }
  }

  /**
   * Create categories from template
   */
  async createFromTemplate(req: Request, res: Response) {
    try {
      const { templateId } = req.params;
      const { categoryData } = req.body;

      if (!Array.isArray(categoryData)) {
        return res.status(400).json({
          success: false,
          message: 'Category data must be an array'
        });
      }

      const result = await categoryTemplateService.createFromTemplate(templateId, categoryData);

      res.json({
        success: true,
        data: result,
        message: `Created ${result.success} categories from template`
      });
    } catch (error) {
      console.error('Error creating categories from template:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create categories from template'
      });
    }
  }

  /**
   * Bulk update categories
   */
  async bulkUpdateCategories(req: Request, res: Response) {
    try {
      const { updates } = req.body;

      if (!Array.isArray(updates)) {
        return res.status(400).json({
          success: false,
          message: 'Updates must be an array'
        });
      }

      const result = await categoryTemplateService.bulkUpdateCategories(updates);

      res.json({
        success: true,
        data: result,
        message: `Updated ${result.success} categories`
      });
    } catch (error) {
      console.error('Error bulk updating categories:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to bulk update categories'
      });
    }
  }

  /**
   * Bulk delete categories
   */
  async bulkDeleteCategories(req: Request, res: Response) {
    try {
      const { categoryIds } = req.body;

      if (!Array.isArray(categoryIds)) {
        return res.status(400).json({
          success: false,
          message: 'Category IDs must be an array'
        });
      }

      const result = await categoryTemplateService.bulkDeleteCategories(categoryIds);

      res.json({
        success: true,
        data: result,
        message: `Deleted ${result.success} categories`
      });
    } catch (error) {
      console.error('Error bulk deleting categories:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to bulk delete categories'
      });
    }
  }

  /**
   * Bulk activate/deactivate categories
   */
  async bulkToggleCategories(req: Request, res: Response) {
    try {
      const { categoryIds, isActive } = req.body;

      if (!Array.isArray(categoryIds)) {
        return res.status(400).json({
          success: false,
          message: 'Category IDs must be an array'
        });
      }

      if (typeof isActive !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'isActive must be a boolean'
        });
      }

      const result = await categoryTemplateService.bulkToggleCategories(categoryIds, isActive);

      res.json({
        success: true,
        data: result,
        message: `${isActive ? 'Activated' : 'Deactivated'} ${result.success} categories`
      });
    } catch (error) {
      console.error('Error bulk toggling categories:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to bulk toggle categories'
      });
    }
  }

  /**
   * Import categories from CSV
   */
  async importFromCSV(req: Request, res: Response) {
    try {
      const { csvData, templateId } = req.body;

      if (!csvData || typeof csvData !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'CSV data is required'
        });
      }

      const result = await categoryTemplateService.importFromCSV(csvData, templateId);

      res.json({
        success: true,
        data: result,
        message: `Imported ${result.success} categories from CSV`
      });
    } catch (error) {
      console.error('Error importing categories from CSV:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to import categories from CSV'
      });
    }
  }

  /**
   * Export categories to CSV
   */
  async exportToCSV(req: Request, res: Response) {
    try {
      const { categoryIds } = req.query;

      let ids: string[] = [];
      if (categoryIds) {
        ids = Array.isArray(categoryIds) 
          ? categoryIds.map(id => String(id))
          : [String(categoryIds)];
      }

      const csvData = await categoryTemplateService.exportToCSV(ids);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="categories.csv"');
      res.send(csvData);
    } catch (error) {
      console.error('Error exporting categories to CSV:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export categories to CSV'
      });
    }
  }

  /**
   * Get category statistics
   */
  async getCategoryStats(_req: Request, res: Response) {
    try {
      const stats = await categoryTemplateService.getCategoryStats();
      res.json({
        success: true,
        data: stats,
        message: 'Category statistics retrieved successfully'
      });
    } catch (error) {
      console.error('Error getting category stats:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'STATS_FETCH_ERROR',
          message: 'Failed to retrieve category statistics'
        }
      });
    }
  }

  /**
   * Get categories with advanced filtering
   */
  async getCategoriesAdvanced(req: Request, res: Response) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        status,
        parentId,
        sortBy = 'sortOrder',
        sortOrder = 'asc'
      } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      // Build where clause
      const where: any = {};
      
      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } },
          { slug: { contains: search as string, mode: 'insensitive' } }
        ];
      }

      if (status === 'active') {
        where.isActive = true;
      } else if (status === 'inactive') {
        where.isActive = false;
      }

      if (parentId) {
        where.parentId = parentId;
      }

      // Build orderBy clause
      const orderBy: any = {};
      orderBy[sortBy as string] = sortOrder;

      const [categories, total] = await Promise.all([
        prisma.category.findMany({
          where,
          orderBy,
          skip,
          take: limitNum,
          include: {
            parent: true,
            children: true,
            _count: {
              select: {
                posts: true,
                children: true
              }
            }
          }
        }),
        prisma.category.count({ where })
      ]);

      const totalPages = Math.ceil(total / limitNum);

      res.json({
        success: true,
        data: {
          categories,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages,
            hasNext: pageNum < totalPages,
            hasPrev: pageNum > 1
          }
        },
        message: 'Categories retrieved successfully'
      });
    } catch (error) {
      console.error('Error fetching categories with advanced filtering:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch categories'
      });
    }
  }
}

export const categoryTemplateController = new CategoryTemplateController();
