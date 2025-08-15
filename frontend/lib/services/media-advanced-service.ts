/**
 * Media Advanced Service
 * Frontend service untuk komunikasi dengan Media Advanced API
 */

import { apiClient, ApiResponse } from '../api/client';

// Types
export interface BatchJob {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  totalFiles: number;
  processedFiles: number;
  settings: any;
  createdAt: string;
  updatedAt: string;
  files?: BatchJobFile[];
}

export interface BatchJobFile {
  id: string;
  originalName: string;
  filename: string;
  mimeType: string;
  size: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'skipped';
  progress: number;
  order: number;
}

export interface MediaCollection {
  id: string;
  name: string;
  description?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  files?: MediaFile[];
}

export interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
}

export interface OptimizationSettings {
  quality?: number;
  format?: 'webp' | 'jpg' | 'png';
  resize?: boolean;
  maxWidth?: number;
  maxHeight?: number;
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
}

export interface MediaAnalytics {
  totalFiles: number;
  totalSize: number;
  totalSizeMB: number;
  filesByType: Record<string, number>;
  recentUploads: MediaFile[];
  period: string;
  startDate: string;
  endDate: string;
}

export class MediaAdvancedService {

  // ============================================================================
  // BATCH PROCESSING METHODS
  // ============================================================================

  /**
   * Upload files untuk batch processing
   */
  static async uploadBatchFiles(files: File[], settings: any): Promise<BatchJob> {
    const formData = new FormData();
    
    files.forEach((file) => {
      formData.append('files', file);
    });
    
    formData.append('settings', JSON.stringify(settings));

    const response = await apiClient.post<BatchJob>(
      '/media-advanced/batch/upload',
      formData
    );

    if (!response?.success || !response.data) {
      throw new Error(response?.error?.message || 'Failed to upload batch files');
    }

    return response.data;
  }

  /**
   * Get semua batch jobs
   */
  static async getBatchJobs(page: number = 1, limit: number = 20, status?: string): Promise<ApiResponse<BatchJob[]>> {
    const params: Record<string, any> = {
      page,
      limit,
    };

    if (status) {
      params['status'] = status;
    }

    const response = await apiClient.get<BatchJob[]>(
      '/media-advanced/batch/jobs',
      params
    );

    return response || { success: false, data: [], error: { code: 'NO_RESPONSE', message: 'No response from server' } };
  }

  /**
   * Get batch job by ID
   */
  static async getBatchJobById(id: string): Promise<BatchJob> {
    const response = await apiClient.get<BatchJob>(
      `/media-advanced/batch/jobs/${id}`
    );

    if (!response?.success || !response.data) {
      throw new Error(response?.error?.message || 'Failed to get batch job');
    }

    return response.data;
  }

  /**
   * Start batch processing job
   */
  static async startBatchJob(id: string): Promise<BatchJob> {
    const response = await apiClient.post<BatchJob>(
      `/media-advanced/batch/jobs/${id}/start`
    );

    if (!response?.success || !response.data) {
      throw new Error(response?.error?.message || 'Failed to start batch job');
    }

    return response.data;
  }

  /**
   * Cancel batch processing job
   */
  static async cancelBatchJob(id: string): Promise<BatchJob> {
    const response = await apiClient.post<BatchJob>(
      `/media-advanced/batch/jobs/${id}/cancel`
    );

    if (!response?.success || !response.data) {
      throw new Error(response?.error?.message || 'Failed to cancel batch job');
    }

    return response.data;
  }

  // ============================================================================
  // MEDIA OPTIMIZATION METHODS
  // ============================================================================

  /**
   * Optimize single media file
   */
  static async optimizeMedia(mediaId: string, settings: OptimizationSettings): Promise<MediaFile> {
    const response = await apiClient.post<MediaFile>(
      '/media-advanced/optimize',
      {
        mediaId,
        settings,
      }
    );

    if (!response?.success || !response.data) {
      throw new Error(response?.error?.message || 'Failed to optimize media');
    }

    return response.data;
  }

  /**
   * Optimize multiple media files
   */
  static async optimizeBulk(mediaIds: string[], settings: OptimizationSettings): Promise<BatchJob> {
    const response = await apiClient.post<BatchJob>(
      '/media-advanced/optimize/bulk',
      {
        mediaIds,
        settings,
      }
    );

    if (!response?.success || !response.data) {
      throw new Error(response?.error?.message || 'Failed to start bulk optimization');
    }

    return response.data;
  }

  // ============================================================================
  // MEDIA COLLECTIONS METHODS
  // ============================================================================

  /**
   * Get semua collections
   */
  static async getCollections(page: number = 1, limit: number = 20, search?: string): Promise<ApiResponse<MediaCollection[]>> {
    const params: Record<string, any> = {
      page,
      limit,
    };

    if (search) {
      params['search'] = search;
    }

    const response = await apiClient.get<MediaCollection[]>(
      '/media-advanced/collections',
      params
    );

    return response || { success: false, data: [], error: { code: 'NO_RESPONSE', message: 'No response from server' } };
  }

  /**
   * Create collection baru
   */
  static async createCollection(data: {
    name: string;
    description?: string;
    mediaIds: string[];
    tags: string[];
  }): Promise<MediaCollection> {
    const response = await apiClient.post<MediaCollection>(
      '/media-advanced/collections',
      data
    );

    if (!response?.success || !response.data) {
      throw new Error(response?.error?.message || 'Failed to create collection');
    }

    return response.data;
  }

  /**
   * Get collection by ID
   */
  static async getCollectionById(id: string): Promise<MediaCollection> {
    const response = await apiClient.get<MediaCollection>(
      `/media-advanced/collections/${id}`
    );

    if (!response?.success || !response.data) {
      throw new Error(response?.error?.message || 'Failed to get collection');
    }

    return response.data;
  }

  /**
   * Update collection
   */
  static async updateCollection(id: string, data: {
    name?: string;
    description?: string;
    mediaIds?: string[];
    tags?: string[];
  }): Promise<MediaCollection> {
    const response = await apiClient.put<MediaCollection>(
      `/media-advanced/collections/${id}`,
      data
    );

    if (!response?.success || !response.data) {
      throw new Error(response?.error?.message || 'Failed to update collection');
    }

    return response.data;
  }

  /**
   * Delete collection
   */
  static async deleteCollection(id: string): Promise<boolean> {
    const response = await apiClient.delete<boolean>(
      `/media-advanced/collections/${id}`
    );

    if (!response?.success || !response.data) {
      throw new Error(response?.error?.message || 'Failed to delete collection');
    }

    return response.data;
  }

  // ============================================================================
  // ADVANCED SEARCH METHODS
  // ============================================================================

  /**
   * Advanced search
   */
  static async advancedSearch(filters: SearchFilters): Promise<ApiResponse<MediaFile[]>> {
    const response = await apiClient.post<MediaFile[]>(
      '/media-advanced/search',
      filters
    );

    return response || { success: false, data: [], error: { code: 'NO_RESPONSE', message: 'No response from server' } };
  }

  // ============================================================================
  // ANALYTICS METHODS
  // ============================================================================

  /**
   * Get media analytics
   */
  static async getAnalytics(period: string = 'month'): Promise<MediaAnalytics> {
    const response = await apiClient.get<MediaAnalytics>(
      `/media-advanced/analytics?period=${period}`
    );

    if (!response?.success || !response.data) {
      throw new Error(response?.error?.message || 'Failed to get analytics');
    }

    return response.data;
  }
}
