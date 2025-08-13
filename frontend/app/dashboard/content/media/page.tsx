'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Grid3X3,
  List,
  Check,
  Image,
  File,
  Video,
  Music,
  Archive,
  Download,
  Trash2,
  Copy,
  MoreHorizontal,
  Upload,
  FolderPlus,
  ChevronRight,
  Folder,
  FolderOpen,
  Home,
  Sidebar
} from 'lucide-react';
import { MediaPicker } from '@/components/media/MediaPicker';
import { BulkOperations } from '@/components/media/BulkOperations';
import { MediaUpload } from '@/components/media/MediaUpload';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { cn } from '@/lib/cn';

interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  alt?: string;
  description?: string;
  uploadedBy: string;
  createdAt: string;
  folderId?: string;
  dimensions?: {
    width: number;
    height: number;
  };
}

interface MediaFolder {
  id: string;
  name: string;
  path: string;
  parentId?: string;
  fileCount: number;
  totalSize: number;
  createdAt: string;
  updatedAt: string;
  children?: MediaFolder[];
}

export default function MediaExplorerPage() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<MediaFile[]>([]);
  const [currentFolder, setCurrentFolder] = useState<MediaFolder | null>(null);
  const [folderPath, setFolderPath] = useState<MediaFolder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Load folders and media files
  useEffect(() => {
    loadFolders();
    loadMediaFiles();
  }, [currentFolder]);

  const loadFolders = async () => {
    try {
      // TODO: Replace with real API call
      const mockFolders: MediaFolder[] = [
        {
          id: '1',
          name: 'Hero Images',
          path: '/hero-images',
          fileCount: 24,
          totalSize: 156 * 1024 * 1024, // 156 MB
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
          children: [
            {
              id: '1-1',
              name: 'Landing Page',
              path: '/hero-images/landing-page',
              parentId: '1',
              fileCount: 8,
              totalSize: 45 * 1024 * 1024,
              createdAt: '2024-01-05T00:00:00Z',
              updatedAt: '2024-01-12T15:20:00Z'
            }
          ]
        },
        {
          id: '2',
          name: 'Product Photos',
          path: '/product-photos',
          fileCount: 156,
          totalSize: 2.1 * 1024 * 1024 * 1024, // 2.1 GB
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-14T16:45:00Z'
        },
        {
          id: '3',
          name: 'Documents',
          path: '/documents',
          fileCount: 89,
          totalSize: 234 * 1024 * 1024, // 234 MB
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-13T09:15:00Z'
        }
      ];

      setFolders(mockFolders);
    } catch (error) {
      console.error('Failed to load folders:', error);
    }
  };

  const loadMediaFiles = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with real API call - filter by currentFolder
      const mockFiles: MediaFile[] = [
        {
          id: '1',
          filename: 'hero-image-1.jpg',
          originalName: 'hero-image-1.jpg',
          mimeType: 'image/jpeg',
          size: 1024000,
          url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop',
          alt: 'Hero Image 1',
          description: 'Main hero image for homepage',
          uploadedBy: 'John Doe',
          createdAt: '2024-01-15T10:30:00Z',
          folderId: currentFolder?.id,
          dimensions: { width: 1920, height: 1080 }
        },
        {
          id: '2',
          filename: 'document.pdf',
          originalName: 'document.pdf',
          mimeType: 'application/pdf',
          size: 2048000,
          url: '/api/media/2',
          uploadedBy: 'Sarah Wilson',
          createdAt: '2024-01-14T14:20:00Z',
          folderId: currentFolder?.id
        },
        {
          id: '3',
          filename: 'video-demo.mp4',
          originalName: 'video-demo.mp4',
          mimeType: 'video/mp4',
          size: 15728640,
          url: '/api/media/3',
          description: 'Product demonstration video',
          uploadedBy: 'Mike Johnson',
          createdAt: '2024-01-13T16:45:00Z',
          folderId: currentFolder?.id
        }
      ];

      setMediaFiles(mockFiles);
    } catch (error) {
      console.error('Failed to load media files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFolderPath = (folder: MediaFolder | null) => {
    if (!folder) {
      setFolderPath([]);
      return;
    }
    
    const path: MediaFolder[] = [];
    let current: MediaFolder | null = folder;
    
    // Build path from root to current folder
    while (current) {
      path.unshift(current);
      const parent = folders.find(f => f.id === current!.parentId);
      current = parent || null;
    }
    
    setFolderPath(path);
  };

  const handleFolderSelect = (folder: MediaFolder) => {
    setCurrentFolder(folder);
    updateFolderPath(folder);
  };

  const handleBreadcrumbClick = (folder: MediaFolder) => {
    setCurrentFolder(folder);
    updateFolderPath(folder);
  };

  const handleFileSelect = (file: MediaFile) => {
    setSelectedFiles(prev => {
      const isSelected = prev.some(f => f.id === file.id);
      if (isSelected) {
        return prev.filter(f => f.id !== file.id);
      } else {
        return [...prev, file];
      }
    });
  };

  const handleBulkDelete = async (fileIds: string[]) => {
    console.log('Deleting files:', fileIds);
    setSelectedFiles([]);
    loadMediaFiles();
  };

  const handleBulkDownload = async (fileIds: string[]) => {
    console.log('Downloading files:', fileIds);
  };

  const handleBulkCopy = async (fileIds: string[]) => {
    console.log('Copying files:', fileIds);
  };

  const handleClearSelection = () => {
    setSelectedFiles([]);
  };

  const handleUploadComplete = (files: any[]) => {
    console.log('Upload completed:', files);
    setShowUploadDialog(false);
    loadMediaFiles();
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      // TODO: Replace with real API call
      console.log('Creating folder:', newFolderName, 'in:', currentFolder?.id);
      setNewFolderName('');
      setShowFolderDialog(false);
      loadFolders();
    } catch (error) {
      console.error('Failed to create folder:', error);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return Image;
    if (mimeType.startsWith('video/')) return Video;
    if (mimeType.startsWith('audio/')) return Music;
    if (mimeType.includes('pdf')) return File;
    if (mimeType.includes('zip') || mimeType.includes('rar')) return Archive;
    return File;
  };

  const getFileType = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return 'Image';
    if (mimeType.startsWith('video/')) return 'Video';
    if (mimeType.startsWith('audio/')) return 'Audio';
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.includes('document')) return 'Document';
    if (mimeType.includes('presentation')) return 'Presentation';
    if (mimeType.includes('spreadsheet')) return 'Spreadsheet';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return 'Archive';
    return 'File';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredFiles = mediaFiles.filter(file => {
    const matchesSearch = file.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (file.alt && file.alt.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'all' || getFileType(file.mimeType).toLowerCase() === selectedType.toLowerCase();
    return matchesSearch && matchesType;
  });

  const renderFolderTree = (folderList: MediaFolder[], level: number = 0) => {
    return folderList.map(folder => (
      <div key={folder.id} className="space-y-1">
        <div
          className={cn(
            "flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors text-sm",
            currentFolder?.id === folder.id 
              ? "bg-primary/10 text-primary" 
              : "hover:bg-muted/50"
          )}
          onClick={() => handleFolderSelect(folder)}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div style={{ marginLeft: `${level * 12}px` }} />
            {folder.children && folder.children.length > 0 ? (
              <FolderOpen className="h-4 w-4 flex-shrink-0" />
            ) : (
              <Folder className="h-4 w-4 flex-shrink-0" />
            )}
            <span className="truncate">{folder.name}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>{folder.fileCount}</span>
          </div>
        </div>
        
        {/* Render children */}
        {folder.children && folder.children.length > 0 && (
          <div className="ml-2">
            {renderFolderTree(folder.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  const renderGridView = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {filteredFiles.map((file) => {
        const Icon = getFileIcon(file.mimeType);
        const isImage = file.mimeType.startsWith('image/');
        const isSelected = selectedFiles.some(f => f.id === file.id);
        
        return (
          <Card 
            key={file.id} 
            className={cn(
              "group hover:shadow-lg transition-shadow cursor-pointer",
              isSelected && "ring-2 ring-primary"
            )}
            onClick={() => handleFileSelect(file)}
          >
            <CardContent className="p-4">
              <div className="aspect-square relative mb-3">
                {isImage ? (
                  <img
                    src={file.url}
                    alt={file.alt || file.originalName}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                    <Icon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                
                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                    <Check className="h-3 w-3" />
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-1">
                    <Button variant="secondary" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="secondary" size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="secondary" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium truncate" title={file.originalName}>
                  {file.originalName}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatFileSize(file.size)}</span>
                  <Badge variant="outline" className="text-xs">
                    {getFileType(file.mimeType)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-2">
      {filteredFiles.map((file) => {
        const Icon = getFileIcon(file.mimeType);
        const isImage = file.mimeType.startsWith('image/');
        const isSelected = selectedFiles.some(f => f.id === file.id);
        
        return (
          <Card 
            key={file.id} 
            className={cn(
              "hover:shadow-md transition-shadow cursor-pointer",
              isSelected && "ring-2 ring-primary"
            )}
            onClick={() => handleFileSelect(file)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex-shrink-0">
                  {isImage ? (
                    <img
                      src={file.url}
                      alt={file.alt || file.originalName}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted rounded flex items-center justify-center">
                      <Icon className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium truncate">{file.originalName}</p>
                    {isSelected && <Check className="h-4 w-4 text-primary" />}
                    <Badge variant="outline" className="text-xs">
                      {getFileType(file.mimeType)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{formatFileSize(file.size)}</span>
                    <span>•</span>
                    <span>{file.uploadedBy}</span>
                    <span>•</span>
                    <span>{formatDate(file.createdAt)}</span>
                  </div>
                  
                  {file.alt && (
                    <p className="text-sm text-muted-foreground mt-1">{file.alt}</p>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className={cn(
        "border-r bg-background transition-all duration-300",
        sidebarCollapsed ? "w-16" : "w-64"
      )}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && <h3 className="font-semibold">Folders</h3>}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFolderDialog(true)}
                className={cn(sidebarCollapsed && "w-8 h-8 p-0")}
              >
                <FolderPlus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="p-2">
          {!sidebarCollapsed && renderFolderTree(folders)}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          {/* Title */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold tracking-tight">Media Explorer</h1>
            
            <div className="flex items-center space-x-2">
              <MediaPicker
                onSelect={(files) => console.log('Selected files:', files)}
                trigger={
                  <Button variant="outline">
                    <Image className="h-4 w-4 mr-2" />
                    Select Media
                  </Button>
                }
              />
              
              {/* Upload Dialog */}
              <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Files
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Upload Media Files</DialogTitle>
                    <DialogDescription>
                      Upload and organize your media files. Drag and drop files here or click to browse.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <MediaUpload 
                      onUploadComplete={handleUploadComplete}
                      multiple={true}
                      maxFiles={20}
                      maxSize={50 * 1024 * 1024} // 50MB
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Breadcrumb with Collapse Button */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="h-8 w-8 p-0"
            >
              <Sidebar className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCurrentFolder(null);
                  setFolderPath([]);
                }}
                className="h-6 px-2"
              >
                <Home className="h-3 w-3 mr-1" />
                Home
              </Button>
              {folderPath.map((folder) => (
                <div key={folder.id} className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleBreadcrumbClick(folder)}
                    className="h-6 px-2"
                  >
                    {folder.name}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType('all')}
              >
                All
              </Button>
              <Button
                variant={selectedType === 'image' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType('image')}
              >
                Images
              </Button>
              <Button
                variant={selectedType === 'video' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType('video')}
              >
                Videos
              </Button>
              <Button
                variant={selectedType === 'document' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType('document')}
              >
                Documents
              </Button>
            </div>
            <div className="flex gap-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredFiles.length > 0 ? (
            viewMode === 'grid' ? renderGridView() : renderListView()
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <div className="text-muted-foreground">
                  <Image className="h-12 w-12 mx-auto mb-4" />
                </div>
                <h3 className="text-lg font-semibold">No files found</h3>
                <p className="text-muted-foreground">
                  {currentFolder 
                    ? `No files in "${currentFolder.name}"` 
                    : 'Try adjusting your search or filter criteria'
                  }
                </p>
                <Button onClick={() => setShowUploadDialog(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload your first file
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Folder Dialog */}
      <Dialog open={showFolderDialog} onOpenChange={setShowFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Create a new folder to organize your media files.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Folder name..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateFolder();
                }
              }}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowFolderDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateFolder}>
                Create Folder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Operations */}
      <BulkOperations
        selectedFiles={selectedFiles}
        onDelete={handleBulkDelete}
        onDownload={handleBulkDownload}
        onCopy={handleBulkCopy}
        onClearSelection={handleClearSelection}
      />
    </div>
  );
}
