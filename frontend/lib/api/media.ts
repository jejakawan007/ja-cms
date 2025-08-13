import { apiClient } from './client'

export interface MediaFile {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  path: string
  url: string
  thumbnailUrl?: string
  previewUrl?: string
  width?: number
  height?: number
  duration?: number
  metadata: MediaMetadata
  tags: string[]
  categories: string[]
  folder: string
  authorId: string
  authorName: string
  status: 'processing' | 'ready' | 'error' | 'deleted'
  processingProgress?: number
  errorMessage?: string
  isPublic: boolean
  downloadCount: number
  viewCount: number
  createdAt: string
  updatedAt: string
}

export interface MediaMetadata {
  title?: string
  description?: string
  alt?: string
  caption?: string
  copyright?: string
  location?: string
  dateTaken?: string
  camera?: string
  settings?: Record<string, any>
  exif?: Record<string, any>
}

export interface MediaFolder {
  id: string
  name: string
  path: string
  parentId?: string
  children: MediaFolder[]
  fileCount: number
  totalSize: number
  createdAt: string
  updatedAt: string
}

export interface UploadConfig {
  maxFileSize: number
  allowedTypes: string[]
  maxFiles: number
  chunkSize: number
  retryAttempts: number
  autoProcess: boolean
  generateThumbnails: boolean
  optimizeImages: boolean
  watermark?: string
}

export interface UploadProgress {
  fileId: string
  filename: string
  progress: number
  speed: number
  timeRemaining: number
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error'
  error?: string
}

export interface MediaSearchParams {
  query?: string
  type?: string
  status?: string
  folder?: string
  tags?: string[]
  categories?: string[]
  authorId?: string
  dateFrom?: string
  dateTo?: string
  sizeMin?: number
  sizeMax?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface MediaBatchOperation {
  fileIds: string[]
  operation: 'move' | 'copy' | 'delete' | 'tag' | 'untag' | 'categorize' | 'publish' | 'unpublish'
  targetFolder?: string
  tags?: string[]
  categories?: string[]
}

export class MediaAPI {
  private client: typeof apiClient

  constructor(client: typeof apiClient = apiClient) {
    this.client = client
  }

  /**
   * Get upload configuration
   */
  async getUploadConfig(): Promise<UploadConfig> {
    const response = await this.client.get<UploadConfig>('/media/upload/config')
    return response.data! as UploadConfig
  }

