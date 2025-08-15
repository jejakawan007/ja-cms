'use client';


import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Upload,
  Image,
  File,
  Video,
  Music,
  Archive,
  Download,
  Trash2,
  Copy,
  MoreHorizontal,
  Grid3X3,
  List
} from 'lucide-react';
import { useState } from 'react';

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
  dimensions?: {
    width: number;
    height: number;
  };
}

export default function MediaPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Sample media data
  const mediaFiles: MediaFile[] = [
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
      createdAt: '2024-01-14T14:20:00Z'
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
      createdAt: '2024-01-13T16:45:00Z'
    },
    {
      id: '4',
      filename: 'logo.png',
      originalName: 'logo.png',
      mimeType: 'image/png',
      size: 512000,
      url: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=300&fit=crop',
      alt: 'Company Logo',
      uploadedBy: 'Emily Brown',
      createdAt: '2024-01-12T09:15:00Z',
      dimensions: { width: 512, height: 512 }
    },
    {
      id: '5',
      filename: 'presentation.pptx',
      originalName: 'presentation.pptx',
      mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      size: 8192000,
      url: '/api/media/5',
      uploadedBy: 'David Miller',
      createdAt: '2024-01-11T11:30:00Z'
    }
  ];

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
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
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

  const renderGridView = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {filteredFiles.map((file) => {
        const Icon = getFileIcon(file.mimeType);
        const isImage = file.mimeType.startsWith('image/');
        
        return (
          <Card key={file.id} className="group hover:shadow-lg transition-shadow">
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
        
        return (
          <Card key={file.id} className="hover:shadow-md transition-shadow">
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
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Media Library</h1>
            <p className="text-muted-foreground">
              Manage your media files and assets
            </p>
          </div>
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload Files
          </Button>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="pt-6">
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
          </CardContent>
        </Card>

        {/* Media Files */}
        {filteredFiles.length > 0 ? (
          viewMode === 'grid' ? renderGridView() : renderListView()
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="space-y-4">
                <div className="text-muted-foreground">
                  <Upload className="h-12 w-12 mx-auto mb-4" />
                </div>
                <h3 className="text-lg font-semibold">No files found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filter criteria
                </p>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload your first file
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
  );
}

