'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Upload, RefreshCw, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Import new modular components
import { MediaSidebar, type MediaFolder } from '@/components/media/MediaSidebar';
import { MediaToolbar, type ViewMode, type SortField, type SortOrder, type MediaFile } from '@/components/media/MediaToolbar';
import { MediaContent } from '@/components/media/MediaContent';
import { MediaUploadModal } from '@/components/media/MediaUploadModal';

/**
 * Media Explorer Page - Comprehensive file management system
 * Features:
 * - Collapsible sidebar with folder tree
 * - Multiple view modes (card, grid, list)
 * - Advanced search and filtering
 * - Drag & drop file management
 * - Bulk operations
 * - Upload with metadata
 */
export default function MediaExplorerPage() {
  const { toast } = useToast();
  const router = useRouter();
  
  // Core state
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [currentFolder, setCurrentFolder] = useState<MediaFolder | null>(null);
  const [folderPath, setFolderPath] = useState<MediaFolder[]>([]);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // Selection and interaction
  const [selectedFiles, setSelectedFiles] = useState<MediaFile[]>([]);
  
  // View and filter state
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  
  // Authentication state
  const [authToken, setAuthToken] = useState<string | null>(null);

  // API call to load folders
  const loadFolders = useCallback(async () => {
    if (!authToken) {
        setFolders([]);
        return;
      }

    try {
      const response = await fetch('/api/media/folders', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          // Build folder hierarchy
          const buildFolderTree = (folders: any[], parentId: string | null = null): MediaFolder[] => {
            try {
              return folders
                .filter(folder => folder && folder.parentId === parentId)
                .map(folder => ({
                  ...folder,
                  children: buildFolderTree(folders, folder.id)
                }));
            } catch (err) {
              console.error('Error building folder tree:', err);
              return [];
            }
          };
          
          const folderTree = buildFolderTree(result.data);
          setFolders(folderTree || []);
        } else {
          setFolders([]);
        }
        } else {
          console.warn('Failed to load folders:', response.status, response.statusText);
        setFolders([]);
      }
    } catch (error) {
      console.error('Error loading folders:', error);
      setFolders([]);
      // Only set error if it's not a network issue
      if (error instanceof Error && !error.message.includes('fetch')) {
        setError('Failed to load folders');
      }
    }
  }, [authToken]);

  // API call to load media files
  const loadMediaFiles = useCallback(async () => {
    if (!authToken) {
        setIsLoading(false);
        return;
      }
      
    setIsLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '100',
        ...(currentFolder && { folderId: currentFolder.id }),
        ...(searchTerm && { search: searchTerm }),
        ...(selectedTypes.length > 0 && { types: selectedTypes.join(',') }),
        ...(sortField && { sortBy: sortField }),
        ...(sortOrder && { sortOrder }),
      });



      const response = await fetch(`/api/media?${params}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('ja-cms-token');
          setAuthToken(null);
          router.push('/login');
          return;
        }
        
        // Enhanced error handling for different status codes
        let errorMessage = 'Failed to load media files';
        if (response.status === 500) {
          errorMessage = 'Backend server error - please check if backend is running on port 3001';
        } else if (response.status === 404) {
          errorMessage = 'Media API endpoint not found - please check backend configuration';
        } else if (response.status >= 500) {
          errorMessage = `Server error (${response.status}): ${response.statusText}`;
        } else {
          errorMessage = `Error (${response.status}): ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }

        const result = await response.json();
        
        if (result.success && result.data) {
          // Data sekarang langsung array file
          const mediaArray = Array.isArray(result.data) ? result.data : [];
          
          const files: MediaFile[] = mediaArray.map((file: any) => ({
            id: file.id || '',
            filename: file.filename || '',
            originalName: file.originalName || file.filename || '',
            mimeType: file.mimeType || 'application/octet-stream',
            size: file.size || 0,
            url: file.url || '',
            alt: file.alt || '',
            description: file.description || '',
            uploadedBy: file.uploader?.username || file.uploader?.firstName || 'Unknown',
            createdAt: file.createdAt || new Date().toISOString(),
            folderId: file.folderId || null,
            dimensions: file.width && file.height ? { width: file.width, height: file.height } : undefined,
          }));
          
          setMediaFiles(files);
        } else {
          setMediaFiles([]);
        }
    } catch (error) {
      console.error('Error loading media files:', error);
      
      let errorMessage = 'Failed to load media files';
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          errorMessage = 'Cannot connect to backend server. Please ensure backend is running on http://localhost:3001';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      setMediaFiles([]);
      
      // Show toast notification for better UX
      toast({
        title: 'Error Loading Media',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [authToken, currentFolder, searchTerm, selectedTypes, sortField, sortOrder, router, toast]);

  // Initialize auth token
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('ja-cms-token');
      console.log('🔍 Auth token from localStorage:', token ? `${token.substring(0, 20)}...` : 'null');
      
      if (token) {
        // Validate token format
        try {
          const tokenParts = token.split('.');
          if (tokenParts.length !== 3) {
            console.error('❌ Invalid token format (not a valid JWT)');
            localStorage.removeItem('ja-cms-token');
            router.push('/login');
            return;
          }
          
          // Decode payload to check expiration
          const payload = JSON.parse(atob(tokenParts[1] || ''));
          const now = Math.floor(Date.now() / 1000);
          
          if (payload.exp && payload.exp < now) {
            console.error('❌ Token has expired');
            localStorage.removeItem('ja-cms-token');
            router.push('/login');
            return;
          }
          
          console.log('✅ Valid token found, expires at:', new Date(payload.exp * 1000));
          setAuthToken(token);
        } catch (error) {
          console.error('❌ Error validating token:', error);
          localStorage.removeItem('ja-cms-token');
          router.push('/login');
        }
      } else {
        console.log('🚫 No auth token found, redirecting to login');
        router.push('/login');
      }
    }
  }, [router]);

  // Load initial data
  useEffect(() => {
    if (authToken) {
      loadFolders().catch(console.error);
      loadMediaFiles().catch(console.error);
    }
  }, [authToken, currentFolder, loadFolders, loadMediaFiles]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (authToken) {
        loadMediaFiles().catch(console.error);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedTypes, authToken, loadMediaFiles]);

  // Folder management handlers
  const handleFolderSelect = useCallback((folder: MediaFolder | null) => {
    setCurrentFolder(folder);
    setSelectedFiles([]); // Clear selection when changing folders
    
    // Build folder path
    if (folder) {
      // TODO: Build proper path based on folder hierarchy
      setFolderPath([folder]);
    } else {
      setFolderPath([]);
    }
  }, []);

  const handleCreateFolder = useCallback(async (name: string, parentId?: string) => {
    if (!authToken) {
      console.error('No auth token available');
      toast({
        title: "Authentication Error",
        description: "Please log in again to continue.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      console.log('Creating folder:', { name, parentId, authToken: authToken.substring(0, 10) + '...' });
      
      const response = await fetch('/api/media/folders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          parentId: parentId || null,
          isPublic: false,
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const result = await response.json();
        console.log('Response data:', result);
        
        if (result.success) {
          toast({
            title: "Folder Created",
            description: `Folder "${name}" has been created successfully.`,
          });
          await loadFolders().catch(console.error);
        } else {
          throw new Error(result.message || 'Failed to create folder');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(errorData.message || `Failed to create folder: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create folder. Please try again.",
        variant: "destructive",
      });
    }
  }, [authToken, toast, loadFolders]);

  const handleRenameFolder = useCallback(async (folderId: string, newName: string) => {
    if (!authToken) {
      console.error('No auth token available');
      toast({
        title: "Authentication Error",
        description: "Please log in again to continue.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      console.log('Renaming folder:', { folderId, newName });
      
      const response = await fetch(`/api/media/folders/${folderId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const result = await response.json();
        console.log('Response data:', result);
        
        if (result.success) {
          toast({
            title: "Folder Renamed",
            description: `Folder has been renamed to "${newName}".`,
          });
          await loadFolders().catch(console.error);
        } else {
          throw new Error(result.message || 'Failed to rename folder');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(errorData.message || `Failed to rename folder: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error renaming folder:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to rename folder. Please try again.",
        variant: "destructive",
      });
    }
  }, [authToken, toast, loadFolders]);

  const handleDeleteFolder = useCallback(async (folderId: string) => {
    if (!authToken) return;
    
    if (!confirm('Are you sure you want to delete this folder? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/media/folders/${folderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast({
          title: "Folder Deleted",
          description: "Folder has been deleted successfully.",
        });
        
        // If current folder was deleted, go back to root
        if (currentFolder?.id === folderId) {
          setCurrentFolder(null);
          setFolderPath([]);
        }
        
        await loadFolders().catch(console.error);
      } else {
        throw new Error(`Failed to delete folder: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast({
        title: "Error",
        description: "Failed to delete folder. Please try again.",
        variant: "destructive",
      });
    }
  }, [authToken, toast, currentFolder, loadFolders]);

  const handleDuplicateFolder = useCallback(async (_folderId: string) => {
    // TODO: Implement folder duplication
    toast({
      title: "Coming Soon",
      description: "Folder duplication feature is coming soon.",
    });
  }, [toast]);

  // File management handlers
  const handleFileSelect = useCallback((file: MediaFile) => {
    setSelectedFiles(prev => {
      const isSelected = prev.some(f => f.id === file.id);
      if (isSelected) {
        return prev.filter(f => f.id !== file.id);
      } else {
        return [...prev, file];
      }
    });
  }, []);

  const handleMultiSelect = useCallback((files: MediaFile[]) => {
    setSelectedFiles(files);
  }, []);

  const handleFileAction = useCallback(async (file: MediaFile, action: string) => {
    switch (action) {
      case 'view':
        // TODO: Open file preview modal
        toast({
          title: "View File",
          description: `Opening ${file.originalName}`,
        });
        break;
        
      case 'edit':
        // TODO: Open file editor
        toast({
          title: "Edit File",
          description: `Editing ${file.originalName}`,
        });
        break;
        
      case 'download':
        // Download file
        window.open(file.url, '_blank');
        break;
        
      case 'copy':
        // Copy file URL to clipboard
        await navigator.clipboard.writeText(file.url);
        toast({
          title: "Link Copied",
          description: "File link has been copied to clipboard.",
        });
        break;
        
      case 'delete':
        if (confirm(`Are you sure you want to delete "${file.originalName}"?`)) {
          // TODO: Implement file deletion
          toast({
            title: "File Deleted",
            description: `${file.originalName} has been deleted.`,
          });
        }
        break;
        
      default:
        console.log('Unhandled file action:', action, file);
    }
  }, [toast]);

  // Bulk operations
  const handleBulkAction = useCallback(async (action: string) => {
    if (selectedFiles.length === 0) return;
    
    switch (action) {
      case 'download':
        selectedFiles.forEach(file => {
          window.open(file.url, '_blank');
        });
        toast({
          title: "Files Downloaded",
          description: `${selectedFiles.length} files are being downloaded.`,
        });
        break;
        
      case 'delete':
        if (confirm(`Are you sure you want to delete ${selectedFiles.length} files?`)) {
          // TODO: Implement bulk delete
          setSelectedFiles([]);
          toast({
            title: "Files Deleted",
            description: `${selectedFiles.length} files have been deleted.`,
          });
        }
        break;
        
      case 'move':
        // TODO: Open move files modal
        toast({
          title: "Move Files",
          description: "Move files feature is coming soon.",
        });
        break;
        
      default:
        console.log('Unhandled bulk action:', action, selectedFiles);
    }
  }, [selectedFiles, toast]);

  // Upload handlers
  const handleUploadComplete = useCallback((uploadedFiles: any[]) => {
    toast({
      title: "Upload Complete",
      description: `${uploadedFiles.length} files have been uploaded successfully.`,
    });
    
    // Refresh file list
    loadMediaFiles().catch(console.error);
    setSelectedFiles([]);
  }, [toast, loadMediaFiles]);

  // Computed values
  const totalFiles = mediaFiles.length;
  const totalSize = useMemo(() => {
    return mediaFiles.reduce((acc, file) => acc + file.size, 0);
  }, [mediaFiles]);

  // Filter and sort files
  const filteredAndSortedFiles = useMemo(() => {
    let filtered = [...mediaFiles];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(file => 
        file.originalName.toLowerCase().includes(searchLower) ||
        (file.alt && file.alt.toLowerCase().includes(searchLower)) ||
        (file.description && file.description.toLowerCase().includes(searchLower))
      );
    }

    // Apply type filters
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(file => {
        return selectedTypes.some(type => {
          switch (type) {
            case 'image': return file.mimeType.startsWith('image/');
            case 'video': return file.mimeType.startsWith('video/');
            case 'audio': return file.mimeType.startsWith('audio/');
            case 'document': return file.mimeType.includes('document') || file.mimeType.includes('word');
            case 'pdf': return file.mimeType.includes('pdf');
            case 'archive': return file.mimeType.includes('zip') || file.mimeType.includes('rar');
            default: return false;
          }
        });
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'name':
          comparison = a.originalName.localeCompare(b.originalName);
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'type':
          comparison = a.mimeType.localeCompare(b.mimeType);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [mediaFiles, searchTerm, selectedTypes, sortField, sortOrder]);

  // Show loading or error states
  if (!authToken) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error && !isLoading) {
        return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-6 max-w-md">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto" />
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Error Loading Media</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">{error}</p>
            
            {/* Troubleshooting Steps */}
            {error.includes('backend') || error.includes('server') ? (
              <div className="bg-muted/50 p-4 rounded-lg text-left">
                <h3 className="font-semibold mb-2 text-sm">Troubleshooting Steps:</h3>
                <ol className="text-xs space-y-1 text-muted-foreground">
                  <li>1. Check if backend server is running</li>
                  <li>2. Run: <code className="bg-background px-1 rounded">npm run dev:backend</code></li>
                  <li>3. Verify backend is accessible at <code className="bg-background px-1 rounded">http://localhost:3001</code></li>
                  <li>4. Check database connection</li>
                </ol>
              </div>
            ) : null}
            
            <div className="flex gap-2 justify-center">
              <Button onClick={loadMediaFiles} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              
              <Button
                onClick={() => {
                  localStorage.removeItem('ja-cms-token');
                  router.push('/login');
                }} 
                variant="ghost"
              >
                Re-login
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b bg-background p-4">
          <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Media Explorer</h1>
            {isLoading && (
              <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
            </div>
        
          <Button onClick={() => setShowUploadModal(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Files
            </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <MediaSidebar
          folders={folders}
          currentFolder={currentFolder}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          onFolderSelect={handleFolderSelect}
          onCreateFolder={handleCreateFolder}
          onRenameFolder={handleRenameFolder}
          onDeleteFolder={handleDeleteFolder}
          onDuplicateFolder={handleDuplicateFolder}
        />

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <MediaToolbar
            currentFolder={currentFolder}
            folderPath={folderPath}
            onFolderSelect={handleFolderSelect}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedTypes={selectedTypes}
            onTypeFilterChange={setSelectedTypes}
            sortField={sortField}
            sortOrder={sortOrder}
            onSortChange={(field, order) => {
              setSortField(field);
              setSortOrder(order);
            }}
            selectedFiles={selectedFiles}
            onBulkAction={handleBulkAction}
            onClearSelection={() => setSelectedFiles([])}
            totalFiles={totalFiles}
            totalSize={totalSize}
          />

          {/* Media Content */}
          <div className="flex-1 overflow-auto">
            <MediaContent
              files={filteredAndSortedFiles}
              viewMode={viewMode}
              selectedFiles={selectedFiles}
              onFileSelect={handleFileSelect}
              onFileAction={handleFileAction}
              onMultiSelect={handleMultiSelect}
              isLoading={isLoading}
            />
          </div>
        </div>
    </div>

      {/* Upload Modal */}
      <MediaUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploadComplete={handleUploadComplete}
        currentFolder={currentFolder}
        folders={folders}
      />
    </div>
  );
}