  /**
   * Upload single file
   */
  async uploadFile(file: File, options?: {
    folder?: string
    tags?: string[]
    categories?: string[]
    metadata?: Partial<MediaMetadata>
  }): Promise<MediaFile> {
    const formData = new FormData()
    formData.append('file', file)
    
    if (options?.folder) formData.append('folder', options.folder)
    if (options?.tags) formData.append('tags', JSON.stringify(options.tags))
    if (options?.categories) formData.append('categories', JSON.stringify(options.categories))
    if (options?.metadata) formData.append('metadata', JSON.stringify(options.metadata))
    
    const response = await this.client.post<MediaFile>('/media/upload', formData)
    return response.data! as MediaFile
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(files: File[], options?: {
    folder?: string
    tags?: string[]
    categories?: string[]
    metadata?: Partial<MediaMetadata>
  }): Promise<MediaFile[]> {
    const formData = new FormData()
    
    files.forEach(file => {
      formData.append('files', file)
    })
    
    if (options?.folder) formData.append('folder', options.folder)
    if (options?.tags) formData.append('tags', JSON.stringify(options.tags))
    if (options?.categories) formData.append('categories', JSON.stringify(options.categories))
    if (options?.metadata) formData.append('metadata', JSON.stringify(options.metadata))
    
    const response = await this.client.post<MediaFile[]>('/media/upload/batch', formData)
    return response.data! as MediaFile[]
  }

  /**
   * Get media file by ID
   */
  async getMediaFile(id: string): Promise<MediaFile> {
    const response = await this.client.get<MediaFile>(`/media/files/${id}`)
    return response.data! as MediaFile
  }

  /**
   * Update media file
   */
  async updateMediaFile(id: string, data: {
    filename?: string
    metadata?: Partial<MediaMetadata>
    tags?: string[]
    categories?: string[]
    folder?: string
    isPublic?: boolean
  }): Promise<MediaFile> {
    const response = await this.client.put<MediaFile>(`/media/files/${id}`, data)
    return response.data! as MediaFile
  }

  /**
   * Delete media file
   */
  async deleteMediaFile(id: string): Promise<void> {
    await this.client.delete(`/media/files/${id}`)
  }

  /**
   * Search media files
   */
  async searchMediaFiles(params: MediaSearchParams): Promise<{
    files: MediaFile[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    const response = await this.client.get<{
      files: MediaFile[]
      total: number
      page: number
      limit: number
      totalPages: number
    }>('/media/files/search', params as Record<string, unknown>)
    return response.data! as {
      files: MediaFile[]
      total: number
      page: number
      limit: number
      totalPages: number
    }
  }

  /**
   * Get media files by folder
   */
  async getMediaFilesByFolder(folder: string, params?: {
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<{
    files: MediaFile[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    const response = await this.client.get<{
      files: MediaFile[]
      total: number
      page: number
      limit: number
      totalPages: number
    }>(`/media/folders/${folder}/files`, params as Record<string, unknown>)
    return response.data! as {
      files: MediaFile[]
      total: number
      page: number
      limit: number
      totalPages: number
    }
  }

  /**
   * Get media folders
   */
  async getMediaFolders(): Promise<MediaFolder[]> {
    const response = await this.client.get<MediaFolder[]>('/media/folders')
    return response.data! as MediaFolder[]
  }

  /**
   * Create media folder
   */
  async createMediaFolder(name: string, parentId?: string): Promise<MediaFolder> {
    const response = await this.client.post<MediaFolder>('/media/folders', {
      name,
      parentId
    })
    return response.data! as MediaFolder
  }

  /**
   * Update media folder
   */
  async updateMediaFolder(id: string, data: {
    name?: string
    parentId?: string
  }): Promise<MediaFolder> {
    const response = await this.client.put<MediaFolder>(`/media/folders/${id}`, data)
    return response.data! as MediaFolder
  }

  /**
   * Delete media folder
   */
  async deleteMediaFolder(id: string, _moveFilesTo?: string): Promise<void> {
    await this.client.delete(`/media/folders/${id}`)
  }

  /**
   * Batch operations on media files
   */
  async batchOperation(operation: MediaBatchOperation): Promise<{
    success: string[]
    failed: string[]
    errors: Record<string, string>
  }> {
    const response = await this.client.post<{
      success: string[]
      failed: string[]
      errors: Record<string, string>
    }>('/media/batch', operation)
    return response.data! as {
      success: string[]
      failed: string[]
      errors: Record<string, string>
    }
  }

  /**
   * Get upload progress
   */
  async getUploadProgress(uploadId: string): Promise<UploadProgress[]> {
    const response = await this.client.get<UploadProgress[]>(`/media/upload/${uploadId}/progress`)
    return response.data! as UploadProgress[]
  }

  /**
   * Cancel upload
   */
  async cancelUpload(uploadId: string): Promise<void> {
    await this.client.delete(`/media/upload/${uploadId}`)
  }

  /**
   * Retry failed upload
   */
  async retryUpload(uploadId: string, fileId: string): Promise<MediaFile> {
    const response = await this.client.post<MediaFile>(`/media/upload/${uploadId}/retry`, {
      fileId
    })
    return response.data! as MediaFile
  }

  /**
   * Generate thumbnail
   */
  async generateThumbnail(id: string, _size?: string): Promise<MediaFile> {
    const response = await this.client.post<MediaFile>(`/media/files/${id}/thumbnail`, {})
    return response.data! as MediaFile
  }

  /**
   * Process media file (optimize, resize, etc.)
   */
  async processMediaFile(id: string, options: {
    resize?: { width?: number; height?: number }
    optimize?: boolean
    format?: string
    quality?: number
    watermark?: string
  }): Promise<MediaFile> {
    const response = await this.client.post<MediaFile>(`/media/files/${id}/process`, options)
    return response.data! as MediaFile
  }

  /**
   * Download media file
   */
  async downloadMediaFile(id: string, format?: string): Promise<Blob> {
    const params = format ? { format } : {}
    const response = await this.client.get<Blob>(`/media/files/${id}/download`, params)
    return response.data! as Blob
  }

  /**
   * Get media analytics
   */
  async getMediaAnalytics(id: string): Promise<{
    downloads: number
    views: number
    shares: number
    usage: {
      posts: number
      pages: number
      other: number
    }
  }> {
    const response = await this.client.get<{
      downloads: number
      views: number
      shares: number
      usage: {
        posts: number
        pages: number
        other: number
      }
    }>(`/media/files/${id}/analytics`)
    return response.data! as {
      downloads: number
      views: number
      shares: number
      usage: {
        posts: number
        pages: number
        other: number
      }
    }
  }

  /**
   * Get media usage (where file is used)
   */
  async getMediaUsage(id: string): Promise<{
    posts: Array<{ id: string; title: string; url: string }>
    pages: Array<{ id: string; title: string; url: string }>
    other: Array<{ type: string; id: string; title: string; url: string }>
  }> {
    const response = await this.client.get<{
      posts: Array<{ id: string; title: string; url: string }>
      pages: Array<{ id: string; title: string; url: string }>
      other: Array<{ type: string; id: string; title: string; url: string }>
    }>(`/media/files/${id}/usage`)
    return response.data! as {
      posts: Array<{ id: string; title: string; url: string }>
      pages: Array<{ id: string; title: string; url: string }>
      other: Array<{ type: string; id: string; title: string; url: string }>
    }
  }

  /**
   * Get media statistics
   */
  async getMediaStats(): Promise<{
    totalFiles: number
    totalSize: number
    byType: Record<string, { count: number; size: number }>
    byStatus: Record<string, number>
    recentUploads: number
    popularFiles: MediaFile[]
  }> {
    const response = await this.client.get<{
      totalFiles: number
      totalSize: number
      byType: Record<string, { count: number; size: number }>
      byStatus: Record<string, number>
      recentUploads: number
      popularFiles: MediaFile[]
    }>('/media/stats')
    return response.data! as {
      totalFiles: number
      totalSize: number
      byType: Record<string, { count: number; size: number }>
      byStatus: Record<string, number>
      recentUploads: number
      popularFiles: MediaFile[]
    }
  }

  /**
   * Get public media files
   */
  async getPublicMediaFiles(params?: {
    query?: string
    type?: string
    tags?: string[]
    page?: number
    limit?: number
  }): Promise<{
    files: MediaFile[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    const response = await this.client.get<{
      files: MediaFile[]
      total: number
      page: number
      limit: number
      totalPages: number
    }>('/media/public', params)
    return response.data! as {
      files: MediaFile[]
      total: number
      page: number
      limit: number
      totalPages: number
    }
  }
}

// Default media API instance
export const mediaAPI = new MediaAPI(apiClient)
