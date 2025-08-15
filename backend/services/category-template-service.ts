import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CategoryTemplate {
  id: string;
  name: string;
  description: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  isActive: boolean;
  parentId?: string;
  sortOrder: number;
  icon: string;
  color: string;
  settings: any; // Use any for JsonValue compatibility
  createdAt: Date;
  updatedAt: Date;
}

interface BulkOperationResult {
  success: number;
  failed: number;
  errors: Array<{
    categoryId: string;
    error: string;
  }>;
  details: {
    created: number;
    updated: number;
    deleted: number;
    activated: number;
    deactivated: number;
  };
}

export class CategoryTemplateService {
  /**
   * Create a category template
   */
  async createTemplate(template: Omit<CategoryTemplate, 'id'>): Promise<CategoryTemplate> {
    try {
      const createdTemplate = await prisma.categoryTemplate.create({
        data: {
          name: template.name,
          description: template.description,
          slug: template.slug,
          metaTitle: template.metaTitle,
          metaDescription: template.metaDescription,
          metaKeywords: template.metaKeywords,
          isActive: template.isActive,
          parentId: template.parentId,
          sortOrder: template.sortOrder,
          icon: template.icon,
          color: template.color,
          settings: template.settings
        }
      });

      return createdTemplate;
    } catch (error) {
      console.error('Error creating category template:', error);
      throw new Error('Failed to create category template');
    }
  }

  /**
   * Get all category templates
   */
  async getTemplates(): Promise<CategoryTemplate[]> {
    try {
      const templates = await prisma.categoryTemplate.findMany({
        orderBy: {
          sortOrder: 'asc'
        }
      });

      return templates;
    } catch (error) {
      console.error('Error fetching category templates:', error);
      throw new Error('Failed to fetch category templates');
    }
  }

  /**
   * Get template by ID
   */
  async getTemplateById(id: string): Promise<CategoryTemplate | null> {
    try {
      const template = await prisma.categoryTemplate.findUnique({
        where: { id }
      });

      return template;
    } catch (error) {
      console.error('Error fetching category template:', error);
      throw new Error('Failed to fetch category template');
    }
  }

  /**
   * Update category template
   */
  async updateTemplate(id: string, updates: Partial<CategoryTemplate>): Promise<CategoryTemplate> {
    try {
      const updatedTemplate = await prisma.categoryTemplate.update({
        where: { id },
        data: updates
      });

      return updatedTemplate;
    } catch (error) {
      console.error('Error updating category template:', error);
      throw new Error('Failed to update category template');
    }
  }

  /**
   * Delete category template
   */
  async deleteTemplate(id: string): Promise<void> {
    try {
      await prisma.categoryTemplate.delete({
        where: { id }
      });
    } catch (error) {
      console.error('Error deleting category template:', error);
      throw new Error('Failed to delete category template');
    }
  }

