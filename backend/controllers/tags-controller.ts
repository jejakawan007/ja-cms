import { Request, Response } from 'express';
import { TagsService } from '../services/tags-service';

export class TagsController {
  // Get all tags
  static async getAllTags(req: Request, res: Response) {
    try {
      const { search, limit = 50 } = req.query;
      const tags = await TagsService.getAllTags({
        search: search as string,
        limit: Number(limit)
      });
      
      res.status(200).json({
        success: true,
        data: tags,
        message: 'Tags retrieved successfully',
      });
    } catch (error) {
      // Log error for debugging
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve tags',
        message: errorMessage,
      });
    }
  }

  // Get tag by ID
  static async getTagById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tag = await TagsService.getTagById(id);
      
      if (!tag) {
        return res.status(404).json({
          success: false,
          error: 'Tag not found',
          message: 'Tag with the specified ID was not found',
        });
      }
      
      return res.status(200).json({
        success: true,
        data: tag,
        message: 'Tag retrieved successfully',
      });
    } catch (error) {
      // Log error for debugging
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve tag',
        message: errorMessage,
      });
    }
  }

  // Create tag
  static async createTag(req: Request, res: Response) {
    try {
      const { name, slug, color, description } = req.body;
      const tag = await TagsService.createTag({
        name,
        slug,
        color,
        description
      });
      
      res.status(201).json({
        success: true,
        data: tag,
        message: 'Tag created successfully',
      });
    } catch (error) {
      // Log error for debugging
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        error: 'Failed to create tag',
        message: errorMessage,
      });
    }
  }

  // Update tag
  static async updateTag(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const tag = await TagsService.updateTag(id, updateData);
      
      if (!tag) {
        return res.status(404).json({
          success: false,
          error: 'Tag not found',
          message: 'Tag with the specified ID was not found',
        });
      }
      
      return res.status(200).json({
        success: true,
        data: tag,
        message: 'Tag updated successfully',
      });
    } catch (error) {
      // Log error for debugging
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({
        success: false,
        error: 'Failed to update tag',
        message: errorMessage,
      });
    }
  }

  // Delete tag
  static async deleteTag(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await TagsService.deleteTag(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Tag not found',
          message: 'Tag with the specified ID was not found',
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Tag deleted successfully',
      });
    } catch (error) {
      // Log error for debugging
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({
        success: false,
        error: 'Failed to delete tag',
        message: errorMessage,
      });
    }
  }

  // Get tag statistics
  static async getTagStats(_req: Request, res: Response) {
    try {
      const stats = await TagsService.getTagStats();
      
      return res.status(200).json({
        success: true,
        data: stats,
        message: 'Tag statistics retrieved successfully',
      });
    } catch (error) {
      // Log error for debugging
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve tag statistics',
        message: errorMessage,
      });
    }
  }
}
