import { useState, useEffect, useCallback, useRef } from 'react'
import { themesAPI, ThemeConfig, /* ThemeSetting, */ CustomizerState, CustomizerChange, ThemeExport } from '@/lib/api/themes'

interface UseThemeCustomizerOptions {
  autoLoad?: boolean
  autoSave?: boolean
  autoSaveInterval?: number
}

interface UseThemeCustomizerReturn {
  // Data
  config: ThemeConfig | null
  settings: Record<string, any>
  state: CustomizerState
  isLoading: boolean
  error: string | null
  
  // Actions
  loadConfig: () => Promise<void>
  loadSettings: () => Promise<void>
  updateSetting: (key: string, value: any) => Promise<void>
  updateSettings: (settings: Record<string, any>) => Promise<void>
  resetSettings: (section?: string) => Promise<void>
  saveChanges: () => Promise<void>
  publishChanges: () => Promise<void>
  exportTheme: (name?: string, description?: string) => Promise<ThemeExport>
  importTheme: (themeData: ThemeExport) => Promise<void>
  
  // Preview
  getPreviewUrl: (settings?: Record<string, any>, device?: string) => Promise<string>
  updatePreview: (settings: Record<string, any>) => Promise<void>
  
  // State management
  setDevice: (device: 'desktop' | 'tablet' | 'mobile') => void
  setSection: (section: string) => void
  setPanel: (panel: string) => void
  
  // History
  getHistory: () => Promise<CustomizerChange[]>
  revertToVersion: (timestamp: string) => Promise<void>
  
  // Custom CSS/JS
  getCustomCSS: () => Promise<string>
  updateCustomCSS: (css: string) => Promise<void>
  getCustomJS: () => Promise<string>
  updateCustomJS: (js: string) => Promise<void>
  validateCSS: (css: string) => Promise<{ valid: boolean; errors: any[] }>
  validateJS: (js: string) => Promise<{ valid: boolean; errors: any[] }>
  
  // Templates
  getTemplates: () => Promise<Array<{
    id: string
    name: string
    description: string
    screenshot: string
    settings: Record<string, any>
  }>>
  applyTemplate: (templateId: string) => Promise<void>
}

