import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import categoryRulesEngineService from '../services/category-rules-engine-service';

const prisma = new PrismaClient();

export class CategoryRulesController {
  /**
   * Create a new category rule
   */
  async createRule(req: Request, res: Response): Promise<void> {
    try {
      const { name, categoryId, conditions, priority = 0, isActive = true } = req.body;
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      if (!name || !categoryId || !conditions) {
        res.status(400).json({ 
          success: false, 
          message: 'Name, categoryId, and conditions are required' 
        });
        return;
      }

      // Validate category exists
      const category = await prisma.category.findUnique({
        where: { id: categoryId }
      });

      if (!category) {
        res.status(404).json({ success: false, message: 'Category not found' });
        return;
      }

      const rule = await categoryRulesEngineService.createRule({
        name,
        categoryId,
        conditions,
        priority,
        isActive,
        createdBy: userId,
      });

      res.status(201).json({
        success: true,
        data: rule,
        message: 'Category rule created successfully'
      });
    } catch (error) {
      console.error('Error creating category rule:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create category rule'
      });
    }
  }

  /**
   * Get all rules for a category
   */
  async getCategoryRules(req: Request, res: Response): Promise<void> {
    try {
      const { categoryId } = req.params;

      if (!categoryId) {
        res.status(400).json({ success: false, message: 'Category ID is required' });
        return;
      }

      const rules = await categoryRulesEngineService.getCategoryRules(categoryId);

      res.status(200).json({
        success: true,
        data: rules,
        message: 'Category rules retrieved successfully'
      });
    } catch (error) {
      console.error('Error fetching category rules:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch category rules'
      });
    }
  }

  /**
   * Get all rules
   */
  async getAllRules(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, categoryId, isActive } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};
      if (categoryId) where.categoryId = categoryId as string;
      if (isActive !== undefined) where.isActive = isActive === 'true';

      const rules = await prisma.categoryRule.findMany({
        where,
        include: {
          category: true,
          creator: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            }
          },
          _count: {
            select: {
              executions: true,
            }
          }
        },
        orderBy: { priority: 'desc' },
        skip,
        take: Number(limit),
      });

      const total = await prisma.categoryRule.count({ where });

      res.status(200).json({
        success: true,
        data: rules,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
        message: 'Rules retrieved successfully'
      });
    } catch (error) {
      console.error('Error fetching rules:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch rules'
      });
    }
  }

  /**
   * Get rule by ID
   */
  async getRuleById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const rule = await prisma.categoryRule.findUnique({
        where: { id },
        include: {
          category: true,
          creator: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            }
          },
          executions: {
            orderBy: { executedAt: 'desc' },
            take: 10,
          }
        }
      });

      if (!rule) {
        res.status(404).json({ success: false, message: 'Rule not found' });
        return;
      }

      res.status(200).json({
        success: true,
        data: rule,
        message: 'Rule retrieved successfully'
      });
    } catch (error) {
      console.error('Error fetching rule:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch rule'
      });
    }
  }

  /**
   * Update rule
   */
  async updateRule(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, conditions, priority, isActive } = req.body;

      const rule = await prisma.categoryRule.findUnique({
        where: { id }
      });

      if (!rule) {
        res.status(404).json({ success: false, message: 'Rule not found' });
        return;
      }

      const updatedRule = await prisma.categoryRule.update({
        where: { id },
        data: {
          name,
          conditions: conditions as any,
          priority,
          isActive,
        },
        include: {
          category: true,
          creator: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            }
          }
        }
      });

      res.status(200).json({
        success: true,
        data: updatedRule,
        message: 'Rule updated successfully'
      });
    } catch (error) {
      console.error('Error updating rule:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update rule'
      });
    }
  }

  /**
   * Delete rule
   */
  async deleteRule(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const rule = await prisma.categoryRule.findUnique({
        where: { id }
      });

      if (!rule) {
        res.status(404).json({ success: false, message: 'Rule not found' });
        return;
      }

      await prisma.categoryRule.delete({
        where: { id }
      });

      res.status(200).json({
        success: true,
        message: 'Rule deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting rule:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete rule'
      });
    }
  }

  /**
   * Execute rules for a specific post
   */
  async executeRulesForPost(req: Request, res: Response): Promise<void> {
    try {
      const { postId } = req.params;

      if (!postId) {
        res.status(400).json({ success: false, message: 'Post ID is required' });
        return;
      }

      // Check if post exists
      const post = await prisma.post.findUnique({
        where: { id: postId }
      });

      if (!post) {
        res.status(404).json({ success: false, message: 'Post not found' });
        return;
      }

      const results = await categoryRulesEngineService.executeRulesForPost(postId);

      res.status(200).json({
        success: true,
        data: results,
        message: 'Rules executed successfully'
      });
    } catch (error) {
      console.error('Error executing rules:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to execute rules'
      });
    }
  }

  /**
   * Analyze post content
   */
  async analyzePostContent(req: Request, res: Response): Promise<void> {
    try {
      const { postId } = req.params;

      if (!postId) {
        res.status(400).json({ success: false, message: 'Post ID is required' });
        return;
      }

      const analysis = await categoryRulesEngineService.analyzePostContent(postId);

      res.status(200).json({
        success: true,
        data: analysis,
        message: 'Content analysis completed successfully'
      });
    } catch (error) {
      console.error('Error analyzing content:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to analyze content'
      });
    }
  }

  /**
   * Get rule statistics
   */
  async getRuleStatistics(req: Request, res: Response): Promise<void> {
    try {
      const { ruleId } = req.params;

      if (!ruleId) {
        res.status(400).json({ success: false, message: 'Rule ID is required' });
        return;
      }

      const statistics = await categoryRulesEngineService.getRuleStatistics(ruleId);

      res.status(200).json({
        success: true,
        data: statistics,
        message: 'Rule statistics retrieved successfully'
      });
    } catch (error) {
      console.error('Error fetching rule statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch rule statistics'
      });
    }
  }

  /**
   * Get execution logs
   */
  async getExecutionLogs(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, ruleId, postId } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};
      if (ruleId) where.ruleId = ruleId as string;
      if (postId) where.postId = postId as string;

      const logs = await prisma.categoryRuleExecution.findMany({
        where,
        include: {
          rule: {
            include: {
              category: true,
            }
          },
          post: {
            select: {
              id: true,
              title: true,
              slug: true,
            }
          }
        },
        orderBy: { executedAt: 'desc' },
        skip,
        take: Number(limit),
      });

      const total = await prisma.categoryRuleExecution.count({ where });

      res.status(200).json({
        success: true,
        data: logs,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
        message: 'Execution logs retrieved successfully'
      });
    } catch (error) {
      console.error('Error fetching execution logs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch execution logs'
      });
    }
  }

  /**
   * Cleanup old logs
   */
  async cleanupOldLogs(req: Request, res: Response): Promise<void> {
    try {
      const { days = 30 } = req.query;

      await categoryRulesEngineService.cleanupOldLogs(Number(days));

      res.status(200).json({
        success: true,
        message: `Cleaned up logs older than ${days} days`
      });
    } catch (error) {
      console.error('Error cleaning up logs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cleanup logs'
      });
    }
  }
}

export default new CategoryRulesController();
