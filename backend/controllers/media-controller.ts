import { Request, Response } from 'express';
import { MediaService } from '../services/media-service';
import { logger } from '../utils/logger';
import { JWTPayload } from '@shared/types';

export class MediaController {

  // Get all media files
  static async getAllMedia(req: Request, res: Response) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        search, 
        type, 
        folderId,
        uploaderId, 
        sortBy = 'createdAt', 
        sortOrder = 'desc' 
      } = req.query;

      // Validate and sanitize sortBy to prevent invalid field errors
      const validSortFields = ['createdAt', 'updatedAt', 'filename', 'originalName', 'size', 'mimeType'];
      const sanitizedSortBy = validSortFields.includes(sortBy as string) ? sortBy as string : 'createdAt';

      const media = await MediaService.getAllMedia({
        page: Number(page),
        limit: Number(limit),
        search: search as string,
        type: type as string,
        folderId: folderId as string,
        uploaderId: uploaderId as string,
        sortBy: sanitizedSortBy,
        sortOrder: sortOrder as 'asc' | 'desc'
      });
      
      res.status(200).json({
        success: true,
        data: media.data,
        pagination: media.pagination,
        message: 'Media files retrieved successfully',
      });
    } catch (error) {
      logger.error('Error in getAllMedia:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve media files',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get media by ID
  static async getMediaById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const media = await MediaService.getMediaById(id);
      
      if (!media) {
        return res.status(404).json({
          success: false,
          error: 'Media not found',
          message: 'Media file with the specified ID was not found',
        });
      }
      
      return res.status(200).json({
        success: true,
        data: media,
        message: 'Media file retrieved successfully',
      });
    } catch (error) {
      logger.error('Error in getMediaById:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve media file',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Upload media file
  static async uploadMedia(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded',
          message: 'Please select a file to upload',
        });
      }

      const uploadedBy = (req as Request & { user?: JWTPayload }).user?.userId;
      if (!uploadedBy) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
          message: 'Authentication required'
        });
      }

      const { alt, caption, description, folderId } = req.body;
      
      const media = await MediaService.uploadMedia(req.file, uploadedBy, {
        alt,
        caption,
        description,
        folderId
      });
      
      return res.status(201).json({
        success: true,
        data: media,
        message: 'Media file uploaded successfully',
      });
    } catch (error) {
      logger.error('Error in uploadMedia:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to upload media file',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Update media file
  static async updateMedia(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { alt, caption, description, folderId } = req.body;

      const media = await MediaService.updateMedia(id, {
        alt,
        caption,
        description,
        folderId
      });

      return res.status(200).json({
        success: true,
        data: media,
        message: 'Media file updated successfully',
      });
    } catch (error) {
      logger.error('Error in updateMedia:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update media file',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Delete media file
  static async deleteMedia(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await MediaService.deleteMedia(id);

      return res.status(200).json({
        success: true,
        message: 'Media file deleted successfully',
      });
    } catch (error) {
      logger.error('Error in deleteMedia:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete media file',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get media analytics
  static async getMediaAnalytics(req: Request, res: Response) {
    try {
      const userId = (req as unknown as { user?: { id: string } }).user?.id;
      const analytics = await MediaService.getMediaAnalytics(userId);
      
      res.status(200).json({
        success: true,
        data: analytics,
        message: 'Media analytics retrieved successfully',
      });
    } catch (error) {
      logger.error('Error in getMediaAnalytics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve media analytics',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get media statistics
  static async getMediaStats(_req: Request, res: Response) {
    try {
      const stats = await MediaService.getMediaStats();
      
      res.status(200).json({
        success: true,
        data: stats,
        message: 'Media statistics retrieved successfully',
      });
    } catch (error) {
      logger.error('Error in getMediaStats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve media statistics',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Search media
  static async searchMedia(req: Request, res: Response) {
    try {
      const { query } = req.params;
      const { type, folderId, uploaderId, limit = 20 } = req.query;
      
      if (!query) {
        return res.status(400).json({
          success: false,
          error: 'Search query required',
          message: 'Please provide a search query',
        });
      }

      const media = await MediaService.searchMedia(query, {
        type: type as string,
        folderId: folderId as string,
        uploaderId: uploaderId as string,
        limit: Number(limit)
      });
      
      res.status(200).json({
        success: true,
        data: media,
        message: 'Media search completed successfully',
      });
    } catch (error) {
      logger.error('Error in searchMedia:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search media',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Bulk upload media files
  static async bulkUploadMedia(req: Request, res: Response) {
    try {
      if (!req.files || !Array.isArray(req.files)) {
        return res.status(400).json({
          success: false,
          error: 'No files uploaded',
          message: 'Please select files to upload',
        });
      }

      const uploadedBy = (req as unknown as { user?: { id: string } }).user?.id;
      if (!uploadedBy) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
          message: 'Authentication required'
        });
      }

      const { alt, caption, description, folderId } = req.body;
      
      const uploadPromises = req.files.map(file => 
        MediaService.uploadMedia(file, uploadedBy, {
          alt,
          caption,
          description,
          folderId
        })
      );

      const results = await Promise.allSettled(uploadPromises);
      
      const successful = results.filter(r => r.status === 'fulfilled').map(r => (r as PromiseFulfilledResult<unknown>).value);
      const failed = results.filter(r => r.status === 'rejected').map(r => (r as PromiseRejectedResult).reason);
      
      return res.status(200).json({
        success: true,
        data: {
          successful,
          failed: failed.length > 0 ? failed : undefined
        },
        message: `Successfully uploaded ${successful.length} files${failed.length > 0 ? `, ${failed.length} failed` : ''}`,
      });
    } catch (error) {
      logger.error('Error in bulkUploadMedia:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to upload media files',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get media by folder
  static async getMediaByFolder(req: Request, res: Response) {
    try {
      const { folderId } = req.params;
      const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

      if (!folderId) {
        return res.status(400).json({
          success: false,
          error: 'Folder ID required',
          message: 'Please provide a folder ID',
        });
      }

      const media = await MediaService.getAllMedia({
        page: Number(page),
        limit: Number(limit),
        folderId,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      });
      
      res.status(200).json({
        success: true,
        data: media,
        message: 'Media files in folder retrieved successfully',
      });
    } catch (error) {
      logger.error('Error in getMediaByFolder:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve media files in folder',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get media by tags
  static async getMediaByTags(req: Request, res: Response) {
    try {
      const { tags } = req.params;
      const { limit = 20 } = req.query;

      if (!tags) {
        return res.status(400).json({
          success: false,
          error: 'Tags parameter required',
          message: 'Please provide tags to filter by',
        });
      }

      // This would need to be implemented with proper tag filtering
      // For now, we'll use search functionality
      const media = await MediaService.searchMedia(tags, {
        limit: Number(limit)
      });
      
      res.status(200).json({
        success: true,
        data: media,
        message: 'Media files by tags retrieved successfully',
      });
    } catch (error) {
      logger.error('Error in getMediaByTags:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve media files by tags',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get popular tags
  static async getPopularTags(_req: Request, res: Response) {
    try {
      const analytics = await MediaService.getMediaAnalytics();
      
      res.status(200).json({
        success: true,
        data: analytics.popularTags,
        message: 'Popular tags retrieved successfully',
      });
    } catch (error) {
      logger.error('Error in getPopularTags:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve popular tags',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get upload trends
  static async getUploadTrends(_req: Request, res: Response) {
    try {
      const analytics = await MediaService.getMediaAnalytics();
      
      res.status(200).json({
        success: true,
        data: analytics.uploadTrends,
        message: 'Upload trends retrieved successfully',
      });
    } catch (error) {
      logger.error('Error in getUploadTrends:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve upload trends',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get top uploaders
  static async getTopUploaders(_req: Request, res: Response) {
    try {
      const analytics = await MediaService.getMediaAnalytics();
      
      res.status(200).json({
        success: true,
        data: analytics.topUploaders,
        message: 'Top uploaders retrieved successfully',
      });
    } catch (error) {
      logger.error('Error in getTopUploaders:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve top uploaders',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get all folders
  static async getAllFolders(_req: Request, res: Response) {
    try {
      const folders = await MediaService.getAllFolders();
      
      res.status(200).json({
        success: true,
        data: folders,
        message: 'Media folders retrieved successfully',
      });
    } catch (error) {
      logger.error('Error in getAllFolders:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve media folders',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Create folder
  static async createFolder(req: Request, res: Response) {
    try {
      const { name, description, parentId, isPublic } = req.body;
      const createdBy = (req as Request & { user?: JWTPayload }).user?.userId;
      
      if (!createdBy) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
          message: 'Authentication required'
        });
      }

      if (!name) {
        return res.status(400).json({
          success: false,
          error: 'Folder name required',
          message: 'Please provide a folder name',
        });
      }

      const folder = await MediaService.createFolder({
        name,
        description,
        parentId,
        isPublic: isPublic || false,
        createdBy
      });
      
      res.status(201).json({
        success: true,
        data: folder,
        message: 'Media folder created successfully',
      });
    } catch (error) {
      logger.error('Error in createFolder:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create media folder',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get folder by ID
  static async getFolderById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const folder = await MediaService.getFolderById(id);
      
      if (!folder) {
        return res.status(404).json({
          success: false,
          error: 'Folder not found',
          message: 'Media folder with the specified ID was not found',
        });
      }
      
      res.status(200).json({
        success: true,
        data: folder,
        message: 'Media folder retrieved successfully',
      });
    } catch (error) {
      logger.error('Error in getFolderById:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve media folder',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Update folder
  static async updateFolder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, description, parentId, isPublic } = req.body;

      const folder = await MediaService.updateFolder(id, {
        name,
        description,
        parentId,
        isPublic
      });

      res.status(200).json({
        success: true,
        data: folder,
        message: 'Media folder updated successfully',
      });
    } catch (error) {
      logger.error('Error in updateFolder:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update media folder',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Delete folder
  static async deleteFolder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await MediaService.deleteFolder(id);

      res.status(200).json({
        success: true,
        message: 'Media folder deleted successfully',
      });
    } catch (error) {
      logger.error('Error in deleteFolder:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete media folder',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
