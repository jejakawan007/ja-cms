import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// Types for advanced media features
export interface BatchJobCreateData {
  files: Express.Multer.File[];
  settings: any;
  userId: string;
}

export interface BatchJobFilters {
  userId: string;
  status?: string;
  page: number;
  limit: number;
}

export interface CollectionCreateData {
  name: string;
  description?: string;
  mediaIds: string[];
  tags: string[];
  userId: string;
}

export interface CollectionUpdateData {
  name?: string;
  description?: string;
  mediaIds?: string[];
  tags?: string[];
}

export interface CollectionFilters {
  userId: string;
  search?: string;
  page: number;
  limit: number;
}

export interface SearchFilters {
  query?: string;
  filters?: {
    types?: string[];
    sizeRange?: {
      min?: number;
      max?: number;
    };
    dateRange?: {
      start?: string;
      end?: string;
    };
    tags?: string[];
    collections?: string[];
  };
  sort?: {
    field?: string;
    order?: 'asc' | 'desc';
  };
  pagination?: {
    page?: number;
    limit?: number;
  };
  userId: string;
}

export interface OptimizationSettings {
  quality?: number;
  format?: 'webp' | 'jpg' | 'png';
  resize?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  [key: string]: any; // Allow additional properties for JSON serialization
}

export class MediaAdvancedService {

  // ============================================================================
  // BATCH PROCESSING METHODS
  // ============================================================================

  // Create new batch processing job
  static async createBatchJob(data: BatchJobCreateData) {
    try {
      // For now, we'll use MediaProcessingJob as a simple batch job
      // In a real implementation, you might want to create a separate batch job table
      const batchJob = await prisma.mediaProcessingJob.create({
        data: {
          type: 'batch_processing',
          status: 'pending',
          parameters: data.settings,
          inputPath: JSON.stringify(data.files.map(f => f.filename)),
          outputPath: null,
          progress: 0,
          mediaId: 'batch-' + Date.now(), // Temporary media ID for batch jobs
        },
        include: {
          media: true,
        }
      });

      logger.info(`Batch job created: ${batchJob.id} with ${data.files.length} files`);
      return batchJob;
    } catch (error) {
      logger.error('Error creating batch job:', error);
      throw error;
    }
  }

