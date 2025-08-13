'use client';

import { useCallback } from 'react';
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc,
  Grid3X3,
  LayoutGrid,
  List,
  Home,
  ChevronRight,
  Download,
  Trash2,
  Copy,
  Move,
  Tag,
  MoreHorizontal,
  X,
  Calendar,
  FileType,
  HardDrive
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/cn';
import type { MediaFolder } from './MediaSidebar';

export type ViewMode = 'card' | 'grid' | 'list';
export type SortField = 'name' | 'size' | 'createdAt' | 'type';
export type SortOrder = 'asc' | 'desc';

export interface MediaFile {
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

interface MediaToolbarProps {
  // Navigation
  currentFolder: MediaFolder | null;
  folderPath: MediaFolder[];
  onFolderSelect: (folder: MediaFolder | null) => void;
  
  // View Controls
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  
  // Search & Filter
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedTypes: string[];
  onTypeFilterChange: (types: string[]) => void;
  
  // Sort
  sortField: SortField;
  sortOrder: SortOrder;
  onSortChange: (field: SortField, order: SortOrder) => void;
  
  // Bulk Actions
  selectedFiles: MediaFile[];
  onBulkAction: (action: string) => void;
  onClearSelection: () => void;
  
  // Stats
  totalFiles: number;
  totalSize: number;
}

export function MediaToolbar({
  currentFolder,
  folderPath,
  onFolderSelect,
  viewMode,
  onViewModeChange,
  searchTerm,
  onSearchChange,
  selectedTypes,
  onTypeFilterChange,
  sortField,
  sortOrder,
  onSortChange,
  selectedFiles,
  onBulkAction,
  onClearSelection,
  totalFiles,
  totalSize,
}: MediaToolbarProps) {

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }, []);

  const fileTypes = [
    { value: 'image', label: 'Images', icon: FileType },
    { value: 'video', label: 'Videos', icon: FileType },
    { value: 'audio', label: 'Audio', icon: FileType },
    { value: 'document', label: 'Documents', icon: FileType },
    { value: 'pdf', label: 'PDFs', icon: FileType },
    { value: 'archive', label: 'Archives', icon: FileType },
  ];

  const handleTypeToggle = (type: string) => {
    const newTypes = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type];
    onTypeFilterChange(newTypes);
  };

  const handleSortChange = (field: SortField) => {
    const newOrder = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    onSortChange(field, newOrder);
  };

  return (
    <div className="border-b bg-background">
      {/* Main Toolbar */}
      <div className="p-4 space-y-4">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFolderSelect(null)}
            className={cn(
              "h-8 px-2 font-normal transition-colors",
              currentFolder === null && "bg-muted text-foreground"
            )}
          >
            <Home className="h-3 w-3 mr-1" />
            All Media
          </Button>
          
          {folderPath.map((folder, _index) => (
            <div key={folder.id} className="flex items-center gap-1">
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Update path and select folder
                  onFolderSelect(folder);
                }}
                className="h-8 px-2 font-normal hover:bg-muted"
              >
                {folder.name}
              </Button>
            </div>
          ))}
          
          {currentFolder && !folderPath.includes(currentFolder) && (
            <div className="flex items-center gap-1">
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
              <span className="font-medium text-foreground px-2">
                {currentFolder.name}
              </span>
            </div>
          )}
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search media files..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSearchChange('')}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Type Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className={cn(selectedTypes.length > 0 && "border-primary bg-primary/5")}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Types
                  {selectedTypes.length > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {selectedTypes.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>File Types</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {fileTypes.map((type) => (
                  <DropdownMenuCheckboxItem
                    key={type.value}
                    checked={selectedTypes.includes(type.value)}
                    onCheckedChange={() => handleTypeToggle(type.value)}
                  >
                    <type.icon className="h-4 w-4 mr-2" />
                    {type.label}
                  </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onTypeFilterChange([])}>
                  Clear All
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sort */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {sortOrder === 'asc' ? (
                    <SortAsc className="h-4 w-4 mr-2" />
                  ) : (
                    <SortDesc className="h-4 w-4 mr-2" />
                  )}
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => handleSortChange('name')}
                  className={cn(sortField === 'name' && "bg-muted")}
                >
                  Name
                  {sortField === 'name' && (
                    <div className="ml-auto">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </div>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleSortChange('createdAt')}
                  className={cn(sortField === 'createdAt' && "bg-muted")}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Date
                  {sortField === 'createdAt' && (
                    <div className="ml-auto">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </div>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleSortChange('size')}
                  className={cn(sortField === 'size' && "bg-muted")}
                >
                  <HardDrive className="h-4 w-4 mr-2" />
                  Size
                  {sortField === 'size' && (
                    <div className="ml-auto">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </div>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleSortChange('type')}
                  className={cn(sortField === 'type' && "bg-muted")}
                >
                  <FileType className="h-4 w-4 mr-2" />
                  Type
                  {sortField === 'type' && (
                    <div className="ml-auto">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </div>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Separator orientation="vertical" className="h-6" />

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-md border p-1">
              <Button
                variant={viewMode === 'card' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('card')}
                className="h-7 w-7 p-0"
                title="Card View"
              >
                <LayoutGrid className="h-3 w-3" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('grid')}
                className="h-7 w-7 p-0"
                title="Grid View"
              >
                <Grid3X3 className="h-3 w-3" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('list')}
                className="h-7 w-7 p-0"
                title="List View"
              >
                <List className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>{totalFiles} files</span>
            <span>•</span>
            <span>{formatFileSize(totalSize)}</span>
            {currentFolder && (
              <>
                <span>•</span>
                <span>in {currentFolder.name}</span>
              </>
            )}
          </div>

          {/* Active Filters */}
          {(selectedTypes.length > 0 || searchTerm) && (
            <div className="flex items-center gap-2">
              <span className="text-xs">Filters:</span>
              {searchTerm && (
                <Badge variant="outline" className="text-xs">
                  &quot;{searchTerm}&quot;
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSearchChange('')}
                    className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                  >
                    <X className="h-2 w-2" />
                  </Button>
                </Badge>
              )}
              {selectedTypes.map(type => (
                <Badge key={type} variant="outline" className="text-xs">
                  {type}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTypeToggle(type)}
                    className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                  >
                    <X className="h-2 w-2" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedFiles.length > 0 && (
        <div className="px-4 py-3 bg-muted/50 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">
                {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBulkAction('download')}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBulkAction('copy')}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBulkAction('move')}
              >
                <Move className="h-4 w-4 mr-2" />
                Move
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBulkAction('tag')}
              >
                <Tag className="h-4 w-4 mr-2" />
                Tag
              </Button>
              
              <Separator orientation="vertical" className="h-6" />
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBulkAction('delete')}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onBulkAction('compress')}>
                    Archive Selected
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onBulkAction('export')}>
                    Export Metadata
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onBulkAction('properties')}>
                    View Properties
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
