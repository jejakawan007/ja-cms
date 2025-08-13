'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Trash2, 
  Download, 
  Copy, 
  Move, 
  Tag,
  MoreHorizontal,
  Check,
  X
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

interface BulkOperationsProps {
  selectedFiles: MediaFile[];
  onDelete?: (fileIds: string[]) => void;
  onDownload?: (fileIds: string[]) => void;
  onCopy?: (fileIds: string[]) => void;
  onMove?: (fileIds: string[], destination: string) => void;
  onTag?: (fileIds: string[], tags: string[]) => void;
  onClearSelection?: () => void;
  className?: string;
}

export function BulkOperations({
  selectedFiles,
  onDelete,
  onDownload,
  onCopy,
  onMove,
  onTag,
  onClearSelection,
  className
}: BulkOperationsProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDelete = async () => {
    if (!onDelete || selectedFiles.length === 0) return;
    
    setIsProcessing(true);
    try {
      await onDelete(selectedFiles.map(f => f.id));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!onDownload || selectedFiles.length === 0) return;
    
    setIsProcessing(true);
    try {
      await onDownload(selectedFiles.map(f => f.id));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = async () => {
    if (!onCopy || selectedFiles.length === 0) return;
    
    setIsProcessing(true);
    try {
      await onCopy(selectedFiles.map(f => f.id));
    } finally {
      setIsProcessing(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);
  const imageCount = selectedFiles.filter(f => f.mimeType.startsWith('image/')).length;
  const videoCount = selectedFiles.filter(f => f.mimeType.startsWith('video/')).length;
  const documentCount = selectedFiles.filter(f => f.mimeType.startsWith('application/')).length;

  if (selectedFiles.length === 0) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 ${className}`}>
      <div className="bg-background border border-border rounded-lg shadow-lg p-4 min-w-[400px]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">
              {selectedFiles.length} selected
            </Badge>
            <span className="text-sm text-muted-foreground">
              {formatFileSize(totalSize)}
            </span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            {imageCount > 0 && (
              <span>{imageCount} images</span>
            )}
            {videoCount > 0 && (
              <span>{videoCount} videos</span>
            )}
            {documentCount > 0 && (
              <span>{documentCount} documents</span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={isProcessing}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={isProcessing}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4 mr-2" />
                  More
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onMove?.(selectedFiles.map(f => f.id), '')}>
                  <Move className="h-4 w-4 mr-2" />
                  Move to Folder
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onTag?.(selectedFiles.map(f => f.id), [])}>
                  <Tag className="h-4 w-4 mr-2" />
                  Add Tags
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {isProcessing && (
          <div className="mt-3 text-xs text-muted-foreground">
            Processing {selectedFiles.length} files...
          </div>
        )}
      </div>
    </div>
  );
}
