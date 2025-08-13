import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import contentGapAnalysisService from '../services/content-gap-analysis-service';

const prisma = new PrismaClient();

export class ContentGapAnalysisController {
  /**
   * Analyze content gaps for a category
   */
  async analyzeCategoryGaps(req: Request, res: Response) {
    try {
      const { categoryId } = req.params;
      const userId = (req as any).user.id;

      if (!categoryId) {
        return res.status(400).json({
          success: false,
          message: 'Category ID is required'
        });
      }

      // Check if category exists
      const category = await prisma.category.findUnique({
        where: { id: categoryId }
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      const result = await contentGapAnalysisService.analyzeCategoryGaps(categoryId, userId);

      res.json({
        success: true,
        data: result,
        message: 'Content gap analysis completed successfully'
      });
    } catch (error) {
      console.error('Error in analyzeCategoryGaps:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to analyze content gaps'
      });
    }
  }

  /**
   * Get stored analysis results
   */
  async getAnalysisResults(req: Request, res: Response) {
    try {
      const { categoryId, limit = 50 } = req.query;
      const limitNum = parseInt(limit as string) || 50;

      const results = await contentGapAnalysisService.getStoredAnalysis(
        categoryId as string,
        limitNum
      );

      res.json({
        success: true,
        data: results,
        message: 'Analysis results retrieved successfully'
      });
    } catch (error) {
      console.error('Error in getAnalysisResults:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve analysis results'
      });
    }
  }

