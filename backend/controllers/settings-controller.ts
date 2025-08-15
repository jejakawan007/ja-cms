import { Request, Response } from 'express';
import { SettingsService } from '../services/settings-service';
import { logger } from '../utils/logger';

export class SettingsController {
  // Get all settings
  static async getAllSettings(req: Request, res: Response) {
    try {
      const { isPublic } = req.query;
      const settings = await SettingsService.getAllSettings(isPublic === 'true');
      
      res.status(200).json({
        success: true,
        data: settings,
        message: 'Settings retrieved successfully',
      });
    } catch (error) {
      logger.error('Error in getAllSettings:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve settings',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get setting by key
  static async getSettingByKey(req: Request, res: Response) {
    try {
      const { key } = req.params;
      const setting = await SettingsService.getSettingByKey(key);
      
      if (!setting) {
        return res.status(404).json({
          success: false,
          error: 'Setting not found',
          message: 'Setting with the specified key was not found',
        });
      }
      
      res.status(200).json({
        success: true,
        data: setting,
        message: 'Setting retrieved successfully',
      });
    } catch (error) {
      logger.error('Error in getSettingByKey:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve setting',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Create setting
  static async createSetting(req: Request, res: Response) {
    try {
      const { key, value, type, isPublic } = req.body;
      
      // Validate type parameter
      const validTypes = ['STRING', 'NUMBER', 'BOOLEAN', 'JSON', 'TEXT'] as const;
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid type parameter',
          message: 'Type must be one of: STRING, NUMBER, BOOLEAN, JSON, TEXT',
        });
      }
      
      const setting = await SettingsService.createSetting({
        key,
        value,
        type,
        isPublic
      });
      
      res.status(201).json({
        success: true,
        data: setting,
        message: 'Setting created successfully',
      });
    } catch (error) {
      logger.error('Error in createSetting:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create setting',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Update setting
  static async updateSetting(req: Request, res: Response) {
    try {
      const { key } = req.params;
      const updateData = req.body;
      
      // Validate type parameter if provided
      if (updateData.type) {
        const validTypes = ['STRING', 'NUMBER', 'BOOLEAN', 'JSON', 'TEXT'] as const;
        if (!validTypes.includes(updateData.type)) {
          return res.status(400).json({
            success: false,
            error: 'Invalid type parameter',
            message: 'Type must be one of: STRING, NUMBER, BOOLEAN, JSON, TEXT',
          });
        }
      }
      
      const setting = await SettingsService.updateSetting(key, updateData);
      
      if (!setting) {
        return res.status(404).json({
          success: false,
          error: 'Setting not found',
          message: 'Setting with the specified key was not found',
        });
      }
      
      res.status(200).json({
        success: true,
        data: setting,
        message: 'Setting updated successfully',
      });
    } catch (error) {
      logger.error('Error in updateSetting:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update setting',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Delete setting
  static async deleteSetting(req: Request, res: Response) {
    try {
      const { key } = req.params;
      const deleted = await SettingsService.deleteSetting(key);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Setting not found',
          message: 'Setting with the specified key was not found',
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Setting deleted successfully',
      });
    } catch (error) {
      logger.error('Error in deleteSetting:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete setting',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get settings by type
  static async getSettingsByType(req: Request, res: Response) {
    try {
      const { type } = req.params;
      
      // Validate type parameter
      const validTypes = ['STRING', 'NUMBER', 'BOOLEAN', 'JSON', 'TEXT'] as const;
      if (!validTypes.includes(type as typeof validTypes[number])) {
        return res.status(400).json({
          success: false,
          error: 'Invalid type parameter',
          message: 'Type must be one of: STRING, NUMBER, BOOLEAN, JSON, TEXT',
        });
      }
      
      const settings = await SettingsService.getSettingsByType(type as 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON' | 'TEXT');
      
      res.status(200).json({
        success: true,
        data: settings,
        message: 'Settings by type retrieved successfully',
      });
    } catch (error) {
      logger.error('Error in getSettingsByType:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve settings by type',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // New methods for enhanced settings management

  // Get settings grouped by category
  static async getSettings(req: Request, res: Response) {
    try {
      const { category } = req.query;
      const settings = await SettingsService.getSettings(category as string);
      
      res.status(200).json({
        success: true,
        data: settings,
        message: 'Settings retrieved successfully',
      });
    } catch (error) {
      logger.error('Error in getSettings:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve settings',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get settings for a specific category
  static async getCategorySettings(req: Request, res: Response) {
    try {
      const { category } = req.params;
      const settings = await SettingsService.getCategorySettings(category);
      
      res.status(200).json({
        success: true,
        data: settings,
        message: 'Category settings retrieved successfully',
      });
    } catch (error) {
      logger.error('Error in getCategorySettings:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve category settings',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Update multiple settings in a category
  static async updateCategorySettings(req: Request, res: Response) {
    try {
      const { category } = req.params;
      const { settings } = req.body;
      
      if (!settings || typeof settings !== 'object') {
        return res.status(400).json({
          success: false,
          error: 'Invalid settings data',
          message: 'Settings must be an object',
        });
      }
      
      const results = await SettingsService.updateCategorySettings(category, settings);
      
      res.status(200).json({
        success: true,
        data: results,
        message: 'Category settings updated successfully',
      });
    } catch (error) {
      logger.error('Error in updateCategorySettings:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update category settings',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get settings categories
  static async getCategories(_req: Request, res: Response) {
    try {
      const categories = await SettingsService.getCategories();
      
      res.status(200).json({
        success: true,
        data: categories,
        message: 'Settings categories retrieved successfully',
      });
    } catch (error) {
      logger.error('Error in getCategories:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve settings categories',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get public settings (for frontend use)
  static async getPublicSettings(_req: Request, res: Response) {
    try {
      const settings = await SettingsService.getPublicSettings();
      
      res.status(200).json({
        success: true,
        data: settings,
        message: 'Public settings retrieved successfully',
      });
    } catch (error) {
      logger.error('Error in getPublicSettings:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve public settings',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
