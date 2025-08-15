'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToast';
import type { MediaFile } from './useMediaFiles';

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3001';

// API function
const uploadMediaFile = async (
  file: File,
  folderId?: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<MediaFile> => {
  const formData = new FormData();
  formData.append('file', file);
  
  if (folderId) {
    formData.append('folderId', folderId);
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const progress: UploadProgress = {
          loaded: event.loaded,
          total: event.total,
          percentage: Math.round((event.loaded / event.total) * 100),
        };
        onProgress(progress);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (error) {
          reject(new Error('Invalid response format'));
        }
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload was aborted'));
    });

    xhr.open('POST', `${API_BASE}/api/media/upload`);
    xhr.send(formData);
  });
};

// Custom hook
export function useMediaUpload(): {
  uploadFile: (variables: { file: File; folderId?: string }) => void;
  uploadMultipleFiles: (files: File[], folderId?: string) => Promise<void>;
  uploadProgress: UploadProgress | null;
  isUploading: boolean;
  resetProgress: () => void;
} {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);

  const uploadMutation = useMutation({
    mutationFn: ({ file, folderId }: { file: File; folderId?: string }) =>
      uploadMediaFile(file, folderId, setUploadProgress),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['media-files'] });
      setUploadProgress(null);
      toast({
        title: 'Success',
        description: `${data.originalName} uploaded successfully`,
      });
    },
    onError: (error) => {
      setUploadProgress(null);
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload file',
        variant: 'destructive',
      });
    },
  });

  const uploadMultipleFiles = async (files: File[], folderId?: string) => {
    const uploadPromises = files.map(file => 
      uploadMutation.mutateAsync({ file, folderId })
    );

    try {
      await Promise.all(uploadPromises);
      toast({
        title: 'Success',
        description: `${files.length} files uploaded successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Some files failed to upload',
        variant: 'destructive',
      });
    }
  };

  return {
    uploadFile: uploadMutation.mutate,
    uploadMultipleFiles,
    uploadProgress,
    isUploading: uploadMutation.isPending,
    resetProgress: () => setUploadProgress(null),
  };
}