export function useThemeCustomizer(options: UseThemeCustomizerOptions = {}): UseThemeCustomizerReturn {
  const { autoLoad = true, autoSave = true, autoSaveInterval = 5000 } = options
  
  const [config, setConfig] = useState<ThemeConfig | null>(null)
  const [settings, setSettings] = useState<Record<string, any>>({})
  const [state, setState] = useState<CustomizerState>({
    settings: {},
    isDirty: false,
    hasUnsavedChanges: false,
    device: 'desktop',
    section: 'colors',
    panel: 'general'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // const [originalSettings, setOriginalSettings] = useState<Record<string, any>>({})
  
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const changesRef = useRef<CustomizerChange[]>([])

  // Load theme configuration
  const loadConfig = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const data = await themesAPI.getThemeConfig()
      setConfig(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load theme config')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load current settings
  const loadSettings = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const data = await themesAPI.getThemeSettings()
      setSettings(data)
      // setOriginalSettings(data)
      setState(prev => ({
        ...prev,
        settings: data,
        isDirty: false,
        hasUnsavedChanges: false
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Update single setting
  const updateSetting = useCallback(async (key: string, value: any) => {
    setIsLoading(true)
    setError(null)
    
    try {
      await themesAPI.updateSetting(key, value)
      
      // Update local state
      const newSettings = { ...settings, [key]: value }
      setSettings(newSettings)
      setState(prev => ({
        ...prev,
        settings: newSettings,
        isDirty: true,
        hasUnsavedChanges: true
      }))
      
      // Track change
      const change: CustomizerChange = {
        key,
        value,
        section: config?.sections.find(s => s.settings.some(setting => setting.key === key))?.id || 'general',
        timestamp: new Date().toISOString()
      }
      changesRef.current.push(change)
      
      // Auto-save if enabled
      if (autoSave) {
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current)
        }
        
        autoSaveTimeoutRef.current = setTimeout(async () => {
          try {
            await themesAPI.saveCustomizerChanges(changesRef.current)
            changesRef.current = []
            setState(prev => ({
              ...prev,
              hasUnsavedChanges: false,
              lastSaved: new Date().toISOString()
            }))
          } catch (err) {
            console.error('Auto-save failed:', err)
          }
        }, autoSaveInterval)
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update setting')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [settings, config, autoSave, autoSaveInterval])

  // Update multiple settings
  const updateSettings = useCallback(async (newSettings: Record<string, any>) => {
    setIsLoading(true)
    setError(null)
    
    try {
      await themesAPI.updateSettings(newSettings)
      
      // Update local state
      setSettings(newSettings)
      setState(prev => ({
        ...prev,
        settings: newSettings,
        isDirty: true,
        hasUnsavedChanges: true
      }))
      
      // Track changes
      const changes: CustomizerChange[] = Object.entries(newSettings).map(([key, value]) => ({
        key,
        value,
        section: config?.sections.find(s => s.settings.some(setting => setting.key === key))?.id || 'general',
        timestamp: new Date().toISOString()
      }))
      changesRef.current.push(...changes)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [config])

  // Reset settings
  const resetSettings = useCallback(async (section?: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      await themesAPI.resetSettings(section)
      
      // Reload settings
      await loadSettings()
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset settings')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [loadSettings])

  // Save changes
  const saveChanges = useCallback(async () => {
    if (changesRef.current.length === 0) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      await themesAPI.saveCustomizerChanges(changesRef.current)
      changesRef.current = []
      setState(prev => ({
        ...prev,
        hasUnsavedChanges: false,
        lastSaved: new Date().toISOString()
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Publish changes
  const publishChanges = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      await themesAPI.publishThemeChanges()
      setState(prev => ({
        ...prev,
        isDirty: false,
        hasUnsavedChanges: false
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish changes')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Export theme
  const exportTheme = useCallback(async (name?: string, description?: string): Promise<ThemeExport> => {
    try {
      return await themesAPI.exportTheme(name, description)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export theme')
      throw err
    }
  }, [])

  // Import theme
  const importTheme = useCallback(async (themeData: ThemeExport) => {
    setIsLoading(true)
    setError(null)
    
    try {
      await themesAPI.importTheme(themeData)
      
      // Reload settings
      await loadSettings()
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import theme')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [loadSettings])

  // Get preview URL
  const getPreviewUrl = useCallback(async (previewSettings?: Record<string, any>, device?: string): Promise<string> => {
    try {
      return await themesAPI.getPreviewUrl(previewSettings || settings, device || state.device)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get preview URL')
      throw err
    }
  }, [settings, state.device])

  // Update preview
  const updatePreview = useCallback(async (previewSettings: Record<string, any>) => {
    try {
      const previewUrl = await themesAPI.getPreviewUrl(previewSettings, state.device)
      setState(prev => ({
        ...prev,
        previewUrl
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preview')
      throw err
    }
  }, [state.device])

  // State management
  const setDevice = useCallback((device: 'desktop' | 'tablet' | 'mobile') => {
    setState(prev => ({ ...prev, device }))
  }, [])

  const setSection = useCallback((section: string) => {
    setState(prev => ({ ...prev, section }))
  }, [])

  const setPanel = useCallback((panel: string) => {
    setState(prev => ({ ...prev, panel }))
  }, [])

  // History
  const getHistory = useCallback(async (): Promise<CustomizerChange[]> => {
    try {
      return await themesAPI.getThemeHistory()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get history')
      throw err
    }
  }, [])

  const revertToVersion = useCallback(async (timestamp: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      await themesAPI.revertToVersion(timestamp)
      
      // Reload settings
      await loadSettings()
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revert to version')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [loadSettings])

  // Custom CSS/JS
  const getCustomCSS = useCallback(async (): Promise<string> => {
    try {
      return await themesAPI.getCustomCSS()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get custom CSS')
      throw err
    }
  }, [])

  const updateCustomCSS = useCallback(async (css: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      await themesAPI.updateCustomCSS(css)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update custom CSS')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getCustomJS = useCallback(async (): Promise<string> => {
    try {
      return await themesAPI.getCustomJS()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get custom JS')
      throw err
    }
  }, [])

  const updateCustomJS = useCallback(async (js: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      await themesAPI.updateCustomJS(js)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update custom JS')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const validateCSS = useCallback(async (css: string) => {
    try {
      return await themesAPI.validateCSS(css)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate CSS')
      throw err
    }
  }, [])

  const validateJS = useCallback(async (js: string) => {
    try {
      return await themesAPI.validateJS(js)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate JS')
      throw err
    }
  }, [])

  // Templates
  const getTemplates = useCallback(async () => {
    try {
      return await themesAPI.getThemeTemplates()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get templates')
      throw err
    }
  }, [])

  const applyTemplate = useCallback(async (templateId: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      await themesAPI.applyThemeTemplate(templateId)
      
      // Reload settings
      await loadSettings()
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply template')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [loadSettings])

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad) {
      loadConfig()
      loadSettings()
    }
  }, [autoLoad, loadConfig, loadSettings])

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [])

  return {
    // Data
    config,
    settings,
    state,
    isLoading,
    error,
    
    // Actions
    loadConfig,
    loadSettings,
    updateSetting,
    updateSettings,
    resetSettings,
    saveChanges,
    publishChanges,
    exportTheme,
    importTheme,
    
    // Preview
    getPreviewUrl,
    updatePreview,
    
    // State management
    setDevice,
    setSection,
    setPanel,
    
    // History
    getHistory,
    revertToVersion,
    
    // Custom CSS/JS
    getCustomCSS,
    updateCustomCSS,
    getCustomJS,
    updateCustomJS,
    validateCSS,
    validateJS,
    
    // Templates
    getTemplates,
    applyTemplate
  }
}
