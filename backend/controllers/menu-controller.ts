import { Request, Response } from 'express';
import { MenuService } from '../services/menu-service';
// MenuLocation is a string type in schema

export class MenuController {
  // Get all menus
  static async getAllMenus(req: Request, res: Response) {
    try {
      const { location } = req.query;
      const menus = await MenuService.getAllMenus(location as string);
      
      res.status(200).json({
        success: true,
        data: menus,
        message: 'Menus retrieved successfully',
      });
    } catch (error) {
      // Log error for debugging
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve menus',
        message: errorMessage,
      });
    }
  }

  // Get menu by ID
  static async getMenuById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const menu = await MenuService.getMenuById(id);
      
      if (!menu) {
        return res.status(404).json({
          success: false,
          error: 'Menu not found',
          message: 'Menu with the specified ID was not found',
        });
      }
      
      return res.status(200).json({
        success: true,
        data: menu,
        message: 'Menu retrieved successfully',
      });
    } catch (error) {
      // Log error for debugging
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve menu',
        message: errorMessage,
      });
    }
  }

  // Create menu
  static async createMenu(req: Request, res: Response) {
    try {
      const { name, location, items } = req.body;
      const menu = await MenuService.createMenu({ name, location, items });
      
      res.status(201).json({
        success: true,
        data: menu,
        message: 'Menu created successfully',
      });
    } catch (error) {
      // Log error for debugging
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        error: 'Failed to create menu',
        message: errorMessage,
      });
    }
  }

  // Update menu
  static async updateMenu(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const menu = await MenuService.updateMenu(id, updateData);
      
      if (!menu) {
        return res.status(404).json({
          success: false,
          error: 'Menu not found',
          message: 'Menu with the specified ID was not found',
        });
      }
      
      return res.status(200).json({
        success: true,
        data: menu,
        message: 'Menu updated successfully',
      });
    } catch (error) {
      // Log error for debugging
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({
        success: false,
        error: 'Failed to update menu',
        message: errorMessage,
      });
    }
  }

  // Delete menu
  static async deleteMenu(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await MenuService.deleteMenu(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Menu not found',
          message: 'Menu with the specified ID was not found',
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Menu deleted successfully',
      });
    } catch (error) {
      // Log error for debugging
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({
        success: false,
        error: 'Failed to delete menu',
        message: errorMessage,
      });
    }
  }

  // Get menu by location
  static async getMenuByLocation(req: Request, res: Response) {
    try {
      const { location } = req.params;
      const menu = await MenuService.getMenuByLocation(location as string);
      
      res.status(200).json({
        success: true,
        data: menu,
        message: 'Menu by location retrieved successfully',
      });
    } catch (error) {
      // Log error for debugging
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve menu by location',
        message: errorMessage,
      });
    }
  }
}
