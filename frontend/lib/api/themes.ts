import { apiClient } from './client'

export interface ThemeSetting {
  id: string
  key: string
  value: any
  type: 'color' | 'typography' | 'spacing' | 'layout' | 'image' | 'text' | 'number' | 'select'
  label: string
  description?: string
  section: string
  transport: 'refresh' | 'postMessage'
  choices?: Record<string, string>
  min?: number
  max?: number
  step?: number
  default: any
}

export interface ThemeSection {
  id: string
  title: string
  description?: string
  icon: string
  settings: ThemeSetting[]
  priority: number
}

export interface ThemeConfig {
  id: string
  name: string
  description: string
  version: string
  author: string
  authorUrl?: string
  screenshot?: string
  sections: ThemeSection[]
  supports: {
    customColors: boolean
    customTypography: boolean
    customSpacing: boolean
    customLayout: boolean
    responsive: boolean
    darkMode: boolean
  }
  defaultSettings: Record<string, any>
  customCSS?: string
  customJS?: string
}

export interface CustomizerState {
  settings: Record<string, any>
  isDirty: boolean
  hasUnsavedChanges: boolean
  lastSaved?: string
  previewUrl?: string
  device: 'desktop' | 'tablet' | 'mobile'
  section: string
  panel: string
}

export interface CustomizerChange {
  key: string
  value: any
  section: string
  timestamp: string
}

export interface CustomizerPreview {
  url: string
  device: 'desktop' | 'tablet' | 'mobile'
  settings: Record<string, any>
  timestamp: string
}

export interface ThemeExport {
  name: string
  description: string
  settings: Record<string, any>
  customCSS?: string
  customJS?: string
  version: string
  exportedAt: string
}

export class ThemesAPI {
  private client: typeof apiClient

  constructor(client: typeof apiClient = apiClient) {
    this.client = client
  }

  /**
   * Get theme configuration
   */
  async getThemeConfig(): Promise<ThemeConfig> {
    const response = await this.client.get<ThemeConfig>('/themes/config')
    return response.data!
  }

  /**
   * Get current theme settings
   */
  async getThemeSettings(): Promise<Record<string, any>> {
    const response = await this.client.get<Record<string, any>>('/themes/settings')
    return response.data!
  }

  /**
   * Update theme setting
   */
  async updateSetting(key: string, value: any): Promise<ThemeSetting> {
    const response = await this.client.put<ThemeSetting>(`/themes/settings/${key}`, {
      value
    })
    return response.data!
  }

  /**
   * Update multiple settings
   */
  async updateSettings(settings: Record<string, any>): Promise<Record<string, ThemeSetting>> {
    const response = await this.client.put<Record<string, ThemeSetting>>('/themes/settings', {
      settings
    })
    return response.data!
  }

  /**
   * Reset settings to defaults
   */
  async resetSettings(section?: string): Promise<void> {
    const url = section ? `/themes/settings/reset?section=${section}` : '/themes/settings/reset'
    await this.client.post(url)
  }

  /**
   * Get customizer state
   */
  async getCustomizerState(): Promise<CustomizerState> {
    const response = await this.client.get<CustomizerState>('/themes/customizer/state')
    return response.data!
  }

  /**
   * Update customizer state
   */
  async updateCustomizerState(state: Partial<CustomizerState>): Promise<CustomizerState> {
    const response = await this.client.put<CustomizerState>('/themes/customizer/state', state)
    return response.data!
  }

  /**
   * Get preview URL
   */
  async getPreviewUrl(settings?: Record<string, any>, device?: string): Promise<string> {
    const params: Record<string, any> = {}
    if (settings) params['settings'] = JSON.stringify(settings)
    if (device) params['device'] = device
    
    const response = await this.client.get<{ url: string }>('/themes/customizer/preview', { params })
    return response.data!.url
  }

  /**
   * Save customizer changes
   */
  async saveCustomizerChanges(changes: CustomizerChange[]): Promise<void> {
    await this.client.post('/themes/customizer/save', { changes })
  }

  /**
   * Publish theme changes
   */
  async publishThemeChanges(): Promise<void> {
    await this.client.post('/themes/customizer/publish')
  }

  /**
   * Get theme sections
   */
  async getThemeSections(): Promise<ThemeSection[]> {
    const response = await this.client.get<ThemeSection[]>('/themes/sections')
    return response.data!
  }

