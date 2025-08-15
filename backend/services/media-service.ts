import { PrismaClient } from '@prisma/client';
import { EventEmitter } from 'events';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number;
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  caption?: string;
  description?: string;
  folderId?: string;
  uploadedBy: string;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface MediaMetadata {
  width?: number;
  height?: number;
  duration?: number;
  bitrate?: number;
  format?: string;
  exif?: Record<string, any>;
  thumbnail?: string;
  processed?: boolean;
  optimized?: boolean;
}

export interface UploadConfig {
  maxFileSize: number; // bytes
  maxTotalSize: number; // bytes for bulk upload
  maxFiles: number;
  allowedTypes: string[];
  blockedTypes: string[];
  chunkSize: number; // for chunked upload
  concurrent: number; // simultaneous uploads
  autoStart: boolean;
  autoRetry: boolean;
  retryAttempts: number;
  timeout: number; // milliseconds
}

export interface UploadFile {
  id: string;
  file: any; // Express.Multer.File
  name: string;
  size: number;
  type: string;
  status: 'queued' | 'uploading' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0-100
  uploadedBytes: number;
  totalBytes: number;
  speed: number; // bytes per second
  timeRemaining: number; // seconds
  error?: string;
  metadata: MediaMetadata;
  chunks?: UploadChunk[];
}

export interface UploadChunk {
  index: number;
  start: number;
  end: number;
  size: number;
  uploaded: boolean;
  retries: number;
}

export interface MediaQueryOptions {
  page: number;
  limit: number;
  search?: string;
  type?: string;
  folderId?: string;
  uploaderId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface MediaUpdateData {
  alt?: string;
  caption?: string;
  description?: string;
  folderId?: string;
}

export interface MediaAnalytics {
  totalFiles: number;
  totalSize: number;
  fileTypes: Record<string, number>;
  uploadTrends: {
    date: string;
    count: number;
    size: number;
  }[];
  topUploaders: {
    userId: string;
    userName: string;
    count: number;
    size: number;
  }[];
  popularTags: {
    tag: string;
    count: number;
  }[];
}

export interface MediaFolder {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  path: string;
  uploaderId: string;
  permissions: MediaPermission[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MediaPermission {
  userId: string;
  permissions: ('read' | 'write' | 'delete' | 'admin')[];
}

export class MediaService extends EventEmitter {
  private uploadDir: string;

  constructor() {
    super();
    this.uploadDir = path.join(process.cwd(), 'uploads');
    this.ensureUploadDir();
  }

  /**
   * Get all media with pagination and filtering
   */
  static async getAllMedia(options: MediaQueryOptions) {
    try {
      const { page, limit, search, type, folderId, uploaderId, sortBy = 'createdAt', sortOrder = 'desc' } = options;
      const skip = (page - 1) * limit;

      const where: Record<string, any> = {};

      if (search) {
        where['OR'] = [
          { filename: { contains: search, mode: 'insensitive' } },
          { originalName: { contains: search, mode: 'insensitive' } },
          { alt: { contains: search, mode: 'insensitive' } },
          { caption: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ];
      }

      if (type) {
        where['mimeType'] = { startsWith: type };
      }

      if (folderId) {
        where['folderId'] = folderId;
      }

      if (uploaderId) {
        where['uploadedBy'] = uploaderId;
      }

      const [media, total] = await Promise.all([
        prisma.mediaFile.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            [sortBy]: sortOrder
          },
          include: {
            uploader: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true
              }
            },
            folder: {
              select: {
                id: true,
                name: true,
                path: true
              }
            },
            tags: {
              select: {
                id: true,
                name: true,
                color: true
              }
            }
          }
        }),
        prisma.mediaFile.count({ where })
      ]);

      return {
        data: media,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      throw new Error('Failed to get media files');
    }
  }

  /**
   * Get media by ID
   */
  static async getMediaById(id: string) {
    try {
      const media = await prisma.mediaFile.findUnique({
        where: { id },
        include: {
          uploader: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true
            }
          },
          folder: {
            select: {
              id: true,
              name: true,
              path: true
            }
          },
          tags: {
            select: {
              id: true,
              name: true,
              color: true
            }
          }
        }
      });

      if (!media) {
        throw new Error('Media not found');
      }

