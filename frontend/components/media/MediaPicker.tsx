'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, 
  Image, 
  Video, 
  Music, 
  File, 
  Check, 
  X,
  FolderOpen,
  Grid,
  List,



} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { MediaUpload } from './MediaUpload'
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

interface MediaPickerProps {
  onSelect?: (media: MediaFile[]) => void
  onClose?: () => void
  multiple?: boolean
  allowedTypes?: string[]
  maxSelection?: number
  className?: string
}

export function MediaPicker({ 
  onSelect, 
  onClose, 
  multiple = false,
  allowedTypes = ['image/*', 'video/*', 'audio/*'],
  maxSelection = 10,
  className 
}: MediaPickerProps) {
  const [selectedMedia, setSelectedMedia] = useState<MediaFile[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [folderFilter, setFolderFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library')

  // Mock media data
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([
    {
      id: '1',
      filename: 'hero-image.jpg',
      originalName: 'hero-image.jpg',
      mimeType: 'image/jpeg',
      size: 2048576,
      width: 1920,
      height: 1080,
      url: 'https://via.placeholder.com/1920x1080',
      thumbnailUrl: 'https://via.placeholder.com/300x200',
      alt: 'Hero image',
      title: 'Hero Image',
      description: 'Main hero image for website',
      caption: 'Beautiful hero image',
      folder: {
        id: '1',
        name: 'Hero Images',
        path: '/hero-images'
      },
      tags: [
        { id: '1', name: 'hero' },
        { id: '2', name: 'banner' }
      ],
      author: {
        id: '1',
        name: 'John Doe',
        avatar: 'https://via.placeholder.com/40x40'
      },
      uploadedAt: '2024-01-15T10:30:00Z',
      lastModified: '2024-01-15T10:30:00Z',
      downloadCount: 15,
      isPublic: true,
      processing: {
        status: 'completed',
        thumbnails: [
          {
            size: 'small',
            url: 'https://via.placeholder.com/150x100',
            width: 150,
            height: 100,
            format: 'jpeg'
          },
          {
            size: 'medium',
            url: 'https://via.placeholder.com/300x200',
            width: 300,
            height: 200,
            format: 'jpeg'
          }
        ],
        optimized: true,
        cdnSynced: true
      }
    },
    {
      id: '2',
      filename: 'product-video.mp4',
      originalName: 'product-video.mp4',
      mimeType: 'video/mp4',
      size: 15728640,
      width: 1920,
      height: 1080,
      duration: 120,
      url: 'https://via.placeholder.com/1920x1080',
      thumbnailUrl: 'https://via.placeholder.com/300x200',
      alt: 'Product video',
      title: 'Product Video',
      description: 'Product demonstration video',
      caption: 'Watch our product in action',
      folder: {
        id: '2',
        name: 'Videos',
        path: '/videos'
      },
      tags: [
        { id: '3', name: 'product' },
        { id: '4', name: 'demo' }
      ],
      author: {
        id: '1',
        name: 'John Doe',
        avatar: 'https://via.placeholder.com/40x40'
      },
      uploadedAt: '2024-01-14T15:45:00Z',
      lastModified: '2024-01-14T15:45:00Z',
      downloadCount: 8,
      isPublic: true,
      processing: {
        status: 'completed',
        thumbnails: [
          {
            size: 'small',
            url: 'https://via.placeholder.com/150x100',
            width: 150,
            height: 100,
            format: 'jpeg'
          }
        ],
        optimized: true,
        cdnSynced: true
      }
    }
  ])

  const filteredMedia = mediaFiles.filter(media => {
    const matchesSearch = media.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         media.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         media.originalName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || 
                       (typeFilter === 'image' && media.mimeType.startsWith('image/')) ||
                       (typeFilter === 'video' && media.mimeType.startsWith('video/')) ||
                       (typeFilter === 'audio' && media.mimeType.startsWith('audio/'))
    const matchesFolder = folderFilter === 'all' || media.folder.id === folderFilter
    
    return matchesSearch && matchesType && matchesFolder
  })

  const handleMediaSelect = (media: MediaFile) => {
    if (multiple) {
      const isSelected = selectedMedia.some(m => m.id === media.id)
      if (isSelected) {
        setSelectedMedia(prev => prev.filter(m => m.id !== media.id))
      } else {
        if (selectedMedia.length < maxSelection) {
          setSelectedMedia(prev => [...prev, media])
        }
      }
    } else {
      setSelectedMedia([media])
    }
  }

  const handleConfirmSelection = () => {
    onSelect?.(selectedMedia)
    onClose?.()
  }

  const handleUploadComplete = async (uploadedFiles: any[]) => {
    // Add uploaded files to media library
    const newMediaFiles = uploadedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      filename: file.name,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      url: URL.createObjectURL(file.file),
      thumbnailUrl: file.type.startsWith('image/') ? URL.createObjectURL(file.file) : undefined,
      alt: file.name,
      title: file.name,
      description: '',
      caption: '',
      folder: {
        id: '1',
        name: 'Uploads',
        path: '/uploads'
      },
      tags: [],
      author: {
        id: '1',
        name: 'Current User',
        avatar: undefined
      },
      uploadedAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      downloadCount: 0,
      isPublic: true,
      processing: {
        status: 'completed' as const,
        thumbnails: [],
        optimized: false,
        cdnSynced: false
      }
    }))

    setMediaFiles(prev => [...newMediaFiles, ...prev])
    setActiveTab('library')
  }

  const getTypeIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="h-4 w-4" />
    if (mimeType.startsWith('video/')) return <Video className="h-4 w-4" />
    if (mimeType.startsWith('audio/')) return <Music className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Card className={cn('w-full max-w-6xl', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Media Picker
            {selectedMedia.length > 0 && (
              <Badge variant="secondary">{selectedMedia.length} selected</Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
            )}
            {selectedMedia.length > 0 && (
              <Button onClick={handleConfirmSelection}>
                <Check className="h-4 w-4 mr-2" />
                Select {selectedMedia.length} {selectedMedia.length === 1 ? 'Item' : 'Items'}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'library' | 'upload')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="library">Media Library</TabsTrigger>
            <TabsTrigger value="upload">Upload New</TabsTrigger>
          </TabsList>
          
          <TabsContent value="library" className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search media..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="image">Images</SelectItem>
                    <SelectItem value="video">Videos</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={folderFilter} onValueChange={setFolderFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Folder" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Folders</SelectItem>
                    <SelectItem value="1">Hero Images</SelectItem>
                    <SelectItem value="2">Videos</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  variant="outline"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                >
                  {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Media Grid/List */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredMedia.map((media) => {
                  const isSelected = selectedMedia.some(m => m.id === media.id)
                  return (
                    <div
                      key={media.id}
                      className={cn(
                        'relative group cursor-pointer border rounded-lg overflow-hidden transition-all',
                        isSelected 
                          ? 'ring-2 ring-primary border-primary' 
                          : 'hover:border-primary/50'
                      )}
                      onClick={() => handleMediaSelect(media)}
                    >
                      {/* Thumbnail */}
                      <div className="aspect-video bg-muted relative">
                        {media.thumbnailUrl ? (
                          <img
                            src={media.thumbnailUrl}
                            alt={media.alt}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {getTypeIcon(media.mimeType)}
                          </div>
                        )}
                        
                        {/* Selection Overlay */}
                        {isSelected && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                            <div className="bg-primary text-primary-foreground rounded-full p-1">
                              <Check className="h-4 w-4" />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Info */}
                      <div className="p-3">
                        <h4 className="font-medium text-sm truncate">{media.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(media.size)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredMedia.map((media) => {
                  const isSelected = selectedMedia.some(m => m.id === media.id)
                  return (
                    <div
                      key={media.id}
                      className={cn(
                        'flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all',
                        isSelected 
                          ? 'bg-primary/5 border-primary' 
                          : 'hover:bg-muted/50'
                      )}
                      onClick={() => handleMediaSelect(media)}
                    >
                      {/* Thumbnail */}
                      <div className="w-16 h-12 bg-muted rounded overflow-hidden flex-shrink-0">
                        {media.thumbnailUrl ? (
                          <img
                            src={media.thumbnailUrl}
                            alt={media.alt}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {getTypeIcon(media.mimeType)}
                          </div>
                        )}
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{media.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(media.size)} • {media.folder.name}
                        </p>
                      </div>
                      
                      {/* Selection */}
                      {isSelected && (
                        <div className="bg-primary text-primary-foreground rounded-full p-1">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {filteredMedia.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No media files found matching your criteria.
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="upload" className="space-y-4">
            <MediaUpload
              onUpload={handleUploadComplete}
              allowedTypes={allowedTypes}
              maxFiles={maxSelection}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
