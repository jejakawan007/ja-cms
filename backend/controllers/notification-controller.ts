import { Request, Response } from 'express';
import { NotificationService } from '../services/notification-service';
import { logger } from '../utils/logger';

export class NotificationController {
  // Get user notifications
  static async getUserNotifications(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const { page = 1, limit = 20, isRead } = req.query;
      
      const notifications = await NotificationService.getUserNotifications({
        userId,
        page: Number(page),
        limit: Number(limit),
        isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined
      });
      
      return res.status(200).json({
        success: true,
        data: notifications,
        message: 'User notifications retrieved successfully',
      });
    } catch (error) {
      logger.error('Error in getUserNotifications:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve user notifications',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get notification by ID
  static async getNotificationById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      
      const notification = await NotificationService.getNotificationById(id, userId);
      
      if (!notification) {
        return res.status(404).json({
          success: false,
          error: 'Notification not found',
          message: 'Notification with the specified ID was not found',
        });
      }
      
      return res.status(200).json({
        success: true,
        data: notification,
        message: 'Notification retrieved successfully',
      });
    } catch (error) {
      logger.error('Error in getNotificationById:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve notification',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Mark notification as read
  static async markAsRead(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      
      const notification = await NotificationService.markAsRead(id, userId);
      
      if (!notification) {
        return res.status(404).json({
          success: false,
          error: 'Notification not found',
          message: 'Notification with the specified ID was not found',
        });
      }
      
      return res.status(200).json({
        success: true,
        data: notification,
        message: 'Notification marked as read successfully',
      });
    } catch (error) {
      logger.error('Error in markAsRead:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to mark notification as read',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Mark all notifications as read
  static async markAllAsRead(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      
      const result = await NotificationService.markAllAsRead(userId);
      
      return res.status(200).json({
        success: true,
        data: { updatedCount: result },
        message: 'All notifications marked as read successfully',
      });
    } catch (error) {
      logger.error('Error in markAllAsRead:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to mark all notifications as read',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Delete notification
  static async deleteNotification(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      
      const deleted = await NotificationService.deleteNotification(id, userId);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Notification not found',
          message: 'Notification with the specified ID was not found',
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Notification deleted successfully',
      });
    } catch (error) {
      logger.error('Error in deleteNotification:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete notification',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get notification statistics
  static async getNotificationStats(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const stats = await NotificationService.getNotificationStats(userId);
      
      return res.status(200).json({
        success: true,
        data: stats,
        message: 'Notification statistics retrieved successfully',
      });
    } catch (error) {
      logger.error('Error in getNotificationStats:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve notification statistics',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Create notification (admin only)
  static async createNotification(req: Request, res: Response) {
    try {
      const { userId, title, message, type } = req.body;
      
      const notification = await NotificationService.createNotification({
        userId,
        title,
        message,
        type
      });
      
      return res.status(201).json({
        success: true,
        data: notification,
        message: 'Notification created successfully',
      });
    } catch (error) {
      logger.error('Error in createNotification:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create notification',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
