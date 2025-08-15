import { useState, useEffect, useCallback } from 'react'
import { settingsAPI, SettingsCategory, /* SettingValue, */ SettingsValidationError } from '@/lib/api/settings'

interface UseSettingsOptions {
  category?: string
  autoLoad?: boolean
}

interface UseSettingsReturn {
  // Data
  settings: Record<string, any>
  categories: SettingsCategory[]
  isLoading: boolean
  error: string | null
  
  // Actions
  loadSettings: (category?: string) => Promise<void>
  loadCategories: () => Promise<void>
  updateSetting: (key: string, value: any) => Promise<void>
  updateCategorySettings: (settings: Record<string, any>) => Promise<void>
  resetSettings: (category?: string) => Promise<void>
  exportSettings: (categories?: string[]) => Promise<Record<string, any>>
  importSettings: (settings: Record<string, any>) => Promise<void>
  validateSettings: (settings: Record<string, any>) => Promise<SettingsValidationError[]>
  
  // State
  hasChanges: boolean
  isSaving: boolean
  validationErrors: SettingsValidationError[]
}

export function useSettings(options: UseSettingsOptions = {}): UseSettingsReturn {
  const { category, autoLoad = true } = options
  
  const [settings, setSettings] = useState<Record<string, any>>({})
  const [categories, setCategories] = useState<SettingsCategory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [validationErrors, setValidationErrors] = useState<SettingsValidationError[]>([])
  const [originalSettings, setOriginalSettings] = useState<Record<string, any>>({})

  // Load settings
  const loadSettings = useCallback(async (targetCategory?: string) => {
    if (!targetCategory && !category) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const targetCat = targetCategory || category!
      const data = await settingsAPI.getCategorySettings(targetCat)
      setSettings(data)
      setOriginalSettings(data)
      setHasChanges(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings')
    } finally {
      setIsLoading(false)
    }
  }, [category])

  // Load categories
  const loadCategories = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const data = await settingsAPI.getCategories()
      setCategories(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Update single setting
  const updateSetting = useCallback(async (key: string, value: any) => {
    if (!category) return
    
    setIsSaving(true)
    setError(null)
    
    try {
      await settingsAPI.updateSetting(category, key, value)
      
      // Update local state
      setSettings(prev => ({
        ...prev,
        [key]: value
      }))
      
      // Check for changes
      const newSettings = { ...settings, [key]: value }
      const hasChanges = JSON.stringify(newSettings) !== JSON.stringify(originalSettings)
      setHasChanges(hasChanges)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update setting')
      throw err
    } finally {
      setIsSaving(false)
    }
  }, [category, settings, originalSettings])

  // Update category settings
  const updateCategorySettings = useCallback(async (newSettings: Record<string, any>) => {
    if (!category) return
    
    setIsSaving(true)
    setError(null)
    
    try {
      await settingsAPI.updateCategorySettings(category, newSettings)
      
      // Update local state
      setSettings(newSettings)
      setOriginalSettings(newSettings)
      setHasChanges(false)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings')
      throw err
    } finally {
      setIsSaving(false)
    }
  }, [category])

  // Reset settings
  const resetSettings = useCallback(async (targetCategory?: string) => {
    const targetCat = targetCategory || category
    if (!targetCat) return
    
    setIsSaving(true)
    setError(null)
    
    try {
      await settingsAPI.resetSettings(targetCat)
      
      // Reload settings
      await loadSettings(targetCat)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset settings')
      throw err
    } finally {
      setIsSaving(false)
    }
  }, [category, loadSettings])

  // Export settings
  const exportSettings = useCallback(async (targetCategories?: string[]) => {
    try {
      return await settingsAPI.exportSettings(targetCategories)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export settings')
      throw err
    }
  }, [])

  // Import settings
  const importSettings = useCallback(async (importedSettings: Record<string, any>) => {
    setIsSaving(true)
    setError(null)
    
    try {
      await settingsAPI.importSettings(importedSettings)
      
      // Reload current settings
      if (category) {
        await loadSettings(category)
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import settings')
      throw err
    } finally {
      setIsSaving(false)
    }
  }, [category, loadSettings])

  // Validate settings
  const validateSettings = useCallback(async (settingsToValidate: Record<string, any>) => {
    if (!category) return []
    
    try {
      const errors = await settingsAPI.validateSettings(category, settingsToValidate)
      setValidationErrors(errors)
      return errors
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate settings')
      return []
    }
  }, [category])

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad) {
      if (category) {
        loadSettings()
      }
      loadCategories()
    }
  }, [autoLoad, category, loadSettings, loadCategories])

  // Track changes
  useEffect(() => {
    const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings)
    setHasChanges(hasChanges)
  }, [settings, originalSettings])

  return {
    // Data
    settings,
    categories,
    isLoading,
    error,
    
    // Actions
    loadSettings,
    loadCategories,
    updateSetting,
    updateCategorySettings,
    resetSettings,
    exportSettings,
    importSettings,
    validateSettings,
    
    // State
    hasChanges,
    isSaving,
    validationErrors
  }
}

// Hook for public settings (frontend use)
export function usePublicSettings() {
  const [settings, setSettings] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadPublicSettings = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const data = await settingsAPI.getPublicSettings()
      setSettings(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load public settings')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPublicSettings()
  }, [loadPublicSettings])

  return {
    settings,
    isLoading,
    error,
    reload: loadPublicSettings
  }
}
