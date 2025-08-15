import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { aiCategorizationService } from '../services/ai-categorization-service';

const prisma = new PrismaClient();

class AICategorizationController {
  /**
   * Get category suggestions for a specific post
   */
  async getCategorySuggestions(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      
      // Get post data
      const post = await prisma.post.findUnique({
        where: { id: postId }
      });

      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }

      // Get AI suggestions
      const suggestions = await aiCategorizationService.suggestCategoriesForPost(post);

      res.json({
        success: true,
        data: {
          postId,
          postTitle: post.title,
          suggestions
        },
        message: 'Category suggestions retrieved successfully'
      });
    } catch (error) {
      console.error('Error getting category suggestions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get category suggestions'
      });
    }
  }

  /**
   * Auto-categorize all uncategorized posts
   */
  async autoCategorizePosts(_req: Request, res: Response) {
    try {
      const result = await aiCategorizationService.autoCategorizePosts();

      res.json({
        success: true,
        data: result,
        message: `Auto-categorization completed. ${result.categorized} posts categorized, ${result.suggestions.length} suggestions for review.`
      });
    } catch (error) {
      console.error('Error in auto-categorization:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to auto-categorize posts'
      });
    }
  }

  /**
   * Get all category suggestions for manual review
   */
  async getCategorySuggestionsForReview(_req: Request, res: Response) {
    try {
      const suggestions = await aiCategorizationService.getCategorySuggestions();

      res.json({
        success: true,
        data: suggestions,
        message: 'Category suggestions for review retrieved successfully'
      });
    } catch (error) {
      console.error('Error getting category suggestions for review:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get category suggestions for review'
      });
    }
  }

  /**
   * Apply category suggestion to a post
   */
  async applyCategorySuggestion(req: Request, res: Response) {
    try {
      const { postId, categoryId } = req.body;

      if (!postId || !categoryId) {
        return res.status(400).json({
          success: false,
          message: 'Post ID and Category ID are required'
        });
      }

      // Update post with suggested category
      await prisma.post.update({
        where: { id: postId },
        data: { categoryId }
      });

      res.json({
        success: true,
        message: 'Category suggestion applied successfully'
      });
    } catch (error) {
      console.error('Error applying category suggestion:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to apply category suggestion'
      });
    }
  }

  /**
   * Analyze content and get insights
   */
  async analyzeContent(req: Request, res: Response) {
    try {
      const { title, content } = req.body;

      if (!title && !content) {
        return res.status(400).json({
          success: false,
          message: 'Title or content is required'
        });
      }

      // Create a mock post object for analysis
      const mockPost = { title: title || '', content: content || '' };
      
      // Get suggestions
      const suggestions = await aiCategorizationService.suggestCategoriesForPost(mockPost);

      // Get content analysis
      const analysis = await aiCategorizationService['analyzePostContent'](mockPost);

      res.json({
        success: true,
        data: {
          suggestions,
          analysis: {
            type: analysis.type,
            readingTime: analysis.readingTime,
            wordCount: content ? content.split(/\s+/).length : 0,
            structure: analysis.structure,
            keywords: {
              title: analysis.titleKeywords,
              content: analysis.contentKeywords
            }
          }
        },
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
   * Get AI categorization statistics
   */
  async getCategorizationStats(_req: Request, res: Response) {
    try {
      // Get total posts
      const totalPosts = await prisma.post.count();
      
      // Get categorized posts
      const categorizedPosts = await prisma.post.count({
        where: {
          categoryId: {
            not: null
          }
        }
      });

      // Get uncategorized posts
      const uncategorizedPosts = await prisma.post.count({
        where: {
          categoryId: null
        }
      });

      // Get posts by category
      const postsByCategory = await prisma.post.groupBy({
        by: ['categoryId'],
        _count: {
          categoryId: true
        }
      });

      const stats = {
        totalPosts,
        categorizedPosts,
        uncategorizedPosts,
        categorizationRate: totalPosts > 0 ? (categorizedPosts / totalPosts) * 100 : 0,
        postsByCategory: postsByCategory.map(item => ({
          categoryId: item.categoryId,
          count: item._count.categoryId
        }))
      };

      res.json({
        success: true,
        data: stats,
        message: 'Categorization statistics retrieved successfully'
      });
    } catch (error) {
      console.error('Error getting categorization stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get categorization statistics'
      });
    }
  }
}

export const aiCategorizationController = new AICategorizationController();