  /**
   * Get section settings
   */
  async getSectionSettings(sectionId: string): Promise<ThemeSetting[]> {
    const response = await this.client.get<ThemeSetting[]>(`/api/themes/sections/${sectionId}/settings`)
    return response.data!
  }

  /**
   * Update section settings
   */
  async updateSectionSettings(sectionId: string, settings: Record<string, any>): Promise<Record<string, ThemeSetting>> {
    const response = await this.client.put<Record<string, ThemeSetting>>(`/api/themes/sections/${sectionId}/settings`, {
      settings
    })
    return response.data!
  }

  /**
   * Export theme
   */
  async exportTheme(name?: string, description?: string): Promise<ThemeExport> {
    const response = await this.client.post<ThemeExport>('/themes/export', {
      name,
      description
    })
    return response.data!
  }

  /**
   * Import theme
   */
  async importTheme(themeData: ThemeExport): Promise<void> {
    await this.client.post('/themes/import', themeData)
  }

  /**
   * Get theme history
   */
  async getThemeHistory(): Promise<CustomizerChange[]> {
    const response = await this.client.get<CustomizerChange[]>('/themes/history')
    return response.data!
  }

  /**
   * Revert to previous version
   */
  async revertToVersion(timestamp: string): Promise<void> {
    await this.client.post(`/themes/revert/${timestamp}`)
  }

  /**
   * Get theme statistics
   */
  async getThemeStats(): Promise<{
    totalChanges: number
    lastModified: string
    mostChangedSections: string[]
    customCSS: boolean
    customJS: boolean
  }> {
    const response = await this.client.get<{
      totalChanges: number
      lastModified: string
      mostChangedSections: string[]
      customCSS: boolean
      customJS: boolean
    }>('/themes/stats')
    return response.data!
  }

  /**
   * Get device previews
   */
  async getDevicePreviews(): Promise<CustomizerPreview[]> {
    const response = await this.client.get<CustomizerPreview[]>('/themes/customizer/previews')
    return response.data!
  }

  /**
   * Save device preview
   */
  async saveDevicePreview(preview: Omit<CustomizerPreview, 'timestamp'>): Promise<CustomizerPreview> {
    const response = await this.client.post<CustomizerPreview>('/themes/customizer/previews', preview)
    return response.data!
  }

  /**
   * Delete device preview
   */
  async deleteDevicePreview(timestamp: string): Promise<void> {
    await this.client.delete(`/themes/customizer/previews/${timestamp}`)
  }

  /**
   * Get custom CSS
   */
  async getCustomCSS(): Promise<string> {
    const response = await this.client.get<{ css: string }>('/themes/custom-css')
    return response.data!.css
  }

  /**
   * Update custom CSS
   */
  async updateCustomCSS(css: string): Promise<void> {
    await this.client.put('/themes/custom-css', { css })
  }

  /**
   * Get custom JS
   */
  async getCustomJS(): Promise<string> {
    const response = await this.client.get<{ js: string }>('/themes/custom-js')
    return response.data!.js
  }

  /**
   * Update custom JS
   */
  async updateCustomJS(js: string): Promise<void> {
    await this.client.put('/themes/custom-js', { js })
  }

  /**
   * Validate CSS
   */
  async validateCSS(css: string): Promise<{
    valid: boolean
    errors: Array<{
      line: number
      column: number
      message: string
    }>
  }> {
    const response = await this.client.post<{
      valid: boolean
      errors: Array<{
        line: number
        column: number
        message: string
      }>
    }>('/themes/validate-css', { css })
    return response.data!
  }

  /**
   * Validate JS
   */
  async validateJS(js: string): Promise<{
    valid: boolean
    errors: Array<{
      line: number
      column: number
      message: string
    }>
  }> {
    const response = await this.client.post<{
      valid: boolean
      errors: Array<{
        line: number
        column: number
        message: string
      }>
    }>('/themes/validate-js', { js })
    return response.data!
  }

  /**
   * Get theme templates
   */
  async getThemeTemplates(): Promise<Array<{
    id: string
    name: string
    description: string
    screenshot: string
    settings: Record<string, any>
  }>> {
    const response = await this.client.get<Array<{
      id: string
      name: string
      description: string
      screenshot: string
      settings: Record<string, any>
    }>>('/themes/templates')
    return response.data!
  }

  /**
   * Apply theme template
   */
  async applyThemeTemplate(templateId: string): Promise<void> {
    await this.client.post(`/themes/templates/${templateId}/apply`)
  }
}

// Default themes API instance
export const themesAPI = new ThemesAPI()
