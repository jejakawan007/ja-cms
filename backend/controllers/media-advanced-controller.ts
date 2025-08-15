import { Request, Response } from 'express';
import { MediaAdvancedService } from '../services/media-advanced-service';
import { logger } from '../utils/logger';
import { JWTPayload } from '@shared/types';

export class MediaAdvancedController {

  // ============================================================================
  // BATCH PROCESSING METHODS
  // ============================================================================

  // Upload multiple files for batch processing
  static async uploadBatchFiles(req: Request, res: Response): Promise<void> {
    try {
      if (!req.files || req.files.length === 0) {
        res.status(400).json({
          success: false,
          error: 'No files uploaded',
          message: 'Please select files to upload for batch processing',
        });
        return;
      }

      const settings = req.body.settings ? JSON.parse(req.body.settings) : {};
      const user = req.user as JWTPayload;

      const batchJob = await MediaAdvancedService.createBatchJob({
        files: req.files as Express.Multer.File[],
        settings,
        userId: user.userId,
      });

      res.status(201).json({
        success: true,
        data: batchJob,
        message: 'Files uploaded for batch processing successfully',
      });
    } catch (error) {
      logger.error('Error in uploadBatchFiles:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to upload files for batch processing',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get all batch processing jobs
  static async getBatchJobs(req: Request, res: Response): Promise<void> {
    try {
      const { status, page = 1, limit = 20 } = req.query;
      const user = req.user as JWTPayload;

      const jobs = await MediaAdvancedService.getBatchJobs({
        userId: user.userId,
        status: status as string,
        page: Number(page),
        limit: Number(limit),
      });

      res.status(200).json({
        success: true,
        data: jobs.data,
        pagination: jobs.pagination,
        message: 'Batch jobs retrieved successfully',
      });
    } catch (error) {
      logger.error('Error in getBatchJobs:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve batch jobs',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get batch job by ID
  static async getBatchJobById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = req.user as JWTPayload;

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Batch job ID is required',
          message: 'Please provide a valid batch job ID',
        });
        return;
      }

      const job = await MediaAdvancedService.getBatchJobById(id, user.userId);

      if (!job) {
        res.status(404).json({
          success: false,
          error: 'Batch job not found',
          message: 'Batch job with the specified ID was not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: job,
        message: 'Batch job retrieved successfully',
      });
    } catch (error) {
      logger.error('Error in getBatchJobById:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve batch job',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Start batch processing job
  static async startBatchJob(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = req.user as JWTPayload;

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Batch job ID is required',
          message: 'Please provide a valid batch job ID',
        });
        return;
      }

      const job = await MediaAdvancedService.startBatchJob(id, user.userId);

      if (!job) {
        res.status(404).json({
          success: false,
          error: 'Batch job not found',
          message: 'Batch job with the specified ID was not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: job,
        message: 'Batch processing started successfully',
      });
    } catch (error) {
      logger.error('Error in startBatchJob:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to start batch processing',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Cancel batch processing job
  static async cancelBatchJob(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = req.user as JWTPayload;

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Batch job ID is required',
          message: 'Please provide a valid batch job ID',
        });
        return;
      }

      const job = await MediaAdvancedService.cancelBatchJob(id, user.userId);

      if (!job) {
        res.status(404).json({
          success: false,
          error: 'Batch job not found',
          message: 'Batch job with the specified ID was not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: job,
        message: 'Batch processing cancelled successfully',
      });
    } catch (error) {
      logger.error('Error in cancelBatchJob:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to cancel batch processing',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // ============================================================================
  // MEDIA OPTIMIZATION METHODS
  // ============================================================================

  // Optimize single media file
  static async optimizeMedia(req: Request, res: Response): Promise<void> {
    try {
      const { mediaId, settings } = req.body;
      const user = req.user as JWTPayload;

      if (!mediaId) {
        res.status(400).json({
          success: false,
          error: 'Media ID is required',
          message: 'Please provide a valid media ID',
        });
        return;
      }

      const result = await MediaAdvancedService.optimizeMedia(mediaId, settings, user.userId);

      res.status(200).json({
        success: true,
        data: result,
        message: 'Media optimized successfully',
      });
    } catch (error) {
      logger.error('Error in optimizeMedia:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to optimize media',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Optimize multiple media files
  static async optimizeBulk(req: Request, res: Response): Promise<void> {
    try {
      const { mediaIds, settings } = req.body;
      const user = req.user as JWTPayload;

      if (!mediaIds || !Array.isArray(mediaIds) || mediaIds.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Media IDs are required',
          message: 'Please provide valid media IDs',
        });
        return;
      }

      const job = await MediaAdvancedService.optimizeBulk(mediaIds, settings, user.userId);

      res.status(200).json({
        success: true,
        data: job,
        message: 'Bulk optimization started successfully',
      });
    } catch (error) {
      logger.error('Error in optimizeBulk:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to start bulk optimization',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // ============================================================================
  // MEDIA COLLECTIONS METHODS
  // ============================================================================

  // Get all collections
  static async getCollections(req: Request, res: Response): Promise<void> {
    try {
      const { search, page = 1, limit = 20 } = req.query;
      const user = req.user as JWTPayload;

      const collections = await MediaAdvancedService.getCollections({
        userId: user.userId,
        search: search as string,
        page: Number(page),
        limit: Number(limit),
      });

      res.status(200).json({
        success: true,
        data: collections.data,
        pagination: collections.pagination,
        message: 'Collections retrieved successfully',
      });
    } catch (error) {
      logger.error('Error in getCollections:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve collections',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Create new collection
  static async createCollection(req: Request, res: Response): Promise<void> {
    try {
      const { name, description, mediaIds, tags } = req.body;
      const user = req.user as JWTPayload;

      if (!name) {
        res.status(400).json({
          success: false,
          error: 'Collection name is required',
          message: 'Please provide a collection name',
        });
        return;
      }

      const collection = await MediaAdvancedService.createCollection({
        name,
        description,
        mediaIds: mediaIds || [],
        tags: tags || [],
        userId: user.userId,
      });

      res.status(201).json({
        success: true,
        data: collection,
        message: 'Collection created successfully',
      });
    } catch (error) {
      logger.error('Error in createCollection:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create collection',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get collection by ID
  static async getCollectionById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = req.user as JWTPayload;

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Collection ID is required',
          message: 'Please provide a valid collection ID',
        });
        return;
      }

      const collection = await MediaAdvancedService.getCollectionById(id, user.userId);

      if (!collection) {
        res.status(404).json({
          success: false,
          error: 'Collection not found',
          message: 'Collection with the specified ID was not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: collection,
        message: 'Collection retrieved successfully',
      });
    } catch (error) {
      logger.error('Error in getCollectionById:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve collection',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Update collection
  static async updateCollection(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, description, mediaIds, tags } = req.body;
      const user = req.user as JWTPayload;

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Collection ID is required',
          message: 'Please provide a valid collection ID',
        });
        return;
      }

      const collection = await MediaAdvancedService.updateCollection(id, {
        name,
        description,
        mediaIds,
        tags,
      }, user.userId);

      if (!collection) {
        res.status(404).json({
          success: false,
          error: 'Collection not found',
          message: 'Collection with the specified ID was not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: collection,
        message: 'Collection updated successfully',
      });
    } catch (error) {
      logger.error('Error in updateCollection:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update collection',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Delete collection
  static async deleteCollection(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = req.user as JWTPayload;

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Collection ID is required',
          message: 'Please provide a valid collection ID',
        });
        return;
      }

      const deleted = await MediaAdvancedService.deleteCollection(id, user.userId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Collection not found',
          message: 'Collection with the specified ID was not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Collection deleted successfully',
      });
    } catch (error) {
      logger.error('Error in deleteCollection:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete collection',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // ============================================================================
  // ADVANCED SEARCH METHODS
  // ============================================================================

  // Advanced search
  static async advancedSearch(req: Request, res: Response): Promise<void> {
    try {
      const { query, filters, sort, pagination } = req.body;
      const user = req.user as JWTPayload;

      const results = await MediaAdvancedService.advancedSearch({
        query,
        filters,
        sort,
        pagination,
        userId: user.userId,
      });

      res.status(200).json({
        success: true,
        data: results.data,
        pagination: results.pagination,
        message: 'Search results retrieved successfully',
      });
    } catch (error) {
      logger.error('Error in advancedSearch:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to perform advanced search',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // ============================================================================
  // ANALYTICS METHODS
  // ============================================================================

  // Get media analytics
  static async getAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { period = 'month' } = req.query;
      const user = req.user as JWTPayload;

      const analytics = await MediaAdvancedService.getAnalytics(user.userId, period as string);

      res.status(200).json({
        success: true,
        data: analytics,
        message: 'Analytics retrieved successfully',
      });
    } catch (error) {
      logger.error('Error in getAnalytics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve analytics',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
