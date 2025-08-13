import { useState, useEffect, useCallback, useRef } from 'react'
import { editorAPI, EditorContent, EditorState, EditorConfig, EditorSaveRequest, EditorSearchParams } from '@/lib/api/editor'

interface UseEditorOptions {
  contentId?: string
  autoSave?: boolean
  autoSaveInterval?: number
}

interface UseEditorReturn {
  // Data
  content: EditorContent | null
  config: EditorConfig | null
  state: EditorState
  isLoading: boolean
  error: string | null
  
  // Actions
  loadContent: (id: string) => Promise<void>
  loadConfig: () => Promise<void>
  createContent: (data: EditorSaveRequest) => Promise<EditorContent>
  updateContent: (data: Partial<EditorSaveRequest>) => Promise<void>
  saveContent: (data: EditorSaveRequest) => Promise<void>
  publishContent: () => Promise<void>
  unpublishContent: () => Promise<void>
  deleteContent: () => Promise<void>
  duplicateContent: () => Promise<EditorContent>
  exportContent: (format: string) => Promise<Blob>
  importContent: (file: File, format: string) => Promise<EditorContent>
  
  // Auto-save
  enableAutoSave: () => void
  disableAutoSave: () => void
  setAutoSaveInterval: (interval: number) => void
  
  // State management
  setDirty: (dirty: boolean) => void
  setContent: (content: Partial<EditorContent>) => void
  resetContent: () => void
  
  // Search
  searchContent: (params: EditorSearchParams) => Promise<{
    content: EditorContent[]
    total: number
    page: number
    limit: number
    totalPages: number
  }>
}

