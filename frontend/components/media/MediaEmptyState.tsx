'use client';

import { Upload, FolderOpen, Search, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MediaEmptyStateProps {
  currentFolder: any;
  onUpload: () => void;
  onCreateFolder: () => void;
  searchTerm: string;
  onClearSearch: () => void;
}

export function MediaEmptyState({
  currentFolder,
  onUpload,
  onCreateFolder,
  searchTerm,
  onClearSearch,
}: MediaEmptyStateProps) {
  if (searchTerm) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">No files found</h3>
        <p className="mb-6 text-sm text-muted-foreground max-w-md">
          No files match your search for &ldquo;{searchTerm}&rdquo;. Try adjusting your search terms or browse all files.
        </p>
        <div className="flex gap-2">
          <Button onClick={onClearSearch} variant="outline">
            Clear Search
          </Button>
          <Button onClick={onUpload}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Files
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <ImageIcon className="h-8 w-8 text-muted-foreground" />
      </div>
      
      <h3 className="mb-2 text-lg font-semibold">
        {currentFolder ? `No files in "${currentFolder.name}"` : 'No media files yet'}
      </h3>
      
      <p className="mb-6 text-sm text-muted-foreground max-w-md">
        {currentFolder 
          ? `This folder is empty. Upload files to get started or create subfolders to organize your content.`
          : 'Start building your media library by uploading images, videos, documents, and other files.'
        }
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={onUpload} className="sm:w-auto">
          <Upload className="h-4 w-4 mr-2" />
          Upload Files
        </Button>
        <Button onClick={onCreateFolder} variant="outline" className="sm:w-auto">
          <FolderOpen className="h-4 w-4 mr-2" />
          Create Folder
        </Button>
      </div>
      
      {/* Quick Tips */}
      <Card className="mt-8 w-full max-w-md border border-border bg-card shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Quick Tips</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ul className="text-xs text-muted-foreground space-y-1 text-left">
            <li>• Drag and drop files directly into the upload area</li>
            <li>• Supported formats: Images, Videos, Documents, Archives</li>
            <li>• Maximum file size: 50MB per file</li>
            <li>• Use folders to organize your media library</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
