import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface NotificationQueryOptions {
  userId: string;
  page: number;
  limit: number;
  isRead?: boolean;
}

interface CreateNotificationData {
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'SYSTEM';
}

export class NotificationService {
  // Get user notifications
  static async getUserNotifications(options: NotificationQueryOptions) {
    try {
      const { userId, page, limit, isRead } = options;
      const skip = (page - 1) * limit;

      const where: Record<string, unknown> = { userId };
      
      if (isRead !== undefined) {
        where['isRead'] = isRead;
      }

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            createdAt: 'desc'
          }
        }),
        prisma.notification.count({ where })
      ]);

      return {
        notifications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      // Log error for debugging
      throw new Error('Failed to get user notifications');
    }
  }

  // Get notification by ID
  static async getNotificationById(id: string, userId: string) {
    try {
      const notification = await prisma.notification.findFirst({
        where: {
          id,
          userId
        }
      });

      return notification;
    } catch (error) {
      // Log error for debugging
      throw new Error('Failed to get notification');
    }
  }

  // Mark notification as read
  static async markAsRead(id: string, userId: string) {
    try {
      const notification = await prisma.notification.updateMany({
        where: {
          id,
          userId
        },
        data: {
          isRead: true
        }
      });

      if (notification.count === 0) {
        return null;
      }

      return await this.getNotificationById(id, userId);
    } catch (error) {
      // Log error for debugging
      throw new Error('Failed to mark notification as read');
    }
  }

  // Mark all notifications as read
  static async markAllAsRead(userId: string) {
    try {
      const result = await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false
        },
        data: {
          isRead: true
        }
      });

      return result.count;
    } catch (error) {
      // Log error for debugging
      throw new Error('Failed to mark all notifications as read');
    }
  }

  // Delete notification
  static async deleteNotification(id: string, userId: string) {
    try {
      const notification = await prisma.notification.deleteMany({
        where: {
          id,
          userId
        }
      });

      return notification.count > 0;
    } catch (error) {
      // Log error for debugging
      throw new Error('Failed to delete notification');
    }
  }

  // Get notification statistics
  static async getNotificationStats(userId: string) {
    try {
      const [
        totalNotifications,
        unreadNotifications,
        notificationsByType
      ] = await Promise.all([
        prisma.notification.count({
          where: { userId }
        }),
        prisma.notification.count({
          where: {
            userId,
            isRead: false
          }
        }),
        prisma.notification.groupBy({
          by: ['type'],
          where: { userId },
          _count: {
            type: true
          }
        })
      ]);

      const notificationsByTypeMap: Record<string, number> = {};
      notificationsByType.forEach(item => {
        notificationsByTypeMap[item.type] = item._count.type;
      });

      return {
        totalNotifications,
        unreadNotifications,
        readNotifications: totalNotifications - unreadNotifications,
        notificationsByType: notificationsByTypeMap
      };
    } catch (error) {
      // Log error for debugging
      throw new Error('Failed to get notification statistics');
    }
  }

  // Create notification
  static async createNotification(data: CreateNotificationData) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: data.userId,
          title: data.title,
          message: data.message,
          type: data.type
        }
      });

      return notification;
    } catch (error) {
      // Log error for debugging
      throw new Error('Failed to create notification');
    }
  }
}
