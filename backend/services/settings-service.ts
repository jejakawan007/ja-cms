import { PrismaClient } from '@prisma/client';
import { EventEmitter } from 'events';

const prisma = new PrismaClient();

export interface SettingValue {
  id: string;
  category: string;
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SettingsCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  settingsCount: number;
  isRequired: boolean;
  isAdvanced: boolean;
  lastModified?: Date;
}

export interface SettingsUpdateRequest {
  category: string;
  settings: Record<string, any>;
}

export interface SettingsValidationError {
  key: string;
  message: string;
  value: any;
}

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export type SettingValidator = (value: any) => Promise<ValidationResult> | ValidationResult;

interface CreateSettingData {
  key: string;
  value: string;
  type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON' | 'TEXT';
  isPublic?: boolean;
}

interface UpdateSettingData {
  value?: string;
  type?: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON' | 'TEXT';
  isPublic?: boolean;
}

interface SettingWhereInput {
  isPublic?: boolean;
}

export class SettingsService extends EventEmitter {
  private static validators: Map<string, SettingValidator> = new Map();
  private static cache: Map<string, any> = new Map();
  private static cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor() {
    super();
    this.initializeValidators();
  }

  // Get all settings
  static async getAllSettings(isPublic?: boolean) {
    try {
      const where: SettingWhereInput = {};
      
      if (isPublic !== undefined) {
        where.isPublic = isPublic;
      }

      const settings = await prisma.setting.findMany({
        where,
        orderBy: {
          key: 'asc'
        }
      });

      return settings;
    } catch (error) {
      // Log error for debugging
      throw new Error('Failed to get settings');
    }
  }

  // Get setting by key
  static async getSettingByKey(key: string) {
    try {
      const setting = await prisma.setting.findUnique({
        where: { key }
      });

      return setting;
    } catch (error) {
      // Log error for debugging
      throw new Error('Failed to get setting');
    }
  }

  // Create setting
  static async createSetting(data: CreateSettingData) {
    try {
      const setting = await prisma.setting.create({
        data: {
          key: data.key,
          value: data.value,
          type: data.type,
          isPublic: data.isPublic ?? false
        }
      });

      return setting;
    } catch (error) {
      // Log error for debugging
      throw new Error('Failed to create setting');
    }
  }

  // Update setting
  static async updateSetting(key: string, updateData: UpdateSettingData) {
    try {
      const setting = await prisma.setting.update({
        where: { key },
        data: updateData
      });

      return setting;
    } catch (error) {
      // Log error for debugging
      throw new Error('Failed to update setting');
    }
  }

  // Delete setting
  static async deleteSetting(key: string) {
    try {
      const setting = await prisma.setting.delete({
        where: { key }
      });

      return setting;
    } catch (error) {
      // Log error for debugging
      throw new Error('Failed to delete setting');
    }
  }

  // Get settings by type
  static async getSettingsByType(type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON' | 'TEXT') {
    try {
      const settings = await prisma.setting.findMany({
        where: { type },
        orderBy: {
          key: 'asc'
        }
      });

      return settings;
    } catch (error) {
      // Log error for debugging
      throw new Error('Failed to get settings by type');
    }
  }

  // New methods for enhanced settings management

  /**
   * Get settings grouped by category
   */
  static async getSettings(category?: string): Promise<Record<string, any>> {
    try {
      if (category) {
        return this.getCategorySettings(category);
      }

      const settings = await prisma.setting.findMany();
      const groupedSettings: Record<string, any> = {};

      for (const setting of settings) {
        const category = this.getCategoryFromKey(setting.key);
        if (!groupedSettings[category]) {
          groupedSettings[category] = {};
        }
        groupedSettings[category][setting.key] = this.parseValue(setting.value, setting.type);
      }

      return groupedSettings;
    } catch (error) {
      throw new Error('Failed to get settings');
    }
  }

  /**
   * Get settings for a specific category
   */
  static async getCategorySettings(category: string): Promise<Record<string, any>> {
    try {
      const cached = this.cache.get(category);
      if (cached) {
        return cached;
      }

      const settings = await prisma.setting.findMany({
        where: {
          key: {
            startsWith: `${category}.`
          }
        }
      });

      const categorySettings: Record<string, any> = {};
      for (const setting of settings) {
        categorySettings[setting.key] = this.parseValue(setting.value, setting.type);
      }

      this.cache.set(category, categorySettings);

      // Clear cache after timeout
      setTimeout(() => {
        this.cache.delete(category);
      }, this.cacheTimeout);

      return categorySettings;
    } catch (error) {
      throw new Error('Failed to get category settings');
    }
  }

