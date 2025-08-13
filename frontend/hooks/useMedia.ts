import { useState, useEffect, useCallback, useRef } from 'react'
import { mediaAPI, MediaFile, MediaFolder, UploadConfig, UploadProgress, MediaSearchParams } from '@/lib/api/media'

interface UseMediaOptions {
  folder?: string
  autoLoad?: boolean
  page?: number
  limit?: number
}

interface UseMediaReturn {
  // Data
  files: MediaFile[]
  folders: MediaFolder[]
  config: UploadConfig | null
  isLoading: boolean
  error: string | null
  
  // Pagination
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
  
  // Actions
  loadFiles: (params?: MediaSearchParams) => Promise<void>
  loadFolders: () => Promise<void>
  loadConfig: () => Promise<void>
  uploadFile: (file: File, options?: any) => Promise<MediaFile>
  uploadFiles: (files: File[], options?: any) => Promise<MediaFile[]>
  updateFile: (id: string, data: any) => Promise<MediaFile>
  deleteFile: (id: string) => Promise<void>
  createFolder: (name: string, parentId?: string) => Promise<MediaFolder>
  updateFolder: (id: string, data: any) => Promise<MediaFolder>
  deleteFolder: (id: string, moveFilesTo?: string) => Promise<void>
  
  // Upload progress
  uploadProgress: UploadProgress[]
  cancelUpload: (uploadId: string) => Promise<void>
  retryUpload: (uploadId: string, fileId: string) => Promise<MediaFile>
  
  // Navigation
  goToPage: (page: number) => void
  goToNextPage: () => void
  goToPrevPage: () => void
  setLimit: (limit: number) => void
}

