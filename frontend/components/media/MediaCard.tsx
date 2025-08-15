'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MoreHorizontal, Download, Eye, Edit, Calendar, Tag, Folder, FileText, Image, Video, Music, Archive } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/cn'

interface MediaFile {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  width?: number
  height?: number
  duration?: number
  url: string
  thumbnailUrl?: string
  alt: string
  title: string
  description: string
  caption: string
  folder: {
    id: string
    name: string
    path: string
  }
  tags: Array<{ id: string; name: string }>
  author: {
    id: string
    name: string
    avatar?: string
  }
  uploadedAt: string
  lastModified: string
  downloadCount: number
  isPublic: boolean
  processing: {
    status: 'pending' | 'processing' | 'completed' | 'failed'
    thumbnails: Array<{
      size: string
      url: string
      width: number
      height: number
      format: 'jpeg' | 'webp' | 'png'
    }>
    optimized: boolean
    cdnSynced: boolean
  }
}

interface MediaCardProps {
  media: MediaFile
  onEdit?: (mediaId: string) => void
  onDelete?: (mediaId: string) => void
  onView?: (mediaId: string) => void
  onDownload?: (mediaId: string) => void
  onPreview?: (mediaId: string) => void
  className?: string
}

export function MediaCard({ media, onEdit, onDelete, onView, onDownload, onPreview, className }: MediaCardProps) {
  const getFileTypeIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="h-4 w-4" />
    if (mimeType.startsWith('video/')) return <Video className="h-4 w-4" />
    if (mimeType.startsWith('audio/')) return <Music className="h-4 w-4" />
    if (mimeType.includes('pdf') || mimeType.includes('document')) return <FileText className="h-4 w-4" />
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('archive')) return <Archive className="h-4 w-4" />
    return <FileText className="h-4 w-4" />
  }

  const getProcessingStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="text-xs">Ready</Badge>
      case 'processing':
        return <Badge variant="secondary" className="text-xs">Processing</Badge>
      case 'pending':
        return <Badge variant="outline" className="text-xs">Pending</Badge>
      case 'failed':
        return <Badge variant="destructive" className="text-xs">Failed</Badge>
      default:
        return <Badge variant="outline" className="text-xs">Unknown</Badge>
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const isImage = media.mimeType.startsWith('image/')
  const isVideo = media.mimeType.startsWith('video/')
  const isAudio = media.mimeType.startsWith('audio/')

  return (
    <Card className={cn('transition-all duration-200 hover:shadow-md group', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-3">
          {/* Thumbnail */}
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
            {isImage && media.thumbnailUrl ? (
              <img 
                src={media.thumbnailUrl} 
                alt={media.alt}
                className="w-full h-full object-cover"
              />
            ) : isVideo ? (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Video className="h-6 w-6 text-white" />
              </div>
            ) : isAudio ? (
              <div className="w-full h-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
                <Music className="h-6 w-6 text-white" />
              </div>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center">
                {getFileTypeIcon(media.mimeType)}
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-semibold truncate">{media.title || media.originalName}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              {getProcessingStatusBadge(media.processing.status)}
              <Badge variant="outline" className="text-xs">
                <Folder className="h-3 w-3 mr-1" />
                {media.folder.name}
              </Badge>
            </div>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onPreview && (
              <DropdownMenuItem onClick={() => onPreview(media.id)}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </DropdownMenuItem>
            )}
            {onView && (
              <DropdownMenuItem onClick={() => onView(media.id)}>
                View Details
              </DropdownMenuItem>
            )}
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(media.id)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Media
              </DropdownMenuItem>
            )}
            {onDownload && (
              <DropdownMenuItem onClick={() => onDownload(media.id)}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem 
                onClick={() => onDelete(media.id)}
                className="text-red-600"
              >
                Delete Media
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {/* File Info */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Size: {formatFileSize(media.size)}</span>
              <span>Downloads: {media.downloadCount}</span>
            </div>
            
            {media.width && media.height && (
              <div className="text-xs text-muted-foreground">
                Dimensions: {media.width} × {media.height}
              </div>
            )}
            
            {media.duration && (
              <div className="text-xs text-muted-foreground">
                Duration: {Math.floor(media.duration / 60)}:{(media.duration % 60).toString().padStart(2, '0')}
              </div>
            )}
          </div>
          
          {/* Author and Date */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5">
                <AvatarImage src={media.author?.avatar} alt={media.author?.name || 'Unknown'} />
                <AvatarFallback className="text-xs">{getInitials(media.author?.name || 'Unknown')}</AvatarFallback>
              </Avatar>
              <span>{media.author?.name || 'Unknown'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(media.uploadedAt)}</span>
            </div>
          </div>
          
          {/* Tags */}
          {media.tags.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              <Tag className="h-3 w-3 text-muted-foreground" />
              {media.tags.slice(0, 3).map((tag) => (
                <Badge key={tag.id} variant="outline" className="text-xs">
                  {tag.name}
                </Badge>
              ))}
              {media.tags.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{media.tags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