  /**
   * Update multiple settings in a category
   */
  static async updateCategorySettings(category: string, settings: Record<string, any>): Promise<Record<string, SettingValue>> {
    try {
      const results: Record<string, SettingValue> = {};

      for (const [key, value] of Object.entries(settings)) {
        const fullKey = `${category}.${key}`;
        const type = this.getTypeFromValue(value);
        
        await this.updateSetting(fullKey, {
          value: this.stringifyValue(value),
          type: this.mapType(type)
        });

        results[key] = {
          id: fullKey,
          category,
          key,
          value,
          type,
          description: this.getSettingDescription(category, key),
          isPublic: this.isPublicSetting(category, key),
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }

      // Clear cache
      this.cache.delete(category);

      return results;
    } catch (error) {
      throw new Error('Failed to update category settings');
    }
  }

  /**
   * Get settings categories
   */
  static async getCategories(): Promise<SettingsCategory[]> {
    const categories: SettingsCategory[] = [
      {
        id: 'general',
        name: 'General',
        description: 'Site information and basic configuration',
        icon: 'settings',
        settingsCount: 0,
        isRequired: true,
        isAdvanced: false
      },
      {
        id: 'content',
        name: 'Content',
        description: 'Content display and writing settings',
        icon: 'file-text',
        settingsCount: 0,
        isRequired: true,
        isAdvanced: false
      },
      {
        id: 'technical',
        name: 'Technical',
        description: 'Advanced technical configuration',
        icon: 'code',
        settingsCount: 0,
        isRequired: false,
        isAdvanced: true
      },
      {
        id: 'email',
        name: 'Email',
        description: 'Email configuration and templates',
        icon: 'mail',
        settingsCount: 0,
        isRequired: false,
        isAdvanced: false
      },
      {
        id: 'users',
        name: 'Users',
        description: 'User management and permissions',
        icon: 'users',
        settingsCount: 0,
        isRequired: false,
        isAdvanced: false
      },
      {
        id: 'appearance',
        name: 'Appearance',
        description: 'Theme and display settings',
        icon: 'palette',
        settingsCount: 0,
        isRequired: false,
        isAdvanced: false
      },
      {
        id: 'notifications',
        name: 'Notifications',
        description: 'Notification preferences',
        icon: 'bell',
        settingsCount: 0,
        isRequired: false,
        isAdvanced: false
      },
      {
        id: 'database',
        name: 'Database',
        description: 'Database configuration',
        icon: 'database',
        settingsCount: 0,
        isRequired: false,
        isAdvanced: true
      },
      {
        id: 'security',
        name: 'Security',
        description: 'Security and privacy settings',
        icon: 'shield',
        settingsCount: 0,
        isRequired: false,
        isAdvanced: false
      }
    ];

    // Add counts and last modified dates
    for (const category of categories) {
      const settings = await this.getCategorySettings(category.id);
      category.settingsCount = Object.keys(settings).length;
      
      const lastSetting = await prisma.setting.findFirst({
        where: {
          key: {
            startsWith: `${category.id}.`
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });
      category.lastModified = lastSetting?.updatedAt;
    }

    return categories;
  }

  /**
   * Get public settings (for frontend use)
   */
  static async getPublicSettings(): Promise<Record<string, any>> {
    try {
      const settings = await prisma.setting.findMany({
        where: { isPublic: true }
      });

      const publicSettings: Record<string, any> = {};
      for (const setting of settings) {
        const category = this.getCategoryFromKey(setting.key);
        if (!publicSettings[category]) {
          publicSettings[category] = {};
        }
        publicSettings[category][setting.key] = this.parseValue(setting.value, setting.type);
      }

      return publicSettings;
    } catch (error) {
      throw new Error('Failed to get public settings');
    }
  }

  // Private helper methods

  private static getCategoryFromKey(key: string): string {
    const parts = key.split('.');
    return parts[0] || 'general';
  }

  private static parseValue(value: string, type: string): any {
    switch (type) {
      case 'NUMBER':
        return Number(value);
      case 'BOOLEAN':
        return value === 'true';
      case 'JSON':
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      default:
        return value;
    }
  }

  private static stringifyValue(value: any): string {
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  }

  private static getTypeFromValue(value: any): 'string' | 'number' | 'boolean' | 'object' | 'array' {
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object' && value !== null) return 'object';
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    return 'string';
  }

  private static mapType(type: string): 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON' | 'TEXT' {
    switch (type) {
      case 'number':
        return 'NUMBER';
      case 'boolean':
        return 'BOOLEAN';
      case 'object':
      case 'array':
        return 'JSON';
      default:
        return 'STRING';
    }
  }

  private static getSettingDescription(category: string, key: string): string {
    const descriptions: Record<string, Record<string, string>> = {
      general: {
        'site.title': 'The title of your website',
        'site.tagline': 'A short description of your website',
        'site.url': 'The URL of your website'
      },
      content: {
        'reading.postsPerPage': 'Number of posts to show per page',
        'writing.defaultCategory': 'Default category for new posts'
      }
    };

    return descriptions[category]?.[key] || '';
  }

  private static isPublicSetting(category: string, key: string): boolean {
    const publicSettings = [
      'general.site.title',
      'general.site.tagline',
      'general.site.url',
      'content.reading.postsPerPage',
      'appearance.theme'
    ];

    return publicSettings.includes(`${category}.${key}`);
  }

  private initializeValidators(): void {
    // Email validator
    SettingsService.validators.set('general.site.adminEmail', (value: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return {
        valid: emailRegex.test(value),
        message: 'Invalid email address'
      };
    });

    // URL validator
    SettingsService.validators.set('general.site.url', (value: string) => {
      try {
        new URL(value);
        return { valid: true };
      } catch {
        return {
          valid: false,
          message: 'Invalid URL'
        };
      }
    });

    // Number range validators
    SettingsService.validators.set('content.reading.postsPerPage', (value: number) => {
      return {
        valid: value >= 1 && value <= 100,
        message: 'Posts per page must be between 1 and 100'
      };
    });
  }
}
