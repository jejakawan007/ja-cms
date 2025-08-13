'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Folder, 
  FolderOpen, 
  FolderPlus, 
  MoreHorizontal,
  Move,
  Copy,
  Trash2,
  Edit,
  Download,
  Eye
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/cn';

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

interface FolderManagerProps {
  currentFolder?: MediaFolder;
  onFolderSelect?: (folder: MediaFolder) => void;
  onFileMove?: (fileIds: string[], folderId: string) => void;
  onFolderCreate?: (name: string, parentId?: string) => void;
  onFolderDelete?: (folderId: string) => void;
  onFolderRename?: (folderId: string, newName: string) => void;
  className?: string;
}

export function FolderManager({
  currentFolder,
  onFolderSelect,
  onFileMove,
  onFolderCreate,
  onFolderDelete,
  onFolderRename,
  className
}: FolderManagerProps) {
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      await onFolderCreate?.(newFolderName, currentFolder?.id);
      setNewFolderName('');
      setShowCreateForm(false);
      loadFolders();
    } catch (error) {
      console.error('Failed to create folder:', error);
    }
  };

  const handleRenameFolder = async (folderId: string) => {
    if (!editName.trim()) return;

    try {
      await onFolderRename?.(folderId, editName);
      setEditingFolder(null);
      setEditName('');
      loadFolders();
    } catch (error) {
      console.error('Failed to rename folder:', error);
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    try {
      await onFolderDelete?.(folderId);
      loadFolders();
    } catch (error) {
      console.error('Failed to delete folder:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderFolder = (folder: MediaFolder, level: number = 0) => {
    const isEditing = editingFolder === folder.id;
    const isSelected = currentFolder?.id === folder.id;

    return (
      <div key={folder.id} className="space-y-2">
        <div
          className={cn(
            "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors",
            isSelected 
              ? "bg-primary/10 border border-primary/20" 
              : "hover:bg-muted/50"
          )}
          onClick={() => onFolderSelect?.(folder)}
        >
          <div className="flex items-center gap-3 flex-1">
            <div style={{ marginLeft: `${level * 20}px` }} />
            {folder.children && folder.children.length > 0 ? (
              <FolderOpen className="h-5 w-5 text-blue-500" />
            ) : (
              <Folder className="h-5 w-5 text-muted-foreground" />
            )}
            
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleRenameFolder(folder.id);
                    } else if (e.key === 'Escape') {
                      setEditingFolder(null);
                      setEditName('');
                    }
                  }}
                  autoFocus
                  className="h-6 text-sm"
                />
              ) : (
                <div>
                  <p className="font-medium truncate">{folder.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {folder.fileCount} files • {formatFileSize(folder.totalSize)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {!isEditing && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditingFolder(folder.id)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Move className="h-4 w-4 mr-2" />
                  Move Files Here
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="h-4 w-4 mr-2" />
                  Download All
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => handleDeleteFolder(folder.id)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Folder
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Render children */}
        {folder.children && folder.children.length > 0 && (
          <div className="ml-4">
            {folder.children.map(child => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Folders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                <div className="h-5 w-5 bg-muted rounded" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-3 bg-muted rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Folders</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCreateForm(true)}
          >
            <FolderPlus className="h-4 w-4 mr-2" />
            New Folder
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Create Folder Form */}
        {showCreateForm && (
          <div className="flex items-center gap-2 p-3 border rounded-lg">
            <Input
              placeholder="Folder name..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateFolder();
                } else if (e.key === 'Escape') {
                  setShowCreateForm(false);
                  setNewFolderName('');
                }
              }}
              autoFocus
              className="flex-1"
            />
            <Button size="sm" onClick={handleCreateFolder}>
              Create
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setShowCreateForm(false);
                setNewFolderName('');
              }}
            >
              Cancel
            </Button>
          </div>
        )}

        {/* Folder List */}
        <div className="space-y-1">
          {folders.map(folder => renderFolder(folder))}
        </div>

        {folders.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No folders yet</p>
            <p className="text-sm">Create your first folder to organize media</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