  /**
   * Create content recommendation
   */
  async createRecommendation(req: Request, res: Response) {
    try {
      const {
        gapAnalysisId,
        title,
        description,
        contentType,
        targetKeywords,
        estimatedWordCount,
        estimatedTime,
        priority,
        assignedTo
      } = req.body;

      // Validate required fields
      if (!gapAnalysisId || !title || !description || !contentType) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }

      // Check if gap analysis exists
      const gapAnalysis = await prisma.contentGapAnalysis.findUnique({
        where: { id: gapAnalysisId }
      });

      if (!gapAnalysis) {
        return res.status(404).json({
          success: false,
          message: 'Gap analysis not found'
        });
      }

      const recommendation = await contentGapAnalysisService.createRecommendation({
        gapAnalysisId,
        title,
        description,
        contentType,
        targetKeywords: targetKeywords || [],
        estimatedWordCount: estimatedWordCount || 1500,
        estimatedTime: estimatedTime || 120,
        priority: priority || 'medium',
        assignedTo
      });

      res.json({
        success: true,
        data: recommendation,
        message: 'Content recommendation created successfully'
      });
    } catch (error) {
      console.error('Error in createRecommendation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create content recommendation'
      });
    }
  }

  /**
   * Get content recommendations
   */
  async getRecommendations(req: Request, res: Response) {
    try {
      const { status, priority } = req.query;

      const recommendations = await contentGapAnalysisService.getRecommendations(
        status as string,
        priority as string
      );

      res.json({
        success: true,
        data: recommendations,
        message: 'Recommendations retrieved successfully'
      });
    } catch (error) {
      console.error('Error in getRecommendations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve recommendations'
      });
    }
  }

  /**
   * Update recommendation status
   */
  async updateRecommendationStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, assignedTo, completedAt } = req.body;

      const recommendation = await prisma.contentGapRecommendation.findUnique({
        where: { id }
      });

      if (!recommendation) {
        return res.status(404).json({
          success: false,
          message: 'Recommendation not found'
        });
      }

      const updatedRecommendation = await prisma.contentGapRecommendation.update({
        where: { id },
        data: {
          status: status || recommendation.status,
          assignedTo: assignedTo || recommendation.assignedTo,
          completedAt: completedAt ? new Date(completedAt) : recommendation.completedAt
        },
        include: {
          gapAnalysis: {
            include: {
              category: true
            }
          },
          assignee: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });

      res.json({
        success: true,
        data: updatedRecommendation,
        message: 'Recommendation status updated successfully'
      });
    } catch (error) {
      console.error('Error in updateRecommendationStatus:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update recommendation status'
      });
    }
  }

  /**
   * Delete analysis result
   */
  async deleteAnalysisResult(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const analysis = await prisma.contentGapAnalysis.findUnique({
        where: { id }
      });

      if (!analysis) {
        return res.status(404).json({
          success: false,
          message: 'Analysis result not found'
        });
      }

      await prisma.contentGapAnalysis.delete({
        where: { id }
      });

      res.json({
        success: true,
        message: 'Analysis result deleted successfully'
      });
    } catch (error) {
      console.error('Error in deleteAnalysisResult:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete analysis result'
      });
    }
  }

  /**
   * Get analysis statistics
   */
  async getAnalysisStatistics(req: Request, res: Response) {
    try {
      const { categoryId } = req.query;

      const where = categoryId ? { categoryId: categoryId as string } : {};

      const [
        totalAnalyses,
        totalRecommendations,
        pendingRecommendations,
        completedRecommendations,
        highPriorityGaps,
        totalEstimatedTraffic,
        totalEstimatedRevenue
      ] = await Promise.all([
        prisma.contentGapAnalysis.count({ where }),
        prisma.contentGapRecommendation.count(),
        prisma.contentGapRecommendation.count({ where: { status: 'pending' } }),
        prisma.contentGapRecommendation.count({ where: { status: 'completed' } }),
        prisma.contentGapAnalysis.count({ where: { ...where, priority: 'high' } }),
        prisma.contentGapAnalysis.aggregate({
          where,
          _sum: { estimatedTraffic: true }
        }),
        prisma.contentGapAnalysis.aggregate({
          where,
          _sum: { estimatedRevenue: true }
        })
      ]);

      const statistics = {
        totalAnalyses,
        totalRecommendations,
        pendingRecommendations,
        completedRecommendations,
        highPriorityGaps,
        totalEstimatedTraffic: totalEstimatedTraffic._sum.estimatedTraffic || 0,
        totalEstimatedRevenue: totalEstimatedRevenue._sum.estimatedRevenue || 0,
        completionRate: totalRecommendations > 0 
          ? Math.round((completedRecommendations / totalRecommendations) * 100)
          : 0
      };

      res.json({
        success: true,
        data: statistics,
        message: 'Statistics retrieved successfully'
      });
    } catch (error) {
      console.error('Error in getAnalysisStatistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve statistics'
      });
    }
  }

  /**
   * Export analysis results to CSV
   */
  async exportAnalysisResults(req: Request, res: Response) {
    try {
      const { categoryId } = req.query;

      const results = await contentGapAnalysisService.getStoredAnalysis(
        categoryId as string,
        1000 // Get more results for export
      );

      // Convert to CSV format
      const csvHeaders = [
        'Keyword',
        'Search Volume',
        'Difficulty',
        'Competition',
        'Existing Content',
        'Opportunity',
        'Recommended Type',
        'Priority',
        'Estimated Traffic',
        'Estimated Revenue',
        'Category',
        'Analysis Date'
      ];

      const csvRows = results.map(result => [
        result.keyword,
        result.searchVolume,
        result.difficulty,
        result.competition,
        result.existingContent,
        result.opportunity,
        result.recommendedType,
        result.priority,
        result.estimatedTraffic,
        result.estimatedRevenue,
        result.category?.name || 'N/A',
        new Date(result.analysisDate).toISOString()
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="content-gap-analysis.csv"');
      res.send(csvContent);
    } catch (error) {
      console.error('Error in exportAnalysisResults:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export analysis results'
      });
    }
  }

  /**
   * Bulk delete analysis results
   */
  async bulkDeleteAnalysisResults(req: Request, res: Response) {
    try {
      const { ids } = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'IDs array is required'
        });
      }

      await prisma.contentGapAnalysis.deleteMany({
        where: {
          id: {
            in: ids
          }
        }
      });

      res.json({
        success: true,
        message: `${ids.length} analysis results deleted successfully`
      });
    } catch (error) {
      console.error('Error in bulkDeleteAnalysisResults:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete analysis results'
      });
    }
  }
}

export default new ContentGapAnalysisController();