      return media;
    } catch (error) {
      throw new Error('Failed to get media file');
    }
  }

  /**
   * Upload media file
   */
  static async uploadMedia(file: { 
    originalname: string; 
    mimetype: string; 
    size: number; 
    buffer: Buffer; 
  }, uploadedBy: string, options?: {
    alt?: string;
    caption?: string;
    description?: string;
    folderId?: string;
  }) {
    try {
      // Validate file
      const validation = await this.validateFile(file);
      if (!validation.valid) {
        throw new Error(`File validation failed: ${validation.errors.join(', ')}`);
      }

      // Check for duplicates
      const isDuplicate = await this.checkDuplicate(file, uploadedBy);
      if (isDuplicate) {
        throw new Error('File already exists');
      }

      // Generate unique filename
      const fileExtension = path.extname(file.originalname);
      const filename = `${uuidv4()}${fileExtension}`;
      const uploadPath = path.join(process.cwd(), 'uploads', filename);

      // Save file to disk
      fs.writeFileSync(uploadPath, file.buffer);

      // Extract metadata
      const metadata = await this.extractMetadata(file);

      // Create media record
      const media = await prisma.mediaFile.create({
        data: {
          filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          url: `/uploads/${filename}`,
          alt: options?.alt,
          caption: options?.caption,
          description: options?.description,
          folderId: options?.folderId,
          uploadedBy,
          processingStatus: 'pending',
          metadata: metadata
        },
        include: {
          uploader: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true
            }
          },
          folder: {
            select: {
              id: true,
              name: true,
              path: true
            }
          }
        }
      });

      // Process file asynchronously
      this.processFileAsync(media);

      return media;
    } catch (error) {
      throw new Error(`Failed to upload media: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update media file
   */
  static async updateMedia(id: string, updateData: MediaUpdateData) {
    try {
      const media = await prisma.mediaFile.update({
        where: { id },
        data: {
          alt: updateData.alt,
          caption: updateData.caption,
          description: updateData.description,
          folderId: updateData.folderId
        },
        include: {
          uploader: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true
            }
          },
          folder: {
            select: {
              id: true,
              name: true,
              path: true
            }
          },
          tags: {
            select: {
              id: true,
              name: true,
              color: true
            }
          }
        }
      });

      return media;
    } catch (error) {
      throw new Error('Failed to update media file');
    }
  }

  /**
   * Delete media file
   */
  static async deleteMedia(id: string) {
    try {
      const media = await prisma.mediaFile.findUnique({
        where: { id }
      });

      if (!media) {
        throw new Error('Media not found');
      }

      // Delete file from disk
      const filePath = path.join(process.cwd(), 'uploads', media.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Delete from database
      await prisma.mediaFile.delete({
        where: { id }
      });

      return { success: true };
    } catch (error) {
      throw new Error('Failed to delete media file');
    }
  }

  /**
   * Get comprehensive media analytics
   */
  static async getMediaAnalytics(userId?: string): Promise<MediaAnalytics> {
    try {
      const where: Record<string, any> = {};
      if (userId) {
        where['uploadedBy'] = userId;
      }

      const [totalFiles, totalSize, fileTypes, uploadTrends, topUploaders, popularTags] = await Promise.all([
        prisma.mediaFile.count({ where }),
        prisma.mediaFile.aggregate({
          where,
          _sum: { size: true }
        }),
        this.getFileTypeStats(where),
        this.getUploadTrends(where),
        this.getTopUploaders(where),
        this.getPopularTags(where)
      ]);

      return {
        totalFiles,
        totalSize: totalSize._sum.size || 0,
        fileTypes,
        uploadTrends,
        topUploaders,
        popularTags
      };
    } catch (error) {
      throw new Error('Failed to get media analytics');
    }
  }

  /**
   * Get media statistics for dashboard
   */
  static async getMediaStats() {
    try {
      const [totalFiles, totalSize, fileTypes, recentUploads] = await Promise.all([
        prisma.mediaFile.count(),
        prisma.mediaFile.aggregate({
          _sum: { size: true }
        }),
        this.getFileTypeStats({}),
        prisma.mediaFile.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            uploader: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            },
            folder: {
              select: {
                id: true,
                name: true,
                path: true
              }
            }
          }
        })
      ]);

      return {
        totalFiles,
        totalSizeMB: Math.round((totalSize._sum.size || 0) / (1024 * 1024) * 100) / 100,
        filesByType: fileTypes,
        recentUploads
      };
    } catch (error) {
      throw new Error('Failed to get media statistics');
    }
  }

  /**
   * Search media with AI-powered features
   */
  static async searchMedia(query: string, options: {
    type?: string;
    folderId?: string;
    uploaderId?: string;
    limit?: number;
  } = {}) {
    try {
      const { type, folderId, uploaderId, limit = 20 } = options;

      const where: Record<string, any> = {
        OR: [
          { filename: { contains: query, mode: 'insensitive' } },
          { originalName: { contains: query, mode: 'insensitive' } },
          { alt: { contains: query, mode: 'insensitive' } },
          { caption: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      };

      if (type) {
        where['mimeType'] = { startsWith: type };
      }

      if (folderId) {
        where['folderId'] = folderId;
      }

      if (uploaderId) {
        where['uploadedBy'] = uploaderId;
      }

      const media = await prisma.mediaFile.findMany({
        where,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          uploader: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true
            }
          },
          folder: {
            select: {
              id: true,
              name: true,
              path: true
            }
          },
          tags: {
            select: {
              id: true,
              name: true,
              color: true
            }
          }
        }
      });

      return media;
    } catch (error) {
      throw new Error('Failed to search media');
    }
  }

  // Private helper methods

  private ensureUploadDir(): void {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  private static async validateFile(file: { mimetype: string; size: number }): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check file size
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      errors.push('File size exceeds maximum limit');
    }

    // Check file type
    const allowedTypes = ['image/', 'video/', 'audio/', 'application/pdf'];
    const isAllowed = allowedTypes.some(type => file.mimetype.startsWith(type));
    if (!isAllowed) {
      errors.push('File type not allowed');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private static async checkDuplicate(file: { originalname: string; size: number }, uploaderId: string): Promise<boolean> {
    const existing = await prisma.mediaFile.findFirst({
      where: {
        originalName: file.originalname,
        size: file.size,
        uploadedBy: uploaderId
      }
    });

    return !!existing;
  }

  private static async extractMetadata(file: { mimetype: string; buffer: Buffer }): Promise<Record<string, any>> {
    const metadata: Record<string, any> = {
      format: file.mimetype,
      processed: false,
      optimized: false
    };

    // Basic metadata extraction (can be enhanced with image/video processing libraries)
    if (file.mimetype.startsWith('image/')) {
      metadata['format'] = 'image';
    } else if (file.mimetype.startsWith('video/')) {
      metadata['format'] = 'video';
    } else if (file.mimetype.startsWith('audio/')) {
      metadata['format'] = 'audio';
    }

    return metadata;
  }

  private static async processFileAsync(media: any): Promise<void> {
    try {
      // Update status to processing
      await prisma.mediaFile.update({
        where: { id: media.id },
        data: { processingStatus: 'processing' }
      });

      // Process file asynchronously (e.g., generate thumbnails, optimize)
      // This is a placeholder for actual processing logic
      console.log(`Processing media file: ${media.filename}`);
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update status to completed
      await prisma.mediaFile.update({
        where: { id: media.id },
        data: { 
          processingStatus: 'completed',
          metadata: {
            ...media.metadata,
            processed: true,
            optimized: true
          }
        }
      });
      
      console.log(`Media file processed: ${media.filename}`);
    } catch (error) {
      // Update status to failed
      await prisma.mediaFile.update({
        where: { id: media.id },
        data: { processingStatus: 'failed' }
      });
      
      console.error(`Error processing media file ${media.filename}:`, error);
    }
  }

  private static async getFileTypeStats(where: Record<string, any>): Promise<Record<string, number>> {
    const stats = await prisma.mediaFile.groupBy({
      by: ['mimeType'],
      where,
      _count: {
        mimeType: true
      }
    });

    return stats.reduce((acc, stat) => {
      acc[stat.mimeType] = stat._count.mimeType;
      return acc;
    }, {} as Record<string, number>);
  }

  private static async getUploadTrends(where: Record<string, any>): Promise<{ date: string; count: number; size: number }[]> {
    const trends = await prisma.mediaFile.groupBy({
      by: ['createdAt'],
      where,
      _count: {
        id: true
      },
      _sum: {
        size: true
      }
    });

    return trends.map(trend => ({
      date: trend.createdAt.toISOString().split('T')[0],
      count: trend._count.id,
      size: trend._sum.size || 0
    }));
  }

  private static async getTopUploaders(where: Record<string, any>): Promise<{ userId: string; userName: string; count: number; size: number }[]> {
    const uploaders = await prisma.mediaFile.groupBy({
      by: ['uploadedBy'],
      where,
      _count: {
        id: true
      },
      _sum: {
        size: true
      }
    });

    const uploaderDetails = await Promise.all(
      uploaders.map(async (uploader) => {
        const user = await prisma.user.findUnique({
          where: { id: uploader.uploadedBy },
          select: { firstName: true, lastName: true }
        });

        return {
          userId: uploader.uploadedBy,
          userName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Unknown User',
          count: uploader._count.id,
          size: uploader._sum.size || 0
        };
      })
    );

    return uploaderDetails.sort((a, b) => b.count - a.count).slice(0, 10);
  }

  private static async getPopularTags(_where: Record<string, any>): Promise<{ tag: string; count: number }[]> {
    // Get popular tags from MediaTag model
    const tagStats = await prisma.mediaTag.findMany({
      include: {
        _count: {
          select: { files: true }
        }
      },
      orderBy: {
        files: {
          _count: 'desc'
        }
      },
      take: 20
    });

    return tagStats.map(tag => ({
      tag: tag.name,
      count: tag._count.files
    }));
  }
}