export function useMedia(options: UseMediaOptions = {}): UseMediaReturn {
  const { folder, autoLoad = true, page: initialPage = 1, limit: initialLimit = 20 } = options
  
  const [files, setFiles] = useState<MediaFile[]>([])
  const [folders, setFolders] = useState<MediaFolder[]>([])
  const [config, setConfig] = useState<UploadConfig | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([])
  
  // Pagination state
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(initialPage)
  const [limit, setLimitState] = useState(initialLimit)
  const [totalPages, setTotalPages] = useState(0)
  
  const uploadTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load files
  const loadFiles = useCallback(async (params?: MediaSearchParams) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const searchParams: MediaSearchParams = {
        page,
        limit,
        folder,
        ...params
      }
      
      const result = await mediaAPI.searchMediaFiles(searchParams)
      setFiles(result.files)
      setTotal(result.total)
      setTotalPages(result.totalPages)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load files')
    } finally {
      setIsLoading(false)
    }
  }, [page, limit, folder])

  // Load folders
  const loadFolders = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const data = await mediaAPI.getMediaFolders()
      setFolders(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load folders')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load config
  const loadConfig = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const data = await mediaAPI.getUploadConfig()
      setConfig(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load upload config')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Upload file
  const uploadFile = useCallback(async (file: File, options?: any): Promise<MediaFile> => {
    setIsLoading(true)
    setError(null)
    
    try {
      const uploadedFile = await mediaAPI.uploadFile(file, options)
      
      // Add to files list
      setFiles(prev => [uploadedFile, ...prev])
      
      return uploadedFile
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Upload files
  const uploadFiles = useCallback(async (files: File[], options?: any): Promise<MediaFile[]> => {
    setIsLoading(true)
    setError(null)
    
    try {
      const uploadedFiles = await mediaAPI.uploadFiles(files, options)
      
      // Add to files list
      setFiles(prev => [...uploadedFiles, ...prev])
      
      return uploadedFiles
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload files')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Update file
  const updateFile = useCallback(async (id: string, data: any): Promise<MediaFile> => {
    setIsLoading(true)
    setError(null)
    
    try {
      const updatedFile = await mediaAPI.updateMediaFile(id, data)
      
      // Update in files list
      setFiles(prev => prev.map(file => 
        file.id === id ? updatedFile : file
      ))
      
      return updatedFile
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update file')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Delete file
  const deleteFile = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      await mediaAPI.deleteMediaFile(id)
      
      // Remove from files list
      setFiles(prev => prev.filter(file => file.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete file')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Create folder
  const createFolder = useCallback(async (name: string, parentId?: string): Promise<MediaFolder> => {
    setIsLoading(true)
    setError(null)
    
    try {
      const newFolder = await mediaAPI.createMediaFolder(name, parentId)
      
      // Add to folders list
      setFolders(prev => [...prev, newFolder])
      
      return newFolder
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create folder')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Update folder
  const updateFolder = useCallback(async (id: string, data: any): Promise<MediaFolder> => {
    setIsLoading(true)
    setError(null)
    
    try {
      const updatedFolder = await mediaAPI.updateMediaFolder(id, data)
      
      // Update in folders list
      setFolders(prev => prev.map(folder => 
        folder.id === id ? updatedFolder : folder
      ))
      
      return updatedFolder
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update folder')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Delete folder
  const deleteFolder = useCallback(async (id: string, moveFilesTo?: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      await mediaAPI.deleteMediaFolder(id, moveFilesTo)
      
      // Remove from folders list
      setFolders(prev => prev.filter(folder => folder.id !== id))
      
      // Reload files if current folder was deleted
      if (folder === id) {
        await loadFiles()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete folder')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [folder, loadFiles])

  // Cancel upload
  const cancelUpload = useCallback(async (uploadId: string) => {
    try {
      await mediaAPI.cancelUpload(uploadId)
      
      // Remove from progress
      setUploadProgress(prev => prev.filter(progress => progress.fileId !== uploadId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel upload')
      throw err
    }
  }, [])

  // Retry upload
  const retryUpload = useCallback(async (uploadId: string, fileId: string): Promise<MediaFile> => {
    try {
      const retriedFile = await mediaAPI.retryUpload(uploadId, fileId)
      
      // Update in files list
      setFiles(prev => prev.map(file => 
        file.id === fileId ? retriedFile : file
      ))
      
      return retriedFile
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retry upload')
      throw err
    }
  }, [])

  // Navigation
  const goToPage = useCallback((newPage: number) => {
    setPage(newPage)
  }, [])

  const hasNext = page < totalPages
  const hasPrev = page > 1

  const goToNextPage = useCallback(() => {
    if (hasNext) {
      setPage(prev => prev + 1)
    }
  }, [hasNext])

  const goToPrevPage = useCallback(() => {
    if (hasPrev) {
      setPage(prev => prev - 1)
    }
  }, [hasPrev])

  const setLimit = useCallback((newLimit: number) => {
    setLimitState(newLimit)
    setPage(1) // Reset to first page when changing limit
  }, [])

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad) {
      loadFiles()
      loadFolders()
      loadConfig()
    }
  }, [autoLoad, loadFiles, loadFolders, loadConfig])

  // Reload when pagination changes
  useEffect(() => {
    if (autoLoad) {
      loadFiles()
    }
  }, [page, limit, folder, autoLoad, loadFiles])

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (uploadTimeoutRef.current) {
        clearTimeout(uploadTimeoutRef.current)
      }
    }
  }, [])

  return {
    // Data
    files,
    folders,
    config,
    isLoading,
    error,
    
    // Pagination
    total,
    page,
    limit,
    totalPages,
    hasNext,
    hasPrev,
    
    // Actions
    loadFiles,
    loadFolders,
    loadConfig,
    uploadFile,
    uploadFiles,
    updateFile,
    deleteFile,
    createFolder,
    updateFolder,
    deleteFolder,
    
    // Upload progress
    uploadProgress,
    cancelUpload,
    retryUpload,
    
    // Navigation
    goToPage,
    goToNextPage,
    goToPrevPage,
    setLimit
  }
}

// Hook for public media files
export function usePublicMedia() {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)

  const loadPublicFiles = useCallback(async (params?: {
    query?: string
    type?: string
    tags?: string[]
    page?: number
    limit?: number
  }) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await mediaAPI.getPublicMediaFiles({
        page,
        limit,
        ...params
      })
      setFiles(result.files)
      setTotal(result.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load public files')
    } finally {
      setIsLoading(false)
    }
  }, [page, limit])

  useEffect(() => {
    loadPublicFiles()
  }, [loadPublicFiles])

  return {
    files,
    isLoading,
    error,
    total,
    page,
    limit,
    loadPublicFiles,
    setPage,
    setLimit
  }
}
