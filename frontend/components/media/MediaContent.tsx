'use client';

import { useState, useCallback } from 'react';
import NextImage from 'next/image';
import { 
  Image as ImageIcon,
  File,
  Video,
  Music,
  Archive,
  Download,
  Trash2,
  Copy,
  Edit3,
  MoreHorizontal,
  Check,
  Eye,
  Calendar,
  FileText,
  Share2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/cn';
import type { ViewMode, MediaFile } from './MediaToolbar';

interface MediaContentProps {
  files: MediaFile[];
  viewMode: ViewMode;
  selectedFiles: MediaFile[];
  onFileSelect: (file: MediaFile) => void;
  onFileAction: (file: MediaFile, action: string) => void;
  onMultiSelect: (files: MediaFile[]) => void;
  isLoading?: boolean;
}

export function MediaContent({
  files,
  viewMode,
  selectedFiles,
  onFileSelect,
  onFileAction,
  onMultiSelect,
  isLoading = false,
}: MediaContentProps) {
  const [dragSelection, setDragSelection] = useState<{
    isSelecting: boolean;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null>(null);

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }, []);

  const formatDate = useCallback((dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  }, []);

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return ImageIcon;
    if (mimeType.startsWith('video/')) return Video;
    if (mimeType.startsWith('audio/')) return Music;
    if (mimeType.includes('pdf')) return FileText;
    if (mimeType.includes('document') || mimeType.includes('word')) return File;
    return Archive;
  };

  const getFileTypeColor = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (mimeType.startsWith('video/')) return 'bg-red-100 text-red-800 border-red-200';
    if (mimeType.startsWith('audio/')) return 'bg-green-100 text-green-800 border-green-200';
    if (mimeType.includes('pdf')) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (mimeType.includes('document')) return 'bg-purple-100 text-purple-800 border-purple-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const isSelected = useCallback((file: MediaFile) => {
    return selectedFiles.some(f => f.id === file.id);
  }, [selectedFiles]);

  // Handle drag selection
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setDragSelection({
        isSelecting: true,
        startX: e.clientX,
        startY: e.clientY,
        endX: e.clientX,
        endY: e.clientY,
      });
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragSelection?.isSelecting) {
      setDragSelection(prev => ({
        ...prev!,
        endX: e.clientX,
        endY: e.clientY,
      }));
    }
  }, [dragSelection]);

  const handleMouseUp = useCallback(() => {
    if (dragSelection?.isSelecting) {
      // TODO: Implement drag selection logic
      setDragSelection(null);
    }
  }, [dragSelection]);

  // Render file action dropdown
  const renderFileActions = (file: MediaFile) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => onFileAction(file, 'view')}>
          <Eye className="h-4 w-4 mr-2" />
          View
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onFileAction(file, 'edit')}>
          <Edit3 className="h-4 w-4 mr-2" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onFileAction(file, 'download')}>
          <Download className="h-4 w-4 mr-2" />
          Download
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onFileAction(file, 'copy')}>
          <Copy className="h-4 w-4 mr-2" />
          Copy Link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onFileAction(file, 'share')}>
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onFileAction(file, 'properties')}>
          Properties
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => onFileAction(file, 'delete')}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // Card View
  const renderCardView = () => (
    <div 
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4 p-4"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {files.map((file) => {
        const Icon = getFileIcon(file.mimeType);
        const isImage = file.mimeType.startsWith('image/');
        const selected = isSelected(file);

        return (
          <Card
            key={file.id}
            className={cn(
              "group relative cursor-pointer transition-all duration-200 hover:shadow-lg",
              selected && "ring-2 ring-primary shadow-md"
            )}
            onClick={() => onFileSelect(file)}
          >
            <CardContent className="p-3">
              <div className="space-y-3">
                {/* Thumbnail */}
                <div className="aspect-square relative rounded-lg overflow-hidden bg-muted">
                  {isImage ? (
                    <NextImage
                      src={file.url}
                      alt={file.alt || file.originalName}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  
                  {/* Selection Checkbox */}
                  <div className="absolute top-2 left-2">
                    <Checkbox
                      checked={selected}
                      onCheckedChange={() => onFileSelect(file)}
                      className="bg-background/80 backdrop-blur-sm"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  {/* File Actions */}
                  <div className="absolute top-2 right-2">
                    {renderFileActions(file)}
                  </div>

                  {/* Quick Actions */}
                  <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="h-7 w-7 p-0 bg-background/80 backdrop-blur-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onFileAction(file, 'view');
                            }}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>View</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="h-7 w-7 p-0 bg-background/80 backdrop-blur-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onFileAction(file, 'download');
                            }}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Download</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                {/* File Info */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs px-1.5 py-0.5", getFileTypeColor(file.mimeType))}
                    >
                      {file.mimeType?.split('/')[0]?.toUpperCase() || 'FILE'}
                    </Badge>
                    {file.dimensions && (
                      <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                        {file.dimensions?.width}×{file.dimensions?.height}
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="font-medium text-sm truncate leading-tight" title={file.originalName}>
                    {file.originalName}
                  </h3>
                  
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex items-center justify-between">
                      <span>{formatFileSize(file.size)}</span>
                      <span>{formatDate(file.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  // Grid View
  const renderGridView = () => (
    <div 
      className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12 gap-2 p-4"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {files.map((file) => {
        const Icon = getFileIcon(file.mimeType);
        const isImage = file.mimeType.startsWith('image/');
        const selected = isSelected(file);

        return (
          <div
            key={file.id}
            className={cn(
              "group relative aspect-square cursor-pointer transition-all duration-200",
              "rounded-lg overflow-hidden border-2 hover:shadow-md",
              selected ? "border-primary shadow-md" : "border-transparent hover:border-muted-foreground/20"
            )}
            onClick={() => onFileSelect(file)}
            title={file.originalName}
          >
            {isImage ? (
              <NextImage
                src={file.url}
                alt={file.alt || file.originalName}
                fill
                sizes="(max-width: 768px) 33vw, (max-width: 1200px) 20vw, 10vw"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Icon className="h-6 w-6 text-muted-foreground" />
              </div>
            )}

            {/* Selection Indicator */}
            {selected && (
              <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-1">
                <Check className="h-3 w-3" />
              </div>
            )}

            {/* File Type Badge */}
            <div className="absolute bottom-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-background/80 backdrop-blur-sm">
                {file.mimeType?.split('/')[0]?.slice(0, 3)?.toUpperCase() || 'FILE'}
              </Badge>
            </div>
          </div>
        );
      })}
    </div>
  );

  // List View
  const renderListView = () => (
    <div className="p-4">
      <div className="space-y-1">
        {/* Header */}
        <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-medium text-muted-foreground border-b">
          <div className="col-span-1">
            <Checkbox
              checked={selectedFiles.length === files.length && files.length > 0}
              onCheckedChange={(checked) => {
                if (checked) {
                  onMultiSelect(files);
                } else {
                  onMultiSelect([]);
                }
              }}
            />
          </div>
          <div className="col-span-5">Name</div>
          <div className="col-span-1">Size</div>
          <div className="col-span-1">Type</div>
          <div className="col-span-2">Modified</div>
          <div className="col-span-2">Actions</div>
        </div>

        {/* Files */}
        {files.map((file) => {
          const Icon = getFileIcon(file.mimeType);
          const isImage = file.mimeType.startsWith('image/');
          const selected = isSelected(file);

          return (
            <div
              key={file.id}
              className={cn(
                "group grid grid-cols-12 gap-4 px-4 py-3 text-sm rounded-lg transition-colors",
                "hover:bg-muted/50 cursor-pointer",
                selected && "bg-muted border-l-2 border-l-primary"
              )}
              onClick={() => onFileSelect(file)}
            >
              {/* Checkbox */}
              <div className="col-span-1 flex items-center">
                <Checkbox
                  checked={selected}
                  onCheckedChange={() => onFileSelect(file)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Name with thumbnail */}
              <div className="col-span-5 flex items-center gap-3 min-w-0">
                <div className="flex-shrink-0 w-10 h-10 rounded overflow-hidden bg-muted">
                  {isImage ? (
                    <NextImage
                      src={file.url}
                      alt={file.alt || file.originalName}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{file.originalName}</p>
                  {file.alt && (
                    <p className="text-xs text-muted-foreground truncate">{file.alt}</p>
                  )}
                </div>
              </div>

              {/* Size */}
              <div className="col-span-1 flex items-center text-muted-foreground">
                {formatFileSize(file.size)}
              </div>

              {/* Type */}
              <div className="col-span-1 flex items-center">
                <Badge variant="outline" className="text-xs">
                  {file.mimeType?.split('/')[0] || 'file'}
                </Badge>
              </div>

              {/* Modified */}
              <div className="col-span-2 flex items-center text-muted-foreground">
                <Calendar className="h-3 w-3 mr-1" />
                {formatDate(file.createdAt)}
              </div>

              {/* Actions */}
              <div className="col-span-2 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 w-7 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFileAction(file, 'view');
                  }}
                  title="View"
                >
                  <Eye className="h-3 w-3" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 w-7 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFileAction(file, 'download');
                  }}
                  title="Download"
                >
                  <Download className="h-3 w-3" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 w-7 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFileAction(file, 'copy');
                  }}
                  title="Copy Link"
                >
                  <Copy className="h-3 w-3" />
                </Button>
                {renderFileActions(file)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Loading State
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading media files...</p>
        </div>
      </div>
    );
  }

  // Empty State
  if (files.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">No files found</h3>
            <p className="text-muted-foreground max-w-sm">
              No media files match your current filters. Try adjusting your search criteria or upload some files.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render based on view mode
  switch (viewMode) {
    case 'card':
      return renderCardView();
    case 'grid':
      return renderGridView();
    case 'list':
      return renderListView();
    default:
      return renderCardView();
  }
}
