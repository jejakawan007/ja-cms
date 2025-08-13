import { prisma } from '@/utils/database';
import { logger } from '@/utils/logger';

export interface DashboardSettings {
  id?: string;
  userId: string;
  layoutMode: string;
  theme: string;
  widgets: any;
  layout: any;
  appearance: any;
  data: any;
  gridLayout?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

export class DashboardSettingsService {
  /**
   * Get dashboard settings for a user
   */
  static async getSettings(userId: string): Promise<DashboardSettings | null> {
    try {
      const settings = await prisma.dashboardSettings.findUnique({
        where: { userId }
      });
      
      return settings;
    } catch (error) {
      logger.error('Error getting dashboard settings:', error);
      throw new Error('Failed to get dashboard settings');
    }
  }

  /**
   * Create or update dashboard settings
   */
  static async createOrUpdateSettings(userId: string, data: Partial<DashboardSettings>): Promise<DashboardSettings> {
    try {
      const settings = await prisma.dashboardSettings.upsert({
        where: { userId },
        update: {
          ...data,
          updatedAt: new Date()
        },
        create: {
          userId,
          layoutMode: data.layoutMode || 'default',
          theme: data.theme || 'neutral',
          widgets: data.widgets || {
            quickActions: {
              enabled: true,
              maxActions: 8,
              showIcons: true,
            },
            recentActivity: {
              enabled: true,
              maxItems: 8,
              showUserAvatars: true,
              showTimestamps: true,
            },
            analyticsChart: {
              enabled: true,
              defaultMetric: 'overview',
              timeRange: '30d',
              chartType: 'area',
            },
            statsCards: {
              enabled: true,
              showSystemHealth: true,
              showSecurityStatus: true,
              layout: 'grid',
            },
          },
          layout: data.layout || {
            gridColumns: 3,
            widgetSpacing: 'normal',
          },
          appearance: data.appearance || {
            theme: 'system',
            cardStyle: 'flat',
          },
          data: data.data || {
            retentionPeriod: 24,
            cacheEnabled: true,
          },
          gridLayout: data.gridLayout || null,
        }
      });
      
      return settings;
    } catch (error) {
      logger.error('Error creating/updating dashboard settings:', error);
      throw new Error('Failed to create/update dashboard settings');
    }
  }

  /**
   * Update grid layout specifically
   */
  static async updateGridLayout(userId: string, gridLayout: any): Promise<DashboardSettings> {
    try {
      const settings = await prisma.dashboardSettings.upsert({
        where: { userId },
        update: {
          gridLayout,
          updatedAt: new Date()
        },
        create: {
          userId,
          layoutMode: 'custom',
          theme: 'neutral',
          widgets: {
            quickActions: {
              enabled: true,
              maxActions: 8,
              showIcons: true,
            },
            recentActivity: {
              enabled: true,
              maxItems: 8,
              showUserAvatars: true,
              showTimestamps: true,
            },
            analyticsChart: {
              enabled: true,
              defaultMetric: 'overview',
              timeRange: '30d',
              chartType: 'area',
            },
            statsCards: {
              enabled: true,
              showSystemHealth: true,
              showSecurityStatus: true,
              layout: 'grid',
            },
          },
          layout: {
            gridColumns: 3,
            widgetSpacing: 'normal',
          },
          appearance: {
            theme: 'system',
            cardStyle: 'flat',
          },
          data: {
            retentionPeriod: 24,
            cacheEnabled: true,
          },
          gridLayout
        }
      });
      
      return settings;
    } catch (error) {
      logger.error('Error updating grid layout:', error);
      throw new Error('Failed to update grid layout');
    }
  }

  /**
   * Delete dashboard settings
   */
  static async deleteSettings(userId: string): Promise<void> {
    try {
      await prisma.dashboardSettings.delete({
        where: { userId }
      });
    } catch (error) {
      logger.error('Error deleting dashboard settings:', error);
      throw new Error('Failed to delete dashboard settings');
    }
  }

  /**
   * Reset dashboard settings to default
   */
  static async resetSettings(userId: string): Promise<DashboardSettings> {
    try {
      const defaultSettings = {
        layoutMode: 'default',
        theme: 'neutral',
        widgets: {
          quickActions: {
            enabled: true,
            maxActions: 8,
            showIcons: true
          },
          recentActivity: {
            enabled: true,
            maxItems: 8,
            showUserAvatars: true,
            showTimestamps: true
          },
          analyticsChart: {
            enabled: true,
            defaultMetric: 'overview',
            timeRange: '30d',
            chartType: 'area'
          },
          statsCards: {
            enabled: true,
            showSystemHealth: true,
            showSecurityStatus: true,
            layout: 'grid'
          }
        },
        layout: {
          gridColumns: 3,
          widgetSpacing: 'normal'
        },
        appearance: {
          theme: 'system',
          cardStyle: 'flat'
        },
        data: {
          retentionPeriod: 24,
          cacheEnabled: true
        },
        gridLayout: null
      };

      const settings = await prisma.dashboardSettings.upsert({
        where: { userId },
        update: {
          ...defaultSettings,
          updatedAt: new Date()
        },
        create: {
          userId,
          ...defaultSettings
        }
      });
      
      return settings;
    } catch (error) {
      logger.error('Error resetting dashboard settings:', error);
      throw new Error('Failed to reset dashboard settings');
    }
  }

  /**
   * Get or create dashboard settings for a user
   */
  static async getOrCreateSettings(userId: string): Promise<DashboardSettings> {
    try {
      let settings = await this.getSettings(userId);
      
      if (!settings) {
        settings = await this.resetSettings(userId);
      }
      
      return settings;
    } catch (error) {
      logger.error('Error getting or creating dashboard settings:', error);
      throw new Error('Failed to get or create dashboard settings');
    }
  }
}
