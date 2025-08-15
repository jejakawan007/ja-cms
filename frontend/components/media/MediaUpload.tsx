'use client'

import { useState, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'


import { 
  Upload, 
  X, 
  File, 
  Image, 
  Video, 
  Music, 
  Archive, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Pause, 
  Play,
  FolderOpen,



  Eye
} from 'lucide-react'
import { useMedia } from '@/hooks/useMedia'
import { cn } from '@/lib/cn'

interface UploadFile {
  id: string
  file: File
  name: string
  size: number
  type: string
  status: 'queued' | 'uploading' | 'processing' | 'completed' | 'failed' | 'cancelled'
  progress: number
  uploadedBytes: number
  totalBytes: number
  speed: number
  timeRemaining: number
  error?: string
  metadata: {
    width?: number
    height?: number
    duration?: number
    thumbnail?: string
  }
  retries?: number
}

interface MediaUploadProps {
  onUpload?: (files: UploadFile[]) => Promise<void>
  onCancel?: (fileId: string) => void
  onRetry?: (fileId: string) => void
  maxFileSize?: number // bytes
  maxFiles?: number
  allowedTypes?: string[]
  className?: string
}

export function MediaUpload({ 
  onUpload, 
  onCancel, 
  onRetry,
  maxFileSize = 100 * 1024 * 1024, // 100MB
  maxFiles = 10,
  allowedTypes = ['image/*', 'video/*', 'audio/*', 'application/pdf'],
  className 
}: MediaUploadProps) {
  // Media API integration
  const { uploadFile, uploadFiles: apiUploadFiles } = useMedia({ autoLoad: false })
  
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadFolder, setUploadFolder] = useState('')
  const [uploadTags, setUploadTags] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.round(seconds % 60)
    return `${minutes}m ${remainingSeconds}s`
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />
    if (type.startsWith('video/')) return <Video className="h-4 w-4" />
    if (type.startsWith('audio/')) return <Music className="h-4 w-4" />
    if (type.includes('pdf')) return <FileText className="h-4 w-4" />
    if (type.includes('zip') || type.includes('rar')) return <Archive className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'uploading':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
      case 'processing':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500" />
      case 'cancelled':
        return <X className="h-4 w-4 text-gray-500" />
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-300" />
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default' as const
      case 'failed':
        return 'destructive' as const
      case 'uploading':
        return 'secondary' as const
      case 'processing':
        return 'outline' as const
      case 'cancelled':
        return 'outline' as const
      default:
        return 'outline' as const
    }
  }

  const validateFile = (file: File): { valid: boolean; errors: string[] } => {
    const errors: string[] = []

    // Check file size
    if (file.size > maxFileSize) {
      errors.push(`File size exceeds ${formatFileSize(maxFileSize)} limit`)
    }

    // Check file type
    const isAllowed = allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1))
      }
      return file.type === type
    })
    
    if (!isAllowed) {
      errors.push('File type not allowed')
    }

    // Check if file already exists
    const exists = uploadFiles.some(f => f.name === file.name)
    if (exists) {
      errors.push('File already selected')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  const addFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files)
    const newUploadFiles: UploadFile[] = []

    for (const file of fileArray) {
      const validation = validateFile(file)
      if (!validation.valid) {
        console.warn(`File ${file.name} rejected:`, validation.errors)
        continue
      }

      const uploadFile: UploadFile = {
        id: Math.random().toString(36).substr(2, 9),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'queued',
        progress: 0,
        uploadedBytes: 0,
        totalBytes: file.size,
        speed: 0,
        timeRemaining: 0,
        metadata: {}
      }

      newUploadFiles.push(uploadFile)
    }

    setUploadFiles(prev => [...prev, ...newUploadFiles])
  }, [uploadFiles, maxFileSize, allowedTypes, validateFile])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      addFiles(files)
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
    
    const files = event.dataTransfer.files
    if (files) {
      addFiles(files)
    }
  }, [addFiles])

  const removeFile = (fileId: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const startUpload = async () => {
    if (uploadFiles.length === 0) return

    setIsUploading(true)
    const filesToUpload = uploadFiles.filter(f => f.status === 'queued')

    try {
      // Use API to upload files
      const files = filesToUpload.map(f => f.file)
      const options = {
        folder: uploadFolder || undefined,
        tags: uploadTags ? uploadTags.split(',').map(t => t.trim()) : undefined
      }

      if (files.length === 1) {
        // Single file upload
        const singleFile = files[0]
        if (singleFile) {
          await uploadFile(singleFile, options)
          
          // Update status to completed
          const firstFileToUpload = filesToUpload[0]
          if (firstFileToUpload) {
            setUploadFiles(prev => prev.map(f => 
              f.id === firstFileToUpload.id ? { ...f, status: 'completed', progress: 100 } : f
            ))

            // Call onUpload callback
            if (onUpload) {
              await onUpload([firstFileToUpload])
            }
          }
        }
      } else {
        // Multiple files upload
        const uploadedFiles = await apiUploadFiles(files, options)
        
        // Update status to completed for all files
        setUploadFiles(prev => prev.map(f => {
          const uploadedFile = uploadedFiles.find(uf => uf.originalName === f.name)
          if (uploadedFile) {
            return { ...f, status: 'completed', progress: 100 }
          }
          return f
        }))

        // Call onUpload callback
        if (onUpload) {
          await onUpload(filesToUpload)
        }
      }

    } catch (error) {
      // Update status to failed for all files
      setUploadFiles(prev => prev.map(f => 
        filesToUpload.some(uf => uf.id === f.id) ? { 
          ...f, 
          status: 'failed', 
          error: error instanceof Error ? error.message : 'Upload failed' 
        } : f
      ))
    }

    setIsUploading(false)
  }

  const cancelUpload = (fileId: string) => {
    setUploadFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, status: 'cancelled' } : f
    ))
    onCancel?.(fileId)
  }

  const retryUpload = (fileId: string) => {
    setUploadFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, status: 'queued', progress: 0, error: undefined } : f
    ))
    onRetry?.(fileId)
  }

  const queuedFiles = uploadFiles.filter(f => f.status === 'queued')
  const uploadingFiles = uploadFiles.filter(f => f.status === 'uploading')
  const completedFiles = uploadFiles.filter(f => f.status === 'completed')
  const failedFiles = uploadFiles.filter(f => f.status === 'failed')

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Media Upload
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Upload Zone */}
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
            isDragOver 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">
            {isDragOver ? 'Drop files here' : 'Drag & drop files here'}
          </h3>
          <p className="text-muted-foreground mb-4">
            or click to browse files
          </p>
          <Button onClick={() => fileInputRef.current?.click()}>
            <FolderOpen className="h-4 w-4 mr-2" />
            Select Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={allowedTypes.join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <div className="mt-4 text-sm text-muted-foreground">
            <p>Max file size: {formatFileSize(maxFileSize)}</p>
            <p>Max files: {maxFiles}</p>
          </div>
        </div>

        {/* Upload Settings */}
        {(queuedFiles.length > 0 || uploadingFiles.length > 0) && (
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium">Upload Settings</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="folder">Folder</Label>
                <Input
                  id="folder"
                  value={uploadFolder}
                  onChange={(e) => setUploadFolder(e.target.value)}
                  placeholder="Enter folder name (optional)"
                />
              </div>
              <div>
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={uploadTags}
                  onChange={(e) => setUploadTags(e.target.value)}
                  placeholder="Enter tags separated by commas"
                />
              </div>
            </div>
          </div>
        )}

        {/* File List */}
        {uploadFiles.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Files ({uploadFiles.length})</h4>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{queuedFiles.length} queued</Badge>
                <Badge variant="secondary">{uploadingFiles.length} uploading</Badge>
                <Badge variant="default">{completedFiles.length} completed</Badge>
                {failedFiles.length > 0 && (
                  <Badge variant="destructive">{failedFiles.length} failed</Badge>
                )}
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {uploadFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-3 border rounded-lg bg-background"
                >
                  {/* File Icon */}
                  <div className="flex-shrink-0">
                    {getFileIcon(file.type)}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium truncate">{file.name}</span>
                      {getStatusIcon(file.status)}
                      <Badge variant={getStatusBadgeVariant(file.status)} className="text-xs">
                        {file.status}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      {formatFileSize(file.size)}
                      {file.speed > 0 && (
                        <span> • {formatFileSize(file.speed)}/s</span>
                      )}
                      {file.timeRemaining > 0 && (
                        <span> • {formatTime(file.timeRemaining)} remaining</span>
                      )}
                    </div>

                    {/* Progress Bar */}
                    {file.status === 'uploading' && (
                      <Progress value={file.progress} className="mt-2" />
                    )}

                    {/* Error Message */}
                    {file.error && (
                      <p className="text-sm text-red-500 mt-1">{file.error}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {file.status === 'queued' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {file.status === 'uploading' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => cancelUpload(file.id)}
                      >
                        <Pause className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {file.status === 'failed' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => retryUpload(file.id)}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {file.status === 'completed' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Actions */}
        {queuedFiles.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {queuedFiles.length} files ready to upload
            </div>
            <Button
              onClick={startUpload}
              disabled={isUploading}
              className="min-w-[120px]"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload All
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