  // Get batch jobs with filters
  static async getBatchJobs(filters: BatchJobFilters) {
    try {
      const where: any = {
        type: 'batch_processing',
      };

      if (filters.status) {
        where.status = filters.status;
      }

      const [jobs, total] = await Promise.all([
        prisma.mediaProcessingJob.findMany({
          where,
          include: {
            media: true,
          },
          orderBy: { createdAt: 'desc' },
          skip: (filters.page - 1) * filters.limit,
          take: filters.limit,
        }),
        prisma.mediaProcessingJob.count({ where })
      ]);

      return {
        data: jobs,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total,
          totalPages: Math.ceil(total / filters.limit),
        }
      };
    } catch (error) {
      logger.error('Error getting batch jobs:', error);
      throw error;
    }
  }

  // Get batch job by ID
  static async getBatchJobById(id: string, _userId: string) {
    try {
      const job = await prisma.mediaProcessingJob.findFirst({
        where: {
          id,
          type: 'batch_processing',
        },
        include: {
          media: true,
        }
      });

      return job;
    } catch (error) {
      logger.error('Error getting batch job by ID:', error);
      throw error;
    }
  }

  // Start batch processing job
  static async startBatchJob(id: string, _userId: string) {
    try {
      const job = await prisma.mediaProcessingJob.findFirst({
        where: { id }
      });

      if (!job) return null;

      // Update job status to processing
      const updatedJob = await prisma.mediaProcessingJob.update({
        where: { id },
        data: { status: 'processing' },
        include: {
          media: true,
        }
      });

      // TODO: Start actual processing in background
      // This would typically be handled by a job queue (Bull, Agenda, etc.)
      this.processBatchJobInBackground(job);

      return updatedJob;
    } catch (error) {
      logger.error('Error starting batch job:', error);
      throw error;
    }
  }

  // Cancel batch processing job
  static async cancelBatchJob(id: string, _userId: string) {
    try {
      const job = await prisma.mediaProcessingJob.findFirst({
        where: { id }
      });

      if (!job) return null;

      const updatedJob = await prisma.mediaProcessingJob.update({
        where: { id },
        data: { status: 'cancelled' },
        include: {
          media: true,
        }
      });

      return updatedJob;
    } catch (error) {
      logger.error('Error cancelling batch job:', error);
      throw error;
    }
  }

  // Background processing (placeholder for actual implementation)
  private static async processBatchJobInBackground(job: any) {
    try {
      logger.info(`Starting background processing for job: ${job.id}`);
      
      // TODO: Implement actual file processing
      // - Image optimization
      // - Format conversion
      // - Resize operations
      // - Progress tracking
      
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time

      // Mark job as completed
      await prisma.mediaProcessingJob.update({
        where: { id: job.id },
        data: { 
          status: 'completed',
          progress: 100
        }
      });

      logger.info(`Batch job completed: ${job.id}`);
    } catch (error) {
      logger.error(`Error processing batch job ${job.id}:`, error);
      
      // Mark job as failed
      await prisma.mediaProcessingJob.update({
        where: { id: job.id },
        data: { status: 'failed' }
      });
    }
  }

  // ============================================================================
  // MEDIA OPTIMIZATION METHODS
  // ============================================================================

  // Optimize single media file
  static async optimizeMedia(mediaId: string, _settings: OptimizationSettings, userId: string) {
    try {
      // Verify media ownership
      const media = await prisma.media.findFirst({
        where: { id: mediaId, uploadedBy: userId }
      });

      if (!media) {
        throw new Error('Media not found or access denied');
      }

      // TODO: Implement actual optimization
      // - Use sharp for image processing
      // - Apply quality settings
      // - Convert format if needed
      // - Resize if specified

      const optimizedMedia = await prisma.media.update({
        where: { id: mediaId },
        data: {
          // Update with optimized file info
        }
      });

      return optimizedMedia;
    } catch (error) {
      logger.error('Error optimizing media:', error);
      throw error;
    }
  }

  // Optimize multiple media files
  static async optimizeBulk(mediaIds: string[], settings: OptimizationSettings, _userId: string) {
    try {
      // Create optimization job
      const optimizationJob = await prisma.mediaProcessingJob.create({
        data: {
          type: 'optimization',
          status: 'pending',
          parameters: settings,
          inputPath: JSON.stringify(mediaIds),
          outputPath: null,
          progress: 0,
          mediaId: 'opt-' + Date.now(),
        }
      });

      // TODO: Start background optimization
      this.processOptimizationJobInBackground(optimizationJob);

      return optimizationJob;
    } catch (error) {
      logger.error('Error starting bulk optimization:', error);
      throw error;
    }
  }

  // Background optimization processing
  private static async processOptimizationJobInBackground(job: any) {
    try {
      logger.info(`Starting background optimization for job: ${job.id}`);
      
      // TODO: Implement actual optimization for each media file
      const mediaIds = JSON.parse(job.inputPath || '[]');
      
      for (const mediaId of mediaIds) {
        await this.optimizeMedia(mediaId, job.parameters, job.userId);
        // Update progress
        await prisma.mediaProcessingJob.update({
          where: { id: job.id },
          data: { 
            progress: Math.min(100, (mediaIds.indexOf(mediaId) + 1) * 100 / mediaIds.length)
          }
        });
      }

      // Mark job as completed
      await prisma.mediaProcessingJob.update({
        where: { id: job.id },
        data: { status: 'completed', progress: 100 }
      });

      logger.info(`Optimization job completed: ${job.id}`);
    } catch (error) {
      logger.error(`Error processing optimization job ${job.id}:`, error);
      
      await prisma.mediaProcessingJob.update({
        where: { id: job.id },
        data: { status: 'failed' }
      });
    }
  }

  // ============================================================================
  // MEDIA COLLECTIONS METHODS
  // ============================================================================

  // Get collections with filters
  static async getCollections(filters: CollectionFilters) {
    try {
      const where: any = {
        createdBy: filters.userId,
      };

      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      const [collections, total] = await Promise.all([
        prisma.mediaFolder.findMany({
          where,
          include: {
            files: {
              select: {
                id: true,
                filename: true,
                originalName: true,
                mimeType: true,
                size: true,
                url: true,
              }
            },
            creator: {
              select: {
                id: true,
                username: true,
                email: true,
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip: (filters.page - 1) * filters.limit,
          take: filters.limit,
        }),
        prisma.mediaFolder.count({ where })
      ]);

      return {
        data: collections,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total,
          totalPages: Math.ceil(total / filters.limit),
        }
      };
    } catch (error) {
      logger.error('Error getting collections:', error);
      throw error;
    }
  }

  // Create new collection
  static async createCollection(data: CollectionCreateData) {
    try {
      const collection = await prisma.mediaFolder.create({
        data: {
          name: data.name,
          description: data.description || null,
          createdBy: data.userId,
          slug: data.name.toLowerCase().replace(/\s+/g, '-'),
          path: `/${data.name.toLowerCase().replace(/\s+/g, '-')}`,
          files: {
            connect: data.mediaIds.map(id => ({ id }))
          }
        },
        include: {
          files: {
            select: {
              id: true,
              filename: true,
              originalName: true,
              mimeType: true,
              size: true,
              url: true,
            }
          },
          creator: {
            select: {
              id: true,
              username: true,
              email: true,
            }
          }
        }
      });

      return collection;
    } catch (error) {
      logger.error('Error creating collection:', error);
      throw error;
    }
  }

  // Get collection by ID
  static async getCollectionById(id: string, userId: string) {
    try {
      const collection = await prisma.mediaFolder.findFirst({
        where: {
          id,
          createdBy: userId,
        },
        include: {
          files: {
            select: {
              id: true,
              filename: true,
              originalName: true,
              mimeType: true,
              size: true,
              url: true,
            }
          },
          creator: {
            select: {
              id: true,
              username: true,
              email: true,
            }
          }
        }
      });

      return collection;
    } catch (error) {
      logger.error('Error getting collection by ID:', error);
      throw error;
    }
  }

  // Update collection
  static async updateCollection(id: string, data: CollectionUpdateData, userId: string) {
    try {
      const collection = await prisma.mediaFolder.findFirst({
        where: { id, createdBy: userId }
      });

      if (!collection) return null;

      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;

      const updatedCollection = await prisma.mediaFolder.update({
        where: { id },
        data: {
          ...updateData,
          ...(data.mediaIds && {
            media: {
              set: data.mediaIds.map(mediaId => ({ id: mediaId }))
            }
          })
        },
        include: {
          files: {
            select: {
              id: true,
              filename: true,
              originalName: true,
              mimeType: true,
              size: true,
              url: true,
            }
          },
          creator: {
            select: {
              id: true,
              username: true,
              email: true,
            }
          }
        }
      });

      return updatedCollection;
    } catch (error) {
      logger.error('Error updating collection:', error);
      throw error;
    }
  }

  // Delete collection
  static async deleteCollection(id: string, userId: string) {
    try {
      const collection = await prisma.mediaFolder.findFirst({
        where: { id, createdBy: userId }
      });

      if (!collection) return false;

      await prisma.mediaFolder.delete({
        where: { id }
      });

      return true;
    } catch (error) {
      logger.error('Error deleting collection:', error);
      throw error;
    }
  }

  // ============================================================================
  // ADVANCED SEARCH METHODS
  // ============================================================================

  // Advanced search
  static async advancedSearch(filters: SearchFilters) {
    try {
      const where: any = {
        uploadedBy: filters.userId,
      };

      // Text search
      if (filters.query) {
        where.OR = [
          { originalName: { contains: filters.query, mode: 'insensitive' } },
          { filename: { contains: filters.query, mode: 'insensitive' } },
          { alt: { contains: filters.query, mode: 'insensitive' } },
          { caption: { contains: filters.query, mode: 'insensitive' } },
        ];
      }

      // File type filters
      if (filters.filters?.types && filters.filters.types.length > 0) {
        where.mimeType = {
          in: filters.filters.types
        };
      }

      // Size range filters
      if (filters.filters?.sizeRange) {
        const sizeFilter: any = {};
        if (filters.filters.sizeRange.min !== undefined) {
          sizeFilter.gte = filters.filters.sizeRange.min;
        }
        if (filters.filters.sizeRange.max !== undefined) {
          sizeFilter.lte = filters.filters.sizeRange.max;
        }
        if (Object.keys(sizeFilter).length > 0) {
          where.size = sizeFilter;
        }
      }

      // Date range filters
      if (filters.filters?.dateRange) {
        const dateFilter: any = {};
        if (filters.filters.dateRange.start) {
          dateFilter.gte = new Date(filters.filters.dateRange.start);
        }
        if (filters.filters.dateRange.end) {
          dateFilter.lte = new Date(filters.filters.dateRange.end);
        }
        if (Object.keys(dateFilter).length > 0) {
          where.createdAt = dateFilter;
        }
      }

      // Sort options
      const orderBy: any = {};
      if (filters.sort?.field) {
        orderBy[filters.sort.field] = filters.sort.order || 'desc';
      } else {
        orderBy.createdAt = 'desc';
      }

      // Pagination
      const page = filters.pagination?.page || 1;
      const limit = filters.pagination?.limit || 20;

      const [media, total] = await Promise.all([
        prisma.media.findMany({
          where,
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
          include: {
            uploader: {
              select: {
                id: true,
                username: true,
                email: true,
              }
            }
          }
        }),
        prisma.media.count({ where })
      ]);

      return {
        data: media,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        }
      };
    } catch (error) {
      logger.error('Error performing advanced search:', error);
      throw error;
    }
  }

  // ============================================================================
  // ANALYTICS METHODS
  // ============================================================================

  // Get media analytics
  static async getAnalytics(userId: string, period: string = 'month') {
    try {
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case 'day':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      // Get basic stats
      const [totalFiles, totalSize, filesByType, recentUploads] = await Promise.all([
        prisma.media.count({
          where: { uploadedBy: userId }
        }),
        prisma.media.aggregate({
          where: { uploadedBy: userId },
          _sum: { size: true }
        }),
        prisma.media.groupBy({
          by: ['mimeType'],
          where: { uploadedBy: userId },
          _count: { id: true }
        }),
        prisma.media.findMany({
          where: {
            uploadedBy: userId,
            createdAt: { gte: startDate }
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            uploader: {
              select: {
                id: true,
                username: true,
                email: true,
              }
            }
          }
        })
      ]);

      // Calculate file type distribution
      const fileTypeDistribution = filesByType.reduce((acc, item) => {
        const type = item.mimeType?.split('/')[0] || 'unknown';
        acc[type] = (acc[type] || 0) + item._count.id;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalFiles,
        totalSize: totalSize._sum.size || 0,
        totalSizeMB: Math.round((totalSize._sum.size || 0) / (1024 * 1024) * 100) / 100,
        filesByType: fileTypeDistribution,
        recentUploads,
        period,
        startDate,
        endDate: now,
      };
    } catch (error) {
      logger.error('Error getting analytics:', error);
      throw error;
    }
  }
}
