import { Request, Response } from 'express';
import { EditorService, EditorSearchParams } from '../services/editor-service';
import { logger } from '../utils/logger';

const prisma = new (require('@prisma/client').PrismaClient)();
const editorService = new EditorService(prisma);

export class EditorController {
  /**
   * Get editor configuration
   */
  static async getConfig(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
          message: 'Authentication required'
        });
      }

      const config = await editorService.getConfig(userId);
      
      res.status(200).json({
        success: true,
        data: config,
        message: 'Editor configuration retrieved successfully'
      });
    } catch (error) {
      logger.error('Error in getConfig:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get editor configuration',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Create new content
   */
  static async createContent(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
          message: 'Authentication required'
        });
      }

      const { title, type = 'post' } = req.body;
      
      if (!title) {
        return res.status(400).json({
          success: false,
          error: 'Title is required',
          message: 'Please provide a title for the content'
        });
      }

      const content = await editorService.createContent(userId, title, type);
      
      res.status(201).json({
        success: true,
        data: content,
        message: 'Content created successfully'
      });
    } catch (error) {
      logger.error('Error in createContent:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create content',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get content by ID
   */
  static async getContent(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
          message: 'Authentication required'
        });
      }

      const { contentId } = req.params;
      const content = await editorService.getContent(contentId, userId);
      
      if (!content) {
        return res.status(404).json({
          success: false,
          error: 'Content not found',
          message: 'Content with the specified ID was not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: content,
        message: 'Content retrieved successfully'
      });
    } catch (error) {
      logger.error('Error in getContent:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve content',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update content
   */
  static async updateContent(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
          message: 'Authentication required'
        });
      }

      const { contentId } = req.params;
      const { content } = req.body;
      
      if (!content) {
        return res.status(400).json({
          success: false,
          error: 'Content is required',
          message: 'Please provide content to update'
        });
      }

      const updatedContent = await editorService.updateContent(contentId, content, userId);
      
      res.status(200).json({
        success: true,
        data: updatedContent,
        message: 'Content updated successfully'
      });
    } catch (error) {
      logger.error('Error in updateContent:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update content',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Auto-save content
   */
  static async autoSave(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
          message: 'Authentication required'
        });
      }

      const { contentId } = req.params;
      const { content } = req.body;
      
      if (!content) {
        return res.status(400).json({
          success: false,
          error: 'Content is required',
          message: 'Please provide content to save'
        });
      }

      await editorService.autoSave(contentId, content, userId);
      
      res.status(200).json({
        success: true,
        message: 'Content auto-saved successfully'
      });
    } catch (error) {
      logger.error('Error in autoSave:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to auto-save content',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Publish content
   */
  static async publishContent(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
          message: 'Authentication required'
        });
      }

      const { contentId } = req.params;
      await editorService.publishContent(contentId, userId);
      
      res.status(200).json({
        success: true,
        message: 'Content published successfully'
      });
    } catch (error) {
      logger.error('Error in publishContent:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to publish content',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Unpublish content
   */
  static async unpublishContent(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
          message: 'Authentication required'
        });
      }

      const { contentId } = req.params;
      await editorService.unpublishContent(contentId, userId);
      
      res.status(200).json({
        success: true,
        message: 'Content unpublished successfully'
      });
    } catch (error) {
      logger.error('Error in unpublishContent:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to unpublish content',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Delete content
   */
  static async deleteContent(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
          message: 'Authentication required'
        });
      }

      const { contentId } = req.params;
      await editorService.deleteContent(contentId, userId);
      
      res.status(200).json({
        success: true,
        message: 'Content deleted successfully'
      });
    } catch (error) {
      logger.error('Error in deleteContent:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete content',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Search content
   */
  static async searchContent(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
          message: 'Authentication required'
        });
      }

      const searchParams: EditorSearchParams = {
        query: req.query['query'] as string || '',
        filters: {
          type: req.query['type'] as string,
          author: req.query['author'] as string,
          dateRange: req.query['dateRange'] ? JSON.parse(req.query['dateRange'] as string) : undefined,
          tags: req.query['tags'] ? (req.query['tags'] as string).split(',') : undefined,
          status: req.query['status'] as string
        },
        sort: {
          field: req.query['sortField'] as string || 'createdAt',
          direction: (req.query['sortDirection'] as 'asc' | 'desc') || 'desc'
        },
        pagination: {
          page: parseInt(req.query['page'] as string) || 1,
          limit: parseInt(req.query['limit'] as string) || 10
        }
      };

      const results = await editorService.searchContent(searchParams, userId);
      
      res.status(200).json({
        success: true,
        data: results,
        message: 'Content search completed successfully'
      });
    } catch (error) {
      logger.error('Error in searchContent:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search content',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get content history
   */
  static async getContentHistory(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
          message: 'Authentication required'
        });
      }

      const { contentId } = req.params;
      const history = await editorService.getContentHistory(contentId, userId);
      
      res.status(200).json({
        success: true,
        data: history,
        message: 'Content history retrieved successfully'
      });
    } catch (error) {
      logger.error('Error in getContentHistory:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve content history',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Restore content version
   */
  static async restoreVersion(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
          message: 'Authentication required'
        });
      }

      const { contentId, version } = req.params;
      const content = await editorService.restoreVersion(contentId, parseInt(version), userId);
      
      res.status(200).json({
        success: true,
        data: content,
        message: 'Content version restored successfully'
      });
    } catch (error) {
      logger.error('Error in restoreVersion:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to restore content version',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get collaborators for content
   */
  static async getCollaborators(req: Request, res: Response) {
    try {
      const { contentId } = req.params;
      const collaborators = await editorService.getCollaborators(contentId);
      
      res.status(200).json({
        success: true,
        data: collaborators,
        message: 'Collaborators retrieved successfully'
      });
    } catch (error) {
      logger.error('Error in getCollaborators:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve collaborators',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Add collaborator to content
   */
  static async addCollaborator(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
          message: 'Authentication required'
        });
      }

      const { contentId } = req.params;
      const { userId: collaboratorId, permissions } = req.body;
      
      if (!collaboratorId || !permissions) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          message: 'Please provide collaborator ID and permissions'
        });
      }

      await editorService.addCollaborator(contentId, collaboratorId, permissions);
      
      res.status(200).json({
        success: true,
        message: 'Collaborator added successfully'
      });
    } catch (error) {
      logger.error('Error in addCollaborator:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add collaborator',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Remove collaborator from content
   */
  static async removeCollaborator(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
          message: 'Authentication required'
        });
      }

      const { contentId, collaboratorId } = req.params;
      await editorService.removeCollaborator(contentId, collaboratorId);
      
      res.status(200).json({
        success: true,
        message: 'Collaborator removed successfully'
      });
    } catch (error) {
      logger.error('Error in removeCollaborator:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to remove collaborator',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get comments for content
   */
  static async getComments(req: Request, res: Response) {
    try {
      const { contentId } = req.params;
      const comments = await editorService.getComments(contentId);
      
      res.status(200).json({
        success: true,
        data: comments,
        message: 'Comments retrieved successfully'
      });
    } catch (error) {
      logger.error('Error in getComments:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve comments',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Add comment to content
   */
  static async addComment(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
          message: 'Authentication required'
        });
      }

      const { contentId } = req.params;
      const { text, selection } = req.body;
      
      if (!text) {
        return res.status(400).json({
          success: false,
          error: 'Comment text is required',
          message: 'Please provide comment text'
        });
      }

      const comment = await editorService.addComment(contentId, {
        contentId,
        authorId: userId,
        authorName: (req as any).user?.firstName + ' ' + (req as any).user?.lastName,
        authorAvatar: (req as any).user?.avatar || '',
        text,
        selection,
        status: 'active',
        replies: []
      });
      
      res.status(201).json({
        success: true,
        data: comment,
        message: 'Comment added successfully'
      });
    } catch (error) {
      logger.error('Error in addComment:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add comment',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update comment
   */
  static async updateComment(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
          message: 'Authentication required'
        });
      }

      const { commentId } = req.params;
      const { text } = req.body;
      
      if (!text) {
        return res.status(400).json({
          success: false,
          error: 'Comment text is required',
          message: 'Please provide comment text'
        });
      }

      const comment = await editorService.updateComment(commentId, text, userId);
      
      res.status(200).json({
        success: true,
        data: comment,
        message: 'Comment updated successfully'
      });
    } catch (error) {
      logger.error('Error in updateComment:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update comment',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Delete comment
   */
  static async deleteComment(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
          message: 'Authentication required'
        });
      }

      const { commentId } = req.params;
      await editorService.deleteComment(commentId, userId);
      
      res.status(200).json({
        success: true,
        message: 'Comment deleted successfully'
      });
    } catch (error) {
      logger.error('Error in deleteComment:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete comment',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Resolve comment
   */
  static async resolveComment(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
          message: 'Authentication required'
        });
      }

      const { commentId } = req.params;
      await editorService.resolveComment(commentId, userId);
      
      res.status(200).json({
        success: true,
        message: 'Comment resolved successfully'
      });
    } catch (error) {
      logger.error('Error in resolveComment:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to resolve comment',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Export content
   */
  static async exportContent(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
          message: 'Authentication required'
        });
      }

      const { contentId } = req.params;
      const { format = 'html' } = req.query;
      
      if (!['html', 'markdown', 'pdf', 'docx'].includes(format as string)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid format',
          message: 'Supported formats: html, markdown, pdf, docx'
        });
      }

      const exportedContent = await editorService.exportContent(contentId, format as any, userId);
      
      res.status(200).json({
        success: true,
        data: { content: exportedContent, format },
        message: 'Content exported successfully'
      });
    } catch (error) {
      logger.error('Error in exportContent:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to export content',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Import content
   */
  static async importContent(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
          message: 'Authentication required'
        });
      }

      const { content, format = 'markdown' } = req.body;
      
      if (!content) {
        return res.status(400).json({
          success: false,
          error: 'Content is required',
          message: 'Please provide content to import'
        });
      }

      if (!['html', 'markdown'].includes(format)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid format',
          message: 'Supported formats: html, markdown'
        });
      }

      const importedContent = await editorService.importContent(content, format, userId);
      
      res.status(200).json({
        success: true,
        data: importedContent,
        message: 'Content imported successfully'
      });
    } catch (error) {
      logger.error('Error in importContent:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to import content',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Duplicate content
   */
  static async duplicateContent(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
          message: 'Authentication required'
        });
      }

      const { contentId } = req.params;
      const duplicatedContent = await editorService.duplicateContent(contentId, userId);
      
      res.status(200).json({
        success: true,
        data: duplicatedContent,
        message: 'Content duplicated successfully'
      });
    } catch (error) {
      logger.error('Error in duplicateContent:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to duplicate content',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get content analytics
   */
  static async getContentAnalytics(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
          message: 'Authentication required'
        });
      }

      const { contentId } = req.params;
      const analytics = await editorService.getContentAnalytics(contentId, userId);
      
      res.status(200).json({
        success: true,
        data: analytics,
        message: 'Content analytics retrieved successfully'
      });
    } catch (error) {
      logger.error('Error in getContentAnalytics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve content analytics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get SEO suggestions
   */
  static async getSEOSuggestions(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
          message: 'Authentication required'
        });
      }

      const { contentId } = req.params;
      const suggestions = await editorService.getSEOSuggestions(contentId, userId);
      
      res.status(200).json({
        success: true,
        data: suggestions,
        message: 'SEO suggestions retrieved successfully'
      });
    } catch (error) {
      logger.error('Error in getSEOSuggestions:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve SEO suggestions',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get social preview
   */
  static async getSocialPreview(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
          message: 'Authentication required'
        });
      }

      const { contentId } = req.params;
      const preview = await editorService.getSocialPreview(contentId, userId);
      
      res.status(200).json({
        success: true,
        data: preview,
        message: 'Social preview retrieved successfully'
      });
    } catch (error) {
      logger.error('Error in getSocialPreview:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve social preview',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
