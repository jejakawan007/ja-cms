import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard-service';

export class DashboardController {
  // Get dashboard overview
  static async getOverview(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      const overview = await DashboardService.getOverview(userId);
      res.json({ success: true, data: overview });
    } catch (error) {
      console.error('Error getting dashboard overview:', error);
      res.status(500).json({ success: false, message: 'Failed to get dashboard overview' });
    }
  }

  // Get basic stats
  static async getStats(_req: Request, res: Response) {
    try {
      const stats = await DashboardService.getStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      console.error('Error getting stats:', error);
      res.status(500).json({ success: false, message: 'Failed to get stats' });
    }
  }

  // Get recent activity
  static async getRecentActivity(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query['limit'] as string) || 10;
      const activity = await DashboardService.getRecentActivity(limit);
      res.json({ success: true, data: activity });
    } catch (error) {
      console.error('Error getting recent activity:', error);
      res.status(500).json({ success: false, message: 'Failed to get recent activity' });
    }
  }

  // Get notifications
  static async getNotifications(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      const limit = parseInt(req.query['limit'] as string) || 10;
      const page = parseInt(req.query['page'] as string) || 1;
      const notifications = await DashboardService.getNotifications(userId, limit, page);
      res.json({ success: true, data: notifications });
    } catch (error) {
      console.error('Error getting notifications:', error);
      res.status(500).json({ success: false, message: 'Failed to get notifications' });
    }
  }

  // Get unread notifications count
  static async getUnreadNotifications(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      const count = await DashboardService.getUnreadNotifications(userId);
      res.json({ success: true, data: { count } });
    } catch (error) {
      console.error('Error getting unread notifications:', error);
      res.status(500).json({ success: false, message: 'Failed to get unread notifications' });
    }
  }

  // Mark notification as read
  static async markNotificationRead(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      const { notificationId } = req.params;
      const notification = await DashboardService.markNotificationRead(userId, notificationId);
      res.json({ success: true, data: notification });
    } catch (error) {
      console.error('Error marking notification read:', error);
      res.status(500).json({ success: false, message: 'Failed to mark notification as read' });
    }
  }

  // Mark all notifications as read
  static async markAllNotificationsRead(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      const result = await DashboardService.markAllNotificationsRead(userId);
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Error marking all notifications read:', error);
      res.status(500).json({ success: false, message: 'Failed to mark all notifications as read' });
    }
  }

  // Get system health
  static async getSystemHealth(_req: Request, res: Response) {
    try {
      const health = await DashboardService.getSystemHealth();
      res.json({ success: true, data: health });
    } catch (error) {
      console.error('Error getting system health:', error);
      res.status(500).json({ success: false, message: 'Failed to get system health' });
    }
  }

  // Get system metrics
  static async getSystemMetrics(_req: Request, res: Response) {
    try {
      const metrics = await DashboardService.getSystemMetrics();
      res.json({ success: true, data: metrics });
    } catch (error) {
      console.error('Error getting system metrics:', error);
      res.status(500).json({ success: false, message: 'Failed to get system metrics' });
    }
  }

  // Get security status
  static async getSecurityStatus(_req: Request, res: Response) {
    try {
      const status = await DashboardService.getSecurityStatus();
      res.json({ success: true, data: status });
    } catch (error) {
      console.error('Error getting security status:', error);
      res.status(500).json({ success: false, message: 'Failed to get security status' });
    }
  }

  // Get security alerts
  static async getSecurityAlerts(_req: Request, res: Response) {
    try {
      const alerts = await DashboardService.getSecurityAlerts();
      res.json({ success: true, data: alerts });
    } catch (error) {
      console.error('Error getting security alerts:', error);
      res.status(500).json({ success: false, message: 'Failed to get security alerts' });
    }
  }

  // Get chart data
  static async getChartData(req: Request, res: Response) {
    try {
      const { type, timeRange, metric } = req.query;
      const data = await DashboardService.getChartData(
        type as string,
        timeRange as string,
        metric as string
      );
      res.json({ success: true, data });
    } catch (error) {
      console.error('Error getting chart data:', error);
      res.status(500).json({ success: false, message: 'Failed to get chart data' });
    }
  }

  // Get real-time analytics
  static async getRealTimeAnalytics(_req: Request, res: Response) {
    try {
      const analytics = await DashboardService.getRealTimeAnalytics();
      res.json({ success: true, data: analytics });
    } catch (error) {
      console.error('Error getting real-time analytics:', error);
      res.status(500).json({ success: false, message: 'Failed to get real-time analytics' });
    }
  }

  // Get traffic sources
  static async getTrafficSources(_req: Request, res: Response) {
    try {
      const sources = await DashboardService.getTrafficSources();
      res.json({ success: true, data: sources });
    } catch (error) {
      console.error('Error getting traffic sources:', error);
      res.status(500).json({ success: false, message: 'Failed to get traffic sources' });
    }
  }

  // Get content performance
  static async getContentPerformance(_req: Request, res: Response) {
    try {
      const performance = await DashboardService.getContentPerformance();
      res.json({ success: true, data: performance });
    } catch (error) {
      console.error('Error getting content performance:', error);
      res.status(500).json({ success: false, message: 'Failed to get content performance' });
    }
  }

  // Get activities
  static async getActivities(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      const limit = parseInt(req.query['limit'] as string) || 10;
      const page = parseInt(req.query['page'] as string) || 1;
      const activities = await DashboardService.getActivities(userId, limit, page);
      res.json({ success: true, data: activities });
    } catch (error) {
      console.error('Error getting activities:', error);
      res.status(500).json({ success: false, message: 'Failed to get activities' });
    }
  }

  // Log activity
  static async logActivity(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      const activity = req.body;
      const result = await DashboardService.logActivity(userId, activity);
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Error logging activity:', error);
      res.status(500).json({ success: false, message: 'Failed to log activity' });
    }
  }

  // Widget Management
  static async getWidgets(_req: Request, res: Response) {
    try {
      const widgets = await DashboardService.getWidgets();
      res.json({ success: true, data: widgets });
    } catch (error) {
      console.error('Error getting widgets:', error);
      res.status(500).json({ success: false, message: 'Failed to get widgets' });
    }
  }

  static async getWidget(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const widget = await DashboardService.getWidget(id);
      res.json({ success: true, data: widget });
    } catch (error) {
      console.error('Error getting widget:', error);
      res.status(500).json({ success: false, message: 'Failed to get widget' });
    }
  }

  static async enableWidget(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      const { id } = req.params;
      await DashboardService.enableWidget(userId, id);
      res.json({ success: true, message: 'Widget enabled successfully' });
    } catch (error) {
      console.error('Error enabling widget:', error);
      res.status(500).json({ success: false, message: 'Failed to enable widget' });
    }
  }

  static async disableWidget(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      const { id } = req.params;
      await DashboardService.disableWidget(userId, id);
      res.json({ success: true, message: 'Widget disabled successfully' });
    } catch (error) {
      console.error('Error disabling widget:', error);
      res.status(500).json({ success: false, message: 'Failed to disable widget' });
    }
  }

  static async updateWidgetConfig(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      const { id } = req.params;
      const config = req.body;
      await DashboardService.updateWidgetConfig(userId, id, config);
      res.json({ success: true, message: 'Widget config updated successfully' });
    } catch (error) {
      console.error('Error updating widget config:', error);
      res.status(500).json({ success: false, message: 'Failed to update widget config' });
    }
  }

  // Quick Actions
  static async getQuickActions(_req: Request, res: Response) {
    try {
      const actions = await DashboardService.getQuickActions();
      res.json({ success: true, data: actions });
    } catch (error) {
      console.error('Error getting quick actions:', error);
      res.status(500).json({ success: false, message: 'Failed to get quick actions' });
    }
  }

  static async executeQuickAction(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      const { id } = req.params;
      const result = await DashboardService.executeQuickAction(userId, id);
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Error executing quick action:', error);
      res.status(500).json({ success: false, message: 'Failed to execute quick action' });
    }
  }

  // User Preferences
  static async getUserPreferences(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      const preferences = await DashboardService.getUserPreferences(userId);
      res.json({ success: true, data: preferences });
    } catch (error) {
      console.error('Error getting user preferences:', error);
      res.status(500).json({ success: false, message: 'Failed to get user preferences' });
    }
  }

  static async updateUserPreferences(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      const preferences = req.body;
      await DashboardService.updateUserPreferences(userId, preferences);
      res.json({ success: true, message: 'Preferences updated successfully' });
    } catch (error) {
      console.error('Error updating user preferences:', error);
      res.status(500).json({ success: false, message: 'Failed to update user preferences' });
    }
  }

  static async resetUserPreferences(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      await DashboardService.resetUserPreferences(userId);
      res.json({ success: true, message: 'Preferences reset successfully' });
    } catch (error) {
      console.error('Error resetting user preferences:', error);
      res.status(500).json({ success: false, message: 'Failed to reset user preferences' });
    }
  }

  // Layout Management
  static async getLayout(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      const layout = await DashboardService.getLayout(userId);
      res.json({ success: true, data: layout });
    } catch (error) {
      console.error('Error getting layout:', error);
      res.status(500).json({ success: false, message: 'Failed to get layout' });
    }
  }

  static async updateLayout(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      const layout = req.body;
      await DashboardService.updateLayout(userId, layout);
      res.json({ success: true, message: 'Layout updated successfully' });
    } catch (error) {
      console.error('Error updating layout:', error);
      res.status(500).json({ success: false, message: 'Failed to update layout' });
    }
  }

  static async resetLayout(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      await DashboardService.resetLayout(userId);
      res.json({ success: true, message: 'Layout reset successfully' });
    } catch (error) {
      console.error('Error resetting layout:', error);
      res.status(500).json({ success: false, message: 'Failed to reset layout' });
    }
  }
}
