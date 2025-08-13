import { apiClient } from './client'

export interface SettingValue {
  id: string
  category: string
  key: string
  value: any
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  description?: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export interface SettingsCategory {
  id: string
  name: string
  description: string
  icon: string
  settingsCount: number
  isRequired: boolean
  isAdvanced: boolean
  lastModified?: string
}

export interface SettingsUpdateRequest {
  category: string
  settings: Record<string, any>
}

export interface SettingsValidationError {
  key: string
  message: string
  value: any
}

export class SettingsAPI {
  private client: typeof apiClient

  constructor(client: typeof apiClient = apiClient) {
    this.client = client
  }

  /**
   * Get all settings grouped by category
   */
  async getSettings(category?: string): Promise<Record<string, any>> {
    const url = category ? `/settings/${category}` : '/settings'
    const response = await this.client.get<Record<string, any>>(url)
    return response.data!
  }

  /**
   * Get settings for a specific category
   */
  async getCategorySettings(category: string): Promise<Record<string, any>> {
    const response = await this.client.get<Record<string, any>>(`/settings/${category}`)
    return response.data!
  }

  /**
   * Get a single setting value
   */
  async getSetting(category: string, key: string): Promise<SettingValue> {
    const response = await this.client.get<SettingValue>(`/settings/${category}/${key}`)
    return response.data!
  }

  /**
   * Update a single setting
   */
  async updateSetting(category: string, key: string, value: any): Promise<SettingValue> {
    const response = await this.client.put<SettingValue>(`/settings/${category}/${key}`, {
      value
    })
    return response.data!
  }

  /**
   * Update multiple settings in a category
   */
  async updateCategorySettings(category: string, settings: Record<string, any>): Promise<Record<string, SettingValue>> {
    const response = await this.client.put<Record<string, SettingValue>>(`/settings/${category}`, {
      settings
    })
    return response.data!
  }

  /**
   * Bulk update settings across multiple categories
   */
  async bulkUpdateSettings(updates: SettingsUpdateRequest[]): Promise<Record<string, SettingValue>> {
    const response = await this.client.put<Record<string, SettingValue>>('/settings/bulk', {
      updates
    })
    return response.data!
  }

  /**
   * Reset settings to defaults
   */
  async resetSettings(category?: string): Promise<void> {
    const url = category ? `/settings/${category}/reset` : '/settings/reset'
    await this.client.post(url)
  }

  /**
   * Get settings categories
   */
  async getCategories(): Promise<SettingsCategory[]> {
    const response = await this.client.get<SettingsCategory[]>('/settings/categories')
    return response.data!
  }

  /**
   * Export settings
   */
  async exportSettings(categories?: string[]): Promise<Record<string, any>> {
    const params = categories ? { categories: categories.join(',') } : {}
    const response = await this.client.get<Record<string, any>>('/settings/export', { params })
    return response.data!
  }

  /**
   * Import settings
   */
  async importSettings(settings: Record<string, any>): Promise<Record<string, SettingValue>> {
    const response = await this.client.post<Record<string, SettingValue>>('/settings/import', {
      settings
    })
    return response.data!
  }

  /**
   * Validate settings before saving
   */
  async validateSettings(category: string, settings: Record<string, any>): Promise<SettingsValidationError[]> {
    const response = await this.client.post<{ errors: SettingsValidationError[] }>(`/settings/${category}/validate`, {
      settings
    })
    return response.data!.errors || []
  }

  /**
   * Get settings schema for a category
   */
  async getSettingsSchema(category: string): Promise<any> {
    const response = await this.client.get<any>(`/settings/${category}/schema`)
    return response.data!
  }

  /**
   * Get public settings (for frontend use)
   */
  async getPublicSettings(): Promise<Record<string, any>> {
    const response = await this.client.get<Record<string, any>>('/settings/public')
    return response.data!
  }
}

// Default settings API instance
export const settingsAPI = new SettingsAPI(apiClient)
