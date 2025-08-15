'use client';

import { useState, useCallback, useMemo } from 'react';
import type { MediaFile } from './useMediaFiles';
import type { MediaFolder } from './useMediaFolders';

export type ViewMode = 'card' | 'grid' | 'list';
export type SortField = 'name' | 'size' | 'createdAt' | 'type';
export type SortOrder = 'asc' | 'desc';

interface MediaUIState {
  // Selection
  selectedFiles: MediaFile[];
  
  // View settings
  viewMode: ViewMode;
  searchTerm: string;
  selectedTypes: string[];
  sortField: SortField;
  sortOrder: SortOrder;
  
  // Current folder
  currentFolder: MediaFolder | null;
  folderPath: MediaFolder[];
  
  // UI states
  showUploadModal: boolean;
  showCreateFolderModal: boolean;
  showDeleteConfirmModal: boolean;
  showFileDetailsModal: boolean;
}

export function useMediaUI() {
  const [state, setState] = useState<MediaUIState>({
    selectedFiles: [],
    viewMode: 'card',
    searchTerm: '',
    selectedTypes: [],
    sortField: 'createdAt',
    sortOrder: 'desc',
    currentFolder: null,
    folderPath: [],
    showUploadModal: false,
    showCreateFolderModal: false,
    showDeleteConfirmModal: false,
    showFileDetailsModal: false,
  });

  // Selection actions
  const selectFile = useCallback((file: MediaFile) => {
    setState(prev => ({
      ...prev,
      selectedFiles: prev.selectedFiles.some(f => f.id === file.id)
        ? prev.selectedFiles.filter(f => f.id !== file.id)
        : [...prev.selectedFiles, file],
    }));
  }, []);

  const selectMultipleFiles = useCallback((files: MediaFile[]) => {
    setState(prev => ({
      ...prev,
      selectedFiles: files,
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedFiles: [],
    }));
  }, []);

  // View actions
  const setViewMode = useCallback((mode: ViewMode) => {
    setState(prev => ({ ...prev, viewMode: mode }));
  }, []);

  const setSearchTerm = useCallback((term: string) => {
    setState(prev => ({ ...prev, searchTerm: term }));
  }, []);

  const setSelectedTypes = useCallback((types: string[]) => {
    setState(prev => ({ ...prev, selectedTypes: types }));
  }, []);

  const setSort = useCallback((field: SortField, order: SortOrder) => {
    setState(prev => ({ 
      ...prev, 
      sortField: field, 
      sortOrder: order 
    }));
  }, []);

  // Folder navigation
  const setCurrentFolder = useCallback((folder: MediaFolder | null) => {
    setState(prev => ({ 
      ...prev, 
      currentFolder: folder,
      selectedFiles: [], // Clear selection when changing folders
    }));
  }, []);

  const setFolderPath = useCallback((path: MediaFolder[]) => {
    setState(prev => ({ ...prev, folderPath: path }));
  }, []);

  const navigateToFolder = useCallback((folder: MediaFolder, allFolders: MediaFolder[]) => {
    const buildPath = (targetFolder: MediaFolder): MediaFolder[] => {
      if (!targetFolder.parentId) {
        return [targetFolder];
      }
      
      const parent = allFolders.find(f => f.id === targetFolder.parentId);
      if (!parent) {
        return [targetFolder];
      }
      
      return [...buildPath(parent), targetFolder];
    };

    const path = buildPath(folder);
    setCurrentFolder(folder);
    setFolderPath(path);
  }, [setCurrentFolder, setFolderPath]);

  // Modal actions
  const openUploadModal = useCallback(() => {
    setState(prev => ({ ...prev, showUploadModal: true }));
  }, []);

  const closeUploadModal = useCallback(() => {
    setState(prev => ({ ...prev, showUploadModal: false }));
  }, []);

  const openCreateFolderModal = useCallback(() => {
    setState(prev => ({ ...prev, showCreateFolderModal: true }));
  }, []);

  const closeCreateFolderModal = useCallback(() => {
    setState(prev => ({ ...prev, showCreateFolderModal: false }));
  }, []);

  const openDeleteConfirmModal = useCallback(() => {
    setState(prev => ({ ...prev, showDeleteConfirmModal: true }));
  }, []);

  const closeDeleteConfirmModal = useCallback(() => {
    setState(prev => ({ ...prev, showDeleteConfirmModal: false }));
  }, []);

  const openFileDetailsModal = useCallback(() => {
    setState(prev => ({ ...prev, showFileDetailsModal: true }));
  }, []);

  const closeFileDetailsModal = useCallback(() => {
    setState(prev => ({ ...prev, showFileDetailsModal: false }));
  }, []);

  // Computed values
  const selectedCount = useMemo(() => state.selectedFiles.length, [state.selectedFiles]);
  const hasSelection = useMemo(() => selectedCount > 0, [selectedCount]);

  return {
    // State
    ...state,
    
    // Computed
    selectedCount,
    hasSelection,
    
    // Actions
    selectFile,
    selectMultipleFiles,
    clearSelection,
    setViewMode,
    setSearchTerm,
    setSelectedTypes,
    setSort,
    setCurrentFolder,
    setFolderPath,
    navigateToFolder,
    openUploadModal,
    closeUploadModal,
    openCreateFolderModal,
    closeCreateFolderModal,
    openDeleteConfirmModal,
    closeDeleteConfirmModal,
    openFileDetailsModal,
    closeFileDetailsModal,
  };
}
