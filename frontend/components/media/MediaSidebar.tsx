'use client';

import { useState, useCallback } from 'react';
import { 
  Folder, 
  FolderOpen, 
  FolderPlus, 
  Home, 
  MoreHorizontal,
  Edit3,
  Trash2,
  Copy,
  ChevronRight,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/cn';

export interface MediaFolder {
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

interface MediaSidebarProps {
  folders: MediaFolder[];
  currentFolder: MediaFolder | null;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onFolderSelect: (folder: MediaFolder | null) => void;
  onCreateFolder: (name: string, parentId?: string) => Promise<void>;
  onRenameFolder: (folderId: string, newName: string) => Promise<void>;
  onDeleteFolder: (folderId: string) => Promise<void>;
  onDuplicateFolder: (folderId: string) => Promise<void>;
}

export function MediaSidebar({
  folders,
  currentFolder,
  isCollapsed,
  onToggleCollapse,
  onFolderSelect,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onDuplicateFolder,
}: MediaSidebarProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [createParentId, setCreateParentId] = useState<string | undefined>();
  const [renameFolderId, setRenameFolderId] = useState<string>('');
  const [newFolderName, setNewFolderName] = useState('');

  // Toggle folder expansion
  const toggleFolder = useCallback((folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  }, []);

  // Handle drag events for folder reorganization
  const handleDragOver = useCallback((e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    setDragOverFolder(folderId);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverFolder(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetFolderId: string) => {
    e.preventDefault();
    setDragOverFolder(null);
    
    // Get dragged folder ID from dataTransfer
    const draggedFolderId = e.dataTransfer.getData('text/plain');
    if (draggedFolderId && draggedFolderId !== targetFolderId) {
      // TODO: Implement folder move functionality
      console.log('Move folder', draggedFolderId, 'to', targetFolderId);
    }
  }, []);

  const handleFolderDragStart = useCallback((e: React.DragEvent, folderId: string) => {
    e.dataTransfer.setData('text/plain', folderId);
  }, []);

  // Create folder handlers
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    
    try {
      await onCreateFolder(newFolderName.trim(), createParentId);
      setNewFolderName('');
      setShowCreateDialog(false);
      setCreateParentId(undefined);
    } catch (error) {
      console.error('Error creating folder:', error);
      // Re-throw error to be handled by parent component
      throw error;
    }
  };

  const handleRenameFolder = async () => {
    if (!newFolderName.trim() || !renameFolderId) return;
    
    try {
      await onRenameFolder(renameFolderId, newFolderName.trim());
      setNewFolderName('');
      setShowRenameDialog(false);
      setRenameFolderId('');
    } catch (error) {
      console.error('Error renaming folder:', error);
      // Re-throw error to be handled by parent component
      throw error;
    }
  };

  // Render individual folder with context menu
  const renderFolder = (folder: MediaFolder, level: number = 0) => {
    const isSelected = currentFolder?.id === folder.id;
    const isExpanded = expandedFolders.has(folder.id);
    const hasChildren = folder.children && folder.children.length > 0;
    const isDragOver = dragOverFolder === folder.id;

    return (
      <div key={folder.id} className="space-y-1">
        <div
          className={cn(
            "group flex items-center rounded-md text-sm transition-all duration-200",
            "hover:bg-muted/50 cursor-pointer",
            isSelected && "bg-muted border-l-2 border-l-primary",
            isDragOver && "bg-primary/10 border border-primary/20"
          )}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => onFolderSelect(folder)}
          onDragOver={(e) => handleDragOver(e, folder.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, folder.id)}
          draggable
          onDragStart={(e) => handleFolderDragStart(e, folder.id)}
        >
          <div className="flex items-center flex-1 min-w-0 py-2 pr-2">
            {/* Expand/Collapse Button */}
            {hasChildren ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFolder(folder.id);
                }}
                className="h-6 w-6 p-0 mr-1"
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </Button>
            ) : (
              <div className="w-6 mr-1" />
            )}

            {/* Folder Icon */}
            <div className="flex-shrink-0 mr-2">
              {isSelected || isExpanded ? (
                <FolderOpen className="h-4 w-4 text-primary" />
              ) : (
                <Folder className="h-4 w-4 text-muted-foreground" />
              )}
            </div>

            {/* Folder Name */}
            <span className="flex-1 min-w-0 truncate font-medium text-sm">
              {folder.name}
            </span>

            {/* File Count Badge */}
            <Badge 
              variant="secondary" 
              className="text-xs px-2 py-0 h-5 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {folder.fileCount}
            </Badge>

            {/* Context Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => e.stopPropagation()}
                  className="h-6 w-6 p-0 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setCreateParentId(folder.id);
                    setShowCreateDialog(true);
                  }}
                >
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Create Subfolder
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setRenameFolderId(folder.id);
                    setNewFolderName(folder.name);
                    setShowRenameDialog(true);
                  }}
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicateFolder(folder.id);
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFolder(folder.id);
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Render Children */}
        {hasChildren && isExpanded && (
          <div className="ml-0">
            {folder.children!.map(child => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (isCollapsed) {
    return (
      <div className="border-r bg-card w-12 flex flex-col">
        {/* Collapsed Header */}
        <div className="p-2 border-b">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="h-8 w-8 p-0"
            title="Expand Sidebar"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </Button>
        </div>

        {/* Collapsed Quick Actions */}
        <div className="flex-1 p-2 space-y-2">
          <Button
            variant={currentFolder === null ? "default" : "ghost"}
            size="sm"
            onClick={() => onFolderSelect(null)}
            className="w-8 h-8 p-0"
            title="All Media"
          >
            <Home className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setCreateParentId(undefined);
              setShowCreateDialog(true);
            }}
            className="w-8 h-8 p-0"
            title="Create Folder"
          >
            <FolderPlus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="border-r bg-card w-80 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Folder className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Media Library</h2>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCreateParentId(undefined);
                  setShowCreateDialog(true);
                }}
                className="h-8 w-8 p-0"
                title="Create New Folder"
              >
                <FolderPlus className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleCollapse}
                className="h-8 w-8 p-0"
                title="Collapse Sidebar"
              >
                <PanelLeftClose className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Root Folder */}
          <Button
            variant={currentFolder === null ? "default" : "ghost"}
            size="sm"
            onClick={() => onFolderSelect(null)}
            className="w-full justify-start gap-2 h-9 font-normal"
          >
            <Home className="h-4 w-4" />
            <span>All Media</span>
            <Badge variant="outline" className="ml-auto text-xs">
              {folders.reduce((acc, folder) => acc + folder.fileCount, 0)}
            </Badge>
          </Button>
        </div>

        {/* Folder Tree */}
        <ScrollArea className="flex-1 p-2">
          <div className="space-y-1">
            {folders.length > 0 ? (
              folders.map(folder => renderFolder(folder))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No folders yet</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCreateParentId(undefined);
                    setShowCreateDialog(true);
                  }}
                  className="mt-2"
                >
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Create First Folder
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer Stats */}
        <div className="p-4 border-t bg-muted/30">
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>Total Folders:</span>
              <span className="font-medium">{folders.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Files:</span>
              <span className="font-medium">
                {folders.reduce((acc, folder) => acc + folder.fileCount, 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Create Folder Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              {createParentId 
                ? 'Create a new subfolder in the selected location.' 
                : 'Create a new folder to organize your media files.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Enter folder name..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCreateFolder().catch(console.error);
                } else if (e.key === 'Escape') {
                  setShowCreateDialog(false);
                }
              }}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowCreateDialog(false);
                  setNewFolderName('');
                  setCreateParentId(undefined);
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={() => handleCreateFolder().catch(console.error)}
                disabled={!newFolderName.trim()}
              >
                Create Folder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rename Folder Dialog */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
            <DialogDescription>
              Enter a new name for this folder.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Enter new folder name..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleRenameFolder().catch(console.error);
                } else if (e.key === 'Escape') {
                  setShowRenameDialog(false);
                }
              }}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowRenameDialog(false);
                  setNewFolderName('');
                  setRenameFolderId('');
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={() => handleRenameFolder().catch(console.error)}
                disabled={!newFolderName.trim()}
              >
                Rename
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
