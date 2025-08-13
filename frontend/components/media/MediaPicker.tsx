'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Image, 
  Video, 
  File, 
  Music, 
  Archive,
  Grid3X3,
  List,
  Check,
  X
} from 'lucide-react';
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
  dimensions?: {
    width: number;
    height: number;
  };
}

interface MediaPickerProps {
  onSelect?: (media: MediaFile[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  acceptedTypes?: string[];
  trigger?: React.ReactNode;
  className?: string;
}

export function MediaPicker({
  onSelect,
  multiple = false,
  maxFiles = 1,
  acceptedTypes = ['image/*', 'video/*'],
  trigger,
  className
}: MediaPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<MediaFile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(false);

  // Load media files
  useEffect(() => {
    if (isOpen) {
      loadMediaFiles();
    }
  }, [isOpen]);

  const loadMediaFiles = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/media');
      if (response.ok) {
        const data = await response.json();
        setMediaFiles(data.data?.media || []);
      }
    } catch (error) {
      console.error('Failed to load media files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter media files
  const filteredFiles = mediaFiles.filter(file => {
    const matchesSearch = file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.originalName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || 
                       (selectedType === 'images' && file.mimeType.startsWith('image/')) ||
                       (selectedType === 'videos' && file.mimeType.startsWith('video/')) ||
                       (selectedType === 'documents' && file.mimeType.startsWith('application/'));
    
    return matchesSearch && matchesType;
  });

  const handleFileSelect = (file: MediaFile) => {
    if (multiple) {
      setSelectedFiles(prev => {
        const isSelected = prev.some(f => f.id === file.id);
        if (isSelected) {
          return prev.filter(f => f.id !== file.id);
        } else {
          if (prev.length >= maxFiles) {
            return prev;
          }
          return [...prev, file];
        }
      });
    } else {
      setSelectedFiles([file]);
    }
  };

  const handleConfirm = () => {
    if (onSelect && selectedFiles.length > 0) {
      onSelect(selectedFiles);
      setIsOpen(false);
      setSelectedFiles([]);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    setSelectedFiles([]);
  };

  const getFileIcon = (file: MediaFile) => {
    if (file.mimeType.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (file.mimeType.startsWith('video/')) return <Video className="h-4 w-4" />;
    if (file.mimeType.startsWith('audio/')) return <Music className="h-4 w-4" />;
    if (file.mimeType.includes('zip') || file.mimeType.includes('rar')) return <Archive className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isFileSelected = (file: MediaFile) => {
    return selectedFiles.some(f => f.id === file.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className={className}>
            <Image className="h-4 w-4 mr-2" />
            Select Media
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Select Media</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col h-full">
          {/* Search and Filters */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search media files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Tabs value={selectedType} onValueChange={setSelectedType}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
                <TabsTrigger value="videos">Videos</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex items-center space-x-2">
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

          {/* Media Grid/List */}
          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                No media files found
              </div>
            ) : (
              <div className={cn(
                "space-y-4",
                viewMode === 'grid' && "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
              )}>
                {filteredFiles.map((file) => (
                  <Card
                    key={file.id}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      isFileSelected(file) && "ring-2 ring-primary"
                    )}
                    onClick={() => handleFileSelect(file)}
                  >
                    <CardContent className="p-4">
                      {viewMode === 'grid' ? (
                        <div className="space-y-2">
                          {/* Image Preview */}
                          <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                            {file.mimeType.startsWith('image/') ? (
                              <img
                                src={file.url}
                                alt={file.alt || file.filename}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                {getFileIcon(file)}
                              </div>
                            )}
                            
                            {/* Selection Indicator */}
                            {isFileSelected(file) && (
                              <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                                <Check className="h-3 w-3" />
                              </div>
                            )}
                          </div>
                          
                          {/* File Info */}
                          <div className="space-y-1">
                            <p className="text-sm font-medium truncate">{file.filename}</p>
                            <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          {/* File Icon */}
                          <div className="flex-shrink-0">
                            {file.mimeType.startsWith('image/') ? (
                              <img
                                src={file.url}
                                alt={file.alt || file.filename}
                                className="h-12 w-12 object-cover rounded"
                              />
                            ) : (
                              <div className="h-12 w-12 bg-muted rounded flex items-center justify-center">
                                {getFileIcon(file)}
                              </div>
                            )}
                          </div>
                          
                          {/* File Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{file.filename}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)} • {new Date(file.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          
                          {/* Selection Indicator */}
                          {isFileSelected(file) && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Selection Summary */}
          {selectedFiles.length > 0 && (
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">
                    {selectedFiles.length} selected
                  </Badge>
                  {multiple && maxFiles > 1 && (
                    <span className="text-sm text-muted-foreground">
                      (max {maxFiles})
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleConfirm}>
                    <Check className="h-4 w-4 mr-2" />
                    Select {selectedFiles.length} File{selectedFiles.length !== 1 ? 's' : ''}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
