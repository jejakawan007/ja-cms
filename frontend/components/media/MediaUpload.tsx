'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, CheckCircle, AlertCircle, File, Image, Video, Music, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
  preview?: string;
}

interface MediaUploadProps {
  onUploadComplete?: (files: UploadFile[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // in bytes
  acceptedTypes?: string[];
  className?: string;
}

export function MediaUpload({
  onUploadComplete,
  multiple = true,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['image/*', 'video/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.*'],
  className
}: MediaUploadProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file,
      progress: 0,
      status: 'uploading' as const,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }));

    setUploadFiles(prev => [...prev, ...newFiles]);
    handleUpload(newFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple,
    maxFiles,
    maxSize,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
  });

  const handleUpload = async (files: UploadFile[]) => {
    setIsUploading(true);

    for (const uploadFile of files) {
      try {
        const formData = new FormData();
        formData.append('file', uploadFile.file);
        formData.append('alt', uploadFile.file.name);
        formData.append('description', '');

        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadFiles(prev => prev.map(f => 
            f.id === uploadFile.id 
              ? { ...f, progress: Math.min(f.progress + 10, 90) }
              : f
          ));
        }, 200);

        const response = await fetch('/api/media/upload', {
          method: 'POST',
          body: formData,
        });

        clearInterval(progressInterval);

        if (response.ok) {
          const result = await response.json();
          setUploadFiles(prev => prev.map(f => 
            f.id === uploadFile.id 
              ? { ...f, progress: 100, status: 'success' as const }
              : f
          ));
        } else {
          throw new Error('Upload failed');
        }
      } catch (error) {
        setUploadFiles(prev => prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, status: 'error' as const, error: error instanceof Error ? error.message : 'Upload failed' }
            : f
        ));
      }
    }

    setIsUploading(false);
    
    // Call completion callback
    if (onUploadComplete) {
      onUploadComplete(uploadFiles);
    }
  };

  const removeFile = (id: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== id));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (file.type.startsWith('video/')) return <Video className="h-4 w-4" />;
    if (file.type.startsWith('audio/')) return <Music className="h-4 w-4" />;
    if (file.type.includes('zip') || file.type.includes('rar')) return <Archive className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              isDragActive 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-primary/50 hover:bg-muted/50"
            )}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">
              {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              or click to select files
            </p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Max file size: {formatFileSize(maxSize)}</p>
              <p>Max files: {maxFiles}</p>
              <p>Accepted types: Images, Videos, Documents</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {uploadFiles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-4">Upload Progress</h4>
            <div className="space-y-3">
              {uploadFiles.map((uploadFile) => (
                <div key={uploadFile.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  {/* File Icon */}
                  <div className="flex-shrink-0">
                    {uploadFile.preview ? (
                      <img 
                        src={uploadFile.preview} 
                        alt={uploadFile.file.name}
                        className="h-10 w-10 object-cover rounded"
                      />
                    ) : (
                      <div className="h-10 w-10 bg-muted rounded flex items-center justify-center">
                        {getFileIcon(uploadFile.file)}
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium truncate">{uploadFile.file.name}</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(uploadFile.file.size)}
                        </span>
                        {uploadFile.status === 'success' && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        {uploadFile.status === 'error' && (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(uploadFile.id)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <Progress value={uploadFile.progress} className="h-2" />
                    
                    {/* Status */}
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-muted-foreground">
                        {uploadFile.progress}% complete
                      </span>
                      {uploadFile.status === 'error' && (
                        <span className="text-xs text-red-500">{uploadFile.error}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Summary */}
      {uploadFiles.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Badge variant="secondary">
              {uploadFiles.filter(f => f.status === 'success').length} uploaded
            </Badge>
            <Badge variant="outline">
              {uploadFiles.filter(f => f.status === 'error').length} failed
            </Badge>
            {isUploading && (
              <Badge variant="default">
                Uploading...
              </Badge>
            )}
          </div>
          
          {uploadFiles.some(f => f.status === 'error') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const failedFiles = uploadFiles.filter(f => f.status === 'error');
                handleUpload(failedFiles);
              }}
            >
              Retry Failed
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
