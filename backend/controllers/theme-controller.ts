import { Request, Response } from 'express';
import { ThemeService } from '../services/theme-service';
import { logger } from '../utils/logger';

export class ThemeController {
  // Get all themes
  static async getThemes(_req: Request, res: Response) {
    try {
      const themes = await ThemeService.getAllThemes();
      
      res.status(200).json({
        success: true,
        data: themes,
        message: 'Themes retrieved successfully',
      });
    } catch (error) {
      logger.error('Error in getThemes:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve themes',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get theme by ID
  static async getThemeById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Theme ID is required',
        });
      }

      const theme = await ThemeService.getThemeById(id);
      
      if (!theme) {
        return res.status(404).json({
          success: false,
          error: 'Theme not found',
        });
      }

      res.status(200).json({
        success: true,
        data: theme,
        message: 'Theme retrieved successfully',
      });
    } catch (error) {
      logger.error('Error in getThemeById:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve theme',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get active theme
  static async getActiveTheme(_req: Request, res: Response) {
    try {
      const theme = await ThemeService.getActiveTheme();
      
      if (!theme) {
        return res.status(404).json({
          success: false,
          error: 'No active theme found',
        });
      }

      res.status(200).json({
        success: true,
        data: theme,
        message: 'Active theme retrieved successfully',
      });
    } catch (error) {
      logger.error('Error in getActiveTheme:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve active theme',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get themes by category
  static async getThemesByCategory(req: Request, res: Response) {
    try {
      const { category } = req.params;
      
      if (!category) {
        return res.status(400).json({
          success: false,
          error: 'Category is required',
        });
      }

      const themes = await ThemeService.getThemesByCategory(category);
      
      res.status(200).json({
        success: true,
        data: themes,
        message: `Themes for category '${category}' retrieved successfully`,
      });
    } catch (error) {
      logger.error('Error in getThemesByCategory:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve themes by category',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Create new theme
  static async createTheme(req: Request, res: Response) {
    try {
      const themeData = req.body;
      
      if (!themeData) {
        return res.status(400).json({
          success: false,
          error: 'Theme data is required',
        });
      }

      const theme = await ThemeService.createTheme(themeData);
      
      res.status(201).json({
        success: true,
        data: theme,
        message: 'Theme created successfully',
      });
    } catch (error) {
      logger.error('Error in createTheme:', error);
      
      // Handle validation errors
      if (error instanceof Error && error.message.includes('Validation error')) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          message: error.message,
        });
      }

      // Handle duplicate name error
      if (error instanceof Error && error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          error: 'Theme name already exists',
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to create theme',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Update theme
  static async updateTheme(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const themeData = req.body;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Theme ID is required',
        });
      }

      if (!themeData) {
        return res.status(400).json({
          success: false,
          error: 'Theme data is required',
        });
      }

      const theme = await ThemeService.updateTheme(id, themeData);
      
      res.status(200).json({
        success: true,
        data: theme,
        message: 'Theme updated successfully',
      });
    } catch (error) {
      logger.error('Error in updateTheme:', error);
      
      // Handle validation errors
      if (error instanceof Error && error.message.includes('Validation error')) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          message: error.message,
        });
      }

      // Handle not found error
      if (error instanceof Error && error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: 'Theme not found',
          message: error.message,
        });
      }

      // Handle duplicate name error
      if (error instanceof Error && error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          error: 'Theme name already exists',
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to update theme',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Delete theme
  static async deleteTheme(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Theme ID is required',
        });
      }

      await ThemeService.deleteTheme(id);
      
      res.status(200).json({
        success: true,
        message: 'Theme deleted successfully',
      });
    } catch (error) {
      logger.error('Error in deleteTheme:', error);
      
      // Handle not found error
      if (error instanceof Error && error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: 'Theme not found',
          message: error.message,
        });
      }

      // Handle default theme deletion error
      if (error instanceof Error && error.message.includes('Cannot delete default theme')) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete default theme',
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to delete theme',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Set theme as active
  static async setActiveTheme(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Theme ID is required',
        });
      }

      await ThemeService.setActiveTheme(id);
      
      res.status(200).json({
        success: true,
        message: 'Theme set as active successfully',
      });
    } catch (error) {
      logger.error('Error in setActiveTheme:', error);
      
      // Handle not found error
      if (error instanceof Error && error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: 'Theme not found',
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to set active theme',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get theme statistics
  static async getThemeStats(_req: Request, res: Response) {
    try {
      const stats = await ThemeService.getThemeStats();
      
      res.status(200).json({
        success: true,
        data: stats,
        message: 'Theme statistics retrieved successfully',
      });
    } catch (error) {
      logger.error('Error in getThemeStats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve theme statistics',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Validate theme data
  static async validateTheme(req: Request, res: Response) {
    try {
      const themeData = req.body;
      
      if (!themeData) {
        return res.status(400).json({
          success: false,
          error: 'Theme data is required',
        });
      }

      const validation = ThemeService.validateThemeData(themeData);
      
      res.status(200).json({
        success: true,
        data: validation,
        message: validation.isValid ? 'Theme data is valid' : 'Theme data validation failed',
      });
    } catch (error) {
      logger.error('Error in validateTheme:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to validate theme data',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Export theme
  static async exportTheme(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Theme ID is required',
        });
      }

      const exportData = await ThemeService.exportTheme(id);
      
      res.status(200).json({
        success: true,
        data: exportData,
        message: 'Theme exported successfully',
      });
    } catch (error) {
      logger.error('Error in exportTheme:', error);
      
      // Handle not found error
      if (error instanceof Error && error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: 'Theme not found',
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to export theme',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Import theme
  static async importTheme(req: Request, res: Response) {
    try {
      const importData = req.body;
      
      if (!importData) {
        return res.status(400).json({
          success: false,
          error: 'Import data is required',
        });
      }

      const theme = await ThemeService.importTheme(importData);
      
      res.status(201).json({
        success: true,
        data: theme,
        message: 'Theme imported successfully',
      });
    } catch (error) {
      logger.error('Error in importTheme:', error);
      
      // Handle validation errors
      if (error instanceof Error && error.message.includes('Invalid import data')) {
        return res.status(400).json({
          success: false,
          error: 'Invalid import data format',
          message: error.message,
        });
      }

      // Handle validation errors
      if (error instanceof Error && error.message.includes('Invalid theme data')) {
        return res.status(400).json({
          success: false,
          error: 'Invalid theme data',
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to import theme',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
