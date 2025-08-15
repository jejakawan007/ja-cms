'use client';

import { useMediaFiles } from '@/hooks/useMediaFiles';
import { useMediaFolders } from '@/hooks/useMediaFolders';
import { useMediaUI } from '@/hooks/useMediaUI';
import { MediaToolbar } from '@/components/media/MediaToolbar';
import { MediaSidebar } from '@/components/media/MediaSidebar';
import { MediaContent } from '@/components/media/MediaContent';
import { MediaUploadModal } from '@/components/media/MediaUploadModal';
import { MediaErrorBoundary } from '@/components/media/MediaErrorBoundary';

export function MediaExplorer() {
  const ui = useMediaUI();
  
  // Get files with current UI state
  const {
    files,
    total,
    isLoading: filesLoading,
    deleteFile,
  } = useMediaFiles({
    page: 1,
    limit: 50,
    search: ui.searchTerm,
    folderId: ui.currentFolder?.id || undefined,
    sortBy: ui.sortField,
    sortOrder: ui.sortOrder,
  });

  // Get folders
  const {
    folders,
    createFolder,
    updateFolder,
    deleteFolder,
  } = useMediaFolders();

  // Filter files by selected types
  const filteredFiles = ui.selectedTypes.length > 0
    ? files.filter(file => {
        const fileType = file.mimeType.split('/')[0];
        return fileType && ui.selectedTypes.includes(fileType);
      })
    : files;

  // Calculate total size
  const totalSize = filteredFiles.reduce((sum, file) => sum + file.size, 0);

  const handleFileSelect = (file: any) => {
    ui.selectFile(file);
  };

  const handleFileAction = (file: any, action: string) => {
    switch (action) {
      case 'delete':
        deleteFile(file.id);
        break;
      case 'download':
        // TODO: Implement download
        console.log('Download file:', file.id);
        break;
      case 'preview':
        // TODO: Implement preview
        console.log('Preview file:', file.id);
        break;
    }
  };

  const handleFolderSelect = (folder: any) => {
    ui.setCurrentFolder(folder);
  };

  const handleCreateFolder = async (name: string, parentId?: string) => {
    await createFolder({ name, parentId: parentId || undefined });
  };

  const handleRenameFolder = async (folderId: string, newName: string) => {
    await updateFolder({ folderId, data: { name: newName } });
  };

  const handleDeleteFolder = async (folderId: string) => {
    await deleteFolder(folderId);
  };

  const handleDuplicateFolder = async (folderId: string) => {
    // TODO: Implement duplicate folder
    console.log('Duplicate folder:', folderId);
  };

  const handleUpload = () => {
    ui.openUploadModal();
  };

  const handleCreateFolderClick = () => {
    ui.openCreateFolderModal();
  };

  const handleDeleteSelected = () => {
    if (ui.selectedFiles.length === 0) return;
    
    ui.openDeleteConfirmModal();
  };

  const handleBulkAction = (action: string) => {
    switch (action) {
      case 'delete':
        handleDeleteSelected();
        break;
      case 'download':
        // TODO: Implement bulk download
        console.log('Bulk download:', ui.selectedFiles.length, 'files');
        break;
      case 'move':
        // TODO: Implement bulk move
        console.log('Bulk move:', ui.selectedFiles.length, 'files');
        break;
    }
  };

  return (
    <MediaErrorBoundary>
      <div className="flex h-full bg-background">
        {/* Sidebar */}
        <div className="w-80 border-r border-border bg-card">
          <MediaSidebar
            folders={folders}
            currentFolder={ui.currentFolder}
            isCollapsed={false}
            onToggleCollapse={() => {}}
            onFolderSelect={handleFolderSelect}
            onCreateFolder={handleCreateFolder}
            onRenameFolder={handleRenameFolder}
            onDeleteFolder={handleDeleteFolder}
            onDuplicateFolder={handleDuplicateFolder}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="border-b border-border bg-card p-4">
            <MediaToolbar
              currentFolder={ui.currentFolder}
              folderPath={ui.folderPath}
              onFolderSelect={handleFolderSelect}
              viewMode={ui.viewMode}
              onViewModeChange={ui.setViewMode}
              searchTerm={ui.searchTerm}
              onSearchChange={ui.setSearchTerm}
              selectedTypes={ui.selectedTypes}
              onTypeFilterChange={ui.setSelectedTypes}
              sortField={ui.sortField}
              sortOrder={ui.sortOrder}
              onSortChange={ui.setSort}
              selectedFiles={ui.selectedFiles}
              onBulkAction={handleBulkAction}
              onClearSelection={ui.clearSelection}
              totalFiles={total}
              totalSize={totalSize}
            />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            <MediaContent
              files={filteredFiles}
              viewMode={ui.viewMode}
              selectedFiles={ui.selectedFiles}
              isLoading={filesLoading}
              currentFolder={ui.currentFolder}
              searchTerm={ui.searchTerm}
              onFileSelect={handleFileSelect}
              onFileAction={handleFileAction}
              onMultiSelect={ui.selectMultipleFiles}
              onUpload={handleUpload}
              onCreateFolder={handleCreateFolderClick}
              onClearSearch={() => ui.setSearchTerm('')}
            />
          </div>
        </div>

        {/* Modals */}
        <MediaUploadModal
          isOpen={ui.showUploadModal}
          onClose={ui.closeUploadModal}
          onUploadComplete={(files) => {
            console.log('Upload completed:', files);
            ui.closeUploadModal();
          }}
          currentFolder={ui.currentFolder}
          folders={folders}
        />

        {/* TODO: Add other modals */}
        {/* Create Folder Modal */}
        {/* Delete Confirmation Modal */}
        {/* File Details Modal */}
      </div>
    </MediaErrorBoundary>
  );
}
