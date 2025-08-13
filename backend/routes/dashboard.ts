import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard-controller';
import { authenticateToken } from '../middleware/auth-middleware';

const router = Router();

// Apply authentication middleware to all dashboard routes
router.use(authenticateToken);

// Dashboard Overview
router.get('/overview', DashboardController.getOverview);

// Basic Stats
router.get('/stats', DashboardController.getStats);

// Recent Activity
router.get('/activity', DashboardController.getRecentActivity);

// Notifications
router.get('/notifications', DashboardController.getNotifications);
router.get('/notifications/unread', DashboardController.getUnreadNotifications);
router.put('/notifications/:notificationId/read', DashboardController.markNotificationRead);
router.put('/notifications/read-all', DashboardController.markAllNotificationsRead);

// System Health
router.get('/system/health', DashboardController.getSystemHealth);
router.get('/system-health', DashboardController.getSystemHealth); // Alias for frontend compatibility
router.get('/system/metrics', DashboardController.getSystemMetrics);

// Security
router.get('/security/status', DashboardController.getSecurityStatus);
router.get('/security-status', DashboardController.getSecurityStatus); // Alias for frontend compatibility
router.get('/security/alerts', DashboardController.getSecurityAlerts);

// Analytics
router.get('/analytics/chart', DashboardController.getChartData);
router.get('/analytics/realtime', DashboardController.getRealTimeAnalytics);
router.get('/analytics/traffic-sources', DashboardController.getTrafficSources);
router.get('/analytics/content-performance', DashboardController.getContentPerformance);

// Activities
router.get('/activities', DashboardController.getActivities);
router.post('/activities', DashboardController.logActivity);

// Widgets
router.get('/widgets', DashboardController.getWidgets);
router.get('/widgets/:id', DashboardController.getWidget);
router.post('/widgets/:id/enable', DashboardController.enableWidget);
router.post('/widgets/:id/disable', DashboardController.disableWidget);
router.put('/widgets/:id/config', DashboardController.updateWidgetConfig);

// Quick Actions
router.get('/quick-actions', DashboardController.getQuickActions);
router.post('/quick-actions/:id/execute', DashboardController.executeQuickAction);

// User Preferences
router.get('/preferences', DashboardController.getUserPreferences);
router.put('/preferences', DashboardController.updateUserPreferences);
router.post('/preferences/reset', DashboardController.resetUserPreferences);

// Layout Management
router.get('/layout', DashboardController.getLayout);
router.put('/layout', DashboardController.updateLayout);
router.post('/layout/reset', DashboardController.resetLayout);

export default router;
