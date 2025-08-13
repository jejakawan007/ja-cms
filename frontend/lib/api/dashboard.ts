/**
 * Dashboard API Service
 * Service untuk dashboard data dengan enterprise types
 */

import { apiClient, ApiResponse } from './client';
import { DashboardStats, ActivityItem, ChartDataPoint } from '@/types';

export const dashboardApi = {
  // Dashboard Overview & Statistics
  async getOverview(): Promise<ApiResponse<any>> {
    return apiClient.get('/dashboard/overview');
  },

  async getStats(): Promise<ApiResponse<DashboardStats>> {
    return apiClient.get<DashboardStats>('/dashboard/stats');
  },

  async getRecentActivity(limit?: number): Promise<ApiResponse<ActivityItem[]>> {
    return apiClient.get<ActivityItem[]>('/dashboard/activity', { limit });
  },

  // Widget Management
  async getWidgets(): Promise<ApiResponse<any[]>> {
    return apiClient.get('/dashboard/widgets');
  },

  async getWidget(id: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/dashboard/widgets/${id}`);
  },

  async enableWidget(id: string): Promise<ApiResponse<void>> {
    return apiClient.post(`/dashboard/widgets/${id}/enable`);
  },

  async disableWidget(id: string): Promise<ApiResponse<void>> {
    return apiClient.post(`/dashboard/widgets/${id}/disable`);
  },

  async updateWidgetConfig(id: string, config: any): Promise<ApiResponse<void>> {
    return apiClient.put(`/dashboard/widgets/${id}/config`, config);
  },

  // User Dashboard Preferences
  async getUserPreferences(): Promise<ApiResponse<any>> {
    return apiClient.get('/dashboard/preferences');
  },

  async updateUserPreferences(preferences: any): Promise<ApiResponse<void>> {
    return apiClient.put('/dashboard/preferences', preferences);
  },

  async resetUserPreferences(): Promise<ApiResponse<void>> {
    return apiClient.post('/dashboard/preferences/reset');
  },

  // Layout Management
  async getLayout(): Promise<ApiResponse<any>> {
    return apiClient.get('/dashboard/layout');
  },

  async updateLayout(layout: any): Promise<ApiResponse<void>> {
    return apiClient.put('/dashboard/layout', layout);
  },

  async resetLayout(): Promise<ApiResponse<void>> {
    return apiClient.post('/dashboard/layout/reset');
  },

  // Quick Actions
  async getQuickActions(): Promise<ApiResponse<any[]>> {
    return apiClient.get('/dashboard/quick-actions');
  },

  async executeQuickAction(id: string): Promise<ApiResponse<any>> {
    return apiClient.post(`/dashboard/quick-actions/${id}/execute`);
  },

  // Notifications
  async getNotifications(limit?: number, page?: number): Promise<ApiResponse<any>> {
    return apiClient.get('/dashboard/notifications', { limit, page });
  },

  async getUnreadNotifications(): Promise<ApiResponse<any[]>> {
    return apiClient.get('/dashboard/notifications/unread');
  },

  async markNotificationRead(id: string): Promise<ApiResponse<void>> {
    return apiClient.post(`/dashboard/notifications/${id}/read`);
  },

  async markAllNotificationsRead(): Promise<ApiResponse<void>> {
    return apiClient.post('/dashboard/notifications/read-all');
  },

  // System Health
  async getSystemHealth(): Promise<ApiResponse<any>> {
    return apiClient.get('/dashboard/system-health');
  },

  async getSystemMetrics(): Promise<ApiResponse<any[]>> {
    return apiClient.get('/dashboard/system-metrics');
  },

  // Security Status
  async getSecurityStatus(): Promise<ApiResponse<any>> {
    return apiClient.get('/dashboard/security-status');
  },

  async getSecurityAlerts(): Promise<ApiResponse<any[]>> {
    return apiClient.get('/dashboard/security-alerts');
  },

  // Analytics Data
  async getChartData(type: string, timeRange: string, metric: string): Promise<ApiResponse<any>> {
    return apiClient.get('/dashboard/analytics/chart-data', { type, timeRange, metric });
  },

  async getRealTimeAnalytics(): Promise<ApiResponse<any>> {
    return apiClient.get('/dashboard/analytics/real-time');
  },

  async getTrafficSources(): Promise<ApiResponse<any[]>> {
    return apiClient.get('/dashboard/analytics/traffic-sources');
  },

  async getContentPerformance(): Promise<ApiResponse<any[]>> {
    return apiClient.get('/dashboard/analytics/content-performance');
  },

  // Activity Logs
  async getActivities(limit?: number, page?: number): Promise<ApiResponse<any>> {
    return apiClient.get('/dashboard/activities', { limit, page });
  },

  async logActivity(activity: any): Promise<ApiResponse<void>> {
    return apiClient.post('/dashboard/activities', activity);
  },

  // Chart Data Cache
  async getChartCache(type: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/dashboard/chart-cache/${type}`);
  },

  async updateChartCache(type: string, data: any): Promise<ApiResponse<void>> {
    return apiClient.post(`/dashboard/chart-cache/${type}`, data);
  },

  // Legacy analytics endpoint
  async getAnalytics(params?: {
    startDate?: string;
    endDate?: string;
    period?: 'day' | 'week' | 'month' | 'year';
  }): Promise<ApiResponse<{
    pageViews: ChartDataPoint[];
    uniqueVisitors: ChartDataPoint[];
    topPages: Array<{ page: string; views: number }>;
    referrers: Array<{ source: string; visits: number }>;
  }>> {
    return apiClient.get('/dashboard/analytics', params);
  }
};