export function useEditor(options: UseEditorOptions = {}): UseEditorReturn {
  const { contentId, autoSave = true, autoSaveInterval = 30000 } = options
  
  const [content, setContentState] = useState<EditorContent | null>(null)
  const [config, setConfig] = useState<EditorConfig | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(autoSave)
  const [autoSaveIntervalState, setAutoSaveIntervalState] = useState(autoSaveInterval)
  
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const originalContentRef = useRef<EditorContent | null>(null)

  // Load content
  const loadContent = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const data = await editorAPI.getContent(id)
      setContentState(data)
      originalContentRef.current = data
      setIsDirty(false)
      setLastSaved(new Date().toISOString())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load config
  const loadConfig = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const data = await editorAPI.getConfig()
      setConfig(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load editor config')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Create content
  const createContent = useCallback(async (data: EditorSaveRequest): Promise<EditorContent> => {
    setIsSaving(true)
    setError(null)
    
    try {
      const newContent = await editorAPI.createContent(data)
      setContentState(newContent)
      originalContentRef.current = newContent
      setIsDirty(false)
      setLastSaved(new Date().toISOString())
      return newContent
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create content')
      throw err
    } finally {
      setIsSaving(false)
    }
  }, [])

  // Update content
  const updateContent = useCallback(async (data: Partial<EditorSaveRequest>) => {
    if (!content?.id) return
    
    setIsSaving(true)
    setError(null)
    
    try {
      const updatedContent = await editorAPI.updateContent(content.id, {
        title: content.title,
        content: content.content,
        excerpt: content.excerpt,
        status: content.status,
        tags: content.tags,
        categories: content.categories,
        featuredImage: content.featuredImage,
        seoTitle: content.seoTitle,
        seoDescription: content.seoDescription,
        seoKeywords: content.seoKeywords,
        allowComments: content.allowComments,
        isPublic: content.isPublic,
        ...data
      })
      
      setContentState(updatedContent)
      originalContentRef.current = updatedContent
      setIsDirty(false)
      setLastSaved(new Date().toISOString())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update content')
      throw err
    } finally {
      setIsSaving(false)
    }
  }, [content])

  // Save content (alias for update)
  const saveContent = useCallback(async (data: EditorSaveRequest) => {
    await updateContent(data)
  }, [updateContent])

  // Publish content
  const publishContent = useCallback(async () => {
    if (!content?.id) return
    
    setIsSaving(true)
    setError(null)
    
    try {
      const publishedContent = await editorAPI.publishContent(content.id)
      setContentState(publishedContent)
      originalContentRef.current = publishedContent
      setIsDirty(false)
      setLastSaved(new Date().toISOString())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish content')
      throw err
    } finally {
      setIsSaving(false)
    }
  }, [content])

  // Unpublish content
  const unpublishContent = useCallback(async () => {
    if (!content?.id) return
    
    setIsSaving(true)
    setError(null)
    
    try {
      const unpublishedContent = await editorAPI.unpublishContent(content.id)
      setContentState(unpublishedContent)
      originalContentRef.current = unpublishedContent
      setIsDirty(false)
      setLastSaved(new Date().toISOString())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unpublish content')
      throw err
    } finally {
      setIsSaving(false)
    }
  }, [content])

  // Delete content
  const deleteContent = useCallback(async () => {
    if (!content?.id) return
    
    setIsSaving(true)
    setError(null)
    
    try {
      await editorAPI.deleteContent(content.id)
      setContentState(null)
      originalContentRef.current = null
      setIsDirty(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete content')
      throw err
    } finally {
      setIsSaving(false)
    }
  }, [content])

  // Duplicate content
  const duplicateContent = useCallback(async (): Promise<EditorContent> => {
    if (!content?.id) throw new Error('No content to duplicate')
    
    setIsSaving(true)
    setError(null)
    
    try {
      const duplicatedContent = await editorAPI.duplicateContent(content.id)
      return duplicatedContent
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate content')
      throw err
    } finally {
      setIsSaving(false)
    }
  }, [content])

  // Export content
  const exportContent = useCallback(async (format: string): Promise<Blob> => {
    if (!content?.id) throw new Error('No content to export')
    
    try {
      return await editorAPI.exportContent(content.id, format)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export content')
      throw err
    }
  }, [content])

  // Import content
  const importContent = useCallback(async (file: File, format: string): Promise<EditorContent> => {
    setIsSaving(true)
    setError(null)
    
    try {
      const importedContent = await editorAPI.importContent(file, format)
      setContentState(importedContent)
      originalContentRef.current = importedContent
      setIsDirty(false)
      setLastSaved(new Date().toISOString())
      return importedContent
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import content')
      throw err
    } finally {
      setIsSaving(false)
    }
  }, [])

  // Auto-save functions
  const enableAutoSave = useCallback(() => {
    setAutoSaveEnabled(true)
  }, [])

  const disableAutoSave = useCallback(() => {
    setAutoSaveEnabled(false)
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
      autoSaveTimeoutRef.current = null
    }
  }, [])

  const setAutoSaveInterval = useCallback((interval: number) => {
    setAutoSaveIntervalState(interval)
  }, [])

  // State management
  const setDirty = useCallback((dirty: boolean) => {
    setIsDirty(dirty)
  }, [])

  const setContent = useCallback((newContent: Partial<EditorContent>) => {
    if (!content) return
    
    const updatedContent = { ...content, ...newContent }
    setContentState(updatedContent)
    
    // Check if content has changed
    const hasChanged = JSON.stringify(updatedContent) !== JSON.stringify(originalContentRef.current)
    setIsDirty(hasChanged)
    
    // Auto-save if enabled and content is dirty
    if (autoSaveEnabled && hasChanged && content.id) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
      
      autoSaveTimeoutRef.current = setTimeout(async () => {
        try {
          await editorAPI.autoSave(content.id, updatedContent.content)
          setLastSaved(new Date().toISOString())
        } catch (err) {
          console.error('Auto-save failed:', err)
        }
      }, autoSaveIntervalState)
    }
  }, [content, autoSaveEnabled, autoSaveIntervalState])

  const resetContent = useCallback(() => {
    if (originalContentRef.current) {
      setContentState(originalContentRef.current)
      setIsDirty(false)
    }
  }, [])

  // Search content
  const searchContent = useCallback(async (params: EditorSearchParams) => {
    try {
      return await editorAPI.searchContent(params as Record<string, unknown>)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search content')
      throw err
    }
  }, [])

  // Auto-load on mount
  useEffect(() => {
    if (contentId) {
      loadContent(contentId)
    }
    loadConfig()
  }, [contentId, loadContent, loadConfig])

  // Cleanup auto-save timeout
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [])

  // Editor state
  const state: EditorState = {
    content: content || {} as EditorContent,
    isDirty,
    isSaving,
    lastSaved: lastSaved || undefined,
    autoSaveEnabled,
    autoSaveInterval: autoSaveIntervalState,
    version: content?.version || 1,
    collaborators: [], // TODO: Implement collaborators
    comments: [], // TODO: Implement comments
    history: [] // TODO: Implement history
  }

  return {
    // Data
    content,
    config,
    state,
    isLoading,
    error,
    
    // Actions
    loadContent,
    loadConfig,
    createContent,
    updateContent,
    saveContent,
    publishContent,
    unpublishContent,
    deleteContent,
    duplicateContent,
    exportContent,
    importContent,
    
    // Auto-save
    enableAutoSave,
    disableAutoSave,
    setAutoSaveInterval,
    
    // State management
    setDirty,
    setContent,
    resetContent,
    
    // Search
    searchContent
  }
}
