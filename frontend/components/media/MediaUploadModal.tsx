'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Video, 
  Music,
  FileText,
  Archive,
  Check,
  AlertCircle,
  Loader2,
  FolderOpen,
  Plus,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/cn';
import type { MediaFolder } from './MediaSidebar';

export interface UploadFile {
  id: string;
  file: File;
  preview?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  alt?: string;
  description?: string;
  tags?: string[];
}

interface MediaUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: (files: UploadFile[]) => void;
  currentFolder?: MediaFolder | null;
  folders: MediaFolder[];
  maxFiles?: number;
  maxSize?: number; // in bytes
  acceptedTypes?: string[];
}

export function MediaUploadModal({
  isOpen,
  onClose,
  onUploadComplete,
  currentFolder,
  folders = [],
  maxFiles = 20,
  maxSize = 50 * 1024 * 1024, // 50MB
  acceptedTypes = ['image/*', 'video/*', 'audio/*', '.pdf', '.doc', '.docx', '.zip', '.rar'],
}: MediaUploadModalProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string>(currentFolder?.id || '');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setUploadFiles([]);
      setSelectedFolderId(currentFolder?.id || '');
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [isOpen, currentFolder]);

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }, []);

  const getFileIcon = (file: File) => {
    const type = file.type;
    if (type.startsWith('image/')) return ImageIcon;
    if (type.startsWith('video/')) return Video;
    if (type.startsWith('audio/')) return Music;
    if (type.includes('pdf') || type.includes('document')) return FileText;
    return Archive;
  };

  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > maxSize) {
      return `File too large. Maximum size is ${formatFileSize(maxSize)}`;
    }

    // Check file type (basic validation)
    const type = file.type.toLowerCase();
    const name = file.name.toLowerCase();
    
    const isValidType = acceptedTypes.some(acceptedType => {
      if (acceptedType.startsWith('.')) {
        return name.endsWith(acceptedType.toLowerCase());
      }
      if (acceptedType.includes('*')) {
        const category = acceptedType.split('/')[0] || '';
        return type.startsWith(category);
      }
      return type === acceptedType;
    });

    if (!isValidType) {
      return `File type not supported. Accepted types: ${acceptedTypes.join(', ')}`;
    }

    return null;
  }, [maxSize, acceptedTypes, formatFileSize]);

  const createUploadFile = useCallback(async (file: File): Promise<UploadFile> => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    let preview: string | undefined;
    if (file.type.startsWith('image/')) {
      preview = URL.createObjectURL(file);
    }

    const validation = validateFile(file);
    
    return {
      id,
      file,
      preview,
      progress: 0,
      status: validation ? 'error' : 'pending',
      error: validation || undefined,
      alt: '',
      description: '',
      tags: [],
    };
  }, [validateFile]);

  const handleFileSelect = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files);
    
    // Check total file count
    if (uploadFiles.length + fileArray.length > maxFiles) {
      alert(`Cannot upload more than ${maxFiles} files at once.`);
      return;
    }

    const newUploadFiles: UploadFile[] = [];
    
    for (const file of fileArray) {
      const fileToUpload = await createUploadFile(file);
      newUploadFiles.push(fileToUpload);
    }

    setUploadFiles(prev => [...prev, ...newUploadFiles]);
  }, [uploadFiles.length, maxFiles, createUploadFile]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only set dragging to false if leaving the drop zone entirely
    if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  const removeFile = (fileId: string) => {
    setUploadFiles(prev => {
      const file = prev.find(f => f.id === fileId);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  const updateFileMetadata = (fileId: string, updates: Partial<UploadFile>) => {
    setUploadFiles(prev => prev.map(file => 
      file.id === fileId ? { ...file, ...updates } : file
    ));
  };

  const uploadFile = useCallback(async (fileToUpload: UploadFile): Promise<void> => {
    try {
      // Validate input
      if (!fileToUpload || !fileToUpload.file) {
        throw new Error('Invalid file data');
      }

      // Create FormData
      const formData = new FormData();
      formData.append('file', fileToUpload.file);
      
      if (selectedFolderId) {
        formData.append('folderId', selectedFolderId);
      }
      
      if (fileToUpload.alt) {
        formData.append('alt', fileToUpload.alt);
      }
      
      if (fileToUpload.description) {
        formData.append('description', fileToUpload.description);
      }

      // Update status to uploading
      setUploadFiles(prev => prev.map(f => 
        f.id === fileToUpload.id ? { ...f, status: 'uploading' as const, progress: 0 } : f
      ));

      // Get token for authentication
      const token = typeof window !== 'undefined' ? localStorage.getItem('ja-cms-token') : null;
      
      if (!token) {
        console.error('No authentication token found in localStorage');
        throw new Error('No authentication token available. Please log in again.');
      }

      console.log('Uploading file:', fileToUpload.file.name, 'with token:', token.substring(0, 20) + '...');

      // Use fetch API with proper error handling
      const response = await fetch('/api/media/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('Upload response status:', response.status, response.statusText);

      if (response.ok) {
        const result = await response.json();
        console.log('Upload successful:', result);
        
        // Update status to completed
        setUploadFiles(prev => prev.map(f => 
          f.id === fileToUpload.id ? { ...f, status: 'completed' as const, progress: 100 } : f
        ));
      } else {
        let errorText = '';
        let errorData = null;
        
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            errorData = await response.json();
            errorText = errorData.message || errorData.error || 'Unknown error';
          } else {
            errorText = await response.text();
          }
        } catch (parseError) {
          console.error('Error parsing response:', parseError);
          errorText = 'Unable to read error response';
        }
        
        console.error('Upload failed:', {
          status: response.status,
          statusText: response.statusText,
          errorText,
          errorData
        });
        
        const error = `Upload failed: ${response.status} ${response.statusText} - ${errorText}`;
        setUploadFiles(prev => prev.map(f => 
          f.id === fileToUpload.id ? { ...f, status: 'error' as const, error } : f
        ));
        throw new Error(error);
      }
    } catch (error) {
      console.error('Upload error for file:', fileToUpload.id, error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadFiles(prev => prev.map(f => 
        f.id === fileToUpload.id ? { ...f, status: 'error' as const, error: errorMessage } : f
      ));
      throw error;
    }
  }, [selectedFolderId]);

  const handleUpload = async () => {
    const validFiles = uploadFiles.filter(f => f.status !== 'error');
    
    if (validFiles.length === 0) {
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        if (file) {
          await uploadFile(file);
          setUploadProgress(Math.round(((i + 1) / validFiles.length) * 100));
        }
      }

      // Call completion callback
      const completedFiles = uploadFiles.filter(f => f.status === 'completed');
      if (completedFiles.length > 0) {
        onUploadComplete(completedFiles);
      }

      // Close modal after successful upload
      setTimeout(() => {
        onClose();
      }, 1000);

    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    // Cleanup preview URLs
    uploadFiles.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    onClose();
  };

  const completedCount = uploadFiles.filter(f => f.status === 'completed').length;
  const errorCount = uploadFiles.filter(f => f.status === 'error').length;
  const validCount = uploadFiles.filter(f => f.status !== 'error').length;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Media Files
          </DialogTitle>
          <DialogDescription>
            Upload files to your media library. You can drag and drop files or click to browse.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-6 overflow-hidden">
          {/* Folder Selection */}
          <div className="space-y-2">
            <Label>Upload to Folder</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {selectedFolderId ? 
                    folders.find(f => f.id === selectedFolderId)?.name || 'Unknown Folder' : 
                    'Select a folder or leave empty for root'
                  }
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full min-w-[200px]">
                <DropdownMenuItem onClick={() => setSelectedFolderId('')}>
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4" />
                    Root Folder
                  </div>
                </DropdownMenuItem>
                {folders.map(folder => (
                  <DropdownMenuItem 
                    key={folder.id} 
                    onClick={() => setSelectedFolderId(folder.id)}
                  >
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-4 w-4" />
                      {folder.name}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Drop Zone */}
          {uploadFiles.length === 0 && (
            <div
              ref={dropZoneRef}
              className={cn(
                "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                isDragging 
                  ? "border-primary bg-primary/5" 
                  : "border-muted-foreground/25 hover:border-muted-foreground/50"
              )}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Drop files here</h3>
                  <p className="text-muted-foreground">
                    or click to browse your computer
                  </p>
                </div>

                <div className="space-y-2">
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    className="mx-auto"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Choose Files
                  </Button>
                  
                  <p className="text-xs text-muted-foreground">
                    Maximum {maxFiles} files, {formatFileSize(maxSize)} each
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supported: {acceptedTypes.join(', ')}
                  </p>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={acceptedTypes.join(',')}
                onChange={(e) => {
                  if (e.target.files) {
                    handleFileSelect(e.target.files);
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          )}

          {/* File List */}
          {uploadFiles.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h3 className="font-semibold">Files to Upload</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {validCount} valid
                    </Badge>
                    {errorCount > 0 && (
                      <Badge variant="destructive">
                        {errorCount} error{errorCount > 1 ? 's' : ''}
                      </Badge>
                    )}
                    {completedCount > 0 && (
                      <Badge variant="secondary">
                        {completedCount} completed
                      </Badge>
                    )}
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add More
                </Button>
              </div>

              <ScrollArea className="max-h-96 pr-4">
                <div className="space-y-3">
                  {uploadFiles.map((uploadFile) => {
                    const Icon = getFileIcon(uploadFile.file);
                    
                    return (
                      <div
                        key={uploadFile.id}
                        className={cn(
                          "flex items-start gap-4 p-4 rounded-lg border",
                          uploadFile.status === 'error' && "border-destructive/50 bg-destructive/5",
                          uploadFile.status === 'completed' && "border-green-500/50 bg-green-500/5",
                          uploadFile.status === 'uploading' && "border-primary/50 bg-primary/5"
                        )}
                      >
                        {/* Preview/Icon */}
                        <div className="flex-shrink-0 w-12 h-12 rounded overflow-hidden bg-muted">
                          {uploadFile.preview ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={uploadFile.preview}
                              alt={`Preview of ${uploadFile.file.name}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Icon className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        {/* File Details */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-sm">{uploadFile.file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(uploadFile.file.size)} • {uploadFile.file.type || 'Unknown type'}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {uploadFile.status === 'completed' && (
                                <Check className="h-4 w-4 text-green-500" />
                              )}
                              {uploadFile.status === 'error' && (
                                <AlertCircle className="h-4 w-4 text-destructive" />
                              )}
                              {uploadFile.status === 'uploading' && (
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                              )}
                              
                              {uploadFile.status !== 'uploading' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(uploadFile.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Progress Bar */}
                          {uploadFile.status === 'uploading' && (
                            <Progress value={uploadFile.progress} className="h-1" />
                          )}

                          {/* Error Message */}
                          {uploadFile.error && (
                            <p className="text-xs text-destructive">{uploadFile.error}</p>
                          )}

                          {/* Metadata Fields */}
                          {uploadFile.status !== 'error' && uploadFile.file.type.startsWith('image/') && (
                            <div className="space-y-2">
                              <Input
                                placeholder="Alt text (optional)"
                                value={uploadFile.alt}
                                onChange={(e) => updateFileMetadata(uploadFile.id, { alt: e.target.value })}
                                disabled={isUploading}
                                className="text-xs"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={acceptedTypes.join(',')}
                onChange={(e) => {
                  if (e.target.files) {
                    handleFileSelect(e.target.files);
                  }
                }}
                className="hidden"
              />
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading files...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-6 border-t">
          <div className="text-sm text-muted-foreground">
            {validCount > 0 && (
              <span>{validCount} file{validCount > 1 ? 's' : ''} ready to upload</span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpload}
              disabled={validCount === 0 || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload {validCount} File{validCount > 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