  /**
   * Create categories from template
   */
  async createFromTemplate(templateId: string, categoryData: Array<{
    name: string;
    description?: string;
    parentId?: string;
    sortOrder?: number;
  }>): Promise<BulkOperationResult> {
    const result: BulkOperationResult = {
      success: 0,
      failed: 0,
      errors: [],
      details: {
        created: 0,
        updated: 0,
        deleted: 0,
        activated: 0,
        deactivated: 0
      }
    };

    try {
      const template = await this.getTemplateById(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      for (const data of categoryData) {
        try {
          await prisma.category.create({
            data: {
              name: data.name,
              description: data.description || template.description,
              slug: this.generateSlug(data.name),
              metaTitle: template.metaTitle.replace('{name}', data.name),
              metaDescription: template.metaDescription.replace('{name}', data.name),
              isActive: template.isActive,
              parentId: data.parentId || template.parentId,
              sortOrder: data.sortOrder || template.sortOrder,
              color: template.color
            }
          });
          result.success++;
          result.details.created++;
        } catch (error) {
          result.failed++;
          result.errors.push({
            categoryId: data.name,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      return result;
    } catch (error) {
      console.error('Error creating categories from template:', error);
      throw new Error('Failed to create categories from template');
    }
  }

  /**
   * Bulk update categories
   */
  async bulkUpdateCategories(updates: Array<{
    id: string;
    updates: Partial<CategoryTemplate>;
  }>): Promise<BulkOperationResult> {
    const result: BulkOperationResult = {
      success: 0,
      failed: 0,
      errors: [],
      details: {
        created: 0,
        updated: 0,
        deleted: 0,
        activated: 0,
        deactivated: 0
      }
    };

    for (const { id, updates: categoryUpdates } of updates) {
      try {
        await prisma.category.update({
          where: { id },
          data: categoryUpdates
        });

        result.success++;
        result.details.updated++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          categoryId: id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return result;
  }

  /**
   * Bulk delete categories
   */
  async bulkDeleteCategories(categoryIds: string[]): Promise<BulkOperationResult> {
    const result: BulkOperationResult = {
      success: 0,
      failed: 0,
      errors: [],
      details: {
        created: 0,
        updated: 0,
        deleted: 0,
        activated: 0,
        deactivated: 0
      }
    };

    for (const id of categoryIds) {
      try {
        // Check if category has posts
        const postsCount = await prisma.post.count({
          where: { categoryId: id }
        });

        if (postsCount > 0) {
          result.failed++;
          result.errors.push({
            categoryId: id,
            error: `Cannot delete category with ${postsCount} posts`
          });
          continue;
        }

        // Check if category has subcategories
        const subcategoriesCount = await prisma.category.count({
          where: { parentId: id }
        });

        if (subcategoriesCount > 0) {
          result.failed++;
          result.errors.push({
            categoryId: id,
            error: `Cannot delete category with ${subcategoriesCount} subcategories`
          });
          continue;
        }

        await prisma.category.delete({
          where: { id }
        });

        result.success++;
        result.details.deleted++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          categoryId: id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return result;
  }

  /**
   * Bulk activate/deactivate categories
   */
  async bulkToggleCategories(categoryIds: string[], isActive: boolean): Promise<BulkOperationResult> {
    const result: BulkOperationResult = {
      success: 0,
      failed: 0,
      errors: [],
      details: {
        created: 0,
        updated: 0,
        deleted: 0,
        activated: 0,
        deactivated: 0
      }
    };

    for (const id of categoryIds) {
      try {
        await prisma.category.update({
          where: { id },
          data: { isActive }
        });

        result.success++;
        if (isActive) {
          result.details.activated++;
        } else {
          result.details.deactivated++;
        }
      } catch (error) {
        result.failed++;
        result.errors.push({
          categoryId: id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return result;
  }

  /**
   * Import categories from CSV
   */
  async importFromCSV(csvData: string, templateId?: string): Promise<BulkOperationResult> {
    const result: BulkOperationResult = {
      success: 0,
      failed: 0,
      errors: [],
      details: {
        created: 0,
        updated: 0,
        deleted: 0,
        activated: 0,
        deactivated: 0
      }
    };

    try {
      const lines = csvData.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      const dataLines = lines.slice(1);

      let template: CategoryTemplate | null = null;
      if (templateId) {
        template = await this.getTemplateById(templateId);
      }

      for (let i = 0; i < dataLines.length; i++) {
        const line = dataLines[i];
        const values = line.split(',').map(v => v.trim());
        const rowData: Record<string, string> = {};

        headers.forEach((header, index) => {
          rowData[header] = values[index] || '';
        });

        try {
          const categoryData = {
            name: rowData['name'] || rowData['title'] || '',
            description: rowData['description'] || template?.description || '',
            slug: this.generateSlug(rowData['name'] || rowData['title'] || ''),
            metaTitle: (template?.metaTitle || '{name}').replace('{name}', rowData['name'] || rowData['title'] || ''),
            metaDescription: (template?.metaDescription || '').replace('{name}', rowData['name'] || rowData['title'] || ''),
            isActive: rowData['isActive'] === 'true' || template?.isActive || true,
            parentId: rowData['parentId'] || template?.parentId || null,
            sortOrder: parseInt(rowData['sortOrder']) || template?.sortOrder || 0,
            color: rowData['color'] || template?.color || null
          };

          await prisma.category.create({
            data: categoryData
          });

          result.success++;
          result.details.created++;
        } catch (error) {
          result.failed++;
          result.errors.push({
            categoryId: `Row ${i + 2}`,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      return result;
    } catch (error) {
      console.error('Error importing categories from CSV:', error);
      throw new Error('Failed to import categories from CSV');
    }
  }

  /**
   * Export categories to CSV
   */
  async exportToCSV(categoryIds?: string[]): Promise<string> {
    try {
      const where = categoryIds ? { id: { in: categoryIds } } : {};
      
      const categories = await prisma.category.findMany({
        where,
        orderBy: {
          sortOrder: 'asc'
        }
      });

      const headers = [
        'id',
        'name',
        'description',
        'slug',
        'metaTitle',
        'metaDescription',
        'metaKeywords',
        'isActive',
        'parentId',
        'sortOrder',
        'icon',
        'color',
        'createdAt',
        'updatedAt'
      ];

      const csvLines = [headers.join(',')];

      for (const category of categories) {
        const values = headers.map(header => {
          const value = category[header as keyof typeof category];
          return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
        });
        csvLines.push(values.join(','));
      }

      return csvLines.join('\n');
    } catch (error) {
      console.error('Error exporting categories to CSV:', error);
      throw new Error('Failed to export categories to CSV');
    }
  }

  /**
   * Generate slug from name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  /**
   * Get category statistics
   */
  async getCategoryStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    withPosts: number;
    withSubcategories: number;
    templates: number;
  }> {
    try {
      const [
        total,
        active,
        inactive,
        withPosts,
        withSubcategories,
        templates
      ] = await Promise.all([
        prisma.category.count(),
        prisma.category.count({ where: { isActive: true } }),
        prisma.category.count({ where: { isActive: false } }),
        prisma.category.count({
          where: {
            posts: {
              some: {}
            }
          }
        }),
        prisma.category.count({
          where: {
            children: {
              some: {}
            }
          }
        }),
        prisma.categoryTemplate.count()
      ]);

      return {
        total,
        active,
        inactive,
        withPosts,
        withSubcategories,
        templates
      };
    } catch (error) {
      console.error('Error getting category stats:', error);
      throw new Error('Failed to get category statistics');
    }
  }
}

export const categoryTemplateService = new CategoryTemplateService();
