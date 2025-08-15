'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MoreHorizontal, Search, Plus, Eye, Edit, Download, Trash2, Image, Video, Music, FileText, Archive } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MediaCard } from './MediaCard'

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

interface MediaTableProps {
  media: MediaFile[]
  onEdit?: (mediaId: string) => void
  onDelete?: (mediaId: string) => void
  onView?: (mediaId: string) => void
  onDownload?: (mediaId: string) => void
  onPreview?: (mediaId: string) => void
  onUpload?: () => void
  className?: string
}

export function MediaTable({ media, onEdit, onDelete, onView, onDownload, onPreview, onUpload, className }: MediaTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [folderFilter, setFolderFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')

  const getFileTypeIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="h-4 w-4" />
    if (mimeType.startsWith('video/')) return <Video className="h-4 w-4" />
    if (mimeType.startsWith('audio/')) return <Music className="h-4 w-4" />
    if (mimeType.includes('pdf') || mimeType.includes('document')) return <FileText className="h-4 w-4" />
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('archive')) return <Archive className="h-4 w-4" />
    return <FileText className="h-4 w-4" />
  }

  const getFileTypeName = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return 'Image'
    if (mimeType.startsWith('video/')) return 'Video'
    if (mimeType.startsWith('audio/')) return 'Audio'
    if (mimeType.includes('pdf') || mimeType.includes('document')) return 'Document'
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('archive')) return 'Archive'
    return 'File'
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



  const filteredMedia = media.filter(file => {
    const matchesSearch = (file.title || file.originalName).toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (file.author?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || getFileTypeName(file.mimeType) === typeFilter
    const matchesStatus = statusFilter === 'all' || file.processing.status === statusFilter
    const matchesFolder = folderFilter === 'all' || file.folder.name === folderFilter
    
    return matchesSearch && matchesType && matchesStatus && matchesFolder
  })

  // Get unique folders for filter
  const folders = Array.from(new Set(media.map(file => file.folder.name)))

  if (viewMode === 'cards') {
    return (
      <div className={className}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Image">Images</SelectItem>
                <SelectItem value="Video">Videos</SelectItem>
                <SelectItem value="Audio">Audio</SelectItem>
                <SelectItem value="Document">Documents</SelectItem>
                <SelectItem value="Archive">Archives</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Ready</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={folderFilter} onValueChange={setFolderFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Folders</SelectItem>
                {folders.map((folder) => (
                  <SelectItem key={folder} value={folder}>
                    {folder}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={() => setViewMode('table')}>
              Table View
            </Button>
            
            {onUpload && (
              <Button onClick={onUpload}>
                <Plus className="h-4 w-4 mr-2" />
                Upload Media
              </Button>
            )}
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMedia.map((file) => (
            <MediaCard
              key={file.id}
              media={file}
              onEdit={onEdit}
              onDelete={onDelete}
              onView={onView}
              onDownload={onDownload}
              onPreview={onPreview}
            />
          ))}
        </div>

        {filteredMedia.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No media files found matching your criteria.
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Image">Images</SelectItem>
              <SelectItem value="Video">Videos</SelectItem>
              <SelectItem value="Audio">Audio</SelectItem>
              <SelectItem value="Document">Documents</SelectItem>
              <SelectItem value="Archive">Archives</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Ready</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={folderFilter} onValueChange={setFolderFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Folder" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Folders</SelectItem>
              {folders.map((folder) => (
                <SelectItem key={folder} value={folder}>
                  {folder}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={() => setViewMode('cards')}>
            Card View
          </Button>
          
          {onUpload && (
            <Button onClick={onUpload}>
              <Plus className="h-4 w-4 mr-2" />
              Upload Media
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Folder</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead>Downloads</TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMedia.map((file) => (
              <TableRow key={file.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded overflow-hidden bg-muted flex items-center justify-center">
                      {file.thumbnailUrl ? (
                        <img 
                          src={file.thumbnailUrl} 
                          alt={file.alt}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        getFileTypeIcon(file.mimeType)
                      )}
                    </div>
                    <div>
                      <div className="font-medium truncate max-w-[200px]">{file.title || file.originalName}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {file.description || 'No description'}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {getFileTypeIcon(file.mimeType)}
                    <span className="ml-1">{getFileTypeName(file.mimeType)}</span>
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatFileSize(file.size)}
                </TableCell>
                <TableCell>
                  {getProcessingStatusBadge(file.processing.status)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {file.folder.name}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(file.uploadedAt)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {file.downloadCount.toLocaleString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onPreview && (
                        <DropdownMenuItem onClick={() => onPreview(file.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                      )}
                      {onView && (
                        <DropdownMenuItem onClick={() => onView(file.id)}>
                          View Details
                        </DropdownMenuItem>
                      )}
                      {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(file.id)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Media
                        </DropdownMenuItem>
                      )}
                      {onDownload && (
                        <DropdownMenuItem onClick={() => onDownload(file.id)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <DropdownMenuItem 
                          onClick={() => onDelete(file.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Media
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredMedia.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No media files found matching your criteria.
        </div>
      )}
    </div>
  )
}
